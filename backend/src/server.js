const path = require("path");

require("dotenv").config({
  path: path.resolve(__dirname, "../.env"),
});


const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();

// Connect DB
connectDB();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/teachers", require("./routes/teacherRoutes"));
app.use("/api/students", require("./routes/studentRoutes"));
app.use("/api/classes", require("./routes/classRoutes"));
app.use("/api/academic-years", require("./routes/academicYearRoutes"));
app.use("/api/notices", require("./routes/noticeRoutes"));
app.use("/api/leads", require("./routes/leadRoutes"));
app.use("/api/admins", require("./routes/adminRoutes"));
app.use("/api/attendance", require("./routes/attendanceRoutes"));

// Home
app.get("/", (req, res) => {
  res.send("School CRM API Running");
});

app.use((err, _req, res, next) => {
  if (!err) return next();

  if (err.name === 'MulterError') {
    return res.status(400).json({ message: err.message });
  }

  if (err.message === 'Only image files are allowed') {
    return res.status(400).json({ message: err.message });
  }
  if (err.message === 'Unsupported attachment type') {
    return res.status(400).json({ message: err.message });
  }

  return res.status(500).json({ message: err.message || 'Internal server error' });
});

// Start Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
