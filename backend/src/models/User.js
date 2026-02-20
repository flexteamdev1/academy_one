const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { ROLE_VALUES } = require('../constants/roles');
const { USER_STATUS } = require('../constants/enums');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 60
  },

  email: {
    type: String,
    lowercase: true,
    unique: true,
    sparse: true,
    match: [/^\S+@\S+\.\S+$/, "Invalid email"]
  },

  phone: {
    type: String,
    unique: true,
    sparse: true,
  },

  password: {
    type: String,
    required: true,
    minlength: 8,
    select: false
  },

  role: {
    type: String,
    enum: ROLE_VALUES,
    required: true,
    index: true
  },

  status: {
    type: String,
    enum: Object.values(USER_STATUS),
    default: USER_STATUS.ACTIVE
  },

  mustChangePassword: {
    type: Boolean,
    default: false
  },

  isDeleted: {
    type: Boolean,
    default: false,
    index: true
  }

}, { timestamps: true });

userSchema.pre("save", async function () {
  try {
    if (!this.isModified('password')) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (err) {
    throw err;
  }
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
