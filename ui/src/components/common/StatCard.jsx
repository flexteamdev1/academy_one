import React from 'react';
import { Box, Stack, Typography } from '@mui/material';
import PageCard from './PageCard';

const StatCard = ({ label, value, icon: Icon, iconColor, trend, sx }) => (
  <PageCard sx={{ p: 2, height: '100%', width: '100%', ...sx }}>
    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.1 }}>
      <Typography
        sx={{
          fontSize: '0.74rem',
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
          color: 'text.secondary',
          fontWeight: 700,
        }}
      >
        {label}
      </Typography>
      <Stack direction="row" spacing={1} alignItems="center">
        {trend ? (
          <Box
            sx={(theme) => ({
              px: 1,
              py: 0.35,
              borderRadius: 999,
              bgcolor: theme.palette.grey[50],
              color: 'text.secondary',
              fontWeight: 700,
              fontSize: '0.72rem',
              border: '1px solid',
              borderColor: theme.palette.grey[100],
            })}
          >
            {trend}
          </Box>
        ) : null}
        {Icon ? (
        <Box
          sx={(theme) => {
            let resolved = theme.palette.text.secondary;
            if (typeof iconColor === 'function') {
              resolved = iconColor(theme);
            } else if (typeof iconColor === 'string') {
              const [paletteKey, shade] = iconColor.split('.');
              if (theme.palette[paletteKey]?.[shade]) {
                resolved = theme.palette[paletteKey][shade];
              } else {
                resolved = iconColor;
              }
            }

            return {
              width: 36,
              height: 36,
              borderRadius: 1,
              display: 'grid',
              placeItems: 'center',
              backgroundColor: theme.palette.grey[50],
              color: resolved,
              border: '1px solid',
              borderColor: theme.palette.grey[100],
            };
          }}
        >
          <Icon fontSize="small" />
        </Box>
        ) : null}
      </Stack>
    </Stack>
    <Typography sx={{ fontWeight: 800, fontSize: '1.8rem' }}>{value}</Typography>
  </PageCard>
);

export default StatCard;
