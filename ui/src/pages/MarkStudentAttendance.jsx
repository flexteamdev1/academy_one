import React, { useEffect, useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Stack,
  Grid,
  Button,
  Avatar,
  IconButton,
  TextField,
  Chip,
  Paper,
  CircularProgress,
  ToggleButton,
  ToggleButtonGroup,
  Popover,
} from '@mui/material';
import {
  CalendarToday as CalendarIcon,
  RotateLeft as HistoryIcon,
  CheckCircle as CheckCircleIcon,
  ChatBubbleOutline as RemarksIcon,
  KeyboardArrowLeft as PrevIcon,
  KeyboardArrowRight as NextIcon,
  CloudUpload as SubmitIcon,
  Lock as LockIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { getAttendance, upsertAttendance } from '../services/attendanceService';
import { ATTENDANCE_STATUS } from '../constants/enums';
import { listClasses } from '../services/classService';
import { getUserInfo, getUserRole } from '../utils/auth';
import { filterClassesForTeacher, getTeacherId, normalizeSectionName } from '../utils/teacherAccess';

const toISODate = (value) => new Date(value).toISOString().slice(0, 10);
const formatShortDate = (value) =>
  new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

const MarkStudentAttendance = () => {
  const { classId, sectionName } = useParams();
  const navigate = useNavigate();
  const today = toISODate(new Date());
  const user = getUserInfo();
  const role = getUserRole();
  const teacherId = role === 'teacher' ? getTeacherId(user) : '';

  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [statusById, setStatusById] = useState({});
  const [remarksById, setRemarksById] = useState({});
  const [saving, setSaving] = useState(false);

  const [anchorEl, setAnchorEl] = useState(null);
  const [currentStudentId, setCurrentStudentId] = useState(null);

  useEffect(() => {
    const fetchRoster = async () => {
      setLoading(true);
      try {
        const res = await getAttendance({
          classId,
          sectionName,
          date: today,
          includeStudents: true
        });
        setStudents(res.students || []);

        const initialStatus = {};
        const initialRemarks = {};
        (res.attendance?.records || []).forEach(record => {
          initialStatus[record.studentId] = record.status;
          initialRemarks[record.studentId] = record.remarks || '';
        });
        setStatusById(initialStatus);
        setRemarksById(initialRemarks);
      } catch (err) {
        console.error('Failed to fetch roster:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRoster();
  }, [classId, sectionName, today]);

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

  const stats = useMemo(() => {
    const counts = { present: 0, absent: 0, late: 0, total: students.length };
    Object.values(statusById).forEach(status => {
      if (status === ATTENDANCE_STATUS.PRESENT) counts.present++;
      if (status === ATTENDANCE_STATUS.LATE) counts.late++;
      if (status === ATTENDANCE_STATUS.ABSENT) counts.absent++;
    });
    return counts;
  }, [students, statusById]);

  const handleStatusChange = (studentId, status) => {
    setStatusById(prev => ({ ...prev, [studentId]: status }));
  };

  const handleMarkAllPresent = () => {
    const next = { ...statusById };
    students.forEach(s => {
      if (!s.name.includes('(Medical Leave)')) {
        next[s._id] = ATTENDANCE_STATUS.PRESENT;
      }
    });
    setStatusById(next);
  };

  const handleFinalize = async () => {
    setSaving(true);
    try {
      const records = students.map(s => ({
        studentId: s._id,
        status: statusById[s._id] || ATTENDANCE_STATUS.PRESENT,
        remarks: remarksById[s._id] || ''
      }));
      await upsertAttendance({
        classId,
        sectionName,
        date: today,
        records
      });
      navigate('/attendance');
    } catch (err) {
      console.error('Failed to save attendance:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleRemarksClick = (event, studentId) => {
    setAnchorEl(event.currentTarget);
    setCurrentStudentId(studentId);
  };

  const classLabel = useMemo(() => {
    if (classId && sectionName) return `Grade ${classId}-${sectionName}`;
    if (classId) return String(classId);
    return 'Class';
  }, [classId, sectionName]);

  const todayLabel = `Today, ${formatShortDate(today)}`;

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        bgcolor: '#f5f6fa',
        minHeight: '100vh',
        py: 2,
        mx: { xs: -1.5, md: -3 }
      }}
    >
      <Box
        sx={{
          width: '100%',
          px: { xs: 2, md: 3 },
          pb: 2
        }}
      >
        <Box
          sx={{
            borderRadius: 0,
            border: 'none',
            bgcolor: 'transparent',
            boxShadow: 'none',
            p: 0
          }}
        >
          {/* Filter Bar */}
          <Paper elevation={0} sx={{ p: 2.2, borderRadius: '14px', border: '1px solid #e6e9f0', mb: 2.5, bgcolor: '#fff' }}>
            <Grid container spacing={3} alignItems="center">
              <Grid item>
                <Typography sx={{ fontSize: '11px', fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', mb: 1.5, letterSpacing: '0.8px' }}>
                  SELECT CLASS
                </Typography>
                <Stack direction="row" spacing={1.2}>
                  <Button
                    variant="outlined"
                    disableElevation
                    sx={{
                      borderRadius: '12px',
                      bgcolor: '#f8fafc',
                      color: '#475467',
                      borderColor: '#e5e7eb',
                      fontWeight: 800,
                      textTransform: 'none',
                      px: 2.5,
                      py: 0.8,
                      fontSize: '13px'
                    }}
                  >
                    {classLabel}
                  </Button>
                </Stack>
              </Grid>

              <Grid item>
                <Typography sx={{ fontSize: '11px', fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', mb: 1.5, letterSpacing: '0.8px' }}>
                  ATTENDANCE DATE
                </Typography>
                <Stack direction="row" spacing={1.2}>
                  <Button
                    variant="outlined"
                    disableElevation
                    startIcon={<CalendarIcon sx={{ fontSize: 18 }} />}
                    sx={{
                      borderRadius: '12px',
                      bgcolor: '#eceeff',
                      color: '#4c5eea',
                      borderColor: 'transparent',
                      fontWeight: 700,
                      textTransform: 'none',
                      px: 2.5,
                      py: 0.8,
                      fontSize: '13px',
                      '&:hover': { bgcolor: '#e4e7ff', borderColor: 'transparent' }
                    }}
                  >
                    {todayLabel}
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<HistoryIcon sx={{ fontSize: 18 }} />}
                    onClick={() => navigate(`/attendance/details/${classId}/${sectionName}/${today}`)}
                    sx={{
                      borderRadius: '12px',
                      borderColor: '#e5e7eb',
                      color: '#667085',
                      fontWeight: 700,
                      textTransform: 'none',
                      px: 2.5,
                      py: 0.8,
                      fontSize: '13px'
                    }}
                  >
                    History
                  </Button>
                </Stack>
              </Grid>

              <Grid item sx={{ ml: 'auto' }}>
                <Button
                  variant="outlined"
                  startIcon={<CheckCircleIcon sx={{ color: '#344054' }} />}
                  onClick={handleMarkAllPresent}
                  sx={{
                    borderRadius: '12px',
                    borderColor: '#e5e7eb',
                    color: '#475467',
                    fontWeight: 800,
                    textTransform: 'none',
                    px: 3.5,
                    py: 0.8,
                    fontSize: '13px'
                  }}
                >
                  Mark All Present
                </Button>
              </Grid>
            </Grid>
          </Paper>

          {/* Table Container */}
          <Paper elevation={0} sx={{ borderRadius: '14px', border: '1px solid #e6e9f0', overflow: 'hidden', bgcolor: '#fff' }}>
            <Box sx={{ p: 2, bgcolor: '#f9fafb', borderBottom: '1px solid #e6e9f0' }}>
              <Grid container sx={{ px: 2 }}>
                <Grid item xs={2}><Typography sx={{ fontSize: '10px', fontWeight: 800, color: '#9ca3af', letterSpacing: '1px' }}>ROLL NO</Typography></Grid>
                <Grid item xs={4}><Typography sx={{ fontSize: '10px', fontWeight: 800, color: '#9ca3af', letterSpacing: '1px' }}>STUDENT PROFILE</Typography></Grid>
                <Grid item xs={4} sx={{ textAlign: 'center' }}><Typography sx={{ fontSize: '10px', fontWeight: 800, color: '#9ca3af', letterSpacing: '1px' }}>ATTENDANCE STATUS</Typography></Grid>
                <Grid item xs={2} sx={{ textAlign: 'right' }}><Typography sx={{ fontSize: '10px', fontWeight: 800, color: '#9ca3af', letterSpacing: '1px' }}>REMARKS</Typography></Grid>
              </Grid>
            </Box>

            <Box sx={{ minHeight: '320px' }}>
              {students.map((student, idx) => {
                const isExcused = student.name.includes('(Medical Leave)');
                const currentStatus = statusById[student._id] || ATTENDANCE_STATUS.PRESENT;
                const rollValue = student.rollNo || idx + 1;

                return (
                  <Box key={student._id} sx={{ transition: 'all 0.2s', borderBottom: '1px solid #f3f4f6', '&:hover': { bgcolor: '#fcfcfd' } }}>
                    <Grid container alignItems="center" sx={{ px: 3, py: 2 }}>
                      <Grid item xs={2}>
                        <Typography sx={{ fontWeight: 700, color: '#9ca3af', fontSize: '14px' }}>#{String(rollValue).padStart(3, '0')}</Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Stack direction="row" spacing={2.5} alignItems="center">
                          <Avatar src={student.profilePhotoUrl} sx={{ width: 34, height: 34, border: '2px solid #fff', boxShadow: '0 2px 6px rgba(0,0,0,0.06)' }} />
                          <Typography sx={{ fontWeight: 800, color: isExcused ? '#9ca3af' : '#344054', fontSize: '14px', fontStyle: isExcused ? 'italic' : 'normal' }}>
                            {student.name} {isExcused && <LockIcon sx={{ fontSize: 15, ml: 1, verticalAlign: 'middle', color: '#9ca3af' }} />}
                          </Typography>
                        </Stack>
                      </Grid>
                      <Grid item xs={4} sx={{ display: 'flex', justifyContent: 'center' }}>
                        {isExcused ? (
                          <Chip
                            label="EXCUSED"
                            sx={{
                              bgcolor: '#f1f3f4',
                              color: '#5f6368',
                              fontWeight: 800,
                              borderRadius: '50px',
                              fontSize: '11px',
                              px: 2
                            }}
                          />
                        ) : (
                          <ToggleButtonGroup
                            exclusive
                            value={currentStatus}
                            onChange={(_, val) => val && handleStatusChange(student._id, val)}
                            sx={{
                              bgcolor: '#f9fafb',
                              borderRadius: '999px',
                              p: '3px',
                              border: '1px solid #e5e7eb',
                              '& .MuiToggleButton-root': {
                                border: 'none',
                                borderRadius: '999px',
                                textTransform: 'uppercase',
                                fontWeight: 800,
                                fontSize: '10px',
                                px: 2.4,
                                py: 0.45,
                                minWidth: 76,
                                color: '#9ca3af',
                                '&.Mui-selected': {
                                  color: '#fff',
                                  '&:hover': { opacity: 0.92 }
                                }
                              },
                              '& .MuiToggleButton-root[value="PRESENT"].Mui-selected': { bgcolor: '#16b364' },
                              '& .MuiToggleButton-root[value="LATE"].Mui-selected': { bgcolor: '#f79009' },
                              '& .MuiToggleButton-root[value="ABSENT"].Mui-selected': { bgcolor: '#f04438' }
                            }}
                          >
                            <ToggleButton value={ATTENDANCE_STATUS.PRESENT}>PRESENT</ToggleButton>
                            <ToggleButton value={ATTENDANCE_STATUS.LATE}>LATE</ToggleButton>
                            <ToggleButton value={ATTENDANCE_STATUS.ABSENT}>ABSENT</ToggleButton>
                          </ToggleButtonGroup>
                        )}
                      </Grid>
                      <Grid item xs={2} sx={{ textAlign: 'right' }}>
                        <IconButton
                          onClick={(e) => handleRemarksClick(e, student._id)}
                          disabled={isExcused}
                          sx={{
                            color: remarksById[student._id] ? '#4c5eea' : '#d1d5db',
                            transition: 'all 0.2s'
                          }}
                        >
                          <RemarksIcon sx={{ fontSize: 20 }} />
                        </IconButton>
                      </Grid>
                    </Grid>
                  </Box>
                );
              })}
            </Box>

            {/* Footer info */}
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#f9fafb' }}>
              <Typography sx={{ color: '#98a2b3', fontSize: '12.5px', fontWeight: 700 }}>
                Showing {students.length} of {students.length} students in {classLabel}
              </Typography>
              <Stack direction="row" spacing={1.2}>
                <IconButton disabled sx={{ border: '1px solid #e5e7eb', borderRadius: '10px', p: 0.6, color: '#d1d5db' }}><PrevIcon fontSize="small" /></IconButton>
                <IconButton disabled sx={{ border: '1px solid #e5e7eb', borderRadius: '10px', p: 0.6, color: '#475467' }}><NextIcon fontSize="small" /></IconButton>
              </Stack>
            </Box>
          </Paper>

          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', gap: 3, color: '#98a2b3', fontWeight: 700, fontSize: '11px' }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: '#16b364' }} />
              <Typography sx={{ fontSize: '11px', fontWeight: 800 }}>PRESENT</Typography>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#f79009' }} />
              <Typography sx={{ fontSize: '11px', fontWeight: 800 }}>LATE</Typography>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#f04438' }} />
              <Typography sx={{ fontSize: '11px', fontWeight: 800 }}>ABSENT</Typography>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <LockIcon sx={{ fontSize: 14, color: '#9ca3af' }} />
              <Typography sx={{ fontSize: '11px', fontWeight: 800 }}>READ ONLY</Typography>
            </Stack>
          </Box>

          {/* Action Footer */}
          <Box sx={{
            mt: 2.5,
            bgcolor: '#fff',
            borderTop: '1px solid #e6e9f0',
            px: 2.5,
            py: 2,
            borderRadius: '14px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: '0 8px 18px rgba(16, 24, 40, 0.05)'
          }}>
            <Stack direction="row" spacing={4} alignItems="center">
              <Typography sx={{ fontWeight: 700, color: '#98a2b3', fontSize: '13px' }}>
                Present: <Box component="span" sx={{ color: '#16b364', ml: 1 }}>{stats.present}</Box>
              </Typography>
              <Typography sx={{ fontWeight: 700, color: '#98a2b3', fontSize: '13px' }}>
                Absent: <Box component="span" sx={{ color: '#f04438', ml: 1 }}>{stats.absent}</Box>
              </Typography>
              <Typography sx={{ fontWeight: 700, color: '#98a2b3', fontSize: '13px' }}>
                Late: <Box component="span" sx={{ color: '#f79009', ml: 1 }}>{stats.late}</Box>
              </Typography>
            </Stack>

            <Stack direction="row" spacing={2}>
              <Button
                variant="outlined"
                onClick={() => navigate('/attendance')}
                sx={{
                  borderRadius: '12px',
                  borderColor: '#e5e7eb',
                  color: '#475467',
                  textTransform: 'none',
                  fontWeight: 800,
                  px: 3.5,
                  py: 1,
                  fontSize: '13px',
                  '&:hover': { borderColor: '#d1d5db', bgcolor: '#f9fafb' }
                }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                disableElevation
                onClick={handleFinalize}
                disabled={saving}
                startIcon={saving ? <CircularProgress size={18} color="inherit" /> : <SubmitIcon sx={{ fontSize: 18 }} />}
                sx={{
                  borderRadius: '12px',
                  bgcolor: '#4c4ee8',
                  color: '#fff',
                  textTransform: 'none',
                  fontWeight: 800,
                  px: 4.2,
                  py: 1,
                  fontSize: '13px',
                  boxShadow: '0 8px 16px rgba(76, 78, 232, 0.25)',
                  '&:hover': { bgcolor: '#3f41cc' }
                }}
              >
                Submit Attendance
              </Button>
            </Stack>
          </Box>
        </Box>
      </Box>

      {/* Remarks Popover */}
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{ sx: { borderRadius: '16px', p: 3, width: 340, boxShadow: '0 20px 50px rgba(0,0,0,0.12)', border: '1px solid #e6e9f0' } }}
      >
        <Typography sx={{ fontWeight: 900, mb: 2, color: '#374151', fontSize: '14px', letterSpacing: '0.5px' }}>ADD REMARK</Typography>
        <TextField
          multiline
          rows={4}
          fullWidth
          size="small"
          value={remarksById[currentStudentId] || ''}
          placeholder="Type any specific note about the student's attendance..."
          onChange={(e) => setRemarksById({ ...remarksById, [currentStudentId]: e.target.value })}
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: '16px', fontSize: '14px', bgcolor: '#fcfcfd' } }}
        />
        <Button
          fullWidth
          variant="contained"
          disableElevation
          onClick={() => setAnchorEl(null)}
          sx={{ mt: 2.5, borderRadius: '14px', py: 1.5, textTransform: 'none', fontWeight: 800, bgcolor: '#5346e0' }}
        >
          Save Remark
        </Button>
      </Popover>
    </Box>
  );
};

export default MarkStudentAttendance;
