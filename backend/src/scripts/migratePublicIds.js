const dotenv = require("dotenv");
dotenv.config();
const connectDB = require("../config/db");
const { backfillPublicIds } = require("../utils/publicId");

const migrate = async () => {
  await connectDB();
  console.log("Starting public ID migration...");
  await backfillPublicIds();
  process.exit(0);
};

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
