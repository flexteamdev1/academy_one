import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Box, Stack, Typography } from '@mui/material';
import PageCard from '../components/common/PageCard';
import { getLinkedStudents } from '../services/userService';
import { useUIState } from '../context/UIContext';
import { getUserRole } from '../utils/auth';
import { STUDENT_STATUS } from '../constants/enums';

const UserDashboard = () => {
  const { selectedAcademicYearId } = useUIState();
  const role = getUserRole();
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setError('');
      try {
        const response = await getLinkedStudents();
        setItems(response.items || []);
      } catch (err) {
        setError(err.message || 'Failed to load dashboard summary');
      }
    };

    load();
  }, [selectedAcademicYearId]);

  const totalStudents = items.length;
  const activeStudents = useMemo(
    () => items.filter((item) => item.status === STUDENT_STATUS.ACTIVE).length,
    [items]
  );

  return (
    <Box>
      <Stack sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ mb: 0.6 }}>Dashboard Summary</Typography>
        <Typography variant="subtitle1">
          {role === 'parent' ? 'Overview of your linked students.' : 'Your academic profile overview.'}
        </Typography>
      </Stack>

      {error ? <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> : null}

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 2 }}>
        <PageCard sx={{ p: 2, flex: 1 }}>
          <Typography sx={{ color: 'text.secondary', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>
            Students
          </Typography>
          <Typography sx={{ fontWeight: 800, fontSize: '2rem' }}>{totalStudents}</Typography>
        </PageCard>
        <PageCard sx={{ p: 2, flex: 1 }}>
          <Typography sx={{ color: 'text.secondary', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>
            Active
          </Typography>
          <Typography sx={{ fontWeight: 800, fontSize: '2rem' }}>{activeStudents}</Typography>
        </PageCard>
      </Stack>

      <Stack spacing={1.2}>
        {items.map((student) => (
          <PageCard key={student._id} sx={{ p: 2 }}>
            <Typography sx={{ fontWeight: 700 }}>{student.name}</Typography>
            <Typography sx={{ color: 'text.secondary', fontSize: '0.86rem' }}>
              {student.admissionNo} • {student.grade || 'N/A'}-{student.sectionName || 'N/A'}
            </Typography>
            <Typography sx={{ color: 'text.secondary', fontSize: '0.86rem' }}>
              Attendance: 89% • Fees: Pending $1800 • Notices: 3 new
            </Typography>
          </PageCard>
        ))}
      </Stack>
    </Box>
  );
};

export default UserDashboard;
