import React, { useEffect, useMemo, useState } from 'react';
import { Box, Stack, Typography } from '@mui/material';
import Groups2Outlined from '@mui/icons-material/Groups2Outlined';
import BadgeOutlined from '@mui/icons-material/BadgeOutlined';
import AccountBalanceWalletOutlined from '@mui/icons-material/AccountBalanceWalletOutlined';
import EmojiPeopleOutlined from '@mui/icons-material/EmojiPeopleOutlined';
import StatsGrid from './StatsGrid';
import AdmissionsCard from './AdmissionsCard';
import EventsCard from './EventsCard';
import { listStudents } from '../../services/studentService';
import { useUIState } from '../../context/UIContext';

const events = [
  { day: '28', month: 'OCT', title: 'Parent-Teacher Meet', meta: '09:00 AM • Main Hall' },
  { day: '02', month: 'NOV', title: 'Annual Sports Day', meta: '08:00 AM • Field A' },
  { day: '05', month: 'NOV', title: 'Science Exhibition', meta: '10:00 AM • Lab Wing' },
];

const Dashboard = () => {
  const { selectedAcademicYearId } = useUIState();
  const [admissions, setAdmissions] = useState([]);
  const [loadingAdmissions, setLoadingAdmissions] = useState(true);
  const [admissionsError, setAdmissionsError] = useState('');

  useEffect(() => {
    const loadAdmissions = async () => {
      setLoadingAdmissions(true);
      setAdmissionsError('');
      try {
        const response = await listStudents({ page: 1, limit: 5 });
        const items = response.items || [];
        setAdmissions(items);
      } catch (err) {
        setAdmissionsError(err.message || 'Failed to load admissions');
      } finally {
        setLoadingAdmissions(false);
      }
    };

    loadAdmissions();
  }, [selectedAcademicYearId]);

  const statCards = useMemo(
    () => [
      {
        label: 'Total Students',
        value: '2,480',
        trend: '+12%',
        icon: Groups2Outlined,
        iconColor: 'info.main',
      },
      {
        label: 'Faculty Staff',
        value: '142',
        trend: 'Stable',
        icon: BadgeOutlined,
        iconColor: 'secondary.main',
      },
      {
        label: 'Fees Collected',
        value: '$142.5k',
        trend: '94%',
        icon: AccountBalanceWalletOutlined,
        iconColor: 'success.main',
      },
      {
        label: 'Avg. Attendance',
        value: '89.2%',
        trend: '-3%',
        icon: EmojiPeopleOutlined,
        iconColor: 'warning.main',
      },
    ],
    []
  );

  return (
    <Box sx={{ width: '100%', px: 0, pb: 1 }}>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={1.5}
        alignItems={{ xs: 'flex-start', md: 'center' }}
        justifyContent="space-between"
        sx={{ mb: 2.4 }}
      >
        <Box>
          <Typography sx={{ fontSize: { xs: '1.8rem', md: '2.2rem' }, fontWeight: 800, color: 'text.primary', lineHeight: 1.2 }}>
            Welcome Back, Admin
          </Typography>
          <Typography sx={{ mt: 0.4, color: 'text.secondary', fontSize: '0.95rem' }}>
            Here&apos;s what&apos;s happening in your school system today.
          </Typography>
        </Box>
      </Stack>

      <StatsGrid statCards={statCards} />

      <Box
        sx={{
          mt: 2,
          display: 'grid',
          gap: 2,
          gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' },
          alignItems: 'stretch',
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, height: '100%' }}>
          <Box sx={{ flex: 1, display: 'flex' }}>
            <AdmissionsCard admissions={admissions} loading={loadingAdmissions} />
          </Box>
          {admissionsError ? (
            <Typography sx={{ mt: 1, color: 'error.main', fontSize: '0.82rem' }}>
              {admissionsError}
            </Typography>
          ) : null}
        </Box>

        <Box sx={{ display: 'flex' }}>
          <EventsCard events={events} />
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;
