const dotenv = require("dotenv");
dotenv.config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Business = require("../models/Business");
const Category = require("../models/Category");
const { ROLES } = require("../utils/constants");

const DEMO_EMAIL_PREFIX = "demo-";
const DEMO_PASSWORD = "Demo@12345";

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(10, Math.floor(Math.random() * 60), 0, 0);
  return d;
}

function monthsAgo(n) {
  const d = new Date();
  d.setMonth(d.getMonth() - n);
  d.setDate(Math.floor(Math.random() * 28) + 1);
  d.setHours(10, Math.floor(Math.random() * 60), 0, 0);
  return d;
}

const demoUsers = [
  { fullName: "Demo User Alpha", email: "demo-user-001@localprinter.dev", createdAt: daysAgo(28) },
  { fullName: "Demo User Beta", email: "demo-user-002@localprinter.dev", createdAt: daysAgo(25) },
  { fullName: "Demo User Gamma", email: "demo-user-003@localprinter.dev", createdAt: daysAgo(20) },
  { fullName: "Demo User Delta", email: "demo-user-004@localprinter.dev", createdAt: daysAgo(18) },
  { fullName: "Demo User Epsilon", email: "demo-user-005@localprinter.dev", createdAt: daysAgo(15) },
  { fullName: "Demo User Zeta", email: "demo-user-006@localprinter.dev", createdAt: daysAgo(12) },
  { fullName: "Demo User Eta", email: "demo-user-007@localprinter.dev", createdAt: daysAgo(10) },
  { fullName: "Demo User Theta", email: "demo-user-008@localprinter.dev", createdAt: daysAgo(7) },
  { fullName: "Demo User Iota", email: "demo-user-009@localprinter.dev", createdAt: daysAgo(5) },
  { fullName: "Demo User Kappa", email: "demo-user-010@localprinter.dev", createdAt: daysAgo(3) },
  { fullName: "Demo User Lambda", email: "demo-user-011@localprinter.dev", createdAt: daysAgo(2) },
  { fullName: "Demo User Mu", email: "demo-user-012@localprinter.dev", createdAt: daysAgo(1) },
  { fullName: "Demo User Nu", email: "demo-user-013@localprinter.dev", createdAt: monthsAgo(3) },
  { fullName: "Demo User Xi", email: "demo-user-014@localprinter.dev", createdAt: monthsAgo(5) },
  { fullName: "Demo User Omicron", email: "demo-user-015@localprinter.dev", createdAt: monthsAgo(8) },
];

const demoVendors = [
  { fullName: "Demo Vendor Alpha", email: "demo-vendor-001@localprinter.dev", createdAt: daysAgo(26) },
  { fullName: "Demo Vendor Beta", email: "demo-vendor-002@localprinter.dev", createdAt: daysAgo(22) },
  { fullName: "Demo Vendor Gamma", email: "demo-vendor-003@localprinter.dev", createdAt: daysAgo(16) },
  { fullName: "Demo Vendor Delta", email: "demo-vendor-004@localprinter.dev", createdAt: daysAgo(11) },
  { fullName: "Demo Vendor Epsilon", email: "demo-vendor-005@localprinter.dev", createdAt: daysAgo(6) },
  { fullName: "Demo Vendor Zeta", email: "demo-vendor-006@localprinter.dev", createdAt: daysAgo(2) },
  { fullName: "Demo Vendor Eta", email: "demo-vendor-007@localprinter.dev", createdAt: monthsAgo(2) },
  { fullName: "Demo Vendor Theta", email: "demo-vendor-008@localprinter.dev", createdAt: monthsAgo(6) },
];

const demoBusinesses = [
  { name: "Demo Print Shop Alpha", vendorEmail: "demo-vendor-001@localprinter.dev", status: "approved", isActive: true, createdAt: daysAgo(24) },
  { name: "Demo Print Hub Beta", vendorEmail: "demo-vendor-002@localprinter.dev", status: "approved", isActive: true, createdAt: daysAgo(20) },
  { name: "Demo Press Gamma", vendorEmail: "demo-vendor-003@localprinter.dev", status: "approved", isActive: true, createdAt: daysAgo(14) },
  { name: "Demo Graphics Delta", vendorEmail: "demo-vendor-004@localprinter.dev", status: "pending", isActive: true, createdAt: daysAgo(10) },
  { name: "Demo Copies Epsilon", vendorEmail: "demo-vendor-005@localprinter.dev", status: "approved", isActive: true, createdAt: daysAgo(5) },
  { name: "Demo Digital Zeta", vendorEmail: "demo-vendor-006@localprinter.dev", status: "pending", isActive: true, createdAt: daysAgo(1) },
  { name: "Demo Studios Eta", vendorEmail: "demo-vendor-007@localprinter.dev", status: "rejected", isActive: false, createdAt: monthsAgo(2) },
  { name: "Demo Designs Theta", vendorEmail: "demo-vendor-008@localprinter.dev", status: "approved", isActive: false, createdAt: monthsAgo(5) },
  { name: "Demo Quick Print", vendorEmail: "demo-vendor-001@localprinter.dev", status: "approved", isActive: true, createdAt: daysAgo(8) },
  { name: "Demo Wide Format", vendorEmail: "demo-vendor-003@localprinter.dev", status: "pending", isActive: true, createdAt: daysAgo(3) },
  { name: "Demo Bindery Pro", vendorEmail: "demo-vendor-005@localprinter.dev", status: "rejected", isActive: false, createdAt: monthsAgo(1) },
  { name: "Demo Sign World", vendorEmail: "demo-vendor-007@localprinter.dev", status: "approved", isActive: true, createdAt: monthsAgo(4) },
];

const seedDashboardDemo = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected for dashboard demo seeding");

    const existingDemoUsers = await User.find({
      email: { $regex: `^${DEMO_EMAIL_PREFIX}`, $options: "i" },
    }).select("email");

    const existingEmails = new Set(existingDemoUsers.map((u) => u.email));

    const salt = await bcrypt.genSalt(12);
    const hash = await bcrypt.hash(DEMO_PASSWORD, salt);

    let usersCreated = 0;
    const userIdMap = {};

    for (const u of demoUsers) {
      if (existingEmails.has(u.email)) {
        const existing = await User.findOne({ email: u.email });
        userIdMap[u.email] = existing._id;
        continue;
      }
      const user = new User({
        fullName: u.fullName,
        email: u.email,
        passwordHash: hash,
        role: ROLES.USER,
        isActive: true,
        publicId: `USR-DEMO-${String(usersCreated + 1).padStart(3, "0")}`,
        createdAt: u.createdAt,
        updatedAt: u.createdAt,
      });
      await user.save({ validateBeforeSave: false });
      userIdMap[u.email] = user._id;
      usersCreated++;
    }

    let vendorsCreated = 0;
    const vendorIdMap = {};

    for (const v of demoVendors) {
      if (existingEmails.has(v.email)) {
        const existing = await User.findOne({ email: v.email });
        vendorIdMap[v.email] = existing._id;
        continue;
      }
      const vendor = new User({
        fullName: v.fullName,
        email: v.email,
        passwordHash: hash,
        role: ROLES.VENDOR,
        isActive: true,
        publicId: `VND-DEMO-${String(vendorsCreated + 1).padStart(3, "0")}`,
        createdAt: v.createdAt,
        updatedAt: v.createdAt,
      });
      await vendor.save({ validateBeforeSave: false });
      vendorIdMap[v.email] = vendor._id;
      vendorsCreated++;
    }

    const existingDemoBusinesses = await Business.find({
      name: { $regex: "^Demo ", $options: "i" },
    }).select("name");
    const existingBizNames = new Set(existingDemoBusinesses.map((b) => b.name));

    let businessesCreated = 0;

    for (const b of demoBusinesses) {
      if (existingBizNames.has(b.name)) continue;

      const vendorId = vendorIdMap[b.vendorEmail];
      if (!vendorId) continue;

      const biz = new Business({
        vendor: vendorId,
        name: b.name,
        description: `Demo business: ${b.name}`,
        category: "Printing",
        city: "Demo City",
        status: b.status,
        isActive: b.isActive,
        phone: "9999999999",
        createdAt: b.createdAt,
        updatedAt: b.createdAt,
      });
      await biz.save({ validateBeforeSave: false });
      businessesCreated++;
    }

    console.log(`\nDashboard demo seed complete:`);
    console.log(`  Users created:     ${usersCreated} (skipped ${demoUsers.length - usersCreated})`);
    console.log(`  Vendors created:   ${vendorsCreated} (skipped ${demoVendors.length - vendorsCreated})`);
    console.log(`  Businesses created: ${businessesCreated} (skipped ${demoBusinesses.length - businessesCreated})`);
    console.log(`\nDemo accounts login with password: ${DEMO_PASSWORD}`);
    console.log(`Identify demo records by email prefix: "${DEMO_EMAIL_PREFIX}"`);

    process.exit(0);
  } catch (error) {
    console.error("Dashboard demo seed error:", error.message);
    process.exit(1);
  }
};

seedDashboardDemo();
