import { API_BASE_URL } from '../config/api';

/** Resolve an image stored on a car to a URL the browser can load. */
export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (/^(data:|blob:|https?:\/\/)/.test(imagePath)) return imagePath;
  return `${API_BASE_URL}${imagePath}`;
};
