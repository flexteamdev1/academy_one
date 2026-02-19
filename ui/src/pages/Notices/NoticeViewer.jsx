import React from 'react';
import {
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import EditOutlined from '@mui/icons-material/EditOutlined';
import ContentCopyOutlined from '@mui/icons-material/ContentCopyOutlined';
import MoreHorizOutlined from '@mui/icons-material/MoreHorizOutlined';
import AttachFileOutlined from '@mui/icons-material/AttachFileOutlined';
import PageCard from '../../components/common/PageCard';
import NoticeViewerSkeleton from '../../components/skeletons/NoticeViewerSkeleton';

const isPdfAttachment = (attachment) => {
  const name = String(attachment?.name || '').toLowerCase();
  const url = String(attachment?.url || '').toLowerCase();
  const format = String(attachment?.format || '').toLowerCase();
  const mimeType = String(attachment?.mimeType || '').toLowerCase();
  return name.endsWith('.pdf') || url.includes('.pdf') || format === 'pdf' || mimeType === 'application/pdf';
};

const NoticeViewer = ({
  selectedNotice,
  loading,
  canCreate,
  getStatusColor,
  statusLabel,
  formatDate,
  audienceLabelMap,
  channelLabelMap,
}) => (
  loading ? (
    <NoticeViewerSkeleton />
  ) : (
  <PageCard sx={{ p: 2.2, minHeight: { xs: 320, lg: '76vh' }, overflowY: 'auto' }}>
    {selectedNotice ? (
      <>
        <Stack direction="row" justifyContent="space-between" spacing={1} sx={{ mb: 1 }}>
          <Typography sx={{ fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'text.secondary' }}>
            Selected Notice
          </Typography>

          <Stack direction="row" spacing={0.6}>
            <Chip size="small" color={getStatusColor(selectedNotice.status)} label={statusLabel(selectedNotice.status)} />
            {canCreate ? <Button size="small" startIcon={<EditOutlined fontSize="small" />}>Edit</Button> : null}
            {canCreate ? <Button size="small" startIcon={<ContentCopyOutlined fontSize="small" />}>Duplicate</Button> : null}
            {canCreate ? <IconButton size="small"><MoreHorizOutlined fontSize="small" /></IconButton> : null}
          </Stack>
        </Stack>

        <Typography sx={{ fontSize: '1.9rem', fontWeight: 700, lineHeight: 1.1, mb: 1.2 }}>
          {selectedNotice.title}
        </Typography>

        <Stack spacing={0.7} sx={{ mb: 2 }}>
          <Typography sx={{ color: 'text.secondary', fontSize: '0.83rem' }}>
            Created by {selectedNotice.createdBy}
          </Typography>
          <Typography sx={{ color: 'text.secondary', fontSize: '0.83rem' }}>
            Published on {formatDate(selectedNotice.publishedAt || selectedNotice.createdAt, true)}
          </Typography>
          <Typography sx={{ color: 'text.secondary', fontSize: '0.83rem' }}>
            Visible to portal and app
          </Typography>
        </Stack>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ sm: 'center' }} sx={{ mb: 2 }}>
          <Typography sx={{ color: 'text.secondary', fontSize: '0.84rem', minWidth: 65 }}>
            Audience
          </Typography>
          <Stack direction="row" spacing={0.8} flexWrap="wrap" useFlexGap>
            {(selectedNotice.audiences || []).map((item) => (
              <Chip key={item} size="small" label={audienceLabelMap[item] || item} />
            ))}
            {(selectedNotice.grades || []).map((item) => (
              <Chip key={item} size="small" label={item} variant="outlined" />
            ))}
          </Stack>
        </Stack>

        <Divider sx={{ mb: 2 }} />

        <Typography sx={{ fontSize: '0.74rem', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'text.secondary', mb: 1 }}>
          Notice Body
        </Typography>
        <Typography sx={{ whiteSpace: 'pre-line', lineHeight: 1.75, fontSize: '0.95rem', mb: 2 }}>
          {selectedNotice.body}
        </Typography>

        <Typography sx={{ fontSize: '0.74rem', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'text.secondary', mb: 1 }}>
          Attachments
        </Typography>
        {selectedNotice.attachments.length ? (
          <Stack spacing={0.7} sx={{ mb: 2 }}>
            {selectedNotice.attachments.map((attachment) => (
              <Box
                key={`${attachment.name}-${attachment.size}-${attachment.url}`}
                sx={{ px: 1.1, py: 0.8, borderRadius: 1.5, bgcolor: 'action.hover' }}
              >
                <Stack direction="row" spacing={1} alignItems="center">
                  <AttachFileOutlined sx={{ fontSize: 16, color: 'text.secondary' }} />
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ flexWrap: 'wrap' }}>
                    <Typography sx={{ fontSize: '0.82rem' }}>
                      {attachment.name} · {attachment.size}
                    </Typography>
                    {attachment.url ? (
                      <Button
                        size="small"
                        component="a"
                        href={attachment.url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Open
                      </Button>
                    ) : null}
                  </Stack>
                </Stack>
                {attachment.url && isPdfAttachment(attachment) ? (
                  <Box
                    component="object"
                    data={attachment.url}
                    type="application/pdf"
                    sx={{
                      width: '100%',
                      height: 480,
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                      mt: 1,
                      backgroundColor: 'background.paper',
                    }}
                  >
                    <Typography sx={{ color: 'text.secondary', p: 1 }}>
                      PDF preview not available. Use the Open button.
                    </Typography>
                  </Box>
                ) : null}
              </Box>
            ))}
          </Stack>
        ) : (
          <Typography sx={{ color: 'text.secondary', fontSize: '0.86rem', mb: 2 }}>
            No attachments
          </Typography>
        )}

        <Typography sx={{ fontSize: '0.74rem', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'text.secondary', mb: 0.7 }}>
          Delivery Channels
        </Typography>
        <Typography sx={{ color: 'text.secondary', fontSize: '0.86rem' }}>
          Sent via {(selectedNotice.channels || []).map((item) => channelLabelMap[item] || item).join(', ').toLowerCase() || 'in-app notification'}.
        </Typography>
      </>
    ) : (
      <Stack alignItems="center" justifyContent="center" sx={{ height: '100%' }}>
        <Typography sx={{ fontWeight: 700, mb: 0.4 }}>No notice selected</Typography>
        <Typography sx={{ color: 'text.secondary' }}>
          Select a notice from the left panel.
        </Typography>
      </Stack>
    )}
  </PageCard>
  )
);

export default NoticeViewer;
