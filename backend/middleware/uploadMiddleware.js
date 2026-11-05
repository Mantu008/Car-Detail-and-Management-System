const fs = require('fs');
const path = require('path');
const multer = require('multer');

const isServerless = process.env.VERCEL === '1';
const UPLOAD_DIR = path.join(__dirname, '..', 'uploads', 'cars');

let storage;
if (isServerless) {
  // No writable disk on Vercel - keep the file in memory and upload it to the cloud.
  storage = multer.memoryStorage();
} else {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
    filename: (_req, file, cb) => {
      const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      cb(null, `car-${unique}${path.extname(file.originalname).toLowerCase()}`);
    },
  });
}

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_TYPES.includes(file.mimetype)) return cb(null, true);
    const error = new multer.MulterError('LIMIT_UNEXPECTED_FILE', file.fieldname);
    error.message = 'Only JPG, PNG, WEBP or GIF images are allowed';
    return cb(error);
  },
});

module.exports = { upload, UPLOAD_DIR };
