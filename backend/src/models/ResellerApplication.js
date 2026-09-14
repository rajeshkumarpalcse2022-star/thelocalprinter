const mongoose = require("mongoose");

const resellerApplicationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    companyName: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
      maxlength: [200, "Company name must be at most 200 characters"],
    },
    address: {
      type: String,
      trim: true,
      default: "",
    },
    businessCategory: {
      type: String,
      required: [true, "Business category is required"],
      enum: ["Designer", "Printer", "Ad Agency", "Directory Business Listed Person"],
    },
    contactNumber: {
      type: String,
      trim: true,
      default: "",
    },
    gstNumber: {
      type: String,
      trim: true,
      default: "",
    },
    yearlyTurnover: {
      type: String,
      trim: true,
      default: "",
    },
    locationVideoPath: {
      type: String,
      default: null,
    },
    businessCardPath: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING",
    },
    rejectionReason: {
      type: String,
      default: "",
    },
    isAlreadyListed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

resellerApplicationSchema.index({ user: 1 });
resellerApplicationSchema.index({ status: 1 });

const ResellerApplication = mongoose.model("ResellerApplication", resellerApplicationSchema);

module.exports = ResellerApplication;
