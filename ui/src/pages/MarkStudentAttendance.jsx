import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Box, Typography, Stack, Grid, Button, Avatar, IconButton, TextField,
  Chip, Paper, CircularProgress, ToggleButton, ToggleButtonGroup, Popover, Menu, MenuItem
} from '@mui/material';
import {
  CalendarToday as CalendarIcon, RotateLeft as HistoryIcon,
  CheckCircle as CheckCircleIcon, ChatBubbleOutline as RemarksIcon,
  Lock as LockIcon, ExpandMore as ExpandMoreIcon,
  CloudUpload as SubmitIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { getAttendance, upsertAttendance } from '../services/attendanceService';
import { ATTENDANCE_STATUS, CLASS_STATUS, STUDENT_STATUS } from '../constants/enums';
import { listClasses } from '../services/classService';
import { getUserInfo, getUserRole } from '../utils/auth';
import { filterClassesForTeacher, getTeacherId, normalizeSectionName } from '../utils/teacherAccess';

const toISODate = (value) => new Date(value).toISOString().slice(0, 10);
const formatShortDate = (value) =>
  new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

const MarkStudentAttendance = () => {
  const { classId, sectionName } = useParams();
  const navigate = useNavigate();
  const today = useMemo(() => toISODate(new Date()), []);
  
  const user = getUserInfo();
  const role = getUserRole();
  const teacherId = useMemo(() => role === 'teacher' ? getTeacherId(user) : '', [role, user]);

  // UI State
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [classCatalog, setClassCatalog] = useState([]);
  const [assignedSectionsByClass, setAssignedSectionsByClass] = useState({});
  
  // Selection State
  const [selectedDate, setSelectedDate] = useState(today);
  const [students, setStudents] = useState([]);
  const [statusById, setStatusById] = useState({});
  const [remarksById, setRemarksById] = useState({});

  // Menu/Popover State
  const [anchorEl, setAnchorEl] = useState(null);
  const [currentStudentId, setCurrentStudentId] = useState(null);
  const [classAnchorEl, setClassAnchorEl] = useState(null);
  const dateInputRef = useRef(null);

  // 1. Initial Load: Fetch Classes
  useEffect(() => {
    const loadClasses = async () => {
      try {
        const response = await listClasses({ page: 1, limit: 200, status: CLASS_STATUS.ACTIVE });
        const { classes, assignedSectionsByClass: assigned } = filterClassesForTeacher(response.items || [], teacherId);
        
        setClassCatalog(classes);
        setAssignedSectionsByClass(assigned);

        // Redirect if no classId in URL and we have classes available
        if (!classId && classes.length > 0) {
          const firstClass = classes[0];
          const firstSection = assigned[firstClass._id]?.[0] || 
                         (firstClass.sections?.[0]?.name ? normalizeSectionName(firstClass.sections[0].name) : 'A');
          navigate(`/attendance/mark/${firstClass._id}/${firstSection}`, { replace: true });
        }
      } catch (err) {
        console.error('Failed to fetch classes:', err);
      }
    };
    loadClasses();
  }, [teacherId, navigate, classId]);

  // 2. Build Options for Dropdown
  const classOptions = useMemo(() => (
    classCatalog.flatMap((item) => {
      const sections = assignedSectionsByClass[item._id]?.length
        ? assignedSectionsByClass[item._id]
        : (item.sections || []).map((s) => normalizeSectionName(s.name)).filter(Boolean);
      
      return sections.map((section) => ({
        classId: String(item._id),
        className: item.name,
        sectionName: section,
        label: `${item.name} - ${section}`,
      }));
    })
  ), [classCatalog, assignedSectionsByClass]);

  // 3. Fetch Roster when URL params or Date changes
  useEffect(() => {
    const fetchRoster = async () => {
      if (!classId || !sectionName) return;
      setLoading(true);
      try {
        const res = await getAttendance({
          classId,
          sectionName,
          date: selectedDate,
          includeStudents: true,
          status: STUDENT_STATUS.ACTIVE,
        });
        
        setStudents(res.students || []);
        
        // Populate initial states
        const initialStatus = {};
        const initialRemarks = {};
        (res.attendance?.records || []).forEach(record => {
          initialStatus[record.studentId] = record.status;
          initialRemarks[record.studentId] = record.remarks || '';
        });
        setStatusById(initialStatus);
        setRemarksById(initialRemarks);
      } catch (err) {
        console.error('Roster fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRoster();
  }, [classId, sectionName, selectedDate]);

  // Stats Logic
  const stats = useMemo(() => {
    const counts = { present: 0, absent: 0, late: 0, total: students.length };
    students.forEach(s => {
      const status = statusById[s._id] || ATTENDANCE_STATUS.PRESENT;
      if (status === ATTENDANCE_STATUS.PRESENT) counts.present++;
      else if (status === ATTENDANCE_STATUS.LATE) counts.late++;
      else if (status === ATTENDANCE_STATUS.ABSENT) counts.absent++;
    });
    return counts;
  }, [students, statusById]);

  // Handlers
  const handleMarkAllPresent = () => {
    const nextStatus = { ...statusById };
    students.forEach(s => {
      if (!s.name.includes('(Medical Leave)')) {
        nextStatus[s._id] = ATTENDANCE_STATUS.PRESENT;
      }
    });
    setStatusById(nextStatus);
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
        date: selectedDate,
        records
      });
      navigate('/attendance');
    } catch (err) {
      alert("Failed to save attendance. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const currentClassLabel = useMemo(() => 
    classOptions.find(o => o.classId === classId && o.sectionName === sectionName)?.label || 'Select Class',
    [classOptions, classId, sectionName]
  );

  if (loading && students.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress thickness={5} size={50} sx={{ color: '#4c4ee8' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: '#f6f7fb', minHeight: '100vh', py: 3, px: { xs: 2, md: 4 } }}>
      <Box sx={{ maxWidth: 1100, mx: 'auto' }}>
        
        {/* Top Filter Bar */}
        <Paper elevation={0} sx={{ p: 2.5, borderRadius: 4, mb: 3, border: '1px solid #e6e9f0' }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <Typography variant="caption" sx={{ fontWeight: 800, color: '#9ca3af', letterSpacing: 1 }}>CLASS & SECTION</Typography>
              <Button
                fullWidth
                variant="outlined"
                onClick={(e) => setClassAnchorEl(e.currentTarget)}
                endIcon={<ExpandMoreIcon />}
                sx={{ mt: 1, justifyContent: 'space-between', borderRadius: 2, py: 1, borderColor: '#e5e7eb', color: '#374151', fontWeight: 700 }}
              >
                {currentClassLabel}
              </Button>
            </Grid>

            <Grid item xs={12} md={4}>
              <Typography variant="caption" sx={{ fontWeight: 800, color: '#9ca3af', letterSpacing: 1 }}>DATE</Typography>
              <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                <Button
                  variant="contained"
                  disableElevation
                  startIcon={<CalendarIcon />}
                  onClick={() => dateInputRef.current?.showPicker()}
                  sx={{ borderRadius: 2, bgcolor: '#eceeff', color: '#4c5eea', '&:hover': { bgcolor: '#e0e3ff' } }}
                >
                  {selectedDate === today ? 'Today' : formatShortDate(selectedDate)}
                </Button>
                <input
                  type="date"
                  ref={dateInputRef}
                  value={selectedDate}
                  max={today}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  style={{ visibility: 'hidden', width: 0, height: 0 }}
                />
                <Button 
                  variant="outlined" 
                  startIcon={<HistoryIcon />}
                  onClick={() => navigate(`/attendance/history/${classId}/${sectionName}`)}
                  sx={{ borderRadius: 2, borderColor: '#e5e7eb', color: '#667085' }}
                >
                  History
                </Button>
              </Stack>
            </Grid>

            <Grid item xs={12} md={4} sx={{ textAlign: 'right' }}>
              <Button
                variant="outlined"
                startIcon={<CheckCircleIcon />}
                onClick={handleMarkAllPresent}
                sx={{ borderRadius: 2, px: 3, fontWeight: 700, color: '#10b981', borderColor: '#10b981' }}
              >
                Mark All Present
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* Attendance Roster */}
        <Paper elevation={0} sx={{ borderRadius: 4, border: '1px solid #e6e9f0', overflow: 'hidden' }}>
          <Box sx={{ p: 2, bgcolor: '#f9fafb', borderBottom: '1px solid #e6e9f0', display: { xs: 'none', sm: 'block' } }}>
            <Grid container sx={{ px: 2 }}>
              <Grid item xs={1}><Typography variant="caption" sx={{ fontWeight: 800, color: '#9ca3af' }}>ROLL</Typography></Grid>
              <Grid item xs={4}><Typography variant="caption" sx={{ fontWeight: 800, color: '#9ca3af' }}>STUDENT</Typography></Grid>
              <Grid item xs={5} sx={{ textAlign: 'center' }}><Typography variant="caption" sx={{ fontWeight: 800, color: '#9ca3af' }}>STATUS</Typography></Grid>
              <Grid item xs={2} sx={{ textAlign: 'right' }}><Typography variant="caption" sx={{ fontWeight: 800, color: '#9ca3af' }}>NOTES</Typography></Grid>
            </Grid>
          </Box>

          <Box sx={{ minHeight: 400 }}>
            {students.length === 0 ? (
              <Box sx={{ py: 10, textAlign: 'center', color: '#9ca3af' }}>
                <Typography>No students found for this section.</Typography>
              </Box>
            ) : (
              students.map((student, idx) => {
                const isExcused = student.name.includes('(Medical Leave)');
                return (
                  <Box key={student._id} sx={{ p: 2, borderBottom: '1px solid #f3f4f6', '&:hover': { bgcolor: '#fcfcfd' } }}>
                    <Grid container alignItems="center">
                      <Grid item xs={1}>
                        <Typography sx={{ fontWeight: 700, color: '#9ca3af' }}>{student.rollNo || idx + 1}</Typography>
                      </Grid>
                      <Grid item xs={11} sm={4}>
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Avatar src={student.profilePhotoUrl} sx={{ width: 36, height: 36 }} />
                          <Typography sx={{ fontWeight: 700, fontSize: '0.95rem' }}>
                            {student.name} {isExcused && <LockIcon sx={{ fontSize: 14, ml: 0.5, color: '#94a3b8' }} />}
                          </Typography>
                        </Stack>
                      </Grid>
                      <Grid item xs={12} sm={5} sx={{ display: 'flex', justifyContent: 'center', mt: { xs: 2, sm: 0 } }}>
                        {isExcused ? (
                          <Chip label="EXCUSED" size="small" sx={{ fontWeight: 900, bgcolor: '#f1f5f9' }} />
                        ) : (
                          <ToggleButtonGroup
                            exclusive
                            size="small"
                            value={statusById[student._id] || ATTENDANCE_STATUS.PRESENT}
                            onChange={(_, val) => val && setStatusById(prev => ({ ...prev, [student._id]: val }))}
                            sx={{
                              '& .MuiToggleButton-root': { px: 2, fontWeight: 700, fontSize: '0.75rem' },
                              '& .Mui-selected[value="PRESENT"]': { bgcolor: '#10b981 !important', color: 'white' },
                              '& .Mui-selected[value="LATE"]': { bgcolor: '#f59e0b !important', color: 'white' },
                              '& .Mui-selected[value="ABSENT"]': { bgcolor: '#ef4444 !important', color: 'white' },
                            }}
                          >
                            <ToggleButton value="PRESENT">PRESENT</ToggleButton>
                            <ToggleButton value="LATE">LATE</ToggleButton>
                            <ToggleButton value="ABSENT">ABSENT</ToggleButton>
                          </ToggleButtonGroup>
                        )}
                      </Grid>
                      <Grid item xs={12} sm={2} sx={{ textAlign: 'right' }}>
                        <IconButton 
                          onClick={(e) => { setAnchorEl(e.currentTarget); setCurrentStudentId(student._id); }}
                          color={remarksById[student._id] ? "primary" : "default"}
                        >
                          <RemarksIcon />
                        </IconButton>
                      </Grid>
                    </Grid>
                  </Box>
                );
              })
            )}
          </Box>
        </Paper>

        {/* Floating Action Bar */}
        <Paper elevation={4} sx={{ mt: 3, p: 2, borderRadius: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', bottom: 20 }}>
          <Stack direction="row" spacing={3} sx={{ display: { xs: 'none', sm: 'flex' } }}>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>Present: <span style={{ color: '#10b981' }}>{stats.present}</span></Typography>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>Absent: <span style={{ color: '#ef4444' }}>{stats.absent}</span></Typography>
          </Stack>
          <Stack direction="row" spacing={2}>
            <Button variant="text" onClick={() => navigate('/attendance')} sx={{ fontWeight: 700, color: '#64748b' }}>Discard</Button>
            <Button 
              variant="contained" 
              onClick={handleFinalize} 
              disabled={saving}
              startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <SubmitIcon />}
              sx={{ borderRadius: 2, px: 4, bgcolor: '#4c4ee8', fontWeight: 700 }}
            >
              Submit Attendance
            </Button>
          </Stack>
        </Paper>
      </Box>

      {/* Class Selection Menu */}
      <Menu anchorEl={classAnchorEl} open={Boolean(classAnchorEl)} onClose={() => setClassAnchorEl(null)}>
        {classOptions.map((opt) => (
          <MenuItem 
            key={`${opt.classId}-${opt.sectionName}`}
            onClick={() => {
              navigate(`/attendance/mark/${opt.classId}/${opt.sectionName}`);
              setClassAnchorEl(null);
            }}
          >
            {opt.label}
          </MenuItem>
        ))}
      </Menu>

      {/* Remarks Popover */}
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        PaperProps={{ sx: { p: 2, width: 300, borderRadius: 3 } }}
      >
        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 800 }}>Add Remark</Typography>
        <TextField
          fullWidth
          multiline
          rows={3}
          value={remarksById[currentStudentId] || ''}
          onChange={(e) => setRemarksById(prev => ({ ...prev, [currentStudentId]: e.target.value }))}
          placeholder="Note reason for absence or lateness..."
        />
        <Button fullWidth variant="contained" onClick={() => setAnchorEl(null)} sx={{ mt: 1, borderRadius: 2 }}>Save</Button>
      </Popover>
    </Box>
  );
};

export default MarkStudentAttendance;