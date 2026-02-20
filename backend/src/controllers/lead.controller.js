const Lead = require('../models/Lead');
const { LEAD_STATUS } = require('../constants/enums');

const normalizeEmail = (value) => String(value || '').trim().toLowerCase();

const listLeads = async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 12));
    const skip = (page - 1) * limit;

    const filter = {};

    if (req.query.status && req.query.status !== 'ALL') {
      filter.status = String(req.query.status).toUpperCase();
    }

    if (req.query.q) {
      const q = String(req.query.q).trim();
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
        { phone: { $regex: q, $options: 'i' } },
        { guardianName: { $regex: q, $options: 'i' } },
        { guardianEmail: { $regex: q, $options: 'i' } },
      ];
    }

    const [items, total] = await Promise.all([
      Lead.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Lead.countDocuments(filter),
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

const createLead = async (req, res) => {
  try {
    const name = String(req.body.name || '').trim();
    if (!name) {
      return res.status(400).json({ message: 'Lead name is required' });
    }

    const payload = {
      name,
      email: normalizeEmail(req.body.email) || undefined,
      phone: String(req.body.phone || '').trim() || undefined,
      guardianName: String(req.body.guardianName || '').trim() || undefined,
      guardianEmail: normalizeEmail(req.body.guardianEmail) || undefined,
      guardianPhone: String(req.body.guardianPhone || '').trim() || undefined,
      gradeInterested: String(req.body.gradeInterested || '').trim() || undefined,
      source: String(req.body.source || '').trim() || undefined,
      notes: String(req.body.notes || '').trim() || undefined,
      status: req.body.status ? String(req.body.status).toUpperCase() : LEAD_STATUS.NEW,
    };

    const created = await Lead.create(payload);
    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateLead = async (req, res) => {
  try {
    const existing = await Lead.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    const updateData = {
      name: req.body.name ? String(req.body.name).trim() : undefined,
      email: req.body.email ? normalizeEmail(req.body.email) : undefined,
      phone: req.body.phone ? String(req.body.phone).trim() : undefined,
      guardianName: req.body.guardianName ? String(req.body.guardianName).trim() : undefined,
      guardianEmail: req.body.guardianEmail ? normalizeEmail(req.body.guardianEmail) : undefined,
      guardianPhone: req.body.guardianPhone ? String(req.body.guardianPhone).trim() : undefined,
      gradeInterested: req.body.gradeInterested ? String(req.body.gradeInterested).trim() : undefined,
      source: req.body.source ? String(req.body.source).trim() : undefined,
      notes: req.body.notes ? String(req.body.notes).trim() : undefined,
      status: req.body.status ? String(req.body.status).toUpperCase() : undefined,
      convertedStudentId: req.body.convertedStudentId || undefined,
    };

    Object.keys(updateData).forEach((key) => {
      if (updateData[key] === undefined) delete updateData[key];
    });

    const updated = await Lead.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteLead = async (req, res) => {
  try {
    const existing = await Lead.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    await Lead.findByIdAndDelete(req.params.id);
    res.json({ message: 'Lead deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  listLeads,
  createLead,
  updateLead,
  deleteLead,
};
