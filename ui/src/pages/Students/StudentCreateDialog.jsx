import React from 'react';
import {
  Avatar,
  Box,
  Button,
  Divider,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import CloudUploadOutlined from '@mui/icons-material/CloudUploadOutlined';
import PhotoCameraOutlined from '@mui/icons-material/PhotoCameraOutlined';
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
  showErrors,
  showStatus = true,
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
            <TextField
              fullWidth
              label="Student Name"
              required
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              error={showErrors && !form.name.trim()}
              helperText={showErrors && !form.name.trim() ? 'Required' : ' '}
            />
            <TextField
              fullWidth
              label="Student Email"
              placeholder="Optional"
              value={form.email}
              onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
            />
          </Stack>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}>
            <TextField
              select
              fullWidth
              label="Gender"
              required
              value={form.gender}
              onChange={(e) => setForm((prev) => ({ ...prev, gender: e.target.value }))}
            >
              <MenuItem value={STUDENT_GENDER.MALE}>Male</MenuItem>
              <MenuItem value={STUDENT_GENDER.FEMALE}>Female</MenuItem>
              <MenuItem value={STUDENT_GENDER.OTHER}>Other</MenuItem>
            </TextField>
            <TextField
              fullWidth
              type="date"
              label="Date of Birth"
              required
              InputLabelProps={{ shrink: true }}
              value={form.dob}
              onChange={(e) => setForm((prev) => ({ ...prev, dob: e.target.value }))}
              error={showErrors && !form.dob}
              helperText={showErrors && !form.dob ? 'Required' : ' '}
            />
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
              error={showErrors && !form.grade}
              helperText={showErrors && !form.grade ? 'Required' : ' '}
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
              required
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
              error={showErrors && !form.sectionName}
              helperText={showErrors && !form.sectionName ? 'Required' : ' '}
            >
              <MenuItem value="">Select Section</MenuItem>
              {dialogSectionOptions.map((item) => (
                <MenuItem key={item} value={item}>{item}</MenuItem>
              ))}
            </TextField>
          </Stack>

          <TextField
            select
            fullWidth
            label="Blood Group"
            value={form.bloodGroup}
            onChange={(e) => setForm((prev) => ({ ...prev, bloodGroup: e.target.value }))}
          >
            <MenuItem value="">Select Blood Group</MenuItem>
            <MenuItem value="A+">A+</MenuItem>
            <MenuItem value="A-">A-</MenuItem>
            <MenuItem value="B+">B+</MenuItem>
            <MenuItem value="B-">B-</MenuItem>
            <MenuItem value="AB+">AB+</MenuItem>
            <MenuItem value="AB-">AB-</MenuItem>
            <MenuItem value="O+">O+</MenuItem>
            <MenuItem value="O-">O-</MenuItem>
          </TextField>

          {dialogMode === 'edit' && showStatus ? (
            <TextField
              select
              fullWidth
              label="Status"
              value={form.status}
              onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}
            >
              <MenuItem value={STUDENT_STATUS.ACTIVE}>Active</MenuItem>
              <MenuItem value={STUDENT_STATUS.BLOCKED}>Blocked</MenuItem>
              <MenuItem value={STUDENT_STATUS.DROPPED}>Dropped</MenuItem>
              <MenuItem value={STUDENT_STATUS.PASSED_OUT}>Passed Out</MenuItem>
            </TextField>
          ) : null}
        </Stack>
      </Stack>

      <Stack spacing={0.8}>
        <Typography sx={{ fontWeight: 700 }}>Address Details</Typography>
        <Divider />
      </Stack>

      <TextField
        fullWidth
        label="Full Address"
        placeholder="Street, City, State, Zip, Country"
        value={form.fullAddress}
        onChange={(e) => setForm((prev) => ({ ...prev, fullAddress: e.target.value }))}
        multiline
        minRows={2}
      />

      <Stack spacing={0.8}>
        <Typography sx={{ fontWeight: 700 }}>Father Details</Typography>
        <Divider />
      </Stack>

      <Stack spacing={1.6}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}>
          <TextField
            fullWidth
            label="Father Full Name"
            required
            value={form.fatherName}
            onChange={(e) => setForm((prev) => ({ ...prev, fatherName: e.target.value }))}
            error={showErrors && !form.fatherName.trim()}
            helperText={showErrors && !form.fatherName.trim() ? 'Required' : ' '}
          />
          <TextField
            fullWidth
            label="Father Email"
            required
            value={form.fatherEmail}
            onChange={(e) => setForm((prev) => ({ ...prev, fatherEmail: e.target.value }))}
            error={showErrors && !form.fatherEmail.trim()}
            helperText={showErrors && !form.fatherEmail.trim() ? 'Required' : ' '}
          />
        </Stack>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}>
          <TextField
            fullWidth
            label="Father Phone"
            required
            value={form.fatherPhone}
            onChange={(e) => setForm((prev) => ({ ...prev, fatherPhone: e.target.value }))}
            InputProps={{ inputComponent: PhoneMaskInput }}
            error={showErrors && !form.fatherPhone.trim()}
            helperText={showErrors && !form.fatherPhone.trim() ? 'Required' : ' '}
          />
          <TextField
            fullWidth
            label="Father Occupation"
            placeholder="Optional"
            value={form.fatherOccupation}
            onChange={(e) => setForm((prev) => ({ ...prev, fatherOccupation: e.target.value }))}
          />
        </Stack>
      </Stack>

      <Stack spacing={0.8}>
        <Typography sx={{ fontWeight: 700 }}>Mother Details</Typography>
        <Divider />
      </Stack>

      <Stack spacing={1.6}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}>
          <TextField
            fullWidth
            label="Mother Full Name"
            value={form.motherName}
            onChange={(e) => setForm((prev) => ({ ...prev, motherName: e.target.value }))}
          />
          <TextField
            fullWidth
            label="Mother Email"
            value={form.motherEmail}
            onChange={(e) => setForm((prev) => ({ ...prev, motherEmail: e.target.value }))}
          />
        </Stack>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}>
          <TextField
            fullWidth
            label="Mother Phone"
            value={form.motherPhone}
            onChange={(e) => setForm((prev) => ({ ...prev, motherPhone: e.target.value }))}
            InputProps={{ inputComponent: PhoneMaskInput }}
          />
          <TextField
            fullWidth
            label="Mother Occupation"
            placeholder="Optional"
            value={form.motherOccupation}
            onChange={(e) => setForm((prev) => ({ ...prev, motherOccupation: e.target.value }))}
          />
        </Stack>
      </Stack>

      <Stack spacing={0.8}>
        <Typography sx={{ fontWeight: 700 }}>Emergency Contact</Typography>
        <Divider />
      </Stack>

      <TextField
        fullWidth
        label="Emergency Contact"
        required
        value={form.emergencyPhone}
        onChange={(e) => setForm((prev) => ({ ...prev, emergencyPhone: e.target.value }))}
        InputProps={{ inputComponent: PhoneMaskInput }}
        error={showErrors && !form.emergencyPhone.trim()}
        helperText={showErrors && !form.emergencyPhone.trim() ? 'Required' : ' '}
        sx={(theme) => ({
          '& .MuiOutlinedInput-root': {
            backgroundColor: theme.palette.warning.light,
            borderRadius: theme.shape.borderRadius,
          },
        })}
      />
    </Stack>
  </AppDialog>
);

export default StudentFormDialog;
