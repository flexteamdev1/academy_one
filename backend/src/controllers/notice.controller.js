const Notice = require('../models/Notice');
const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const Parent = require('../models/Parent');
const Teacher = require('../models/Teacher');
const { ROLES } = require('../constants/roles');
const { isCloudinaryConfigured } = require('../config/cloudinary');
const {
  getCloudinaryFolder,
  uploadFileToCloudinary,
  deleteCloudinaryAsset,
  slugify,
} = require('../utils/media');
const { sendNoticeEmail } = require('../utils/mailer');

const ALLOWED_CREATE_ROLES = [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TEACHER];
const VALID_STATUS = ['PUBLISHED', 'DRAFT', 'SCHEDULED', 'ARCHIVED'];
const VALID_CHANNELS = ['IN_APP', 'EMAIL', 'SMS'];
const VALID_ROLES = Object.values(ROLES);

const normalizeArray = (value) => {
  if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean);
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return [];
    if (trimmed.startsWith('[')) {
      try {
        const parsed = JSON.parse(trimmed);
        return Array.isArray(parsed) ? parsed.map((item) => String(item).trim()).filter(Boolean) : [];
      } catch (_error) {
        return trimmed.split(',').map((item) => item.trim()).filter(Boolean);
      }
    }
    return trimmed.split(',').map((item) => item.trim()).filter(Boolean);
  }
  return [];
};

const normalizeStatus = (value) => {
  const next = String(value || 'PUBLISHED').trim().toUpperCase();
  return VALID_STATUS.includes(next) ? next : 'PUBLISHED';
};

const normalizeChannels = (channels) => {
  const next = normalizeArray(channels).map((item) => item.toUpperCase());
  return next.filter((item) => VALID_CHANNELS.includes(item));
};

const normalizeAttachments = (attachments) => {
  if (!Array.isArray(attachments)) return [];

  return attachments
    .map((item) => ({
      name: String(item?.name || '').trim(),
      size: String(item?.size || '').trim(),
      url: String(item?.url || '').trim(),
      publicId: String(item?.publicId || '').trim(),
      format: String(item?.format || '').trim(),
      resourceType: String(item?.resourceType || '').trim(),
      mimeType: String(item?.mimeType || '').trim(),
      sizeBytes: Number(item?.sizeBytes) || undefined,
      uploadedAt: item?.uploadedAt ? new Date(item.uploadedAt) : undefined,
    }))
    .filter((item) => item.name);
};

const normalizeGrades = (value) => {
  const grades = normalizeArray(value);
  if (!grades.length) return [];
  const filtered = grades.filter((item) => String(item).toLowerCase() !== 'all grades');
  return filtered.length ? filtered : [];
};

const resolveAttachmentFormat = (file, uploaded) => {
  const fromUpload = String(uploaded?.format || '').trim();
  if (fromUpload) return fromUpload;
  const name = String(file?.originalname || '').trim();
  const ext = name.includes('.') ? name.split('.').pop().toLowerCase() : '';
  if (ext) return ext;
  const mime = String(file?.mimetype || '').toLowerCase();
  if (mime === 'application/pdf') return 'pdf';
  if (mime === 'image/jpeg') return 'jpg';
  if (mime === 'image/jpg') return 'jpg';
  if (mime === 'image/png') return 'png';
  return '';
};

const resolveAttachmentMimeType = (file, uploaded) => {
  const fromUpload = String(uploaded?.mimeType || '').trim();
  if (fromUpload) return fromUpload;
  const mime = String(file?.mimetype || '').trim();
  return mime;
};

const resolveAttachmentResourceType = (file, uploaded) => {
  const fromUpload = String(uploaded?.resourceType || '').trim();
  if (fromUpload) return fromUpload;
  const mime = String(file?.mimetype || '').toLowerCase();
  if (mime.startsWith('image/')) return 'image';
  return 'raw';
};

const resolveRecipients = async ({ visibleFor, grades }) => {
  const recipients = new Map();
  const gradeFilter = grades.length ? { grade: { $in: grades } } : {};

  if (visibleFor.includes(ROLES.STUDENT)) {
    const students = await StudentProfile.find({ userId: { $ne: null }, ...gradeFilter }).select('userId');
    const studentIds = students.map((item) => item.userId).filter(Boolean);
    if (studentIds.length) {
      const users = await User.find({ _id: { $in: studentIds } }).select('email role name');
      users.forEach((user) => {
        recipients.set(String(user._id), {
          userId: user._id,
          role: user.role,
          email: user.email,
          name: user.name,
        });
      });
    }
  }

  if (visibleFor.includes(ROLES.PARENT)) {
    let parents = [];
    if (grades.length) {
      const students = await StudentProfile.find({ parentId: { $ne: null }, ...gradeFilter }).select('parentId');
      const parentIds = [...new Set(students.map((item) => item.parentId).filter(Boolean))];
      if (parentIds.length) {
        parents = await Parent.find({ _id: { $in: parentIds }, userId: { $ne: null } }).select('userId');
      }
    } else {
      parents = await Parent.find({ userId: { $ne: null } }).select('userId');
    }

    const parentUserIds = parents.map((item) => item.userId).filter(Boolean);
    if (parentUserIds.length) {
      const users = await User.find({ _id: { $in: parentUserIds } }).select('email role name');
      users.forEach((user) => {
        recipients.set(String(user._id), {
          userId: user._id,
          role: user.role,
          email: user.email,
          name: user.name,
        });
      });
    }
  }

  if (visibleFor.includes(ROLES.TEACHER)) {
    const teachers = await Teacher.find({ userId: { $ne: null } }).select('userId');
    const teacherIds = teachers.map((item) => item.userId).filter(Boolean);
    if (teacherIds.length) {
      const users = await User.find({ _id: { $in: teacherIds } }).select('email role name');
      users.forEach((user) => {
        recipients.set(String(user._id), {
          userId: user._id,
          role: user.role,
          email: user.email,
          name: user.name,
        });
      });
    }
  }

  if (visibleFor.includes(ROLES.ADMIN)) {
    const users = await User.find({ role: { $in: [ROLES.ADMIN, ROLES.SUPER_ADMIN] } }).select('email role name');
    users.forEach((user) => {
      recipients.set(String(user._id), {
        userId: user._id,
        role: user.role,
        email: user.email,
        name: user.name,
      });
    });
  }

  return Array.from(recipients.values());
};

const sendNoticeEmails = async ({ notice, recipients }) => {
  if (!recipients.length) return;
  const portalUrl = process.env.FRONTEND_URL || '';
  const batchSize = 50;
  for (let i = 0; i < recipients.length; i += batchSize) {
    const batch = recipients.slice(i, i + batchSize).filter((item) => item.email);
    // eslint-disable-next-line no-await-in-loop
    await Promise.allSettled(
      batch.map((recipient) =>
        sendNoticeEmail({
          to: recipient.email,
          recipientName: recipient.name,
          title: notice.title,
          content: notice.content,
          portalUrl,
        })
      )
    );
  }
};

const listNotices = async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 28));
    const skip = (page - 1) * limit;

    const filter = {};

    const q = String(req.query.q || '').trim();
    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: 'i' } },
        { content: { $regex: q, $options: 'i' } },
        { createdByName: { $regex: q, $options: 'i' } },
      ];
    }

    const status = String(req.query.status || '').trim().toUpperCase();
    if (status && VALID_STATUS.includes(status)) {
      filter.status = status;
    }

    const audience = String(req.query.audience || '').trim().toUpperCase();
    if (audience && VALID_ROLES.includes(audience)) {
      filter.visibleFor = audience;
    }

    const grade = String(req.query.grade || '').trim();
    if (grade) {
      filter.grades = grade;
    }

    const [items, total] = await Promise.all([
      Notice.find(filter)
        .populate('createdBy', 'name email role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Notice.countDocuments(filter),
    ]);

    return res.json({
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const createNotice = async (req, res) => {
  let created = null;
  let uploadedAttachments = [];
  try {
    if (!ALLOWED_CREATE_ROLES.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden: insufficient role' });
    }

    const title = String(req.body.title || '').trim();
    const content = String(req.body.content || '').trim();

    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }

    const status = normalizeStatus(req.body.status);
    const scheduledAt = req.body.scheduledAt ? new Date(req.body.scheduledAt) : null;
    if (status === 'SCHEDULED' && (!scheduledAt || Number.isNaN(scheduledAt.getTime()))) {
      return res.status(400).json({ message: 'Valid schedule date is required for scheduled notices' });
    }

    const visibleFor = normalizeArray(req.body.visibleFor)
      .map((item) => item.toUpperCase())
      .filter((item) => VALID_ROLES.includes(item));
    if (!visibleFor.length) {
      return res.status(400).json({ message: 'At least one target audience is required' });
    }

    const grades = normalizeGrades(req.body.grades);
    const channels = normalizeChannels(req.body.channels);
    let bodyAttachments = [];
    if (req.body.attachments) {
      if (Array.isArray(req.body.attachments)) {
        bodyAttachments = normalizeAttachments(req.body.attachments);
      } else if (typeof req.body.attachments === 'string') {
        const trimmed = req.body.attachments.trim();
        if (trimmed.startsWith('[')) {
          try {
            bodyAttachments = normalizeAttachments(JSON.parse(trimmed));
          } catch (_error) {
            bodyAttachments = [];
          }
        }
      }
    }
    const files = Array.isArray(req.files) ? req.files : [];

    if (files.length && !isCloudinaryConfigured()) {
      return res.status(400).json({ message: 'Cloudinary configuration is required to upload attachments' });
    }

    created = await Notice.create({
      title,
      content,
      status,
      visibleFor,
      grades,
      channels,
      attachments: files.length ? [] : bodyAttachments,
      publishedAt: status === 'PUBLISHED' ? new Date() : null,
      scheduledAt: status === 'SCHEDULED' ? scheduledAt : null,
      createdBy: req.user._id,
      createdByName: String(req.user?.name || req.user?.email || '').trim(),
    });

    if (files.length) {
      const folder = `${getCloudinaryFolder('notice')}/${created._id}`;
      const publicIdPrefix = `notice-${slugify(created._id) || created._id}`;
      for (const file of files) {
        const uploaded = await uploadFileToCloudinary({
          file,
          folder,
          publicIdPrefix,
        });
        if (uploaded) {
          const format = resolveAttachmentFormat(file, uploaded);
          const mimeType = resolveAttachmentMimeType(file, uploaded);
          const resourceType = resolveAttachmentResourceType(file, uploaded);
          uploadedAttachments.push({
            name: file.originalname,
            size: `${Math.max(1, Math.round(file.size / 1024))} KB`,
            sizeBytes: file.size,
            url: uploaded.url,
            publicId: uploaded.publicId,
            format,
            resourceType,
            mimeType,
            uploadedAt: new Date(),
          });
        }
      }
      created.attachments = uploadedAttachments;
      await created.save();
    }

    if (status === 'PUBLISHED') {
      const recipients = await resolveRecipients({ visibleFor, grades });
      if (channels.includes('EMAIL')) {
        await sendNoticeEmails({ notice: created, recipients });
      }
    }

    const hydrated = await Notice.findById(created._id).populate('createdBy', 'name email role');
    return res.status(201).json(hydrated);
  } catch (error) {
    if (uploadedAttachments.length) {
      await Promise.allSettled(
        uploadedAttachments.map((item) => deleteCloudinaryAsset(item.publicId, item.resourceType || 'raw'))
      );
    }
    if (created?._id) {
      await Notice.findByIdAndDelete(created._id).catch(() => {});
    }
    return res.status(500).json({ message: error.message });
  }
};

const updateNotice = async (req, res) => {
  let uploadedAttachments = [];
  try {
    if (!ALLOWED_CREATE_ROLES.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden: insufficient role' });
    }

    const notice = await Notice.findById(req.params.id);
    if (!notice) {
      return res.status(404).json({ message: 'Notice not found' });
    }

    if (notice.status !== 'DRAFT') {
      return res.status(400).json({ message: 'Only draft notices can be edited' });
    }

    const title = String(req.body.title || '').trim();
    const content = String(req.body.content || '').trim();
    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }

    const status = normalizeStatus(req.body.status);
    const scheduledAt = req.body.scheduledAt ? new Date(req.body.scheduledAt) : null;
    if (status === 'SCHEDULED' && (!scheduledAt || Number.isNaN(scheduledAt.getTime()))) {
      return res.status(400).json({ message: 'Valid schedule date is required for scheduled notices' });
    }

    const visibleFor = normalizeArray(req.body.visibleFor)
      .map((item) => item.toUpperCase())
      .filter((item) => VALID_ROLES.includes(item));
    if (!visibleFor.length) {
      return res.status(400).json({ message: 'At least one target audience is required' });
    }

    const grades = normalizeGrades(req.body.grades);
    const channels = normalizeChannels(req.body.channels);
    let bodyAttachments = [];
    const attachmentsPayload = req.body.existingAttachments || req.body.attachments;
    if (attachmentsPayload) {
      if (Array.isArray(attachmentsPayload)) {
        bodyAttachments = normalizeAttachments(attachmentsPayload);
      } else if (typeof attachmentsPayload === 'string') {
        const trimmed = attachmentsPayload.trim();
        if (trimmed.startsWith('[')) {
          try {
            bodyAttachments = normalizeAttachments(JSON.parse(trimmed));
          } catch (_error) {
            bodyAttachments = [];
          }
        }
      }
    }

    const files = Array.isArray(req.files) ? req.files : [];
    if (files.length && !isCloudinaryConfigured()) {
      return res.status(400).json({ message: 'Cloudinary configuration is required to upload attachments' });
    }

    if (files.length) {
      const folder = `${getCloudinaryFolder('notice')}/${notice._id}`;
      const publicIdPrefix = `notice-${slugify(notice._id) || notice._id}`;
      for (const file of files) {
        const uploaded = await uploadFileToCloudinary({
          file,
          folder,
          publicIdPrefix,
        });
        if (uploaded) {
          const format = resolveAttachmentFormat(file, uploaded);
          const mimeType = resolveAttachmentMimeType(file, uploaded);
          const resourceType = resolveAttachmentResourceType(file, uploaded);
          uploadedAttachments.push({
            name: file.originalname,
            size: `${Math.max(1, Math.round(file.size / 1024))} KB`,
            sizeBytes: file.size,
            url: uploaded.url,
            publicId: uploaded.publicId,
            format,
            resourceType,
            mimeType,
            uploadedAt: new Date(),
          });
        }
      }
    }

    const wasPublished = notice.status === 'PUBLISHED';
    notice.title = title;
    notice.content = content;
    notice.status = status;
    notice.visibleFor = visibleFor;
    notice.grades = grades;
    notice.channels = channels;
    notice.attachments = [...bodyAttachments, ...uploadedAttachments];
    notice.scheduledAt = status === 'SCHEDULED' ? scheduledAt : null;
    notice.publishedAt = status === 'PUBLISHED' ? new Date() : null;
    await notice.save();

    if (status === 'PUBLISHED' && !wasPublished) {
      const recipients = await resolveRecipients({ visibleFor, grades });
      if (channels.includes('EMAIL')) {
        await sendNoticeEmails({ notice, recipients });
      }
    }

    const hydrated = await Notice.findById(notice._id).populate('createdBy', 'name email role');
    return res.json(hydrated);
  } catch (error) {
    if (uploadedAttachments.length) {
      await Promise.allSettled(
        uploadedAttachments.map((item) => deleteCloudinaryAsset(item.publicId, item.resourceType || 'raw'))
      );
    }
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  listNotices,
  createNotice,
  updateNotice,
};
