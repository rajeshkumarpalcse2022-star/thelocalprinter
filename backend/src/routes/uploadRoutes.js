const express = require("express");
const { authenticateUser, authorizeRole } = require("../middlewares/auth");
const cloudinary = require("../config/cloudinary");

const router = express.Router();

router.use(authenticateUser);
router.use(authorizeRole("VENDOR"));

router.post("/upload-signature", (req, res) => {
  try {
    const { folder, resource_type } = req.body;

    if (!folder || !resource_type) {
      return res.status(400).json({ message: "folder and resource_type are required" });
    }

    const allowedFolders = [
      "local-printer/vendor-verification/machinery-videos",
      "local-printer/vendor-verification/outlet-videos",
      "local-printer/vendor-verification/outdoor-images",
      "local-printer/vendor-verification/indoor-images",
      "local-printer/vendor-verification/slideshow-images",
    ];
    if (!allowedFolders.includes(folder)) {
      return res.status(400).json({ message: "Invalid folder" });
    }

    const allowedTypes = ["video", "image", "auto"];
    if (!allowedTypes.includes(resource_type)) {
      return res.status(400).json({ message: "Invalid resource_type" });
    }

    const timestamp = Math.round(Date.now() / 1000);

    const params = {
      timestamp: timestamp,
      folder: folder,
    };

    const signature = cloudinary.utils.api_sign_request(params, process.env.CLOUDINARY_API_SECRET);

    res.json({
      signature,
      timestamp,
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      folder,
      resource_type,
    });
  } catch (err) {
    console.error("Upload signature error:", err);
    res.status(500).json({ message: "Failed to generate upload signature" });
  }
});

module.exports = router;
