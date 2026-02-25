import React from 'react';
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
  useMediaQuery,
} from '@mui/material';
import SchoolOutlined from '@mui/icons-material/SchoolOutlined';
import HowToRegOutlined from '@mui/icons-material/HowToRegOutlined';
import { NavLink } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import navigation from '../../data/navigation';
import { useUIDispatch, useUIState } from '../../context/UIContext';
import { getUserRole } from '../../utils/auth';

const drawerWidth = 260;
const DEFAULT_ROLE = '';

const secondaryItems = [
  { label: 'Teachers', icon: SchoolOutlined, roles: ['super_admin', 'admin'] },
  { label: 'Admissions', icon: HowToRegOutlined, roles: ['super_admin', 'admin'] },
];

const SidebarContent = ({
  onNavigate,
  visibleNavigation,
  visibleSecondaryItems,
  portalLabel,
}) => (
  <Stack sx={{ height: '100%' }}>
    <Box sx={{ px: 3, py: 3 }}>
      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minHeight: 64 }}>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: (theme) => theme.shape.borderRadius,
            backgroundColor: 'primary.main',
            color: 'primary.contrastText',
            p: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg
            viewBox="0 0 48 48"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
          >
            <path d="M24 18.4228L42 11.475V34.3663C42 34.7796 41.7457 35.1504 41.3601 35.2992L24 42V18.4228Z" />
            <path d="M24 8.18819L33.4123 11.574L24 15.2071L14.5877 11.574L24 8.18819ZM9 15.8487L21 20.4805V37.6263L9 32.9945V15.8487ZM27 37.6263V20.4805L39 15.8487V32.9945L27 37.6263ZM25.354 2.29885C24.4788 1.98402 23.5212 1.98402 22.646 2.29885L4.98454 8.65208C3.7939 9.08038 3 10.2097 3 11.475V34.3663C3 36.0196 4.01719 37.5026 5.55962 38.098L22.9197 44.7987C23.6149 45.0671 24.3851 45.0671 25.0803 44.7987L42.4404 38.098C43.9828 37.5026 45 36.0196 45 34.3663V11.475C45 10.2097 44.2061 9.08038 43.0155 8.65208L25.354 2.29885Z" />
          </svg>
        </Box>
        <Box>
          <Typography sx={{ fontSize: '1.05rem', fontWeight: 700, lineHeight: 1.2 }}>
            Academy One
          </Typography>
          <Typography
            sx={{
              color: 'text.secondary',
              fontSize: '0.62rem',
              textTransform: 'uppercase',
              letterSpacing: '0.14em',
              fontWeight: 700,
              mt: 0.4,
            }}
          >
            {portalLabel}
          </Typography>
        </Box>
      </Stack>
    </Box>

    <List sx={{ px: 2, py: 1.5, flex: 1 }}>
      {visibleNavigation.map((item) => {
        const Icon = item.icon;
        return (
          <ListItemButton
            key={item.path}
            component={NavLink}
            to={item.path}
            onClick={onNavigate}
            sx={{
              mb: 1,
              borderRadius: (theme) => theme.shape.borderRadius,
              px: 1.5,
              py: 1.1,
              '&.active': {
                backgroundColor: (theme) => theme.palette.action.selected,
                color: 'primary.main',
                borderRight: '4px solid',
                borderRightColor: 'primary.main',
                '& .MuiListItemIcon-root': {
                  color: 'inherit',
                },
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 34, color: 'text.secondary' }}>
              <Icon fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary={item.label}
              primaryTypographyProps={{ fontWeight: 600, fontSize: '0.88rem' }}
            />
          </ListItemButton>
        );
      })}

      {visibleSecondaryItems.map((item) => {
        const Icon = item.icon;
        return (
          <ListItemButton
            key={item.label}
            sx={{
              mb: 1,
              borderRadius: (theme) => theme.shape.borderRadius,
              px: 1.5,
              py: 1.1,
              color: 'text.secondary',
              '&:hover': {
                backgroundColor: (theme) => theme.palette.action.hover,
                color: 'text.primary',
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 34, color: 'inherit' }}>
              <Icon fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary={item.label}
              primaryTypographyProps={{ fontWeight: 500, fontSize: '0.88rem' }}
            />
          </ListItemButton>
        );
      })}
    </List>

  </Stack>
);

const Sidebar = () => {
  const theme = useTheme();
  const { mobileSidebarOpen } = useUIState();
  const dispatch = useUIDispatch();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const userRole = getUserRole() || DEFAULT_ROLE;
  const portalLabelByRole = {
    super_admin: 'Super Admin Portal',
    admin: 'Admin Portal',
    teacher: 'Teacher Portal',
    student: 'Student Portal',
    parent: 'Parent Portal',
  };
  const portalLabel = portalLabelByRole[userRole] || 'Portal';
  const canAccess = (item) => !item.roles || item.roles.includes(userRole);
  const visibleNavigation = navigation.filter(canAccess);
  const primaryLabels = new Set(
    visibleNavigation.map((item) => String(item.label || '').trim().toLowerCase())
  );
  const visibleSecondaryItems = secondaryItems
    .filter(canAccess)
    .filter((item) => !primaryLabels.has(String(item.label || '').trim().toLowerCase()));

  const closeMobileSidebar = () => {
    if (!isDesktop) {
      dispatch({ type: 'CLOSE_MOBILE_SIDEBAR' });
    }
  };

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
            borderRight: '1px solid',
            borderRightColor: 'divider',
            backgroundColor: 'background.paper',
            boxShadow: isDesktop ? 'none' : '0 20px 60px rgba(31, 42, 55, 0.12)',
          },
        }}
      >
        <SidebarContent
          onNavigate={closeMobileSidebar}
          visibleNavigation={visibleNavigation}
          visibleSecondaryItems={visibleSecondaryItems}
          portalLabel={portalLabel}
        />
      </Drawer>
    </Box>
  );
};

export default Sidebar;
