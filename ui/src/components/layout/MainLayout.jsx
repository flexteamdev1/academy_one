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
        backgroundColor: (theme) => theme.customColors.layoutBg,
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
          minWidth: 0,
          overflowX: 'hidden',
          backgroundColor: (theme) => theme.customColors.layoutBg,
        }}
      >
        <Header
          title={current?.headerTitle || current?.label || 'Dashboard Overview'}
          breadcrumb={current?.breadcrumb || 'Main Dashboard'}
        />
        <Box
          sx={{
            px: { xs: 1.5, md: 3 },
            py: { xs: 2, md: 2.5 },
            width: '100%',
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
