const express = require("express");
const { authenticateUser, authorizeRole } = require("../middlewares/auth");
const { getProfile, updateProfile } = require("../controllers/posterBoyController");

const router = express.Router();

router.use(authenticateUser);
router.use(authorizeRole("POSTER_BOY"));

router.get("/profile", getProfile);
router.put("/profile", updateProfile);

module.exports = router;
