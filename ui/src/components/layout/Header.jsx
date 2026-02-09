import React from 'react';
import {
  AppBar,
  Avatar,
  Box,
  IconButton,
  InputBase,
  Stack,
  Toolbar,
  Typography,
} from '@mui/material';
import MenuOutlined from '@mui/icons-material/MenuOutlined';
import SearchOutlined from '@mui/icons-material/SearchOutlined';
import NotificationsOutlined from '@mui/icons-material/NotificationsOutlined';
import { useUIDispatch } from '../../context/UIContext';

const Header = ({ title }) => {
  const dispatch = useUIDispatch();
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        backgroundColor: 'transparent',
        color: 'text.primary',
        backdropFilter: 'blur(10px)',
      }}
    >
      <Toolbar
        sx={{
          px: { xs: 2, md: 4 },
          py: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
        }}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          <IconButton
            color="inherit"
            onClick={() => dispatch({ type: 'TOGGLE_MOBILE_SIDEBAR' })}
            sx={{ display: { md: 'none' } }}
          >
            <MenuOutlined />
          </IconButton>
          <Box>
            <Typography variant="h5">{title}</Typography>
            <Typography variant="body2" color="text.secondary">
              Welcome back{userInfo?.name ? `, ${userInfo.name}` : ''}
            </Typography>
          </Box>
        </Stack>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ flex: 1, justifyContent: 'flex-end' }}>
          <Box
            sx={{
              display: { xs: 'none', sm: 'flex' },
              alignItems: 'center',
              gap: 1,
              px: 2,
              py: 1,
              borderRadius: 999,
              backgroundColor: 'background.paper',
              boxShadow: (theme) => `0 6px 20px ${theme.palette.primary.main}1A`,
            }}
          >
            <SearchOutlined fontSize="small" />
            <InputBase placeholder="Search" sx={{ fontSize: '0.9rem' }} />
          </Box>
          <IconButton
            sx={{
              backgroundColor: 'background.paper',
              boxShadow: (theme) => `0 6px 16px ${theme.palette.primary.main}22`,
            }}
          >
            <NotificationsOutlined fontSize="small" />
          </IconButton>
          <Avatar
            sx={{
              width: 40,
              height: 40,
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              fontWeight: 600,
            }}
          >
            {userInfo?.name ? userInfo.name.charAt(0).toUpperCase() : 'A'}
          </Avatar>
        </Stack>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
