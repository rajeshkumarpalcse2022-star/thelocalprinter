const dotenv = require("dotenv");
dotenv.config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { ROLES } = require("../utils/constants");

const fix = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected");

  // Delete existing admin and re-create properly
  await User.deleteMany({ email: "admin@localprinter.com" });
  console.log("Deleted old admin");

  const salt = await bcrypt.genSalt(12);
  const hash = await bcrypt.hash("Admin@123456", salt);

  const admin = await User.create({
    fullName: "Admin",
    email: "admin@localprinter.com",
    passwordHash: hash,
    role: ROLES.ADMIN,
    isActive: true,
  });

  // Verify: raw query with passwordHash
  const raw = await User.findOne({ email: "admin@localprinter.com" }).select("+passwordHash");
  const match = await raw.comparePassword("Admin@123456");
  console.log(`Admin created: ${admin._id}`);
  console.log(`Password verify: ${match}`);

  await mongoose.disconnect();
};

fix();
