import React from 'react';
import { Box, Button, Card, CardContent, Grid, Stack, Typography } from '@mui/material';
import SectionHeader from '../components/common/SectionHeader';
import StatCard from '../components/common/StatCard';
import { LoadingState, ErrorState } from '../components/common/StatePlaceholder';
import useFakeRequest from '../hooks/useFakeRequest';

const fakeDashboard = () =>
  Promise.resolve({
    stats: [
      { title: 'Active Students', value: '1,284', trend: '+8.2%', accent: 'primary' },
      { title: 'Teachers Onboard', value: '84', trend: '+2.4%', accent: 'primary' },
      { title: 'Monthly Revenue', value: '$92.4k', trend: '+12.7%', accent: 'secondary' },
      { title: 'Attendance Rate', value: '96.1%', trend: '+1.1%', accent: 'secondary' },
    ],
    highlights: [
      { label: 'Next payroll run', value: 'Feb 12, 2026' },
      { label: 'Pending invoices', value: '18' },
      { label: 'Open notices', value: '6' },
    ],
  });

const Dashboard = () => {
  const { data, loading, error } = useFakeRequest(fakeDashboard, []);

  return (
    <Box>
      <SectionHeader
        title="Overview"
        subtitle="Track performance, payments, and engagement across the academy."
        actions={
          <Button variant="contained">Create Report</Button>
        }
      />

      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error.message} />
      ) : (
        <Grid container spacing={3}>
          {data.stats.map((stat) => (
            <Grid item xs={12} sm={6} lg={3} key={stat.title}>
              <StatCard {...stat} />
            </Grid>
          ))}

          <Grid item xs={12} lg={8}>
            <Card sx={{ borderRadius: 4, height: '100%' }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Performance Snapshot
                </Typography>
                <Stack spacing={2}>
                  {['Fee collection', 'Attendance logging', 'Parent engagement'].map((item) => (
                    <Box
                      key={item}
                      sx={{
                        p: 2,
                        borderRadius: 3,
                        backgroundColor: 'background.default',
                        display: 'flex',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Typography>{item}</Typography>
                      <Typography variant="subtitle2" color="text.secondary">
                        On track
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} lg={4}>
            <Card sx={{ borderRadius: 4, height: '100%' }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Highlights
                </Typography>
                <Stack spacing={2}>
                  {data.highlights.map((item) => (
                    <Box key={item.label}>
                      <Typography variant="subtitle2" color="text.secondary">
                        {item.label}
                      </Typography>
                      <Typography variant="h6">{item.value}</Typography>
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default Dashboard;
