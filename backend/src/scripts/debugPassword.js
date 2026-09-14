const dotenv = require("dotenv");
dotenv.config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const debug = async () => {
  await mongoose.connect(process.env.MONGODB_URI);

  // Create a test user directly
  const salt = await bcrypt.genSalt(12);
  const hash = await bcrypt.hash("TestPass123", salt);
  console.log("Generated hash:", hash);

  const user = await User.create({
    fullName: "Debug",
    email: "debug@test.com",
    passwordHash: hash,
    role: "USER",
  });

  console.log("User passwordHash in DB:", user.passwordHash);

  // Retrieve with select
  const raw = await User.findOne({ email: "debug@test.com" }).select("+passwordHash");
  console.log("Retrieved passwordHash:", raw.passwordHash);

  const match = await bcrypt.compare("TestPass123", raw.passwordHash);
  console.log("Direct bcrypt.compare:", match);

  const match2 = await raw.comparePassword("TestPass123");
  console.log("comparePassword method:", match2);

  // Cleanup
  await User.deleteOne({ email: "debug@test.com" });
  await mongoose.disconnect();
};

debug();
