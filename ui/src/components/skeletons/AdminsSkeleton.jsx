import React from 'react';
import { Box, Button, Skeleton, Stack } from '@mui/material';
import PageCard from '../common/PageCard';

const AdminsSkeleton = () => (
  <>
    <Stack
      direction={{ xs: 'column', md: 'row' }}
      spacing={2}
      alignItems={{ md: 'flex-end' }}
      justifyContent="space-between"
      sx={{ mb: 3 }}
    >
      <Box>
        <Skeleton variant="text" width={160} height={36} />
        <Skeleton variant="text" width={280} height={24} />
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
          <Skeleton variant="rectangular" width={90} height={40} sx={{ borderRadius: 1 }} />
        </Stack>
      </Stack>
    </PageCard>

    <PageCard sx={{ overflow: 'hidden', mb: 3 }}>
      <Box sx={{ px: 2, py: 1.2, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Skeleton variant="text" width={140} height={18} />
      </Box>
      <Box>
        {Array.from({ length: 6 }).map((_, idx) => (
          <Stack
            key={`admin-row-${idx}`}
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
              <Skeleton variant="text" width="45%" height={20} />
            </Box>
            <Skeleton variant="text" width={180} height={18} />
            <Skeleton variant="text" width={120} height={18} />
            <Skeleton variant="rectangular" width={70} height={24} sx={{ borderRadius: 999 }} />
            <Stack direction="row" spacing={0.8} sx={{ ml: 'auto' }}>
              <Skeleton variant="rectangular" width={60} height={28} sx={{ borderRadius: 1 }} />
              <Skeleton variant="rectangular" width={60} height={28} sx={{ borderRadius: 1 }} />
            </Stack>
          </Stack>
        ))}
      </Box>

      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ px: 2, py: 1.5 }}
      >
        <Skeleton variant="text" width={160} height={16} />
        <Stack direction="row" spacing={1} alignItems="center">
          <Skeleton variant="rectangular" width={28} height={28} sx={{ borderRadius: 1 }} />
          <Skeleton variant="rectangular" width={56} height={28} sx={{ borderRadius: 1 }} />
          <Skeleton variant="rectangular" width={28} height={28} sx={{ borderRadius: 1 }} />
        </Stack>
      </Stack>
    </PageCard>
  </>
);

export default AdminsSkeleton;
