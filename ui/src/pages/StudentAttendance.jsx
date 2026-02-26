import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  Fade,
  Paper,
  MenuItem,
  Select,
  Grid,
  CircularProgress,
  Popover,
  LinearProgress
} from '@mui/material';
import {
  CalendarToday as CalendarIcon,
  RotateLeft as HistoryIcon,
  CheckCircle as CheckCircleIcon,
  ChatBubbleOutline as RemarksIcon,
  KeyboardArrowLeft as PrevIcon,
  KeyboardArrowRight as NextIcon,
  CloudUpload as SubmitIcon,
  Lock as LockIcon,
  Search as SearchIcon,
  EventNote as YearIcon
} from '@mui/icons-material';
import { listClasses } from '../services/classService';
import { getAttendance, upsertAttendance } from '../services/attendanceService';
import { useUIState } from '../context/UIContext';
import { ATTENDANCE_STATUS, CLASS_STATUS, STUDENT_STATUS } from '../constants/enums';
import { getUserInfo, getUserRole } from '../utils/auth';
import { filterClassesForTeacher, getTeacherId, normalizeSectionName } from '../utils/teacherAccess';
import { useNavigate } from 'react-router-dom';

const toISODate = (value) => new Date(value).toISOString().slice(0, 10);

const StudentAttendance = () => {
  const { selectedAcademicYearId } = useUIState();
  const user = getUserInfo();
  const role = getUserRole();
  const teacherId = role === 'teacher' ? getTeacherId(user) : '';
  const today = toISODate(new Date());
  const navigate = useNavigate();

  const [selectedDate] = useState(today);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [query, setQuery] = useState('');
  const [viewMode] = useState('all');

  const [classCatalog, setClassCatalog] = useState([]);
  const [assignedSectionsByClass, setAssignedSectionsByClass] = useState({});
  const [students, setStudents] = useState([]);
  const [statusById, setStatusById] = useState({});
  const [remarksById, setRemarksById] = useState({});

  const [error, setError] = useState('');
  const [loadingRoster, setLoadingRoster] = useState(false);
  const [saving, setSaving] = useState(false);

  const [anchorEl, setAnchorEl] = useState(null);
  const [currentStudentId, setCurrentStudentId] = useState(null);

  const canEdit = selectedDate === today;

  const getHistoryLink = () => {
    if (!selectedClassId || !selectedSection) return '/attendance';
    return `/attendance/history/${selectedClassId}/${selectedSection}`;
  };

  // Load Classes
  useEffect(() => {
    const loadClasses = async () => {
      setError('');
      try {
        const response = await listClasses({ page: 1, limit: 100, status: CLASS_STATUS.ACTIVE });
        const items = response.items || [];
        if (teacherId) {
          const filtered = filterClassesForTeacher(items, teacherId);
          setClassCatalog(filtered.classes);
          setAssignedSectionsByClass(filtered.assignedSectionsByClass);
          if (!selectedClassId && filtered.classes.length) {
            setSelectedClassId(filtered.classes[0]._id);
          } else if (selectedClassId && !filtered.classes.some((cls) => cls._id === selectedClassId)) {
            setSelectedClassId(filtered.classes[0]?._id || '');
          }
        } else {
          setClassCatalog(items);
          setAssignedSectionsByClass({});
          if (!selectedClassId && items.length) {
            setSelectedClassId(items[0]._id);
          }
        }
      } catch (err) {
        setError(err.message || 'Failed to load classes');
      }
    };
    loadClasses();
  }, [selectedAcademicYearId, selectedClassId, teacherId]);

  const selectedClass = useMemo(
    () => classCatalog.find((item) => item._id === selectedClassId) || null,
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
    if (!sectionOptions.length) {
      setSelectedSection('');
      return;
    }
    if (!selectedSection || !sectionOptions.includes(selectedSection)) {
      setSelectedSection(sectionOptions[0]);
    }
  }, [sectionOptions, selectedSection]);

  // Load Attendance
  useEffect(() => {
    const loadAttendance = async () => {
      if (!selectedClassId || !selectedSection || !selectedDate) return;
      setError('');
      setLoadingRoster(true);
      try {
        const response = await getAttendance({
          classId: selectedClassId,
          sectionName: selectedSection,
          date: selectedDate,
          includeStudents: true,
          status: STUDENT_STATUS.ACTIVE,
        });

        const roster = response.students || [];
        setStudents(roster);
        const nextStatus = {};
        const nextRemarks = {};
        (response.attendance?.records || []).forEach((record) => {
          nextStatus[String(record.studentId)] = record.status;
          nextRemarks[String(record.studentId)] = record.remarks || '';
        });
        setStatusById(nextStatus);
        setRemarksById(nextRemarks);
      } catch (err) {
        setError(err.message || 'Failed to load attendance');
      } finally {
        setLoadingRoster(false);
      }
    };
    loadAttendance();
  }, [selectedClassId, selectedSection, selectedDate, selectedAcademicYearId]);

  const handleStatusChange = (studentId, status) => {
    if (!canEdit) return;
    setStatusById(prev => ({ ...prev, [String(studentId)]: status }));
  };

  const markAllPresent = () => {
    if (!canEdit) return;
    const next = { ...statusById };
    visibleStudents.forEach((student) => {
      if (!student.name.includes('(Medical Leave)')) {
        next[String(student._id)] = ATTENDANCE_STATUS.PRESENT;
      }
    });
    setStatusById(next);
  };

  const handleFinalize = async () => {
    if (!canEdit || !selectedClassId || !selectedSection) return;
    setSaving(true);
    setError('');
    try {
      const recordsToSave = students.map((student) => ({
        studentId: student._id,
        status: statusById[String(student._id)] || ATTENDANCE_STATUS.PRESENT,
        remarks: remarksById[String(student._id)] || ''
      }));

      await upsertAttendance({
        classId: selectedClassId,
        sectionName: selectedSection,
        date: selectedDate,
        records: recordsToSave,
      });
      setSaving(false);
    } catch (err) {
      setError(err.message || 'Failed to save attendance');
      setSaving(false);
    }
  };

  const visibleStudents = useMemo(() => {
    let filtered = students;
    if (query.trim()) {
      filtered = filtered.filter((student) =>
        student.name.toLowerCase().includes(query.trim().toLowerCase()) ||
        student.admissionNo?.toLowerCase().includes(query.trim().toLowerCase())
      );
    }
    if (viewMode === 'changed') {
      filtered = filtered.filter((student) => statusById[String(student._id)]);
    }
    return filtered;
  }, [students, query, viewMode, statusById]);

  const attendanceStats = useMemo(() => {
    const counts = { present: 0, absent: 0, late: 0, total: students.length };
    students.forEach((student) => {
      const status = statusById[String(student._id)] || ATTENDANCE_STATUS.PRESENT;
      if (status === ATTENDANCE_STATUS.PRESENT) counts.present++;
      if (status === ATTENDANCE_STATUS.LATE) counts.late++;
      if (status === ATTENDANCE_STATUS.ABSENT) counts.absent++;
    });
    return counts;
  }, [students, statusById]);

  const handleRemarksClick = (event, studentId) => {
    setAnchorEl(event.currentTarget);
    setCurrentStudentId(studentId);
  };

  return (
    <Box
      sx={{
        pb: 12,
        bgcolor: '#f4f7fe',
        minHeight: '100vh',
        px: { xs: 2, md: 3 },
        mx: { xs: -1.5, md: -3 }
      }}
    >
      {/* Filter Section */}
      <Paper elevation={0} sx={{ mb: 4, p: 3, borderRadius: '24px', border: '1px solid #e3e8f1', bgcolor: '#fff' }}>
        <Grid container spacing={4} alignItems="flex-end">
          <Grid item>
            <Typography sx={{ fontSize: '11px', fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', mb: 1.5, letterSpacing: '0.8px' }}>
              SELECT CLASS
            </Typography>
            <Stack direction="row" spacing={1.5}>
              <Select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                size="small"
                sx={{
                  minWidth: 140,
                  borderRadius: '14px',
                  fontWeight: 700,
                  bgcolor: '#f8f9fa',
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#5346e0' }
                }}
              >
                {classCatalog.map(cls => (
                  <MenuItem key={cls._id} value={cls._id}>{cls.name}</MenuItem>
                ))}
              </Select>
              <Select
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                size="small"
                sx={{
                  minWidth: 80,
                  borderRadius: '14px',
                  fontWeight: 700,
                  bgcolor: '#f8f9fa',
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#e3e8f1' }
                }}
              >
                {sectionOptions.map(sec => (
                  <MenuItem key={sec} value={sec}>{sec}</MenuItem>
                ))}
              </Select>
            </Stack>
          </Grid>

          <Grid item>
            <Typography sx={{ fontSize: '11px', fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', mb: 1.5, letterSpacing: '0.8px' }}>
              ATTENDANCE DATE
            </Typography>
            <Stack direction="row" spacing={1.5}>
              <Button
                variant="outlined"
                startIcon={<CalendarIcon sx={{ fontSize: 18 }} />}
                sx={{
                  borderRadius: '14px',
                  bgcolor: '#f0f2ff',
                  color: '#5346e0',
                  borderColor: 'transparent',
                  fontWeight: 700,
                  textTransform: 'none',
                  px: 3,
                  py: 1,
                  fontSize: '14px',
                  '&:hover': { bgcolor: '#e0e4ff', borderColor: 'transparent' }
                }}
              >
                Today, {new Date(selectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </Button>
              <Button
                variant="outlined"
                startIcon={<HistoryIcon sx={{ fontSize: 18 }} />}
                onClick={() => navigate(getHistoryLink())}
                sx={{
                  borderRadius: '14px',
                  borderColor: '#e3e8f1',
                  color: '#9ca3af',
                  fontWeight: 700,
                  textTransform: 'none',
                  px: 3,
                  py: 1,
                  fontSize: '14px'
                }}
              >
                History
              </Button>
            </Stack>
          </Grid>

          <Grid item sx={{ ml: 'auto' }}>
            <Button
              variant="outlined"
              startIcon={<CheckCircleIcon sx={{ color: '#374151' }} />}
              onClick={markAllPresent}
              disabled={!canEdit}
              sx={{
                borderRadius: '14px',
                borderColor: '#e3e8f1',
                color: '#374151',
                fontWeight: 800,
                textTransform: 'none',
                px: 4,
                py: 1.2,
                fontSize: '14px'
              }}
            >
              Mark All Present
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Student List Section */}
      <Paper elevation={0} sx={{ borderRadius: '28px', border: '1px solid #e3e8f1', overflow: 'hidden', bgcolor: '#fff' }}>
        <Box sx={{ p: 4, bgcolor: '#fcfcfd', borderBottom: '1px solid #e3e8f1', display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr auto' }, gap: 2, alignItems: 'center' }}>
          <Box sx={{ px: 2, display: 'grid', gridTemplateColumns: { xs: '1fr', md: '120px 2.4fr 2.8fr 120px' }, columnGap: 2, alignItems: 'center' }}>
            <Typography sx={{ fontSize: '11px', fontWeight: 800, color: '#9ca3af', letterSpacing: '1px' }}>ROLL NO</Typography>
            <Typography sx={{ fontSize: '11px', fontWeight: 800, color: '#9ca3af', letterSpacing: '1px' }}>STUDENT PROFILE</Typography>
            <Typography sx={{ fontSize: '11px', fontWeight: 800, color: '#9ca3af', letterSpacing: '1px', textAlign: { md: 'center' } }}>ATTENDANCE STATUS</Typography>
            <Typography sx={{ fontSize: '11px', fontWeight: 800, color: '#9ca3af', letterSpacing: '1px', textAlign: { md: 'right' } }}>REMARKS</Typography>
          </Box>
          <TextField
            size="small"
            placeholder="Search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            sx={{ width: { xs: '100%', md: 240 }, '& .MuiOutlinedInput-root': { borderRadius: '14px', bgcolor: '#fff', fontSize: '14px' } }}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 18, color: '#9ca3af' }} /></InputAdornment> }}
          />
        </Box>

        <Box sx={{ minHeight: '400px', position: 'relative' }}>
          {loadingRoster && <LinearProgress sx={{ position: 'absolute', top: 0, left: 0, right: 0 }} />}
          {!loadingRoster && visibleStudents.length === 0 ? (
            <Box
              sx={{
                py: 10,
                textAlign: 'center',
                color: '#9ca3af',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 1.2
              }}
            >
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: '18px',
                  bgcolor: '#f3f4f6',
                  display: 'grid',
                  placeItems: 'center',
                  color: '#9ca3af',
                  fontSize: 28,
                  fontWeight: 900
                }}
              >
                ∅
              </Box>
              <Typography sx={{ fontWeight: 800, color: '#374151' }}>No students found</Typography>
              <Typography sx={{ fontSize: '14px', color: '#9ca3af', maxWidth: 360 }}>
                There are no active students in this class/section for the selected date.
              </Typography>
            </Box>
          ) : null}
          {visibleStudents.map((student, idx) => {
            const isExcused = student.name.includes('(Medical Leave)');
            const status = statusById[student._id] || ATTENDANCE_STATUS.PRESENT;

            return (
              <Box
                key={student._id}
                sx={{
                  transition: 'all 0.2s',
                  borderBottom: '1px solid #f1f5f9',
                  bgcolor: idx % 2 === 0 ? '#fff' : '#fbfcff',
                  '&:hover': { bgcolor: '#f3f6ff' }
                }}
              >
                <Box sx={{ px: 5, py: 3, display: 'grid', gridTemplateColumns: { xs: '1fr', md: '120px 2.4fr 2.8fr 120px' }, columnGap: 2, rowGap: { xs: 1.5, md: 0 }, alignItems: 'center' }}>
                  <Typography sx={{ fontWeight: 700, color: '#9ca3af', fontSize: '14px' }}>
                    #{String(idx + 1).padStart(3, '0')}
                  </Typography>
                  <Stack direction="row" spacing={2.5} alignItems="center">
                    <Avatar src={student.profilePhotoUrl} sx={{ width: 44, height: 44, border: '2px solid #fcfcfd', boxShadow: '0 2px 6px rgba(0,0,0,0.06)' }} />
                    <Typography sx={{ fontWeight: 800, color: isExcused ? '#9ca3af' : '#374151', fontSize: '15px' }}>
                      {student.name} {isExcused && <LockIcon sx={{ fontSize: 16, ml: 1, verticalAlign: 'middle', color: '#9ca3af' }} />}
                    </Typography>
                  </Stack>
                  <Box sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'center' } }}>
                    {isExcused ? (
                      <Chip label="EXCUSED" sx={{ bgcolor: '#f1f3f4', color: '#5f6368', fontWeight: 800, borderRadius: '50px', fontSize: '11px', px: 2 }} />
                    ) : (
                      <ToggleButtonGroup
                        exclusive
                        value={status}
                        onChange={(_, val) => val && handleStatusChange(student._id, val)}
                        disabled={!canEdit}
                        sx={{
                          bgcolor: '#f8f9fa',
                          borderRadius: '50px',
                          p: '4px',
                          border: '1px solid #e3e8f1',
                          '& .MuiToggleButton-root': {
                            border: 'none',
                            borderRadius: '50px',
                            textTransform: 'uppercase',
                            fontWeight: 800,
                            fontSize: '11px',
                            px: 3,
                            py: 0.8,
                            minWidth: 90,
                            color: '#9ca3af',
                            '&.Mui-selected': {
                              color: '#fff',
                              '&:hover': { opacity: 0.9 }
                            }
                          },
                          '& .MuiToggleButton-root[value="PRESENT"].Mui-selected': { bgcolor: '#00c853' },
                          '& .MuiToggleButton-root[value="LATE"].Mui-selected': { bgcolor: '#ff9100' },
                          '& .MuiToggleButton-root[value="ABSENT"].Mui-selected': { bgcolor: '#ff3d00' }
                        }}
                      >
                        <ToggleButton value={ATTENDANCE_STATUS.PRESENT}>PRESENT</ToggleButton>
                        <ToggleButton value={ATTENDANCE_STATUS.LATE}>LATE</ToggleButton>
                        <ToggleButton value={ATTENDANCE_STATUS.ABSENT}>ABSENT</ToggleButton>
                      </ToggleButtonGroup>
                    )}
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
                    <IconButton
                      onClick={(e) => handleRemarksClick(e, student._id)}
                      sx={{ color: remarksById[student._id] ? '#5346e0' : '#d1d5db', transition: 'all 0.2s' }}
                    >
                      <RemarksIcon sx={{ fontSize: 22 }} />
                    </IconButton>
                  </Box>
                </Box>
              </Box>
            );
          })}
        </Box>

        {/* List Footer */}
        <Box sx={{ p: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#fcfcfd' }}>
          <Typography sx={{ color: '#9ca3af', fontSize: '14px', fontWeight: 700 }}>
            Showing {visibleStudents.length} of {students.length} students in {selectedClass?.name || 'Class'}
          </Typography>
          <Stack direction="row" spacing={2.5}>
            <IconButton disabled sx={{ border: '1px solid #e3e8f1', borderRadius: '14px', p: 1.2, color: '#d1d5db' }}><PrevIcon /></IconButton>
            <IconButton disabled sx={{ border: '1px solid #e3e8f1', borderRadius: '14px', p: 1.2, color: '#374151' }}><NextIcon /></IconButton>
          </Stack>
        </Box>
      </Paper>

      {/* Sticky Bottom Bar */}
      <Box sx={{
        position: 'fixed', bottom: 0, left: 0, right: 0, bgcolor: '#fff',
        borderTop: '1px solid #e3e8f1', px: 6, py: 3, zIndex: 1000,
        boxShadow: '0 -10px 30px rgba(0,0,0,0.03)', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }}>
        <Stack direction="row" spacing={6} alignItems="center">
          <Typography sx={{ fontWeight: 700, color: '#9ca3af', fontSize: '15px' }}>
            Present: <Box component="span" sx={{ color: '#00c853', ml: 1 }}>{attendanceStats.present}</Box>
          </Typography>
          <Typography sx={{ fontWeight: 700, color: '#9ca3af', fontSize: '15px' }}>
            Absent: <Box component="span" sx={{ color: '#ff3d00', ml: 1 }}>{attendanceStats.absent}</Box>
          </Typography>
          <Typography sx={{ fontWeight: 700, color: '#9ca3af', fontSize: '15px' }}>
            Late: <Box component="span" sx={{ color: '#ff9100', ml: 1 }}>{attendanceStats.late}</Box>
          </Typography>
        </Stack>

        <Stack direction="row" spacing={2.5}>
          <Button
            variant="outlined"
            sx={{
              borderRadius: '14px',
              borderColor: '#e3e8f1',
              color: '#374151',
              textTransform: 'none',
              fontWeight: 800,
              px: 6,
              py: 1.8,
              fontSize: '15px',
              '&:hover': { bgcolor: '#f9fafb', borderColor: '#d1d5db' }
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            disableElevation
            onClick={handleFinalize}
            disabled={saving || !canEdit}
            startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SubmitIcon sx={{ fontSize: 20 }} />}
            sx={{
              borderRadius: '14px',
              bgcolor: '#5346e0',
              color: '#fff',
              textTransform: 'none',
              fontWeight: 800,
              px: 7,
              py: 1.8,
              fontSize: '15px',
              '&:hover': { bgcolor: '#4035b3' }
            }}
          >
            Submit Attendance
          </Button>
        </Stack>
      </Box>

      {/* Remarks Popover */}
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{ sx: { borderRadius: '20px', p: 3, width: 340, boxShadow: '0 20px 50px rgba(0,0,0,0.12)', border: '1px solid #e3e8f1' } }}
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

      {error && <Fade in><Alert severity="error" sx={{ position: 'fixed', top: 30, right: 30, zIndex: 2000, borderRadius: '14px' }} onClose={() => setError('')}>{error}</Alert></Fade>}
    </Box>
  );
};

export default StudentAttendance;
