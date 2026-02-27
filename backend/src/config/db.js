const mongoose = require("mongoose");
const { createSuperAdmin } = require("../../scripts/create-superadmin");

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

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI missing in .env");
    }

    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB Connected:", conn.connection.host);

    await ensureSuperAdmin();
  } catch (err) {
    console.error("MongoDB Error:", err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
