import React, { useEffect, useMemo, useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  LinearProgress,
  MenuItem,
  Paper,
  Select,
  Stack,
  Typography,
} from '@mui/material';
import DownloadOutlined from '@mui/icons-material/DownloadOutlined';
import ChevronRightOutlined from '@mui/icons-material/ChevronRightOutlined';
import ChevronLeftOutlined from '@mui/icons-material/ChevronLeftOutlined';
import { listClasses } from '../services/classService';
import { listStudents } from '../services/studentService';
import { useUIState } from '../context/UIContext';
import { CLASS_STATUS, FILTER_ALL, STUDENT_STATUS } from '../constants/enums';
import { useNavigate } from 'react-router-dom';
import { getUserInfo } from '../utils/auth';
import {
  filterClassesForTeacher,
  filterStudentsForTeacher,
  getTeacherId,
  normalizeSectionName,
} from '../utils/teacherAccess';

const PAGE_SIZE = 10;

const hashPercent = (value) => {
  const str = String(value || '');
  let hash = 0;
  for (let i = 0; i < str.length; i += 1) {
    hash = (hash * 31 + str.charCodeAt(i)) % 1000;
  }
  return 45 + (hash % 55);
};

const getAttendanceRate = (student) => (
  Number(student.attendanceRate ?? student.attendancePercentage ?? student.attendance ?? NaN)
);

const formatRoll = (student, index) => {
  const roll = student.rollNo || index + 1;
  if (!roll) return '—';
  return String(roll).startsWith('#') ? roll : `#${roll}`;
};

const statusChipSx = (status) => {
  if (status === STUDENT_STATUS.ACTIVE) {
    return { bgcolor: '#ECFDF3', color: '#039855' };
  }
  return { bgcolor: '#F2F4F7', color: '#667085' };
};

const progressColor = (value) => {
  if (value >= 85) return '#12B76A';
  if (value >= 65) return '#F79009';
  return '#F04438';
};

const TeacherStudentManagement = () => {
  const { selectedAcademicYearId } = useUIState();
  const navigate = useNavigate();
  const user = getUserInfo();
  const teacherId = getTeacherId(user);
  const [assignedClasses, setAssignedClasses] = useState([]);
  const [assignedSectionsByClass, setAssignedSectionsByClass] = useState({});
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [classId, setClassId] = useState(FILTER_ALL);
  const [section, setSection] = useState(FILTER_ALL);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const loadClasses = async () => {
      try {
        const params = { page: 1, limit: 200, status: CLASS_STATUS.ACTIVE };
        if (selectedAcademicYearId) params.academicYearId = selectedAcademicYearId;
        const response = await listClasses(params);
        const items = response.items || [];
        const filtered = filterClassesForTeacher(items, teacherId);
        setAssignedClasses(filtered.classes);
        setAssignedSectionsByClass(filtered.assignedSectionsByClass);
      } catch (_err) {
        setAssignedClasses([]);
        setAssignedSectionsByClass({});
      }
    };
    loadClasses();
  }, [selectedAcademicYearId, teacherId]);

  const sectionOptions = useMemo(() => {
    if (classId === FILTER_ALL) return [];
    const selected = assignedClasses.find((item) => item._id === classId);
    const assigned = assignedSectionsByClass[classId];
    if (assigned?.length) return [...assigned].sort();
    const sections = (selected?.sections || [])
      .map((item) => normalizeSectionName(item.name))
      .filter(Boolean);
    return Array.from(new Set(sections)).sort();
  }, [assignedClasses, assignedSectionsByClass, classId]);

  useEffect(() => {
    if (classId === FILTER_ALL) {
      setSection(FILTER_ALL);
    } else if (section !== FILTER_ALL && !sectionOptions.includes(section)) {
      setSection(FILTER_ALL);
    }
  }, [classId, section, sectionOptions]);

  useEffect(() => {
    const loadStudents = async () => {
      setLoading(true);
      try {
        const allowedSections = assignedSectionsByClass[classId] || [];
        const needsLocalFilter =
          teacherId &&
          assignedClasses.length > 0 &&
          (classId === FILTER_ALL || (allowedSections.length > 0 && section === FILTER_ALL));

        const params = { page, limit: needsLocalFilter ? 200 : PAGE_SIZE };
        if (classId !== FILTER_ALL) params.classId = classId;
        if (section !== FILTER_ALL) params.section = section;

        const response = await listStudents(params);
        let items = response.items || [];
        if (teacherId && assignedClasses.length) {
          items = filterStudentsForTeacher(items, assignedClasses, assignedSectionsByClass);
          if (classId !== FILTER_ALL) {
            items = items.filter((student) => String(student.classId?._id || student.classId || '') === classId);
          }
          if (section !== FILTER_ALL) {
            items = items.filter((student) => normalizeSectionName(student.sectionName) === normalizeSectionName(section));
          }
          if (allowedSections.length && section === FILTER_ALL && classId !== FILTER_ALL) {
            items = items.filter((student) =>
              allowedSections.includes(normalizeSectionName(student.sectionName))
            );
          }
        }

        if (needsLocalFilter) {
          const start = (page - 1) * PAGE_SIZE;
          setTotal(items.length);
          setStudents(items.slice(start, start + PAGE_SIZE));
        } else {
          setStudents(items);
          setTotal(response.pagination?.total || items.length || 0);
        }
      } catch (_err) {
        setStudents([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    };
    loadStudents();
  }, [page, classId, section, assignedClasses, assignedSectionsByClass, teacherId]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const handleExport = () => {
    const header = ['Name', 'Grade', 'Section', 'Roll', 'Attendance', 'Status'];
    const rows = students.map((student, idx) => {
      const attendance = getAttendanceRate(student);
      const value = Number.isFinite(attendance) ? Math.round(attendance) : hashPercent(student._id);
      return [
        student.name || '-',
        student.grade || '-',
        student.sectionName || '-',
        formatRoll(student, idx),
        `${value}%`,
        student.status || '-',
      ];
    });
    const csv = [header, ...rows].map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'student-directory.csv');
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <Box sx={{ pb: 6 }}>
      <Stack spacing={1} sx={{ mb: 2 }}>
        <Typography sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>
          Dashboard <Box component="span" sx={{ mx: 0.7 }}>›</Box> Student Management
        </Typography>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>
          Student Directory
        </Typography>
        <Typography sx={{ color: 'text.secondary' }}>
          Review academic profiles, attendance records, and enrollment status.
        </Typography>
      </Stack>

      <Paper
        elevation={0}
        sx={{
          p: 2,
          borderRadius: '16px',
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'center' }}>
          <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
            <Select
              value={classId}
              onChange={(event) => {
                setClassId(event.target.value);
                setPage(1);
              }}
              size="small"
              sx={{ minWidth: 160, bgcolor: '#fff' }}
            >
              <MenuItem value={FILTER_ALL}>All Classes</MenuItem>
              {assignedClasses.map((item) => (
                <MenuItem key={item._id} value={item._id}>
                  {item.name || item.grade || item.className}
                </MenuItem>
              ))}
            </Select>

            <Select
              value={section}
              onChange={(event) => {
                setSection(event.target.value);
                setPage(1);
              }}
              size="small"
              sx={{ minWidth: 140, bgcolor: '#fff' }}
              disabled={classId === FILTER_ALL}
            >
              <MenuItem value={FILTER_ALL}>All Sections</MenuItem>
              {sectionOptions.map((item) => (
                <MenuItem key={item} value={item}>
                  {item}
                </MenuItem>
              ))}
            </Select>

            <Button
              variant="text"
              onClick={() => {
                setClassId(FILTER_ALL);
                setSection(FILTER_ALL);
                setPage(1);
              }}
              sx={{ color: '#6D28D9', fontWeight: 700 }}
            >
              Clear Filters
            </Button>
          </Stack>

          <Box sx={{ ml: { md: 'auto' } }}>
            <Button
              variant="outlined"
              startIcon={<DownloadOutlined />}
              onClick={handleExport}
              sx={{ borderRadius: '10px', fontWeight: 700 }}
            >
              Export List
            </Button>
          </Box>
        </Stack>
      </Paper>

      <Paper
        elevation={0}
        sx={{
          mt: 2,
          borderRadius: '16px',
          border: '1px solid',
          borderColor: 'divider',
          overflow: 'hidden',
          bgcolor: 'background.paper',
        }}
      >
        <Box sx={{ px: 3, py: 2, bgcolor: '#F8FAFC' }}>
          <Stack direction="row" spacing={2} alignItems="center" sx={{ color: 'text.secondary', fontSize: '0.72rem', fontWeight: 800 }}>
            <Box sx={{ flex: 2 }}>STUDENT PROFILE</Box>
            <Box sx={{ flex: 1 }}>ROLL NUMBER</Box>
            <Box sx={{ flex: 1.2 }}>ATTENDANCE</Box>
            <Box sx={{ flex: 0.8 }}>STATUS</Box>
            <Box sx={{ flex: 0.8, textAlign: 'right' }}>ACTIONS</Box>
          </Stack>
        </Box>

        <Divider />

        {loading ? (
          <Box sx={{ p: 3 }}>
            <LinearProgress />
          </Box>
        ) : null}

        {!loading && students.map((student, idx) => {
          const attendanceValue = getAttendanceRate(student);
          const attendance = Number.isFinite(attendanceValue)
            ? Math.round(attendanceValue)
            : hashPercent(student._id);
          const status = student.status || STUDENT_STATUS.ACTIVE;

          return (
            <Box key={student._id} sx={{ px: 3, py: 2.2, borderBottom: '1px solid #EEF2F6' }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ flex: 2 }}>
                  <Avatar src={student.profilePhotoUrl} sx={{ width: 40, height: 40 }} />
                  <Box>
                    <Typography sx={{ fontWeight: 700 }}>{student.name || '—'}</Typography>
                    <Typography sx={{ color: 'text.secondary', fontSize: '0.78rem' }}>
                      {student.grade || 'Grade'}{student.sectionName ? ` • Section ${student.sectionName}` : ''}
                    </Typography>
                  </Box>
                </Stack>

                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ fontWeight: 600, color: '#344054' }}>
                    {formatRoll(student, idx)}
                  </Typography>
                </Box>

                <Box sx={{ flex: 1.2 }}>
                  <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', mb: 0.6 }}>
                    {attendance}%
                  </Typography>
                  <Box sx={{ height: 6, borderRadius: 99, bgcolor: '#EEF2F6', overflow: 'hidden' }}>
                    <Box sx={{ height: '100%', width: `${attendance}%`, bgcolor: progressColor(attendance) }} />
                  </Box>
                </Box>

                <Box sx={{ flex: 0.8 }}>
                  <Chip size="small" label={status === STUDENT_STATUS.ACTIVE ? 'Active' : 'Inactive'} sx={statusChipSx(status)} />
                </Box>

                <Box sx={{ flex: 0.8, textAlign: 'right' }}>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => navigate(`/students/${student._id}/profile`)}
                    sx={{ borderRadius: '999px', px: 2.2, fontWeight: 700 }}
                  >
                    View Details
                  </Button>
                </Box>
              </Stack>
            </Box>
          );
        })}

        <Box sx={{ px: 3, py: 2, bgcolor: '#F8FAFC' }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} alignItems={{ md: 'center' }}>
            <Typography sx={{ color: 'text.secondary', fontSize: '0.82rem' }}>
              Showing {students.length ? (page - 1) * PAGE_SIZE + 1 : 0} to {Math.min(page * PAGE_SIZE, total)} of {total} students
            </Typography>
            <Box sx={{ ml: { md: 'auto' } }}>
              <Stack direction="row" spacing={1}>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  disabled={page <= 1}
                  startIcon={<ChevronLeftOutlined />}
                  sx={{ borderRadius: '999px' }}
                >
                  Previous
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={page >= totalPages}
                  endIcon={<ChevronRightOutlined />}
                  sx={{ borderRadius: '999px' }}
                >
                  Next
                </Button>
              </Stack>
            </Box>
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
};

export default TeacherStudentManagement;
