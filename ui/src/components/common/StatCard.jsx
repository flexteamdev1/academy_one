import React from 'react';
import { Card, CardContent, Stack, Typography, Box } from '@mui/material';

const StatCard = ({ title, value, trend, accent = 'primary' }) => (
  <Card
    sx={{
      height: '100%',
      borderRadius: 4,
      background: (theme) =>
        `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.primary.light}22 100%)`,
    }}
  >
    <CardContent>
      <Stack spacing={1}>
        <Typography variant="subtitle2" color="text.secondary" sx={{ textTransform: 'uppercase' }}>
          {title}
        </Typography>
        <Stack direction="row" spacing={2} alignItems="flex-end">
          <Typography variant="h4">{value}</Typography>
          <Box
            sx={(theme) => {
              const palette = theme.palette[accent] || theme.palette.primary;
              return {
                px: 1.5,
                py: 0.5,
                borderRadius: 999,
                fontSize: '0.75rem',
                fontWeight: 600,
                backgroundColor: palette.main,
                color: palette.contrastText || theme.palette.primary.contrastText,
              };
            }}
          >
            {trend}
          </Box>
        </Stack>
      </Stack>
    </CardContent>
  </Card>
);

export default StatCard;
