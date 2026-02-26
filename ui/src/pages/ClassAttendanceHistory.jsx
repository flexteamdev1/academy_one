import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Typography,
  Stack,
  Grid,
  Paper,
  Select,
  MenuItem,
  Button,
  CircularProgress,
  Chip,
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  History as HistoryIcon,
  EventNote as CalendarIcon,
  TrendingUp as TrendIcon,
  ArrowForward as ArrowIcon,
  Lock as LockIcon,
  LockOpen as UnlockIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { listClasses } from '../services/classService';
import { getAttendanceHistory } from '../services/attendanceService';
import { CLASS_STATUS } from '../constants/enums';
import { getUserInfo, getUserRole } from '../utils/auth';
import { filterClassesForTeacher, getTeacherId, normalizeSectionName } from '../utils/teacherAccess';

const toISODate = (value) => new Date(value).toISOString().slice(0, 10);

const ClassAttendanceHistory = () => {
  const { classId, sectionName } = useParams();
  const navigate = useNavigate();
  const user = getUserInfo();
  const teacherId = getUserRole() === 'teacher' ? getTeacherId(user) : '';

  const [classCatalog, setClassCatalog] = useState([]);
  const [assignedSectionsByClass, setAssignedSectionsByClass] = useState({});
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return toISODate(date);
  });
  const [endDate, setEndDate] = useState(() => toISODate(new Date()));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [history, setHistory] = useState({ items: [], studentCount: 0 });

  const normalizedSectionParam = normalizeSectionName(sectionName);

  useEffect(() => {
    const loadClasses = async () => {
      setError('');
      try {
        const response = await listClasses({ page: 1, limit: 200, status: CLASS_STATUS.ACTIVE });
        const items = response.items || [];
        if (teacherId) {
          const filtered = filterClassesForTeacher(items, teacherId);
          setClassCatalog(filtered.classes);
          setAssignedSectionsByClass(filtered.assignedSectionsByClass);
        } else {
          setClassCatalog(items);
          setAssignedSectionsByClass({});
        }
      } catch (err) {
        setError(err.message || 'Failed to load classes');
      }
    };
    loadClasses();
  }, [teacherId]);

  const selectedClass = useMemo(
    () => classCatalog.find((item) => String(item._id) === String(selectedClassId)) || null,
    [classCatalog, selectedClassId]
  );

  const sectionOptions = useMemo(() => {
    if (!selectedClass?.sections?.length) return [];
    const assigned = assignedSectionsByClass[selectedClassId];
    if (assigned?.length) return [...assigned].sort();
    return selectedClass.sections
      .map((section) => normalizeSectionName(section.name))
      .filter(Boolean)
      .sort();
  }, [selectedClass, selectedClassId, assignedSectionsByClass]);

  useEffect(() => {
    if (!classCatalog.length) return;
    const isAllowedClass = classCatalog.some((item) => String(item._id) === String(classId));
    const allowedSections = assignedSectionsByClass[classId] || [];
    const isAllowedSection = !allowedSections.length || allowedSections.includes(normalizedSectionParam);

    if (classId && normalizedSectionParam && isAllowedClass && isAllowedSection) {
      setSelectedClassId(String(classId));
      setSelectedSection(normalizedSectionParam);
      return;
    }

    const firstClass = classCatalog[0];
    if (firstClass) {
      setSelectedClassId(String(firstClass._id));
    }
  }, [classCatalog, classId, normalizedSectionParam, assignedSectionsByClass]);

  useEffect(() => {
    if (!sectionOptions.length) return;
    if (!selectedSection || !sectionOptions.includes(selectedSection)) {
      setSelectedSection(sectionOptions[0]);
    }
  }, [sectionOptions, selectedSection]);

  useEffect(() => {
    if (!selectedClassId || !selectedSection) return;
    if (String(classId) !== String(selectedClassId) || normalizeSectionName(sectionName) !== selectedSection) {
      navigate(`/attendance/history/${selectedClassId}/${selectedSection}`, { replace: true });
    }
  }, [selectedClassId, selectedSection, classId, sectionName, navigate]);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!selectedClassId || !selectedSection) return;
      setLoading(true);
      setError('');
      try {
        const response = await getAttendanceHistory({
          classId: selectedClassId,
          sectionName: selectedSection,
          startDate,
          endDate,
        });
        setHistory(response);
      } catch (err) {
        setError(err.message || 'Failed to load attendance history');
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [selectedClassId, selectedSection, startDate, endDate]);

  const stats = useMemo(() => {
    const items = history.items || [];
    if (!items.length) {
      return {
        totalSessions: 0,
        avgAttendance: 0,
        totalPresent: 0,
        totalAbsent: 0,
        totalLate: 0,
      };
    }

    let totalPresent = 0;
    let totalAbsent = 0;
    let totalLate = 0;
    items.forEach((item) => {
      totalPresent += item.stats?.present || 0;
      totalAbsent += item.stats?.absent || 0;
      totalLate += item.stats?.late || 0;
    });

    const studentCount = history.studentCount || 0;
    const totalSessions = items.length;
    const totalPossible = studentCount * totalSessions;
    const avgAttendance = totalPossible ? (totalPresent / totalPossible) * 100 : 0;

    return {
      totalSessions,
      avgAttendance: parseFloat(avgAttendance.toFixed(1)),
      totalPresent,
      totalAbsent,
      totalLate,
    };
  }, [history]);

  const getStatusChip = (item) => {
    if (item.isLocked) {
      return <Chip size="small" icon={<LockIcon sx={{ fontSize: 14 }} />} label="Locked" sx={{ bgcolor: '#eef2ff', color: '#4338ca', fontWeight: 700 }} />;
    }
    return <Chip size="small" icon={<UnlockIcon sx={{ fontSize: 14 }} />} label="Editable" sx={{ bgcolor: '#ecfdf3', color: '#15803d', fontWeight: 700 }} />;
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, pb: 10, bgcolor: '#f4f7fe', minHeight: '100vh' }}>
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} spacing={2} sx={{ mb: 4 }}>
        <Stack spacing={0.5}>
          <Typography variant="h3" sx={{ fontWeight: 900, color: '#1f2937' }}>Attendance History</Typography>
          <Typography sx={{ color: '#6b7280', fontWeight: 600 }}>
            Review submissions for {selectedClass?.name || 'Class'} - Section {selectedSection || 'N/A'}
          </Typography>
        </Stack>
        <Button
          variant="outlined"
          startIcon={<HistoryIcon />}
          onClick={() => navigate('/attendance')}
          sx={{
            borderRadius: '12px',
            borderColor: '#e5e7eb',
            color: '#374151',
            fontWeight: 700,
            textTransform: 'none',
          }}
        >
          Back to Marking
        </Button>
      </Stack>

      <Paper elevation={0} sx={{ p: { xs: 2.5, md: 3 }, borderRadius: '24px', border: '1px solid #e3e8f1', mb: 4, bgcolor: '#fff' }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={4}>
            <Typography sx={{ fontSize: 11, fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', mb: 1, letterSpacing: '0.8px' }}>
              Class & Section
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
              <Select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                size="small"
                sx={{ minWidth: 140, borderRadius: '12px', fontWeight: 700, bgcolor: '#f8f9fa' }}
              >
                {classCatalog.map((cls) => (
                  <MenuItem key={cls._id} value={cls._id}>{cls.name}</MenuItem>
                ))}
              </Select>
              <Select
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                size="small"
                sx={{ minWidth: 90, borderRadius: '12px', fontWeight: 700, bgcolor: '#f8f9fa' }}
              >
                {sectionOptions.map((sec) => (
                  <MenuItem key={sec} value={sec}>{sec}</MenuItem>
                ))}
              </Select>
            </Stack>
          </Grid>

          <Grid item xs={12} md={5}>
            <Typography sx={{ fontSize: 11, fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', mb: 1, letterSpacing: '0.8px' }}>
              Date Range
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ sm: 'center' }}>
              <TextField
                type="date"
                size="small"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CalendarIcon sx={{ color: '#94a3b8' }} />
                    </InputAdornment>
                  )
                }}
                sx={{ minWidth: 170, '& .MuiOutlinedInput-root': { borderRadius: '12px', bgcolor: '#fff' } }}
              />
              <Typography sx={{ color: '#9ca3af', fontWeight: 700 }}>to</Typography>
              <TextField
                type="date"
                size="small"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                sx={{ minWidth: 170, '& .MuiOutlinedInput-root': { borderRadius: '12px', bgcolor: '#fff' } }}
              />
            </Stack>
          </Grid>

          <Grid item xs={12} md={3}>
            <Stack direction="row" spacing={2} justifyContent={{ xs: 'flex-start', md: 'flex-end' }}>
              <Button
                variant="contained"
                disableElevation
                startIcon={<TrendIcon />}
                sx={{
                  borderRadius: '12px',
                  bgcolor: '#5346e0',
                  fontWeight: 800,
                  textTransform: 'none',
                  px: 3,
                  '&:hover': { bgcolor: '#4035b3' }
                }}
              >
                Generate Report
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {error ? (
            <Paper elevation={0} sx={{ p: 3, borderRadius: '16px', border: '1px solid #fee2e2', bgcolor: '#fff1f2', color: '#b91c1c', mb: 4 }}>
              {error}
            </Paper>
          ) : null}

          <Box
            sx={{
              mb: 4,
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(5, 1fr)' },
              gap: 3,
            }}
          >
            {[
              { label: 'Sessions Recorded', value: stats.totalSessions, color: '#111827' },
              { label: 'Average Attendance', value: `${stats.avgAttendance}%`, color: '#16a34a' },
              { label: 'Total Present', value: stats.totalPresent, color: '#22c55e' },
              { label: 'Total Absent', value: stats.totalAbsent, color: '#ef4444' },
              { label: 'Total Late', value: stats.totalLate, color: '#f59e0b' },
            ].map((card) => (
              <Paper key={card.label} elevation={0} sx={{ p: 3, borderRadius: '20px', border: '1px solid #e3e8f1', bgcolor: '#fff' }}>
                <Typography sx={{ fontSize: 11, fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                  {card.label}
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 900, color: card.color, mt: 1 }}>{card.value}</Typography>
              </Paper>
            ))}
          </Box>

          <Paper elevation={0} sx={{ borderRadius: '24px', border: '1px solid #e3e8f1', overflow: 'hidden', bgcolor: '#fff' }}>
            <Box sx={{ p: 3, borderBottom: '1px solid #eef2f6', bgcolor: '#fcfcfd' }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2.2fr 2.4fr 1.3fr 1fr' }, columnGap: 2 }}>
                <Typography sx={{ fontSize: 11, fontWeight: 800, color: '#9ca3af', letterSpacing: '1px' }}>DATE</Typography>
                <Typography sx={{ fontSize: 11, fontWeight: 800, color: '#9ca3af', letterSpacing: '1px' }}>SUMMARY</Typography>
                <Typography sx={{ fontSize: 11, fontWeight: 800, color: '#9ca3af', letterSpacing: '1px' }}>STATUS</Typography>
                <Typography sx={{ fontSize: 11, fontWeight: 800, color: '#9ca3af', letterSpacing: '1px', textAlign: { md: 'right' } }}>DETAILS</Typography>
              </Box>
            </Box>

            <Box>
              {(history.items || []).map((item) => {
                const dateLabel = new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                const attendanceRate = item.attendanceRate || 0;
                const targetColor = attendanceRate >= 95 ? '#16a34a' : attendanceRate >= 85 ? '#f59e0b' : '#ef4444';

                return (
                  <Box key={item._id} sx={{ borderBottom: '1px solid #f1f5f9', px: 3, py: 2.5, '&:hover': { bgcolor: '#fcfcfd' } }}>
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2.2fr 2.4fr 1.3fr 1fr' }, columnGap: 2, rowGap: 1.5, alignItems: 'center' }}>
                      <Box>
                        <Typography sx={{ fontWeight: 800, color: '#111827' }}>{dateLabel}</Typography>
                        <Typography sx={{ color: '#9ca3af', fontSize: 12, fontWeight: 600 }}>
                          {item.stats?.total || 0} records • {history.studentCount || 0} students
                        </Typography>
                      </Box>
                      <Stack direction="row" spacing={2} flexWrap="wrap">
                        <Typography sx={{ fontWeight: 700, color: '#22c55e' }}>P {item.stats?.present || 0}</Typography>
                        <Typography sx={{ fontWeight: 700, color: '#ef4444' }}>A {item.stats?.absent || 0}</Typography>
                        <Typography sx={{ fontWeight: 700, color: '#f59e0b' }}>L {item.stats?.late || 0}</Typography>
                        <Typography sx={{ fontWeight: 800, color: targetColor }}>{attendanceRate}%</Typography>
                      </Stack>
                      <Box>
                        {getStatusChip(item)}
                      </Box>
                      <Box sx={{ textAlign: { md: 'right' } }}>
                        <Button
                          size="small"
                          endIcon={<ArrowIcon sx={{ fontSize: 16 }} />}
                          onClick={() => navigate(`/attendance/details/${selectedClassId}/${selectedSection}/${toISODate(item.date)}`)}
                          sx={{ textTransform: 'none', fontWeight: 700, color: '#5346e0' }}
                        >
                          View
                        </Button>
                      </Box>
                    </Box>
                  </Box>
                );
              })}

              {!history.items?.length && !loading && (
                <Box sx={{ p: 6, textAlign: 'center' }}>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#111827', mb: 1 }}>No attendance history yet</Typography>
                  <Typography sx={{ color: '#6b7280' }}>
                    Once attendance is submitted for this class, you will see the timeline here.
                  </Typography>
                </Box>
              )}
            </Box>
          </Paper>
        </>
      )}
    </Box>
  );
};

export default ClassAttendanceHistory;
