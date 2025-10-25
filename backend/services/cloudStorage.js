// Cloud storage service for handling image uploads
// This service provides different storage options based on environment

let cloudinary = null;
try {
  cloudinary = require('cloudinary').v2;
} catch (error) {
  console.log('Cloudinary not available, using base64 fallback');
}

// Configure Cloudinary (optional - only if you want to use it)
if (cloudinary && process.env.CLOUDINARY_CLOUD_NAME) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
}

/**
 * Upload image to cloud storage
 * @param {Buffer} fileBuffer - The file buffer
 * @param {string} mimeType - The MIME type of the file
 * @param {string} originalName - The original filename
 * @returns {Promise<string>} - The uploaded image URL
 */
const uploadToCloud = async (fileBuffer, mimeType, originalName) => {
  const isVercel = process.env.VERCEL === '1';
  const hasCloudinary = process.env.CLOUDINARY_CLOUD_NAME;
  
  if (isVercel && hasCloudinary && cloudinary) {
    // Use Cloudinary for production
    try {
      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            resource_type: 'auto',
            folder: 'car-management',
            public_id: `car-${Date.now()}-${Math.round(Math.random() * 1E9)}`
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        ).end(fileBuffer);
      });
      
      return result.secure_url;
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      // Fallback to base64 if Cloudinary fails
      return `data:${mimeType};base64,${fileBuffer.toString('base64')}`;
    }
  } else if (isVercel) {
    // Use base64 for Vercel without cloud storage
    return `data:${mimeType};base64,${fileBuffer.toString('base64')}`;
  } else {
    // Local development - return null to use file system
    return null;
  }
};

module.exports = {
  uploadToCloud
};
