const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { ROLES } = require('../constants/roles');
const { getMailHealth, sendTestEmail, sendPasswordResetEmail } = require('../utils/mailer');

const generateToken = (id, expiresIn = '7d') => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn,
  });
};

const registerUser = async (req, res) => {
  try {
    const { email, password, role, name, phone } = req.body;

    if (req.user.role !== ROLES.SUPER_ADMIN) {
      return res.status(403).json({
        message: 'Only super admin can create users',
      });
    }

    const exists = await User.findOne({ email });

    if (exists) {
      return res.status(400).json({
        message: 'Email already exists',
      });
    }

    const mustChangePassword = [ROLES.TEACHER, ROLES.STUDENT, ROLES.PARENT].includes(role);
    const user = await User.create({
      name,
      email,
      phone,
      password,
      role,
      mustChangePassword,
    });

    res.status(201).json({
      id: user._id,
      email: user.email,
      role: user.role,
      name: user.name,
    });
  } catch (err) {
    if (err?.code === 11000 && err?.keyPattern?.phone) {
      return res.status(400).json({ message: 'Phone number already exists' });
    }
    res.status(500).json({ message: err.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password, remember } = req.body;
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(400).json({
        message: 'Invalid credentials (email)',
      });
    }

    const match = await user.matchPassword(password);

    if (!match) {
      return res.status(400).json({
        message: 'Invalid credentials (password)',
      });
    }

    const expiresIn = remember ? '30d' : '7d';
    res.json({
      id: user._id,
      email: user.email,
      role: user.role,
      name: user.name,
      mustChangePassword: !!user.mustChangePassword,
      token: generateToken(user._id, expiresIn),
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

const getProfile = async (req, res) => {
  res.json(req.user);
};

const changePassword = async (req, res) => {
  try {
    const currentPassword = String(req.body?.currentPassword || '');
    const newPassword = String(req.body?.newPassword || '');

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ message: 'New password must be at least 8 characters' });
    }

    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    if (user.mustChangePassword) {
      user.mustChangePassword = false;
    }
    await user.save();

    return res.json({ message: 'Password changed successfully' });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const email = String(req.body?.email || '').trim().toLowerCase();
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ message: 'Enter a valid email address' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Email is not registered' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const ttlMinutes = Number(process.env.RESET_PASSWORD_TTL_MIN || 60);

    user.resetPasswordToken = tokenHash;
    user.resetPasswordExpires = new Date(Date.now() + ttlMinutes * 60 * 1000);
    await user.save();

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const resetUrl = `${frontendUrl.replace(/\/$/, '')}/reset-password?token=${token}`;
    const sendResult = await sendPasswordResetEmail({
      to: user.email,
      recipientName: user.name,
      resetUrl,
    });

    if (!sendResult?.sent) {
      return res.status(400).json({
        message: 'Unable to send reset email. Please contact support.',
        reason: sendResult?.reason || 'smtp_send_failed',
      });
    }

    return res.json({ message: 'If an account exists for this email, a reset link will be sent shortly..' });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const token = String(req.body?.token || '').trim();
    const newPassword = String(req.body?.newPassword || '');

    if (!token || !newPassword) {
      return res.status(400).json({ message: 'Token and new password are required' });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ message: 'New password must be at least 8 characters' });
    }

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      resetPasswordToken: tokenHash,
      resetPasswordExpires: { $gt: new Date() },
    }).select('+password');

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    if (user.mustChangePassword) {
      user.mustChangePassword = false;
    }
    await user.save();

    return res.json({ message: 'Password reset successfully' });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const testEmailSettings = async (req, res) => {
  try {
    const recipient = String(req.body?.to || req.user?.email || '').trim().toLowerCase();
    const health = await getMailHealth();
    const sendResult = await sendTestEmail({
      to: recipient,
      requestedBy: req.user?.email || req.user?._id,
    });

    res.status(sendResult.sent ? 200 : 400).json({
      message: sendResult.sent ? 'Test email sent successfully' : 'Test email failed',
      recipient,
      health,
      sendResult,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  testEmailSettings,
};
