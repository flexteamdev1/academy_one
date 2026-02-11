import React from 'react';
import {
  Box,
  Divider,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { NavLink } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import navigation from '../../data/navigation';
import { useUIDispatch, useUIState } from '../../context/UIContext';

const drawerWidth = 260;

const SidebarContent = () => (
  <Stack sx={{ height: '100%' }}>
    <Box sx={{ px: 3, py: 3 }}>
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #5B5CE3 0%, #8E8FF0 100%)',
            color: '#fff',
            display: 'grid',
            placeItems: 'center',
            fontWeight: 700,
          }}
        >
          A
        </Box>
        <Box>
          <Typography variant="h6">Academy One</Typography>
          <Typography variant="subtitle2" color="text.secondary">
            Admin Portal
          </Typography>
        </Box>
      </Stack>
    </Box>
    <List sx={{ px: 2, py: 2, flex: 1 }}>
      {navigation.map((item) => {
        const Icon = item.icon;
        return (
          <ListItemButton
            key={item.path}
            component={NavLink}
            to={item.path}
            sx={{
              mb: 1,
              borderRadius: 999,
              px: 2,
              py: 1.25,
              '&.active': {
                backgroundColor: '#F0EDFF',
                color: 'primary.main',
                boxShadow: 'inset 0 0 0 1px #E3DCFF',
                '& .MuiListItemIcon-root': {
                  color: 'inherit',
                },
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40, color: 'text.secondary' }}>
              <Icon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        );
      })}
    </List>
    <Box sx={{ px: 3, pb: 3 }}>
      <Box
        sx={{
          p: 2,
          borderRadius: 4,
          backgroundColor: '#FFFFFF',
          border: '1px solid #F0E7DD',
          boxShadow: '0px 12px 28px rgba(31, 42, 55, 0.08)',
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
        }}
      >
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #F5C6A5 0%, #E89AA3 100%)',
          }}
        />
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            Alex Johnson
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Super Admin
          </Typography>
        </Box>
      </Box>
    </Box>
  </Stack>
);

const Sidebar = () => {
  const theme = useTheme();
  const { mobileSidebarOpen } = useUIState();
  const dispatch = useUIDispatch();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  return (
    <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
      <Drawer
        variant={isDesktop ? 'permanent' : 'temporary'}
        open={isDesktop ? true : mobileSidebarOpen}
        onClose={() => dispatch({ type: 'CLOSE_MOBILE_SIDEBAR' })}
        ModalProps={{ keepMounted: true }}
        sx={{
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            borderRight: 'none',
            backgroundColor: '#FFFDF9',
            boxShadow: isDesktop ? 'none' : '0 20px 60px rgba(31, 42, 55, 0.12)',
          },
        }}
      >
        <SidebarContent />
      </Drawer>
    </Box>
  );
};

export default Sidebar;
