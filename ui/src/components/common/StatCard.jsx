import React from 'react';
import { Card, CardContent, Stack, Typography, Box } from '@mui/material';

const StatCard = ({ title, value, trend, icon, bgColor, tone }) => (
  <Card
    sx={{
      height: '100%',
      borderRadius: 12,
      overflow: 'hidden',
      backgroundColor: bgColor,
      border: '1px solid #EEE6DD',
    }}
  >
    <CardContent sx={{ p: 3 }}>
      <Stack spacing={2}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box
            sx={{
              width: 42,
              height: 42,
              borderRadius: '14px',
              backgroundColor: '#FFFFFFAA',
              display: 'grid',
              placeItems: 'center',
              color: tone,
            }}
          >
            {icon}
          </Box>
          <Box
            sx={{
              px: 1.4,
              py: 0.4,
              borderRadius: 999,
              fontSize: '0.75rem',
              fontWeight: 600,
              backgroundColor: '#FFFFFF',
              color: tone,
              border: '1px solid #F0E7DD',
            }}
          >
            {trend}
          </Box>
        </Stack>
        <Box>
          <Typography variant="subtitle2" sx={{ color: tone }}>
            {title}
          </Typography>
          <Typography variant="h4">{value}</Typography>
        </Box>
      </Stack>
    </CardContent>
  </Card>
);

export default StatCard;
