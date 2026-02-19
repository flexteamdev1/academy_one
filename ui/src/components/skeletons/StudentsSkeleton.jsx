import React from 'react';
import { Box, Button, Skeleton, Stack } from '@mui/material';
import PageCard from '../common/PageCard';

const StudentsSkeleton = () => (
  <>
    <Stack
      direction={{ xs: 'column', md: 'row' }}
      spacing={2}
      alignItems={{ md: 'flex-end' }}
      justifyContent="space-between"
      sx={{ mb: 3 }}
    >
      <Box>
        <Skeleton variant="text" width={180} height={36} />
        <Skeleton variant="text" width={320} height={24} />
      </Box>
      <Button variant="contained" disabled sx={{ minWidth: 140 }}>
        <Skeleton variant="text" width={80} />
      </Button>
    </Stack>

    <PageCard sx={{ p: 2, mb: 3 }}>
      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2} alignItems="center">
        <Skeleton variant="rectangular" height={40} sx={{ flex: 1, width: '100%', borderRadius: 1 }} />
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.2} sx={{ width: { xs: '100%', lg: 'auto' } }}>
          <Skeleton variant="rectangular" width={150} height={40} sx={{ borderRadius: 1 }} />
          <Skeleton variant="rectangular" width={150} height={40} sx={{ borderRadius: 1 }} />
          <Skeleton variant="rectangular" width={150} height={40} sx={{ borderRadius: 1 }} />
          <Skeleton variant="rectangular" width={90} height={40} sx={{ borderRadius: 1 }} />
        </Stack>
      </Stack>
    </PageCard>

    <PageCard sx={{ overflow: 'hidden', mb: 3 }}>
      <Box sx={{ px: 2, py: 1.2, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Skeleton variant="text" width={140} height={20} />
      </Box>
      <Box>
        {Array.from({ length: 6 }).map((_, idx) => (
          <Stack
            key={`student-row-${idx}`}
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
            <Skeleton variant="circular" width={40} height={40} />
            <Box sx={{ flex: 1 }}>
              <Skeleton variant="text" width="55%" height={20} />
              <Skeleton variant="text" width="35%" height={18} />
            </Box>
            <Skeleton variant="rectangular" width={70} height={24} sx={{ borderRadius: 1 }} />
            <Skeleton variant="rectangular" width={70} height={24} sx={{ borderRadius: 1 }} />
            <Skeleton variant="rectangular" width={70} height={24} sx={{ borderRadius: 1 }} />
            <Skeleton variant="rectangular" width={80} height={28} sx={{ borderRadius: 1 }} />
          </Stack>
        ))}
      </Box>
    </PageCard>

    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' }, gap: 2 }}>
      {Array.from({ length: 3 }).map((_, idx) => (
        <PageCard key={`student-metric-${idx}`} sx={{ p: 2.2, boxShadow: 'none' }}>
          <Stack direction="row" spacing={1.4} alignItems="center">
            <Skeleton variant="rectangular" width={36} height={36} sx={{ borderRadius: 1 }} />
            <Box sx={{ flex: 1 }}>
              <Skeleton variant="text" width="60%" height={16} />
              <Skeleton variant="text" width="40%" height={26} />
            </Box>
          </Stack>
        </PageCard>
      ))}
    </Box>
  </>
);

export default StudentsSkeleton;
