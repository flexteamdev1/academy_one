const User = require('../models/User');
const { ROLES } = require('../constants/roles');
const { USER_STATUS } = require('../constants/enums');

const normalizeEmail = (value) => String(value || '').trim().toLowerCase();

const listAdmins = async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 12));
    const skip = (page - 1) * limit;

    const filter = { role: ROLES.ADMIN, isDeleted: { $ne: true } };

    if (req.query.status && req.query.status !== 'ALL') {
      filter.status = String(req.query.status).toUpperCase();
    }

    if (req.query.q) {
      const q = String(req.query.q).trim();
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
        { phone: { $regex: q, $options: 'i' } },
      ];
    }

    const [items, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(filter),
    ]);

    res.json({
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createAdmin = async (req, res) => {
  try {
    const name = String(req.body.name || '').trim();
    const email = normalizeEmail(req.body.email);
    const phone = String(req.body.phone || '').trim();
    const password = String(req.body.password || '');

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    if (phone) {
      const phoneExists = await User.findOne({ phone });
      if (phoneExists) {
        return res.status(400).json({ message: 'Phone number already exists' });
      }
    }

    const user = await User.create({
      name,
      email,
      phone: phone || undefined,
      password,
      role: ROLES.ADMIN,
      status: USER_STATUS.ACTIVE,
      mustChangePassword: false,
    });

    res.status(201).json(user);
  } catch (error) {
    if (error?.code === 11000 && error?.keyPattern?.phone) {
      return res.status(400).json({ message: 'Phone number already exists' });
    }
    if (error?.code === 11000 && error?.keyPattern?.email) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    res.status(500).json({ message: error.message });
  }
};

const updateAdmin = async (req, res) => {
  try {
    const existing = await User.findById(req.params.id);
    if (!existing || existing.role !== ROLES.ADMIN) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    const updateData = {
      name: req.body.name ? String(req.body.name).trim() : undefined,
      email: req.body.email ? normalizeEmail(req.body.email) : undefined,
      phone: req.body.phone ? String(req.body.phone).trim() : undefined,
      status: req.body.status ? String(req.body.status).toUpperCase() : undefined,
    };

    Object.keys(updateData).forEach((key) => {
      if (updateData[key] === undefined) delete updateData[key];
    });

    const updated = await User.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
    res.json(updated);
  } catch (error) {
    if (error?.code === 11000 && error?.keyPattern?.phone) {
      return res.status(400).json({ message: 'Phone number already exists' });
    }
    if (error?.code === 11000 && error?.keyPattern?.email) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    res.status(500).json({ message: error.message });
  }
};

const deleteAdmin = async (req, res) => {
  try {
    const existing = await User.findById(req.params.id);
    if (!existing || existing.role !== ROLES.ADMIN) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'Admin deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  listAdmins,
  createAdmin,
  updateAdmin,
  deleteAdmin,
};
