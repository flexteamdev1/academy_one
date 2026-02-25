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
    required: true,
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

  rollNo: {
    type: Number,
    index: true
  },

  bloodGroup: {
    type: String,
    trim: true
  },

  admissionDate: {
    type: Date
  },

  houseClub: {
    type: String,
    trim: true
  },

  houseClubRole: {
    type: String,
    trim: true
  },

  gpaScore: {
    type: Number,
    min: 0,
    max: 5.0
  },

  gpaRank: {
    type: String,
    trim: true
  },

  classroom: {
    type: String,
    trim: true
  },

  classroomWing: {
    type: String,
    trim: true
  },

  address: {
    street: String,
    city: String,
    state: String,
    zip: String,
    country: String
  },

  fatherName: {
    type: String,
    trim: true
  },

  fatherEmail: {
    type: String,
    trim: true,
    lowercase: true,
  },

  fatherOccupation: {
    type: String,
    trim: true
  },

  fatherPhone: {
    type: String,
    trim: true
  },

  motherName: {
    type: String,
    trim: true
  },

  motherEmail: {
    type: String,
    trim: true,
    lowercase: true,
  },

  motherOccupation: {
    type: String,
    trim: true
  },

  motherPhone: {
    type: String,
    trim: true
  },

  emergencyPhone: {
    type: String,
    trim: true
  },

  status: {
    type: String,
    enum: Object.values(STUDENT_STATUS),
    default: STUDENT_STATUS.ACTIVE
  }

}, { timestamps: true });

studentProfileSchema.index({ grade: 1, sectionName: 1 });

module.exports = mongoose.model('StudentProfile', studentProfileSchema);
