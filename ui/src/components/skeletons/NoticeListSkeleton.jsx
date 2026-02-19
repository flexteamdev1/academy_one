import React from 'react';
import { Box, Skeleton, Stack } from '@mui/material';
import PageCard from '../common/PageCard';

const NoticeListSkeleton = () => (
  <PageCard sx={{ p: 0, height: { xs: 'auto', lg: '76vh' }, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
    <Stack direction="row" justifyContent="space-between" sx={{ px: 2, py: 1.7, borderBottom: '1px solid', borderColor: 'divider' }}>
      <Skeleton variant="text" width={120} height={18} />
      <Skeleton variant="text" width={90} height={18} />
    </Stack>
    <Box sx={{ overflowY: 'auto' }}>
      {Array.from({ length: 7 }).map((_, idx) => (
        <Box
          key={`notice-row-${idx}`}
          sx={{
            px: 2,
            py: 1.5,
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Stack direction="row" justifyContent="space-between" spacing={1} alignItems="start">
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Skeleton variant="text" width="70%" height={20} />
              <Skeleton variant="text" width="45%" height={18} />
            </Box>
            <Skeleton variant="rectangular" width={64} height={22} sx={{ borderRadius: 1 }} />
          </Stack>
          <Stack direction="row" spacing={1.5} sx={{ mt: 0.8 }}>
            <Skeleton variant="text" width={110} height={16} />
            <Skeleton variant="text" width={90} height={16} />
          </Stack>
        </Box>
      ))}
    </Box>
  </PageCard>
);

export default NoticeListSkeleton;
