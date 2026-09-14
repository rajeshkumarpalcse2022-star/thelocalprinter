const express = require("express");
const { authenticateUser, authorizeRole } = require("../middlewares/auth");
const {
  createCoupon,
  getCoupons,
  getCouponById,
  updateCoupon,
  toggleCouponStatus,
  deleteCoupon,
  searchUsers,
} = require("../controllers/adminCouponController");
const {
  getMyCoupons,
  validateCoupon,
  applyCoupon,
  consumeCoupon,
  calculateDiscount,
} = require("../controllers/couponController");

// ─── Admin Routes ───

const adminRouter = express.Router();
adminRouter.use(authenticateUser);
adminRouter.use(authorizeRole("ADMIN"));

adminRouter.get("/", getCoupons);
adminRouter.get("/search-users", searchUsers);
adminRouter.get("/:id", getCouponById);
adminRouter.post("/", createCoupon);
adminRouter.put("/:id", updateCoupon);
adminRouter.patch("/:id/toggle-status", toggleCouponStatus);
adminRouter.delete("/:id", deleteCoupon);

// ─── Shared User/Vendor Routes ───

const sharedRouter = express.Router();
sharedRouter.use(authenticateUser);
sharedRouter.use(authorizeRole("USER", "VENDOR"));

sharedRouter.get("/my", getMyCoupons);
sharedRouter.post("/validate", validateCoupon);
sharedRouter.post("/apply", applyCoupon);
sharedRouter.post("/consume", consumeCoupon);
sharedRouter.post("/calculate", calculateDiscount);

module.exports = { adminCouponRoutes: adminRouter, couponRoutes: sharedRouter };
