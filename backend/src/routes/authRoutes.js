const express = require("express");
const { body } = require("express-validator");
const { signup, login, getMe } = require("../controllers/authController");
const { sendOtp, verifyOtp, checkOtpVerified } = require("../controllers/otpController");
const { authenticateUser } = require("../middlewares/auth");
const { resellerUpload } = require("../middlewares/upload");

const router = express.Router();

const sendOtpValidation = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),
];

const verifyOtpValidation = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),
  body("otp")
    .trim()
    .notEmpty()
    .withMessage("OTP is required")
    .isLength({ min: 6, max: 6 })
    .withMessage("OTP must be 6 digits")
    .isNumeric()
    .withMessage("OTP must contain only numbers"),
];

const signupValidation = [
  body("fullName")
    .trim()
    .notEmpty()
    .withMessage("Full name is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Full name must be 2-100 characters"),
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  body("role")
    .notEmpty()
    .withMessage("Account type is required")
    .isIn(["USER", "VENDOR"])
    .withMessage("Account type must be USER or VENDOR"),
];

const loginValidation = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required"),
];

router.post("/send-otp", sendOtpValidation, sendOtp);
router.post("/verify-otp", verifyOtpValidation, verifyOtp);
router.get("/check-otp", checkOtpVerified);

const normalizeSignupEmail = (req, res, next) => {
  if (req.body && req.body.email) {
    req.body.email = req.body.email.toLowerCase().trim();
  }
  next();
};

router.post("/signup", resellerUpload, normalizeSignupEmail, signup);
router.post("/signup-json", signupValidation, signup);
router.post("/login", loginValidation, login);
router.get("/me", authenticateUser, getMe);

module.exports = router;
