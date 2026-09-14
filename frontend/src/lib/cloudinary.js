import api from "../services/api";

const ALLOWED_FOLDERS = {
  machineryVideo: "local-printer/vendor-verification/machinery-videos",
  outletVideo: "local-printer/vendor-verification/outlet-videos",
  outdoorImage: "local-printer/vendor-verification/outdoor-images",
  indoorImage: "local-printer/vendor-verification/indoor-images",
  slideshowImage: "local-printer/vendor-verification/slideshow-images",
};

const VIDEO_TYPES = ["video/mp4", "video/mov", "video/avi", "video/webm", "video/quicktime", "video/x-msvideo", "video/x-matroska"];
const IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif", "image/bmp", "image/tiff"];

const MAX_VIDEO_SIZE = 100 * 1024 * 1024;
const MAX_IMAGE_SIZE = 10 * 1024 * 1024;

function getFileCategory(file) {
  if (file.type.startsWith("video/") || VIDEO_TYPES.includes(file.type)) return "video";
  if (file.type.startsWith("image/") || IMAGE_TYPES.includes(file.type)) return "image";
  return null;
}

function validateFile(file, expectedType) {
  if (expectedType === "video") {
    if (!VIDEO_TYPES.includes(file.type) && !file.type.startsWith("video/")) {
      return "Please select a valid video file (MP4, MOV, WebM, AVI)";
    }
    if (file.size > MAX_VIDEO_SIZE) {
      return "Video file is too large. Maximum size is 100MB";
    }
  } else if (expectedType === "image") {
    if (!IMAGE_TYPES.includes(file.type) && !file.type.startsWith("image/")) {
      return "Please select a valid image file (JPG, PNG, WebP)";
    }
    if (file.size > MAX_IMAGE_SIZE) {
      return "Image file is too large. Maximum size is 10MB";
    }
  }
  return null;
}

async function getSignedUploadParams(folder, resourceType) {
  const res = await api.post("/upload/upload-signature", {
    folder,
    resource_type: resourceType,
  });
  return res.data;
}

async function uploadToCloudinary(file, folder, resourceType, onProgress) {
  const validationError = validateFile(file, resourceType);
  if (validationError) {
    throw new Error(validationError);
  }

  const signedParams = await getSignedUploadParams(folder, resourceType);

  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("api_key", signedParams.api_key);
    formData.append("timestamp", signedParams.timestamp);
    formData.append("signature", signedParams.signature);
    formData.append("folder", signedParams.folder);

    const xhr = new XMLHttpRequest();
    xhr.open(
      "POST",
      `https://api.cloudinary.com/v1_1/${signedParams.cloud_name}/${signedParams.resource_type}/upload`,
      true
    );

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        const percent = Math.round((event.loaded / event.total) * 100);
        onProgress(percent);
      }
    };

    xhr.onload = () => {
      try {
        const response = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300 && response.secure_url) {
          resolve({
            secure_url: response.secure_url,
            public_id: response.public_id,
            format: response.format,
            resource_type: response.resource_type,
          });
        } else {
          reject(new Error(response.error?.message || "Upload failed"));
        }
      } catch {
        reject(new Error("Upload failed - invalid response from Cloudinary"));
      }
    };

    xhr.onerror = () => reject(new Error("Upload failed - network error"));
    xhr.onabort = () => reject(new Error("Upload cancelled"));

    xhr.send(formData);
  });
}

export {
  ALLOWED_FOLDERS,
  VIDEO_TYPES,
  IMAGE_TYPES,
  MAX_VIDEO_SIZE,
  MAX_IMAGE_SIZE,
  validateFile,
  uploadToCloudinary,
  getFileCategory,
};
