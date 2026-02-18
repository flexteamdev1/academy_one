const mongoose = require('mongoose');
const { ENROLLMENT_STATUS } = require('../constants/enums');

const enrollmentSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'StudentProfile',
      required: true,
    },

    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      required: true,
    },

    academicYear: {
      type: String,
      required: true,
      trim: true,
    },

    status: {
      type: String,
      enum: Object.values(ENROLLMENT_STATUS),
      default: ENROLLMENT_STATUS.ACTIVE,
    },
  },
  { timestamps: true }
);

enrollmentSchema.index(
  { studentId: 1, classId: 1, academicYear: 1 },
  { unique: true }
);

module.exports = mongoose.model('Enrollment', enrollmentSchema);
