import React from 'react';
import {
  Box,
  Chip,
  CircularProgress,
  Stack,
  Typography,
} from '@mui/material';
import PageCard from '../../components/common/PageCard';

const NoticeList = ({
  notices,
  total,
  loading,
  selectedNoticeId,
  setSelectedNoticeId,
  audienceLabelMap,
  formatDate,
  getStatusColor,
  statusLabel,
}) => (
  <PageCard sx={{ p: 0, height: { xs: 'auto', lg: '76vh' }, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
    <Stack direction="row" justifyContent="space-between" sx={{ px: 2, py: 1.7, borderBottom: '1px solid', borderColor: 'divider' }}>
      <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'text.secondary' }}>
        All Notices
      </Typography>
      <Typography sx={{ fontSize: '0.78rem', color: 'text.secondary' }}>
        Showing {notices.length} of {total}
      </Typography>
    </Stack>

    <Box sx={{ overflowY: 'auto' }}>
      {loading ? (
        <Stack alignItems="center" justifyContent="center" sx={{ py: 6 }}>
          <CircularProgress size={28} />
        </Stack>
      ) : null}

      {!loading && notices.length ? (
        notices.map((notice) => {
          const active = selectedNoticeId === notice.id;
          return (
            <Box
              key={notice.id}
              role="button"
              tabIndex={0}
              onClick={() => setSelectedNoticeId(notice.id)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') setSelectedNoticeId(notice.id);
              }}
              sx={{
                px: 2,
                py: 1.5,
                borderBottom: '1px solid',
                borderColor: 'divider',
                backgroundColor: active ? 'action.hover' : 'transparent',
                cursor: 'pointer',
              }}
            >
              <Stack direction="row" justifyContent="space-between" spacing={1} alignItems="start">
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ fontWeight: 700, fontSize: '0.92rem' }} noWrap>
                    {notice.title}
                  </Typography>
                  <Typography sx={{ color: 'text.secondary', fontSize: '0.78rem' }}>
                    Created by {notice.createdBy}
                  </Typography>
                </Box>
                <Chip
                  size="small"
                  color={getStatusColor(notice.status)}
                  label={statusLabel(notice.status)}
                  sx={{ height: 22, fontSize: '0.68rem' }}
                />
              </Stack>

              <Stack direction="row" spacing={1.5} sx={{ mt: 0.8 }}>
                <Typography sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
                  {(notice.audiences || []).map((item) => audienceLabelMap[item] || item).join(', ') || 'All'}
                </Typography>
                <Typography sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
                  {formatDate(notice.publishedAt || notice.createdAt)}
                </Typography>
              </Stack>
            </Box>
          );
        })
      ) : null}

      {!loading && !notices.length ? (
        <Box sx={{ px: 2, py: 4 }}>
          <Typography sx={{ fontWeight: 700, mb: 0.5 }}>No notices found</Typography>
          <Typography sx={{ color: 'text.secondary', fontSize: '0.9rem' }}>
            Try changing search or filter values.
          </Typography>
        </Box>
      ) : null}
    </Box>
  </PageCard>
);

export default NoticeList;
