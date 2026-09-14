const Coupon = require("../models/Coupon");
const User = require("../models/User");

// ─── Admin: Create Coupon ───

exports.createCoupon = async (req, res) => {
  try {
    const { code, discountPercent, text, type, assignedTo, validFrom, validUntil, status } = req.body;

    if (!code || !discountPercent || !type) {
      return res.status(400).json({
        success: false,
        message: "Code, discount percentage, and type are required",
      });
    }

    if (discountPercent < 1 || discountPercent > 100) {
      return res.status(400).json({
        success: false,
        message: "Discount percentage must be between 1 and 100",
      });
    }

    if (!["USER", "VENDOR"].includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Type must be USER or VENDOR",
      });
    }

    if (assignedTo) {
      const user = await User.findById(assignedTo);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Assigned user not found",
        });
      }
      if (user.role !== type) {
        return res.status(400).json({
          success: false,
          message: `Assigned user must have role ${type}`,
        });
      }
    }

    if (validFrom && validUntil && new Date(validUntil) < new Date(validFrom)) {
      return res.status(400).json({
        success: false,
        message: "Valid until date cannot be before valid from date",
      });
    }

    const normalizedCode = code.trim().toUpperCase();

    const coupon = await Coupon.create({
      code: normalizedCode,
      discountPercent,
      text: text || "",
      type,
      assignedTo: assignedTo || null,
      createdBy: req.user.userId,
      validFrom: validFrom || null,
      validUntil: validUntil || null,
      status: status || "active",
    });

    await coupon.populate("assignedTo", "fullName email publicId");
    await coupon.populate("createdBy", "fullName email");

    res.status(201).json({
      success: true,
      data: { coupon },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Coupon code already exists",
      });
    }
    res.status(500).json({
      success: false,
      message: "Server error creating coupon",
    });
  }
};

// ─── Admin: Get All Coupons ───

exports.getCoupons = async (req, res) => {
  try {
    const { page = 1, search = "", type = "", status = "" } = req.query;
    const limit = 20;
    const skip = (page - 1) * limit;

    const filter = {};
    if (type) filter.type = type;
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { code: { $regex: search, $options: "i" } },
        { text: { $regex: search, $options: "i" } },
      ];
    }

    const [coupons, total] = await Promise.all([
      Coupon.find(filter)
        .populate("assignedTo", "fullName email publicId")
        .populate("createdBy", "fullName email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Coupon.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: {
        coupons,
        pagination: {
          page: Number(page),
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error fetching coupons",
    });
  }
};

// ─── Admin: Get Single Coupon ───

exports.getCouponById = async (req, res) => {
  try {
    const { id } = req.params;

    const coupon = await Coupon.findById(id)
      .populate("assignedTo", "fullName email publicId")
      .populate("createdBy", "fullName email");

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found",
      });
    }

    res.status(200).json({
      success: true,
      data: { coupon },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error fetching coupon",
    });
  }
};

// ─── Admin: Update Coupon ───

exports.updateCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const { code, discountPercent, text, type, assignedTo, validFrom, validUntil, status } = req.body;

    const coupon = await Coupon.findById(id);
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found",
      });
    }

    if (discountPercent !== undefined && (discountPercent < 1 || discountPercent > 100)) {
      return res.status(400).json({
        success: false,
        message: "Discount percentage must be between 1 and 100",
      });
    }

    if (type !== undefined && !["USER", "VENDOR"].includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Type must be USER or VENDOR",
      });
    }

    if (assignedTo) {
      const user = await User.findById(assignedTo);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Assigned user not found",
        });
      }
      const couponType = type || coupon.type;
      if (user.role !== couponType) {
        return res.status(400).json({
          success: false,
          message: `Assigned user must have role ${couponType}`,
        });
      }
    }

    const newValidFrom = validFrom !== undefined ? validFrom : coupon.validFrom;
    const newValidUntil = validUntil !== undefined ? validUntil : coupon.validUntil;
    if (newValidFrom && newValidUntil && new Date(newValidUntil) < new Date(newValidFrom)) {
      return res.status(400).json({
        success: false,
        message: "Valid until date cannot be before valid from date",
      });
    }

    if (code !== undefined) coupon.code = code.trim().toUpperCase();
    if (discountPercent !== undefined) coupon.discountPercent = discountPercent;
    if (text !== undefined) coupon.text = text;
    if (type !== undefined) coupon.type = type;
    if (assignedTo !== undefined) coupon.assignedTo = assignedTo || null;
    if (validFrom !== undefined) coupon.validFrom = validFrom || null;
    if (validUntil !== undefined) coupon.validUntil = validUntil || null;
    if (status !== undefined) coupon.status = status;

    await coupon.save();
    await coupon.populate("assignedTo", "fullName email publicId");
    await coupon.populate("createdBy", "fullName email");

    res.status(200).json({
      success: true,
      data: { coupon },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Coupon code already exists",
      });
    }
    res.status(500).json({
      success: false,
      message: "Server error updating coupon",
    });
  }
};

// ─── Admin: Toggle Coupon Status ───

exports.toggleCouponStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const coupon = await Coupon.findById(id);
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found",
      });
    }

    coupon.status = coupon.status === "active" ? "inactive" : "active";
    await coupon.save();
    await coupon.populate("assignedTo", "fullName email publicId");

    res.status(200).json({
      success: true,
      data: { coupon },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error toggling coupon status",
    });
  }
};

// ─── Admin: Delete Coupon ───

exports.deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;

    const coupon = await Coupon.findById(id);
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found",
      });
    }

    await Coupon.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Coupon deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error deleting coupon",
    });
  }
};

// ─── Admin: Search Users for Assignment ───

exports.searchUsers = async (req, res) => {
  try {
    const { search = "", role = "USER" } = req.query;

    const filter = { role };
    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { publicId: { $regex: search, $options: "i" } },
      ];
    }

    const users = await User.find(filter)
      .select("fullName email publicId role")
      .limit(20)
      .sort({ fullName: 1 });

    res.status(200).json({
      success: true,
      data: { users },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error searching users",
    });
  }
};
