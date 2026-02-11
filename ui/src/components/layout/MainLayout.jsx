import React from 'react';
import { Box } from '@mui/material';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import navigation from '../../data/navigation';

const MainLayout = () => {
  const location = useLocation();
  const current = navigation.find((item) => item.path === location.pathname);

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        background: (theme) =>
          `linear-gradient(180deg, ${theme.palette.background.default} 0%, #FFFDF9 60%, #FAF2EA 100%)`,
      }}
    >
      <Sidebar />
      <Box
        component="main"
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
        }}
      >
        <Header title={current?.label || 'Academy One'} />
        <Box
          sx={{
            px: { xs: 2, md: 4 },
            pb: 4,
            pt: { xs: 2, md: 3 },
            flex: 1,
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default MainLayout;
