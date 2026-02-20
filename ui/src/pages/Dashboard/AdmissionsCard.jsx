import React from 'react';
import {
  Avatar,
  Box,
  CardContent,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import PageCard from '../../components/common/PageCard';

const formatDate = (value) => {
  if (!value) return 'N/A';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'N/A';
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
};

const statusLabel = (status) => {
  if (!status) return 'Pending';
  const normalized = String(status).toUpperCase();
  if (normalized === 'ACTIVE') return 'Confirmed';
  if (normalized === 'PASSED_OUT') return 'Completed';
  return 'Pending';
};

const AdmissionsCard = ({ admissions, loading = false }) => (
  <PageCard sx={{ height: '100%', width: '100%', boxShadow: 'none' }}>
    <CardContent sx={{ p: 0, '&:last-child': { pb: 0 }, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ px: 2.2, py: 2 }}>
        <Typography sx={{ fontSize: '1.35rem', fontWeight: 800, color: 'text.primary' }}>Recent Admissions</Typography>
        <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: 'primary.main', letterSpacing: '0.06em' }}>
          VIEW ALL
        </Typography>
      </Stack>
      <Table size="small">
        <TableHead>
          <TableRow sx={{ backgroundColor: 'background.default' }}>
            {['Student', 'Grade', 'Date', 'Status'].map((head) => (
              <TableCell
                key={head}
                sx={(theme) => ({
                  color: 'text.secondary',
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  borderBottom: `1px solid ${theme.palette.grey[100]}`,
                  py: 1.4,
                })}
              >
                {head}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={4} sx={{ py: 2, color: 'text.secondary' }}>
                Loading admissions...
              </TableCell>
            </TableRow>
          ) : null}
          {!loading && admissions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} sx={{ py: 2, color: 'text.secondary' }}>
                No recent admissions found.
              </TableCell>
            </TableRow>
          ) : null}
          {!loading && admissions.map((student) => {
            const initials = String(student.name || 'NA')
              .split(' ')
              .slice(0, 2)
              .map((part) => part[0])
              .join('')
              .toUpperCase();
            const status = statusLabel(student.status);
            return (
            <TableRow
              key={student._id || student.name}
              sx={(theme) => ({
                '& td': { borderBottom: `1px solid ${theme.palette.grey[100]}` },
              })}
            >
              <TableCell sx={{ py: 1.5 }}>
                <Stack direction="row" spacing={1.3} alignItems="center">
                  <Avatar
                    sx={(theme) => ({
                      width: 30,
                      height: 30,
                      fontSize: '0.66rem',
                      backgroundColor: theme.palette.info.light,
                      color: theme.palette.primary.main,
                      fontWeight: 700,
                    })}
                  >
                    {initials}
                  </Avatar>
                  <Typography sx={{ fontWeight: 700, color: 'text.primary' }}>{student.name}</Typography>
                </Stack>
              </TableCell>
              <TableCell sx={{ color: 'text.secondary', fontWeight: 500 }}>
                {student.grade || 'N/A'}-{student.sectionName || 'N/A'}
              </TableCell>
              <TableCell sx={{ color: 'text.secondary', fontWeight: 500 }}>{formatDate(student.createdAt)}</TableCell>
              <TableCell>
                <Box
                  sx={(theme) => ({
                    display: 'inline-flex',
                    px: 1,
                    py: 0.35,
                    borderRadius: 999,
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    backgroundColor: status === 'Confirmed'
                      ? theme.palette.success.light
                      : status === 'Completed'
                      ? theme.palette.info.light
                      : theme.palette.warning.light,
                    color: status === 'Confirmed'
                      ? theme.palette.success.dark
                      : status === 'Completed'
                      ? theme.palette.info.dark
                      : theme.palette.warning.main,
                  })}
                >
                  {status}
                </Box>
              </TableCell>
            </TableRow>
          )})}
        </TableBody>
      </Table>
    </CardContent>
  </PageCard>
);

export default AdmissionsCard;
