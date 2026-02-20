import React from 'react';
import { Divider, MenuItem, Stack, TextField, Typography } from '@mui/material';
import AppDialog from '../../components/common/AppDialog';
import PhoneMaskInput from '../../components/common/PhoneMaskInput';

const TeacherFormDialog = ({
  dialogOpen,
  setDialogOpen,
  dialogMode,
  submitting,
  handleDialogSubmit,
  form,
  setForm,
  TEACHER_STATUS,
  showErrors,
}) => (
  <AppDialog
    open={dialogOpen}
    onClose={() => setDialogOpen(false)}
    title={dialogMode === 'create' ? 'Add Teacher' : 'Edit Teacher'}
    primaryAction={{
      label: submitting ? 'Saving...' : dialogMode === 'create' ? 'Create Teacher' : 'Update Teacher',
      onClick: handleDialogSubmit,
      disabled: submitting || !form.firstName.trim(),
    }}
    secondaryAction={{ label: 'Cancel', onClick: () => setDialogOpen(false) }}
  >
    <Stack spacing={2.2}>
      <Stack spacing={0.8}>
        <Typography sx={{ fontWeight: 700 }}>Teacher Details</Typography>
        <Divider />
      </Stack>

      <Stack spacing={1.5}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}>
          <TextField
            label="First Name"
            fullWidth
            value={form.firstName}
            onChange={(e) => setForm((prev) => ({ ...prev, firstName: e.target.value }))}
            error={showErrors && !form.firstName.trim()}
            helperText={showErrors && !form.firstName.trim() ? 'Required' : ' '}
          />
          <TextField label="Last Name" fullWidth value={form.lastName} onChange={(e) => setForm((prev) => ({ ...prev, lastName: e.target.value }))} />
        </Stack>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}>
          <TextField label="Email" fullWidth value={form.email} onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))} />
          <TextField label="Qualification / Role" fullWidth value={form.qualification} onChange={(e) => setForm((prev) => ({ ...prev, qualification: e.target.value }))} />
        </Stack>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}>
          <TextField
            label="Phone"
            name="phone"
            fullWidth
            value={form.phone}
            onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
            InputProps={{ inputComponent: PhoneMaskInput }}
          />
          <TextField label="Subjects (comma separated)" fullWidth value={form.subjects} onChange={(e) => setForm((prev) => ({ ...prev, subjects: e.target.value }))} />
        </Stack>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}>
          <TextField label="Experience (years)" type="number" fullWidth value={form.experience} onChange={(e) => setForm((prev) => ({ ...prev, experience: e.target.value }))} />
          <TextField label="Joined At" type="date" fullWidth value={form.joinedAt} onChange={(e) => setForm((prev) => ({ ...prev, joinedAt: e.target.value }))} InputLabelProps={{ shrink: true }} />
          <TextField select label="Status" fullWidth value={form.status} onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}>
            <MenuItem value={TEACHER_STATUS.ACTIVE}>Active</MenuItem>
            <MenuItem value={TEACHER_STATUS.INACTIVE}>On Leave</MenuItem>
          </TextField>
        </Stack>
      </Stack>
    </Stack>
  </AppDialog>
);

export default TeacherFormDialog;
