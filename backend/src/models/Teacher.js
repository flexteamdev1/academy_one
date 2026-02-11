const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema(
  {
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      required: true,
      index: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    employeeId: {
      type: String,
      trim: true,
    },

    firstName: {
      type: String,
      required: true,
      trim: true,
    },

    lastName: {
      type: String,
      trim: true,
    },

    email: {
      type: String,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      trim: true,
    },

    subjects: [{ type: String, trim: true }],

    qualification: {
      type: String,
      trim: true,
    },

    experience: {
      type: Number,
      min: 0,
    },

    classes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class',
      },
    ],

    salary: {
      type: Number,
      min: 0,
    },

    joinedAt: Date,

    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE'],
      default: 'ACTIVE',
    },
  },
  { timestamps: true }
);

teacherSchema.index({ schoolId: 1, userId: 1 }, { unique: true, sparse: true });
teacherSchema.index({ schoolId: 1, employeeId: 1 }, { unique: true, sparse: true });
teacherSchema.index({ schoolId: 1, email: 1 }, { sparse: true });

module.exports = mongoose.model('Teacher', teacherSchema);
