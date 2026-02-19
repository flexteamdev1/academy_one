const { cloudinary, isCloudinaryConfigured } = require('../config/cloudinary');

const slugify = (value) => {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

const parseBoolean = (value) => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') return value.toLowerCase() === 'true';
  return false;
};

const trimSlashes = (value) => String(value || '').replace(/^\/+|\/+$/g, '');

const joinPath = (...parts) => {
  return parts
    .map(trimSlashes)
    .filter(Boolean)
    .join('/');
};

const getCloudinaryFolder = (type) => {
  const root = process.env.CLOUDINARY_ROOT_FOLDER || 'academy-one';
  const envSegment = process.env.CLOUDINARY_ENV_FOLDER || process.env.NODE_ENV || 'dev';

  const typeMap = {
    student: process.env.CLOUDINARY_STUDENT_FOLDER || 'students/profile-photos',
    teacher: process.env.CLOUDINARY_TEACHER_FOLDER || 'teachers/profile-photos',
    school: process.env.CLOUDINARY_SCHOOL_FOLDER || 'schools',
    notice: process.env.CLOUDINARY_NOTICE_FOLDER || 'notices',
  };

  const leaf = typeMap[type] || type;
  return joinPath(root, envSegment, leaf);
};

const uploadImageToCloudinary = async ({ file, folder, publicIdPrefix }) => {
  if (!file) return null;
  if (!isCloudinaryConfigured()) {
    throw new Error('Cloudinary is not configured');
  }

  const dataUri = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;

  const uploaded = await cloudinary.uploader.upload(dataUri, {
    folder,
    public_id: `${publicIdPrefix || 'photo'}-${Date.now()}`,
    overwrite: false,
    resource_type: 'image',
  });

  return {
    url: uploaded.secure_url,
    publicId: uploaded.public_id,
  };
};

const uploadFileToCloudinary = async ({ file, folder, publicIdPrefix }) => {
  if (!file) return null;
  if (!isCloudinaryConfigured()) {
    throw new Error('Cloudinary is not configured');
  }

  const dataUri = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
  const safeName = slugify(file.originalname || 'file');
  const publicId = `${publicIdPrefix || 'file'}-${Date.now()}-${safeName || 'upload'}`;

  const uploaded = await cloudinary.uploader.upload(dataUri, {
    folder,
    public_id: publicId,
    overwrite: false,
    resource_type: 'auto',
  });

  return {
    url: uploaded.secure_url,
    publicId: uploaded.public_id,
    format: uploaded.format,
    resourceType: uploaded.resource_type,
    bytes: uploaded.bytes,
  };
};

const deleteCloudinaryAsset = async (publicId, resourceType = 'image') => {
  if (!publicId || !isCloudinaryConfigured()) return;

  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  } catch (_error) {
    // Keep DB operations successful even if remote cleanup fails.
  }
};

module.exports = {
  slugify,
  parseBoolean,
  getCloudinaryFolder,
  uploadImageToCloudinary,
  uploadFileToCloudinary,
  deleteCloudinaryAsset,
};
