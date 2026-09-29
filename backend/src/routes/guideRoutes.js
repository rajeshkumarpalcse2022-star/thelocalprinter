const express = require("express");
const { authenticateUser, authorizeRole } = require("../middlewares/auth");
const {
  getGuideRows,
  addGuideRow,
  deleteGuideRow,
} = require("../controllers/guideController");

const router = express.Router();

// Public — every visitor (admin, vendor, user, guest) sees the same rows.
router.get("/:slug/rows", getGuideRows);

// Admin only — adding/removing guide rows from the category guide page.
router.post("/:slug/rows", authenticateUser, authorizeRole("ADMIN"), addGuideRow);
router.delete("/:slug/rows/:id", authenticateUser, authorizeRole("ADMIN"), deleteGuideRow);

module.exports = router;
