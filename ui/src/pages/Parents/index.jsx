import React, { useCallback, useEffect, useState } from 'react';
import { Box, Snackbar, Alert } from '@mui/material';
import ParentsView from './ParentsView';
import ParentDetailsDialog from './ParentDetailsDialog';
import { FILTER_ALL, USER_STATUS } from '../../constants/enums';
import { getParentById, listParents } from '../../services/parentService';

const LIMIT = 12;

const Parents = () => {
  const [parents, setParents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [q, setQ] = useState('');
  const [status, setStatus] = useState(FILTER_ALL);
  const [appliedQ, setAppliedQ] = useState('');
  const [appliedStatus, setAppliedStatus] = useState(FILTER_ALL);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedParent, setSelectedParent] = useState(null);

  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  const loadParents = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = { page, limit: LIMIT };
      if (appliedQ.trim()) params.q = appliedQ.trim();
      if (appliedStatus !== FILTER_ALL) params.status = appliedStatus;
      const response = await listParents(params);
      setParents(response.items || []);
      setTotal(response.pagination?.total || 0);
    } catch (err) {
      setError(err.message || 'Failed to load parents');
      setToast({ open: true, severity: 'error', message: err.message || 'Failed to load parents' });
    } finally {
      setLoading(false);
    }
  }, [page, appliedQ, appliedStatus]);

  useEffect(() => {
    loadParents();
  }, [loadParents]);

  const handleSearchSubmit = useCallback(
    (event) => {
      event.preventDefault();
      setAppliedQ(q);
      setAppliedStatus(status);
      setPage(1);
    },
    [q, status]
  );

  const openDetails = useCallback(async (parent) => {
    if (!parent?._id) return;
    try {
      const detail = await getParentById(parent._id);
      setSelectedParent(detail || parent);
      setDetailsOpen(true);
    } catch (err) {
      setToast({ open: true, severity: 'error', message: err.message || 'Failed to load parent details' });
    }
  }, []);

  return (
    <Box>
      <ParentsView
        q={q}
        setQ={setQ}
        status={status}
        setStatus={setStatus}
        handleSearchSubmit={handleSearchSubmit}
        error={error}
        parents={parents}
        openDetails={openDetails}
        page={page}
        setPage={setPage}
        totalPages={totalPages}
        total={total}
        loading={loading}
        FILTER_ALL={FILTER_ALL}
        USER_STATUS={USER_STATUS}
      />

      <ParentDetailsDialog
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        parent={selectedParent}
      />

      <Snackbar
        open={toast.open}
        autoHideDuration={2600}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          severity={toast.severity}
          variant="filled"
          onClose={() => setToast((prev) => ({ ...prev, open: false }))}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Parents;
