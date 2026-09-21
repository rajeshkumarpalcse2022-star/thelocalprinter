const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");
const OtpVerification = require("../models/OtpVerification");

const OTP_LENGTH = 6;
const OTP_EXPIRY_MINUTES = 10;
const RESEND_COOLDOWN_SECONDS = 60;
const MAX_ATTEMPTS = 5;
const MAX_OTP_REQUESTS_PER_HOUR = 5;

const generateOtp = () => {
  const buffer = crypto.randomBytes(4);
  const otpNum = (buffer.readUInt32BE(0) % 1000000).toString().padStart(OTP_LENGTH, "0");
  return otpNum;
};

const hashOtp = async (otp) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(otp, salt);
};

// OTP emails are sent via Brevo HTTP API (no SMTP ports needed, works on Render free tier).

exports.sendOtp = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
      });
    }

    const { email } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    const recentOtps = await OtpVerification.countDocuments({
      email: normalizedEmail,
      createdAt: { $gte: new Date(Date.now() - 60 * 60 * 1000) },
    });

    if (recentOtps >= MAX_OTP_REQUESTS_PER_HOUR) {
      return res.status(429).json({
        success: false,
        message: "Too many OTP requests. Please try again later.",
      });
    }

    const lastOtp = await OtpVerification.findOne({
      email: normalizedEmail,
    }).sort({ createdAt: -1 });

    if (lastOtp) {
      const timeSinceLastOtp = (Date.now() - lastOtp.createdAt.getTime()) / 1000;
      if (timeSinceLastOtp < RESEND_COOLDOWN_SECONDS) {
        const waitSeconds = Math.ceil(RESEND_COOLDOWN_SECONDS - timeSinceLastOtp);
        return res.status(429).json({
          success: false,
          message: `Please wait ${waitSeconds} seconds before requesting a new OTP.`,
          cooldown: waitSeconds,
        });
      }
    }

    const otp = generateOtp();
    const otpHash = await hashOtp(otp);

    await OtpVerification.deleteMany({ email: normalizedEmail, verified: false });

    const otpRecord = new OtpVerification({
      email: normalizedEmail,
      otpHash,
      expiresAt: new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000),
    });
    await otpRecord.save();

    if (!process.env.BREVO_API_KEY) {
      console.error(`[OTP] BREVO_API_KEY missing. Set BREVO_API_KEY in environment variables.`);
      return res.status(500).json({
        success: false,
        message: "Email service not configured. Please contact support.",
      });
    }

    const fromEmail = process.env.OTP_FROM_EMAIL;
    if (!fromEmail) {
      console.error(`[OTP] OTP_FROM_EMAIL missing. Set a Brevo-verified sender email.`);
      return res.status(500).json({
        success: false,
        message: "Email service not configured. Please contact support.",
      });
    }

    console.log(`[OTP] Sending OTP to ${normalizedEmail} via Brevo`);
    const brevoRes = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        accept: "application/json",
        "api-key": process.env.BREVO_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sender: { name: process.env.OTP_FROM_NAME || "Local Printer", email: fromEmail },
        to: [{ email: normalizedEmail }],
        subject: "Your Verification Code - Local Printer",
        htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 400px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h2 style="color: #f97316; margin: 0;">Local Printer</h2>
          </div>
          <div style="background: #f8f9fa; border-radius: 8px; padding: 24px; text-align: center;">
            <h3 style="color: #333; margin-bottom: 12px;">Your Verification Code</h3>
            <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #f97316; margin: 16px 0;">
              ${otp}
            </div>
            <p style="color: #666; font-size: 14px; margin-top: 16px;">
              This code expires in ${OTP_EXPIRY_MINUTES} minutes.
            </p>
            <p style="color: #999; font-size: 12px; margin-top: 8px;">
              If you didn't request this code, please ignore this email.
            </p>
          </div>
        </div>
      `,
      }),
    });

    if (!brevoRes.ok) {
      const errBody = await brevoRes.text();
      console.error(`[OTP] Brevo failed:`, brevoRes.status, errBody);
      return res.status(500).json({
        success: false,
        message: "Failed to send OTP. Please try again.",
      });
    }

    console.log(`[OTP] Email sent successfully to ${normalizedEmail}`);
    res.status(200).json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (error) {
    console.error("Send OTP error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send OTP. Please try again.",
    });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
      });
    }

    const { email, otp } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    const otpRecord = await OtpVerification.findOne({
      email: normalizedEmail,
      verified: false,
    }).sort({ createdAt: -1 });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: "No OTP found. Please request a new one.",
      });
    }

    if (otpRecord.isExpired()) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired. Please request a new one.",
      });
    }

    if (otpRecord.attempts >= MAX_ATTEMPTS) {
      return res.status(400).json({
        success: false,
        message: "Maximum verification attempts exceeded. Please request a new OTP.",
      });
    }

    otpRecord.attempts += 1;
    await otpRecord.save();

    const isMatch = await otpRecord.compareOtp(otp);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: `Invalid OTP. ${MAX_ATTEMPTS - otpRecord.attempts} attempts remaining.`,
      });
    }

    otpRecord.verified = true;
    await otpRecord.save();

    res.status(200).json({
      success: true,
      message: "Email verified successfully",
    });
  } catch (error) {
    console.error("Verify OTP error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to verify OTP. Please try again.",
    });
  }
};

exports.checkOtpVerified = async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const verifiedOtp = await OtpVerification.findOne({
      email: normalizedEmail,
      verified: true,
      expiresAt: { $gt: new Date() },
    });

    res.status(200).json({
      success: true,
      data: { verified: !!verifiedOtp },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
