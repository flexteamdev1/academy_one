import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  FormControl,
  IconButton,
  InputAdornment,
  LinearProgress,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import CheckCircleOutlineOutlined from '@mui/icons-material/CheckCircleOutlineOutlined';
import ChevronLeftRounded from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRounded from '@mui/icons-material/ChevronRightRounded';
import GroupsOutlined from '@mui/icons-material/GroupsOutlined';
import ReplayOutlined from '@mui/icons-material/ReplayOutlined';
import SearchOutlined from '@mui/icons-material/SearchOutlined';
import PageCard from '../components/common/PageCard';
import { listClasses } from '../services/classService';
import { getAttendance, upsertAttendance } from '../services/attendanceService';
import { useUIState } from '../context/UIContext';
import { ATTENDANCE_STATUS, CLASS_STATUS, STUDENT_STATUS } from '../constants/enums';
import { getUserInfo } from '../utils/auth';
import { filterClassesForTeacher, getTeacherId, normalizeSectionName } from '../utils/teacherAccess';

const toISODate = (value) => new Date(value).toISOString().slice(0, 10);

const TeacherAttendance = () => {
  const { selectedAcademicYearId } = useUIState();
  const today = toISODate(new Date());
  const user = getUserInfo();
  const teacherId = getTeacherId(user);

  const [selectedDate, setSelectedDate] = useState(today);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [query, setQuery] = useState('');
  const [viewMode, setViewMode] = useState('all');

  const [classCatalog, setClassCatalog] = useState([]);
  const [assignedSectionsByClass, setAssignedSectionsByClass] = useState({});
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState(null);
  const [statusById, setStatusById] = useState({});

  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [loadingRoster, setLoadingRoster] = useState(false);
  const [saving, setSaving] = useState(false);

  const canEdit = selectedDate === today;

  useEffect(() => {
    const loadClasses = async () => {
      setError('');
      setLoadingClasses(true);
      try {
        const response = await listClasses({ page: 1, limit: 100, status: CLASS_STATUS.ACTIVE });
        const items = response.items || [];
        const filtered = filterClassesForTeacher(items, teacherId);
        setClassCatalog(filtered.classes);
        setAssignedSectionsByClass(filtered.assignedSectionsByClass);
        if (!selectedClassId && filtered.classes.length) {
          setSelectedClassId(filtered.classes[0]._id);
        } else if (selectedClassId && !filtered.classes.some((cls) => cls._id === selectedClassId)) {
          setSelectedClassId(filtered.classes[0]?._id || '');
        }
      } catch (err) {
        setError(err.message || 'Failed to load classes');
        setAssignedSectionsByClass({});
      } finally {
        setLoadingClasses(false);
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

        const attendanceDoc = response.attendance || null;
        const roster = response.students || [];

        setAttendance(attendanceDoc);
        setStudents(roster);
        const nextStatus = {};
        (attendanceDoc?.records || []).forEach((record) => {
          nextStatus[String(record.studentId)] = record.status;
        });
        setStatusById(nextStatus);
        setSaved(false);
      } catch (err) {
        setError(err.message || 'Failed to load attendance');
      } finally {
        setLoadingRoster(false);
      }
    };

    loadAttendance();
  }, [selectedClassId, selectedSection, selectedDate, selectedAcademicYearId]);

  const visibleStudents = useMemo(() => {
    const filtered = query.trim()
      ? students.filter((student) => {
          const haystack = [
            student.name,
            student.admissionNo,
            student.email,
            student.grade,
            student.sectionName,
          ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase();
          return haystack.includes(query.trim().toLowerCase());
        })
      : students;

    if (viewMode === 'changed') {
      return filtered.filter((student) => statusById[String(student._id)]);
    }

    return filtered;
  }, [students, query, viewMode, statusById]);

  const setStatus = (studentId, status) => {
    if (!canEdit) return;
    setStatusById((prev) => ({ ...prev, [String(studentId)]: status }));
    setSaved(false);
  };

  const markAll = (status) => {
    if (!canEdit) return;
    const next = {};
    visibleStudents.forEach((student) => {
      next[String(student._id)] = status;
    });
    setStatusById((prev) => ({ ...prev, ...next }));
    setSaved(false);
  };

  const clearMarked = () => {
    if (!canEdit) return;
    const next = { ...statusById };
    visibleStudents.forEach((student) => {
      delete next[String(student._id)];
    });
    setStatusById(next);
    setSaved(false);
  };

  const handleSave = async () => {
    if (!canEdit || !selectedClassId || !selectedSection) return;
    setSaving(true);
    setError('');
    try {
      const records = students.map((student) => ({
        studentId: student._id,
        status: statusById[String(student._id)] || ATTENDANCE_STATUS.PRESENT,
      }));

      const response = await upsertAttendance({
        classId: selectedClassId,
        sectionName: selectedSection,
        date: selectedDate,
        records,
      });

      setAttendance(response.attendance || null);
      setSaved(true);
    } catch (err) {
      setError(err.message || 'Failed to save attendance');
    } finally {
      setSaving(false);
    }
  };

  const attendanceStats = useMemo(() => {
    const total = students.length;
    const counts = {
      present: 0,
      absent: 0,
      late: 0,
    };

    students.forEach((student) => {
      const value = statusById[String(student._id)] || ATTENDANCE_STATUS.PRESENT;
      if (value === ATTENDANCE_STATUS.PRESENT) counts.present += 1;
      if (value === ATTENDANCE_STATUS.ABSENT) counts.absent += 1;
      if (value === ATTENDANCE_STATUS.LATE) counts.late += 1;
    });

    return { total, ...counts };
  }, [students, statusById]);

  return (
    <Box>
      <Stack spacing={2.4}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.8} justifyContent="space-between">
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>Attendance</Typography>
            <Typography sx={{ color: 'text.secondary' }}>Class-wise attendance marking</Typography>
          </Box>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.2} alignItems={{ sm: 'center' }}>
            <TextField
              type="date"
              label="Attendance Date"
              InputLabelProps={{ shrink: true }}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              sx={{ minWidth: 220 }}
            />
            <Button
              variant="contained"
              onClick={handleSave}
              disabled={!canEdit || saving || loadingRoster}
              startIcon={<CheckCircleOutlineOutlined />}
              sx={{ px: 3, py: 1.2, borderRadius: 2 }}
            >
              {saving ? 'Saving...' : canEdit ? 'Save Attendance' : 'Read Only'}
            </Button>
          </Stack>
        </Stack>

        {error ? <Alert severity="error">{error}</Alert> : null}
        {!canEdit ? (
          <Alert severity="warning">Attendance edits are restricted to same-day only ({today}).</Alert>
        ) : null}
        {saved ? <Alert severity="success">Attendance saved for {selectedDate}.</Alert> : null}

        <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2.2}>
          {[
            { label: 'Total Students', value: attendanceStats.total, tone: 'info' },
            { label: 'Present', value: attendanceStats.present, tone: 'success' },
            { label: 'Absent', value: attendanceStats.absent, tone: 'error' },
            { label: 'Late', value: attendanceStats.late, tone: 'warning' },
          ].map((card) => (
            <PageCard
              key={card.label}
              sx={{
                p: 1.8,
                flex: 1,
                border: '1px solid',
                borderColor: 'divider',
                backgroundColor: 'background.paper',
                borderRadius: 3,
              }}
            >
              <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'text.secondary' }}>
                {card.label}
              </Typography>
              <Stack direction="row" spacing={1} alignItems="baseline">
                <Typography sx={{ fontWeight: 800, fontSize: '1.5rem', color: `${card.tone}.main` }}>
                  {card.value}
                </Typography>
                {card.label !== 'Total Students' ? (
                  <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                    {attendanceStats.total ? Math.round((card.value / attendanceStats.total) * 100) : 0}%
                  </Typography>
                ) : null}
              </Stack>
            </PageCard>
          ))}
        </Stack>

        <Stack direction={{ xs: 'column', xl: 'row' }} spacing={2.4} alignItems="stretch">
          <Stack spacing={2} sx={{ width: { xs: '100%', xl: 280 }, flexShrink: 0 }}>
            <PageCard sx={{ p: 1.8 }}>
              <Stack spacing={1.2}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Typography sx={{ fontWeight: 700 }}>Class Navigator</Typography>
                  <Chip size="small" label={`${classCatalog.length} classes`} />
                </Stack>
                {loadingClasses ? <LinearProgress /> : null}
                {!loadingClasses && classCatalog.length === 0 ? (
                  <Alert severity="info">No active classes for this academic year.</Alert>
                ) : null}
                <Stack
                  spacing={1}
                  sx={{
                    maxHeight: { xs: 220, xl: 320 },
                    overflowY: 'auto',
                    pr: 0.5,
                  }}
                >
                  {classCatalog.map((item) => {
                    const active = item._id === selectedClassId;
                    return (
                      <Button
                        key={item._id}
                        variant={active ? 'contained' : 'outlined'}
                        onClick={() => setSelectedClassId(item._id)}
                        sx={{
                          justifyContent: 'space-between',
                          textTransform: 'none',
                          borderRadius: 2,
                          py: 1,
                        }}
                      >
                        <span>{item.name}</span>
                        <Chip size="small" label={`Section ${item.sections?.[0]?.name || '—'}`} />
                      </Button>
                    );
                  })}
                </Stack>
              </Stack>
            </PageCard>

            <PageCard sx={{ p: 1.8 }}>
              <Stack spacing={1.2}>
                <Typography sx={{ fontWeight: 700 }}>Sections</Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {sectionOptions.length === 0 ? (
                    <Typography sx={{ color: 'text.secondary', fontSize: '0.82rem' }}>
                      No sections found for this class.
                    </Typography>
                  ) : null}
                  {sectionOptions.map((section) => (
                    <Button
                      key={section}
                      size="small"
                      variant={section === selectedSection ? 'contained' : 'outlined'}
                      onClick={() => setSelectedSection(section)}
                      sx={{ textTransform: 'none', borderRadius: 999, px: 2 }}
                    >
                      {section}
                    </Button>
                  ))}
                </Stack>
              </Stack>
            </PageCard>

            <PageCard sx={{ p: 1.8 }}>
              <Stack spacing={1.2}>
                <Typography sx={{ fontWeight: 700 }}>Quick Actions</Typography>
                <Stack spacing={1}>
                  <Button variant="outlined" onClick={() => markAll(ATTENDANCE_STATUS.PRESENT)} disabled={!canEdit || !visibleStudents.length}>
                    Mark All Present
                  </Button>
                  <Button variant="outlined" onClick={() => markAll(ATTENDANCE_STATUS.ABSENT)} disabled={!canEdit || !visibleStudents.length}>
                    Mark All Absent
                  </Button>
                  <Button variant="outlined" onClick={() => markAll(ATTENDANCE_STATUS.LATE)} disabled={!canEdit || !visibleStudents.length}>
                    Mark All Late
                  </Button>
                  <Button variant="text" color="error" startIcon={<ReplayOutlined />} onClick={clearMarked} disabled={!canEdit || !visibleStudents.length}>
                    Clear Changes
                  </Button>
                </Stack>
              </Stack>
            </PageCard>
          </Stack>

          <PageCard sx={{ flex: 1, minWidth: 0, p: 2.2 }}>
            <Stack spacing={1.6}>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.2} alignItems={{ md: 'center' }} justifyContent="space-between">
                <Box>
                  <Typography sx={{ fontWeight: 700, fontSize: '1rem' }}>
                    {selectedClass ? `${selectedClass.name} · Section ${selectedSection || '—'}` : 'Select a class'}
                  </Typography>
                  <Typography sx={{ color: 'text.secondary', fontSize: '0.82rem' }}>
                    Student Roster • {selectedDate}
                  </Typography>
                </Box>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems="center">
                  <TextField
                    size="small"
                    placeholder="Search student name or ID..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchOutlined fontSize="small" sx={{ color: 'text.secondary' }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ minWidth: 240 }}
                  />
                  <FormControl>
                    <ToggleButtonGroup
                      value={viewMode}
                      exclusive
                      size="small"
                      onChange={(_event, value) => value && setViewMode(value)}
                      sx={{
                        borderRadius: 999,
                        border: '1px solid',
                        borderColor: 'divider',
                        backgroundColor: 'background.paper',
                      }}
                    >
                      <ToggleButton value="all" sx={{ textTransform: 'none', px: 2 }}>
                        All
                      </ToggleButton>
                      <ToggleButton value="changed" sx={{ textTransform: 'none', px: 2 }}>
                        Changed
                      </ToggleButton>
                    </ToggleButtonGroup>
                  </FormControl>
                </Stack>
              </Stack>

              <Divider />

              {loadingRoster ? <LinearProgress /> : null}
              {!loadingRoster && visibleStudents.length === 0 ? (
                <Alert severity="info">No students found for this class and section.</Alert>
              ) : null}

              <Stack spacing={0.6}>
                {visibleStudents.map((student) => {
                  const value = statusById[String(student._id)] || ATTENDANCE_STATUS.PRESENT;
                  return (
                    <Stack
                      key={student._id}
                      direction={{ xs: 'column', md: 'row' }}
                      spacing={1.6}
                      alignItems={{ md: 'center' }}
                      justifyContent="space-between"
                      sx={{
                        p: 1.2,
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: 'divider',
                        backgroundColor: 'background.paper',
                      }}
                    >
                      <Stack direction="row" spacing={1.2} alignItems="center">
                        <Avatar sx={{ width: 40, height: 40, bgcolor: 'primary.light', color: 'primary.dark' }}>
                          {String(student.name || 'S').slice(0, 1).toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography sx={{ fontWeight: 700 }}>{student.name}</Typography>
                          <Typography sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>
                            ID: {student.admissionNo || 'N/A'}
                          </Typography>
                        </Box>
                      </Stack>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <ToggleButtonGroup
                          exclusive
                          value={value}
                          onChange={(_event, next) => next && setStatus(student._id, next)}
                          disabled={!canEdit}
                          size="small"
                          sx={{
                            backgroundColor: 'background.paper',
                            borderRadius: 999,
                            border: '1px solid',
                            borderColor: 'divider',
                            p: 0.3,
                          }}
                        >
                          <ToggleButton value={ATTENDANCE_STATUS.PRESENT} sx={{ textTransform: 'none', px: 2 }}>
                            Present
                          </ToggleButton>
                          <ToggleButton value={ATTENDANCE_STATUS.ABSENT} sx={{ textTransform: 'none', px: 2 }}>
                            Absent
                          </ToggleButton>
                          <ToggleButton value={ATTENDANCE_STATUS.LATE} sx={{ textTransform: 'none', px: 2 }}>
                            Late
                          </ToggleButton>
                        </ToggleButtonGroup>
                        <Chip
                          size="small"
                          icon={<GroupsOutlined />}
                          label={student.parentId ? 'Parent Linked' : 'No Parent'}
                          variant="outlined"
                        />
                      </Stack>
                    </Stack>
                  );
                })}
              </Stack>

              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ pt: 1 }}>
                <Typography sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>
                  Showing {visibleStudents.length} of {students.length} students
                </Typography>
                <Stack direction="row" spacing={1}>
                  <IconButton size="small" disabled>
                    <ChevronLeftRounded fontSize="small" />
                  </IconButton>
                  <IconButton size="small" disabled>
                    <ChevronRightRounded fontSize="small" />
                  </IconButton>
                </Stack>
              </Stack>
            </Stack>
          </PageCard>
        </Stack>
      </Stack>
    </Box>
  );
};

export default TeacherAttendance;
