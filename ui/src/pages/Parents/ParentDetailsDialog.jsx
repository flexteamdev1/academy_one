import React from 'react';
import {
  Box,
  Chip,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import CloseRounded from '@mui/icons-material/CloseRounded';
import EmailOutlined from '@mui/icons-material/EmailOutlined';
import PhoneOutlined from '@mui/icons-material/PhoneOutlined';
import FamilyRestroomOutlined from '@mui/icons-material/FamilyRestroomOutlined';
import AppDialog from '../../components/common/AppDialog';

const formatDate = (value) => {
  if (!value) return 'N/A';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'N/A';
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};

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

const ParentDetailsDialog = ({ open, onClose, parent }) => {
  if (!parent) return null;
  const fullName = parent.fullName || `${parent.firstName || ''} ${parent.lastName || ''}`.trim() || 'N/A';
  const children = Array.isArray(parent.children) ? parent.children : [];
  const childrenInfo = Array.isArray(parent.childrenInfo) ? parent.childrenInfo : [];

  const hasValue = (value) => {
    if (value == null) return false;
    if (typeof value === 'string') return value.trim().length > 0;
    return true;
  };

  const metaRow = (label, value) =>
    hasValue(value) ? (
      <Box>
        <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary' }}>{label}</Typography>
        <Typography sx={{ fontWeight: 700 }}>{value}</Typography>
      </Box>
    ) : null;

  const infoLine = (label, value) =>
    hasValue(value) ? (
      <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
        {value}
      </Typography>
    ) : null;

  return (
    <AppDialog open={open} onClose={onClose} maxWidth="md">
      <Box
        sx={(theme) => ({
          position: 'relative',
          p: { xs: 2, sm: 3 },
          background: `linear-gradient(135deg, ${theme.palette.info.light}22 0%, ${theme.palette.primary.light}22 100%)`,
          borderBottom: `1px solid ${theme.palette.divider}`,
        })}
      >
        <IconButton
          onClick={onClose}
          sx={(theme) => ({
            position: 'absolute',
            right: 12,
            top: 12,
            border: '1px solid',
            borderColor: theme.palette.grey[200],
            bgcolor: theme.palette.background.paper,
          })}
        >
          <CloseRounded fontSize="small" />
        </IconButton>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2.5} alignItems={{ xs: 'flex-start', sm: 'center' }}>
          <Box
            sx={(theme) => ({
              width: 84,
              height: 84,
              borderRadius: '18px',
              display: 'grid',
              placeItems: 'center',
              backgroundColor: theme.palette.info.light,
              color: theme.palette.info.main,
              fontWeight: 800,
              fontSize: '1.8rem',
              boxShadow: '0 10px 20px rgba(15, 23, 42, 0.12)',
            })}
          >
            {String(fullName || 'P').slice(0, 1).toUpperCase()}
          </Box>
          <Box sx={{ flex: 1 }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ flexWrap: 'wrap' }}>
              <Typography variant="h5" sx={{ fontWeight: 800 }}>
                {fullName}
              </Typography>
              <Chip
                label={parent.status || 'UNKNOWN'}
                size="small"
                variant="outlined"
                sx={(theme) => ({
                  borderWidth: 1,
                  fontWeight: 700,
                  fontSize: '0.7rem',
                  height: 22,
                  ...statusChipSx(parent.status, theme),
                })}
              />
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 0.8 }}>
              {hasValue(parent.createdAt) ? (
                <Typography sx={{ fontSize: '0.82rem', color: 'text.secondary' }}>
                  Joined: {formatDate(parent.createdAt)}
                </Typography>
              ) : null}
              {hasValue(parent.updatedAt) ? (
                <Typography sx={{ fontSize: '0.82rem', color: 'text.secondary' }}>
                  Updated: {formatDate(parent.updatedAt)}
                </Typography>
              ) : null}
            </Stack>
          </Box>
        </Stack>
      </Box>

      <Stack spacing={2} sx={{ p: { xs: 2, sm: 3 } }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1.2fr 1fr' },
            gap: 2,
          }}
        >
          <Box sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', p: 2.2 }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.4 }}>
              <FamilyRestroomOutlined fontSize="small" color="primary" />
              <Typography sx={{ fontWeight: 800, fontSize: '0.78rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'primary.main' }}>
                Parent Profile
              </Typography>
            </Stack>
            <Stack spacing={1.1}>
              {metaRow('First Name', parent.firstName)}
              {metaRow('Last Name', parent.lastName)}
              {metaRow('Relation', parent.relation)}
              {metaRow('Occupation', parent.occupation)}
              {metaRow('Children Linked', parent.childrenCount ?? children.length ?? 0)}
            </Stack>
          </Box>

          <Box sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', p: 2.2 }}>
            <Typography sx={{ fontWeight: 800, fontSize: '0.78rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'warning.main' }}>
              Contact
            </Typography>
            <Stack spacing={1.2} sx={{ mt: 1.2 }}>
              {hasValue(parent.email) ? (
                <Box>
                  <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary' }}>
                    <EmailOutlined sx={{ fontSize: 14, mr: 0.5 }} />
                    Email
                  </Typography>
                  <Typography sx={{ fontWeight: 700 }}>{parent.email}</Typography>
                </Box>
              ) : null}
              {hasValue(parent.phone) ? (
                <Box>
                  <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary' }}>
                    <PhoneOutlined sx={{ fontSize: 14, mr: 0.5 }} />
                    Phone
                  </Typography>
                  <Typography sx={{ fontWeight: 700 }}>{parent.phone}</Typography>
                </Box>
              ) : null}
              {hasValue(parent.emergencyContact) ? (
                <Box>
                  <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary' }}>Emergency Contact</Typography>
                  <Typography sx={{ fontWeight: 700 }}>{parent.emergencyContact}</Typography>
                </Box>
              ) : null}
            </Stack>
          </Box>
        </Box>

        <Box sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', p: 2.2 }}>
          <Typography sx={{ fontWeight: 800, fontSize: '0.78rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'text.secondary' }}>
            Children & Guardians
          </Typography>
          {(children.length || childrenInfo.length) ? (
            <Stack spacing={1.4} sx={{ mt: 1.4 }}>
              {(childrenInfo.length ? childrenInfo : children).map((child) => (
                <Box
                  key={child._id}
                  sx={(theme) => ({
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: theme.palette.grey[200],
                    p: 1.6,
                    backgroundColor: theme.palette.grey[50],
                  })}
                >
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="space-between">
                    <Box>
                      <Typography sx={{ fontWeight: 800 }}>{child.name || 'Student'}</Typography>
                      <Typography sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>
                        Admission No: {child.admissionNo || 'N/A'}
                      </Typography>
                      <Typography sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>
                        Grade/Section: {child.grade || 'N/A'} {child.sectionName ? `- ${child.sectionName}` : ''}
                      </Typography>
                    </Box>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                      {(hasValue(child.fatherName) ||
                        hasValue(child.fatherOccupation) ||
                        hasValue(child.fatherEmail) ||
                        hasValue(child.fatherPhone)) ? (
                        <Box>
                          <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary' }}>Father</Typography>
                          {hasValue(child.fatherName) ? (
                            <Typography sx={{ fontWeight: 700 }}>{child.fatherName}</Typography>
                          ) : null}
                          {infoLine('Father Occupation', child.fatherOccupation)}
                          {infoLine('Father Email', child.fatherEmail)}
                          {infoLine('Father Phone', child.fatherPhone)}
                        </Box>
                      ) : null}
                      {(hasValue(child.motherName) ||
                        hasValue(child.motherOccupation) ||
                        hasValue(child.motherEmail) ||
                        hasValue(child.motherPhone)) ? (
                        <Box>
                          <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary' }}>Mother</Typography>
                          {hasValue(child.motherName) ? (
                            <Typography sx={{ fontWeight: 700 }}>{child.motherName}</Typography>
                          ) : null}
                          {infoLine('Mother Occupation', child.motherOccupation)}
                          {infoLine('Mother Email', child.motherEmail)}
                          {infoLine('Mother Phone', child.motherPhone)}
                        </Box>
                      ) : null}
                    </Stack>
                  </Stack>
                </Box>
              ))}
            </Stack>
          ) : (
            <Typography sx={{ mt: 1.2, color: 'text.secondary' }}>No linked students found.</Typography>
          )}
        </Box>
      </Stack>
    </AppDialog>
  );
};

export default ParentDetailsDialog;
