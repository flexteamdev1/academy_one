import React from 'react';
import { Card } from '@mui/material';

const PageCard = ({ children, sx }) => (
  <Card
    sx={(theme) => ({
      borderRadius: theme.shape.borderRadius,
      border: `1px solid ${theme.palette.divider}`,
      boxShadow: '0 10px 24px rgba(15, 23, 42, 0.04)',
      backgroundColor: theme.palette.background.paper,
      ...sx,
    })}
  >
    {children}
  </Card>
);

export default PageCard;
