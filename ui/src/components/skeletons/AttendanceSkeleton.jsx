import React from 'react';
import { Box, Skeleton, Stack } from '@mui/material';
import PageCard from '../common/PageCard';

const AttendanceSkeleton = () => (
  <>
    <Stack sx={{ mb: 3 }}>
      <Skeleton variant="text" width={180} height={36} />
      <Skeleton variant="text" width={320} height={24} />
    </Stack>

    <Stack spacing={1.2}>
      {Array.from({ length: 4 }).map((_, idx) => (
        <PageCard key={`attendance-card-${idx}`} sx={{ p: 2 }}>
          <Box sx={{ mb: 0.6 }}>
            <Skeleton variant="text" width={180} height={22} />
            <Skeleton variant="text" width={240} height={18} />
          </Box>
          <Skeleton variant="text" width={260} height={18} />
        </PageCard>
      ))}
    </Stack>
  </>
);

export default AttendanceSkeleton;
