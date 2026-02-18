import React from 'react';
import {
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import CloseRounded from '@mui/icons-material/CloseRounded';
import WorkOutline from '@mui/icons-material/WorkOutline';
import ContactMailOutlined from '@mui/icons-material/ContactMailOutlined';
import PhoneOutlined from '@mui/icons-material/PhoneOutlined';
import CalendarMonthOutlined from '@mui/icons-material/CalendarMonthOutlined';
import AppDialog from '../../components/common/AppDialog';

const formatDate = (value) => {
  if (!value) return 'N/A';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'N/A';
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};

const TeacherDetailsDialog = ({ open, onClose, teacher, onEdit }) => {
  const fullName = `${teacher?.firstName || ''} ${teacher?.lastName || ''}`.trim() || 'Teacher';
  const subjects = Array.isArray(teacher?.subjects) ? teacher.subjects : [];

  return (
    <AppDialog open={open} onClose={onClose} maxWidth="sm">
      <Box sx={{ position: 'relative', px: { xs: 1, sm: 2 }, pt: 1 }}>
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 6,
            top: 6,
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
          }}
        >
          <CloseRounded fontSize="small" />
        </IconButton>

        <Stack spacing={2} alignItems="center" sx={{ pb: 2 }}>
          <Avatar sx={{ width: 84, height: 84, bgcolor: 'primary.light', color: 'primary.main', fontWeight: 700 }}>
            {fullName.slice(0, 1).toUpperCase()}
          </Avatar>
          <Stack spacing={0.4} alignItems="center">
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              {fullName}
            </Typography>
            <Chip
              label={teacher?.status || 'N/A'}
              size="small"
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                fontSize: '0.6rem',
              }}
            />
            <Typography sx={{ fontSize: '0.78rem', color: 'text.secondary' }}>
              Employee ID: {teacher?.employeeId || 'N/A'}
            </Typography>
          </Stack>
        </Stack>
      </Box>

      <Divider />

      <Stack spacing={2} sx={{ px: { xs: 2, sm: 3 }, py: 2.5 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <Box sx={{ flex: 1, borderRadius: 2, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', p: 2 }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
              <WorkOutline fontSize="small" color="primary" />
              <Typography sx={{ fontWeight: 700, fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'primary.main' }}>
                Professional
              </Typography>
            </Stack>
            <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary' }}>Qualification</Typography>
            <Typography sx={{ fontWeight: 700 }}>{teacher?.qualification || 'N/A'}</Typography>
            <Box sx={{ mt: 1 }}>
              <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary' }}>Experience</Typography>
              <Typography sx={{ fontWeight: 700 }}>{teacher?.experience ? `${teacher.experience} years` : 'N/A'}</Typography>
            </Box>
          </Box>

          <Box sx={{ flex: 1, borderRadius: 2, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', p: 2 }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
              <CalendarMonthOutlined fontSize="small" color="info" />
              <Typography sx={{ fontWeight: 700, fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'info.main' }}>
                Employment
              </Typography>
            </Stack>
            <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary' }}>Joined</Typography>
            <Typography sx={{ fontWeight: 700 }}>{formatDate(teacher?.joinedAt)}</Typography>
            <Box sx={{ mt: 1 }}>
              <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary' }}>Status</Typography>
              <Typography sx={{ fontWeight: 700 }}>{teacher?.status || 'N/A'}</Typography>
            </Box>
          </Box>
        </Stack>

        <Box sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', p: 2 }}>
          <Typography sx={{ fontWeight: 700, fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'warning.main' }}>
            Contact
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 1 }}>
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary' }}>
                <ContactMailOutlined sx={{ fontSize: 14, mr: 0.5 }} />
                Email
              </Typography>
              <Typography sx={{ fontWeight: 700 }}>{teacher?.email || 'N/A'}</Typography>
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary' }}>
                <PhoneOutlined sx={{ fontSize: 14, mr: 0.5 }} />
                Phone
              </Typography>
              <Typography sx={{ fontWeight: 700 }}>{teacher?.phone || 'N/A'}</Typography>
            </Box>
          </Stack>
        </Box>

        {subjects.length ? (
          <Box sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', p: 2 }}>
            <Typography sx={{ fontWeight: 700, fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'text.secondary' }}>
              Subjects
            </Typography>
            <Stack direction="row" spacing={0.8} sx={{ mt: 1, flexWrap: 'wrap' }} useFlexGap>
              {subjects.map((subject) => (
                <Chip key={subject} label={subject} size="small" />
              ))}
            </Stack>
          </Box>
        ) : null}
      </Stack>

      <Divider />

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} justifyContent="flex-end" sx={{ px: { xs: 2, sm: 3 }, py: 2 }}>
        <Button variant="outlined" onClick={onClose}>
          Close
        </Button>
        <Button variant="contained" onClick={onEdit}>
          Edit Record
        </Button>
      </Stack>
    </AppDialog>
  );
};

export default TeacherDetailsDialog;
