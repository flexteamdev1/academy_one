import React from 'react';
import {
  Avatar,
  Box,
  Button,
  Divider,
  MenuItem,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import CloudUploadOutlined from '@mui/icons-material/CloudUploadOutlined';
import PhotoCameraOutlined from '@mui/icons-material/PhotoCameraOutlined';
import WarningAmberOutlined from '@mui/icons-material/WarningAmberOutlined';
import AppDialog from '../../components/common/AppDialog';
import PhoneMaskInput from '../../components/common/PhoneMaskInput';

const StudentFormDialog = ({
  dialogOpen,
  setDialogOpen,
  submitting,
  handleSubmitStudent,
  dialogMode,
  form,
  setForm,
  STUDENT_GENDER,
  STUDENT_STATUS,
  dialogGradeOptions,
  dialogSectionOptions,
  resolveClassId,
  handlePhotoChange,
  photoPreview,
  handleRemovePhoto,
}) => (
  <AppDialog
    open={dialogOpen}
    onClose={() => setDialogOpen(false)}
    title={dialogMode === 'edit' ? 'Edit Student' : 'Create Student'}
    maxWidth="md"
    contentDividers
    secondaryAction={{ label: 'Cancel', onClick: () => setDialogOpen(false) }}
    primaryAction={{
      label: submitting ? 'Saving...' : dialogMode === 'edit' ? 'Save Changes' : 'Create Student',
      onClick: handleSubmitStudent,
      disabled: submitting,
    }}
  >
    <Stack spacing={2.5}>
      <Stack spacing={0.8}>
        <Typography sx={{ fontWeight: 700 }}>Student Details</Typography>
        <Divider />
      </Stack>

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2.5}>
        <Box sx={{ width: { xs: '100%', md: 220 } }}>
          <Box
            component="label"
            sx={(theme) => ({
              borderRadius: '999px',
              border: '1px dashed',
              borderColor: theme.palette.grey[300],
              background: `linear-gradient(180deg, ${theme.palette.grey[50]}, ${theme.palette.grey[100]})`,
              height: 180,
              width: 180,
              mx: { xs: 'auto', md: 0 },
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              cursor: 'pointer',
            })}
          >
            <input hidden type="file" accept="image/*" onChange={(e) => handlePhotoChange(e.target.files?.[0] || null)} />
            {photoPreview ? (
              <Avatar src={photoPreview} sx={{ width: 150, height: 150 }} />
            ) : (
              <Stack spacing={0.6} alignItems="center" sx={{ textAlign: 'center', px: 2 }}>
                <CloudUploadOutlined sx={{ fontSize: 36, color: 'text.secondary' }} />
                <Typography sx={{ fontSize: '0.78rem', color: 'text.secondary' }}>
                  Click to Upload Photo
                </Typography>
              </Stack>
            )}
            <Box
              sx={(theme) => ({
                position: 'absolute',
                bottom: 10,
                right: 10,
                width: 36,
                height: 36,
                borderRadius: '999px',
                backgroundColor: theme.palette.grey[50],
                border: '1px solid',
                borderColor: theme.palette.grey[200],
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 6px 14px rgba(15, 23, 42, 0.12)',
              })}
            >
              <PhotoCameraOutlined sx={{ fontSize: 18, color: 'text.secondary' }} />
            </Box>
          </Box>
          {dialogMode === 'edit' ? (
            <Button
              variant="text"
              color="error"
              onClick={handleRemovePhoto}
              disabled={!photoPreview}
              sx={{ mt: 1.2, mx: { xs: 'auto', md: 0 }, display: 'block' }}
            >
              Remove Photo
            </Button>
          ) : null}
        </Box>

        <Stack spacing={1.6} sx={{ flex: 1 }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}>
            <TextField fullWidth label="Student Name" value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} />
            <TextField fullWidth label="Student Email (Optional)" value={form.email} onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))} />
          </Stack>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}>
            <TextField select fullWidth label="Gender" value={form.gender} onChange={(e) => setForm((prev) => ({ ...prev, gender: e.target.value }))}>
              <MenuItem value={STUDENT_GENDER.MALE}>Male</MenuItem>
              <MenuItem value={STUDENT_GENDER.FEMALE}>Female</MenuItem>
              <MenuItem value={STUDENT_GENDER.OTHER}>Other</MenuItem>
            </TextField>
            <TextField fullWidth type="date" label="Date of Birth" InputLabelProps={{ shrink: true }} value={form.dob} onChange={(e) => setForm((prev) => ({ ...prev, dob: e.target.value }))} />
          </Stack>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}>
            <TextField
              select
              fullWidth
              label="Grade"
              value={form.grade}
              onChange={(e) => {
                const nextGrade = e.target.value;
                setForm((prev) => ({
                  ...prev,
                  grade: nextGrade,
                  sectionName: '',
                  classId: '',
                }));
              }}
            >
              <MenuItem value="">Select Grade</MenuItem>
              {dialogGradeOptions.map((item) => (
                <MenuItem key={item} value={item}>{item}</MenuItem>
              ))}
            </TextField>

            <TextField
              select
              fullWidth
              label="Section"
              value={form.sectionName}
              disabled={!form.grade}
              onChange={(e) => {
                const nextSection = e.target.value;
                setForm((prev) => ({
                  ...prev,
                  sectionName: nextSection,
                  classId: resolveClassId(prev.grade, nextSection),
                }));
              }}
            >
              <MenuItem value="">Select Section</MenuItem>
              {dialogSectionOptions.map((item) => (
                <MenuItem key={item} value={item}>{item}</MenuItem>
              ))}
            </TextField>
          </Stack>

          {dialogMode === 'edit' ? (
            <TextField
              select
              fullWidth
              label="Status"
              value={form.status}
              onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}
            >
              <MenuItem value={STUDENT_STATUS.ACTIVE}>Active</MenuItem>
              <MenuItem value={STUDENT_STATUS.DROPPED}>Dropped</MenuItem>
              <MenuItem value={STUDENT_STATUS.PASSED_OUT}>Passed Out</MenuItem>
            </TextField>
          ) : null}
        </Stack>
      </Stack>

      <Stack spacing={0.8}>
        <Typography sx={{ fontWeight: 700 }}>Parent Details</Typography>
        <Divider />
      </Stack>

      <Stack spacing={1.6}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}>
          <TextField fullWidth label="Parent First Name" value={form.parentFirstName} onChange={(e) => setForm((prev) => ({ ...prev, parentFirstName: e.target.value }))} />
          <TextField fullWidth label="Parent Last Name" value={form.parentLastName} onChange={(e) => setForm((prev) => ({ ...prev, parentLastName: e.target.value }))} />
        </Stack>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}>
          <TextField fullWidth label="Parent Email" value={form.parentEmail} onChange={(e) => setForm((prev) => ({ ...prev, parentEmail: e.target.value }))} />
          <TextField
            fullWidth
            label="Parent Phone"
            name="parentPhone"
            value={form.parentPhone}
            onChange={(e) => setForm((prev) => ({ ...prev, parentPhone: e.target.value }))}
            InputProps={{ inputComponent: PhoneMaskInput }}
          />
        </Stack>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} alignItems="flex-start">
          <Stack spacing={0.6} sx={{ width: { xs: '100%', md: '50%' } }}>
            <Typography sx={{ fontWeight: 600, fontSize: '0.85rem', color: 'text.secondary' }}>
              Relation
            </Typography>
            <ToggleButtonGroup
              color="primary"
              exclusive
              fullWidth
              value={form.parentRelation}
              onChange={(_event, value) => setForm((prev) => ({ ...prev, parentRelation: value || '' }))}
              sx={(theme) => ({
                width: '100%',
                backgroundColor: theme.palette.grey[50],
                borderRadius: theme.shape.borderRadius,
                border: '1px solid',
                borderColor: theme.palette.grey[200],
                p: 0.4,
                display: 'grid',
                gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                gap: 0.5,
                '& .MuiToggleButton-root': {
                  border: '1px solid transparent',
                  borderRadius: theme.shape.borderRadius,
                  textTransform: 'none',
                  fontWeight: 600,
                  height: 40,
                },
              })}
            >
              <ToggleButton value="Mother">Mother</ToggleButton>
              <ToggleButton value="Father">Father</ToggleButton>
              <ToggleButton value="Guardian">Guardian</ToggleButton>
            </ToggleButtonGroup>
          </Stack>
          <TextField
            fullWidth
            label="Occupation"
            value={form.parentOccupation}
            onChange={(e) => setForm((prev) => ({ ...prev, parentOccupation: e.target.value }))}
          />
        </Stack>
        <TextField
          fullWidth
          label="Emergency Contact"
          value={form.parentEmergencyContact}
          onChange={(e) => setForm((prev) => ({ ...prev, parentEmergencyContact: e.target.value }))}
          // InputProps={{
          //   endAdornment: <WarningAmberOutlined sx={{ color: (theme) => theme.palette.warning.main }} />,
          // }}
          InputProps={{ inputComponent: PhoneMaskInput }}
          sx={(theme) => ({
            '& .MuiOutlinedInput-root': {
              backgroundColor: theme.palette.warning.light,
              borderRadius: theme.shape.borderRadius,
            },
          })}
        />
      </Stack>
    </Stack>
  </AppDialog>
);

export default StudentFormDialog;
