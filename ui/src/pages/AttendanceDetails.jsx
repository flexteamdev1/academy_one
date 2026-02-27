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
  EventNote as YearIcon,
  ArrowBack as BackIcon
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

  const totalStudents = data.students.length;
  const historyLink = `/attendance/history/${classId}/${normalizeSectionName(sectionName)}`;

  const statusById = useMemo(() => {
    const map = new Map();
    (data.attendance?.records || []).forEach((record) => {
      map.set(String(record.studentId), record.status);
    });
    return map;
  }, [data.attendance]);

  const remarksById = useMemo(() => {
    const map = new Map();
    (data.attendance?.records || []).forEach((record) => {
      map.set(String(record.studentId), record.remarks || '');
    });
    return map;
  }, [data.attendance]);

  const derivedStats = useMemo(() => {
    const counts = { present: 0, absent: 0, late: 0 };
    data.students.forEach((student) => {
      const status = statusById.get(String(student._id)) || ATTENDANCE_STATUS.PRESENT;
      if (status === ATTENDANCE_STATUS.PRESENT) counts.present += 1;
      if (status === ATTENDANCE_STATUS.ABSENT) counts.absent += 1;
      if (status === ATTENDANCE_STATUS.LATE) counts.late += 1;
    });
    const rate = totalStudents ? Math.round((counts.present / totalStudents) * 100) : 0;
    return { ...counts, attendanceRate: rate };
  }, [data.students, statusById, totalStudents]);

  const presentCount = derivedStats.present;
  const absentCount = derivedStats.absent;
  const lateCount = derivedStats.late;
  const attendanceRate = derivedStats.attendanceRate;

  const trendValues = useMemo(() => {
    if (!totalStudents) {
      return Array.from({ length: 15 }, () => 0);
    }
    const base = Math.min(98, Math.max(55, attendanceRate || 0));
    const start = Math.max(45, base - 18);
    return Array.from({ length: 15 }, (_, i) => {
      const value = start + i * ((base - start) / 14);
      return Math.round(Math.min(100, Math.max(30, value)));
    });
  }, [attendanceRate, totalStudents]);

  const trendStartLabel = useMemo(() => {
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) return 'START';
    d.setDate(d.getDate() - 14);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase();
  }, [date]);

  const trendEndLabel = useMemo(() => {
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) return 'TODAY';
    return `TODAY (${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase()})`;
  }, [date]);

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
              startIcon={<BackIcon />}
              onClick={() => navigate(historyLink)}
              sx={{
                bgcolor: '#fff',
                border: '1px solid #e3e8f1',
                borderRadius: '14px',
                px: 2.5,
                py: 1.1,
                fontWeight: 700,
                color: '#6b7280',
                '&:hover': { bgcolor: '#f9fafb' }
              }}
            >
              Back to History
            </Button>
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
        <Box
          sx={{
            mb: 4,
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
            gap: 3,
          }}
        >
          {[
            { label: 'COMPLIANCE RATE', value: `${attendanceRate}%`, sub: totalStudents ? `${presentCount} of ${totalStudents} present` : 'No records', color: '#00c853' },
            { label: 'ENROLLMENT', value: totalStudents, sub: 'Registered Students' },
            { label: 'PRESENT', value: presentCount, sub: 'On Schedule' },
            { label: 'ABSENT', value: absentCount, sub: 'Requires Following' }
          ].map((stat, i) => (
            <Paper key={i} elevation={0} sx={{ p: 3, borderRadius: '24px', border: '1px solid #e3e8f1', bgcolor: '#fff', height: '100%' }}>
              <Typography variant="caption" sx={{ color: '#9ca3af', fontWeight: 800, fontSize: '11px', letterSpacing: '0.8px' }}>{stat.label}</Typography>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 1.5 }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 900, color: '#1f2937' }}>{stat.value}</Typography>
                  <Typography variant="caption" sx={{ color: stat.color || '#9ca3af', fontWeight: 700 }}>{stat.sub}</Typography>
                </Box>
              </Stack>
            </Paper>
          ))}
        </Box>

        {/* Charts & Summary Row */}
        <Grid container spacing={4} sx={{ mb: 6 }}>
          <Grid item xs={12}>
            <Paper elevation={0} sx={{ p: 4, borderRadius: '28px', border: '1px solid #e3e8f1', bgcolor: '#fff' }}>
              <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ md: 'center' }} spacing={2} sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ fontWeight: 900, color: '#1f2937' }}>15-Day Trend</Typography>
                <Button size="small" variant="outlined" sx={{ borderRadius: '12px', color: '#6b7280', borderColor: '#e3e8f1', fontWeight: 700, px: 2 }}>
                  Last 15 Days
                </Button>
              </Stack>
              <Box sx={{ height: 220, display: 'grid', gridTemplateColumns: 'repeat(15, 1fr)', alignItems: 'end', gap: 1.5, px: { xs: 0, md: 2 } }}>
                {trendValues.map((h, i) => (
                  <Box
                    key={i}
                    sx={{
                      height: `${h}%`,
                      bgcolor: i === 14 ? '#5346e0' : alpha('#5346e0', 0.1),
                      borderRadius: '6px 6px 0 0',
                      transition: 'all 0.3s ease'
                    }}
                  />
                ))}
              </Box>
              <Stack direction="row" justifyContent="space-between" sx={{ mt: 3, px: 1 }}>
                <Typography sx={{ fontSize: '11px', color: '#9ca3af', fontWeight: 800 }}>{trendStartLabel}</Typography>
                <Typography sx={{ fontSize: '11px', color: '#1f2937', fontWeight: 900 }}>{trendEndLabel}</Typography>
              </Stack>

              <Box
                sx={{
                  mt: 4,
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(5, 1fr)' },
                  gap: 2.5,
                }}
              >
                {[
                  { label: 'Average Attendance', value: `${attendanceRate}%`, tone: '#16a34a' },
                  { label: 'Total Present', value: presentCount, tone: '#22c55e' },
                  { label: 'Total Absent', value: absentCount, tone: '#ef4444' },
                  { label: 'Total Late', value: lateCount, tone: '#f59e0b' },
                  { label: 'Total Students', value: totalStudents, tone: '#1f2937' },
                ].map((card) => (
                  <Paper key={card.label} elevation={0} sx={{ p: 2.5, borderRadius: '18px', border: '1px solid #eef2f6', bgcolor: '#f9fafb' }}>
                    <Typography sx={{ fontSize: 11, fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.7px' }}>
                      {card.label}
                    </Typography>
                    <Typography sx={{ mt: 1, fontSize: 20, fontWeight: 900, color: card.tone }}>
                      {card.value}
                    </Typography>
                  </Paper>
                ))}
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {/* Tabular Search & Filters */}
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} sx={{ mb: 4 }}>
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
          <Stack direction="row" sx={{ bgcolor: '#fff', borderRadius: '16px', p: 0.7, border: '1px solid #e3e8f1', minWidth: 'max-content', flexWrap: 'wrap', gap: 0.5 }}>
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
            <Box sx={{ px: 3, display: 'grid', gridTemplateColumns: { xs: '1fr', md: '130px 2.4fr 140px 2.4fr 80px' }, columnGap: 2 }}>
              <Typography sx={{ fontSize: '11px', fontWeight: 800, color: '#9ca3af', letterSpacing: '0.8px' }}>ID</Typography>
              <Typography sx={{ fontSize: '11px', fontWeight: 800, color: '#9ca3af', letterSpacing: '0.8px' }}>NAME</Typography>
              <Typography sx={{ fontSize: '11px', fontWeight: 800, color: '#9ca3af', letterSpacing: '0.8px' }}>STATUS</Typography>
              <Typography sx={{ fontSize: '11px', fontWeight: 800, color: '#9ca3af', letterSpacing: '0.8px' }}>REMARKS</Typography>
              <Typography sx={{ fontSize: '11px', fontWeight: 800, color: '#9ca3af', letterSpacing: '0.8px', textAlign: { md: 'right' } }}>ACTION</Typography>
            </Box>
          </Box>
          {filteredStudents.map((student, idx) => {
            const status = statusById.get(String(student._id)) || ATTENDANCE_STATUS.PRESENT;
            const remarks = remarksById.get(String(student._id)) || '';
            const tone = status === ATTENDANCE_STATUS.PRESENT
              ? { bg: alpha('#00c853', 0.1), fg: '#00c853' }
              : status === ATTENDANCE_STATUS.LATE
                ? { bg: alpha('#ff9100', 0.12), fg: '#ff9100' }
                : { bg: alpha('#ff3d00', 0.12), fg: '#ff3d00' };
            return (
              <Box key={student._id}>
                <Box sx={{ px: 5, py: 3, display: 'grid', gridTemplateColumns: { xs: '1fr', md: '130px 2.4fr 140px 2.4fr 80px' }, columnGap: 2, rowGap: { xs: 1.5, md: 0 }, alignItems: 'center', bgcolor: '#fff', transition: 'all 0.2s', '&:hover': { bgcolor: alpha('#5346e0', 0.01) } }}>
                  <Typography sx={{ fontWeight: 800, color: '#9ca3af', fontSize: '13px' }}>
                    {student.rollNo ? `#${String(student.rollNo).padStart(3, '0')}` : student.admissionNo || `#STU-${1000 + idx}`}
                  </Typography>
                  <Stack direction="row" spacing={3} alignItems="center">
                    <Avatar src={student.profilePhotoUrl} sx={{ width: 40, height: 40, border: '2px solid #fcfcfd', boxShadow: '0 2px 6px rgba(0,0,0,0.06)' }} />
                    <Box>
                      <Typography sx={{ fontWeight: 900, color: '#1f2937', fontSize: '15px' }}>{student.name}</Typography>
                      <Typography sx={{ color: '#6b7280', fontWeight: 700, fontSize: '12px' }}>{sectionName}</Typography>
                    </Box>
                  </Stack>
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
                  <Typography sx={{ color: remarks ? '#374151' : '#9ca3af', fontWeight: 600, fontSize: '13px' }}>
                    {remarks || '—'}
                  </Typography>
                  <Box sx={{ textAlign: { md: 'right' } }}>
                    <IconButton size="small" sx={{ color: '#d1d5db' }}><MoreIcon /></IconButton>
                  </Box>
                </Box>
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
