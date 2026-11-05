const fs = require('fs');
const path = require('path');
const { UPLOAD_DIR } = require('../middleware/uploadMiddleware');

let cloudinary = null;
if (process.env.CLOUDINARY_CLOUD_NAME) {
  cloudinary = require('cloudinary').v2;
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

const uploadBufferToCloudinary = (buffer) =>
  new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder: 'car-management', resource_type: 'image' }, (error, result) =>
        error ? reject(error) : resolve(result.secure_url)
      )
      .end(buffer);
  });

/**
 * Persist an uploaded image (from multer) and return the URL to store on the car.
 * - Local development: file is already on disk -> "/uploads/cars/<file>"
 * - Serverless with Cloudinary: uploaded to Cloudinary -> https URL
 * - Serverless without Cloudinary: inlined as a base64 data URL (small images only)
 */
const storeImage = async (file) => {
  if (!file) return null;

  if (file.filename) return `/uploads/cars/${file.filename}`;

  if (cloudinary) return uploadBufferToCloudinary(file.buffer);

  return `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
};

// Remove a locally stored image when it is replaced or its car is deleted.
const removeLocalImage = (imageUrl) => {
  if (!imageUrl || !imageUrl.startsWith('/uploads/cars/')) return;
  const filePath = path.join(UPLOAD_DIR, path.basename(imageUrl));
  fs.promises.unlink(filePath).catch(() => {});
};

module.exports = { storeImage, removeLocalImage };
