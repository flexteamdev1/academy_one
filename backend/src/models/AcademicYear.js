const mongoose = require('mongoose');
const { ACADEMIC_YEAR_STATUS } = require('../constants/enums');

const academicYearSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true // 2025-26
  },

  startDate: {
    type: Date,
    required: true
  },

  endDate: {
    type: Date,
    required: true
  },

  isActive: {
    type: Boolean,
    default: false
  },

  status: {
    type: String,
    enum: Object.values(ACADEMIC_YEAR_STATUS),
    default: ACADEMIC_YEAR_STATUS.ACTIVE
  }

}, { timestamps: true });

module.exports = mongoose.model('AcademicYear', academicYearSchema);
