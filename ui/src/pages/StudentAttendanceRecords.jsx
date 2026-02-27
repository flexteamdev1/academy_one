import React, { useEffect, useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Stack,
  Button,
  Grid,
  Paper,
  IconButton,
  CircularProgress,
} from '@mui/material';
import {
  FileDownloadOutlined as ExportIcon,
  EventNoteOutlined as ScheduleIcon,
  ChevronLeft as PrevIcon,
  ChevronRight as NextIcon,
  AssessmentOutlined as StatsIcon,
} from '@mui/icons-material';
import { getMyAttendance } from '../services/attendanceService';
import { useUIState } from '../context/UIContext';
import { ATTENDANCE_STATUS } from '../constants/enums';

const StudentAttendanceRecords = () => {
  const { selectedAcademicYearId } = useUIState();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ student: {}, stats: {}, dailyRecords: [] });
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const today = useMemo(() => new Date(), []);
  const [selectedDay, setSelectedDay] = useState(() => today.getDate());

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const params = { month: currentMonth, year: currentYear };
        if (selectedAcademicYearId) {
          params.academicYearId = selectedAcademicYearId;
        }
        const res = await getMyAttendance(params);
        setData(res);
      } catch (err) {
        console.error('Failed to fetch personal attendance:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedAcademicYearId, currentMonth, currentYear]);

  const monthName = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(new Date(currentYear, currentMonth));

  // Calendar logic
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  const calendarDays = useMemo(() => {
    const days = [];
    // Pad for start of month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push({ day: null, status: 'EMPTY' });
    }
    // Fill days
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = new Date(currentYear, currentMonth, d).toISOString().split('T')[0];
      const record = data.dailyRecords.find(r => r.date.startsWith(dateStr));
      days.push({
        day: d,
        status: record ? record.status : 'NO_RECORD',
        remarks: record ? record.remarks : ''
      });
    }
    return days;
  }, [data.dailyRecords, currentMonth, currentYear, daysInMonth, firstDayOfMonth]);

  const remarkEntries = useMemo(() => {
    return (data.dailyRecords || [])
      .filter((record) => record.remarks && String(record.remarks).trim())
      .map((record) => ({
        date: record.date,
        status: record.status,
        remarks: record.remarks,
      }))
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 4);
  }, [data.dailyRecords]);

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
    setSelectedDay(null);
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
    setSelectedDay(null);
  };

  const goToToday = () => {
    setCurrentMonth(today.getMonth());
    setCurrentYear(today.getFullYear());
    setSelectedDay(today.getDate());
  };

  if (loading && !data.dailyRecords.length) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh', bgcolor: '#f8fafd' }}>
        <CircularProgress size={40} sx={{ color: '#5346e0' }} />
      </Box>
    );
  }

  const studentInfo = data.student || {};
  const stats = data.stats || {};

  return (
    <Box sx={{ p: 4, bgcolor: '#f8fafd', minHeight: '100vh' }}>
      {/* Header */}
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ md: 'flex-start' }} spacing={2} sx={{ mb: 4 }}>
        <Box>
          <Typography variant="h3" sx={{ fontWeight: 900, color: '#1a1d23', mb: 0.5 }}>Attendance Records</Typography>
          <Typography variant="body1" sx={{ color: '#64748b', fontWeight: 600 }}>
            Academic Year {studentInfo.academicYearName || '2023-2024'} • Grade {studentInfo.grade}-{studentInfo.sectionName || 'N/A'}
          </Typography>
        </Box>
        <Stack direction="row" spacing={1.5}>
          <Button
            startIcon={<ExportIcon />}
            variant="outlined"
            sx={{
              borderRadius: '14px',
              borderColor: '#e2e8f0',
              color: '#64748b',
              textTransform: 'none',
              fontWeight: 700,
              px: 2.6,
              '&:hover': { bgcolor: '#fff', borderColor: '#cbd5e1' }
            }}
          >
            Export Report
          </Button>
          <Button
            startIcon={<ScheduleIcon />}
            variant="contained"
            disableElevation
            sx={{
              borderRadius: '14px',
              bgcolor: '#5346e0',
              fontWeight: 700,
              textTransform: 'none',
              px: 2.6,
              '&:hover': { bgcolor: '#4035b3' }
            }}
          >
            View Schedule
          </Button>
        </Stack>
      </Stack>

      {/* Summary Cards */}
      <Box
        sx={{
          mb: 5,
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
          gap: 3,
        }}
      >
        <Paper elevation={0} sx={{ p: 3, borderRadius: '20px', border: '1px solid #eef2f6', bgcolor: '#fff' }}>
          <Stack direction="row" justifyContent="space-between" sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ color: '#64748b', fontWeight: 700 }}>Total Classes</Typography>
            <StatsIcon sx={{ color: '#5346e0', fontSize: 20 }} />
          </Stack>
          <Typography variant="h3" sx={{ fontWeight: 900, mb: 1 }}>{stats.totalClasses || 0}</Typography>
          <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600 }}>Current Month</Typography>
        </Paper>

        <Paper elevation={0} sx={{ p: 3, borderRadius: '20px', border: '1px solid #eef2f6', bgcolor: '#fff' }}>
          <Stack direction="row" justifyContent="space-between" sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ color: '#64748b', fontWeight: 700 }}>Days Present</Typography>
            <Box sx={{ width: 22, height: 22, borderRadius: '50%', bgcolor: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#22c55e' }} />
            </Box>
          </Stack>
          <Typography variant="h3" sx={{ fontWeight: 900, mb: 1 }}>{stats.present || 0}</Typography>
          <Typography variant="caption" sx={{ color: '#22c55e', fontWeight: 800 }}>↗ {stats.attendanceRate || 0}% fulfillment</Typography>
        </Paper>

        <Paper elevation={0} sx={{ p: 3, borderRadius: '20px', border: '1px solid #eef2f6', bgcolor: '#fff' }}>
          <Stack direction="row" justifyContent="space-between" sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ color: '#64748b', fontWeight: 700 }}>Days Absent</Typography>
            <Box sx={{ width: 22, height: 22, borderRadius: '50%', bgcolor: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#ef4444' }} />
            </Box>
          </Stack>
          <Typography variant="h3" sx={{ fontWeight: 900, mb: 1 }}>{stats.absent || 0}</Typography>
          <Typography variant="caption" sx={{ color: '#ef4444', fontWeight: 800 }}>⚠ Above threshold</Typography>
        </Paper>

        <Paper elevation={0} sx={{ p: 3, borderRadius: '20px', bgcolor: '#5346e0', color: '#fff', position: 'relative', overflow: 'hidden' }}>
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Stack direction="row" justifyContent="space-between" sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ color: '#cbd5e1', fontWeight: 700 }}>Attendance %</Typography>
              <Box sx={{ width: 24, height: 24, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography sx={{ fontSize: 14 }}>★</Typography>
              </Box>
            </Stack>
            <Typography variant="h3" sx={{ fontWeight: 900, mb: 2 }}>{stats.attendanceRate || 0}%</Typography>
            <Box sx={{ width: '100%', height: 8, bgcolor: 'rgba(255,255,255,0.2)', borderRadius: 10 }}>
              <Box sx={{ width: `${stats.attendanceRate || 0}%`, height: '100%', bgcolor: '#fff', borderRadius: 10 }} />
            </Box>
          </Box>
          <Box sx={{ position: 'absolute', right: -20, bottom: -20, width: 100, height: 100, borderRadius: '50%', border: '20px solid rgba(255,255,255,0.05)' }} />
        </Paper>
      </Box>

      {/* Main Content Area */}
      <Stack spacing={4}>
        {/* Calendar Section */}
        <Grid item xs={12} md={8}>
          <Paper elevation={0} sx={{ p: 3.5, borderRadius: '28px', border: '1px solid #eef2f6', bgcolor: '#fff' }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                <Stack direction="row" spacing={1.6} alignItems="center">
                  <Typography variant="h5" sx={{ fontWeight: 900, color: '#1a1d23' }}>{monthName} {currentYear}</Typography>
                  <Stack direction="row" spacing={1}>
                    <IconButton size="small" onClick={handlePrevMonth} sx={{ border: '1px solid #e2e8f0', borderRadius: '10px' }}>
                      <PrevIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={handleNextMonth} sx={{ border: '1px solid #e2e8f0', borderRadius: '10px' }}>
                      <NextIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                </Stack>
                <Button size="small" onClick={goToToday} sx={{ textTransform: 'none', fontWeight: 800, color: '#5346e0' }}>Go to Today</Button>
              </Stack>

              {/* Calendar Grid */}
              <Box sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',
                gap: 1.5,
                mt: 2
              }}>
                {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
                  <Box key={day} sx={{ textAlign: 'center', pb: 1.5 }}>
                    <Typography sx={{ fontSize: '12px', fontWeight: 800, color: '#94a3b8', letterSpacing: '0.5px' }}>{day}</Typography>
                  </Box>
                ))}

                {calendarDays.map((dayObj, i) => {
                  const isToday = dayObj.day === today.getDate()
                    && currentMonth === today.getMonth()
                    && currentYear === today.getFullYear();
                  const isSelected = dayObj.day && dayObj.day === selectedDay;

                  return (
                    <Box key={i} sx={{
                      minHeight: 68,
                      borderRadius: '14px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                      bgcolor: dayObj.day ? '#fff' : '#f8fafd',
                      border: isSelected ? '2px solid #4f46e5' : isToday ? '2px solid #5346e0' : '1px solid #eef2f6',
                      transition: 'all 0.2s',
                      cursor: dayObj.day ? 'pointer' : 'default',
                      '&:hover': dayObj.day ? { border: '1px solid #cbd5e1', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' } : {}
                    }}
                    onClick={() => dayObj.day && setSelectedDay(dayObj.day)}
                    >
                      <Typography sx={{
                        fontSize: '15px',
                        fontWeight: dayObj.day ? 800 : 500,
                        color: dayObj.day ? '#1a1d23' : '#cbd5e1'
                      }}>
                        {dayObj.day}
                      </Typography>

                      {dayObj.day && (
                        <Box sx={{ mt: 0.8, display: 'flex', gap: 0.6 }}>
                          {dayObj.status === ATTENDANCE_STATUS.PRESENT && <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#22c55e' }} />}
                          {dayObj.status === ATTENDANCE_STATUS.ABSENT && <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#ef4444' }} />}
                          {dayObj.status === ATTENDANCE_STATUS.LATE && <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#f59e0b' }} />}
                          {dayObj.status === 'HOLIDAY' && <Typography sx={{ fontSize: 10 }}>🎂</Typography>}
                        </Box>
                      )}
                    </Box>
                  );
                })}
              </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          {/* Legend Below Calendar */}
          <Paper elevation={0} sx={{ p: 3.5, borderRadius: '22px', border: '1px solid #eef2f6', bgcolor: '#fff' }}>
            <Typography variant="overline" sx={{ fontWeight: 800, color: '#94a3b8', mb: 3, display: 'block', letterSpacing: '1px' }}>LEGEND</Typography>
            <Stack spacing={2.5}>
              {[
                { label: 'Present (Full Day)', color: '#22c55e' },
                { label: 'Absent', color: '#ef4444' },
                { label: 'Late Arrival', color: '#f59e0b' },
                { label: 'Holiday / Event', color: '#38bdf8' },
                { label: 'No Class Scheduled', color: '#e2e8f0' }
              ].map(item => (
                <Stack key={item.label} direction="row" spacing={2} alignItems="center">
                  <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: item.color }} />
                  <Typography sx={{ fontWeight: 700, color: '#4b5563', fontSize: '14px' }}>{item.label}</Typography>
                </Stack>
              ))}
            </Stack>
          </Paper>

          {/* Instructor Remarks Below Legend */}
          <Paper elevation={0} sx={{ p: 3.5, borderRadius: '22px', border: '1px solid #eef2f6', bgcolor: '#fff', marginTop: '12px' }}>
            <Typography variant="overline" sx={{ fontWeight: 800, color: '#94a3b8', mb: 3, display: 'block', letterSpacing: '1px' }}>INSTRUCTOR REMARKS</Typography>
            {remarkEntries.length ? (
              <Stack spacing={3}>
                {remarkEntries.map((item, i) => {
                  const color = item.status === ATTENDANCE_STATUS.ABSENT
                    ? '#ef4444'
                    : item.status === ATTENDANCE_STATUS.LATE
                      ? '#f59e0b'
                      : '#22c55e';
                  return (
                    <Box key={`${item.date}-${i}`} sx={{ borderLeft: `3px solid ${color}`, pl: 2.5 }}>
                      <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 800 }}>
                        {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </Typography>
                      <Typography sx={{ fontWeight: 900, color: '#1a1d23', fontSize: '14px', mt: 0.5 }}>
                        {item.status === ATTENDANCE_STATUS.ABSENT ? 'Absent' : item.status === ATTENDANCE_STATUS.LATE ? 'Late Arrival' : 'Present'}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5, fontStyle: 'italic', fontSize: '13px' }}>
                        {item.remarks}
                      </Typography>
                    </Box>
                  );
                })}
              </Stack>
            ) : (
              <Typography sx={{ color: '#94a3b8', fontWeight: 600, fontSize: '14px' }}>
                No teacher remarks for this month.
              </Typography>
            )}
          </Paper>
        </Grid>
      </Stack>
    </Box>
  );
};

export default StudentAttendanceRecords;
