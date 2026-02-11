const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      required: true,
      index: true,
    },

    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'StudentProfile',
      required: true,
    },

    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      required: true,
    },

    academicYear: {
      type: String,
      required: true,
      trim: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    paymentMode: {
      type: String,
      enum: ['CASH', 'UPI', 'BANK', 'CARD'],
      required: true,
    },

    transactionRef: {
      type: String,
      trim: true,
    },

    status: {
      type: String,
      enum: ['SUCCESS', 'FAILED', 'PENDING'],
      default: 'SUCCESS',
    },

    receiptNo: {
      type: String,
      trim: true,
    },

    paidAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

paymentSchema.index({ schoolId: 1, receiptNo: 1 }, { unique: true, sparse: true });
paymentSchema.index({ schoolId: 1, studentId: 1, paidAt: -1 });

module.exports = mongoose.model('Payment', paymentSchema);
