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
import SchoolOutlined from '@mui/icons-material/SchoolOutlined';
import PersonOutlined from '@mui/icons-material/PersonOutlined';
import PhoneOutlined from '@mui/icons-material/PhoneOutlined';
import EmailOutlined from '@mui/icons-material/EmailOutlined';
import AppDialog from '../../components/common/AppDialog';

const formatDate = (value) => {
  if (!value) return 'N/A';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'N/A';
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};

const getStatusColor = (status, theme) => {
  if (String(status || '').toUpperCase() === 'ACTIVE') {
    return {
      backgroundColor: theme.palette.success.light,
      color: theme.palette.success.dark,
      borderColor: theme.palette.success.main,
    };
  }
  return {
    backgroundColor: theme.palette.grey[100],
    color: theme.palette.grey[500],
    borderColor: theme.palette.grey[200],
  };
};

const StudentDetailsDialog = ({
  open,
  onClose,
  student,
  canManage,
  onEdit,
}) => {

  return (
    <AppDialog open={open} onClose={onClose} maxWidth="sm">
      <Box sx={{ position: 'relative', px: { xs: 1, sm: 2 }, pt: 1 }}>
        <IconButton
          onClick={onClose}
          sx={(theme) => ({
            position: 'absolute',
            right: 6,
            top: 6,
            color: theme.palette.grey[500],
            border: '1px solid',
            borderColor: theme.palette.grey[200],
            backgroundColor: theme.palette.grey[50],
            '&:hover': { backgroundColor: theme.palette.grey[100] },
          })}
        >
          <CloseRounded fontSize="small" />
        </IconButton>

        <Stack spacing={2} alignItems="center" sx={{ pb: 2 }}>
          <Box sx={{ position: 'relative' }}>
            <Avatar
              src={student?.profilePhotoUrl || undefined}
              sx={(theme) => ({
                width: 84,
                height: 84,
                border: '4px solid',
                borderColor: theme.palette.grey[50],
                boxShadow: '0 10px 20px rgba(15, 23, 42, 0.12)',
              })}
            >
              {String(student?.name || 'S').slice(0, 1).toUpperCase()}
            </Avatar>
            <Box
              sx={(theme) => ({
                position: 'absolute',
                right: 4,
                bottom: 4,
                width: 16,
                height: 16,
                borderRadius: '999px',
                border: '2px solid',
                borderColor: theme.palette.grey[50],
                backgroundColor: String(student?.status || '').toUpperCase() === 'ACTIVE'
                  ? theme.palette.success.main
                  : theme.palette.grey[300],
              })}
            />
          </Box>
          <Stack spacing={0.4} alignItems="center">
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              {student?.name || 'Student'}
            </Typography>
            <Chip
              label={student?.status || 'N/A'}
              size="small"
              sx={(theme) => ({
                border: '1px solid',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                fontSize: '0.6rem',
                ...getStatusColor(student?.status, theme),
              })}
            />
            <Typography sx={{ fontSize: '0.78rem', color: 'text.secondary' }}>
              Student ID: {student?.admissionNo || 'N/A'}
            </Typography>
          </Stack>
        </Stack>
      </Box>

      <Divider />

      <Stack spacing={2} sx={{ px: { xs: 2, sm: 3 }, py: 2.5 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <Box
            sx={(theme) => ({
              flex: 1,
              borderRadius: theme.shape.borderRadius,
              backgroundColor: theme.palette.grey[50],
              border: '1px solid',
              borderColor: theme.palette.grey[100],
              p: 2,
            })}
          >
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
              <PersonOutlined fontSize="small" sx={{ color: (theme) => theme.palette.warning.main }} />
              <Typography sx={{ fontWeight: 700, fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: (theme) => theme.palette.warning.main }}>
                Personal Details
              </Typography>
            </Stack>
            <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary' }}>Date of Birth</Typography>
            <Typography sx={{ fontWeight: 700 }}>{formatDate(student?.dob)}</Typography>
            <Box sx={{ mt: 1 }}>
              <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary' }}>Gender</Typography>
              <Typography sx={{ fontWeight: 700 }}>{student?.gender || 'N/A'}</Typography>
            </Box>
            <Box sx={{ mt: 1 }}>
              <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary' }}>Roll No</Typography>
              <Typography sx={{ fontWeight: 700 }}>{student?.rollNo || 'N/A'}</Typography>
            </Box>
            <Box sx={{ mt: 1 }}>
              <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary' }}>Blood Group</Typography>
              <Typography sx={{ fontWeight: 700 }}>{student?.bloodGroup || 'N/A'}</Typography>
            </Box>
            <Box sx={{ mt: 1 }}>
              <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary' }}>Full Address</Typography>
              <Typography sx={{ fontWeight: 700 }}>
                {student?.address
                  ? [
                      student.address.street,
                      student.address.city,
                      student.address.state,
                      student.address.zip,
                      student.address.country,
                    ]
                      .filter(Boolean)
                      .join(', ')
                  : 'N/A'}
              </Typography>
            </Box>
          </Box>

          <Box
            sx={(theme) => ({
              flex: 1,
              borderRadius: theme.shape.borderRadius,
              backgroundColor: theme.palette.grey[50],
              border: '1px solid',
              borderColor: theme.palette.grey[100],
              p: 2,
            })}
          >
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
              <SchoolOutlined fontSize="small" sx={{ color: (theme) => theme.palette.info.dark }} />
              <Typography sx={{ fontWeight: 700, fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: (theme) => theme.palette.info.dark }}>
                Academic Info
              </Typography>
            </Stack>
            <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary' }}>Current Grade</Typography>
            <Typography sx={{ fontWeight: 700 }}>
              {student?.grade ? `${student.grade}${student?.sectionName ? `-${student.sectionName}` : ''}` : 'N/A'}
            </Typography>
            <Box sx={{ mt: 1 }}>
              <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary' }}>Enrollment Date</Typography>
              <Typography sx={{ fontWeight: 700 }}>{formatDate(student?.createdAt)}</Typography>
            </Box>
          </Box>
        </Stack>

        <Box
          sx={(theme) => ({
            borderRadius: theme.shape.borderRadius,
            border: '1px solid',
            borderColor: theme.palette.primary.light,
            backgroundColor: theme.palette.primary.light,
            p: 2,
          })}
        >
          <Typography sx={{ fontWeight: 700, fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: (theme) => theme.palette.warning.main }}>
            Father Details
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 1 }}>
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary' }}>Full Name</Typography>
              <Typography sx={{ fontWeight: 700 }}>{student?.fatherName || 'N/A'}</Typography>
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary' }}>
                <EmailOutlined sx={{ fontSize: 14, mr: 0.5 }} />
                Email Address
              </Typography>
              <Typography sx={{ fontWeight: 700 }}>{student?.fatherEmail || 'N/A'}</Typography>
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary' }}>
                <PhoneOutlined sx={{ fontSize: 14, mr: 0.5 }} />
                Phone Number
              </Typography>
              <Typography sx={{ fontWeight: 700 }}>{student?.fatherPhone || 'N/A'}</Typography>
            </Box>
          </Stack>
          <Box sx={{ mt: 1 }}>
            <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary' }}>Occupation</Typography>
            <Typography sx={{ fontWeight: 700 }}>{student?.fatherOccupation || 'N/A'}</Typography>
          </Box>
        </Box>

        <Box
          sx={(theme) => ({
            borderRadius: theme.shape.borderRadius,
            border: '1px solid',
            borderColor: theme.palette.grey[200],
            backgroundColor: theme.palette.grey[50],
            p: 2,
          })}
        >
          <Typography sx={{ fontWeight: 700, fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'text.secondary' }}>
            Mother Details
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 1 }}>
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary' }}>Full Name</Typography>
              <Typography sx={{ fontWeight: 700 }}>{student?.motherName || 'N/A'}</Typography>
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary' }}>
                <EmailOutlined sx={{ fontSize: 14, mr: 0.5 }} />
                Email Address
              </Typography>
              <Typography sx={{ fontWeight: 700 }}>{student?.motherEmail || 'N/A'}</Typography>
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary' }}>
                <PhoneOutlined sx={{ fontSize: 14, mr: 0.5 }} />
                Phone Number
              </Typography>
              <Typography sx={{ fontWeight: 700 }}>{student?.motherPhone || 'N/A'}</Typography>
            </Box>
          </Stack>
          <Box sx={{ mt: 1 }}>
            <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary' }}>Occupation</Typography>
            <Typography sx={{ fontWeight: 700 }}>{student?.motherOccupation || 'N/A'}</Typography>
          </Box>
        </Box>

        <Box
          sx={(theme) => ({
            borderRadius: theme.shape.borderRadius,
            border: '1px solid',
            borderColor: theme.palette.warning.light,
            backgroundColor: theme.palette.warning.light,
            p: 2,
          })}
        >
          <Typography sx={{ fontWeight: 700, fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: (theme) => theme.palette.warning.main }}>
            Emergency Contact
          </Typography>
          <Typography sx={{ fontWeight: 700, mt: 0.6 }}>{student?.emergencyPhone || 'N/A'}</Typography>
        </Box>
      </Stack>

      <Divider />

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} justifyContent="flex-end" sx={{ px: { xs: 2, sm: 3 }, py: 2 }}>
        <Button variant="outlined" onClick={onClose}>
          Close
        </Button>
        {canManage ? (
          <Button variant="contained" onClick={onEdit}>
            Edit Record
          </Button>
        ) : null}
      </Stack>
    </AppDialog>
  );
};

export default StudentDetailsDialog;
