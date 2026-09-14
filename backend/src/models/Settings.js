const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    value: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    category: {
      type: String,
      enum: ["general", "subscription", "platform"],
      required: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

settingsSchema.index({ key: 1 }, { unique: true });
settingsSchema.index({ category: 1 });

const Settings = mongoose.model("Settings", settingsSchema);

module.exports = Settings;
