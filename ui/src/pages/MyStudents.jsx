import React, { useEffect, useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  CircularProgress,
  Stack,
  Typography,
} from '@mui/material';
import PageCard from '../components/common/PageCard';
import { getLinkedStudents } from '../services/userService';
import { useUIState } from '../context/UIContext';

const MyStudents = () => {
  const { selectedAcademicYearId } = useUIState();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mode, setMode] = useState('');
  const [items, setItems] = useState([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await getLinkedStudents();
        setMode(response.mode || '');
        setItems(response.items || []);
      } catch (err) {
        setError(err.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [selectedAcademicYearId]);

  if (loading) {
    return (
      <Box sx={{ py: 8, display: 'grid', placeItems: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Stack sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ mb: 0.5 }}>
          {mode === 'student' ? 'My Profile' : 'My Children'}
        </Typography>
        <Typography variant="subtitle1">
          {mode === 'student'
            ? 'View your student profile details.'
            : 'View linked student profiles under your parent account.'}
        </Typography>
      </Stack>

      {error ? <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> : null}

      <Stack spacing={2}>
        {items.map((student) => (
          <PageCard key={student._id} sx={{ p: 2 }}>
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.3 }}>
              <Avatar src={student.profilePhotoUrl || undefined}>
                {String(student.name || 'S').slice(0, 1).toUpperCase()}
              </Avatar>
              <Box>
                <Typography sx={{ fontWeight: 700 }}>{student.name}</Typography>
                <Typography sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>
                  {student.admissionNo} • {student.grade || 'N/A'}-{student.sectionName || 'N/A'}
                </Typography>
              </Box>
            </Stack>
            <Typography sx={{ fontSize: '0.9rem', color: 'text.secondary' }}>
              Status: {student.status}
            </Typography>
            <Typography sx={{ fontSize: '0.9rem', color: 'text.secondary' }}>
              Parent: {student.parentId ? `${student.parentId.firstName || ''} ${student.parentId.lastName || ''}`.trim() : 'N/A'}
            </Typography>
          </PageCard>
        ))}
        {!error && items.length === 0 ? (
          <PageCard sx={{ p: 3 }}>
            <Typography sx={{ textAlign: 'center', color: 'text.secondary' }}>
              No linked student records found.
            </Typography>
          </PageCard>
        ) : null}
      </Stack>
    </Box>
  );
};

export default MyStudents;
