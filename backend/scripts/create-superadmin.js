const path = require("path");

require("dotenv").config({
  path: path.resolve(__dirname, "../.env"),
});


const { ROLES } = require("../src/constants/roles");
const User = require("../src/models/User");

const createSuperAdmin = async () => {
  const email = process.env.SUPERADMIN_EMAIL;
  const password = process.env.SUPERADMIN_PASSWORD;
  const name = process.env.SUPERADMIN_NAME;
  const phone = process.env.SUPERADMIN_PHONE;

  if (!email || !password) {
    throw new Error("Missing superadmin credentials");
  }

  const existing = await User.findOne({ email });

  if (existing) {
    return { created: false, email: existing.email };
  }

  const user = await User.create({
    name: name || "Super Admin",
    email,
    phone,
    password,
    role: ROLES.SUPER_ADMIN,
    mustChangePassword: false,
  });

  return { created: true, email: user.email };
};

module.exports = { createSuperAdmin };

if (require.main === module) {
  const run = async () => {
    const connectDB = require("../src/config/db");
    await connectDB();

    const result = await createSuperAdmin();
    if (result.created) {
      console.log("Super Admin Created:", result.email);
    } else {
      console.log("Super admin already exists");
    }
    process.exit(0);
  };

  run().catch((err) => {
    console.error(err.message || err);
    process.exit(1);
  });
}
