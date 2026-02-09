const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
};

const registerUser = async (req, res) => {
  try {
    const { email, password, role, name, phone } = req.body;

    if (req.user.role !== 'superadmin') {
      return res.status(403).json({
        message: 'Only superadmin can create users',
      });
    }

    const exists = await User.findOne({ email });

    if (exists) {
      return res.status(400).json({
        message: 'Email already exists',
      });
    }

    const user = await User.create({
      email,
      password,
      role,

      profile: {
        name,
        phone,
      },

      createdBy: req.user?._id,
    });

    res.status(201).json({
      id: user._id,
      email: user.email,
      role: user.role,
      name: user.profile.name,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

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
      name: user.profile.name,
      mustChangePassword: user.mustChangePassword,
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

module.exports = {
  registerUser,
  loginUser,
  getProfile,
};
