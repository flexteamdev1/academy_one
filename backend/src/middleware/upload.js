const multer = require('multer');

const MAX_FILE_SIZE = 2 * 1024 * 1024;

const storage = multer.memoryStorage();

const imageFileFilter = (_req, file, cb) => {
  if (!file.mimetype || !file.mimetype.startsWith('image/')) {
    cb(new Error('Only image files are allowed'));
    return;
  }
  cb(null, true);
};

const uploadProfilePhoto = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: { fileSize: MAX_FILE_SIZE },
});

module.exports = {
  uploadProfilePhoto,
};
