const mongoose = require('mongoose');
const { ATTENDANCE_STATUS } = require('../constants/enums');

const attendanceSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true
  },

  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Class",
    required: true
  },

  sectionName: {
    type: String,
    required: true,
    uppercase: true
  },

  date: {
    type: Date,
    required: true
  },

  status: {
    type: String,
    enum: Object.values(ATTENDANCE_STATUS),
    required: true
  },

  markedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  }

}, { timestamps: true });

attendanceSchema.index(
  { studentId: 1, date: 1 },
  { unique: true }
);

module.exports = mongoose.model('Attendance', attendanceSchema);
