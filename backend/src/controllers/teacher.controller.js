const Teacher = require('../models/Teacher');
const User = require('../models/User');
const { TEACHER_STATUS, USER_STATUS } = require('../constants/enums');
const { ROLES } = require('../constants/roles');
const {
  deleteCloudinaryAsset,
  getCloudinaryFolder,
  parseBoolean,
  slugify,
  uploadImageToCloudinary,
} = require('../utils/media');
const { sendCredentialsEmail } = require('../utils/mailer');

const normalizeSubjects = (subjects) => {
  if (Array.isArray(subjects)) {
    return subjects.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof subjects === 'string') {
    return subjects
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

const normalizeEmail = (value) => {
  if (value == null) return undefined;
  const trimmed = String(value).trim();
  return trimmed ? trimmed.toLowerCase() : undefined;
};

const randomPassword = (length = 10) => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%';
  let output = '';
  for (let i = 0; i < length; i += 1) {
    output += chars[Math.floor(Math.random() * chars.length)];
  }
  return output;
};

const employeePattern = /^TE-(\d{4})-(\d{4})$/;

const generateEmployeeId = async () => {
  const year = new Date().getFullYear();
  const prefix = `TE-${year}-`;

  const latest = await Teacher.findOne({
    employeeId: { $regex: `^${prefix}` },
  })
    .sort({ createdAt: -1 })
    .select('employeeId');

  let seq = 1;
  const latestId = latest?.employeeId || '';
  const match = latestId.match(employeePattern);
  if (match && Number(match[1]) === year) {
    seq = Number(match[2]) + 1;
  }

  while (true) {
    const candidate = `${prefix}${String(seq).padStart(4, '0')}`;
    // eslint-disable-next-line no-await-in-loop
    const exists = await Teacher.exists({ employeeId: candidate });
    if (!exists) return candidate;
    seq += 1;
  }
};

const listTeachers = async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 12));
    const skip = (page - 1) * limit;

    const filter = {};

    if (req.query.status) {
      filter.status = String(req.query.status).toUpperCase();
    }

    if (req.query.q) {
      const q = String(req.query.q).trim();
      filter.$or = [
        { firstName: { $regex: q, $options: 'i' } },
        { lastName: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
        { employeeId: { $regex: q, $options: 'i' } },
        { qualification: { $regex: q, $options: 'i' } },
        { subjects: { $regex: q, $options: 'i' } },
      ];
    }

    const [items, total] = await Promise.all([
      Teacher.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Teacher.countDocuments(filter),
    ]);

    res.json({
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getTeacherStats = async (req, res) => {
  try {
    const teachers = await Teacher.find({}).select('status qualification subjects');

    const total = teachers.length;
    const active = teachers.filter((item) => item.status === TEACHER_STATUS.ACTIVE).length;
    const onLeave = teachers.filter((item) => item.status === TEACHER_STATUS.INACTIVE).length;

    const subjectSet = new Set();
    teachers.forEach((item) => {
      (item.subjects || []).forEach((subject) => subjectSet.add(subject));
    });

    const departments = subjectSet.size;
    const certified = total === 0 ? 0 : Math.round((teachers.filter((item) => !!item.qualification).length / total) * 100);

    res.json({
      active,
      departments,
      certified,
      onLeave,
      total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createTeacher = async (req, res) => {
  let createdTeacherUser = false;
  let teacherUser = null;
  try {
    const normalizedEmail = normalizeEmail(req.body.email);
    if (normalizedEmail) {
      const emailExists = await Teacher.exists({ email: normalizedEmail });
      if (emailExists) {
        return res.status(400).json({ message: 'Teacher with same email already exists' });
      }
    }
    let generatedPassword = '';

    if (normalizedEmail) {
      const existingUser = await User.findOne({ email: normalizedEmail });
      if (existingUser && existingUser.role !== ROLES.TEACHER) {
        return res.status(400).json({ message: 'Email already exists with a non-teacher user account' });
      }

      if (existingUser) {
        const linkedTeacher = await Teacher.findOne({ userId: existingUser._id }).select('_id');
        if (linkedTeacher) {
          return res.status(400).json({ message: 'Teacher login already linked to another record' });
        }
        teacherUser = existingUser;
      } else {
        generatedPassword = randomPassword();
        teacherUser = await User.create({
          name: `${req.body.firstName || ''} ${req.body.lastName || ''}`.trim() || 'Teacher',
          email: normalizedEmail,
          phone: req.body.phone,
          password: generatedPassword,
          role: ROLES.TEACHER,
          status: USER_STATUS.ACTIVE,
          mustChangePassword: true,
        });
        createdTeacherUser = true;
      }
    }

    const teacherSlug = slugify(req.body.firstName) || 'teacher';
    const uploadedPhoto = await uploadImageToCloudinary({
      file: req.file,
      folder: getCloudinaryFolder('teacher'),
      publicIdPrefix: teacherSlug,
    });

    let created = null;
    let attempts = 0;
    while (!created && attempts < 3) {
      const employeeId = await generateEmployeeId();
      const payload = {
        employeeId,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: normalizedEmail,
        phone: req.body.phone,
        userId: teacherUser?._id,
        subjects: normalizeSubjects(req.body.subjects),
        qualification: req.body.qualification,
        experience: req.body.experience,
        joinedAt: req.body.joinedAt,
        profilePhotoUrl: uploadedPhoto?.url || req.body.profilePhotoUrl,
        profilePhotoPublicId: uploadedPhoto?.publicId,
        status: req.body.status ? String(req.body.status).toUpperCase() : undefined,
      };

      try {
        // eslint-disable-next-line no-await-in-loop
        created = await Teacher.create(payload);
      } catch (error) {
        if (error?.code === 11000 && error?.keyPattern?.employeeId) {
          attempts += 1;
          continue;
        }
        throw error;
      }
    }

    if (!created) {
      return res.status(409).json({ message: 'Unable to generate a unique employee ID. Please retry.' });
    }

    if (createdTeacherUser && normalizedEmail) {
      const portalUrl = process.env.TEACHER_PORTAL_URL || process.env.FRONTEND_URL || '';
      await sendCredentialsEmail({
        to: normalizedEmail,
        roleLabel: 'Teacher',
        loginId: normalizedEmail,
        password: generatedPassword,
        templateType: 'teacher',
        recipientName: `${req.body.firstName || ''} ${req.body.lastName || ''}`.trim() || 'Teacher',
        portalUrl,
      });
    }

    res.status(201).json(created);
  } catch (error) {
    console.error('Error creating teacher:', error);
    if (createdTeacherUser && teacherUser?._id) {
      await User.findByIdAndDelete(teacherUser._id).catch(() => {});
    }
    if (error?.code === 11000 && error?.keyPattern?.email) {
      return res.status(400).json({ message: 'Teacher with same email already exists' });
    }
    if (error?.code === 11000) {
      if (error?.keyPattern?.employeeId) {
        return res.status(400).json({ message: 'Teacher with same employee ID already exists' });
      }
      return res.status(400).json({ message: 'Teacher with same email or employee ID already exists' });
    }
    res.status(500).json({ message: error.message });
  }
};

const updateTeacher = async (req, res) => {
  try {
    const existing = await Teacher.findById(req.params.id);

    if (!existing) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    const teacherSlug = slugify(existing.employeeId || req.body.firstName || existing.firstName) || 'teacher';
    const uploadedPhoto = await uploadImageToCloudinary({
      file: req.file,
      folder: getCloudinaryFolder('teacher'),
      publicIdPrefix: teacherSlug,
    });

    if (uploadedPhoto && existing.profilePhotoPublicId && existing.profilePhotoPublicId !== uploadedPhoto.publicId) {
      await deleteCloudinaryAsset(existing.profilePhotoPublicId);
    }

    const removeProfilePhoto = parseBoolean(req.body.removeProfilePhoto);

    const updateData = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: normalizeEmail(req.body.email),
      phone: req.body.phone,
      subjects: req.body.subjects == null ? undefined : normalizeSubjects(req.body.subjects),
      qualification: req.body.qualification,
      experience: req.body.experience,
      joinedAt: req.body.joinedAt,
      profilePhotoUrl: uploadedPhoto?.url || (removeProfilePhoto ? null : req.body.profilePhotoUrl),
      profilePhotoPublicId: uploadedPhoto?.publicId || (removeProfilePhoto ? null : undefined),
      status: req.body.status ? String(req.body.status).toUpperCase() : undefined,
    };

    if (!uploadedPhoto && !removeProfilePhoto) {
      delete updateData.profilePhotoUrl;
      delete updateData.profilePhotoPublicId;
    }

    if (removeProfilePhoto && existing.profilePhotoPublicId) {
      await deleteCloudinaryAsset(existing.profilePhotoPublicId);
    }

    Object.keys(updateData).forEach((key) => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    const updated = await Teacher.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });

    res.json(updated);
  } catch (error) {
    if (error?.code === 11000) {
      if (error?.keyPattern?.email) {
        return res.status(400).json({ message: 'Teacher with same email already exists' });
      }
      if (error?.keyPattern?.employeeId) {
        return res.status(400).json({ message: 'Teacher with same employee ID already exists' });
      }
      return res.status(400).json({ message: 'Teacher with same email or employee ID already exists' });
    }
    res.status(500).json({ message: error.message });
  }
};

const deleteTeacher = async (req, res) => {
  try {
    const deleted = await Teacher.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    await deleteCloudinaryAsset(deleted.profilePhotoPublicId);

    res.json({ message: 'Teacher deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  listTeachers,
  getTeacherStats,
  createTeacher,
  updateTeacher,
  deleteTeacher,
};
