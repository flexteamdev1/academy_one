import React from 'react';
import {
  Avatar,
  Button,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import AppDialog from '../../components/common/AppDialog';

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
    <Stack spacing={2}>
      <Typography sx={{ fontWeight: 700 }}>Student Details</Typography>
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

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} alignItems="center">
        <Button variant="outlined" component="label">
          Upload Profile Photo
          <input hidden type="file" accept="image/*" onChange={(e) => handlePhotoChange(e.target.files?.[0] || null)} />
        </Button>
        {dialogMode === 'edit' ? (
          <Button variant="text" color="error" onClick={handleRemovePhoto} disabled={!photoPreview}>
            Remove Photo
          </Button>
        ) : null}
        {photoPreview ? <Avatar src={photoPreview} sx={{ width: 58, height: 58 }} /> : null}
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

      {dialogMode === 'create' ? (
        <>
          <Typography sx={{ fontWeight: 700, pt: 1 }}>Parent Details</Typography>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}>
            <TextField fullWidth label="Parent First Name" value={form.parentFirstName} onChange={(e) => setForm((prev) => ({ ...prev, parentFirstName: e.target.value }))} />
            <TextField fullWidth label="Parent Last Name" value={form.parentLastName} onChange={(e) => setForm((prev) => ({ ...prev, parentLastName: e.target.value }))} />
          </Stack>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}>
            <TextField fullWidth label="Parent Email" value={form.parentEmail} onChange={(e) => setForm((prev) => ({ ...prev, parentEmail: e.target.value }))} />
            <TextField fullWidth label="Parent Phone" value={form.parentPhone} onChange={(e) => setForm((prev) => ({ ...prev, parentPhone: e.target.value }))} />
          </Stack>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}>
            <TextField fullWidth label="Relation" placeholder="Father / Mother / Guardian" value={form.parentRelation} onChange={(e) => setForm((prev) => ({ ...prev, parentRelation: e.target.value }))} />
            <TextField fullWidth label="Occupation" value={form.parentOccupation} onChange={(e) => setForm((prev) => ({ ...prev, parentOccupation: e.target.value }))} />
          </Stack>
          <TextField fullWidth label="Emergency Contact" value={form.parentEmergencyContact} onChange={(e) => setForm((prev) => ({ ...prev, parentEmergencyContact: e.target.value }))} />
        </>
      ) : null}
    </Stack>
  </AppDialog>
);

export default StudentFormDialog;
