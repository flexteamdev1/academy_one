const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },

  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Class",
    required: true
  },

  sectionName: {
    type: String,
    required: true,
    uppercase: true
  },

  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Teacher"
  }

}, { timestamps: true });

subjectSchema.index({ classId: 1, sectionName: 1 });

module.exports = mongoose.model('Subject', subjectSchema);
