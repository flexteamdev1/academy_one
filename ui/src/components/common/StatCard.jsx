import React from 'react';
import { Card, CardContent, Stack, Typography, Box } from '@mui/material';

const StatCard = ({ title, value, trend, icon, bgColor, tone }) => (
  <Card
    sx={(theme) => ({
      height: '100%',
      borderRadius: theme.shape.borderRadius,
      overflow: 'hidden',
      backgroundColor: bgColor,
      border: `1px solid ${theme.palette.divider}`,
      boxShadow: '0 10px 24px rgba(15, 23, 42, 0.04)',
    })}
  >
    <CardContent sx={{ p: 3 }}>
      <Stack spacing={2}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box
            sx={{
              width: 42,
              height: 42,
              borderRadius: (theme) => theme.shape.borderRadius,
              backgroundColor: (theme) => theme.palette.action.hover,
              display: 'grid',
              placeItems: 'center',
              color: tone,
            }}
          >
            {icon}
          </Box>
          <Box
            sx={(theme) => ({
              px: 1.4,
              py: 0.4,
              borderRadius: 999,
              fontSize: '0.75rem',
              fontWeight: 600,
              backgroundColor: theme.palette.background.paper,
              color: tone,
              border: `1px solid ${theme.palette.divider}`,
            })}
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
