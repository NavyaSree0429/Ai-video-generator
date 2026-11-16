const path = require('path');
const fs = require('fs');
const cloudinary = require('cloudinary').v2;

const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

let isCloudinaryConfigured = false;
if (
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
  isCloudinaryConfigured = true;
  console.log('[Storage] Cloudinary free-tier storage configured.');
} else {
  console.log('[Storage] Cloudinary not configured; defaulting to local file storage at /uploads.');
}

const getStorageStatus = () => ({
  mode: isCloudinaryConfigured ? 'cloudinary' : 'local',
  cloudinaryConfigured: isCloudinaryConfigured,
  localUploadDir: uploadDir
});

module.exports = {
  cloudinary,
  isCloudinaryConfigured,
  uploadDir,
  getStorageStatus
};

