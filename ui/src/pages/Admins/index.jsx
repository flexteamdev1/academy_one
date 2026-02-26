import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Box, Snackbar } from '@mui/material';
import DeleteConfirmDialog from '../../components/common/DeleteConfirmDialog';
import { FILTER_ALL, USER_ROLES, USER_STATUS } from '../../constants/enums';
import { getUserRole } from '../../utils/auth';
import { createAdmin, deleteAdmin, listAdmins, updateAdmin } from '../../services/adminService';
import AdminsView from './AdminsView';
import AdminFormDialog from './AdminFormDialog';

const LIMIT = 10;

const emptyForm = {
  name: '',
  email: '',
  phone: '',
  status: USER_STATUS.ACTIVE,
};

const Admins = () => {
  const role = getUserRole();
  const canManage = role === USER_ROLES.SUPER_ADMIN;

  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [q, setQ] = useState('');
  const [status, setStatus] = useState(FILTER_ALL);
  const [appliedQ, setAppliedQ] = useState('');
  const [appliedStatus, setAppliedStatus] = useState(FILTER_ALL);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState('create');
  const [editingId, setEditingId] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [showErrors, setShowErrors] = useState(false);

  const [deleteState, setDeleteState] = useState({ open: false, id: '', name: '' });
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  const loadAdmins = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = { page, limit: LIMIT };
      if (appliedQ.trim()) params.q = appliedQ.trim();
      if (appliedStatus !== FILTER_ALL) params.status = appliedStatus;
      const response = await listAdmins(params);
      setAdmins(response.items || []);
      setTotal(response.pagination?.total || 0);
    } catch (err) {
      setError(err.message || 'Failed to load admins');
    } finally {
      setLoading(false);
    }
  }, [page, appliedQ, appliedStatus]);

  useEffect(() => {
    loadAdmins();
  }, [loadAdmins]);

  const handleSearchSubmit = useCallback((event) => {
    event.preventDefault();
    setAppliedQ(q);
    setAppliedStatus(status);
    setPage(1);
  }, [q, status]);

  const openCreateDialog = useCallback(() => {
    setDialogMode('create');
    setEditingId('');
    setForm(emptyForm);
    setShowErrors(false);
    setDialogOpen(true);
  }, []);

  const openEditDialog = useCallback((admin) => {
    setDialogMode('edit');
    setEditingId(admin._id);
    setForm({
      name: admin.name || '',
      email: admin.email || '',
      phone: admin.phone || '',
      password: '',
      status: admin.status || USER_STATUS.ACTIVE,
    });
    setShowErrors(false);
    setDialogOpen(true);
  }, []);

  const handleDialogSubmit = useCallback(async () => {
    if (!form.name.trim() || !form.email.trim()) {
      setShowErrors(true);
      setToast({ open: true, severity: 'error', message: 'Please complete all required fields' });
      return;
    }

    setSubmitting(true);
    try {
      const payload =
        dialogMode === 'create'
          ? {
              name: form.name.trim(),
              email: form.email.trim(),
            }
          : {
              name: form.name.trim(),
              email: form.email.trim(),
              phone: form.phone.trim(),
              status: form.status,
            };

      if (dialogMode === 'create') {
        await createAdmin(payload);
        setToast({ open: true, severity: 'success', message: 'Admin created successfully' });
        setPage(1);
      } else {
        await updateAdmin(editingId, payload);
        setToast({ open: true, severity: 'success', message: 'Admin updated successfully' });
      }

      setDialogOpen(false);
      setShowErrors(false);
      await loadAdmins();
    } catch (err) {
      setToast({ open: true, severity: 'error', message: err.message || 'Unable to save admin' });
    } finally {
      setSubmitting(false);
    }
  }, [dialogMode, editingId, form, loadAdmins]);

  const handleDelete = useCallback(async () => {
    try {
      await deleteAdmin(deleteState.id);
      setToast({ open: true, severity: 'success', message: 'Admin deleted successfully' });
      setDeleteState({ open: false, id: '', name: '' });
      await loadAdmins();
    } catch (err) {
      setToast({ open: true, severity: 'error', message: err.message || 'Unable to delete admin' });
    }
  }, [deleteState.id, loadAdmins]);

  return (
    <Box>
      <AdminsView
        canManage={canManage}
        openCreateDialog={openCreateDialog}
        q={q}
        setQ={setQ}
        handleSearchSubmit={handleSearchSubmit}
        status={status}
        setStatus={setStatus}
        FILTER_ALL={FILTER_ALL}
        USER_STATUS={USER_STATUS}
        error={error}
        admins={admins}
        openEditDialog={openEditDialog}
        setDeleteState={setDeleteState}
        page={page}
        setPage={setPage}
        totalPages={totalPages}
        total={total}
        loading={loading}
      />

      {canManage ? (
        <>
          <AdminFormDialog
            dialogOpen={dialogOpen}
            setDialogOpen={setDialogOpen}
            dialogMode={dialogMode}
            submitting={submitting}
            handleDialogSubmit={handleDialogSubmit}
            form={form}
            setForm={setForm}
            USER_STATUS={USER_STATUS}
            showErrors={showErrors}
          />

          <DeleteConfirmDialog
            open={deleteState.open}
            onClose={() => setDeleteState({ open: false, id: '', name: '' })}
            onConfirm={handleDelete}
            title="Delete Admin?"
            itemName={deleteState.name}
            description={`You are about to remove ${deleteState.name || 'this admin'} from the system.`}
            confirmLabel="Delete"
            cancelLabel="Keep Account"
          />
        </>
      ) : null}

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

export default Admins;
