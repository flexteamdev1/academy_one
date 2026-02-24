import React, { useState } from 'react';
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Toolbar,
  Typography,
} from '@mui/material';
import MenuOutlined from '@mui/icons-material/MenuOutlined';
import LogoutOutlined from '@mui/icons-material/LogoutOutlined';
import { useUIDispatch, useUIState } from '../../context/UIContext';
import { getUserInfo, getUserRole } from '../../utils/auth';
import { useNavigate } from 'react-router-dom';

const Header = ({ title, breadcrumb = 'Main Dashboard' }) => {
  const dispatch = useUIDispatch();
  const { selectedAcademicYearId } = useUIState();
  const [profileAnchor, setProfileAnchor] = useState(null);
  const navigate = useNavigate();
  const userInfo = getUserInfo();
  const userRole = getUserRole();
  const userName = String(userInfo?.name || userInfo?.user?.name || 'User').trim();
  const userInitial = String(userName || 'U').charAt(0).toUpperCase();
  const userRoleLabel = String(userRole || 'user').replace('_', ' ');

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    navigate('/login', { replace: true });
  };
  const handleProfileNavigate = (path) => {
    setProfileAnchor(null);
    navigate(path);
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        top: 0,
        zIndex: (theme) => theme.zIndex.appBar,
        width: '100%',
        backgroundColor: 'rgba(255,255,255,0.84)',
        color: 'text.primary',
        backdropFilter: 'blur(8px)',
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Toolbar
        sx={{
          minHeight: { xs: '56px !important', sm: '64px !important' },
          px: { xs: 2, md: 4 },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ flex: 1, minWidth: 0 }}>
          <IconButton
            color="inherit"
            onClick={() => dispatch({ type: 'TOGGLE_MOBILE_SIDEBAR' })}
            sx={{ display: { md: 'none' } }}
          >
            <MenuOutlined />
          </IconButton>

          <Typography
            sx={{
              fontWeight: 700,
              fontSize: { xs: '0.98rem', sm: '1.04rem', md: '1.1rem' },
              minWidth: 0,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
            noWrap
          >
            {title}
          </Typography>

          <Stack
            direction="row"
            spacing={0.8}
            alignItems="center"
            sx={{ display: { xs: 'none', lg: 'flex' }, minWidth: 0 }}
          >
            <Typography sx={{ fontSize: '0.82rem', color: 'text.secondary' }}>Portal</Typography>
            <Typography sx={{ fontSize: '0.82rem', color: (theme) => theme.palette.text.secondary }}>
              /
            </Typography>
            <Typography sx={{ fontSize: '0.82rem', fontWeight: 500 }} noWrap>
              {breadcrumb}
            </Typography>
          </Stack>
        </Stack>

        <Stack direction="row" spacing={1.2} alignItems="center">
          <IconButton
            onClick={(event) => setProfileAnchor(event.currentTarget)}
            sx={{
              ml: 0.5,
              width: 40,
              height: 40,
              borderRadius: '12px',
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
              '&:hover': { bgcolor: 'action.hover' },
            }}
          >
            <Avatar
              sx={{
                width: 28,
                height: 28,
                fontSize: '0.8rem',
                bgcolor: 'primary.light',
                color: 'primary.dark',
              }}
            >
              {userInitial}
            </Avatar>
          </IconButton>

          <Menu
            anchorEl={profileAnchor}
            open={Boolean(profileAnchor)}
            onClose={() => setProfileAnchor(null)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            PaperProps={{
              sx: {
                mt: 1,
                minWidth: 260,
                borderRadius: '14px',
                border: '1px solid',
                borderColor: 'divider',
                boxShadow: '0 20px 50px rgba(16,24,40,0.12)',
              },
            }}
          >
            <Box sx={{ px: 2, pt: 2, pb: 1.5 }}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Avatar
                  sx={{
                    width: 40,
                    height: 40,
                    bgcolor: 'primary.light',
                    color: 'primary.dark',
                    fontWeight: 700,
                  }}
                >
                  {userInitial}
                </Avatar>
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ fontWeight: 700, fontSize: '0.9rem' }} noWrap>
                    {userName || 'User'}
                  </Typography>
                  <Typography
                    sx={{
                      color: 'text.secondary',
                      fontSize: '0.7rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.12em',
                      fontWeight: 600,
                    }}
                    noWrap
                  >
                    {userRoleLabel}
                  </Typography>
                </Box>
              </Stack>
            </Box>
            <Divider />
            <MenuItem onClick={() => handleProfileNavigate('/change-password')} sx={{ py: 1.2 }}>
              <Typography sx={{ fontWeight: 600 }}>Change Password</Typography>
            </MenuItem>
            <MenuItem onClick={() => handleProfileNavigate('/profile')} sx={{ py: 1.2 }}>
              <Typography sx={{ fontWeight: 600 }}>Profile</Typography>
            </MenuItem>
            <MenuItem onClick={() => handleProfileNavigate('/settings')} sx={{ py: 1.2 }}>
              <Typography sx={{ fontWeight: 600 }}>Settings</Typography>
            </MenuItem>
            <MenuItem onClick={() => handleProfileNavigate('/support')} sx={{ py: 1.2 }}>
              <Typography sx={{ fontWeight: 600 }}>Support</Typography>
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout} sx={{ py: 1.2 }}>
              <Stack direction="row" spacing={1.2} alignItems="center">
                <LogoutOutlined fontSize="small" />
                <Typography sx={{ fontWeight: 600 }}>Logout</Typography>
              </Stack>
            </MenuItem>
          </Menu>
        </Stack>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
