const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadsDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const resellerDir = path.join(uploadsDir, "reseller");
if (!fs.existsSync(resellerDir)) {
  fs.mkdirSync(resellerDir, { recursive: true });
}

const resellerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, resellerDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `reseller-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedImageTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "application/pdf"];
  const allowedVideoTypes = ["video/mp4", "video/quicktime", "video/webm"];

  if (file.fieldname === "locationVideo") {
    if (allowedVideoTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only MP4, MOV, and WebM video files are allowed for location video."), false);
    }
  } else if (file.fieldname === "businessCard") {
    if (allowedImageTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPG, PNG, WebP, and PDF files are allowed for business card."), false);
    }
  } else {
    cb(new Error("Unexpected field."), false);
  }
};

const resellerUpload = multer({
  storage: resellerStorage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024,
  },
}).fields([
  { name: "locationVideo", maxCount: 1 },
  { name: "businessCard", maxCount: 1 },
]);

module.exports = { resellerUpload };
