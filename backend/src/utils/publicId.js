const User = require("../models/User");

function generateRandomId(prefix) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let id;
  let attempts = 0;
  do {
    let result = "";
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    id = `${prefix}-${result}`;
    attempts++;
  } while (attempts < 20);
  return id;
}

async function generatePublicId(role) {
  const prefix = role === "VENDOR" ? "VND" : "USR";
  let publicId;
  let exists = true;
  let attempts = 0;
  while (exists && attempts < 50) {
    publicId = generateRandomId(prefix);
    const existing = await User.findOne({ publicId }).lean();
    exists = !!existing;
    attempts++;
  }
  return publicId;
}

async function backfillPublicIds() {
  const users = await User.find({ publicId: null }).sort({ createdAt: 1 });
  let count = 0;
  for (const user of users) {
    if (user.role === "ADMIN") continue;
    const publicId = await generatePublicId(user.role);
    await User.updateOne({ _id: user._id }, { $set: { publicId } });
    count++;
    if (count % 10 === 0) {
      console.log(`Migrated ${count}/${users.length} users...`);
    }
  }

  const legacyUsers = await User.find({
    publicId: { $regex: "^LP-" },
  }).sort({ createdAt: 1 });
  for (const user of legacyUsers) {
    if (user.role === "ADMIN") continue;
    const publicId = await generatePublicId(user.role);
    await User.updateOne({ _id: user._id }, { $set: { publicId } });
    count++;
  }
  console.log(`Migration complete. ${count} users updated.`);
}

module.exports = { generatePublicId, backfillPublicIds };
