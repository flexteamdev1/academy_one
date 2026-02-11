const path = require("path");

require("dotenv").config({
  path: path.resolve(__dirname, "../.env"),
});


const connectDB = require("../src/config/db");
const { ROLES } = require("../src/constants/roles");
const User = require("../src/models/User");

const run = async () => {
  await connectDB();

  const email = process.env.SUPERADMIN_EMAIL;
  const password = process.env.SUPERADMIN_PASSWORD;
  const name = process.env.SUPERADMIN_NAME;
  const phone = process.env.SUPERADMIN_PHONE;

  if (!email || !password) {
    console.error("Missing superadmin credentials");
    process.exit(1);
  }

  const existing = await User.findOne({ email });

  if (existing) {
    console.log("Super admin already exists");
    process.exit(0);
  }

  const user = await User.create({
    email,
    password,
    role: ROLES.SUPER_ADMIN,
    profile: { name, phone },
    mustChangePassword: true,
  });

  console.log("Super Admin Created:", user.email);
  process.exit(0);
};

run();
