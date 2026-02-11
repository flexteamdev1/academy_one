const mongoose = require('mongoose');

const studentProfileSchema = new mongoose.Schema(
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

    admissionNo: {
      type: String,
      required: true,
      trim: true,
    },

    rollNo: {
      type: String,
      trim: true,
    },

    section: {
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

    dob: Date,

    gender: {
      type: String,
      enum: ['MALE', 'FEMALE', 'OTHER'],
    },

    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      required: true,
    },

    parentIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Parent',
      },
    ],

    email: {
      type: String,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      trim: true,
    },

    bloodGroup: {
      type: String,
      trim: true,
    },

    status: {
      type: String,
      enum: ['active', 'passout', 'dropout'],
      default: 'active',
    },

    joinedAt: Date,
  },
  { timestamps: true }
);

studentProfileSchema.index(
  { schoolId: 1, admissionNo: 1 },
  { unique: true }
);
studentProfileSchema.index(
  { schoolId: 1, classId: 1, rollNo: 1 },
  { unique: true, sparse: true }
);
studentProfileSchema.index(
  { schoolId: 1, userId: 1 },
  { unique: true, sparse: true }
);

module.exports = mongoose.model('StudentProfile', studentProfileSchema);
