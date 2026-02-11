import React from 'react';
import {
  AppBar,
  Avatar,
  Box,
  IconButton,
  Stack,
  Toolbar,
  Typography,
} from '@mui/material';
import MenuOutlined from '@mui/icons-material/MenuOutlined';
import NotificationsOutlined from '@mui/icons-material/NotificationsOutlined';
import CalendarMonthOutlined from '@mui/icons-material/CalendarMonthOutlined';
import KeyboardArrowDownRounded from '@mui/icons-material/KeyboardArrowDownRounded';
import { Button } from '@mui/material';
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
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="h5">{title}</Typography>
              <Typography variant="body2" color="text.secondary">
                Portal / Main Dashboard
              </Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary">
              Monitor performance and academic operations in real time.
            </Typography>
          </Box>
        </Stack>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ flex: 1, justifyContent: 'flex-end' }}>
          <Button
            variant="outlined"
            startIcon={<CalendarMonthOutlined fontSize="small" />}
            endIcon={<KeyboardArrowDownRounded />}
            sx={{ backgroundColor: '#FFFDF9' }}
          >
            AY 2023-2024
          </Button>
          <IconButton
            sx={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #EFE7DD',
            }}
          >
            <NotificationsOutlined fontSize="small" />
          </IconButton>
          <Box sx={{ position: 'relative' }}>
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
            <Box
              sx={{
                position: 'absolute',
                right: 2,
                top: 2,
                width: 9,
                height: 9,
                borderRadius: '50%',
                backgroundColor: '#F2B248',
                border: '2px solid #FFFDF9',
              }}
            />
          </Box>
        </Stack>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
