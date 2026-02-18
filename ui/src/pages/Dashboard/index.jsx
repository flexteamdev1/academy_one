import React from 'react';
import { Box, Stack, Typography } from '@mui/material';
import Groups2Outlined from '@mui/icons-material/Groups2Outlined';
import BadgeOutlined from '@mui/icons-material/BadgeOutlined';
import AccountBalanceWalletOutlined from '@mui/icons-material/AccountBalanceWalletOutlined';
import EmojiPeopleOutlined from '@mui/icons-material/EmojiPeopleOutlined';
import StatsGrid from './StatsGrid';
import AdmissionsCard from './AdmissionsCard';
import EventsCard from './EventsCard';

const statCards = [
  {
    label: 'Total Students',
    value: '2,480',
    trend: '+12%',
    icon: <Groups2Outlined sx={{ fontSize: 20 }} />,
    bgKey: 'dashboardCardOne',
    accentKey: 'dashboardAccentOne',
  },
  {
    label: 'Faculty Staff',
    value: '142',
    trend: 'Stable',
    icon: <BadgeOutlined sx={{ fontSize: 20 }} />,
    bgKey: 'dashboardCardTwo',
    accentKey: 'dashboardAccentTwo',
  },
  {
    label: 'Fees Collected',
    value: '$142.5k',
    trend: '94%',
    icon: <AccountBalanceWalletOutlined sx={{ fontSize: 20 }} />,
    bgKey: 'dashboardCardThree',
    accentKey: 'dashboardAccentThree',
  },
  {
    label: 'Avg. Attendance',
    value: '89.2%',
    trend: '-3%',
    icon: <EmojiPeopleOutlined sx={{ fontSize: 20 }} />,
    bgKey: 'dashboardCardFour',
    accentKey: 'dashboardAccentFour',
  },
];

const admissions = [
  { initials: 'AB', name: 'Alice Bennett', grade: 'Grade 7-A', date: 'Oct 24, 2024', status: 'Confirmed' },
  { initials: 'DM', name: 'Daniel Miller', grade: 'Grade 9-C', date: 'Oct 23, 2024', status: 'Pending' },
  { initials: 'KH', name: 'Kevin Hudson', grade: 'Grade 8-B', date: 'Oct 22, 2024', status: 'Confirmed' },
];

const events = [
  { day: '28', month: 'OCT', title: 'Parent-Teacher Meet', meta: '09:00 AM • Main Hall' },
  { day: '02', month: 'NOV', title: 'Annual Sports Day', meta: '08:00 AM • Field A' },
  { day: '05', month: 'NOV', title: 'Science Exhibition', meta: '10:00 AM • Lab Wing' },
];

const Dashboard = () => {
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
          alignItems: 'start',
        }}
      >
        <Box>
          <AdmissionsCard admissions={admissions} />
        </Box>

        <Box>
          <EventsCard events={events} />
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;
