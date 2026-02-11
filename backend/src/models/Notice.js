const mongoose = require('mongoose');
const { ROLE_VALUES } = require('../constants/roles');

const noticeSchema = new mongoose.Schema(
  {
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      required: true,
      index: true,
    },

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

    visibleFor: [
      {
        type: String,
        enum: ROLE_VALUES,
      },
    ],

    publishedAt: Date,

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

noticeSchema.index({ schoolId: 1, publishedAt: -1 });

module.exports = mongoose.model('Notice', noticeSchema);
