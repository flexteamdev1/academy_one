const mongoose = require('mongoose');
const { TEACHER_STATUS } = require('../constants/enums');

const teacherSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true,
    unique: true
  },

  firstName: {
    type: String,
    required: true
  },

  lastName: {
    type: String,
    required: true,
  },

  phone: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    required: true,
    match: /^\S+@\S+\.\S+$/
  },

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  subjects: {
    type: [String],
    default: []
  },

  qualification: {
    type: String,
    required: true,
  },

  experience: {
    type: Number,
    required: true,
    min: 0
  },

  joinedAt: {
    type: Date,
    required: true,
  },

  profilePhotoUrl: {
    type: String
  },

  profilePhotoPublicId: {
    type: String
  },

  status: {
    type: String,
    enum: Object.values(TEACHER_STATUS),
    default: TEACHER_STATUS.ACTIVE
  }

}, { timestamps: true });

teacherSchema.index({ userId: 1 }, { unique: true, sparse: true });
teacherSchema.index({ email: 1 }, { sparse: true });

module.exports = mongoose.model('Teacher', teacherSchema);
