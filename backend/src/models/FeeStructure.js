const mongoose = require('mongoose');
const { FEE_STATUS } = require('../constants/enums');

const feeSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true
  },

  academicYearId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "AcademicYear",
    required: true
  },

  totalAmount: {
    type: Number,
    min: 0,
    required: true
  },

  paidAmount: {
    type: Number,
    min: 0,
    default: 0
  },

  status: {
    type: String,
    enum: Object.values(FEE_STATUS),
    default: FEE_STATUS.PENDING
  }

}, { timestamps: true });

module.exports = mongoose.model('FeeStructure', feeSchema);
