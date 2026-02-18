const AcademicYear = require('../models/AcademicYear');
const ClassModel = require('../models/Class');
const { ACADEMIC_YEAR_STATUS } = require('../constants/enums');
const { isPastAcademicYear } = require('../utils/academicYear');

const normalizeStatus = (value) => {
  if (!value) return undefined;
  return String(value).toUpperCase();
};

const ensureDateRange = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    const error = new Error('Valid start and end dates are required');
    error.statusCode = 400;
    throw error;
  }

  if (start >= end) {
    const error = new Error('Start date must be before end date');
    error.statusCode = 400;
    throw error;
  }

  return { start, end };
};

const listAcademicYears = async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    const filter = {};

    if (req.query.status && req.query.status !== 'ALL') {
      filter.status = String(req.query.status).toUpperCase();
    }

    if (req.query.isActive === 'true') {
      filter.isActive = true;
    }

    if (req.query.q) {
      const q = String(req.query.q).trim();
      filter.name = { $regex: q, $options: 'i' };
    }

    const [items, total] = await Promise.all([
      AcademicYear.find(filter).sort({ startDate: -1, createdAt: -1 }).skip(skip).limit(limit),
      AcademicYear.countDocuments(filter),
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

const getAcademicYearStats = async (_req, res) => {
  try {
    const now = new Date();

    const [total, active, archived] = await Promise.all([
      AcademicYear.countDocuments({}),
      AcademicYear.countDocuments({ status: ACADEMIC_YEAR_STATUS.ACTIVE }),
      AcademicYear.countDocuments({ status: ACADEMIC_YEAR_STATUS.ARCHIVED }),
    ]);

    const current = await AcademicYear.findOne({
      status: ACADEMIC_YEAR_STATUS.ACTIVE,
      startDate: { $lte: now },
      endDate: { $gte: now },
    }).select('_id');

    res.json({
      total,
      active,
      archived,
      current: current ? 1 : 0,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createAcademicYear = async (req, res) => {
  try {
    const name = String(req.body.name || '').trim();
    if (!name) {
      return res.status(400).json({ message: 'Academic year name is required' });
    }

    const { start, end } = ensureDateRange(req.body.startDate, req.body.endDate);
    const status = normalizeStatus(req.body.status) || ACADEMIC_YEAR_STATUS.ACTIVE;

    const existing = await AcademicYear.findOne({ name });
    if (existing) {
      return res.status(400).json({ message: 'Academic year name already exists' });
    }

    const total = await AcademicYear.countDocuments({});
    const requestedActive = req.body.isActive === true || req.body.isActive === 'true';
    const isActive = requestedActive || total === 0;

    if (isActive && new Date(end).getTime() < new Date().setHours(0, 0, 0, 0)) {
      return res.status(400).json({ message: 'Past academic year cannot be set as current' });
    }

    if (isActive) {
      await AcademicYear.updateMany({ isActive: true }, { $set: { isActive: false } });
    }

    const created = await AcademicYear.create({
      name,
      startDate: start,
      endDate: end,
      status,
      isActive,
    });

    res.status(201).json(created);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ message: error.message });
  }
};

const updateAcademicYear = async (req, res) => {
  try {
    const existing = await AcademicYear.findById(req.params.id);

    if (!existing) {
      return res.status(404).json({ message: 'Academic year not found' });
    }

    const nextName = req.body.name == null ? existing.name : String(req.body.name).trim();
    if (!nextName) {
      return res.status(400).json({ message: 'Academic year name is required' });
    }

    if (nextName !== existing.name) {
      const duplicate = await AcademicYear.findOne({ name: nextName });
      if (duplicate) {
        return res.status(400).json({ message: 'Academic year name already exists' });
      }
    }

    const nextStart = req.body.startDate || existing.startDate;
    const nextEnd = req.body.endDate || existing.endDate;
    const { start, end } = ensureDateRange(nextStart, nextEnd);

    const status = normalizeStatus(req.body.status) || existing.status;
    const isActive = req.body.isActive == null
      ? existing.isActive
      : req.body.isActive === true || req.body.isActive === 'true';

    if (isActive && new Date(end).getTime() < new Date().setHours(0, 0, 0, 0)) {
      return res.status(400).json({ message: 'Past academic year cannot be set as current' });
    }

    if (isActive) {
      await AcademicYear.updateMany({ _id: { $ne: existing._id }, isActive: true }, { $set: { isActive: false } });
    }

    const updated = await AcademicYear.findByIdAndUpdate(
      req.params.id,
      {
        name: nextName,
        startDate: start,
        endDate: end,
        status,
        isActive,
      },
      { new: true, runValidators: true }
    );

    res.json(updated);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ message: error.message });
  }
};

const activateAcademicYear = async (req, res) => {
  try {
    const existing = await AcademicYear.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ message: 'Academic year not found' });
    }

    if (isPastAcademicYear(existing)) {
      return res.status(400).json({ message: 'Past academic year cannot be activated' });
    }

    await AcademicYear.updateMany({}, { $set: { isActive: false } });
    existing.isActive = true;
    if (existing.status === ACADEMIC_YEAR_STATUS.ARCHIVED) {
      existing.status = ACADEMIC_YEAR_STATUS.ACTIVE;
    }
    await existing.save();

    res.json(existing);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteAcademicYear = async (req, res) => {
  try {
    const linkedClasses = await ClassModel.countDocuments({ academicYearId: req.params.id });
    if (linkedClasses > 0) {
      return res.status(400).json({ message: 'Cannot delete academic year linked to classes' });
    }

    const deleted = await AcademicYear.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: 'Academic year not found' });
    }

    res.json({ message: 'Academic year deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  listAcademicYears,
  getAcademicYearStats,
  createAcademicYear,
  updateAcademicYear,
  activateAcademicYear,
  deleteAcademicYear,
};
