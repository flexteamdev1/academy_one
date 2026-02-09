import React from 'react';
import { Card } from '@mui/material';

const PageCard = ({ children, sx }) => (
  <Card
    sx={(theme) => ({
      borderRadius: 3,
      border: `1px solid ${theme.palette.divider}`,
      boxShadow: 'none',
      backgroundColor: theme.palette.background.paper,
      ...sx,
    })}
  >
    {children}
  </Card>
);

export default PageCard;
