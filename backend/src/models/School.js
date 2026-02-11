const mongoose = require('mongoose');

const schoolSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      index: true,
    },

    code: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      index: true,
    },

    logoUrl: {
      type: String,
      trim: true,
    },

    address: {
      line1: { type: String, trim: true },
      line2: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      postalCode: { type: String, trim: true },
      country: { type: String, trim: true },
    },

    phone: { type: String, trim: true },

    email: {
      type: String,
      lowercase: true,
      trim: true,
    },

    website: { type: String, trim: true },

    isActive: {
      type: Boolean,
      default: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('School', schoolSchema);
