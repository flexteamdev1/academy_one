const Parent = require('../models/Parent');
const StudentProfile = require('../models/StudentProfile');
const Enrollment = require('../models/Enrollment');
const User = require('../models/User');
const ClassModel = require('../models/Class');
const AcademicYear = require('../models/AcademicYear');
const { ROLES } = require('../constants/roles');
const { STUDENT_STATUS, USER_STATUS } = require('../constants/enums');
const {
  assertAcademicYearWritable,
  isPastAcademicYear,
  resolveAcademicYearFromRequest,
} = require('../utils/academicYear');
const {
  deleteCloudinaryAsset,
  getCloudinaryFolder,
  parseBoolean,
  slugify,
  uploadImageToCloudinary,
} = require('../utils/media');
const { sendCredentialsEmail } = require('../utils/mailer');

const normalizeEmail = (value) => {
  return String(value || '').trim().toLowerCase();
};

const randomPassword = (length = 10) => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%';
  let output = '';
  for (let i = 0; i < length; i += 1) {
    output += chars[Math.floor(Math.random() * chars.length)];
  }
  return output;
};

const admissionPattern = /^ST-(\d{4})-(\d{4})$/;

const generateAdmissionNo = async () => {
  const year = new Date().getFullYear();
  const prefix = `ST-${year}-`;

  const latest = await StudentProfile.findOne({
    admissionNo: { $regex: `^${prefix}` },
  })
    .sort({ createdAt: -1 })
    .select('admissionNo');

  let seq = 1;
  const latestNo = latest?.admissionNo || '';
  const match = latestNo.match(admissionPattern);
  if (match && Number(match[1]) === year) {
    seq = Number(match[2]) + 1;
  }

  // Handle rare collisions by probing forward.
  while (true) {
    const candidate = `${prefix}${String(seq).padStart(4, '0')}`;
    // eslint-disable-next-line no-await-in-loop
    const exists = await StudentProfile.exists({ admissionNo: candidate });
    if (!exists) return candidate;
    seq += 1;
  }
};

const listStudents = async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 12));
    const skip = (page - 1) * limit;

    const filter = {};

    if (req.query.status && req.query.status !== 'ALL') {
      filter.status = String(req.query.status).toUpperCase();
    }

    if (req.query.grade && req.query.grade !== 'ALL') {
      filter.grade = req.query.grade;
    }

    if (req.query.section && req.query.section !== 'ALL') {
      filter.sectionName = String(req.query.section).toUpperCase();
    }

    const selectedYear = await resolveAcademicYearFromRequest(req, { fallbackToCurrent: true });
    if (selectedYear?._id) {
      const scopedClassIds = await ClassModel.find({ academicYearId: selectedYear._id }).distinct('_id');
      filter.$and = filter.$and || [];
      filter.$and.push({
        $or: [
          { academicYearId: selectedYear._id },
          { classId: { $in: scopedClassIds } },
        ],
      });
    }

    if (req.query.q) {
      const q = String(req.query.q).trim();
      filter.$or = [
        { admissionNo: { $regex: q, $options: 'i' } },
        { name: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
        { grade: { $regex: q, $options: 'i' } },
        { sectionName: { $regex: q, $options: 'i' } },
      ];
    }

    const [items, total] = await Promise.all([
      StudentProfile.find(filter)
        .populate('parentId', 'firstName lastName email phone relation')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      StudentProfile.countDocuments(filter),
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

const getStudentStats = async (req, res) => {
  try {
    const selectedYear = await resolveAcademicYearFromRequest(req, { fallbackToCurrent: true });
    const scopedClassIds = selectedYear?._id
      ? await ClassModel.find({ academicYearId: selectedYear._id }).distinct('_id')
      : [];
    const yearFilter = selectedYear?._id
      ? {
        $or: [
          { academicYearId: selectedYear._id },
          { classId: { $in: scopedClassIds } },
        ],
      }
      : {};

    const [total, active, dropped, passout] = await Promise.all([
      StudentProfile.countDocuments(yearFilter),
      StudentProfile.countDocuments({ ...yearFilter, status: STUDENT_STATUS.ACTIVE }),
      StudentProfile.countDocuments({ ...yearFilter, status: STUDENT_STATUS.DROPPED }),
      StudentProfile.countDocuments({ ...yearFilter, status: STUDENT_STATUS.PASSED_OUT }),
    ]);

    const inactive = dropped + passout;
    const attendanceRate = total === 0 ? 0 : Math.round((active / total) * 100);
    const verified = total === 0 ? 0 : Math.round(((active + passout) / total) * 100);

    res.json({
      total,
      active,
      inactive,
      attendanceRate,
      verifiedProfiles: verified,
      newEnrollments: active,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMyStudents = async (req, res) => {
  try {
    const selectedYear = await resolveAcademicYearFromRequest(req, { fallbackToCurrent: true });
    const scopedClassIds = selectedYear?._id
      ? await ClassModel.find({ academicYearId: selectedYear._id }).distinct('_id')
      : [];
    const yearScope = selectedYear?._id
      ? {
        $or: [
          { academicYearId: selectedYear._id },
          { classId: { $in: scopedClassIds } },
        ],
      }
      : {};

    if (req.user.role === ROLES.STUDENT) {
      const student = await StudentProfile.findOne({ userId: req.user._id, ...yearScope }).populate(
        'parentId',
        'firstName lastName email phone relation'
      );

      if (!student) {
        return res.status(404).json({ message: 'Student profile not found' });
      }

      return res.json({ mode: 'student', items: [student] });
    }

    if (req.user.role === ROLES.PARENT) {
      const parent = await Parent.findOne({ userId: req.user._id }).select('_id');
      if (!parent) {
        return res.status(404).json({ message: 'Parent profile not found' });
      }

      const children = await StudentProfile.find({ parentId: parent._id, ...yearScope }).populate(
        'parentId',
        'firstName lastName email phone relation'
      );

      return res.json({ mode: 'parent', items: children });
    }

    return res.status(403).json({ message: 'Access denied' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const createStudent = async (req, res) => {
  let uploadedPhoto = null;
  let studentUser = null;
  let parentUser = null;
  let parentProfile = null;
  let studentProfile = null;
  let createdStudentUser = false;
  let createdParentUser = false;
  let createdParentProfile = false;

  try {
    const selectedYear = await resolveAcademicYearFromRequest(req, { fallbackToCurrent: true });
    assertAcademicYearWritable(selectedYear);

    const studentName = String(req.body.name || '').trim();
    const gender = String(req.body.gender || '').toUpperCase().trim();
    const dob = req.body.dob;
    const grade = String(req.body.grade || '').trim();
    const sectionName = String(req.body.sectionName || '').toUpperCase().trim();

    const parentFirstName = String(req.body.parentFirstName || '').trim();
    const parentLastName = String(req.body.parentLastName || '').trim();
    const parentEmail = normalizeEmail(req.body.parentEmail);
    const parentPhone = String(req.body.parentPhone || '').trim();
    const parentRelation = String(req.body.parentRelation || '').trim();
    const parentOccupation = String(req.body.parentOccupation || '').trim();
    const parentEmergencyContact = String(req.body.parentEmergencyContact || '').trim();

    const studentEmailInput = normalizeEmail(req.body.email);

    if (!studentName || !gender || !dob || !grade || !sectionName) {
      return res.status(400).json({ message: 'Student name, gender, dob, grade, and section are required' });
    }

    if (!parentFirstName || !parentEmail) {
      return res.status(400).json({ message: 'Parent first name and parent email are required' });
    }

    const admissionNo = await generateAdmissionNo();

    const studentSlug = slugify(admissionNo || studentName) || 'student';
    uploadedPhoto = await uploadImageToCloudinary({
      file: req.file,
      folder: getCloudinaryFolder('student'),
      publicIdPrefix: studentSlug,
    });

    const parentExistingUser = await User.findOne({ email: parentEmail });
    if (parentExistingUser && parentExistingUser.role !== ROLES.PARENT) {
      return res.status(400).json({ message: 'Parent email already exists with a non-parent user account' });
    }

    const studentLoginId =
      studentEmailInput && studentEmailInput !== parentEmail
        ? studentEmailInput
        : `${admissionNo.toLowerCase()}@student.local`;

    const studentExisting = await User.findOne({ email: studentLoginId });
    if (studentExisting) {
      return res.status(400).json({ message: 'Unable to generate unique student login. Please retry.' });
    }

    const studentPassword = randomPassword();
    const parentPassword = randomPassword();

    studentUser = await User.create({
      name: studentName,
      email: studentLoginId,
      password: studentPassword,
      role: ROLES.STUDENT,
      status: USER_STATUS.ACTIVE,
      mustChangePassword: true,
    });
    createdStudentUser = true;

    if (parentExistingUser) {
      parentUser = parentExistingUser;
    } else {
      parentUser = await User.create({
        name: `${parentFirstName} ${parentLastName}`.trim(),
        email: parentEmail,
        phone: parentPhone || undefined,
        password: parentPassword,
        role: ROLES.PARENT,
        status: USER_STATUS.ACTIVE,
        mustChangePassword: true,
      });
      createdParentUser = true;
    }

    parentProfile =
      (await Parent.findOne({ userId: parentUser._id })) ||
      (await Parent.findOne({ email: parentEmail }));

    if (!parentProfile) {
      parentProfile = await Parent.create({
        userId: parentUser._id,
        firstName: parentFirstName,
        lastName: parentLastName,
        email: parentEmail,
        phone: parentPhone,
        relation: parentRelation,
        occupation: parentOccupation,
        emergencyContact: parentEmergencyContact,
        children: [],
      });
      createdParentProfile = true;
    } else {
      parentProfile.firstName = parentFirstName || parentProfile.firstName;
      parentProfile.lastName = parentLastName || parentProfile.lastName;
      parentProfile.phone = parentPhone || parentProfile.phone;
      parentProfile.relation = parentRelation || parentProfile.relation;
      parentProfile.occupation = parentOccupation || parentProfile.occupation;
      parentProfile.emergencyContact = parentEmergencyContact || parentProfile.emergencyContact;
      if (!parentProfile.userId) parentProfile.userId = parentUser._id;
      await parentProfile.save();
    }

    let resolvedAcademicYearId = selectedYear?._id || null;

    if (req.body.classId) {
      const selectedClass = await ClassModel.findById(req.body.classId).select('academicYearId');
      if (!selectedClass) {
        return res.status(400).json({ message: 'Selected class not found' });
      }

      if (selectedYear?._id && String(selectedClass.academicYearId) !== String(selectedYear._id)) {
        return res.status(400).json({ message: 'Selected class does not belong to current academic year scope' });
      }

      resolvedAcademicYearId = selectedClass.academicYearId;
    }

    studentProfile = await StudentProfile.create({
      admissionNo,
      name: studentName,
      email: studentEmailInput || null,
      gender,
      dob,
      classId: req.body.classId || undefined,
      grade,
      sectionName,
      userId: studentUser._id,
      academicYearId: resolvedAcademicYearId,
      parentId: parentProfile._id,
      profilePhotoUrl: uploadedPhoto?.url || req.body.profilePhotoUrl,
      profilePhotoPublicId: uploadedPhoto?.publicId,
      status: req.body.status ? String(req.body.status).toUpperCase() : STUDENT_STATUS.ACTIVE,
    });

    parentProfile.children = parentProfile.children || [];
    if (!parentProfile.children.some((id) => String(id) === String(studentProfile._id))) {
      parentProfile.children.push(studentProfile._id);
      await parentProfile.save();
    }

    if (studentProfile.classId && resolvedAcademicYearId) {
      let academicYearLabel = String(selectedYear?.name || '').trim();
      if (!academicYearLabel && resolvedAcademicYearId) {
        const yearRecord = await AcademicYear.findById(resolvedAcademicYearId).select('name');
        academicYearLabel = String(yearRecord?.name || '').trim();
      }
      if (!academicYearLabel) {
        academicYearLabel = String(new Date().getFullYear());
      }

      await Enrollment.create({
        studentId: studentProfile._id,
        classId: studentProfile.classId,
        academicYear: academicYearLabel,
      }).catch(() => {});
    }

    const studentRecipient = studentEmailInput || parentEmail;
    const studentPortalUrl = process.env.STUDENT_PORTAL_URL || process.env.FRONTEND_URL || '';
    const studentMail = await sendCredentialsEmail({
      to: studentRecipient,
      roleLabel: 'Student',
      loginId: studentLoginId,
      password: studentPassword,
      studentName,
      templateType: 'student',
      recipientName: studentName,
      systemId: admissionNo,
      portalUrl: studentPortalUrl,
    });

    let parentMail = { sent: false, reason: 'existing_parent_user' };
    if (!parentExistingUser) {
      const parentName = `${parentFirstName} ${parentLastName}`.trim();
      const parentPortalUrl = process.env.PARENT_PORTAL_URL || process.env.FRONTEND_URL || '';
      parentMail = await sendCredentialsEmail({
        to: parentEmail,
        roleLabel: 'Parent',
        loginId: parentEmail,
        password: parentPassword,
        studentName,
        templateType: 'parent',
        recipientName: parentName || parentFirstName,
        systemId: parentEmail,
        portalUrl: parentPortalUrl,
      });
    }

    res.status(201).json({
      student: studentProfile,
      parent: parentProfile,
      accountDispatch: {
        admissionNo,
        studentLoginId,
        studentCredentialEmailTo: studentRecipient,
        parentLoginId: parentEmail,
        parentCredentialEmailTo: parentEmail,
        studentMail,
        parentMail,
        studentPassword,
        parentPassword: parentExistingUser ? null : parentPassword,
      },
    });
  } catch (error) {
    if (studentProfile?._id) {
      await StudentProfile.findByIdAndDelete(studentProfile._id).catch(() => {});
    }
    if (createdParentProfile && parentProfile?._id) {
      await Parent.findByIdAndDelete(parentProfile._id).catch(() => {});
    }
    if (createdStudentUser && studentUser?._id) {
      await User.findByIdAndDelete(studentUser._id).catch(() => {});
    }
    if (createdParentUser && parentUser?._id) {
      await User.findByIdAndDelete(parentUser._id).catch(() => {});
    }
    if (uploadedPhoto?.publicId) {
      await deleteCloudinaryAsset(uploadedPhoto.publicId);
    }

    if (error?.code === 11000) {
      return res.status(400).json({ message: 'Duplicate data found while creating student. Please retry.' });
    }

    res.status(500).json({ message: error.message });
  }
};

const updateStudent = async (req, res) => {
  try {
    const existing = await StudentProfile.findById(req.params.id);

    if (!existing) {
      return res.status(404).json({ message: 'Student not found' });
    }

    if (existing.academicYearId) {
      const year = await AcademicYear.findById(existing.academicYearId);
      if (year && isPastAcademicYear(year)) {
        return res.status(400).json({ message: 'Past academic year data is locked' });
      }
    }

    const studentSlug = slugify(req.body.admissionNo || existing.admissionNo || req.body.name || existing.name) || 'student';
    const uploadedPhoto = await uploadImageToCloudinary({
      file: req.file,
      folder: getCloudinaryFolder('student'),
      publicIdPrefix: studentSlug,
    });

    if (uploadedPhoto && existing.profilePhotoPublicId && existing.profilePhotoPublicId !== uploadedPhoto.publicId) {
      await deleteCloudinaryAsset(existing.profilePhotoPublicId);
    }

    const removeProfilePhoto = parseBoolean(req.body.removeProfilePhoto);

    const updateData = {
      name: req.body.name,
      email: normalizeEmail(req.body.email) || undefined,
      gender: req.body.gender ? String(req.body.gender).toUpperCase() : undefined,
      dob: req.body.dob,
      classId: req.body.classId,
      academicYearId: undefined,
      grade: req.body.grade,
      sectionName: req.body.sectionName ? String(req.body.sectionName).toUpperCase() : undefined,
      profilePhotoUrl: uploadedPhoto?.url || (removeProfilePhoto ? null : req.body.profilePhotoUrl),
      profilePhotoPublicId: uploadedPhoto?.publicId || (removeProfilePhoto ? null : undefined),
      status: req.body.status ? String(req.body.status).toUpperCase() : undefined,
    };

    if (req.body.classId) {
      const selectedClass = await ClassModel.findById(req.body.classId).select('academicYearId');
      if (!selectedClass) {
        return res.status(400).json({ message: 'Selected class not found' });
      }
      const targetYear = await AcademicYear.findById(selectedClass.academicYearId);
      if (targetYear && isPastAcademicYear(targetYear)) {
        return res.status(400).json({ message: 'Past academic year data is locked' });
      }
      updateData.academicYearId = selectedClass.academicYearId;
    }

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

    const updated = await StudentProfile.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });

    res.json(updated);
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(400).json({ message: 'Student data conflicts with existing records' });
    }
    res.status(500).json({ message: error.message });
  }
};

const deleteStudent = async (req, res) => {
  try {
    const existing = await StudentProfile.findById(req.params.id);

    if (!existing) {
      return res.status(404).json({ message: 'Student not found' });
    }

    if (existing.academicYearId) {
      const year = await AcademicYear.findById(existing.academicYearId);
      if (year && isPastAcademicYear(year)) {
        return res.status(400).json({ message: 'Past academic year data is locked' });
      }
    }

    const deleted = await StudentProfile.findByIdAndDelete(req.params.id);

    await Parent.updateMany(
      { children: deleted._id },
      { $pull: { children: deleted._id } }
    );

    await Enrollment.deleteMany({ studentId: deleted._id }).catch(() => {});
    await User.findByIdAndDelete(deleted.userId).catch(() => {});
    await deleteCloudinaryAsset(deleted.profilePhotoPublicId);

    res.json({ message: 'Student deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  listStudents,
  getStudentStats,
  getMyStudents,
  createStudent,
  updateStudent,
  deleteStudent,
};
