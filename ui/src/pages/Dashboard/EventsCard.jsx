import React from 'react';
import { Box, Button, Card, CardContent, Stack, Typography } from '@mui/material';
import CalendarMonthOutlined from '@mui/icons-material/CalendarMonthOutlined';

const EventsCard = ({ events }) => (
  <Card sx={(theme) => ({ borderRadius: theme.customRadius.lg, border: `1px solid ${theme.customColors.softBorder}`, boxShadow: 'none' })}>
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
                borderRadius: theme.customRadius.md,
                backgroundColor: theme.customColors.pastelBlue,
                border: `1px solid ${theme.customColors.softBorder}`,
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
          borderRadius: theme.customRadius.md,
          borderStyle: 'dashed',
          borderColor: theme.customColors.stone200,
          color: 'text.secondary',
          textTransform: 'none',
          fontWeight: 700,
          '&:hover': {
            borderStyle: 'dashed',
            borderColor: theme.customColors.stone300,
            backgroundColor: theme.customColors.stone50,
          },
        })}
      >
        + Add Reminder
      </Button>
    </CardContent>
  </Card>
);

export default EventsCard;
