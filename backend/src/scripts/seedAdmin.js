const dotenv = require("dotenv");
dotenv.config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { ROLES } = require("../utils/constants");

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected for seeding");

    const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

    if (!ADMIN_EMAIL || !ADMIN_PASSWORD || !ADMIN_NAME) {
      console.error(
        "Error: ADMIN_NAME, ADMIN_EMAIL, and ADMIN_PASSWORD must be set in .env"
      );
      process.exit(1);
    }

    const existing = await User.findOne({ email: ADMIN_EMAIL.toLowerCase() });
    if (existing) {
      console.log("Admin user already exists. Skipping.");
      process.exit(0);
    }

    const salt = await bcrypt.genSalt(12);
    const hash = await bcrypt.hash(ADMIN_PASSWORD, salt);

    const admin = new User({
      fullName: ADMIN_NAME,
      email: ADMIN_EMAIL,
      passwordHash: hash,
      role: ROLES.ADMIN,
      isActive: true,
    });
    await admin.save();

    console.log(`Admin created: ${admin.email} (ID: ${admin._id})`);
    process.exit(0);
  } catch (error) {
    console.error("Seeding error:", error.message);
    process.exit(1);
  }
};

seedAdmin();
