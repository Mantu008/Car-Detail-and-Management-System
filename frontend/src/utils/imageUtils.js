// Utility functions for handling images

/**
 * Get the full image URL, handling both relative and absolute URLs
 * @param {string} imagePath - The image path from the API
 * @returns {string} - The full image URL
 */
export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  
  // If it's a base64 data URL, return as is
  if (imagePath.startsWith('data:')) {
    return imagePath;
  }
  
  // If it's already a full URL (starts with http/https), return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // For relative paths, construct the full URL
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  return `${API_BASE_URL}${imagePath}`;
};

/**
 * Get a fallback image URL if the main image fails to load
 * @returns {string} - A fallback image URL
 */
export const getFallbackImageUrl = () => {
  return 'https://via.placeholder.com/400x300/cccccc/666666?text=No+Image';
};

/**
 * Handle image load error by setting a fallback image
 * @param {Event} event - The error event
 */
export const handleImageError = (event) => {
  const img = event.target;
  img.src = getFallbackImageUrl();
  img.onerror = null; // Prevent infinite loop
};
