import React from 'react';
import { Box, Divider, Skeleton, Stack } from '@mui/material';
import PageCard from '../common/PageCard';

const NoticeViewerSkeleton = () => (
  <PageCard sx={{ p: 2.2, minHeight: { xs: 320, lg: '76vh' } }}>
    <Stack direction="row" justifyContent="space-between" spacing={1} sx={{ mb: 1 }}>
      <Skeleton variant="text" width={140} height={16} />
      <Stack direction="row" spacing={0.8}>
        <Skeleton variant="rectangular" width={70} height={24} sx={{ borderRadius: 999 }} />
        <Skeleton variant="rectangular" width={64} height={24} sx={{ borderRadius: 1 }} />
      </Stack>
    </Stack>

    <Skeleton variant="text" width="70%" height={32} sx={{ mb: 1 }} />

    <Stack spacing={0.7} sx={{ mb: 2 }}>
      <Skeleton variant="text" width="45%" height={18} />
      <Skeleton variant="text" width="40%" height={18} />
      <Skeleton variant="text" width="35%" height={18} />
    </Stack>

    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ sm: 'center' }} sx={{ mb: 2 }}>
      <Skeleton variant="text" width={80} height={16} />
      <Stack direction="row" spacing={0.8} flexWrap="wrap" useFlexGap>
        <Skeleton variant="rectangular" width={80} height={24} sx={{ borderRadius: 999 }} />
        <Skeleton variant="rectangular" width={90} height={24} sx={{ borderRadius: 999 }} />
        <Skeleton variant="rectangular" width={70} height={24} sx={{ borderRadius: 999 }} />
      </Stack>
    </Stack>

    <Divider sx={{ mb: 2 }} />

    <Skeleton variant="text" width={120} height={16} sx={{ mb: 1 }} />
    <Stack spacing={0.6} sx={{ mb: 2 }}>
      <Skeleton variant="text" width="95%" height={18} />
      <Skeleton variant="text" width="90%" height={18} />
      <Skeleton variant="text" width="92%" height={18} />
      <Skeleton variant="text" width="88%" height={18} />
      <Skeleton variant="text" width="75%" height={18} />
    </Stack>

    <Skeleton variant="text" width={120} height={16} sx={{ mb: 1 }} />
    <Stack spacing={0.8}>
      {Array.from({ length: 2 }).map((_, idx) => (
        <Box key={`notice-attachment-${idx}`} sx={{ px: 1.1, py: 0.8, borderRadius: 1.5, bgcolor: 'action.hover' }}>
          <Skeleton variant="text" width="65%" height={18} />
        </Box>
      ))}
    </Stack>
  </PageCard>
);

export default NoticeViewerSkeleton;
