const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { ROLES } = require('../constants/roles');
const { getMailHealth, sendTestEmail } = require('../utils/mailer');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '7d',
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
    const { email, password } = req.body;
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

    res.json({
      id: user._id,
      email: user.email,
      role: user.role,
      name: user.name,
      mustChangePassword: !!user.mustChangePassword,
      token: generateToken(user._id),
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
  testEmailSettings,
};
