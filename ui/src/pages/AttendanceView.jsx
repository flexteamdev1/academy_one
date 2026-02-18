import React, { useEffect, useState } from 'react';
import { Alert, Box, Stack, Typography } from '@mui/material';
import PageCard from '../components/common/PageCard';
import { getLinkedStudents } from '../services/userService';
import { useUIState } from '../context/UIContext';

const AttendanceView = () => {
  const { selectedAcademicYearId } = useUIState();
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setError('');
      try {
        const response = await getLinkedStudents();
        setItems(response.items || []);
      } catch (err) {
        setError(err.message || 'Failed to load attendance');
      }
    };
    load();
  }, [selectedAcademicYearId]);

  return (
    <Box>
      <Stack sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ mb: 0.6 }}>Attendance View</Typography>
        <Typography variant="subtitle1">View attendance records and monthly summary.</Typography>
      </Stack>
      {error ? <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> : null}

      <Stack spacing={1.2}>
        {items.map((student) => (
          <PageCard key={student._id} sx={{ p: 2 }}>
            <Typography sx={{ fontWeight: 700 }}>{student.name}</Typography>
            <Typography sx={{ color: 'text.secondary', fontSize: '0.86rem' }}>
              {student.admissionNo} • {student.grade || 'N/A'}-{student.sectionName || 'N/A'}
            </Typography>
            <Typography sx={{ color: 'text.secondary', fontSize: '0.86rem' }}>
              Present Days: 22 • Absent Days: 2 • Attendance Rate: 91%
            </Typography>
          </PageCard>
        ))}
      </Stack>
    </Box>
  );
};

export default AttendanceView;
