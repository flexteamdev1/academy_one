import React from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  FormControl,
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
import SearchOutlined from '@mui/icons-material/SearchOutlined';
import FilterListOutlined from '@mui/icons-material/FilterListOutlined';
import ChevronLeftRounded from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRounded from '@mui/icons-material/ChevronRightRounded';
import VisibilityOutlined from '@mui/icons-material/VisibilityOutlined';
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff';
import PageCard from '../../components/common/PageCard';
import AppTableHead from '../../components/common/AppTableHead';

const statusChipSx = (status, theme) => {
  if (status === 'ACTIVE') {
    return {
      backgroundColor: theme.palette.success.light,
      color: theme.palette.success.main,
      borderColor: theme.palette.success.main,
    };
  }
  if (status === 'BLOCKED') {
    return {
      backgroundColor: theme.palette.error.light,
      color: theme.palette.error.main,
      borderColor: theme.palette.error.main,
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
    color: theme.palette.grey[500],
    borderColor: theme.palette.grey[200],
  };
};

const ParentsView = ({
  q,
  setQ,
  status,
  setStatus,
  handleSearchSubmit,
  error,
  parents,
  openDetails,
  page,
  setPage,
  totalPages,
  total,
  loading,
  FILTER_ALL,
  USER_STATUS,
  onResetFilters,
}) => (
  <Box>
    <Stack
      direction={{ xs: 'column', md: 'row' }}
      spacing={2}
      alignItems={{ md: 'end' }}
      justifyContent="space-between"
      sx={{ mb: 3 }}
    >
      <Box>
        <Typography variant="h4" sx={{ mb: 0.6 }}>
          Parents Directory
        </Typography>
        <Typography variant="subtitle1">
          View parent profiles, contact details, and linked students.
        </Typography>
      </Box>
    </Stack>

    <PageCard sx={{ p: 2, mb: 3 }}>
      <Stack component="form" onSubmit={handleSearchSubmit} direction={{ xs: 'column', md: 'row' }} spacing={1.2}>
        <TextField
          fullWidth
          placeholder="Search by name, email, phone..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchOutlined fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
        <FormControl sx={{ minWidth: 180 }}>
          <Select value={status} onChange={(e) => setStatus(e.target.value)}>
            <MenuItem value={FILTER_ALL}>All Statuses</MenuItem>
            <MenuItem value={USER_STATUS.ACTIVE}>Active</MenuItem>
            <MenuItem value={USER_STATUS.BLOCKED}>Blocked</MenuItem>
            <MenuItem value={USER_STATUS.SUSPENDED}>Suspended</MenuItem>
          </Select>
        </FormControl>
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

    <PageCard sx={{ overflow: 'hidden', mb: 3 }}>
      <TableContainer>
        <Table>
          <AppTableHead
            columns={[
              { key: 'parent', label: 'Parent' },
              { key: 'email', label: 'Email' },
              { key: 'phone', label: 'Phone' },
              { key: 'children', label: 'Children' },
              { key: 'status', label: 'Status' },
              { key: 'emergency', label: 'Emergency Contact' },
              { key: 'actions', label: 'Actions', align: 'right' },
            ]}
          />
          <TableBody>
            {parents.map((parent) => (
              <TableRow
                key={parent._id}
                sx={{
                  '& .MuiTableCell-root': { borderBottomColor: (theme) => theme.palette.grey[100] },
                  '&:hover': { backgroundColor: (theme) => theme.palette.grey[50] },
                }}
              >
                <TableCell>
                  <Typography sx={{ fontWeight: 700 }}>
                    {parent.fullName || `${parent.firstName || ''} ${parent.lastName || ''}`.trim() || 'N/A'}
                  </Typography>
                </TableCell>
                <TableCell sx={{ color: 'text.secondary' }}>{parent.email || 'N/A'}</TableCell>
                <TableCell sx={{ color: 'text.secondary' }}>{parent.phone || 'N/A'}</TableCell>
                <TableCell sx={{ color: 'text.secondary' }}>{parent.childrenCount ?? 0}</TableCell>
                <TableCell>
                  <Chip
                    label={parent.status || 'UNKNOWN'}
                    size="small"
                    variant="outlined"
                    sx={(theme) => ({
                      borderWidth: 1,
                      fontWeight: 700,
                      fontSize: '0.7rem',
                      ...statusChipSx(parent.status, theme),
                    })}
                  />
                </TableCell>
                <TableCell sx={{ color: 'text.secondary' }}>
                  {parent.emergencyContact || 'N/A'}
                </TableCell>
                <TableCell align="right">
                  <IconButton size="small" onClick={() => openDetails(parent)}>
                    <VisibilityOutlined fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {!loading && parents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} sx={{ textAlign: 'center', color: 'text.secondary', py: 4 }}>
                  No parents found.
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </TableContainer>
    </PageCard>

    <PageCard sx={{ mt: 3, p: 1.5 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography sx={{ color: 'text.secondary', fontSize: '0.9rem' }}>
          Showing <b>{parents.length}</b> of <b>{total}</b> parents
        </Typography>

        <Stack direction="row" spacing={0.8} alignItems="center">
          <IconButton size="small" disabled={page <= 1} onClick={() => setPage((prev) => Math.max(1, prev - 1))}>
            <ChevronLeftRounded />
          </IconButton>
          <Button size="small" variant="contained" sx={{ minWidth: 32, px: 1 }}>
            {page}
          </Button>
          <Typography sx={{ fontSize: '0.82rem', color: 'text.secondary' }}>/ {totalPages}</Typography>
          <IconButton size="small" disabled={page >= totalPages} onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}>
            <ChevronRightRounded />
          </IconButton>
        </Stack>
      </Stack>
    </PageCard>
  </Box>
);

export default ParentsView;
