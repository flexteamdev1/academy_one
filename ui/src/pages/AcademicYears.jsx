import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Select,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import SearchOutlined from '@mui/icons-material/SearchOutlined';
import FilterListOutlined from '@mui/icons-material/FilterListOutlined';
import AddRounded from '@mui/icons-material/AddRounded';
import EditOutlined from '@mui/icons-material/EditOutlined';
import DeleteOutlineOutlined from '@mui/icons-material/DeleteOutlineOutlined';
import BoltOutlined from '@mui/icons-material/BoltOutlined';
import CalendarMonthOutlined from '@mui/icons-material/CalendarMonthOutlined';
import ArchiveOutlined from '@mui/icons-material/ArchiveOutlined';
import EventAvailableOutlined from '@mui/icons-material/EventAvailableOutlined';
import ChevronLeftRounded from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRounded from '@mui/icons-material/ChevronRightRounded';
import PageCard from '../components/common/PageCard';
import DeleteConfirmDialog from '../components/common/DeleteConfirmDialog';
import AppDialog from '../components/common/AppDialog';
import AppTableHead from '../components/common/AppTableHead';
import {
  activateAcademicYear,
  createAcademicYear,
  deleteAcademicYear,
  getAcademicYearStats,
  listAcademicYears,
  updateAcademicYear,
} from '../services/academicYearService';
import { ACADEMIC_YEAR_STATUS, FILTER_ALL, USER_ROLES } from '../constants/enums';
import { getUserRole } from '../utils/auth';
import { useUIState } from '../context/UIContext';

const LIMIT = 10;

const formatDate = (value) => {
  if (!value) return 'N/A';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'N/A';
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

const toInputDate = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
};

const emptyForm = {
  name: '',
  startDate: '',
  endDate: '',
  status: ACADEMIC_YEAR_STATUS.ACTIVE,
  isActive: false,
};

const AcademicYears = () => {
  const { selectedAcademicYearId } = useUIState();
  const role = getUserRole();
  const canManage = role === USER_ROLES.SUPER_ADMIN || role === USER_ROLES.ADMIN;

  const [items, setItems] = useState([]);
  const [stats, setStats] = useState({ total: 0, active: 0, archived: 0, current: 0 });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [q, setQ] = useState('');
  const [status, setStatus] = useState(FILTER_ALL);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState('create');
  const [editingId, setEditingId] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const [deleteState, setDeleteState] = useState({ open: false, id: '', name: '' });
  const [deleting, setDeleting] = useState(false);

  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  const metrics = useMemo(
    () => [
      {
        key: 'total',
        title: 'Total Years',
        value: stats.total || 0,
        icon: CalendarMonthOutlined,
        color: 'purpleDeep',
        bg: 'pastelLavender',
        border: 'lavenderDark',
      },
      {
        key: 'active',
        title: 'Active',
        value: stats.active || 0,
        icon: EventAvailableOutlined,
        color: 'successDeep',
        bg: 'pastelMint',
        border: 'mintDark',
      },
      {
        key: 'archived',
        title: 'Archived',
        value: stats.archived || 0,
        icon: ArchiveOutlined,
        color: 'infoDeep',
        bg: 'pastelBlue',
        border: 'blueDark',
      },
      {
        key: 'current',
        title: 'Current Window',
        value: stats.current || 0,
        icon: BoltOutlined,
        color: 'warning.main',
        bg: 'amberSoft',
        border: 'stone200',
      },
    ],
    [stats]
  );

  const loadData = async () => {
    setLoading(true);
    setError('');

    try {
      const params = { page, limit: LIMIT };
      if (q.trim()) params.q = q.trim();
      if (status !== FILTER_ALL) params.status = status;

      const [listRes, statsRes] = await Promise.all([listAcademicYears(params), getAcademicYearStats()]);

      setItems(listRes.items || []);
      setTotal(listRes.pagination?.total || 0);
      setStats(statsRes || {});
    } catch (err) {
      setError(err.message || 'Failed to load academic years');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, status, selectedAcademicYearId]);

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    setPage(1);
    loadData();
  };

  const openCreateDialog = () => {
    setDialogMode('create');
    setEditingId('');
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEditDialog = (item) => {
    setDialogMode('edit');
    setEditingId(item._id);
    setForm({
      name: item.name || '',
      startDate: toInputDate(item.startDate),
      endDate: toInputDate(item.endDate),
      status: item.status || ACADEMIC_YEAR_STATUS.ACTIVE,
      isActive: !!item.isActive,
    });
    setDialogOpen(true);
  };

  const handleDialogSubmit = async () => {
    if (!form.name.trim()) {
      setToast({ open: true, severity: 'error', message: 'Academic year name is required' });
      return;
    }

    if (!form.startDate || !form.endDate) {
      setToast({ open: true, severity: 'error', message: 'Start date and end date are required' });
      return;
    }

    if (new Date(form.startDate) >= new Date(form.endDate)) {
      setToast({ open: true, severity: 'error', message: 'Start date must be before end date' });
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        name: form.name.trim(),
        startDate: form.startDate,
        endDate: form.endDate,
        status: form.status,
        isActive: form.isActive,
      };

      if (dialogMode === 'create') {
        await createAcademicYear(payload);
        setToast({ open: true, severity: 'success', message: 'Academic year created successfully' });
        setPage(1);
      } else {
        await updateAcademicYear(editingId, payload);
        setToast({ open: true, severity: 'success', message: 'Academic year updated successfully' });
      }

      setDialogOpen(false);
      await loadData();
    } catch (err) {
      setToast({ open: true, severity: 'error', message: err.message || 'Unable to save academic year' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleActivate = async (id) => {
    try {
      await activateAcademicYear(id);
      setToast({ open: true, severity: 'success', message: 'Academic year activated' });
      await loadData();
    } catch (err) {
      setToast({ open: true, severity: 'error', message: err.message || 'Unable to activate year' });
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteAcademicYear(deleteState.id);
      setDeleteState({ open: false, id: '', name: '' });
      setToast({ open: true, severity: 'success', message: 'Academic year deleted successfully' });

      if (items.length === 1 && page > 1) {
        setPage((prev) => prev - 1);
      } else {
        await loadData();
      }
    } catch (err) {
      setToast({ open: true, severity: 'error', message: err.message || 'Unable to delete academic year' });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Box>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={2}
        alignItems={{ md: 'flex-end' }}
        justifyContent="space-between"
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography variant="h4" sx={{ mb: 0.6 }}>
            Academic Years
          </Typography>
          <Typography variant="subtitle1">
            Configure school-year windows and select which year is currently active.
          </Typography>
        </Box>

        {canManage ? (
          <Button
            startIcon={<AddRounded />}
            onClick={openCreateDialog}
            sx={{
              backgroundColor: (theme) => theme.customColors.pastelBlue,
              border: '1px solid',
              borderColor: (theme) => theme.customColors.blueDark,
              color: (theme) => theme.customColors.infoDeep,
              fontWeight: 700,
              '&:hover': { backgroundColor: (theme) => theme.customColors.blueDark },
            }}
          >
            Add Academic Year
          </Button>
        ) : null}
      </Stack>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Grid item xs={12} sm={6} lg={3} key={metric.key}>
              <PageCard
                sx={{
                  p: 2,
                  border: '1px solid',
                  borderColor: (theme) => theme.customColors[metric.border],
                  backgroundColor: (theme) => theme.customColors[metric.bg],
                  boxShadow: 'none',
                }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.3 }}>
                  <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.11em', textTransform: 'uppercase', color: (theme) => theme.customColors.stone400 }}>
                    {metric.title}
                  </Typography>
                  <Icon sx={{ color: metric.color }} fontSize="small" />
                </Stack>
                <Typography sx={{ fontSize: '1.8rem', fontWeight: 800, color: metric.color }}>
                  {metric.value}
                </Typography>
              </PageCard>
            </Grid>
          );
        })}
      </Grid>

      <PageCard sx={{ p: 2, mb: 2 }}>
        <Stack component="form" onSubmit={handleSearchSubmit} direction={{ xs: 'column', lg: 'row' }} spacing={2} alignItems="center">
          <Box sx={{ flex: 1, width: '100%' }}>
            <TextField
              fullWidth
              size="small"
              value={q}
              onChange={(event) => setQ(event.target.value)}
              placeholder="Search academic year"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchOutlined fontSize="small" sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.2} sx={{ width: { xs: '100%', lg: 'auto' } }}>
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <Select value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }}>
                <MenuItem value={FILTER_ALL}>All Status</MenuItem>
                <MenuItem value={ACADEMIC_YEAR_STATUS.ACTIVE}>Active</MenuItem>
                <MenuItem value={ACADEMIC_YEAR_STATUS.ARCHIVED}>Archived</MenuItem>
              </Select>
            </FormControl>

            <IconButton
              type="submit"
              sx={(theme) => ({
                borderRadius: theme.customRadius.md,
                border: '1px solid',
                borderColor: theme.customColors.stone200,
                backgroundColor: theme.customColors.stone100,
              })}
            >
              <FilterListOutlined />
            </IconButton>
          </Stack>
        </Stack>
      </PageCard>

      {error ? <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> : null}

      <PageCard sx={{ overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <AppTableHead
              columns={[
                { key: 'name', label: 'Name' },
                { key: 'duration', label: 'Duration' },
                { key: 'status', label: 'Status' },
                { key: 'current', label: 'Current' },
                ...(canManage ? [{ key: 'actions', label: 'Actions', align: 'right' }] : []),
              ]}
            />
            <TableBody>
              {items.map((item) => (
                <TableRow key={item._id} sx={{ '& .MuiTableCell-root': { borderBottomColor: (theme) => theme.customColors.stone100 } }}>
                  <TableCell>
                    <Typography sx={{ fontSize: '0.9rem', fontWeight: 700 }}>{item.name}</Typography>
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.85rem', color: 'text.secondary' }}>
                    {formatDate(item.startDate)} - {formatDate(item.endDate)}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={item.status}
                      size="small"
                      sx={{
                        height: 24,
                        borderRadius: '999px',
                        fontWeight: 700,
                        fontSize: '0.63rem',
                        border: '1px solid',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        backgroundColor: item.status === ACADEMIC_YEAR_STATUS.ACTIVE
                          ? (theme) => theme.customColors.pastelMint
                          : (theme) => theme.customColors.stone100,
                        borderColor: item.status === ACADEMIC_YEAR_STATUS.ACTIVE
                          ? (theme) => theme.customColors.mintDark
                          : (theme) => theme.customColors.stone200,
                        color: item.status === ACADEMIC_YEAR_STATUS.ACTIVE
                          ? (theme) => theme.customColors.successDeep
                          : (theme) => theme.customColors.stone400,
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    {item.isActive ? (
                      <Chip
                        label="Current"
                        size="small"
                        sx={{
                          height: 24,
                          borderRadius: '999px',
                          fontWeight: 700,
                          border: '1px solid',
                          backgroundColor: (theme) => theme.customColors.pastelBlue,
                          borderColor: (theme) => theme.customColors.blueDark,
                          color: (theme) => theme.customColors.infoDeep,
                        }}
                      />
                    ) : (
                      <Typography sx={{ fontSize: '0.82rem', color: 'text.secondary' }}>No</Typography>
                    )}
                  </TableCell>

                  {canManage ? (
                    <TableCell align="right">
                      {!item.isActive ? (
                        <IconButton size="small" onClick={() => handleActivate(item._id)} sx={{ color: (theme) => theme.customColors.successDeep }}>
                          <BoltOutlined fontSize="small" />
                        </IconButton>
                      ) : null}
                      <IconButton size="small" onClick={() => openEditDialog(item)} sx={{ color: (theme) => theme.customColors.infoDeep }}>
                        <EditOutlined fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={() => setDeleteState({ open: true, id: item._id, name: item.name })} sx={{ color: (theme) => theme.customColors.dangerText }}>
                        <DeleteOutlineOutlined fontSize="small" />
                      </IconButton>
                    </TableCell>
                  ) : null}
                </TableRow>
              ))}

              {!loading && items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={canManage ? 5 : 4}>
                    <Typography sx={{ py: 3, textAlign: 'center', color: 'text.secondary' }}>
                      No academic years found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </TableContainer>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.4} justifyContent="space-between" alignItems={{ sm: 'center' }} sx={{ px: 2, py: 1.5, borderTop: '1px solid', borderColor: (theme) => theme.customColors.stone100, backgroundColor: (theme) => theme.customColors.stone50 }}>
          <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: (theme) => theme.customColors.stone400 }}>
            Showing {items.length ? (page - 1) * LIMIT + 1 : 0} to {(page - 1) * LIMIT + items.length} of {total} years
          </Typography>

          <Stack direction="row" spacing={0.8} alignItems="center">
            <IconButton size="small" disabled={page <= 1} onClick={() => setPage((prev) => prev - 1)} sx={{ border: '1px solid', borderColor: (theme) => theme.customColors.stone200 }}>
              <ChevronLeftRounded fontSize="small" />
            </IconButton>
            <Button size="small" sx={{ minWidth: 56, px: 1, py: 0.5, border: '1px solid', borderColor: 'primary.main', color: 'primary.main', backgroundColor: (theme) => theme.customColors.pastelLavender, fontWeight: 700 }}>
              {page}/{totalPages}
            </Button>
            <IconButton size="small" disabled={page >= totalPages} onClick={() => setPage((prev) => prev + 1)} sx={{ border: '1px solid', borderColor: (theme) => theme.customColors.stone200 }}>
              <ChevronRightRounded fontSize="small" />
            </IconButton>
          </Stack>
        </Stack>
      </PageCard>

      <AppDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        title={dialogMode === 'create' ? 'Create Academic Year' : 'Update Academic Year'}
        primaryAction={{
          label: submitting ? 'Saving...' : dialogMode === 'create' ? 'Create Year' : 'Save Changes',
          onClick: handleDialogSubmit,
          disabled: submitting,
        }}
        secondaryAction={{ label: 'Cancel', onClick: () => setDialogOpen(false) }}
      >
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Name" value={form.name} onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))} placeholder="2025-26" />

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
              <TextField
                label="Start Date"
                type="date"
                value={form.startDate}
                onChange={(event) => setForm((prev) => ({ ...prev, startDate: event.target.value }))}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
              <TextField
                label="End Date"
                type="date"
                value={form.endDate}
                onChange={(event) => setForm((prev) => ({ ...prev, endDate: event.target.value }))}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
              <FormControl fullWidth>
                <Select value={form.status} onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value }))}>
                  <MenuItem value={ACADEMIC_YEAR_STATUS.ACTIVE}>Active</MenuItem>
                  <MenuItem value={ACADEMIC_YEAR_STATUS.ARCHIVED}>Archived</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <Select value={form.isActive ? 'YES' : 'NO'} onChange={(event) => setForm((prev) => ({ ...prev, isActive: event.target.value === 'YES' }))}>
                  <MenuItem value="NO">Not Current</MenuItem>
                  <MenuItem value="YES">Set as Current</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </Stack>
      </AppDialog>

      <DeleteConfirmDialog
        open={deleteState.open}
        onClose={() => setDeleteState({ open: false, id: '', name: '' })}
        onConfirm={handleDelete}
        confirming={deleting}
        title="Delete Academic Year?"
        itemName={deleteState.name}
        description="This removes the year permanently. You cannot delete years that are linked to classes."
      />

      <Snackbar open={toast.open} autoHideDuration={2800} onClose={() => setToast((prev) => ({ ...prev, open: false }))} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <Alert onClose={() => setToast((prev) => ({ ...prev, open: false }))} severity={toast.severity} sx={{ width: '100%' }}>
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AcademicYears;
