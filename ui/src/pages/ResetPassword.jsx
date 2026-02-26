import React, { useMemo, useState } from 'react';
import { Alert, Box, Button, Card, Stack, TextField, Typography } from '@mui/material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { resetPassword } from '../services/authService';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = useMemo(() => String(searchParams.get('token') || '').trim(), [searchParams]);
  const [form, setForm] = useState({ newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!token) {
      setError('Reset token is missing. Please use the link from your email.');
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      setError('New password and confirm password do not match.');
      return;
    }

    setLoading(true);
    try {
      const response = await resetPassword({ token, newPassword: form.newPassword });
      setSuccess(response?.message || 'Password reset successfully. You can now log in.');
      setForm({ newPassword: '', confirmPassword: '' });
      setTimeout(() => navigate('/login'), 1200);
    } catch (err) {
      setError(err.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
      <Card
        sx={{
          width: '100%',
          maxWidth: 480,
          p: { xs: 3, md: 4 },
          borderRadius: (theme) => theme.shape.borderRadius,
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Stack spacing={2} component="form" onSubmit={handleSubmit}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.6 }}>
              Reset Password
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Choose a new password for your account.
            </Typography>
          </Box>

          {success ? <Alert severity="success">{success}</Alert> : null}
          {error ? <Alert severity="error">{error}</Alert> : null}

          <TextField
            label="New Password"
            type="password"
            value={form.newPassword}
            onChange={(e) => setForm((prev) => ({ ...prev, newPassword: e.target.value }))}
            required
            helperText="Minimum 8 characters"
          />
          <TextField
            label="Confirm New Password"
            type="password"
            value={form.confirmPassword}
            onChange={(e) => setForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
            required
          />

          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? 'Updating...' : 'Update Password'}
          </Button>
        </Stack>
      </Card>
    </Box>
  );
};

export default ResetPassword;
