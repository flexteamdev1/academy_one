import React, { useEffect, useMemo, useState } from 'react';
import {
  AppBar,
  Button,
  CircularProgress,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Toolbar,
  Typography,
} from '@mui/material';
import MenuOutlined from '@mui/icons-material/MenuOutlined';
import NotificationsOutlined from '@mui/icons-material/NotificationsOutlined';
import CalendarMonthOutlined from '@mui/icons-material/CalendarMonthOutlined';
import KeyboardArrowDownRounded from '@mui/icons-material/KeyboardArrowDownRounded';
import { useUIDispatch, useUIState } from '../../context/UIContext';
import { listAcademicYears } from '../../services/academicYearService';

const Header = ({ title, breadcrumb = 'Main Dashboard' }) => {
  const dispatch = useUIDispatch();
  const { selectedAcademicYearId } = useUIState();
  const [years, setYears] = useState([]);
  const [loadingYears, setLoadingYears] = useState(true);
  const [yearMenuAnchor, setYearMenuAnchor] = useState(null);

  useEffect(() => {
    const loadYears = async () => {
      setLoadingYears(true);
      try {
        const response = await listAcademicYears({ page: 1, limit: 200 });
        const items = response.items || [];
        setYears(items);

        const active =
          items.find((item) => item.isActive) ||
          items.find((item) => String(item.status || '').toUpperCase() === 'ACTIVE');
        const hasSelected = items.some((item) => String(item._id) === String(selectedAcademicYearId));
        const nextId = hasSelected ? selectedAcademicYearId : (active?._id || '');

        if (nextId && nextId !== selectedAcademicYearId) {
          localStorage.setItem('selectedAcademicYearId', nextId);
          dispatch({ type: 'SET_ACADEMIC_YEAR', payload: nextId });
        } else if (!nextId && selectedAcademicYearId) {
          localStorage.removeItem('selectedAcademicYearId');
          dispatch({ type: 'SET_ACADEMIC_YEAR', payload: '' });
        }
      } catch (_error) {
        setYears([]);
      } finally {
        setLoadingYears(false);
      }
    };

    loadYears();
  }, []);

  const selectedYearLabel = useMemo(() => {
    const selected = years.find((item) => String(item._id) === String(selectedAcademicYearId));
    return selected?.name || 'Select Year';
  }, [years, selectedAcademicYearId]);

  const onAcademicYearChange = (nextId) => {
    localStorage.setItem('selectedAcademicYearId', nextId);
    dispatch({ type: 'SET_ACADEMIC_YEAR', payload: nextId });
    setYearMenuAnchor(null);
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
          <Button
            variant="outlined"
            startIcon={
              <CalendarMonthOutlined
                fontSize="small"
                sx={{ color: (theme) => theme.palette.primary.main }}
              />
            }
            endIcon={<KeyboardArrowDownRounded />}
            onClick={(event) => setYearMenuAnchor(event.currentTarget)}
            sx={{
              display: { xs: 'none', md: 'inline-flex' },
              backgroundColor: 'background.paper',
              borderColor: (theme) => theme.palette.divider,
              color: 'text.secondary',
              fontWeight: 700,
              fontSize: '0.72rem',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              px: 1.5,
              py: 0.85,
              maxWidth: 230,
            }}
          >
            {loadingYears ? 'Loading...' : selectedYearLabel}
          </Button>

          <Menu
            anchorEl={yearMenuAnchor}
            open={Boolean(yearMenuAnchor)}
            onClose={() => setYearMenuAnchor(null)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            transformOrigin={{ vertical: 'top', horizontal: 'left' }}
          >
            {loadingYears ? (
              <MenuItem disabled>
                <Stack direction="row" spacing={1} alignItems="center">
                  <CircularProgress size={14} />
                  <span>Loading...</span>
                </Stack>
              </MenuItem>
            ) : (
              years.map((year) => (
                <MenuItem
                  key={year._id}
                  selected={String(year._id) === String(selectedAcademicYearId)}
                  onClick={() => onAcademicYearChange(String(year._id))}
                >
                  {year.name}{year.isActive ? ' (Current)' : ''}
                </MenuItem>
              ))
            )}
          </Menu>

          <IconButton
            sx={{
              width: 40,
              height: 40,
              backgroundColor: 'background.paper',
              border: (theme) => `1px solid ${theme.palette.divider}`,
              color: 'text.secondary',
              display: { xs: 'none', sm: 'inline-flex' },
            }}
          >
            <NotificationsOutlined fontSize="small" />
          </IconButton>
        </Stack>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
