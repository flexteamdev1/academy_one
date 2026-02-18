import React from 'react';
import { Grid, MenuItem, TextField } from '@mui/material';
import AppDialog from '../../components/common/AppDialog';

const TeacherFormDialog = ({
  dialogOpen,
  setDialogOpen,
  dialogMode,
  submitting,
  handleDialogSubmit,
  form,
  setForm,
  TEACHER_STATUS,
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
    <Grid container spacing={1.3} sx={{ mt: 0.1 }}>
      <Grid item xs={12} sm={6}>
        <TextField label="First Name" fullWidth value={form.firstName} onChange={(e) => setForm((prev) => ({ ...prev, firstName: e.target.value }))} />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField label="Last Name" fullWidth value={form.lastName} onChange={(e) => setForm((prev) => ({ ...prev, lastName: e.target.value }))} />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField label="Employee ID" fullWidth value={form.employeeId} onChange={(e) => setForm((prev) => ({ ...prev, employeeId: e.target.value }))} />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField label="Email" fullWidth value={form.email} onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))} />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField label="Phone" fullWidth value={form.phone} onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))} />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField label="Qualification / Role" fullWidth value={form.qualification} onChange={(e) => setForm((prev) => ({ ...prev, qualification: e.target.value }))} />
      </Grid>
      <Grid item xs={12}>
        <TextField label="Subjects (comma separated)" fullWidth value={form.subjects} onChange={(e) => setForm((prev) => ({ ...prev, subjects: e.target.value }))} />
      </Grid>
      <Grid item xs={12} sm={4}>
        <TextField label="Experience (years)" type="number" fullWidth value={form.experience} onChange={(e) => setForm((prev) => ({ ...prev, experience: e.target.value }))} />
      </Grid>
      <Grid item xs={12} sm={4}>
        <TextField label="Joined At" type="date" fullWidth value={form.joinedAt} onChange={(e) => setForm((prev) => ({ ...prev, joinedAt: e.target.value }))} InputLabelProps={{ shrink: true }} />
      </Grid>
      <Grid item xs={12} sm={4}>
        <TextField select label="Status" fullWidth value={form.status} onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}>
          <MenuItem value={TEACHER_STATUS.ACTIVE}>Active</MenuItem>
          <MenuItem value={TEACHER_STATUS.INACTIVE}>On Leave</MenuItem>
        </TextField>
      </Grid>
    </Grid>
  </AppDialog>
);

export default TeacherFormDialog;
