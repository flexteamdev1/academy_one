import React from 'react';
import { Box, Card, CardContent, Stack, Typography } from '@mui/material';

const StatsGrid = ({ statCards }) => (
  <Box
    sx={{
      display: 'grid',
      gap: 2,
      gridTemplateColumns: {
        xs: '1fr',
        sm: 'repeat(2, minmax(0, 1fr))',
        lg: 'repeat(4, minmax(0, 1fr))',
      },
    }}
  >
    {statCards.map((item) => (
      <Box key={item.label}>
        <Card sx={{ border: 1, borderColor: 'divider', boxShadow: 0 }}>
          <CardContent sx={{ p: 2.2, '&:last-child': { pb: 2.2 } }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 1,
                  display: 'grid',
                  placeItems: 'center',
                  bgcolor: 'background.paper',
                  color: 'text.secondary',
                }}
              >
                {item.icon}
              </Box>
              <Box
                sx={{
                  px: 1,
                  py: 0.35,
                  borderRadius: 999,
                  bgcolor: 'background.paper',
                  color: 'text.secondary',
                  fontWeight: 700,
                  fontSize: '0.72rem',
                  border: 1,
                  borderColor: 'divider',
                }}
              >
                {item.trend}
              </Box>
            </Stack>

            <Typography sx={{ mt: 2, color: 'text.secondary', fontSize: '0.74rem', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              {item.label}
            </Typography>
            <Typography sx={{ mt: 0.7, color: 'text.primary', fontSize: '2rem', fontWeight: 800, lineHeight: 1 }}>
              {item.value}
            </Typography>
          </CardContent>
        </Card>
      </Box>
    ))}
  </Box>
);

export default StatsGrid;
