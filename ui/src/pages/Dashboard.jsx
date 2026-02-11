import React from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Grid,
  Stack,
  Typography,
} from '@mui/material';
import StatCard from '../components/common/StatCard';
import { LoadingState, ErrorState } from '../components/common/StatePlaceholder';
import useFakeRequest from '../hooks/useFakeRequest';
import GroupOutlined from '@mui/icons-material/GroupOutlined';
import SchoolOutlined from '@mui/icons-material/SchoolOutlined';
import QuestionAnswerOutlined from '@mui/icons-material/QuestionAnswerOutlined';
import FactCheckOutlined from '@mui/icons-material/FactCheckOutlined';
import DownloadOutlined from '@mui/icons-material/DownloadOutlined';
import AddRounded from '@mui/icons-material/AddRounded';

const fakeDashboard = () =>
  Promise.resolve({
    stats: [
      {
        title: 'Total Students',
        value: '1,240',
        trend: '+3.2%',
        color: '#2FAF74',
        bg: '#E9F7EF',
        icon: <GroupOutlined />,
      },
      {
        title: 'Total Teachers',
        value: '86',
        trend: '+0%',
        color: '#4C8EF7',
        bg: '#E8F2FF',
        icon: <SchoolOutlined />,
      },
      {
        title: 'Active Inquiries',
        value: '57',
        trend: '+12%',
        color: '#9B6BDF',
        bg: '#F1E9FA',
        icon: <QuestionAnswerOutlined />,
      },
      {
        title: 'Attendance',
        value: '94.2%',
        trend: '-1%',
        color: '#E55B8F',
        bg: '#FCE9F1',
        icon: <FactCheckOutlined />,
      },
    ],
    pipeline: [
      { label: 'New Inquiries', value: 45, tone: '#52D1A3' },
      { label: 'Contacted', value: 28, tone: '#7BB0FF' },
      { label: 'Interviews', value: 12, tone: '#C7A4FF' },
      { label: 'Enrolled', value: 8, tone: '#F4A2D4' },
    ],
    attendance: {
      present: 1168,
      absent: 52,
      leave: 20,
      percent: 94,
    },
    activity: [
      {
        name: 'Sophia Martinez',
        action: 'was enrolled into',
        target: 'Grade 8-B',
        time: '24 minutes ago',
        type: 'success',
      },
      {
        name: 'Leo Wright',
        action: 'Term fee payment received',
        target: '$450.00',
        time: '2 hours ago',
        type: 'payment',
      },
      {
        name: 'Principal Smith',
        action: 'New facility maintenance announcement',
        target: '',
        time: '5 hours ago',
        type: 'info',
      },
    ],
  });

const Dashboard = () => {
  const { data, loading, error } = useFakeRequest(fakeDashboard, []);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error.message} />;

  const totalAttendance =
    data.attendance.present + data.attendance.absent + data.attendance.leave;

  return (
    <Box>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={2}
        alignItems={{ md: 'center' }}
        justifyContent="space-between"
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography variant="h4" sx={{ mb: 0.6 }}>
            Performance Summary
          </Typography>
          <Typography variant="subtitle1">
            Monitor real-time academic and operational metrics.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1.5}>
          <Button variant="outlined" startIcon={<DownloadOutlined />}>
            Export
          </Button>
          <Button variant="contained" startIcon={<AddRounded />}>
            New Admission
          </Button>
        </Stack>
      </Stack>

      <Grid container spacing={3}>
        {data.stats.map((stat, index) => (
          <Grid item xs={12} sm={6} lg={3} key={stat.title}>
            <Box sx={{ animation: 'fadeUp 600ms ease both', animationDelay: `${index * 80}ms` }}>
              <StatCard
                title={stat.title}
                value={stat.value}
                trend={stat.trend}
                icon={stat.icon}
                bgColor={stat.bg}
                tone={stat.color}
              />
            </Box>
          </Grid>
        ))}

        <Grid item xs={12} lg={8}>
          <Card sx={{ height: '100%', animation: 'fadeUp 600ms ease both', animationDelay: '120ms' }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Box>
                  <Typography variant="h6">Inquiry Pipeline Overview</Typography>
                  <Typography variant="body2">
                    Admissions funnel performance this month
                  </Typography>
                </Box>
                <Button variant="text" sx={{ color: 'primary.main' }}>
                  Full Report
                </Button>
              </Stack>
              <Stack spacing={2.5}>
                {data.pipeline.map((item) => (
                  <Box key={item.label}>
                    <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.8 }}>
                      <Typography variant="subtitle2">{item.label}</Typography>
                      <Typography variant="subtitle2" color="text.primary">
                        {item.value}
                      </Typography>
                    </Stack>
                    <Box
                      sx={{
                        height: 10,
                        borderRadius: 999,
                        backgroundColor: '#F4EEE7',
                        overflow: 'hidden',
                      }}
                    >
                      <Box
                        sx={{
                          height: '100%',
                          width: `${(item.value / 50) * 100}%`,
                          backgroundColor: item.tone,
                          borderRadius: 999,
                        }}
                      />
                    </Box>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Card sx={{ height: '100%', animation: 'fadeUp 600ms ease both', animationDelay: '200ms' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Today's Attendance
              </Typography>
              <Box sx={{ position: 'relative', display: 'grid', placeItems: 'center', my: 2 }}>
                <Box
                  sx={{
                    width: 180,
                    height: 180,
                    borderRadius: '50%',
                    background: `conic-gradient(#58D6A6 0 ${data.attendance.percent}%, #F2EEE7 ${data.attendance.percent}% 100%)`,
                    display: 'grid',
                    placeItems: 'center',
                  }}
                >
                  <Box
                    sx={{
                      width: 120,
                      height: 120,
                      borderRadius: '50%',
                      backgroundColor: '#FFFDF9',
                      border: '1px solid #F0E7DD',
                    }}
                  />
                </Box>
                <Box sx={{ position: 'absolute', textAlign: 'center' }}>
                  <Typography variant="h3">{data.attendance.percent}%</Typography>
                  <Typography variant="subtitle2" color="text.secondary">
                    Present
                  </Typography>
                </Box>
              </Box>
              <Stack spacing={1.4} sx={{ mt: 3 }}>
                <Stack direction="row" justifyContent="space-between">
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#58D6A6' }} />
                    <Typography variant="body2">Present</Typography>
                  </Stack>
                  <Typography variant="subtitle1">{data.attendance.present}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#F06BA5' }} />
                    <Typography variant="body2">Absent</Typography>
                  </Stack>
                  <Typography variant="subtitle1">{data.attendance.absent}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#F2B248' }} />
                    <Typography variant="body2">On Leave</Typography>
                  </Stack>
                  <Typography variant="subtitle1">{data.attendance.leave}</Typography>
                </Stack>
              </Stack>
              <Divider sx={{ my: 2 }} />
              <Typography variant="body2" color="text.secondary">
                Total marked today: {totalAttendance}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card sx={{ animation: 'fadeUp 600ms ease both', animationDelay: '280ms' }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="h6">Recent Activity</Typography>
                <Button variant="outlined" size="small">
                  View All Logs
                </Button>
              </Stack>
              <Stack spacing={2}>
                {data.activity.map((item) => (
                  <Box key={`${item.name}-${item.time}`}>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Box
                        sx={{
                          width: 44,
                          height: 44,
                          borderRadius: '50%',
                          backgroundColor: '#F4EEE7',
                          display: 'grid',
                          placeItems: 'center',
                          color: 'primary.main',
                          fontWeight: 700,
                        }}
                      >
                        {item.name.charAt(0)}
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          {item.name}{' '}
                          <Typography component="span" variant="body2" color="text.secondary">
                            {item.action}{' '}
                          </Typography>
                          <Typography component="span" variant="subtitle1" sx={{ color: 'primary.main' }}>
                            {item.target}
                          </Typography>
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {item.time}
                        </Typography>
                      </Box>
                      <Box>
                        {item.type === 'success' && (
                          <Box
                            sx={{
                              px: 1.4,
                              py: 0.4,
                              borderRadius: 999,
                              backgroundColor: '#E9F7EF',
                              color: '#2FAF74',
                              fontWeight: 600,
                              fontSize: '0.75rem',
                            }}
                          >
                            Success
                          </Box>
                        )}
                        {item.type === 'payment' && (
                          <Typography variant="subtitle1" sx={{ color: '#2FAF74', fontWeight: 700 }}>
                            {item.target}
                          </Typography>
                        )}
                      </Box>
                    </Stack>
                    <Divider sx={{ mt: 2 }} />
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
