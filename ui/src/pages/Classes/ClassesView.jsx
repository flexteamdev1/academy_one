import React from 'react';
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
import DeleteOutlineOutlined from '@mui/icons-material/DeleteOutlineOutlined';
import EditOutlined from '@mui/icons-material/EditOutlined';
import ChevronLeftRounded from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRounded from '@mui/icons-material/ChevronRightRounded';
import PageCard from '../../components/common/PageCard';
import AppTableHead from '../../components/common/AppTableHead';
import ClassesSkeleton from '../../components/skeletons/ClassesSkeleton';
import StatCard from '../../components/common/StatCard';

const ClassesView = ({
  canManage,
  openCreateDialog,
  metricCards,
  q,
  setQ,
  handleSearchSubmit,
  academicYearId,
  setAcademicYearId,
  status,
  setStatus,
  meta,
  FILTER_ALL,
  CLASS_STATUS,
  error,
  items,
  formatTeacherName,
  openEditDialog,
  setDeleteState,
  page,
  setPage,
  totalPages,
  total,
  LIMIT,
  loading,
}) => (
  loading ? (
    <ClassesSkeleton />
  ) : (
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
          Class Management
        </Typography>
        <Typography variant="subtitle1">
          Organize classes, sections, and homeroom assignments by academic year.
        </Typography>
      </Box>

      {canManage ? (
        <Button
          startIcon={<AddRounded />}
          onClick={openCreateDialog}
          sx={{
            backgroundColor: (theme) => theme.palette.info.light,
            border: '1px solid',
            borderColor: (theme) => theme.palette.info.main,
            color: (theme) => theme.palette.info.dark,
            fontWeight: 700,
            '&:hover': { backgroundColor: (theme) => theme.palette.info.main },
          }}
        >
          Create Class
        </Button>
      ) : null}
    </Stack>

    <Grid direction={{ xs: 'column', md: 'row' }} container spacing={2} sx={{ mb: 3 }}>
      {metricCards.map((metric) => {
        const Icon = metric.icon;
        return (
            <StatCard
              label={metric.label}
              value={metric.value}
              icon={Icon}
              iconColor={metric.color}
              sx={{ boxShadow: 'none', flex: 1 }}
            />
        );
      })}
    </Grid>

    <PageCard sx={{ p: 2, mb: 2 }}>
      <Stack
        component="form"
        onSubmit={handleSearchSubmit}
        direction={{ xs: 'column', lg: 'row' }}
        spacing={2}
        alignItems="center"
      >
        <Box sx={{ flex: 1, width: '100%' }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search by class or section"
            value={q}
            onChange={(event) => setQ(event.target.value)}
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
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <Select
              value={academicYearId}
              onChange={(event) => {
                setAcademicYearId(event.target.value);
                setPage(1);
              }}
            >
              <MenuItem value={FILTER_ALL}>All Academic Years</MenuItem>
              {meta.academicYears.map((year) => (
                <MenuItem key={year._id} value={year._id}>
                  {year.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 130 }}>
            <Select
              value={status}
              onChange={(event) => {
                setStatus(event.target.value);
                setPage(1);
              }}
            >
              <MenuItem value={FILTER_ALL}>All Status</MenuItem>
              <MenuItem value={CLASS_STATUS.ACTIVE}>Active</MenuItem>
              <MenuItem value={CLASS_STATUS.INACTIVE}>Inactive</MenuItem>
            </Select>
          </FormControl>

          <IconButton
            type="submit"
            sx={(theme) => ({
              borderRadius: theme.shape.borderRadius,
              border: '1px solid',
              borderColor: theme.palette.grey[200],
              backgroundColor: theme.palette.grey[100],
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
              { key: 'class', label: 'Class' },
              { key: 'academicYear', label: 'Academic Year' },
              { key: 'sections', label: 'Sections' },
              { key: 'capacity', label: 'Capacity' },
              { key: 'students', label: 'Students' },
              { key: 'status', label: 'Status' },
              ...(canManage ? [{ key: 'actions', label: 'Actions', align: 'right' }] : []),
            ]}
          />

          <TableBody>
            {items.map((item) => (
              <TableRow
                key={item._id}
                sx={{
                  '& .MuiTableCell-root': { borderBottomColor: (theme) => theme.palette.grey[100] },
                  '&:hover': { backgroundColor: (theme) => theme.palette.grey[50] },
                }}
              >
                <TableCell>
                  <Typography sx={{ fontSize: '0.9rem', fontWeight: 700 }}>{item.name}</Typography>
                </TableCell>

                <TableCell>
                  <Stack spacing={0.5}>
                    <Typography sx={{ fontSize: '0.84rem', fontWeight: 600 }}>
                      {item.academicYearId?.name || 'N/A'}
                    </Typography>
                    {item.academicYearId?.isActive ? (
                      <Chip
                        label="Current"
                        size="small"
                        sx={{
                          alignSelf: 'flex-start',
                          height: 20,
                          fontWeight: 700,
                          backgroundColor: (theme) => theme.palette.success.light,
                          color: (theme) => theme.palette.success.dark,
                          border: '1px solid',
                          borderColor: (theme) => theme.palette.success.main,
                        }}
                      />
                    ) : null}
                  </Stack>
                </TableCell>

                <TableCell>
                  <Stack direction="row" spacing={0.7} flexWrap="wrap" useFlexGap>
                    {(item.sections || []).map((section, index) => (
                      <Chip
                        key={`${item._id}-${section.name}-${index}`}
                        label={`${section.name} · ${formatTeacherName(section.classTeacherId)}`}
                        size="small"
                        sx={{
                          height: 24,
                          borderRadius: '999px',
                          backgroundColor: (theme) => theme.palette.info.light,
                          border: '1px solid',
                          borderColor: (theme) => theme.palette.info.main,
                          color: (theme) => theme.palette.info.dark,
                          fontWeight: 600,
                        }}
                      />
                    ))}
                  </Stack>
                </TableCell>

                <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>{item.totalCapacity || 0}</TableCell>
                <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>{item.studentCount || 0}</TableCell>

                <TableCell>
                  <Chip
                    label={item.status}
                    size="small"
                    sx={{
                      height: 24,
                      borderRadius: '999px',
                      fontWeight: 700,
                      fontSize: '0.64rem',
                      border: '1px solid',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      backgroundColor:
                        item.status === CLASS_STATUS.ACTIVE
                          ? (theme) => theme.palette.success.light
                          : (theme) => theme.palette.grey[100],
                      borderColor:
                        item.status === CLASS_STATUS.ACTIVE
                          ? (theme) => theme.palette.success.main
                          : (theme) => theme.palette.grey[200],
                      color:
                        item.status === CLASS_STATUS.ACTIVE
                          ? (theme) => theme.palette.success.dark
                          : (theme) => theme.palette.grey[500],
                    }}
                  />
                </TableCell>

                {canManage ? (
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => openEditDialog(item)}
                      sx={{ mr: 0.5, color: (theme) => theme.palette.info.dark }}
                    >
                      <EditOutlined fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => setDeleteState({ open: true, id: item._id, name: item.name })}
                      sx={{ color: (theme) => theme.palette.error.main }}
                    >
                      <DeleteOutlineOutlined fontSize="small" />
                    </IconButton>
                  </TableCell>
                ) : null}
              </TableRow>
            ))}

            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={canManage ? 7 : 6}>
                  <Typography sx={{ py: 3, textAlign: 'center', color: 'text.secondary' }}>
                    No classes found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </TableContainer>

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1.4}
        justifyContent="space-between"
        alignItems={{ sm: 'center' }}
        sx={{
          px: 2,
          py: 1.5,
          borderTop: '1px solid',
          borderColor: (theme) => theme.palette.grey[100],
          backgroundColor: (theme) => theme.palette.grey[50],
        }}
      >
        <Typography
          sx={{
            fontSize: '0.68rem',
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: (theme) => theme.palette.grey[500],
          }}
        >
          Showing {items.length ? (page - 1) * LIMIT + 1 : 0} to {(page - 1) * LIMIT + items.length} of {total} classes
        </Typography>

        <Stack direction="row" spacing={0.8} alignItems="center">
          <IconButton
            size="small"
            disabled={page <= 1}
            onClick={() => setPage((prev) => prev - 1)}
            sx={{ border: '1px solid', borderColor: (theme) => theme.palette.grey[200] }}
          >
            <ChevronLeftRounded fontSize="small" />
          </IconButton>
          <Button
            size="small"
            sx={{
              minWidth: 56,
              px: 1,
              py: 0.5,
              border: '1px solid',
              borderColor: 'primary.main',
              color: 'primary.main',
              backgroundColor: (theme) => theme.palette.secondary.light,
              fontWeight: 700,
            }}
          >
            {page}/{totalPages}
          </Button>
          <IconButton
            size="small"
            disabled={page >= totalPages}
            onClick={() => setPage((prev) => prev + 1)}
            sx={{ border: '1px solid', borderColor: (theme) => theme.palette.grey[200] }}
          >
            <ChevronRightRounded fontSize="small" />
          </IconButton>
        </Stack>
      </Stack>
    </PageCard>
  </>
  )
);

export default React.memo(ClassesView);
