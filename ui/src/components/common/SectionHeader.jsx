import React from 'react';
import { Box, Stack, Typography } from '@mui/material';

const SectionHeader = ({ title, subtitle, actions }) => (
  <Box sx={{ mb: 3 }}>
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={2}
      alignItems={{ sm: 'center' }}
      justifyContent="space-between"
    >
      <Box>
        <Typography variant="h4" sx={{ mb: 0.5 }}>
          {title}
        </Typography>
        {subtitle ? (
          <Typography variant="subtitle1" color="text.secondary">
            {subtitle}
          </Typography>
        ) : null}
      </Box>
      {actions ? <Box>{actions}</Box> : null}
    </Stack>
  </Box>
);

export default SectionHeader;
