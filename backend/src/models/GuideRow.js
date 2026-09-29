const mongoose = require("mongoose");

const guideRowSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    feature: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },
    values: {
      type: [String],
      default: [],
      maxlength: 20,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("GuideRow", guideRowSchema);
