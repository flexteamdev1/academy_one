import React from 'react';
import { Box, Button, CardContent, Skeleton, Stack, Typography } from '@mui/material';
import CalendarMonthOutlined from '@mui/icons-material/CalendarMonthOutlined';
import PageCard from '../../components/common/PageCard';

const EventsCard = ({ events, loading = false, onAddReminder }) => (
  <PageCard sx={{ height: '100%', width: '100%', boxShadow: 'none' }}>
    <CardContent sx={{ p: 2.2, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.7 }}>
        <Typography sx={{ fontSize: '1.35rem', fontWeight: 800, color: 'text.primary' }}>Events</Typography>
        <CalendarMonthOutlined sx={{ color: 'text.secondary' }} />
      </Stack>

      <Stack spacing={1.2} sx={{ flex: 1 }}>
        {loading ? (
          Array.from({ length: 3 }).map((_, idx) => (
            <Stack key={`event-skeleton-${idx}`} direction="row" spacing={1.2} alignItems="center">
              <Skeleton variant="rectangular" width={40} height={40} sx={{ borderRadius: 1 }} />
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Skeleton variant="text" width="70%" height={18} />
                <Skeleton variant="text" width="45%" height={16} />
              </Box>
            </Stack>
          ))
        ) : events.length === 0 ? (
          <Typography sx={{ color: 'text.secondary', fontSize: '0.9rem' }}>
            No upcoming notices yet.
          </Typography>
        ) : (
          events.map((eventItem, index) => (
            <Stack key={eventItem.id || `${eventItem.title}-${index}`} direction="row" spacing={1.2} alignItems="center">
              <Box
                sx={(theme) => ({
                  width: 40,
                  height: 40,
                  borderRadius: theme.shape.borderRadius,
                  backgroundColor: theme.palette.info.light,
                  border: `1px solid ${theme.palette.divider}`,
                  display: 'grid',
                  placeItems: 'center',
                  lineHeight: 1,
                })}
              >
                <Typography sx={{ fontSize: '0.88rem', fontWeight: 800, color: 'primary.main' }}>{eventItem.day}</Typography>
                <Typography sx={{ fontSize: '0.58rem', letterSpacing: '0.08em', color: 'text.secondary', fontWeight: 800 }}>{eventItem.month}</Typography>
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontWeight: 700, color: 'text.primary' }}>{eventItem.title}</Typography>
                <Typography sx={{ color: 'text.secondary', fontSize: '0.82rem' }}>{eventItem.meta}</Typography>
              </Box>
            </Stack>
          ))
        )}
      </Stack>

      <Button
        variant="outlined"
        fullWidth
        onClick={onAddReminder}
        sx={(theme) => ({
          mt: 2,
          borderRadius: theme.shape.borderRadius,
          borderStyle: 'dashed',
          borderColor: theme.palette.grey[200],
          color: 'text.secondary',
          textTransform: 'none',
          fontWeight: 700,
          '&:hover': {
            borderStyle: 'dashed',
            borderColor: theme.palette.grey[300],
            backgroundColor: theme.palette.grey[50],
          },
        })}
      >
        + Add Reminder
      </Button>
    </CardContent>
  </PageCard>
);

export default EventsCard;
