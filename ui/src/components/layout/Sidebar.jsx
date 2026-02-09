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
      <Typography variant="h5" sx={{ letterSpacing: '0.04em' }}>
        Academy One
      </Typography>
      <Typography variant="subtitle2" color="text.secondary">
        Admin Console
      </Typography>
    </Box>
    <Divider />
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
              borderRadius: 3,
              '&.active': {
                backgroundColor: 'primary.main',
                color: 'primary.contrastText',
                boxShadow: (theme) => `0 10px 24px ${theme.palette.primary.main}33`,
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
          borderRadius: 3,
          background: (theme) =>
            `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
          color: 'primary.contrastText',
        }}
      >
        <Typography variant="subtitle2" sx={{ letterSpacing: '0.08em' }}>
          QUICK TIP
        </Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          Review attendance daily to keep your data accurate.
        </Typography>
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
            backgroundColor: 'background.paper',
            boxShadow: isDesktop ? 'none' : (theme) => `0 20px 60px ${theme.palette.primary.main}33`,
          },
        }}
      >
        <SidebarContent />
      </Drawer>
    </Box>
  );
};

export default Sidebar;
