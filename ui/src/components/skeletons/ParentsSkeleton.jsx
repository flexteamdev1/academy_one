import React from 'react';
import { Box, Skeleton, Stack } from '@mui/material';
import PageCard from '../common/PageCard';

const ParentsSkeleton = () => (
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
        <Skeleton variant="text" width={320} height={24} />
      </Box>
    </Stack>

    <PageCard sx={{ p: 2, mb: 3 }}>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.2} alignItems="center">
        <Skeleton variant="rectangular" height={40} sx={{ flex: 1, width: '100%', borderRadius: 1 }} />
        <Skeleton variant="rectangular" width={180} height={40} sx={{ borderRadius: 1 }} />
        <Skeleton variant="rectangular" width={90} height={40} sx={{ borderRadius: 1 }} />
        <Skeleton variant="rectangular" width={90} height={40} sx={{ borderRadius: 1 }} />
      </Stack>
    </PageCard>

    <PageCard sx={{ overflow: 'hidden', mb: 3 }}>
      <Box sx={{ px: 2, py: 1.2, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Skeleton variant="text" width={160} height={18} />
      </Box>
      <Box>
        {Array.from({ length: 6 }).map((_, idx) => (
          <Stack
            key={`parent-row-${idx}`}
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
            </Box>
            <Skeleton variant="text" width={180} height={18} />
            <Skeleton variant="text" width={120} height={18} />
            <Skeleton variant="text" width={60} height={18} />
            <Skeleton variant="rectangular" width={70} height={22} sx={{ borderRadius: 999 }} />
            <Skeleton variant="text" width={140} height={18} />
            <Skeleton variant="circular" width={28} height={28} />
          </Stack>
        ))}
      </Box>
    </PageCard>

    <PageCard sx={{ mt: 3, p: 1.5 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Skeleton variant="text" width={200} height={18} />
        <Stack direction="row" spacing={0.8} alignItems="center">
          <Skeleton variant="rectangular" width={28} height={28} sx={{ borderRadius: 1 }} />
          <Skeleton variant="rectangular" width={36} height={28} sx={{ borderRadius: 1 }} />
          <Skeleton variant="text" width={40} height={18} />
          <Skeleton variant="rectangular" width={28} height={28} sx={{ borderRadius: 1 }} />
        </Stack>
      </Stack>
    </PageCard>
  </>
);

export default ParentsSkeleton;
