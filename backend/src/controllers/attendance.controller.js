const Attendance = require('../models/Attendance');
const StudentProfile = require('../models/StudentProfile');
const Class = require('../models/Class');
const Teacher = require('../models/Teacher');
const AcademicYear = require('../models/AcademicYear');
const { ATTENDANCE_STATUS, STUDENT_STATUS, CLASS_STATUS } = require('../constants/enums');
const { ROLES } = require('../constants/roles');

const toUpper = (value) => String(value || '').trim().toUpperCase();

const parseDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  date.setHours(0, 0, 0, 0);
  return date;
};

const normalizeRemarks = (value) => {
  if (value === null || value === undefined) return '';
  return String(value).trim().slice(0, 500);
};

const normalizeRecords = (records = []) => {
  const list = Array.isArray(records) ? records : [];
  const seen = new Set();

  return list
    .map((item) => ({
      studentId: item?.studentId,
      status: toUpper(item?.status),
      remarks: normalizeRemarks(item?.remarks),
    }))
    .filter((item) => {
      if (!item.studentId) return false;
      if (!Object.values(ATTENDANCE_STATUS).includes(item.status)) return false;
      if (seen.has(String(item.studentId))) return false;
      seen.add(String(item.studentId));
      return true;
    });
};

const buildStats = (records = []) => {
  const stats = {
    total: records.length,
    present: 0,
    absent: 0,
    late: 0,
  };

  records.forEach((record) => {
    if (record.status === ATTENDANCE_STATUS.PRESENT) stats.present += 1;
    if (record.status === ATTENDANCE_STATUS.ABSENT) stats.absent += 1;
    if (record.status === ATTENDANCE_STATUS.LATE) stats.late += 1;
  });

  return stats;
};

const getAttendance = async (req, res) => {
  try {
    const classId = req.query.classId;
    const sectionName = toUpper(req.query.sectionName);
    const date = parseDate(req.query.date);
    const includeStudents = String(req.query.includeStudents || '').toLowerCase() === 'true';

    if (!classId || !sectionName || !date) {
      return res.status(400).json({ message: 'classId, sectionName, and date are required' });
    }

    const attendance = await Attendance.findOne({
      classId,
      sectionName,
      date,
    });

    let students = [];
    if (includeStudents) {
      const status = String(req.query.status || '').toUpperCase();
      const filter = { classId, sectionName };
      if (status && status !== 'ALL') {
        filter.status = status;
      } else {
        filter.status = STUDENT_STATUS.ACTIVE;
      }

      students = await StudentProfile.find(filter).sort({ name: 1 });
    }

    const stats = attendance ? buildStats(attendance.records || []) : buildStats([]);

    return res.json({ attendance: attendance || null, students, stats });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const upsertAttendance = async (req, res) => {
  try {
    const { classId, sectionName, date, records } = req.body || {};
    const normalizedSection = toUpper(sectionName);
    const parsedDate = parseDate(date);

    if (!classId || !normalizedSection || !parsedDate) {
      return res.status(400).json({ message: 'classId, sectionName, and date are required' });
    }

    const normalizedRecords = normalizeRecords(records);

    const attendance = await Attendance.findOneAndUpdate(
      { classId, sectionName: normalizedSection, date: parsedDate },
      {
        classId,
        sectionName: normalizedSection,
        date: parsedDate,
        records: normalizedRecords,
        markedBy: req.user?._id,
      },
      { new: true, upsert: true }
    );

    const stats = buildStats(attendance.records || []);

    return res.json({ attendance, stats });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getAttendanceSummary = async (req, res) => {
  try {
    const date = parseDate(req.query.date) || parseDate(new Date());
    const academicYearId = req.query.academicYearId;

    // 1. Fetch all active classes
    const classes = await Class.find({
      academicYearId,
      status: CLASS_STATUS.ACTIVE,
    }).populate('sections.classTeacherId');

    // 2. Fetch all attendance records for this date
    const attendanceRecords = await Attendance.find({
      date,
    });

    const attendanceMap = new Map();
    attendanceRecords.forEach((rec) => {
      const key = `${rec.classId}_${rec.sectionName}`;
      attendanceMap.set(key, rec);
    });

    // 3. Process class-wise data
    const classSummaries = [];
    let totalPresent = 0;
    let totalStudents = 0;
    let pendingSubmissions = 0;
    let classesBelowTarget = 0;
    const TARGET_PERCENTAGE = 95;

    for (const cls of classes) {
      for (const section of cls.sections) {
        const key = `${cls._id}_${section.name}`;
        const record = attendanceMap.get(key);

        const studentCount = await StudentProfile.countDocuments({
          classId: cls._id,
          sectionName: section.name,
          status: STUDENT_STATUS.ACTIVE
        });

        const stats = record ? buildStats(record.records) : { total: 0, present: 0, absent: 0, late: 0 };
        const attendanceRate = studentCount > 0 ? (stats.present / studentCount) * 100 : 0;

        const teacher = section.classTeacherId;

        classSummaries.push({
          classId: cls._id,
          className: cls.name,
          sectionName: section.name,
          status: record ? 'SUBMITTED' : 'PENDING',
          teacherName: teacher ? `${teacher.firstName} ${teacher.lastName}` : 'Not Assigned',
          present: stats.present,
          absent: stats.absent,
          late: stats.late,
          studentCount,
          attendanceRate: parseFloat(attendanceRate.toFixed(1)),
          isLowAttendance: record && attendanceRate < TARGET_PERCENTAGE
        });

        totalStudents += studentCount;
        totalPresent += stats.present;
        if (!record) pendingSubmissions++;
        if (record && attendanceRate < TARGET_PERCENTAGE) classesBelowTarget++;
      }
    }

    const avgAttendance = totalStudents > 0 ? (totalPresent / totalStudents) * 100 : 0;

    return res.json({
      summary: {
        totalClasses: classSummaries.length,
        avgAttendance: parseFloat(avgAttendance.toFixed(1)),
        classesBelowTarget,
        pendingSubmissions,
      },
      classSummaries,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getClassAttendanceHistory = async (req, res) => {
  try {
    const classId = req.query.classId;
    const sectionName = toUpper(req.query.sectionName);
    let startDate = parseDate(req.query.startDate);
    let endDate = parseDate(req.query.endDate) || parseDate(new Date());

    if (!classId || !sectionName) {
      return res.status(400).json({ message: 'classId and sectionName are required' });
    }

    if (!endDate) {
      endDate = parseDate(new Date());
    }

    if (!startDate) {
      startDate = new Date(endDate);
      startDate.setDate(startDate.getDate() - 30);
      startDate.setHours(0, 0, 0, 0);
    }

    if (startDate > endDate) {
      const temp = startDate;
      startDate = endDate;
      endDate = temp;
    }

    const studentCount = await StudentProfile.countDocuments({
      classId,
      sectionName,
      status: STUDENT_STATUS.ACTIVE
    });

    const attendanceRecords = await Attendance.find({
      classId,
      sectionName,
      date: { $gte: startDate, $lte: endDate }
    }).sort({ date: -1 });

    const items = attendanceRecords.map((record) => {
      const stats = buildStats(record.records || []);
      const attendanceRate = studentCount > 0 ? (stats.present / studentCount) * 100 : 0;

      return {
        _id: record._id,
        date: record.date,
        stats,
        studentCount,
        attendanceRate: parseFloat(attendanceRate.toFixed(1)),
        markedBy: record.markedBy,
        isLocked: !!record.isLocked
      };
    });

    return res.json({
      classId,
      sectionName,
      studentCount,
      startDate,
      endDate,
      items,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getMyAttendance = async (req, res) => {
  try {
    const month = parseInt(req.query.month) || new Date().getMonth();
    const year = parseInt(req.query.year) || new Date().getFullYear();
    const academicYearId = req.query.academicYearId;

    // 1. Find student profile for the user
    let studentProfile;
    if (req.user.role === ROLES.STUDENT) {
      studentProfile = await StudentProfile.findOne({ userId: req.user._id })
        .populate('classId')
        .populate('academicYearId');
    } else if (req.user.role === ROLES.PARENT) {
      // For parent, default to first linked student if studentId not provided
      const studentId = req.query.studentId;
      if (studentId) {
        studentProfile = await StudentProfile.findById(studentId)
          .populate('classId')
          .populate('academicYearId');
      } else {
        studentProfile = await StudentProfile.findOne({ parentId: req.user._id })
          .populate('classId')
          .populate('academicYearId');
      }
    } else if ([ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TEACHER].includes(req.user.role)) {
      const studentId = req.query.studentId;
      if (studentId) {
        studentProfile = await StudentProfile.findById(studentId)
          .populate('classId')
          .populate('academicYearId');
      }
    }

    if (!studentProfile) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    // 2. Fetch all attendance records for this student in the given month
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0);

    const attendanceRecords = await Attendance.find({
      classId: studentProfile.classId,
      sectionName: studentProfile.sectionName,
      date: { $gte: startDate, $lte: endDate }
    });

    // 3. Extract the student's status for each day
    const dailyRecords = attendanceRecords.map(rec => {
      const studentRecord = rec.records.find(r => String(r.studentId) === String(studentProfile._id));
      return {
        date: rec.date,
        status: studentRecord ? studentRecord.status : 'NO_RECORD',
        remarks: studentRecord ? studentRecord.remarks : ''
      };
    });

    // 4. Calculate summary stats
    const stats = {
      totalClasses: attendanceRecords.length,
      present: 0,
      absent: 0,
      late: 0,
      attendanceRate: 0
    };

    dailyRecords.forEach(rec => {
      if (rec.status === ATTENDANCE_STATUS.PRESENT) stats.present++;
      if (rec.status === ATTENDANCE_STATUS.ABSENT) stats.absent++;
      if (rec.status === ATTENDANCE_STATUS.LATE) stats.late++;
    });

    if (stats.totalClasses > 0) {
      stats.attendanceRate = parseFloat(((stats.present / stats.totalClasses) * 100).toFixed(1));
    }

    return res.json({
      student: {
        _id: studentProfile._id,
        name: studentProfile.name,
        grade: studentProfile.grade || studentProfile.classId?.name || 'N/A',
        sectionName: studentProfile.sectionName,
        admissionNo: studentProfile.admissionNo,
        academicYearName: studentProfile.academicYearId?.name || '2023-2024'
      },
      stats,
      dailyRecords
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAttendance,
  upsertAttendance,
  getAttendanceSummary,
  getClassAttendanceHistory,
  getMyAttendance,
};
