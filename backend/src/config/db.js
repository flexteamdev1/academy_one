const mongoose = require("mongoose");
const { createSuperAdmin } = require("../../scripts/create-superadmin");
const AcademicYear = require("../models/AcademicYear");
const { ACADEMIC_YEAR_STATUS } = require("../constants/enums");

const shouldAutoCreateSuperAdmin = () => {
  const value = String(process.env.AUTO_CREATE_SUPERADMIN || "").toLowerCase();
  return value === "true" || value === "1" || value === "yes";
};

const ensureSuperAdmin = async () => {
  if (!shouldAutoCreateSuperAdmin()) return;

  try {
    const result = await createSuperAdmin();
    if (result.created) {
      console.log("Super admin created");
    } else {
      console.log("Super admin already exists");
    }
  } catch (err) {
    console.warn(
      "AUTO_CREATE_SUPERADMIN enabled but credentials are missing"
    );
  }
};

const buildDefaultAcademicYear = () => {
  const now = new Date();
  const year = now.getFullYear();
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year + 1, 11, 31);
  const nextShort = String((year + 1) % 100).padStart(2, "0");
  const name = `${year}-${nextShort}`;

  return {
    name,
    startDate,
    endDate,
    isActive: true,
    status: ACADEMIC_YEAR_STATUS.ACTIVE,
  };
};

const ensureAcademicYear = async () => {
  const existing = await AcademicYear.findOne({
    isActive: true,
    status: ACADEMIC_YEAR_STATUS.ACTIVE,
  }).sort({ startDate: -1 });

  if (existing) {
    console.log("Active academic year already exists");
    return;
  }

  const name = String(process.env.ACADEMIC_YEAR_NAME || "").trim();
  const startDate = process.env.ACADEMIC_YEAR_START_DATE;
  const endDate = process.env.ACADEMIC_YEAR_END_DATE;

  const payload = name && startDate && endDate
    ? {
        name,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        isActive: true,
        status: ACADEMIC_YEAR_STATUS.ACTIVE,
      }
    : buildDefaultAcademicYear();

  await AcademicYear.updateMany({ isActive: true }, { $set: { isActive: false } });
  await AcademicYear.create(payload);

  console.log("Academic year created");
};

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI missing in .env");
    }

    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB Connected:", conn.connection.host);

    await ensureSuperAdmin();
    await ensureAcademicYear();
  } catch (err) {
    console.error("MongoDB Error:", err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
