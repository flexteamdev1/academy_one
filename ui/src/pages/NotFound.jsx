import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

const NotFound = () => (
  <Box
    sx={{
      minHeight: '70vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      gap: 2,
    }}
  >
    <Typography variant="h3">Page not found</Typography>
    <Typography variant="body1" color="text.secondary">
      The page you’re looking for doesn’t exist or has moved.
    </Typography>
    <Button variant="contained" component={Link} to="/">
      Back to dashboard
    </Button>
  </Box>
);

export default NotFound;
