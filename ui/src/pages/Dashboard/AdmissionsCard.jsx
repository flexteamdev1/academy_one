import React from 'react';
import {
  Avatar,
  Box,
  Card,
  CardContent,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';

const AdmissionsCard = ({ admissions }) => (
  <Card sx={(theme) => ({ borderRadius: theme.customRadius.lg, border: `1px solid ${theme.customColors.softBorder}`, boxShadow: 'none' })}>
    <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
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
                  borderBottom: `1px solid ${theme.customColors.stone100}`,
                  py: 1.4,
                })}
              >
                {head}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {admissions.map((student) => (
            <TableRow
              key={student.name}
              sx={(theme) => ({
                '& td': { borderBottom: `1px solid ${theme.customColors.stone100}` },
              })}
            >
              <TableCell sx={{ py: 1.5 }}>
                <Stack direction="row" spacing={1.3} alignItems="center">
                  <Avatar
                    sx={(theme) => ({
                      width: 30,
                      height: 30,
                      fontSize: '0.66rem',
                      backgroundColor: theme.customColors.pastelBlue,
                      color: theme.customColors.dashboardAccentOne,
                      fontWeight: 700,
                    })}
                  >
                    {student.initials}
                  </Avatar>
                  <Typography sx={{ fontWeight: 700, color: 'text.primary' }}>{student.name}</Typography>
                </Stack>
              </TableCell>
              <TableCell sx={{ color: 'text.secondary', fontWeight: 500 }}>{student.grade}</TableCell>
              <TableCell sx={{ color: 'text.secondary', fontWeight: 500 }}>{student.date}</TableCell>
              <TableCell>
                <Box
                  sx={(theme) => ({
                    display: 'inline-flex',
                    px: 1,
                    py: 0.35,
                    borderRadius: 999,
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    backgroundColor: student.status === 'Confirmed'
                      ? theme.customColors.successSoft
                      : theme.customColors.warningSoft,
                    color: student.status === 'Confirmed'
                      ? theme.customColors.successText
                      : theme.customColors.warningText,
                  })}
                >
                  {student.status}
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </CardContent>
  </Card>
);

export default AdmissionsCard;
