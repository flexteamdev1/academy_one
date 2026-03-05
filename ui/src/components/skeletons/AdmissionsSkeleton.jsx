import React from 'react';
import { Box, Grid, Skeleton, Stack } from '@mui/material';
import PageCard from '../common/PageCard';

const AdmissionsSkeleton = () => (
  <>
    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'flex-end' }} justifyContent="space-between" sx={{ mb: 3 }}>
      <Box>
        <Skeleton variant="text" width={200} height={36} />
        <Skeleton variant="text" width={360} height={24} />
      </Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.2}>
        <Skeleton variant="rectangular" width={120} height={40} sx={{ borderRadius: 1 }} />
        <Skeleton variant="rectangular" width={140} height={40} sx={{ borderRadius: 1 }} />
      </Stack>
    </Stack>

    <Grid container spacing={2} sx={{ mb: 3 }}>
      {Array.from({ length: 4 }).map((_, idx) => (
        <Grid item xs={12} sm={6} lg={3} key={`admission-metric-${idx}`}>
          <PageCard sx={{ p: 2, boxShadow: 'none' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.3 }}>
              <Skeleton variant="text" width={100} height={16} />
              <Skeleton variant="circular" width={34} height={34} />
            </Stack>
            <Skeleton variant="text" width={70} height={28} />
          </PageCard>
        </Grid>
      ))}
    </Grid>

    <PageCard sx={{ p: 2, mb: 3 }}>
      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2} alignItems="center">
        <Skeleton variant="rectangular" height={40} sx={{ flex: 1, width: '100%', borderRadius: 1 }} />
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.2} sx={{ width: { xs: '100%', lg: 'auto' } }}>
          <Skeleton variant="rectangular" width={180} height={40} sx={{ borderRadius: 1 }} />
          <Skeleton variant="rectangular" width={90} height={40} sx={{ borderRadius: 1 }} />
        </Stack>
      </Stack>
    </PageCard>

    <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2.2}>
      <PageCard sx={{ flex: 1, overflow: 'hidden' }}>
        <Box sx={{ px: 2, py: 1.2, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Skeleton variant="text" width={150} height={18} />
        </Box>
        <Box>
          {Array.from({ length: 6 }).map((_, idx) => (
            <Stack
              key={`admission-row-${idx}`}
              direction="row"
              spacing={2}
              alignItems="center"
              sx={{
                px: 2,
                py: 1.4,
                borderBottom: '1px solid',
                borderColor: (theme) => theme.palette.grey[100],
              }}
            >
              <Box sx={{ flex: 1 }}>
                <Skeleton variant="text" width="55%" height={20} />
                <Skeleton variant="text" width="40%" height={16} />
              </Box>
              <Skeleton variant="text" width={90} height={18} />
              <Box sx={{ flex: 1 }}>
                <Skeleton variant="text" width="45%" height={18} />
                <Skeleton variant="text" width="35%" height={16} />
              </Box>
              <Skeleton variant="rectangular" width={80} height={22} sx={{ borderRadius: 999 }} />
              <Stack direction="row" spacing={0.8} sx={{ ml: 'auto' }}>
                <Skeleton variant="rectangular" width={60} height={28} sx={{ borderRadius: 1 }} />
                <Skeleton variant="rectangular" width={60} height={28} sx={{ borderRadius: 1 }} />
              </Stack>
            </Stack>
          ))}
        </Box>

        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 2, py: 1.5 }}>
          <Skeleton variant="text" width={180} height={16} />
          <Stack direction="row" spacing={1} alignItems="center">
            <Skeleton variant="rectangular" width={60} height={28} sx={{ borderRadius: 1 }} />
            <Skeleton variant="text" width={90} height={16} />
            <Skeleton variant="rectangular" width={60} height={28} sx={{ borderRadius: 1 }} />
          </Stack>
        </Stack>
      </PageCard>

      <PageCard sx={{ flex: 1, p: 2.4 }}>
        <Stack spacing={2}>
          <Box>
            <Skeleton variant="text" width={160} height={22} />
            <Skeleton variant="text" width={240} height={18} />
          </Box>
          <Skeleton variant="rectangular" height={1} />
          <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 1 }} />
          <Skeleton variant="rectangular" height={40} sx={{ borderRadius: 1 }} />
        </Stack>
      </PageCard>
    </Stack>
  </>
);

export default AdmissionsSkeleton;
