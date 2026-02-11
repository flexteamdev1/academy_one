const mongoose = require('mongoose');

const classSchema = new mongoose.Schema(
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

    section: {
      type: String,
      required: true,
      trim: true,
    },

    academicYear: {
      type: String,
      required: true,
      trim: true,
    },

    classTeacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher',
    },

    capacity: {
      type: Number,
      min: 1,
    },
  },
  { timestamps: true }
);

classSchema.index(
  { schoolId: 1, name: 1, section: 1, academicYear: 1 },
  { unique: true }
);

module.exports = mongoose.model('Class', classSchema);
