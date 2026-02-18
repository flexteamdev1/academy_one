const AcademicYear = require('../models/AcademicYear');
const { ACADEMIC_YEAR_STATUS } = require('../constants/enums');

const startOfToday = () => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now;
};

const isPastAcademicYear = (academicYear) => {
  if (!academicYear?.endDate) return false;
  return new Date(academicYear.endDate).getTime() < startOfToday().getTime();
};

const getCurrentAcademicYear = async () => {
  const active = await AcademicYear.findOne({
    isActive: true,
    status: ACADEMIC_YEAR_STATUS.ACTIVE,
  }).sort({ startDate: -1 });

  if (active) return active;

  const now = new Date();
  return AcademicYear.findOne({
    status: ACADEMIC_YEAR_STATUS.ACTIVE,
    startDate: { $lte: now },
    endDate: { $gte: now },
  }).sort({ startDate: -1 });
};

const resolveAcademicYearFromRequest = async (req, { fallbackToCurrent = true } = {}) => {
  const fromHeader = String(req.headers['x-academic-year-id'] || '').trim();
  const fromQuery = String(req.query?.academicYearId || '').trim();

  const candidateId = fromHeader || (fromQuery && fromQuery !== 'ALL' ? fromQuery : '');
  if (candidateId) {
    const selected = await AcademicYear.findById(candidateId);
    if (!selected) {
      const error = new Error('Selected academic year not found');
      error.statusCode = 400;
      throw error;
    }
    return selected;
  }

  if (!fallbackToCurrent) return null;

  const current = await getCurrentAcademicYear();
  if (!current) {
    const error = new Error('No active academic year available');
    error.statusCode = 400;
    throw error;
  }

  return current;
};

const assertAcademicYearWritable = (academicYear) => {
  if (!academicYear) return;
  if (isPastAcademicYear(academicYear)) {
    const error = new Error('Past academic year data is locked');
    error.statusCode = 400;
    throw error;
  }
};

module.exports = {
  isPastAcademicYear,
  getCurrentAcademicYear,
  resolveAcademicYearFromRequest,
  assertAcademicYearWritable,
};
