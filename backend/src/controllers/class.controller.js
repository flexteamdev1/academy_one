const ClassModel = require('../models/Class');
const AcademicYear = require('../models/AcademicYear');
const Teacher = require('../models/Teacher');
const StudentProfile = require('../models/StudentProfile');
const { ACADEMIC_YEAR_STATUS, CLASS_STATUS, SECTION_STATUS, TEACHER_STATUS } = require('../constants/enums');
const { ROLES } = require('../constants/roles');
const {
  assertAcademicYearWritable,
  isPastAcademicYear,
  resolveAcademicYearFromRequest,
} = require('../utils/academicYear');

const normalizeSections = (value) => {
  const list = Array.isArray(value) ? value : [];

  const normalized = list
    .map((item) => ({
      name: String(item?.name || '').trim().toUpperCase(),
      capacity: Number(item?.capacity) || 40,
      classTeacherId: item?.classTeacherId || null,
      status: String(item?.status || SECTION_STATUS.ACTIVE).toUpperCase(),
    }))
    .filter((item) => !!item.name);

  const uniqueNames = new Set();

  return normalized.filter((item) => {
    if (uniqueNames.has(item.name)) return false;
    uniqueNames.add(item.name);
    return true;
  });
};

const parseSections = (value) => {
  if (Array.isArray(value)) {
    return normalizeSections(value);
  }

  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return normalizeSections(parsed);
      }
    } catch (_error) {
      return [];
    }
  }

  return [];
};

const parseStatus = (value) => {
  if (!value) return undefined;
  return String(value).toUpperCase();
};

const getAcademicYearByIdOrFallback = async (academicYearId) => {
  if (academicYearId) {
    const selected = await AcademicYear.findById(academicYearId);
    if (!selected) {
      const error = new Error('Academic year not found');
      error.statusCode = 400;
      throw error;
    }

    return selected;
  }

  const now = new Date();

  const active = await AcademicYear.findOne({ isActive: true, status: ACADEMIC_YEAR_STATUS.ACTIVE }).sort({ startDate: -1 });
  if (active) return active;

  const current = await AcademicYear.findOne({
    status: ACADEMIC_YEAR_STATUS.ACTIVE,
    startDate: { $lte: now },
    endDate: { $gte: now },
  }).sort({ startDate: -1 });

  if (current) return current;

  const startYear = now.getMonth() >= 5 ? now.getFullYear() : now.getFullYear() - 1;
  const endYear = startYear + 1;
  const label = `${startYear}-${String(endYear).slice(-2)}`;

  let year = await AcademicYear.findOne({ name: label });

  if (!year) {
    year = await AcademicYear.create({
      name: label,
      startDate: new Date(startYear, 5, 1),
      endDate: new Date(endYear, 3, 30),
      status: ACADEMIC_YEAR_STATUS.ACTIVE,
      isActive: true,
    });
  }

  return year;
};

const listClasses = async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    const filter = {};
    let teacherId = null;

    if (req.query.status && req.query.status !== 'ALL') {
      filter.status = String(req.query.status).toUpperCase();
    }

    const selectedYear = await resolveAcademicYearFromRequest(req, { fallbackToCurrent: true });

    if (req.query.academicYearId && req.query.academicYearId !== 'ALL') {
      filter.academicYearId = req.query.academicYearId;
    } else if (selectedYear?._id) {
      filter.academicYearId = selectedYear._id;
    }

    if (req.query.q) {
      const q = String(req.query.q).trim();
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { 'sections.name': { $regex: q, $options: 'i' } },
      ];
    }

    if (req.user?.role === ROLES.TEACHER) {
      const teacher = await Teacher.findOne({ userId: req.user._id }).select('_id');
      if (!teacher) {
        return res.json({
          items: [],
          pagination: {
            page,
            limit,
            total: 0,
            totalPages: 1,
          },
        });
      }
      teacherId = teacher._id;
      filter.$and = filter.$and || [];
      filter.$and.push({ 'sections.classTeacherId': teacherId });
    }

    const [items, total] = await Promise.all([
      ClassModel.find(filter)
        .populate('academicYearId', 'name isActive status')
        .populate('sections.classTeacherId', 'firstName lastName employeeId status profilePhotoUrl')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      ClassModel.countDocuments(filter),
    ]);

    const classIds = items.map((item) => item._id);
    const studentCountsRaw = classIds.length
      ? await StudentProfile.aggregate([
        { $match: { classId: { $in: classIds } } },
        { $group: { _id: '$classId', count: { $sum: 1 } } },
      ])
      : [];

    const studentCountMap = new Map(studentCountsRaw.map((entry) => [String(entry._id), entry.count]));

    const serialized = items.map((item) => {
      const raw = item.toObject();
      const filteredSections = teacherId
        ? (raw.sections || []).filter((section) => String(section.classTeacherId?._id || section.classTeacherId || '') === String(teacherId))
        : (raw.sections || []);

      return {
        ...raw,
        sections: filteredSections,
        studentCount: studentCountMap.get(String(item._id)) || 0,
        sectionCount: filteredSections.length,
        totalCapacity: filteredSections.reduce((sum, section) => sum + (Number(section.capacity) || 0), 0),
      };
    });

    res.json({
      items: serialized,
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

const getClassStats = async (req, res) => {
  try {
    const selectedYear = await resolveAcademicYearFromRequest(req, { fallbackToCurrent: true });
    const filter = selectedYear?._id ? { academicYearId: selectedYear._id } : {};
    const classes = await ClassModel.find(filter).select('status sections');

    const total = classes.length;
    const active = classes.filter((item) => item.status === CLASS_STATUS.ACTIVE).length;
    const inactive = total - active;

    let totalSections = 0;
    let totalCapacity = 0;
    let sectionsWithTeacher = 0;

    classes.forEach((item) => {
      const sections = item.sections || [];
      totalSections += sections.length;

      sections.forEach((section) => {
        totalCapacity += Number(section.capacity) || 0;
        if (section.classTeacherId) sectionsWithTeacher += 1;
      });
    });

    const assignedStudents = await StudentProfile.countDocuments({ classId: { $ne: null } });

    res.json({
      total,
      active,
      inactive,
      totalSections,
      totalCapacity,
      assignedStudents,
      teacherCoverage: totalSections === 0 ? 0 : Math.round((sectionsWithTeacher / totalSections) * 100),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getClassMeta = async (_req, res) => {
  try {
    const today = new Date();
    const [academicYears, teachers] = await Promise.all([
      AcademicYear.find({
        status: ACADEMIC_YEAR_STATUS.ACTIVE,
        endDate: { $gte: today },
      }).sort({ startDate: -1 }).select('name isActive startDate endDate'),
      Teacher.find({ status: TEACHER_STATUS.ACTIVE })
        .sort({ firstName: 1, lastName: 1 })
        .select('firstName lastName employeeId'),
    ]);

    res.json({ academicYears, teachers });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createClass = async (req, res) => {
  try {
    const name = String(req.body.name || '').trim();
    const sections = parseSections(req.body.sections);

    if (!name) {
      return res.status(400).json({ message: 'Class name is required' });
    }

    if (!sections.length) {
      return res.status(400).json({ message: 'At least one section is required' });
    }

    const academicYear = req.body.academicYearId
      ? await getAcademicYearByIdOrFallback(req.body.academicYearId)
      : await resolveAcademicYearFromRequest(req, { fallbackToCurrent: true });
    assertAcademicYearWritable(academicYear);

    const payload = {
      name,
      academicYearId: academicYear._id,
      status: parseStatus(req.body.status) || CLASS_STATUS.ACTIVE,
      sections,
    };

    const created = await ClassModel.create(payload);
    const hydrated = await ClassModel.findById(created._id)
      .populate('academicYearId', 'name isActive status')
      .populate('sections.classTeacherId', 'firstName lastName employeeId status profilePhotoUrl');

    res.status(201).json(hydrated);
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(400).json({ message: 'Class with same name and section already exists for this academic year' });
    }

    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ message: error.message });
  }
};

const updateClass = async (req, res) => {
  try {
    const existing = await ClassModel.findById(req.params.id);

    if (!existing) {
      return res.status(404).json({ message: 'Class not found' });
    }

    const nextSections = req.body.sections == null ? existing.sections : parseSections(req.body.sections);

    if (!nextSections.length) {
      return res.status(400).json({ message: 'At least one section is required' });
    }

    const existingYear = await AcademicYear.findById(existing.academicYearId);
    assertAcademicYearWritable(existingYear);

    let academicYearId = existing.academicYearId;
    if (req.body.academicYearId) {
      const selected = await getAcademicYearByIdOrFallback(req.body.academicYearId);
      assertAcademicYearWritable(selected);
      academicYearId = selected._id;
    }

    const updateData = {
      name: req.body.name ? String(req.body.name).trim() : existing.name,
      status: parseStatus(req.body.status) || existing.status,
      academicYearId,
      sections: nextSections,
    };

    const updated = await ClassModel.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate('academicYearId', 'name isActive status')
      .populate('sections.classTeacherId', 'firstName lastName employeeId status profilePhotoUrl');

    res.json(updated);
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(400).json({ message: 'Class with same name and section already exists for this academic year' });
    }

    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ message: error.message });
  }
};

const deleteClass = async (req, res) => {
  try {
    const existing = await ClassModel.findById(req.params.id).select('academicYearId');
    if (!existing) {
      return res.status(404).json({ message: 'Class not found' });
    }

    const year = await AcademicYear.findById(existing.academicYearId);
    if (year && isPastAcademicYear(year)) {
      return res.status(400).json({ message: 'Past academic year data is locked' });
    }

    const assignedStudents = await StudentProfile.countDocuments({ classId: req.params.id });
    if (assignedStudents > 0) {
      return res.status(400).json({ message: 'Cannot delete class with assigned students' });
    }

    const deleted = await ClassModel.findByIdAndDelete(req.params.id);

    res.json({ message: 'Class deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  listClasses,
  getClassStats,
  getClassMeta,
  createClass,
  updateClass,
  deleteClass,
};
