import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Typography,
  Stack,
  Button,
  Grid,
  Paper,
  Avatar,
  IconButton,
  TextField,
  InputAdornment,
  Divider,
  Switch,
  Chip,
  CircularProgress,
  alpha,
  MenuItem,
  Select
} from '@mui/material';
import {
  Download as DownloadIcon,
  Notifications as NotifyIcon,
  Search as SearchIcon,
  MoreVert as MoreIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  People as PeopleIcon,
  EventNote as YearIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { getAttendance } from '../services/attendanceService';
import { listClasses } from '../services/classService';
import { getUserInfo, getUserRole } from '../utils/auth';
import { filterClassesForTeacher, getTeacherId, normalizeSectionName } from '../utils/teacherAccess';
import { ATTENDANCE_STATUS } from '../constants/enums';

const AttendanceDetails = () => {
  const { classId, sectionName, date } = useParams();
  const navigate = useNavigate();
  const user = getUserInfo();
  const role = getUserRole();
  const teacherId = role === 'teacher' ? getTeacherId(user) : '';

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ attendance: null, students: [], stats: {} });
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await getAttendance({
          classId,
          sectionName,
          date,
          includeStudents: true
        });
        setData(res);
      } catch (err) {
        console.error('Failed to fetch details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [classId, sectionName, date]);

  useEffect(() => {
    if (!teacherId) return;
    const validateAccess = async () => {
      try {
        const response = await listClasses({ page: 1, limit: 200 });
        const filtered = filterClassesForTeacher(response.items || [], teacherId);
        const allowedClass = filtered.classes.find((item) => String(item._id) === String(classId));
        if (!allowedClass) {
          navigate('/attendance', { replace: true });
          return;
        }
        const allowedSections = filtered.assignedSectionsByClass[String(classId)] || [];
        if (allowedSections.length && !allowedSections.includes(normalizeSectionName(sectionName))) {
          navigate('/attendance', { replace: true });
        }
      } catch (_err) {
        navigate('/attendance', { replace: true });
      }
    };
    validateAccess();
  }, [teacherId, classId, sectionName, navigate]);

  const stats = data.stats || {};
  const totalStudents = data.students.length;
  const presentCount = stats.present || 0;
  const absentCount = stats.absent || 0;
  const lateCount = stats.late || 0;
  const attendanceRate = totalStudents ? Math.round((presentCount / totalStudents) * 100) : 0;

  const statusById = useMemo(() => {
    const map = new Map();
    (data.attendance?.records || []).forEach((record) => {
      map.set(String(record.studentId), record.status);
    });
    return map;
  }, [data.attendance]);

  const filteredStudents = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return (data.students || []).filter((student) => {
      const status = statusById.get(String(student._id)) || ATTENDANCE_STATUS.PRESENT;
      if (statusFilter !== 'ALL' && status !== statusFilter) return false;
      if (!normalizedQuery) return true;
      const haystack = [
        student.name,
        student.admissionNo,
        student.email,
        student.rollNo,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [data.students, query, statusFilter, statusById]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ pb: 8, bgcolor: '#f4f7fe', minHeight: '100vh' }}>
      {/* Top Header Navigation */}
      <Box sx={{ px: 4, py: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography sx={{ fontWeight: 800, fontSize: '18px', color: '#374151' }}>Attendance</Typography>
          <Typography sx={{ color: '#9ca3af', fontSize: '13px', fontWeight: 600 }}>Portal / Attendance Details</Typography>
        </Box>
        <Select
          value="2025-26"
          size="small"
          startAdornment={<YearIcon sx={{ mr: 1, color: '#5346e0', fontSize: 18 }} />}
          sx={{
            borderRadius: '12px',
            bgcolor: '#fff',
            fontWeight: 700,
            fontSize: '13px',
            '& .MuiOutlinedInput-notchedOutline': { borderColor: '#e3e8f1' }
          }}
        >
          <MenuItem value="2025-26">2025-26</MenuItem>
        </Select>
      </Box>

      <Box sx={{ p: 4 }}>
        {/* Header Section */}
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 4 }}>
          <Box>
            <Typography variant="h3" sx={{ fontWeight: 900, color: '#1f2937', mb: 1, letterSpacing: '-0.02em' }}>
              Section {sectionName} Overview
            </Typography>
            <Stack direction="row" spacing={2} sx={{ color: '#6b7280' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>👨‍🏫 Class Teacher</Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>•</Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>📅 {new Date(date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</Typography>
            </Stack>
          </Box>
          <Stack direction="row" spacing={2}>
            <Button
              startIcon={<DownloadIcon />}
              sx={{
                bgcolor: '#fff',
                border: '1px solid #e3e8f1',
                borderRadius: '14px',
                px: 3,
                py: 1.2,
                fontWeight: 700,
                color: '#6b7280',
                '&:hover': { bgcolor: '#f9fafb' }
              }}
            >
              Export Sheet
            </Button>
            <Button
              variant="contained"
              disableElevation
              startIcon={<NotifyIcon />}
              sx={{
                bgcolor: '#5346e0',
                borderRadius: '14px',
                px: 3,
                py: 1.2,
                fontWeight: 800,
                '&:hover': { bgcolor: '#4035b3' }
              }}
            >
              Notify Parents
            </Button>
          </Stack>
        </Stack>

        {/* Hero Stats */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {[
            { label: 'COMPLIANCE RATE', value: `${attendanceRate}%`, sub: totalStudents ? `${presentCount} of ${totalStudents} present` : 'No records', color: '#00c853', chart: true },
            { label: 'ENROLLMENT', value: totalStudents, sub: 'Registered Students', icon: <PeopleIcon sx={{ color: alpha('#5346e0', 0.1), fontSize: 40 }} /> },
            { label: 'PRESENT', value: presentCount, sub: 'On Schedule', icon: <CheckCircleIcon sx={{ color: '#00c853', fontSize: 32 }} /> },
            { label: 'ABSENT', value: absentCount, sub: 'Requires Following', icon: <ErrorIcon sx={{ color: '#ff3d00', fontSize: 32 }} /> }
          ].map((stat, i) => (
            <Grid item xs={12} md={3} key={i}>
              <Paper elevation={0} sx={{ p: 3, borderRadius: '24px', border: '1px solid #e3e8f1', bgcolor: '#fff', height: '100%' }}>
                <Typography variant="caption" sx={{ color: '#9ca3af', fontWeight: 800, fontSize: '11px', letterSpacing: '0.8px' }}>{stat.label}</Typography>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 1.5 }}>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 900, color: '#1f2937' }}>{stat.value}</Typography>
                    <Typography variant="caption" sx={{ color: stat.color || '#9ca3af', fontWeight: 700 }}>{stat.sub}</Typography>
                  </Box>
                  {stat.chart ? (
                    <CircularProgress variant="determinate" value={attendanceRate} sx={{ color: '#5346e0' }} size={48} thickness={6} />
                  ) : stat.icon}
                </Stack>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* Charts & Summary Row */}
        <Grid container spacing={4} sx={{ mb: 6 }}>
          <Grid item xs={12} md={8}>
            <Paper elevation={0} sx={{ p: 4, borderRadius: '28px', height: '100%', border: '1px solid #e3e8f1', bgcolor: '#fff' }}>
              <Stack direction="row" justifyContent="space-between" sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ fontWeight: 900, color: '#1f2937' }}>15-Day Trend</Typography>
                <Button size="small" variant="outlined" sx={{ borderRadius: '12px', color: '#6b7280', borderColor: '#e3e8f1', fontWeight: 700, px: 2 }}>
                  Last 15 Days
                </Button>
              </Stack>
              <Box sx={{ height: 200, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', px: 2 }}>
                {[60, 65, 70, 75, 80, 85, 82, 88, 90, 85, 87, 89, 92, 91, 95].map((h, i) => (
                  <Box
                    key={i}
                    sx={{
                      width: '5%',
                      height: `${h}%`,
                      bgcolor: i === 14 ? '#5346e0' : alpha('#5346e0', 0.1),
                      borderRadius: '6px 6px 0 0',
                      transition: 'all 0.3s ease'
                    }}
                  />
                ))}
              </Box>
              <Stack direction="row" justifyContent="space-between" sx={{ mt: 3, px: 1 }}>
                <Typography sx={{ fontSize: '11px', color: '#9ca3af', fontWeight: 800 }}>OCT 10</Typography>
                <Typography sx={{ fontSize: '11px', color: '#1f2937', fontWeight: 900 }}>TODAY ({new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase()})</Typography>
              </Stack>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper elevation={0} sx={{ p: 4, borderRadius: '28px', height: '100%', bgcolor: alpha('#5346e0', 0.02), border: `1px solid ${alpha('#5346e0', 0.1)}` }}>
              <Typography variant="h6" sx={{ fontWeight: 900, mb: 2, color: '#1f2937' }}>Insights</Typography>
              <Typography sx={{ color: '#4b5563', fontSize: '15px', lineHeight: 1.7, mb: 4, fontWeight: 500 }}>
                Attendance is performing <span style={{ color: '#00c853', fontWeight: 700 }}>above average</span> this week. Approximately 12% of students are consistently arriving late.
              </Typography>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 4, px: 1 }}>
                <Typography sx={{ fontWeight: 800, color: '#1f2937', fontSize: '14px' }}>Auto-Notify Parents</Typography>
                <Switch defaultChecked size="small" sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#5346e0' }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#5346e0' } }} />
              </Stack>
              <Button
                fullWidth
                variant="contained"
                disableElevation
                sx={{
                  borderRadius: '14px',
                  py: 2,
                  bgcolor: '#fff',
                  color: '#5346e0',
                  fontWeight: 900,
                  fontSize: '14px',
                  border: '1px solid #e3e8f1',
                  '&:hover': { bgcolor: alpha('#5346e0', 0.05), borderColor: '#5346e0' }
                }}
              >
                Analyze Flagged Cases
              </Button>
            </Paper>
          </Grid>
        </Grid>

        {/* Tabular Search & Filters */}
        <Stack direction="row" spacing={3} sx={{ mb: 4 }}>
          <TextField
            placeholder="Lookup student by name or ID..."
            fullWidth
            size="small"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#9ca3af', ml: 1 }} />
                </InputAdornment>
              ),
              sx: { borderRadius: '16px', bgcolor: '#fff', py: 0.5, '& fieldset': { borderColor: '#e3e8f1' } }
            }}
          />
          <Stack direction="row" sx={{ bgcolor: '#fff', borderRadius: '16px', p: 0.7, border: '1px solid #e3e8f1', minWidth: 'max-content' }}>
            {[
              { label: 'All', value: 'ALL' },
              { label: 'Present', value: ATTENDANCE_STATUS.PRESENT },
              { label: 'Absent', value: ATTENDANCE_STATUS.ABSENT },
              { label: 'Late', value: ATTENDANCE_STATUS.LATE },
            ].map((t) => (
              <Button
                key={t.value}
                size="small"
                onClick={() => setStatusFilter(t.value)}
                sx={{
                  borderRadius: '12px',
                  px: 3,
                  fontWeight: 800,
                  fontSize: '13px',
                  color: statusFilter === t.value ? '#5346e0' : '#6b7280',
                  bgcolor: statusFilter === t.value ? alpha('#5346e0', 0.08) : 'transparent',
                  '&:hover': { bgcolor: statusFilter === t.value ? alpha('#5346e0', 0.12) : '#f9fafb' }
                }}
              >
                {t.label}
              </Button>
            ))}
          </Stack>
        </Stack>

        {/* Student Table */}
        <Paper elevation={0} sx={{ borderRadius: '28px', overflow: 'hidden', border: '1px solid #e3e8f1', bgcolor: '#fff' }}>
          <Box sx={{ p: 3, bgcolor: '#fcfcfd', borderBottom: '1px solid #e3e8f1' }}>
            <Grid container sx={{ px: 3 }}>
              <Grid item xs={2}><Typography sx={{ fontSize: '11px', fontWeight: 800, color: '#9ca3af', letterSpacing: '0.8px' }}>ID</Typography></Grid>
              <Grid item xs={3}><Typography sx={{ fontSize: '11px', fontWeight: 800, color: '#9ca3af', letterSpacing: '0.8px' }}>NAME</Typography></Grid>
              <Grid item xs={3}><Typography sx={{ fontSize: '11px', fontWeight: 800, color: '#9ca3af', letterSpacing: '0.8px' }}>STATUS</Typography></Grid>
              <Grid item xs={3}><Typography sx={{ fontSize: '11px', fontWeight: 800, color: '#9ca3af', letterSpacing: '0.8px' }}>CONSISTENCY</Typography></Grid>
              <Grid item xs={1} sx={{ textAlign: 'right' }}><Typography sx={{ fontSize: '11px', fontWeight: 800, color: '#9ca3af', letterSpacing: '0.8px' }}>ACTION</Typography></Grid>
            </Grid>
          </Box>
          {filteredStudents.map((student, idx) => {
            const status = statusById.get(String(student._id)) || ATTENDANCE_STATUS.PRESENT;
            const tone = status === ATTENDANCE_STATUS.PRESENT
              ? { bg: alpha('#00c853', 0.1), fg: '#00c853' }
              : status === ATTENDANCE_STATUS.LATE
                ? { bg: alpha('#ff9100', 0.12), fg: '#ff9100' }
                : { bg: alpha('#ff3d00', 0.12), fg: '#ff3d00' };
            return (
              <Box key={student._id}>
                <Grid container alignItems="center" sx={{ px: 5, py: 3, bgcolor: '#fff', transition: 'all 0.2s', '&:hover': { bgcolor: alpha('#5346e0', 0.01) } }}>
                  <Grid item xs={2}>
                    <Typography sx={{ fontWeight: 800, color: '#9ca3af', fontSize: '13px' }}>
                      {student.rollNo ? `#${String(student.rollNo).padStart(3, '0')}` : student.admissionNo || `#STU-${1000 + idx}`}
                    </Typography>
                  </Grid>
                  <Grid item xs={3}>
                    <Stack direction="row" spacing={3} alignItems="center">
                      <Avatar src={student.profilePhotoUrl} sx={{ width: 40, height: 40, border: '2px solid #fcfcfd', boxShadow: '0 2px 6px rgba(0,0,0,0.06)' }} />
                      <Box>
                        <Typography sx={{ fontWeight: 900, color: '#1f2937', fontSize: '15px' }}>{student.name}</Typography>
                        <Typography sx={{ color: '#6b7280', fontWeight: 700, fontSize: '12px' }}>{sectionName}</Typography>
                      </Box>
                    </Stack>
                  </Grid>
                  <Grid item xs={3}>
                    <Chip
                      label={status}
                      size="small"
                      sx={{
                        borderRadius: '8px',
                        fontWeight: 900,
                        bgcolor: tone.bg,
                        color: tone.fg,
                        fontSize: '11px',
                        height: 28,
                        px: 1
                      }}
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <Stack direction="row" spacing={3} alignItems="center">
                      <Box sx={{ flexGrow: 1, height: 6, bgcolor: '#f3f4f6', borderRadius: 3, overflow: 'hidden' }}>
                        <Box sx={{ width: `${attendanceRate}%`, height: '100%', bgcolor: '#00c853', borderRadius: 3 }} />
                      </Box>
                      <Typography sx={{ fontWeight: 900, fontSize: '14px', color: '#6b7280' }}>{attendanceRate}%</Typography>
                    </Stack>
                  </Grid>
                  <Grid item xs={1} sx={{ textAlign: 'right' }}>
                    <IconButton size="small" sx={{ color: '#d1d5db' }}><MoreIcon /></IconButton>
                  </Grid>
                </Grid>
                <Divider sx={{ mx: 3 }} />
              </Box>
            );
          })}
        </Paper>
      </Box>
    </Box>
  );
};

export default AttendanceDetails;
