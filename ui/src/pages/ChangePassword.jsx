import React, { useState } from 'react';
import { Alert, Box, Button, Stack, TextField, Typography } from '@mui/material';
import PageCard from '../components/common/PageCard';
import { changePassword } from '../services/authService';
import { getUserInfo, getUserRole, setStoredUserInfo } from '../utils/auth';

const ChangePassword = () => {
  const user = getUserInfo();
  const role = getUserRole();
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const submitPasswordChange = async (event) => {
    event.preventDefault();
    setSuccess('');
    setError('');

    if (form.newPassword !== form.confirmPassword) {
      setError('New password and confirm password do not match.');
      return;
    }

    setSaving(true);
    try {
      const response = await changePassword({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      setSuccess(response.message || 'Password changed');
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      const nextUser = { ...user, mustChangePassword: false };
      setStoredUserInfo(nextUser, Boolean(user?.remember));
    } catch (err) {
      setError(err.message || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box>
      <Stack sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ mb: 0.6 }}>
          Change Password
        </Typography>
        <Typography variant="subtitle1">
          Update your password for {user?.email || 'your account'}.
        </Typography>
      </Stack>

      <PageCard sx={{ p: 2 }}>
        <Stack spacing={1.4}>
          <Box>
            <Typography sx={{ fontWeight: 700 }}>{user?.name || 'User'}</Typography>
            <Typography sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>
              {user?.email || '-'} • {String(role || 'user').replace('_', ' ')}
            </Typography>
          </Box>

          {success ? <Alert severity="success">{success}</Alert> : null}
          {error ? <Alert severity="error">{error}</Alert> : null}

          <Stack component="form" spacing={1.2} onSubmit={submitPasswordChange}>
            <TextField
              type="password"
              label="Current Password"
              value={form.currentPassword}
              onChange={(e) => setForm((prev) => ({ ...prev, currentPassword: e.target.value }))}
              required
            />
            <TextField
              type="password"
              label="New Password"
              value={form.newPassword}
              onChange={(e) => setForm((prev) => ({ ...prev, newPassword: e.target.value }))}
              required
              helperText="Minimum 8 characters"
            />
            <TextField
              type="password"
              label="Confirm New Password"
              value={form.confirmPassword}
              onChange={(e) => setForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
              required
            />
            <Box>
              <Button type="submit" variant="contained" disabled={saving}>
                {saving ? 'Updating...' : 'Update Password'}
              </Button>
            </Box>
          </Stack>
        </Stack>
      </PageCard>
    </Box>
  );
};

export default ChangePassword;
