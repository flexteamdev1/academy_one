import React from 'react';
import { Box, Button, Card, CardContent, Stack, Typography } from '@mui/material';
import CalendarMonthOutlined from '@mui/icons-material/CalendarMonthOutlined';

const EventsCard = ({ events }) => (
  <Card sx={(theme) => ({ borderRadius: theme.shape.borderRadius, border: `1px solid ${theme.palette.divider}`, boxShadow: 'none' })}>
    <CardContent sx={{ p: 2.2 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.7 }}>
        <Typography sx={{ fontSize: '1.35rem', fontWeight: 800, color: 'text.primary' }}>Events</Typography>
        <CalendarMonthOutlined sx={{ color: 'text.secondary' }} />
      </Stack>

      <Stack spacing={1.2}>
        {events.map((eventItem) => (
          <Stack key={eventItem.title} direction="row" spacing={1.2} alignItems="center">
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
        ))}
      </Stack>

      <Button
        variant="outlined"
        fullWidth
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
  </Card>
);

export default EventsCard;
