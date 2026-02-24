import React from 'react';
import { Divider, MenuItem, Stack, TextField, Typography } from '@mui/material';
import AppDialog from '../../components/common/AppDialog';

const AdminFormDialog = ({
  dialogOpen,
  setDialogOpen,
  dialogMode,
  submitting,
  handleDialogSubmit,
  form,
  setForm,
  USER_STATUS,
  showErrors,
}) => (
  <AppDialog
    open={dialogOpen}
    onClose={() => setDialogOpen(false)}
    title={dialogMode === 'create' ? 'Add Admin' : 'Edit Admin'}
    primaryAction={{
      label: submitting ? 'Saving...' : dialogMode === 'create' ? 'Create Admin' : 'Update Admin',
      onClick: handleDialogSubmit,
      disabled: submitting,
    }}
    secondaryAction={{ label: 'Cancel', onClick: () => setDialogOpen(false) }}
  >
    <Stack spacing={2.2}>
      <Stack spacing={0.8}>
        <Typography sx={{ fontWeight: 700 }}>Admin Details</Typography>
        <Divider />
      </Stack>

      <Stack spacing={1.5}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}>
          <TextField
            label="Full Name"
            fullWidth
            required
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            error={showErrors && !form.name.trim()}
            helperText={showErrors && !form.name.trim() ? 'Required' : ' '}
          />
          <TextField
            label="Email"
            fullWidth
            value={form.email}
            onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
            error={showErrors && !form.email.trim()}
            helperText={showErrors && !form.email.trim() ? 'Required' : ' '}
          />
        </Stack>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}>
          <TextField
            label="Phone"
            fullWidth
            value={form.phone}
            onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
          />
          {dialogMode === 'create' ? (
            <TextField
              label="Password"
              type="password"
              fullWidth
              required
              value={form.password}
              onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
              error={showErrors && !form.password.trim()}
              helperText={showErrors && !form.password.trim() ? 'Required' : ' '}
            />
          ) : (
            <TextField
              select
              label="Status"
              fullWidth
              value={form.status}
              onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}
            >
              <MenuItem value={USER_STATUS.ACTIVE}>Active</MenuItem>
              <MenuItem value={USER_STATUS.BLOCKED}>Blocked</MenuItem>
              <MenuItem value={USER_STATUS.SUSPENDED}>Suspended</MenuItem>
            </TextField>
          )}
        </Stack>
      </Stack>
    </Stack>
  </AppDialog>
);

export default AdminFormDialog;
