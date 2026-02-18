import React from 'react';
import {
  Alert,
  Avatar,
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
import DownloadOutlined from '@mui/icons-material/DownloadOutlined';
import PersonAddAlt1Outlined from '@mui/icons-material/PersonAddAlt1Outlined';
import SearchOutlined from '@mui/icons-material/SearchOutlined';
import FilterListOutlined from '@mui/icons-material/FilterListOutlined';
import DeleteOutlineOutlined from '@mui/icons-material/DeleteOutlineOutlined';
import EditOutlined from '@mui/icons-material/EditOutlined';
import VisibilityOutlined from '@mui/icons-material/VisibilityOutlined';
import ChevronLeftRounded from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRounded from '@mui/icons-material/ChevronRightRounded';
import PageCard from '../../components/common/PageCard';
import AppTableHead from '../../components/common/AppTableHead';

const StudentsView = ({
  canManage,
  openCreateDialog,
  dispatchInfo,
  q,
  setQ,
  handleSearchSubmit,
  grade,
  setGrade,
  section,
  setSection,
  status,
  setStatus,
  gradeOptions,
  sectionOptions,
  FILTER_ALL,
  STUDENT_STATUS,
  error,
  students,
  openEditDialog,
  openViewDialog,
  setDeleteState,
  page,
  setPage,
  totalPages,
  total,
  loading,
  metricSpec,
  stats,
  statusChipSx,
}) => (
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
          Active Students
        </Typography>
        <Typography variant="subtitle1">
          Manage student records, guardians, credentials, and enrollment status.
        </Typography>
      </Box>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.2}>
        {/* <Button
          startIcon={<DownloadOutlined />}
          sx={{
            backgroundColor: (theme) => theme.palette.success.light,
            border: '1px solid',
            borderColor: (theme) => theme.palette.success.main,
            color: (theme) => theme.palette.success.dark,
            fontWeight: 700,
            '&:hover': { backgroundColor: (theme) => theme.palette.success.main },
          }}
        >
          Export List
        </Button> */}
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
          {canManage ? 'Add Student' : 'Read Only'}
        </Button>
      </Stack>
    </Stack>

    {dispatchInfo ? (
      <Alert severity="info" sx={{ mb: 2 }}>
        Admission No: <b>{dispatchInfo.admissionNo}</b> | Student Login: <b>{dispatchInfo.studentLoginId}</b> | Parent Login: <b>{dispatchInfo.parentLoginId}</b>
      </Alert>
    ) : null}

    <PageCard sx={{ p: 2, mb: 3 }}>
      <Stack component="form" onSubmit={handleSearchSubmit} direction={{ xs: 'column', lg: 'row' }} spacing={2} alignItems="center">
        <Box sx={{ flex: 1, width: '100%' }}>
          <TextField
            fullWidth
            placeholder="Search by name, admission no, email..."
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
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <Select value={grade} onChange={(e) => { setGrade(e.target.value); setPage(1); }} sx={{ backgroundColor: (theme) => theme.palette.grey[50] }}>
              <MenuItem value={FILTER_ALL}>All Grades</MenuItem>
              {gradeOptions.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <Select value={section} onChange={(e) => { setSection(e.target.value); setPage(1); }} sx={{ backgroundColor: (theme) => theme.palette.grey[50] }}>
              <MenuItem value={FILTER_ALL}>All Sections</MenuItem>
              {sectionOptions.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <Select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} sx={{ backgroundColor: (theme) => theme.palette.grey[50] }}>
              <MenuItem value={FILTER_ALL}>All Status</MenuItem>
              <MenuItem value={STUDENT_STATUS.ACTIVE}>Active</MenuItem>
              <MenuItem value={STUDENT_STATUS.DROPPED}>Dropped</MenuItem>
              <MenuItem value={STUDENT_STATUS.PASSED_OUT}>Passed Out</MenuItem>
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

    <PageCard sx={{ overflow: 'hidden', mb: 3 }}>
      <TableContainer>
        <Table>
          <AppTableHead
            columns={[
              { key: 'student', label: 'Student' },
              { key: 'admissionNo', label: 'Admission No' },
              { key: 'grade', label: 'Grade' },
              { key: 'section', label: 'Section' },
              { key: 'parent', label: 'Parent' },
              { key: 'status', label: 'Status' },
              { key: 'actions', label: 'Actions', align: 'right' },
            ]}
          />

          <TableBody>
            {students.map((student) => (
              <TableRow
                key={student._id}
                sx={{
                  '& .MuiTableCell-root': { borderBottomColor: (theme) => theme.palette.grey[100] },
                  '&:hover': { backgroundColor: (theme) => theme.palette.grey[50] },
                }}
              >
                <TableCell>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Avatar
                      src={student.profilePhotoUrl || undefined}
                      sx={(theme) => ({
                        width: 40,
                        height: 40,
                        borderRadius: '999px',
                        fontWeight: 700,
                        fontSize: '0.82rem',
                        border: '1px solid',
                        borderColor: theme.palette.grey[200],
                        backgroundColor: theme.palette.info.light,
                        color: theme.palette.info.main,
                      })}
                    >
                      {String(student.name || 'S').slice(0, 1).toUpperCase()}
                    </Avatar>

                    <Box>
                      <Typography sx={{ fontSize: '0.9rem', fontWeight: 700 }}>{student.name}</Typography>
                      <Typography sx={{ fontSize: '0.76rem', color: (theme) => theme.palette.grey[500] }}>
                        {student.email || student.parentId?.email || 'N/A'}
                      </Typography>
                    </Box>
                  </Stack>
                </TableCell>
                <TableCell sx={{ fontSize: '0.88rem', color: 'text.secondary', fontWeight: 500 }}>
                  {student.admissionNo}
                </TableCell>
                <TableCell sx={{ fontSize: '0.88rem', color: 'text.secondary', fontWeight: 500 }}>
                  {student.grade || 'N/A'}
                </TableCell>
                <TableCell sx={{ fontSize: '0.88rem', color: 'text.secondary', fontWeight: 500 }}>
                  {student.sectionName || 'N/A'}
                </TableCell>
                <TableCell sx={{ fontSize: '0.88rem', color: 'text.secondary', fontWeight: 500 }}>
                  {student.parentId ? `${student.parentId.firstName || ''} ${student.parentId.lastName || ''}`.trim() : 'N/A'}
                </TableCell>
                <TableCell>
                  <Chip
                    label={student.status}
                    size="small"
                    sx={(theme) => ({
                      height: 24,
                      px: 0.4,
                      borderRadius: '999px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      fontSize: '0.62rem',
                      border: '1px solid',
                      ...statusChipSx(student.status, theme),
                    })}
                  />
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    size="small"
                    onClick={() => openViewDialog(student)}
                    sx={{ color: (theme) => theme.palette.warning.main }}
                  >
                    <VisibilityOutlined fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    disabled={!canManage}
                    onClick={() => openEditDialog(student)}
                    sx={{ color: (theme) => theme.palette.info.dark }}
                  >
                    <EditOutlined fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    disabled={!canManage}
                    onClick={() => setDeleteState({ open: true, id: student._id, name: student.name })}
                    sx={{ color: (theme) => theme.palette.error.main }}
                  >
                    <DeleteOutlineOutlined fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {!loading && students.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7}>
                  <Typography sx={{ py: 3, textAlign: 'center', color: 'text.secondary' }}>
                    No students found
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
        <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: (theme) => theme.palette.grey[500] }}>
          Showing {students.length ? (page - 1) * 10 + 1 : 0} to {(page - 1) * 10 + students.length} of {total} students
        </Typography>

        <Stack direction="row" spacing={0.8} alignItems="center">
          <IconButton size="small" disabled={page <= 1} onClick={() => setPage((prev) => prev - 1)} sx={{ border: '1px solid', borderColor: (theme) => theme.palette.grey[200] }}>
            <ChevronLeftRounded fontSize="small" />
          </IconButton>
          <Button size="small" sx={{ minWidth: 56, px: 1, py: 0.5, border: '1px solid', borderColor: 'primary.main', color: 'primary.main', backgroundColor: (theme) => theme.palette.secondary.light, fontWeight: 700 }}>
            {page}/{totalPages}
          </Button>
          <IconButton size="small" disabled={page >= totalPages} onClick={() => setPage((prev) => prev + 1)} sx={{ border: '1px solid', borderColor: (theme) => theme.palette.grey[200] }}>
            <ChevronRightRounded fontSize="small" />
          </IconButton>
        </Stack>
      </Stack>
    </PageCard>

    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' }, gap: 2 }}>
      {metricSpec.map((metric) => {
        const MetricIcon = metric.icon;
        return (
          <PageCard
            key={metric.key}
            sx={{
              p: 2.2,
              boxShadow: 'none',
            }}
          >
            <Stack direction="row" spacing={1.4} alignItems="center">
              <Box
                sx={{
                  p: 1,
                  borderRadius: 1,
                  bgcolor: 'background.paper',
                  color: 'text.secondary',
                  display: 'grid',
                  placeItems: 'center',
                }}
              >
                <MetricIcon fontSize="small" />
              </Box>
              <Box>
                <Typography sx={{ fontSize: '0.64rem', fontWeight: 700, letterSpacing: '0.11em', textTransform: 'uppercase', color: 'text.secondary', opacity: 0.85 }}>
                  {metric.title}
                </Typography>
                <Typography sx={{ fontSize: '1.6rem', fontWeight: 700, color: (theme) => theme.palette.text.primary }}>
                  {metric.formatter(stats[metric.key])}
                </Typography>
              </Box>
            </Stack>
          </PageCard>
        );
      })}
    </Box>
  </>
);

export default StudentsView;
