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
    type: String
  },

  phone: {
    type: String,
  },

  email: {
    type: String,
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
    type: String
  },

  experience: {
    type: Number,
    min: 0
  },

  joinedAt: {
    type: Date
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
