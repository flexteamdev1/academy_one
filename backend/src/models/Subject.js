const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema(
  {
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    code: {
      type: String,
      required: true,
      trim: true,
    },

    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      required: true,
    },

    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher',
    },
  },
  { timestamps: true }
);

subjectSchema.index({ schoolId: 1, classId: 1, code: 1 }, { unique: true });
subjectSchema.index({ schoolId: 1, classId: 1, name: 1 });

module.exports = mongoose.model('Subject', subjectSchema);
