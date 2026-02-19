import React from 'react';
import { Box, Button, Grid, Skeleton, Stack } from '@mui/material';
import PageCard from '../common/PageCard';

const TeachersSkeleton = () => (
  <>
    <Stack
      direction={{ xs: 'column', md: 'row' }}
      spacing={2}
      alignItems={{ md: 'end' }}
      justifyContent="space-between"
      sx={{ mb: 3 }}
    >
      <Box>
        <Skeleton variant="text" width={180} height={36} />
        <Skeleton variant="text" width={320} height={24} />
      </Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.2}>
        <Button variant="outlined" disabled sx={{ minWidth: 140 }}>
          <Skeleton variant="text" width={90} />
        </Button>
        <Button variant="contained" disabled sx={{ minWidth: 140 }}>
          <Skeleton variant="text" width={90} />
        </Button>
      </Stack>
    </Stack>

    <Grid container spacing={2} sx={{ mb: 3 }}>
      {Array.from({ length: 4 }).map((_, idx) => (
        <Grid item xs={12} sm={6} md={3} key={`teacher-stat-${idx}`}>
          <PageCard sx={{ p: 2, boxShadow: '0px 8px 18px rgba(31, 42, 55, 0.06)' }}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Skeleton variant="circular" width={40} height={40} />
              <Box sx={{ flex: 1 }}>
                <Skeleton variant="text" width="70%" height={16} />
                <Skeleton variant="text" width="40%" height={24} />
              </Box>
            </Stack>
          </PageCard>
        </Grid>
      ))}
    </Grid>

    <PageCard sx={{ p: 2, mb: 3 }}>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.2}>
        <Skeleton variant="rectangular" height={40} sx={{ flex: 1, borderRadius: 1 }} />
        <Skeleton variant="rectangular" width={180} height={40} sx={{ borderRadius: 1 }} />
        <Skeleton variant="rectangular" width={120} height={40} sx={{ borderRadius: 1 }} />
      </Stack>
    </PageCard>

    <Grid container spacing={2.2}>
      {Array.from({ length: 8 }).map((_, idx) => (
        <Grid item xs={12} sm={6} lg={4} xl={3} key={`teacher-card-${idx}`}>
          <PageCard sx={{ p: 2.2 }}>
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
              <Skeleton variant="circular" width={56} height={56} />
              <Box sx={{ flex: 1 }}>
                <Skeleton variant="text" width="70%" height={20} />
                <Skeleton variant="text" width="45%" height={18} />
              </Box>
            </Stack>
            <Skeleton variant="text" width="80%" height={16} />
            <Skeleton variant="text" width="60%" height={16} />
            <Skeleton variant="text" width="50%" height={16} />
            <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
              <Skeleton variant="rectangular" width={70} height={26} sx={{ borderRadius: 1 }} />
              <Skeleton variant="rectangular" width={70} height={26} sx={{ borderRadius: 1 }} />
            </Stack>
          </PageCard>
        </Grid>
      ))}
    </Grid>
  </>
);

export default TeachersSkeleton;
