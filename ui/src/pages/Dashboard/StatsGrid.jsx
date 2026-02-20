import React from 'react';
import { Box } from '@mui/material';
import StatCard from '../../components/common/StatCard';

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
      <Box key={item.label} sx={{ display: 'flex' }}>
        <StatCard
          label={item.label}
          value={item.value}
          icon={item.icon}
          iconColor={item.iconColor}
          trend={item.trend}
          sx={{ boxShadow: 0, border: 1, borderColor: 'divider', width: '100%' }}
        />
      </Box>
    ))}
  </Box>
);

export default StatsGrid;
