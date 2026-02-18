const Notice = require('../models/Notice');
const { ROLES } = require('../constants/roles');

const ALLOWED_CREATE_ROLES = [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TEACHER];
const VALID_STATUS = ['PUBLISHED', 'DRAFT', 'SCHEDULED', 'ARCHIVED'];
const VALID_CHANNELS = ['IN_APP', 'EMAIL', 'SMS'];
const VALID_ROLES = Object.values(ROLES);

const normalizeArray = (value) => {
  if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean);
  if (typeof value === 'string') {
    return value.split(',').map((item) => item.trim()).filter(Boolean);
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
    }))
    .filter((item) => item.name);
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

    const created = await Notice.create({
      title,
      content,
      status,
      visibleFor,
      grades: normalizeArray(req.body.grades),
      channels: normalizeChannels(req.body.channels),
      attachments: normalizeAttachments(req.body.attachments),
      publishedAt: status === 'PUBLISHED' ? new Date() : null,
      scheduledAt: status === 'SCHEDULED' ? scheduledAt : null,
      createdBy: req.user._id,
      createdByName: String(req.user?.name || req.user?.email || '').trim(),
    });

    const hydrated = await Notice.findById(created._id).populate('createdBy', 'name email role');
    return res.status(201).json(hydrated);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  listNotices,
  createNotice,
};
