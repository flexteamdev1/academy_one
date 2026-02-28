import React from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import SearchOutlined from '@mui/icons-material/SearchOutlined';
import FilterListOutlined from '@mui/icons-material/FilterListOutlined';
import FileDownloadOutlined from '@mui/icons-material/FileDownloadOutlined';
import PersonAddAlt1Outlined from '@mui/icons-material/PersonAddAlt1Outlined';
import MailOutlineOutlined from '@mui/icons-material/MailOutlineOutlined';
import CallOutlined from '@mui/icons-material/CallOutlined';
import CalendarMonthOutlined from '@mui/icons-material/CalendarMonthOutlined';
import EditOutlined from '@mui/icons-material/EditOutlined';
import DeleteOutlineOutlined from '@mui/icons-material/DeleteOutlineOutlined';
import VisibilityOutlined from '@mui/icons-material/VisibilityOutlined';
import ChevronLeftRounded from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRounded from '@mui/icons-material/ChevronRightRounded';
import HowToRegOutlined from '@mui/icons-material/HowToRegOutlined';
import MenuBookOutlined from '@mui/icons-material/MenuBookOutlined';
import VerifiedOutlined from '@mui/icons-material/VerifiedOutlined';
import HistoryOutlined from '@mui/icons-material/HistoryOutlined';
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff';
import PageCard from '../../components/common/PageCard';
import TeachersSkeleton from '../../components/skeletons/TeachersSkeleton';
import StatCard from '../../components/common/StatCard';

const TeachersView = ({
  stats,
  searchQuery,
  setSearchQuery,
  status,
  setStatus,
  handleSearchSubmit,
  openCreateDialog,
  error,
  loading,
  teachers,
  openEditDialog,
  openViewDialog,
  setConfirmDelete,
  formatJoined,
  colorTrack,
  page,
  setPage,
  total,
  totalPages,
  FILTER_ALL,
  TEACHER_STATUS,
  onResetFilters,
}) => (
  loading ? (
    <TeachersSkeleton />
  ) : (
  <>
    <Stack
      direction={{ xs: 'column', md: 'row' }}
      spacing={2}
      alignItems={{ md: 'end' }}
      justifyContent="space-between"
      sx={{ mb: 3 }}
    >
      <Box>
        <Typography variant="h4" sx={{ mb: 0.6 }}>
          Faculty Directory
        </Typography>
        <Typography variant="subtitle1">
          Manage faculty records, subject assignments, and contact details.
        </Typography>
      </Box>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.2}>
        <Button variant="outlined" startIcon={<FileDownloadOutlined />}>
          Export List
        </Button>
        <Button variant="contained" startIcon={<PersonAddAlt1Outlined />} onClick={openCreateDialog}>
          Add Teacher
        </Button>
      </Stack>
    </Stack>

    <Grid direction={{ xs: 'column', md: 'row' }} container spacing={2} sx={{ mb: 3 }}>
      {[
        { label: 'Active Staff', value: stats.active, icon: HowToRegOutlined, tone: 'success.main' },
        { label: 'Departments', value: stats.departments, icon: MenuBookOutlined, tone: 'info.main' },
        { label: 'Certified', value: `${stats.certified}%`, icon: VerifiedOutlined, tone: 'secondary.main' },
        { label: 'On Leave', value: stats.onLeave, icon: HistoryOutlined, tone: 'warning.main' },
      ].map((stat, index) => (
          <StatCard
            label={stat.label}
            value={stat.value}
            icon={stat.icon}
            iconColor={stat.tone}
            sx={{
              flex: 1,
              boxShadow: '0px 8px 18px rgba(31, 42, 55, 0.06)',
              animation: 'fadeUp 450ms ease both',
              animationDelay: `${index * 70}ms`,
            }}
          />
      ))}
    </Grid>

    <PageCard sx={{ p: 2, mb: 3 }}>
      <Stack component="form" onSubmit={handleSearchSubmit} direction={{ xs: 'column', md: 'row' }} spacing={1.2}>
        <TextField
          fullWidth
          placeholder="Search teachers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchOutlined fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
        <TextField
          select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
          }}
          sx={{ minWidth: 180 }}
        >
          <MenuItem value={FILTER_ALL}>All Statuses</MenuItem>
          <MenuItem value={TEACHER_STATUS.ACTIVE}>Active</MenuItem>
          <MenuItem value={TEACHER_STATUS.INACTIVE}>On Leave</MenuItem>
          <MenuItem value={TEACHER_STATUS.BLOCKED}>Blocked</MenuItem>
        </TextField>
        <Button type="submit" variant="outlined" startIcon={<FilterListOutlined />}>
          Apply
        </Button>
        <Button
          type="submit"
          variant="outlined"
          startIcon={<FilterAltOffIcon />}
          onClick={onResetFilters}
        >
          Reset
        </Button>
      </Stack>
    </PageCard>

    {error ? <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> : null}
        <Grid container spacing={2.2}>
          {teachers.map((teacher, index) => {
            const fullName = `${teacher.firstName || ''} ${teacher.lastName || ''}`.trim();

            return (
              <Grid item xs={12} key={teacher._id}>
                <PageCard
                  sx={{
                    overflow: 'hidden',
                    borderRadius: (theme) => theme.shape.borderRadius,
                    transition: 'transform 200ms ease, box-shadow 200ms ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0px 14px 30px rgba(31, 42, 55, 0.10)',
                    },
                    animation: 'fadeUp 520ms ease both',
                    animationDelay: `${index * 60}ms`,
                  }}
                >
                  <Box sx={{ height: 8, bgcolor: 'divider' }} />
                  <Box sx={{ p: 2.2 }}>
                    <Stack direction="row" justifyContent="space-between" sx={{ mb: 1.8 }}>
                      <Box
                        sx={{
                          width: 64,
                          height: 64,
                          borderRadius: '50%',
                          border: '2px solid',
                          borderColor: 'divider',
                          backgroundColor: (theme) => theme.palette.grey[50],
                          display: 'grid',
                          placeItems: 'center',
                          fontWeight: 700,
                          color: 'text.secondary',
                        }}
                      >
                        {(teacher.firstName?.[0] || '') + (teacher.lastName?.[0] || '')}
                      </Box>

                    <Stack direction="row" spacing={0.2}>
                      <IconButton size="small" onClick={() => openViewDialog(teacher)}>
                        <VisibilityOutlined fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={() => openEditDialog(teacher)}>
                        <EditOutlined fontSize="small" />
                      </IconButton>
                        <IconButton
                          size="small"
                          onClick={() =>
                            setConfirmDelete({ open: true, id: teacher._id, name: fullName || 'this teacher' })
                          }
                        >
                          <DeleteOutlineOutlined fontSize="small" />
                        </IconButton>
                      </Stack>
                    </Stack>

                    <Typography sx={{ fontSize: '1.02rem', fontWeight: 700 }}>{fullName || 'Unnamed Teacher'}</Typography>
                    <Typography sx={{ fontSize: '0.7rem', fontWeight: 800, color: 'primary.main', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      {teacher.qualification || 'Faculty'}
                    </Typography>

                    <Stack spacing={1.1} sx={{ mt: 2.2 }}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <MailOutlineOutlined fontSize="small" color="action" />
                        <Typography sx={{ fontSize: '0.84rem', color: 'text.secondary' }} noWrap>
                          {teacher.email || 'N/A'}
                        </Typography>
                      </Stack>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <CallOutlined fontSize="small" color="action" />
                        <Typography sx={{ fontSize: '0.84rem', color: 'text.secondary' }}>
                          {teacher.phone || 'N/A'}
                        </Typography>
                      </Stack>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <CalendarMonthOutlined fontSize="small" color="action" />
                        <Typography sx={{ fontSize: '0.84rem', color: 'text.secondary' }}>
                          {formatJoined(teacher.joinedAt)}
                        </Typography>
                      </Stack>
                    </Stack>

                    <Stack direction="row" spacing={0.8} sx={{ mt: 2.2, flexWrap: 'wrap', rowGap: 0.8 }}>
                      {(teacher.subjects || []).slice(0, 2).map((subject) => (
                        <Chip
                          key={subject}
                          label={subject}
                          size="small"
                          sx={{
                            borderRadius: (theme) => theme.shape.borderRadius,
                            backgroundColor: 'action.selected',
                            fontSize: '0.64rem',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                          }}
                        />
                      ))}
                    </Stack>
                  </Box>
                </PageCard>
              </Grid>
            );
          })}
        </Grid>

        <PageCard sx={{ mt: 3, p: 1.5 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography sx={{ color: 'text.secondary', fontSize: '0.9rem' }}>
              Showing <b>{teachers.length}</b> of <b>{total}</b> teachers
            </Typography>

            <Stack direction="row" spacing={0.8} alignItems="center">
              <IconButton size="small" disabled={page <= 1} onClick={() => setPage((prev) => Math.max(1, prev - 1))}>
                <ChevronLeftRounded />
              </IconButton>
              <Button size="small" variant="contained" sx={{ minWidth: 32, px: 1 }}>{page}</Button>
              <Typography sx={{ fontSize: '0.82rem', color: 'text.secondary' }}>/ {totalPages}</Typography>
              <IconButton size="small" disabled={page >= totalPages} onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}>
                <ChevronRightRounded />
              </IconButton>
            </Stack>
          </Stack>
        </PageCard>
  </>
  )
);

export default React.memo(TeachersView);
