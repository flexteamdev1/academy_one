const mongoose = require('mongoose');
const { ROLE_VALUES } = require('../constants/roles');

const noticeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    content: {
      type: String,
      required: true,
      trim: true,
    },

    status: {
      type: String,
      enum: ['PUBLISHED', 'DRAFT', 'SCHEDULED', 'ARCHIVED'],
      default: 'PUBLISHED',
    },

    visibleFor: [
      {
        type: String,
        enum: ROLE_VALUES,
      },
    ],

    grades: [
      {
        type: String,
        trim: true,
      },
    ],

    channels: [
      {
        type: String,
        enum: ['IN_APP', 'EMAIL', 'SMS'],
      },
    ],

    attachments: [
      {
        name: {
          type: String,
          trim: true,
        },
        size: {
          type: String,
          trim: true,
        },
      },
    ],

    publishedAt: Date,

    scheduledAt: Date,

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    createdByName: {
      type: String,
      trim: true,
      default: '',
    },
  },
  { timestamps: true }
);

noticeSchema.index({ publishedAt: -1 });

module.exports = mongoose.model('Notice', noticeSchema);
