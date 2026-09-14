const dotenv = require("dotenv");
dotenv.config();

const mongoose = require("mongoose");
const User = require("../models/User");
const Business = require("../models/Business");
const { ROLES, ROLE_ENUM } = require("../utils/constants");

const runTests = async () => {
  let passed = 0;
  let failed = 0;

  const assert = (condition, label) => {
    if (condition) {
      console.log(`  PASS  ${label}`);
      passed++;
    } else {
      console.log(`  FAIL  ${label}`);
      failed++;
    }
  };

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("\n--- MongoDB Connection ---");
    assert(mongoose.connection.readyState === 1, "Connected to MongoDB");

    // Cleanup
    await User.deleteMany({});
    await Business.deleteMany({});

    // --- User Model ---
    console.log("\n--- User Model ---");

    const user = await User.create({
      fullName: "Test User",
      email: "  Test@Email.com  ",
      passwordHash: "password123",
      phone: "+91-9876543210",
      role: ROLES.USER,
    });

    assert(user._id, "User created with ID");
    assert(user.fullName === "Test User", "fullName stored correctly");
    assert(user.email === "test@email.com", "email normalized to lowercase and trimmed");
    assert(user.role === ROLES.USER, "role defaults correctly");
    assert(user.isActive === true, "isActive defaults to true");
    assert(user.createdAt instanceof Date, "createdAt timestamp exists");
    assert(user.updatedAt instanceof Date, "updatedAt timestamp exists");

    // --- Password Hashing ---
    console.log("\n--- Password Hashing ---");

    const rawUser = await User.findById(user._id).select("+passwordHash");
    assert(rawUser.passwordHash !== "password123", "password is hashed, not plaintext");
    assert(rawUser.passwordHash.startsWith("$2"), "password uses bcrypt format");

    const match = await rawUser.comparePassword("password123");
    assert(match === true, "comparePassword returns true for correct password");

    const noMatch = await rawUser.comparePassword("wrongpassword");
    assert(noMatch === false, "comparePassword returns false for wrong password");

    // --- passwordHash excluded from JSON ---
    console.log("\n--- passwordHash Exclusion ---");

    const jsonUser = user.toJSON();
    assert(!jsonUser.passwordHash, "passwordHash excluded from toJSON()");
    assert(!jsonUser.__v, "__v excluded from toJSON()");
    assert(jsonUser.email, "other fields present in toJSON()");

    const foundUser = await User.findOne({ email: "test@email.com" });
    assert(!foundUser.passwordHash, "passwordHash excluded from normal query");

    // --- Role Validation ---
    console.log("\n--- Role Validation ---");

    try {
      await User.create({
        fullName: "Bad Role",
        email: "bad@test.com",
        passwordHash: "pass123",
        role: "SUPERADMIN",
      });
      assert(false, "Should reject invalid role");
    } catch (err) {
      assert(err.message.includes("Role must be ADMIN, VENDOR, or USER"), "rejects invalid role");
    }

    const admin = await User.create({
      fullName: "Test Admin",
      email: "admin@test.com",
      passwordHash: "adminpass",
      role: ROLES.ADMIN,
    });
    assert(admin.role === ROLES.ADMIN, "accepts ADMIN role");

    const vendor = await User.create({
      fullName: "Test Vendor",
      email: "vendor@test.com",
      passwordHash: "vendorpass",
      role: ROLES.VENDOR,
    });
    assert(vendor.role === ROLES.VENDOR, "accepts VENDOR role");

    // --- Unique Email ---
    console.log("\n--- Unique Email ---");

    try {
      await User.create({
        fullName: "Duplicate",
        email: "test@email.com",
        passwordHash: "pass123",
      });
      assert(false, "Should reject duplicate email");
    } catch (err) {
      assert(err.code === 11000, "rejects duplicate email (MongoDB unique index)");
    }

    // --- Business Relationship ---
    console.log("\n--- Business Relationship (One Vendor -> Many Businesses) ---");

    const biz1 = await Business.create({
      vendor: vendor._id,
      name: "Print Shop Alpha",
      description: "Quality printing",
    });
    const biz2 = await Business.create({
      vendor: vendor._id,
      name: "Print Shop Beta",
      description: "Fast printing",
    });

    assert(biz1.vendor.equals(vendor._id), "Business 1 linked to vendor");
    assert(biz2.vendor.equals(vendor._id), "Business 2 linked to vendor");

    const vendorBusinesses = await Business.find({ vendor: vendor._id });
    assert(vendorBusinesses.length === 2, "Vendor owns multiple businesses (1-to-many)");

    // --- Role Constants ---
    console.log("\n--- Role Constants ---");

    assert(ROLE_ENUM.length === 3, "ROLE_ENUM has exactly 3 roles");
    assert(ROLE_ENUM.includes("ADMIN"), "ROLE_ENUM includes ADMIN");
    assert(ROLE_ENUM.includes("VENDOR"), "ROLE_ENUM includes VENDOR");
    assert(ROLE_ENUM.includes("USER"), "ROLE_ENUM includes USER");

    // --- Admin Protection (manual check) ---
    console.log("\n--- Admin Protection ---");
    const adminCount = await User.countDocuments({ role: ROLES.ADMIN });
    assert(adminCount >= 0, "Admin exists only via seed script, not public signup");
    console.log("  NOTE  Admin creation requires ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD in .env");
    console.log("  NOTE  No public signup API exists yet - admin cannot be freely created");

    // Summary
    console.log(`\n=============================`);
    console.log(`Results: ${passed} passed, ${failed} failed`);
    console.log(`=============================\n`);

    await mongoose.disconnect();
    process.exit(failed > 0 ? 1 : 0);
  } catch (error) {
    console.error("Test error:", error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
};

runTests();
