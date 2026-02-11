const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { ROLES, ROLE_VALUES } = require('../constants/roles');

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      unique: true,
      index: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ROLE_VALUES,
      required: true,
    },

    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      required: function requiredSchoolId() {
        return this.role !== ROLES.SUPER_ADMIN;
      },
      validate: {
        validator: function validateSchoolId(value) {
          if (this.role === ROLES.SUPER_ADMIN) {
            return value == null;
          }
          return value != null;
        },
        message: 'schoolId is required for non-super admin users',
      },
      index: true,
    },

    profile: {
      name: { type: String, required: true },
      phone: { type: String },
      avatarUrl: { type: String },
    },

    mustChangePassword: {
      type: Boolean,
      default: true,
    },

    status: {
      type: String,
      enum: ['active', 'blocked', 'suspended'],
      default: 'active',
    },

    lastLogin: {
      type: Date,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function () {
  try {
    if (!this.isModified("password")) return;

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (err) {
    throw err;
  }
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.index({ schoolId: 1, role: 1 });

module.exports = mongoose.model('User', userSchema);
