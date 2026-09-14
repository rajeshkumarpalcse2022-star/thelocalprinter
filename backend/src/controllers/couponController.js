const Coupon = require("../models/Coupon");
const CouponUsage = require("../models/CouponUsage");

// ─── User/Vendor: Get My Coupons ───

exports.getMyCoupons = async (req, res) => {
  try {
    const userId = req.user.userId;
    const role = req.user.role;
    const type = role === "VENDOR" ? "VENDOR" : "USER";

    const now = new Date();

    const coupons = await Coupon.find({
      type,
      status: "active",
      $or: [
        { assignedTo: userId },
        { assignedTo: null },
      ],
      $and: [
        {
          $or: [
            { validFrom: null },
            { validFrom: { $lte: now } },
          ],
        },
        {
          $or: [
            { validUntil: null },
            { validUntil: { $gte: now } },
          ],
        },
      ],
    })
      .populate("assignedTo", "fullName email publicId")
      .sort({ createdAt: -1 });

    const couponsWithUsage = await Promise.all(
      coupons.map(async (coupon) => {
        const usage = await CouponUsage.findOne({
          coupon: coupon._id,
          user: userId,
        });
        return {
          ...coupon.toObject(),
          isUsed: !!usage,
        };
      })
    );

    res.status(200).json({
      success: true,
      data: { coupons: couponsWithUsage },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error fetching coupons",
    });
  }
};

// ─── User/Vendor: Validate Coupon (pure check, no side effects) ───

exports.validateCoupon = async (req, res) => {
  try {
    const userId = req.user.userId;
    const role = req.user.role;
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        valid: false,
        message: "Coupon code is required",
      });
    }

    const coupon = await Coupon.findOne({ code: code.trim().toUpperCase() });

    if (!coupon) {
      return res.status(400).json({
        success: false,
        valid: false,
        message: "Invalid coupon",
      });
    }

    const type = role === "VENDOR" ? "VENDOR" : "USER";
    if (coupon.type !== type) {
      return res.status(400).json({
        success: false,
        valid: false,
        message: "This coupon is not valid for your account",
      });
    }

    if (coupon.status !== "active") {
      return res.status(400).json({
        success: false,
        valid: false,
        message: "Coupon is no longer available",
      });
    }

    if (coupon.assignedTo && coupon.assignedTo.toString() !== userId) {
      return res.status(400).json({
        success: false,
        valid: false,
        message: "This coupon is not assigned to your account",
      });
    }

    const now = new Date();
    if (coupon.validFrom && now < coupon.validFrom) {
      return res.status(400).json({
        success: false,
        valid: false,
        message: "This coupon is not yet valid",
      });
    }

    if (coupon.validUntil && now > coupon.validUntil) {
      return res.status(400).json({
        success: false,
        valid: false,
        message: "Coupon has expired",
      });
    }

    const existingUsage = await CouponUsage.findOne({
      coupon: coupon._id,
      user: userId,
    });

    if (existingUsage) {
      return res.status(400).json({
        success: false,
        valid: false,
        message: "Coupon has already been used",
      });
    }

    res.status(200).json({
      success: true,
      valid: true,
      coupon: {
        code: coupon.code,
        discountPercent: coupon.discountPercent,
        text: coupon.text,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      valid: false,
      message: "Server error validating coupon",
    });
  }
};

// ─── User/Vendor: Apply Coupon (temporary — no usage record created) ───

exports.applyCoupon = async (req, res) => {
  try {
    const userId = req.user.userId;
    const role = req.user.role;
    const { code, originalPrice } = req.body;

    if (!code || originalPrice === undefined) {
      return res.status(400).json({
        success: false,
        message: "Coupon code and original price are required",
      });
    }

    if (originalPrice < 0) {
      return res.status(400).json({
        success: false,
        message: "Original price must be non-negative",
      });
    }

    const coupon = await Coupon.findOne({ code: code.trim().toUpperCase() });

    if (!coupon) {
      return res.status(400).json({
        success: false,
        message: "Invalid coupon",
      });
    }

    const type = role === "VENDOR" ? "VENDOR" : "USER";
    if (coupon.type !== type) {
      return res.status(400).json({
        success: false,
        message: "This coupon is not valid for your account",
      });
    }

    if (coupon.status !== "active") {
      return res.status(400).json({
        success: false,
        message: "Coupon is no longer available",
      });
    }

    if (coupon.assignedTo && coupon.assignedTo.toString() !== userId) {
      return res.status(400).json({
        success: false,
        message: "This coupon is not assigned to your account",
      });
    }

    const now = new Date();
    if (coupon.validFrom && now < coupon.validFrom) {
      return res.status(400).json({
        success: false,
        message: "This coupon is not yet valid",
      });
    }

    if (coupon.validUntil && now > coupon.validUntil) {
      return res.status(400).json({
        success: false,
        message: "Coupon has expired",
      });
    }

    const existingUsage = await CouponUsage.findOne({
      coupon: coupon._id,
      user: userId,
    });

    if (existingUsage) {
      return res.status(400).json({
        success: false,
        message: "Coupon has already been used",
      });
    }

    const discountAmount = Math.round((originalPrice * coupon.discountPercent) / 100);
    const finalPrice = originalPrice - discountAmount;

    res.status(200).json({
      success: true,
      data: {
        code: coupon.code,
        discountPercent: coupon.discountPercent,
        originalPrice,
        discountAmount,
        finalPrice,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error applying coupon",
    });
  }
};

// ─── User/Vendor: Consume Coupon (permanent — after successful payment) ───

exports.consumeCoupon = async (req, res) => {
  try {
    const userId = req.user.userId;
    const role = req.user.role;
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: "Coupon code is required",
      });
    }

    const coupon = await Coupon.findOne({ code: code.trim().toUpperCase() });

    if (!coupon) {
      return res.status(400).json({
        success: false,
        message: "Invalid coupon",
      });
    }

    const type = role === "VENDOR" ? "VENDOR" : "USER";
    if (coupon.type !== type) {
      return res.status(400).json({
        success: false,
        message: "This coupon is not valid for your account",
      });
    }

    if (coupon.status !== "active") {
      return res.status(400).json({
        success: false,
        message: "Coupon is no longer available",
      });
    }

    if (coupon.assignedTo && coupon.assignedTo.toString() !== userId) {
      return res.status(400).json({
        success: false,
        message: "This coupon is not assigned to your account",
      });
    }

    const now = new Date();
    if (coupon.validFrom && now < coupon.validFrom) {
      return res.status(400).json({
        success: false,
        message: "This coupon is not yet valid",
      });
    }

    if (coupon.validUntil && now > coupon.validUntil) {
      return res.status(400).json({
        success: false,
        message: "Coupon has expired",
      });
    }

    const existingUsage = await CouponUsage.findOne({
      coupon: coupon._id,
      user: userId,
    });

    if (existingUsage) {
      return res.status(400).json({
        success: false,
        message: "Coupon has already been used",
      });
    }

    await CouponUsage.create({
      coupon: coupon._id,
      user: userId,
      usedAt: now,
    });

    res.status(200).json({
      success: true,
      message: "Coupon consumed successfully",
      data: {
        code: coupon.code,
        discountPercent: coupon.discountPercent,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Coupon has already been used",
      });
    }
    res.status(500).json({
      success: false,
      message: "Server error consuming coupon",
    });
  }
};

// ─── User/Vendor: Calculate Discount ───

exports.calculateDiscount = async (req, res) => {
  try {
    const userId = req.user.userId;
    const role = req.user.role;
    const { code, originalPrice } = req.body;

    if (!code || originalPrice === undefined) {
      return res.status(400).json({
        success: false,
        message: "Coupon code and original price are required",
      });
    }

    if (originalPrice < 0) {
      return res.status(400).json({
        success: false,
        message: "Original price must be non-negative",
      });
    }

    const coupon = await Coupon.findOne({ code: code.trim().toUpperCase() });

    if (!coupon) {
      return res.status(400).json({
        success: false,
        message: "Invalid coupon",
      });
    }

    const type = role === "VENDOR" ? "VENDOR" : "USER";
    if (coupon.type !== type || coupon.status !== "active") {
      return res.status(400).json({
        success: false,
        message: "Coupon is not valid",
      });
    }

    if (coupon.assignedTo && coupon.assignedTo.toString() !== userId) {
      return res.status(400).json({
        success: false,
        message: "This coupon is not assigned to your account",
      });
    }

    const now = new Date();
    if (coupon.validFrom && now < coupon.validFrom) {
      return res.status(400).json({
        success: false,
        message: "This coupon is not yet valid",
      });
    }

    if (coupon.validUntil && now > coupon.validUntil) {
      return res.status(400).json({
        success: false,
        message: "Coupon has expired",
      });
    }

    const existingUsage = await CouponUsage.findOne({
      coupon: coupon._id,
      user: userId,
    });

    if (existingUsage) {
      return res.status(400).json({
        success: false,
        message: "Coupon has already been used",
      });
    }

    const discountAmount = Math.round((originalPrice * coupon.discountPercent) / 100);
    const finalPrice = originalPrice - discountAmount;

    res.status(200).json({
      success: true,
      data: {
        originalPrice,
        discountPercent: coupon.discountPercent,
        discountAmount,
        finalPrice,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error calculating discount",
    });
  }
};
