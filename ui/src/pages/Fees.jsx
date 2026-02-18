import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Box, Chip, Stack, Typography } from '@mui/material';
import PageCard from '../components/common/PageCard';
import { getLinkedStudents } from '../services/userService';
import { useUIState } from '../context/UIContext';
import { getUserRole } from '../utils/auth';
import { FEE_PAYMENT_STATUS, USER_ROLES } from '../constants/enums';

const sampleHistory = [
  { id: 1, term: 'Term 1', amount: 1800, status: FEE_PAYMENT_STATUS.PAID, paidOn: '2026-01-07' },
  { id: 2, term: 'Transport', amount: 300, status: FEE_PAYMENT_STATUS.PAID, paidOn: '2026-01-07' },
  { id: 3, term: 'Term 2', amount: 1800, status: FEE_PAYMENT_STATUS.PENDING, paidOn: '-' },
];

const Fees = () => {
  const { selectedAcademicYearId } = useUIState();
  const role = getUserRole();
  const canUseMyEndpoint = role === USER_ROLES.STUDENT || role === USER_ROLES.PARENT;
  const [mode, setMode] = useState('');
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!canUseMyEndpoint) {
      setMode('admin');
      setItems([
        {
          _id: 'overview',
          name: 'School Fee Ledger',
          admissionNo: 'GLOBAL',
          grade: 'All',
          sectionName: 'All',
        },
      ]);
      return;
    }

    const load = async () => {
      setError('');
      try {
        const response = await getLinkedStudents();
        setMode(response.mode || '');
        setItems(response.items || []);
      } catch (err) {
        setError(err.message || 'Failed to load fee details');
      }
    };
    load();
  }, [canUseMyEndpoint, selectedAcademicYearId]);

  const title = useMemo(() => (mode === 'parent' ? 'Fee Details & History (Children)' : 'Fee Details & History'), [mode]);

  return (
    <Box>
      <Stack sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ mb: 0.6 }}>{title}</Typography>
        <Typography variant="subtitle1">
          View fee status, pending amounts, and payment history.
        </Typography>
      </Stack>

      {error ? <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> : null}

      <Stack spacing={1.5}>
        {items.map((student) => {
          const total = sampleHistory.reduce((sum, item) => sum + item.amount, 0);
          const paid = sampleHistory
            .filter((item) => item.status === FEE_PAYMENT_STATUS.PAID)
            .reduce((sum, item) => sum + item.amount, 0);
          const pending = total - paid;
          return (
            <PageCard key={student._id} sx={{ p: 2 }}>
              <Typography sx={{ fontWeight: 700, mb: 0.4 }}>{student.name}</Typography>
              <Typography sx={{ color: 'text.secondary', fontSize: '0.85rem', mb: 1.4 }}>
                {student.admissionNo} • {student.grade || 'N/A'}-{student.sectionName || 'N/A'}
              </Typography>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mb: 1.2 }}>
                <Chip label={`Total: $${total}`} />
                <Chip label={`Paid: $${paid}`} color="success" />
                <Chip label={`Pending: $${pending}`} color={pending > 0 ? 'warning' : 'success'} />
              </Stack>

              {sampleHistory.map((fee) => (
                <Stack
                  key={`${student._id}-${fee.id}`}
                  direction="row"
                  justifyContent="space-between"
                  sx={{ py: 0.8, borderTop: '1px solid', borderColor: 'divider' }}
                >
                  <Typography sx={{ fontSize: '0.9rem' }}>{fee.term}</Typography>
                  <Typography sx={{ fontSize: '0.9rem', color: 'text.secondary' }}>
                    ${fee.amount} • {fee.status} • {fee.paidOn}
                  </Typography>
                </Stack>
              ))}
            </PageCard>
          );
        })}
      </Stack>
    </Box>
  );
};

export default Fees;
