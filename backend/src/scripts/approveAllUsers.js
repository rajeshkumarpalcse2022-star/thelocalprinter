const dotenv = require("dotenv");
dotenv.config();

const mongoose = require("mongoose");
const User = require("../models/User");
const ResellerApplication = require("../models/ResellerApplication");
const { ROLES } = require("../utils/constants");

// One time migration: users (and resellers) never require admin approval.
// Vendor accounts are NOT touched - vendors still need admin approval.
const approveAllUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected");

    const users = await User.updateMany(
      { role: ROLES.USER, approvalStatus: { $ne: "approved" } },
      { $set: { approvalStatus: "approved" } }
    );

    const resellers = await User.updateMany(
      { role: ROLES.USER, registrationType: "RESELLER" },
      { $set: { resellerApprovalStatus: "APPROVED" } }
    );

    const applications = await ResellerApplication.updateMany(
      { status: "PENDING" },
      { $set: { status: "APPROVED", rejectionReason: "" } }
    );

    console.log(`Users approved: ${users.modifiedCount}`);
    console.log(`Reseller flags approved: ${resellers.modifiedCount}`);
    console.log(`Reseller applications approved: ${applications.modifiedCount}`);

    await mongoose.disconnect();
    console.log("Done");
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
};

approveAllUsers();
