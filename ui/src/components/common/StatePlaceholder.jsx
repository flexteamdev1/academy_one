import React from 'react';
import { Box, Button, Typography } from '@mui/material';

export const LoadingState = ({ message = 'Loading data...' }) => (
  <Box
    sx={{
      minHeight: 180,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      gap: 1,
      color: 'text.secondary',
    }}
  >
    <Box
      sx={(theme) => ({
        width: 56,
        height: 56,
        borderRadius: '50%',
        border: `3px solid ${theme.palette.primary.light}`,
        borderTopColor: theme.palette.primary.main,
        animation: 'spin 1s linear infinite',
      })}
    />
    <Typography variant="body2">{message}</Typography>
  </Box>
);

export const ErrorState = ({ message, onRetry }) => (
  <Box
    sx={{
      minHeight: 180,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      gap: 2,
      textAlign: 'center',
    }}
  >
    <Typography variant="h6">Something went wrong</Typography>
    <Typography variant="body2" color="text.secondary">
      {message || 'Please try again in a moment.'}
    </Typography>
    {onRetry ? (
      <Button variant="contained" onClick={onRetry}>
        Retry
      </Button>
    ) : null}
  </Box>
);

export const EmptyState = ({ title, description, action }) => (
  <Box
    sx={{
      minHeight: 180,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      gap: 1,
      textAlign: 'center',
    }}
  >
    <Typography variant="h6">{title}</Typography>
    {description ? (
      <Typography variant="body2" color="text.secondary">
        {description}
      </Typography>
    ) : null}
    {action}
  </Box>
);
