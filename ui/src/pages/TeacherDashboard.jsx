import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Box, Chip, CircularProgress, Stack, Typography } from '@mui/material';
import PageCard from '../components/common/PageCard';
import { listClasses } from '../services/classService';
import { useUIState } from '../context/UIContext';
import { getUserInfo } from '../utils/auth';
import { CLASS_STATUS } from '../constants/enums';

const TeacherDashboard = () => {
  const { selectedAcademicYearId } = useUIState();
  const user = getUserInfo();
  const teacherName = user?.name || 'Teacher';
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [items, setItems] = useState([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await listClasses({ page: 1, limit: 100, status: CLASS_STATUS.ACTIVE });
        const classes = response.items || [];
        setItems(classes);
      } catch (err) {
        setError(err.message || 'Failed to load assigned classes');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [selectedAcademicYearId]);

  const sectionCount = useMemo(
    () => items.reduce((sum, item) => sum + (item.sections?.length || 0), 0),
    [items]
  );

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
        <Typography variant="h4" sx={{ mb: 0.6 }}>
          Welcome, {teacherName}
        </Typography>
        <Typography variant="subtitle1">
          Dashboard with your assigned classes and active sections.
        </Typography>
      </Stack>

      {error ? <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> : null}

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
        <PageCard sx={{ p: 2, flex: 1 }}>
          <Typography sx={{ fontSize: '0.78rem', color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
            Active Classes
          </Typography>
          <Typography sx={{ fontSize: '2rem', fontWeight: 800 }}>{items.length}</Typography>
        </PageCard>
        <PageCard sx={{ p: 2, flex: 1 }}>
          <Typography sx={{ fontSize: '0.78rem', color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
            Active Sections
          </Typography>
          <Typography sx={{ fontSize: '2rem', fontWeight: 800 }}>{sectionCount}</Typography>
        </PageCard>
      </Stack>

      <Stack spacing={1.5}>
        {items.map((item) => (
          <PageCard key={item._id} sx={{ p: 2 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={1}>
              <Box>
                <Typography sx={{ fontWeight: 700 }}>{item.name}</Typography>
                <Typography sx={{ color: 'text.secondary', fontSize: '0.88rem' }}>
                  Academic Year: {item.academicYearId?.name || 'N/A'}
                </Typography>
              </Box>
              <Stack direction="row" spacing={0.8} flexWrap="wrap">
                {(item.sections || []).map((section) => (
                  <Chip
                    key={`${item._id}-${section.name}`}
                    size="small"
                    label={`Section ${section.name} (${section.capacity || 0})`}
                    sx={{ fontWeight: 600 }}
                  />
                ))}
              </Stack>
            </Stack>
          </PageCard>
        ))}
      </Stack>

      {!error && items.length === 0 ? (
        <PageCard sx={{ p: 3, mt: 2 }}>
          <Typography sx={{ textAlign: 'center', color: 'text.secondary' }}>
            No classes assigned yet.
          </Typography>
        </PageCard>
      ) : null}
    </Box>
  );
};

export default TeacherDashboard;
