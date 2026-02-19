import React from 'react';
import { Box, Skeleton, Stack } from '@mui/material';
import PageCard from '../common/PageCard';

const NoticeViewerSkeleton = () => (
  <PageCard sx={{ p: 2.2, minHeight: { xs: 320, lg: '76vh' } }}>
    <Skeleton variant="text" width="60%" height={28} />
    <Skeleton variant="text" width="35%" height={18} sx={{ mb: 1 }} />
    <Stack spacing={0.6} sx={{ mb: 2 }}>
      <Skeleton variant="text" width="95%" height={18} />
      <Skeleton variant="text" width="90%" height={18} />
      <Skeleton variant="text" width="85%" height={18} />
      <Skeleton variant="text" width="70%" height={18} />
    </Stack>
    <Skeleton variant="text" width={120} height={16} sx={{ mb: 1 }} />
    <Stack spacing={0.8}>
      {Array.from({ length: 3 }).map((_, idx) => (
        <Box key={`notice-attachment-${idx}`} sx={{ px: 1.1, py: 0.8, borderRadius: 1.5, bgcolor: 'action.hover' }}>
          <Skeleton variant="text" width="65%" height={18} />
        </Box>
      ))}
    </Stack>
  </PageCard>
);

export default NoticeViewerSkeleton;
