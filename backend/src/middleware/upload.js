const multer = require('multer');

const MAX_FILE_SIZE = 2 * 1024 * 1024;
const MAX_NOTICE_FILE_SIZE = 10 * 1024 * 1024;

const storage = multer.memoryStorage();

const imageFileFilter = (_req, file, cb) => {
  if (!file.mimetype || !file.mimetype.startsWith('image/')) {
    cb(new Error('Only image files are allowed'));
    return;
  }
  cb(null, true);
};

const allowedNoticeMimeTypes = new Set([
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/jpg',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
]);

const noticeFileFilter = (_req, file, cb) => {
  if (!file.mimetype || !allowedNoticeMimeTypes.has(file.mimetype)) {
    cb(new Error('Unsupported attachment type'));
    return;
  }
  cb(null, true);
};

const uploadProfilePhoto = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: { fileSize: MAX_FILE_SIZE },
});

const uploadNoticeAttachments = multer({
  storage,
  fileFilter: noticeFileFilter,
  limits: { fileSize: MAX_NOTICE_FILE_SIZE },
});

module.exports = {
  uploadProfilePhoto,
  uploadNoticeAttachments,
};
