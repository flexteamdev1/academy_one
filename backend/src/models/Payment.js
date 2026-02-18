const mongoose = require('mongoose');
const { PAYMENT_METHOD } = require('../constants/enums');

const paymentSchema = new mongoose.Schema({

  feeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Fee",
    required: true
  },

  amount: {
    type: Number,
    min: 1,
    required: true
  },

  method: {
    type: String,
    enum: Object.values(PAYMENT_METHOD),
    required: true
  },

  txnId: {
    type: String,
    unique: true,
    sparse: true
  }

}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
