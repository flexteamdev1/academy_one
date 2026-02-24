const mongoose = require('mongoose');
const { ATTENDANCE_STATUS } = require('../constants/enums');

const attendanceSchema = new mongoose.Schema({
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Class",
    required: true,
    index: true
  },

  sectionName: {
    type: String,
    required: true,
    uppercase: true,
    trim: true,
    index: true
  },

  date: {
    type: Date,
    required: true,
    index: true
  },

  records: [
    {
      studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "StudentProfile",
        required: true
      },
      status: {
        type: String,
        enum: Object.values(ATTENDANCE_STATUS),
        required: true
      }
    }
  ],

  markedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  isLocked: {
    type: Boolean,
    default: false
  }

}, { timestamps: true });

attendanceSchema.index(
  { classId: 1, sectionName: 1, date: 1 },
  { unique: true }
);

module.exports = mongoose.model('Attendance', attendanceSchema);
