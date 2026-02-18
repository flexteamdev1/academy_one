const mongoose = require('mongoose');

const parentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
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

    relation: {
      type: String,
      trim: true,
    },

    children: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'StudentProfile',
      },
    ],

    occupation: {
      type: String,
      trim: true,
    },

    emergencyContact: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

parentSchema.index({ userId: 1 }, { unique: true, sparse: true });
parentSchema.index({ email: 1 }, { sparse: true });

module.exports = mongoose.model('Parent', parentSchema);
