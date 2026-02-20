import React, { useEffect, useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import PageCard from '../components/common/PageCard';
import { changePassword } from '../services/authService';
import { useUIState } from '../context/UIContext';
import { getLinkedStudents } from '../services/userService';
import { getUserInfo, getUserRole } from '../utils/auth';

const Profile = () => {
  const { selectedAcademicYearId } = useUIState();
  const role = getUserRole();
  const user = getUserInfo();
  const [items, setItems] = useState([]);
  const [loadError, setLoadError] = useState('');
  const [form, setForm] = useState({ currentPassword: '', newPassword: '' });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const isStudentOrParent = role === 'student' || role === 'parent';
  const mustChangePassword = !!user?.mustChangePassword;

  useEffect(() => {
    if (!isStudentOrParent) return;

    const load = async () => {
      setLoadError('');
      try {
        const response = await getLinkedStudents();
        setItems(response.items || []);
      } catch (err) {
        setLoadError(err.message || 'Failed to load profile details');
      }
    };

    load();
  }, [isStudentOrParent, selectedAcademicYearId]);

  const submitPasswordChange = async (event) => {
    event.preventDefault();
    setSuccess('');
    setError('');
    try {
      const response = await changePassword(form);
      setSuccess(response.message || 'Password changed');
      setForm({ currentPassword: '', newPassword: '' });
      const nextUser = { ...user, mustChangePassword: false };
      localStorage.setItem('userInfo', JSON.stringify(nextUser));
    } catch (err) {
      setError(err.message || 'Failed to change password');
    }
  };

  return (
    <Box>
      <Stack sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ mb: 0.6 }}>Profile</Typography>
        <Typography variant="subtitle1">View your profile and change password.</Typography>
      </Stack>

      <PageCard sx={{ p: 2, mb: 2 }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Avatar sx={{ width: 46, height: 46 }}>
            {String(user?.name || 'U').slice(0, 1).toUpperCase()}
          </Avatar>
          <Box>
            <Typography sx={{ fontWeight: 700 }}>{user?.name || 'User'}</Typography>
            <Typography sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>
              {user?.email || '-'} • {String(role || 'user').replace('_', ' ')}
            </Typography>
          </Box>
        </Stack>
      </PageCard>

      {isStudentOrParent ? (
        <PageCard sx={{ p: 2, mb: 2 }}>
          <Typography sx={{ fontWeight: 700, mb: 1.2 }}>
            {role === 'parent' ? 'Linked Students' : 'Student Profile'}
          </Typography>
          {loadError ? <Alert severity="error" sx={{ mb: 1.2 }}>{loadError}</Alert> : null}
          <Stack spacing={1}>
            {items.map((student) => (
              <Box
                key={student._id}
                sx={(theme) => ({
                  p: 1.2,
                  borderRadius: theme.shape.borderRadius,
                  border: '1px solid',
                  borderColor: 'divider',
                })}
              >
                <Typography sx={{ fontWeight: 600 }}>{student.name}</Typography>
                <Typography sx={{ color: 'text.secondary', fontSize: '0.84rem' }}>
                  {student.admissionNo} • {student.grade || 'N/A'}-{student.sectionName || 'N/A'} • {student.status}
                </Typography>
              </Box>
            ))}
          </Stack>
        </PageCard>
      ) : null}

      <PageCard sx={{ p: 2 }}>
        <Typography sx={{ fontWeight: 700, mb: 0.8 }}>Change Password</Typography>
        {mustChangePassword ? (
          <Alert severity="warning" sx={{ mb: 1.2 }}>
            You must change your password to continue.
          </Alert>
        ) : null}
        {success ? <Alert severity="success" sx={{ mb: 1.2 }}>{success}</Alert> : null}
        {error ? <Alert severity="error" sx={{ mb: 1.2 }}>{error}</Alert> : null}
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
          <Box>
            <Button type="submit" variant="contained">Update Password</Button>
          </Box>
        </Stack>
      </PageCard>
    </Box>
  );
};

export default Profile;
