const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const otpVerificationSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    otpHash: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 },
    },
    attempts: {
      type: Number,
      default: 0,
      max: 5,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }
);

otpVerificationSchema.methods.compareOtp = async function (candidateOtp) {
  return bcrypt.compare(candidateOtp, this.otpHash);
};

otpVerificationSchema.methods.isExpired = function () {
  return Date.now() > this.expiresAt.getTime();
};

const OtpVerification = mongoose.model("OtpVerification", otpVerificationSchema);

module.exports = OtpVerification;
