const Business = require("../models/Business");
const User = require("../models/User");
const Review = require("../models/Review");
const Category = require("../models/Category");
const Settings = require("../models/Settings");

exports.getOnboardingStatus = async (req, res) => {
  try {
    const vendorId = req.user.userId;
    const firstBusiness = await Business.findOne({ vendor: vendorId })
      .sort({ createdAt: 1 })
      .select("name status isActive");

    if (!firstBusiness) {
      return res.status(200).json({
        success: true,
        data: {
          hasBusiness: false,
          firstBusinessStatus: null,
          businessName: null,
        },
      });
    }

    res.status(200).json({
      success: true,
      data: {
        hasBusiness: true,
        firstBusinessStatus: firstBusiness.status,
        firstBusinessActive: firstBusiness.isActive,
        businessName: firstBusiness.name,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error fetching onboarding status",
    });
  }
};

exports.getDashboard = async (req, res) => {
  try {
    const vendorId = req.user.userId;

    const [totalBusinesses, activeBusinesses, pendingBusinesses, approvedBusinesses, rejectedBusinesses, recentBusinesses] =
      await Promise.all([
        Business.countDocuments({ vendor: vendorId }),
        Business.countDocuments({ vendor: vendorId, isActive: true, status: "approved" }),
        Business.countDocuments({ vendor: vendorId, status: "pending" }),
        Business.countDocuments({ vendor: vendorId, status: "approved" }),
        Business.countDocuments({ vendor: vendorId, status: "rejected" }),
        Business.find({ vendor: vendorId })
          .sort({ createdAt: -1 })
          .limit(5)
          .populate("categoryId", "name image")
          .populate("serviceIds", "name")
          .select("name category categoryId serviceIds city status isActive createdAt"),
      ]);

    const vendorBusinessIds = await Business.find({ vendor: vendorId }).distinct("_id");

    const [reviewAgg, breakdownRaw, recentReviews] = await Promise.all([
      Review.aggregate([
        { $match: { business: { $in: vendorBusinessIds }, isVisible: true } },
        { $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } },
      ]),
      Review.aggregate([
        { $match: { business: { $in: vendorBusinessIds }, isVisible: true } },
        { $group: { _id: "$rating", count: { $sum: 1 } } },
      ]),
      Review.find({ business: { $in: vendorBusinessIds }, isVisible: true })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("user", "fullName")
        .populate("business", "name"),
    ]);

    const ratingBreakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    breakdownRaw.forEach((b) => { ratingBreakdown[b._id] = b.count; });

    const reviewStats = {
      averageRating: reviewAgg.length > 0 ? Math.round(reviewAgg[0].avg * 10) / 10 : 0,
      totalReviews: reviewAgg.length > 0 ? reviewAgg[0].count : 0,
      ratingBreakdown,
    };

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalBusinesses,
          activeBusinesses,
          pendingBusinesses,
          approvedBusinesses,
          rejectedBusinesses,
        },
        reviewStats,
        recentBusinesses,
        recentReviews,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error fetching vendor dashboard",
    });
  }
};

exports.getMyBusinesses = async (req, res) => {
  try {
    const vendorId = req.user.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const search = req.query.search || "";
    const status = req.query.status || "";

    const query = { vendor: vendorId };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { city: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
      ];
    }
    if (status) {
      query.status = status;
    }

    const [businesses, total] = await Promise.all([
      Business.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("categoryId", "name image")
        .populate("serviceIds", "name")
        .select("name description category categoryId serviceIds phone address city status isActive createdAt"),
      Business.countDocuments(query),
    ]);

    const businessIds = businesses.map((b) => b._id);
    const ratings = await Review.aggregate([
      { $match: { business: { $in: businessIds }, isVisible: true } },
      { $group: { _id: "$business", avg: { $avg: "$rating" }, count: { $sum: 1 } } },
    ]);
    const ratingMap = {};
    ratings.forEach((r) => { ratingMap[r._id.toString()] = { averageRating: Math.round(r.avg * 10) / 10, reviewCount: r.count }; });

    const businessesWithRatings = businesses.map((b) => {
      const obj = b.toObject();
      obj.ratingSummary = ratingMap[b._id.toString()] || { averageRating: 0, reviewCount: 0 };
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
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error fetching businesses",
    });
  }
};

exports.getBusinessById = async (req, res) => {
  try {
    const vendorId = req.user.userId;
    const { id } = req.params;

    const business = await Business.findById(id)
      .select("+googleBusinessProfileLink +gstNumber +fraudReport");

    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Business not found",
      });
    }

    if (business.vendor.toString() !== vendorId) {
      return res.status(403).json({
        success: false,
        message: "You can only view your own businesses",
      });
    }

    res.status(200).json({
      success: true,
      data: { business },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error fetching business",
    });
  }
};

exports.createBusiness = async (req, res) => {
  try {
    const vendorId = req.user.userId;
    const data = req.body;

    if (!data.name || !data.name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Business name is required",
      });
    }

    const businessData = {
      vendor: vendorId,
      name: data.name.trim(),
      status: "pending",

      // Section 1
      description: data.description || "",
      establishedYear: data.establishedYear || null,
      workingHours: data.workingHours || "",

      // Section 2
      contactName: data.contactName || "",
      phone: data.phone || "",
      whatsapp: data.whatsapp || "",
      contactEmail: data.contactEmail || "",
      website: data.website || "",

      // Section 3
      category: data.category || "",
      categoryId: data.categoryId || null,
      serviceIds: data.serviceIds || [],
      tags: data.tags || [],
      address: data.address || "",
      city: data.city || "",
      gpsCoordinates: data.gpsCoordinates || { lat: null, lng: null },
      googleBusinessProfileLink: data.googleBusinessProfileLink || "",

      // Section 4
      gstAvailable: data.gstAvailable || false,
      gstNumber: data.gstNumber || "",

      // Section 5
      orderLimits: data.orderLimits || "no_limit",

      // Section 6
      serviceType: data.serviceType || "print_only",

      // Section 7
      customerType: data.customerType || "both",

      // Section 8
      orderingMethod: data.orderingMethod || "both",

      // Section 9
      paymentModes: data.paymentModes || [],

      // Section 10
      socialMedia: data.socialMedia || {},

      // Section 11
      verificationMedia: data.verificationMedia || {},

      // Section 12
      languages: data.languages || [],

      // Section 13
      returnReplacementPolicy: data.returnReplacementPolicy || "",
      inHouseDesignerAvailable: data.inHouseDesignerAvailable || false,
      customerLocationVisitAvailable: data.customerLocationVisitAvailable || false,
      addonServices: data.addonServices || [],

      // Section 14
      sampleDisplayAvailable: data.sampleDisplayAvailable || false,
      preferredFileFormats: data.preferredFileFormats || [],

      // Section 15
      acceptsPurchaseOrder: data.acceptsPurchaseOrder || false,

      // Section 16
      fraudReport: data.fraudReport || {},
    };

    const business = await Business.create(businessData);

    res.status(201).json({
      success: true,
      message: "Business created successfully. Pending admin approval.",
      data: { business },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error creating business",
    });
  }
};

exports.updateBusiness = async (req, res) => {
  try {
    const vendorId = req.user.userId;
    const { id } = req.params;

    const business = await Business.findById(id);
    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Business not found",
      });
    }

    if (business.vendor.toString() !== vendorId) {
      return res.status(403).json({
        success: false,
        message: "You can only edit your own businesses",
      });
    }

    const data = req.body;

    if (business.status === "rejected") {
      business.status = "pending";
    }

    // Section 1
    if (data.name !== undefined) business.name = data.name.trim();
    if (data.description !== undefined) business.description = data.description;
    if (data.establishedYear !== undefined) business.establishedYear = data.establishedYear;
    if (data.workingHours !== undefined) business.workingHours = data.workingHours;

    // Section 2
    if (data.contactName !== undefined) business.contactName = data.contactName;
    if (data.phone !== undefined) business.phone = data.phone;
    if (data.whatsapp !== undefined) business.whatsapp = data.whatsapp;
    if (data.contactEmail !== undefined) business.contactEmail = data.contactEmail;
    if (data.website !== undefined) business.website = data.website;

    // Section 3
    if (data.category !== undefined) business.category = data.category;
    if (data.categoryId !== undefined) business.categoryId = data.categoryId;
    if (data.serviceIds !== undefined) business.serviceIds = data.serviceIds;
    if (data.tags !== undefined) business.tags = data.tags;
    if (data.address !== undefined) business.address = data.address;
    if (data.city !== undefined) business.city = data.city;
    if (data.gpsCoordinates !== undefined) business.gpsCoordinates = data.gpsCoordinates;
    if (data.googleBusinessProfileLink !== undefined) business.googleBusinessProfileLink = data.googleBusinessProfileLink;

    // Section 4
    if (data.gstAvailable !== undefined) business.gstAvailable = data.gstAvailable;
    if (data.gstNumber !== undefined) business.gstNumber = data.gstNumber;

    // Section 5
    if (data.orderLimits !== undefined) business.orderLimits = data.orderLimits;

    // Section 6
    if (data.serviceType !== undefined) business.serviceType = data.serviceType;

    // Section 7
    if (data.customerType !== undefined) business.customerType = data.customerType;

    // Section 8
    if (data.orderingMethod !== undefined) business.orderingMethod = data.orderingMethod;

    // Section 9
    if (data.paymentModes !== undefined) business.paymentModes = data.paymentModes;

    // Section 10
    if (data.socialMedia !== undefined) business.socialMedia = data.socialMedia;

    // Section 11
    if (data.verificationMedia !== undefined) business.verificationMedia = data.verificationMedia;

    // Section 12
    if (data.languages !== undefined) business.languages = data.languages;

    // Section 13
    if (data.returnReplacementPolicy !== undefined) business.returnReplacementPolicy = data.returnReplacementPolicy;
    if (data.inHouseDesignerAvailable !== undefined) business.inHouseDesignerAvailable = data.inHouseDesignerAvailable;
    if (data.customerLocationVisitAvailable !== undefined) business.customerLocationVisitAvailable = data.customerLocationVisitAvailable;
    if (data.addonServices !== undefined) business.addonServices = data.addonServices;

    // Section 14
    if (data.sampleDisplayAvailable !== undefined) business.sampleDisplayAvailable = data.sampleDisplayAvailable;
    if (data.preferredFileFormats !== undefined) business.preferredFileFormats = data.preferredFileFormats;

    // Section 15
    if (data.acceptsPurchaseOrder !== undefined) business.acceptsPurchaseOrder = data.acceptsPurchaseOrder;

    // Section 16
    if (data.fraudReport !== undefined) business.fraudReport = data.fraudReport;

    await business.save();

    res.status(200).json({
      success: true,
      message: "Business updated successfully",
      data: { business },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error updating business",
    });
  }
};

exports.deleteBusiness = async (req, res) => {
  try {
    const vendorId = req.user.userId;
    const { id } = req.params;

    const business = await Business.findById(id);
    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Business not found",
      });
    }

    if (business.vendor.toString() !== vendorId) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own businesses",
      });
    }

    await Business.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Business deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error deleting business",
    });
  }
};

exports.toggleBusinessStatus = async (req, res) => {
  try {
    const vendorId = req.user.userId;
    const { id } = req.params;

    const business = await Business.findById(id);
    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Business not found",
      });
    }

    if (business.vendor.toString() !== vendorId) {
      return res.status(403).json({
        success: false,
        message: "You can only modify your own businesses",
      });
    }

    business.isActive = !business.isActive;
    await business.save();

    res.status(200).json({
      success: true,
      message: `Business ${business.isActive ? "activated" : "deactivated"}`,
      data: { business },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error toggling business status",
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
      "vendor_subscription_fee",
      "vendor_subscription_duration_days",
      "vendor_trial_period_days",
      "vendor_package_benefits",
    ];
    const settings = await Settings.find({ key: { $in: keys } });
    const map = {};
    settings.forEach((s) => { map[s.key] = s.value; });

    res.status(200).json({
      success: true,
      data: {
        fee: map.vendor_subscription_fee ?? 0,
        durationDays: map.vendor_subscription_duration_days ?? 30,
        trialDays: map.vendor_trial_period_days ?? 0,
        benefits: Array.isArray(map.vendor_package_benefits) ? map.vendor_package_benefits : [],
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error fetching vendor package",
    });
  }
};
