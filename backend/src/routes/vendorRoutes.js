const express = require("express");
const { authenticateUser, authorizeRole } = require("../middlewares/auth");
const {
  getDashboard,
  getOnboardingStatus,
  getMyBusinesses,
  getBusinessById,
  createBusiness,
  updateBusiness,
  deleteBusiness,
  toggleBusinessStatus,
  getProfile,
  getPackage,
} = require("../controllers/vendorController");
const {
  getVendorReviews,
  getVendorReviewSummary,
} = require("../controllers/reviewController");

const router = express.Router();

router.use(authenticateUser);
router.use(authorizeRole("VENDOR"));

router.get("/onboarding-status", getOnboardingStatus);
router.get("/dashboard", getDashboard);
router.get("/businesses", getMyBusinesses);
router.get("/businesses/:id", getBusinessById);
router.post("/businesses", createBusiness);
router.put("/businesses/:id", updateBusiness);
router.delete("/businesses/:id", deleteBusiness);
router.patch("/businesses/:id/toggle-status", toggleBusinessStatus);
router.get("/profile", getProfile);
router.get("/reviews/summary", getVendorReviewSummary);
router.get("/reviews", getVendorReviews);
router.get("/package", getPackage);

module.exports = router;
