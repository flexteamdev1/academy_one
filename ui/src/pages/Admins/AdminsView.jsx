import React from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  IconButton,
  InputAdornment,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import PersonAddAlt1Outlined from '@mui/icons-material/PersonAddAlt1Outlined';
import SearchOutlined from '@mui/icons-material/SearchOutlined';
import FilterListOutlined from '@mui/icons-material/FilterListOutlined';
import DeleteOutlineOutlined from '@mui/icons-material/DeleteOutlineOutlined';
import EditOutlined from '@mui/icons-material/EditOutlined';
import ChevronLeftRounded from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRounded from '@mui/icons-material/ChevronRightRounded';
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff';
import PageCard from '../../components/common/PageCard';
import AppTableHead from '../../components/common/AppTableHead';
import AdminsSkeleton from '../../components/skeletons/AdminsSkeleton';

const statusChipSx = (status, theme) => {
  if (status === 'ACTIVE') {
    return {
      backgroundColor: theme.palette.success.light,
      color: theme.palette.success.main,
      borderColor: theme.palette.success.main,
    };
  }
  if (status === 'SUSPENDED') {
    return {
      backgroundColor: theme.palette.warning.light,
      color: theme.palette.warning.main,
      borderColor: theme.palette.warning.main,
    };
  }
  return {
    backgroundColor: theme.palette.grey[100],
    color: theme.palette.grey[600],
    borderColor: theme.palette.grey[300],
  };
};

const AdminsView = ({
  canManage,
  openCreateDialog,
  q,
  setQ,
  handleSearchSubmit,
  status,
  setStatus,
  FILTER_ALL,
  USER_STATUS,
  error,
  admins,
  openEditDialog,
  setDeleteState,
  page,
  setPage,
  totalPages,
  total,
  loading,
  onResetFilters,
}) => {
  if (loading) {
    return <AdminsSkeleton />;
  }

  return (
    <>
    <Stack
      direction={{ xs: 'column', md: 'row' }}
      spacing={2}
      alignItems={{ md: 'flex-end' }}
      justifyContent="space-between"
      sx={{ mb: 3 }}
    >
      <Box>
        <Typography variant="h4" sx={{ mb: 0.6 }}>
          Admins
        </Typography>
        <Typography variant="subtitle1">
          Manage administrator accounts and access status.
        </Typography>
      </Box>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.2}>
        <Button
          startIcon={<PersonAddAlt1Outlined />}
          onClick={openCreateDialog}
          disabled={!canManage}
          sx={{
            backgroundColor: (theme) => theme.palette.info.light,
            border: '1px solid',
            borderColor: (theme) => theme.palette.info.main,
            color: (theme) => theme.palette.info.dark,
            fontWeight: 700,
            '&:hover': { backgroundColor: (theme) => theme.palette.info.main },
          }}
        >
          {canManage ? 'Add Admin' : 'Read Only'}
        </Button>
      </Stack>
    </Stack>

    <PageCard sx={{ p: 2, mb: 3 }}>
      <Stack component="form" onSubmit={handleSearchSubmit} direction={{ xs: 'column', lg: 'row' }} spacing={2} alignItems="center">
        <Box sx={{ flex: 1, width: '100%' }}>
          <TextField
            fullWidth
            placeholder="Search by name, email, phone..."
            size="small"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchOutlined fontSize="small" sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
            }}
            sx={{ '& .MuiOutlinedInput-root': { backgroundColor: (theme) => theme.palette.grey[50] } }}
          />
        </Box>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.2} sx={{ width: { xs: '100%', lg: 'auto' } }}>
          <Select
            size="small"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            sx={{ minWidth: 150, backgroundColor: (theme) => theme.palette.grey[50] }}
          >
            <MenuItem value={FILTER_ALL}>All Status</MenuItem>
            <MenuItem value={USER_STATUS.ACTIVE}>Active</MenuItem>
            <MenuItem value={USER_STATUS.BLOCKED}>Blocked</MenuItem>
            <MenuItem value={USER_STATUS.SUSPENDED}>Suspended</MenuItem>
          </Select>

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
      </Stack>
    </PageCard>

    {error ? <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> : null}

    <PageCard sx={{ overflow: 'hidden', mb: 3 }}>
      <TableContainer>
        <Table>
          <AppTableHead
            columns={[
              { key: 'admin', label: 'Admin' },
              { key: 'email', label: 'Email' },
              { key: 'phone', label: 'Phone' },
              { key: 'status', label: 'Status' },
              { key: 'actions', label: 'Actions', align: 'right' },
            ]}
          />

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} sx={{ py: 3, textAlign: 'center', color: 'text.secondary' }}>
                  Loading admins...
                </TableCell>
              </TableRow>
            ) : null}
            {!loading && admins.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} sx={{ py: 3, textAlign: 'center', color: 'text.secondary' }}>
                  No admins found.
                </TableCell>
              </TableRow>
            ) : null}
            {!loading && admins.map((admin) => (
              <TableRow key={admin._id}>
                <TableCell>
                  <Typography sx={{ fontWeight: 700 }}>{admin.name}</Typography>
                </TableCell>
                <TableCell sx={{ color: 'text.secondary' }}>{admin.email || 'N/A'}</TableCell>
                <TableCell sx={{ color: 'text.secondary' }}>{admin.phone || 'N/A'}</TableCell>
                <TableCell>
                  <Chip
                    label={admin.status}
                    variant="outlined"
                    sx={(theme) => ({
                      fontWeight: 600,
                      borderRadius: 999,
                      ...statusChipSx(admin.status, theme),
                    })}
                  />
                </TableCell>
                <TableCell align="right">
                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <Button size="small" startIcon={<EditOutlined />} onClick={() => openEditDialog(admin)} disabled={!canManage}>
                      Edit
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      startIcon={<DeleteOutlineOutlined />}
                      onClick={() => setDeleteState({ open: true, id: admin._id, name: admin.name })}
                      disabled={!canManage}
                    >
                      Delete
                    </Button>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 2, py: 1.5 }}>
        <Typography sx={{ color: 'text.secondary', fontSize: '0.78rem' }}>
          Showing {admins.length} of {total} admins
        </Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          <IconButton size="small" disabled={page <= 1} onClick={() => setPage((prev) => Math.max(1, prev - 1))} sx={{ border: '1px solid', borderColor: (theme) => theme.palette.grey[200] }}>
            <ChevronLeftRounded fontSize="small" />
          </IconButton>
          <Button size="small" sx={{ minWidth: 56, px: 1, py: 0.5, border: '1px solid', borderColor: 'primary.main', color: 'primary.main', backgroundColor: (theme) => theme.palette.secondary.light, fontWeight: 700 }}>
            {page}/{totalPages}
          </Button>
          <IconButton size="small" disabled={page >= totalPages} onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))} sx={{ border: '1px solid', borderColor: (theme) => theme.palette.grey[200] }}>
            <ChevronRightRounded fontSize="small" />
          </IconButton>
        </Stack>
      </Stack>
    </PageCard>
    </>
  );
};

export default React.memo(AdminsView);
