import React from 'react';
import { Box, Button, Grid, Skeleton, Stack } from '@mui/material';
import PageCard from '../common/PageCard';

const ClassesSkeleton = () => (
  <>
    <Stack
      direction={{ xs: 'column', md: 'row' }}
      spacing={2}
      alignItems={{ md: 'flex-end' }}
      justifyContent="space-between"
      sx={{ mb: 3 }}
    >
      <Box>
        <Skeleton variant="text" width={190} height={36} />
        <Skeleton variant="text" width={360} height={24} />
      </Box>
      <Button variant="contained" disabled sx={{ minWidth: 150 }}>
        <Skeleton variant="text" width={90} />
      </Button>
    </Stack>

    <Grid container spacing={2} sx={{ mb: 3 }}>
      {Array.from({ length: 4 }).map((_, idx) => (
        <Grid item xs={12} sm={6} lg={3} key={`class-metric-${idx}`}>
          <PageCard sx={{ p: 2, boxShadow: 'none' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.3 }}>
              <Skeleton variant="text" width={90} height={16} />
              <Skeleton variant="circular" width={34} height={34} />
            </Stack>
            <Skeleton variant="text" width={70} height={28} />
          </PageCard>
        </Grid>
      ))}
    </Grid>

    <PageCard sx={{ p: 2, mb: 2 }}>
      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2} alignItems="center">
        <Skeleton variant="rectangular" height={40} sx={{ flex: 1, width: '100%', borderRadius: 1 }} />
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.2} sx={{ width: { xs: '100%', lg: 'auto' } }}>
          <Skeleton variant="rectangular" width={160} height={40} sx={{ borderRadius: 1 }} />
          <Skeleton variant="rectangular" width={130} height={40} sx={{ borderRadius: 1 }} />
          <Skeleton variant="rectangular" width={90} height={40} sx={{ borderRadius: 1 }} />
        </Stack>
      </Stack>
    </PageCard>

    <PageCard sx={{ overflow: 'hidden' }}>
      <Box sx={{ px: 2, py: 1.2, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Skeleton variant="text" width={140} height={18} />
      </Box>
      <Box>
        {Array.from({ length: 6 }).map((_, idx) => (
          <Stack
            key={`class-row-${idx}`}
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
            <Skeleton variant="text" width={120} height={20} />
            <Skeleton variant="text" width={140} height={18} />
            <Skeleton variant="rectangular" width={160} height={22} sx={{ borderRadius: 1 }} />
            <Skeleton variant="text" width={60} height={18} />
            <Skeleton variant="text" width={60} height={18} />
            <Skeleton variant="rectangular" width={70} height={22} sx={{ borderRadius: 1 }} />
            <Skeleton variant="rectangular" width={70} height={26} sx={{ borderRadius: 1 }} />
          </Stack>
        ))}
      </Box>

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1.4}
        justifyContent="space-between"
        alignItems={{ sm: 'center' }}
        sx={{
          px: 2,
          py: 1.5,
          borderTop: '1px solid',
          borderColor: (theme) => theme.palette.grey[100],
          backgroundColor: (theme) => theme.palette.grey[50],
        }}
      >
        <Skeleton variant="text" width={220} height={16} />
        <Stack direction="row" spacing={0.8} alignItems="center">
          <Skeleton variant="rectangular" width={28} height={28} sx={{ borderRadius: 1 }} />
          <Skeleton variant="rectangular" width={56} height={28} sx={{ borderRadius: 1 }} />
          <Skeleton variant="rectangular" width={28} height={28} sx={{ borderRadius: 1 }} />
        </Stack>
      </Stack>
    </PageCard>
  </>
);

export default ClassesSkeleton;
