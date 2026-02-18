import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import PageCard from '../components/common/PageCard';
import { listStudents } from '../services/studentService';
import { useUIState } from '../context/UIContext';
import { ATTENDANCE_STATUS, FILTER_ALL } from '../constants/enums';

const toISODate = (value) => new Date(value).toISOString().slice(0, 10);

const TeacherAttendance = () => {
  const { selectedAcademicYearId } = useUIState();
  const today = toISODate(new Date());
  const [selectedDate, setSelectedDate] = useState(today);
  const [grade, setGrade] = useState(FILTER_ALL);
  const [students, setStudents] = useState([]);
  const [statusById, setStatusById] = useState({});
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const load = async () => {
      setError('');
      try {
        const response = await listStudents({ page: 1, limit: 100 });
        setStudents(response.items || []);
      } catch (err) {
        setError(err.message || 'Failed to load students');
      }
    };

    load();
  }, [selectedAcademicYearId]);

  const canEdit = selectedDate === today;

  const gradeOptions = useMemo(
    () => Array.from(new Set(students.map((item) => item.grade).filter(Boolean))).sort(),
    [students]
  );

  const visibleStudents = useMemo(() => {
    if (grade === FILTER_ALL) return students;
    return students.filter((item) => item.grade === grade);
  }, [students, grade]);

  const setStatus = (studentId, status) => {
    if (!canEdit) return;
    setStatusById((prev) => ({ ...prev, [studentId]: status }));
    setSaved(false);
  };

  const handleSave = () => {
    if (!canEdit) return;
    setSaved(true);
  };

  return (
    <Box>
      <Stack sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ mb: 0.6 }}>Attendance Marking</Typography>
        <Typography variant="subtitle1">
          Teachers can edit attendance for the current day only.
        </Typography>
      </Stack>

      {error ? <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> : null}
      {!canEdit ? (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Attendance edits are restricted to same-day only ({today}).
        </Alert>
      ) : null}
      {saved ? (
        <Alert severity="success" sx={{ mb: 2 }}>
          Attendance changes saved for {selectedDate}.
        </Alert>
      ) : null}

      <PageCard sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.2}>
          <TextField
            type="date"
            label="Attendance Date"
            InputLabelProps={{ shrink: true }}
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Grade</InputLabel>
            <Select
              value={grade}
              label="Grade"
              onChange={(e) => setGrade(e.target.value)}
            >
              <MenuItem value={FILTER_ALL}>All Grades</MenuItem>
              {gradeOptions.map((item) => (
                <MenuItem key={item} value={item}>{item}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={!canEdit}
            sx={{ alignSelf: { xs: 'stretch', md: 'center' } }}
          >
            Save Attendance
          </Button>
        </Stack>
      </PageCard>

      <Stack spacing={1.2}>
        {visibleStudents.map((student) => {
          const value = statusById[student._id] || ATTENDANCE_STATUS.PRESENT;
          return (
            <PageCard key={student._id} sx={{ p: 1.5 }}>
              <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={1}>
                <Box>
                  <Typography sx={{ fontWeight: 700 }}>{student.name}</Typography>
                  <Typography sx={{ fontSize: '0.84rem', color: 'text.secondary' }}>
                    {student.admissionNo} • {student.grade || 'N/A'}-{student.sectionName || 'N/A'}
                  </Typography>
                </Box>
                <FormControl size="small" sx={{ minWidth: 170 }}>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={value}
                    label="Status"
                    disabled={!canEdit}
                    onChange={(e) => setStatus(student._id, e.target.value)}
                  >
                    <MenuItem value={ATTENDANCE_STATUS.PRESENT}>Present</MenuItem>
                    <MenuItem value={ATTENDANCE_STATUS.ABSENT}>Absent</MenuItem>
                    <MenuItem value={ATTENDANCE_STATUS.LATE}>Late</MenuItem>
                  </Select>
                </FormControl>
              </Stack>
            </PageCard>
          );
        })}
      </Stack>
    </Box>
  );
};

export default TeacherAttendance;
