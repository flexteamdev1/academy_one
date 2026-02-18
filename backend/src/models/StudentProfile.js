const mongoose = require('mongoose');
const { STUDENT_GENDER, STUDENT_STATUS } = require('../constants/enums');

const studentProfileSchema = new mongoose.Schema({
  admissionNo: {
    type: String,
    required: true,
    unique: true,
    index: true
  },

  name: {
    type: String,
    required: true
  },

  email: {
    type: String,
    lowercase: true,
    trim: true
  },

  gender: {
    type: String,
    enum: Object.values(STUDENT_GENDER),
    required: true
  },

  dob: {
    type: Date,
    required: true
  },

  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Class",
    required: false,
    index: true
  },

  academicYearId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AcademicYear',
    default: null,
    index: true,
  },

  grade: {
    type: String,
    trim: true
  },

  sectionName: {
    type: String,
    required: true,
    uppercase: true,
    maxlength: 2
  },

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  },

  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Parent",
    default: null,
    index: true
  },

  profilePhotoUrl: {
    type: String
  },

  profilePhotoPublicId: {
    type: String
  },

  status: {
    type: String,
    enum: Object.values(STUDENT_STATUS),
    default: STUDENT_STATUS.ACTIVE
  }

}, { timestamps: true });

studentProfileSchema.index({ grade: 1, sectionName: 1 });

module.exports = mongoose.model('StudentProfile', studentProfileSchema);
