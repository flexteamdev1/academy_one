const mongoose = require('mongoose');
const { CLASS_STATUS, SECTION_STATUS } = require('../constants/enums');

const sectionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    uppercase: true,
    maxlength: 2
  },

  capacity: {
    type: Number,
    min: 1,
    max: 80,
    default: 40
  },

  classTeacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Teacher",
    default: null
  },

  status: {
    type: String,
    enum: Object.values(SECTION_STATUS),
    default: SECTION_STATUS.ACTIVE
  }

}, { _id: false });

const classSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 20
  },

  academicYearId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "AcademicYear",
    required: true,
    index: true
  },

  sections: {
    type: [sectionSchema],
    validate: {
      validator: v => v.length > 0,
      message: "At least one section is required"
    }
  },

  status: {
    type: String,
    enum: Object.values(CLASS_STATUS),
    default: CLASS_STATUS.ACTIVE,
    index: true
  }

}, { timestamps: true });

classSchema.index(
  { name: 1, "sections.name": 1, academicYearId: 1 },
  { unique: true }
);

module.exports = mongoose.model('Class', classSchema);
