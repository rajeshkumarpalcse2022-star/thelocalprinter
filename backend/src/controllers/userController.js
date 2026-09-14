const Business = require("../models/Business");
const User = require("../models/User");
const Wishlist = require("../models/Wishlist");
const Category = require("../models/Category");
const Review = require("../models/Review");
const Settings = require("../models/Settings");

exports.getDashboard = async (req, res) => {
  try {
    const userId = req.user.userId;

    const [totalBusinesses, wishlistCount, categories] = await Promise.all([
      Business.countDocuments({ status: "approved", isActive: true }),
      Wishlist.countDocuments({ user: userId }),
      Business.distinct("category", { status: "approved", isActive: true, category: { $ne: "" } }),
    ]);

    const recentBusinesses = await Business.find({ status: "approved", isActive: true })
      .sort({ createdAt: -1 })
      .limit(6)
      .populate("vendor", "publicId")
      .select("name category city description workingHours serviceType tags vendor");

    const popularCategories = categories.slice(0, 8);

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalBusinesses,
          wishlistCount,
          totalCategories: categories.length,
        },
        recentBusinesses,
        popularCategories,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error fetching dashboard",
    });
  }
};

exports.getPublicBusinesses = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;
    const search = req.query.search || "";
    const category = req.query.category || "";
    const categoryId = req.query.categoryId || "";
    const serviceId = req.query.serviceId || "";
    const city = req.query.city || "";
    const serviceType = req.query.serviceType || "";
    const customerType = req.query.customerType || "";
    const orderingMethod = req.query.orderingMethod || "";
    const orderLimits = req.query.orderLimits || "";
    const minRating = parseFloat(req.query.minRating) || 0;
    const lat = parseFloat(req.query.lat) || null;
    const lng = parseFloat(req.query.lng) || null;
    const radius = parseFloat(req.query.radius) || 0;

    const query = { status: "approved", isActive: true };

    if (search) {
      const orConditions = [
        { name: { $regex: search, $options: "i" } },
        { city: { $regex: search, $options: "i" } },
        { address: { $regex: search, $options: "i" } },
      ];
      if (/^VND-/i.test(search)) {
        const vendor = await User.findOne({ publicId: { $regex: search, $options: "i" } }).select("_id");
        if (vendor) orConditions.push({ vendor: vendor._id });
      }
      query.$or = orConditions;
    }
    if (serviceId) {
      query.serviceIds = { $in: [serviceId] };
    } else if (categoryId) {
      query.categoryId = categoryId;
    } else if (category) {
      query.category = { $regex: category, $options: "i" };
    }
    if (city) query.city = { $regex: city, $options: "i" };
    if (serviceType) query.serviceType = serviceType;
    if (customerType) query.customerType = customerType;
    if (orderingMethod) query.orderingMethod = orderingMethod;
    if (orderLimits) query.orderLimits = orderLimits;

    const haversine = (lat1, lon1, lat2, lon2) => {
      const R = 6371;
      const dLat = ((lat2 - lat1) * Math.PI) / 180;
      const dLon = ((lon2 - lon1) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
          Math.cos((lat2 * Math.PI) / 180) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    };

    const useGeo = lat !== null && lng !== null && radius > 0;
    if (useGeo) {
      const latRad = (lat * Math.PI) / 180;
      const deltaLat = radius / 6371;
      const deltaLng = radius / (6371 * Math.cos(latRad));
      query["gpsCoordinates.lat"] = { $gte: lat - deltaLat, $lte: lat + deltaLat };
      query["gpsCoordinates.lng"] = { $gte: lng - deltaLng, $lte: lng + deltaLng };
    }

    let allBusinesses;
    if (minRating > 0) {
      allBusinesses = await Business.find(query)
        .populate("categoryId", "name slug image")
        .populate("serviceIds", "name slug")
        .populate("vendor", "publicId")
        .select(
          "name description category categoryId serviceIds city address serviceType customerType orderingMethod orderLimits tags workingHours languages verificationMedia.thumbnailImages vendor gpsCoordinates"
        );
    } else {
      const [businesses, total] = await Promise.all([
        Business.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .populate("categoryId", "name slug image")
          .populate("serviceIds", "name slug")
          .populate("vendor", "publicId")
          .select(
            "name description category categoryId serviceIds city address serviceType customerType orderingMethod orderLimits tags workingHours languages verificationMedia.thumbnailImages vendor gpsCoordinates"
          ),
        Business.countDocuments(query),
      ]);
      allBusinesses = null;

      const businessIds = businesses.map((b) => b._id);
      const [ratings, wishlists] = await Promise.all([
        Review.aggregate([
          { $match: { business: { $in: businessIds }, isVisible: true } },
          { $group: { _id: "$business", avg: { $avg: "$rating" }, count: { $sum: 1 } } },
        ]),
        req.user?.userId
          ? Wishlist.find({ user: req.user.userId, business: { $in: businessIds } }).select("business")
          : Promise.resolve([]),
      ]);
      const ratingMap = {};
      ratings.forEach((r) => { ratingMap[r._id.toString()] = { averageRating: Math.round(r.avg * 10) / 10, reviewCount: r.count }; });
      const wishlistSet = new Set(wishlists.map((w) => w.business.toString()));

      const businessesWithRatings = businesses.map((b) => {
        const obj = b.toObject();
        obj.ratingSummary = ratingMap[b._id.toString()] || { averageRating: 0, reviewCount: 0 };
        obj.isWishlisted = wishlistSet.has(b._id.toString());
        return obj;
      });

      res.status(200).json({
        success: true,
        data: {
          businesses: businessesWithRatings,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
          },
        },
      });
      return;
    }

    const allIds = allBusinesses.map((b) => b._id);
    const [allRatings, allWishlists] = await Promise.all([
      Review.aggregate([
        { $match: { business: { $in: allIds }, isVisible: true } },
        { $group: { _id: "$business", avg: { $avg: "$rating" }, count: { $sum: 1 } } },
      ]),
      req.user?.userId
        ? Wishlist.find({ user: req.user.userId, business: { $in: allIds } }).select("business")
        : Promise.resolve([]),
    ]);
    const allRatingMap = {};
    allRatings.forEach((r) => { allRatingMap[r._id.toString()] = { averageRating: Math.round(r.avg * 10) / 10, reviewCount: r.count }; });
    const allWishlistSet = new Set(allWishlists.map((w) => w.business.toString()));

    let enriched = allBusinesses.map((b) => {
      const obj = b.toObject();
      obj.ratingSummary = allRatingMap[b._id.toString()] || { averageRating: 0, reviewCount: 0 };
      obj.isWishlisted = allWishlistSet.has(b._id.toString());
      if (useGeo && obj.gpsCoordinates?.lat && obj.gpsCoordinates?.lng) {
        obj.distance = Math.round(haversine(lat, lng, obj.gpsCoordinates.lat, obj.gpsCoordinates.lng) * 10) / 10;
      }
      return obj;
    });

    if (useGeo) {
      enriched = enriched.filter((b) => b.distance !== undefined && b.distance <= radius);
      enriched.sort((a, b) => a.distance - b.distance);
    }

    if (minRating > 0) {
      enriched = enriched.filter((b) => (b.ratingSummary?.averageRating || 0) >= minRating);
    }

    const total = enriched.length;
    const paginated = enriched.slice(skip, skip + limit);

    res.status(200).json({
      success: true,
      data: {
        businesses: paginated,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error fetching businesses",
    });
  }
};

exports.getBusinessById = async (req, res) => {
  try {
    const { id } = req.params;

    const business = await Business.findOne({ _id: id, status: "approved", isActive: true })
      .populate("categoryId", "name slug image")
      .populate("serviceIds", "name slug")
      .populate("vendor", "publicId fullName")
      .select(
        "-googleBusinessProfileLink -gstNumber -fraudReport"
      );

    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Business not found",
      });
    }

    let isWishlisted = false;
    if (req.user && req.user.userId) {
      const w = await Wishlist.findOne({ user: req.user.userId, business: id });
      isWishlisted = !!w;
    }

    const agg = await Review.aggregate([
      { $match: { business: business._id, isVisible: true } },
      { $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } },
    ]);
    const ratingSummary = agg.length > 0
      ? { averageRating: Math.round(agg[0].avg * 10) / 10, reviewCount: agg[0].count }
      : { averageRating: 0, reviewCount: 0 };

    res.status(200).json({
      success: true,
      data: { business, isWishlisted, ratingSummary },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error fetching business",
    });
  }
};

exports.getFilterOptions = async (req, res) => {
  try {
    const [activeParentCategories, cities] = await Promise.all([
      Category.find({ isActive: true, type: "parent" }).sort({ name: 1 }).select("name slug image"),
      Business.distinct("city", { status: "approved", isActive: true, city: { $ne: "" } }),
    ]);

    const parentIds = activeParentCategories.map((c) => c._id);
    const activeSubcategories = await Category.find({
      isActive: true,
      type: "subcategory",
      parentId: { $in: parentIds },
    })
      .sort({ name: 1 })
      .select("name slug parentId");

    const subMap = {};
    activeSubcategories.forEach((sub) => {
      const pid = sub.parentId.toString();
      if (!subMap[pid]) subMap[pid] = [];
      subMap[pid].push({ id: sub._id, name: sub.name, slug: sub.slug });
    });

    const categories = activeParentCategories.map((c) => ({
      id: c._id,
      name: c.name,
      slug: c.slug,
      image: c.image,
      services: subMap[c._id.toString()] || [],
    }));

    res.status(200).json({
      success: true,
      data: {
        categories,
        cities: cities.sort(),
        serviceTypes: [
          { value: "print_only", label: "Print Only" },
          { value: "full_with_design", label: "Full with Design" },
          { value: "full_without_design", label: "Full without Design" },
        ],
        customerTypes: [
          { value: "b2b", label: "B2B" },
          { value: "b2c", label: "B2C" },
          { value: "both", label: "Both" },
        ],
        orderingMethods: [
          { value: "on_call", label: "On Call" },
          { value: "shop_visit", label: "Shop Visit" },
          { value: "both", label: "Both" },
        ],
        orderLimits: [
          { value: "single", label: "Single" },
          { value: "minimum", label: "Minimum" },
          { value: "bulk", label: "Bulk" },
          { value: "no_limit", label: "No Limit" },
        ],
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error fetching filter options",
    });
  }
};

exports.getWishlist = async (req, res) => {
  try {
    const userId = req.user.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      Wishlist.find({ user: userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate({
          path: "business",
          select: "name category city description serviceType isActive status verificationMedia.thumbnailImages vendor",
          match: { isActive: true },
          populate: { path: "vendor", select: "publicId" },
        }),
      Wishlist.countDocuments({ user: userId }),
    ]);

    const filtered = items.filter((item) => item.business !== null);

    res.status(200).json({
      success: true,
      data: {
        wishlist: filtered,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error fetching wishlist",
    });
  }
};

exports.addToWishlist = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { businessId } = req.body;

    if (!businessId) {
      return res.status(400).json({
        success: false,
        message: "Business ID is required",
      });
    }

    const business = await Business.findOne({ _id: businessId, status: "approved", isActive: true });
    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Business not found or not available",
      });
    }

    const existing = await Wishlist.findOne({ user: userId, business: businessId });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Business already in wishlist",
      });
    }

    const item = await Wishlist.create({ user: userId, business: businessId });

    res.status(201).json({
      success: true,
      message: "Added to wishlist",
      data: { wishlist: item },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Business already in wishlist",
      });
    }
    res.status(500).json({
      success: false,
      message: "Server error adding to wishlist",
    });
  }
};

exports.removeFromWishlist = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { businessId } = req.params;

    const item = await Wishlist.findOneAndDelete({ user: userId, business: businessId });
    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Wishlist item not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Removed from wishlist",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error removing from wishlist",
    });
  }
};

exports.checkWishlist = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { businessId } = req.params;

    const item = await Wishlist.findOne({ user: userId, business: businessId });

    res.status(200).json({
      success: true,
      data: { isWishlisted: !!item },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error checking wishlist",
    });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error fetching profile",
    });
  }
};

exports.getPackage = async (req, res) => {
  try {
    const keys = [
      "user_subscription_fee",
      "user_subscription_duration_days",
      "user_trial_period_days",
      "user_package_benefits",
    ];
    const settings = await Settings.find({ key: { $in: keys } });
    const map = {};
    settings.forEach((s) => { map[s.key] = s.value; });

    res.status(200).json({
      success: true,
      data: {
        fee: map.user_subscription_fee ?? 0,
        durationDays: map.user_subscription_duration_days ?? 30,
        trialDays: map.user_trial_period_days ?? 0,
        benefits: Array.isArray(map.user_package_benefits) ? map.user_package_benefits : [],
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error fetching user package",
    });
  }
};
