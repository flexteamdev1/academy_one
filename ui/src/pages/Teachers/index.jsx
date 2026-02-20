import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Box, Snackbar } from '@mui/material';
import DeleteConfirmDialog from '../../components/common/DeleteConfirmDialog';
import {
  createTeacher,
  deleteTeacher,
  getTeacherStats,
  listTeachers,
  updateTeacher,
} from '../../services/teacherService';
import { FILTER_ALL, TEACHER_STATUS } from '../../constants/enums';
import TeachersView from './TeachersView';
import TeacherFormDialog from './TeacherFormDialog';
import TeacherDetailsDialog from './TeacherDetailsDialog';

const LIMIT = 12;

const emptyForm = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  qualification: '',
  subjects: '',
  experience: '',
  joinedAt: '',
  status: TEACHER_STATUS.ACTIVE,
};

const formatJoined = (value) => {
  if (!value) return 'N/A';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'N/A';
  return `Joined ${date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`;
};

const colorTrack = ['pastelLavender', 'pastelBlue', 'pastelRose', 'pastelMint'];

const Teachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [stats, setStats] = useState({ active: 0, departments: 0, certified: 0, onLeave: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [status, setStatus] = useState(FILTER_ALL);
  const [appliedSearchQuery, setAppliedSearchQuery] = useState('');
  const [appliedStatus, setAppliedStatus] = useState(FILTER_ALL);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState('create');
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [viewTeacher, setViewTeacher] = useState(null);

  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: '', name: '' });
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  const loadTeachers = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const params = { page, limit: LIMIT };
      if (appliedSearchQuery.trim()) params.q = appliedSearchQuery.trim();
      if (appliedStatus !== FILTER_ALL) params.status = appliedStatus;

      const [listRes, statsRes] = await Promise.all([listTeachers(params), getTeacherStats()]);

      setTeachers(listRes.items || []);
      setTotal(listRes.pagination?.total || 0);
      setStats(statsRes || { active: 0, departments: 0, certified: 0, onLeave: 0, total: 0 });
    } catch (err) {
      setError(err.message || 'Failed to load teachers');
    } finally {
      setLoading(false);
    }
  }, [page, appliedStatus, appliedSearchQuery]);

  useEffect(() => {
    loadTeachers();
  }, [loadTeachers]);

  const handleSearchSubmit = useCallback((event) => {
    event.preventDefault();
    setAppliedSearchQuery(searchQuery);
    setAppliedStatus(status);
    setPage(1);
  }, [searchQuery, status]);

  const openCreateDialog = useCallback(() => {
    setDialogMode('create');
    setEditingId('');
    setForm(emptyForm);
    setShowErrors(false);
    setDialogOpen(true);
  }, []);

  const openEditDialog = useCallback((teacher) => {
    setDialogMode('edit');
    setEditingId(teacher._id);
    setShowErrors(false);
    setForm({
      firstName: teacher.firstName || '',
      lastName: teacher.lastName || '',
      email: teacher.email || '',
      phone: teacher.phone || '',
      qualification: teacher.qualification || '',
      subjects: (teacher.subjects || []).join(', '),
      experience: teacher.experience ?? '',
      joinedAt: teacher.joinedAt ? new Date(teacher.joinedAt).toISOString().slice(0, 10) : '',
      status: teacher.status || TEACHER_STATUS.ACTIVE,
    });
    setDialogOpen(true);
  }, []);

  const openViewDialog = useCallback((teacher) => {
    setViewTeacher(teacher);
    setViewDialogOpen(true);
  }, []);

  const handleDialogSubmit = useCallback(async () => {
    if (!form.firstName.trim()) {
      setShowErrors(true);
      setToast({ open: true, severity: 'error', message: 'First name is required' });
      return;
    }
    setSubmitting(true);

    try {
      const payload = {
        ...form,
        subjects: form.subjects,
        experience: form.experience === '' ? undefined : Number(form.experience),
        joinedAt: form.joinedAt || undefined,
      };

      if (dialogMode === 'create') {
        await createTeacher(payload);
        setToast({ open: true, severity: 'success', message: 'Teacher created successfully' });
      } else {
        await updateTeacher(editingId, payload);
        setToast({ open: true, severity: 'success', message: 'Teacher updated successfully' });
      }

      setDialogOpen(false);
      setShowErrors(false);
      await loadTeachers();
    } catch (err) {
      setToast({
        open: true,
        severity: 'error',
        message: err.message || 'Unable to save teacher',
      });
    } finally {
      setSubmitting(false);
    }
  }, [dialogMode, editingId, form, loadTeachers]);

  const handleDelete = useCallback(async () => {
    try {
      await deleteTeacher(confirmDelete.id);
      setToast({ open: true, severity: 'success', message: 'Teacher deleted successfully' });
      setConfirmDelete({ open: false, id: '', name: '' });
      await loadTeachers();
    } catch (err) {
      setToast({
        open: true,
        severity: 'error',
        message: err.message || 'Unable to delete teacher',
      });
    }
  }, [confirmDelete.id, loadTeachers]);

  return (
    <Box>
      <TeachersView
        stats={stats}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        status={status}
        setStatus={setStatus}
        handleSearchSubmit={handleSearchSubmit}
        openCreateDialog={openCreateDialog}
        error={error}
        loading={loading}
        teachers={teachers}
        openEditDialog={openEditDialog}
        openViewDialog={openViewDialog}
        setConfirmDelete={setConfirmDelete}
        formatJoined={formatJoined}
        colorTrack={colorTrack}
        page={page}
        setPage={setPage}
        total={total}
        totalPages={totalPages}
        FILTER_ALL={FILTER_ALL}
        TEACHER_STATUS={TEACHER_STATUS}
      />

      <TeacherFormDialog
        dialogOpen={dialogOpen}
        setDialogOpen={setDialogOpen}
        dialogMode={dialogMode}
        submitting={submitting}
        handleDialogSubmit={handleDialogSubmit}
        form={form}
        setForm={setForm}
        TEACHER_STATUS={TEACHER_STATUS}
        showErrors={showErrors}
      />

      <TeacherDetailsDialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        teacher={viewTeacher}
        onEdit={() => {
          if (!viewTeacher) return;
          setViewDialogOpen(false);
          openEditDialog(viewTeacher);
        }}
      />

      <DeleteConfirmDialog
        open={confirmDelete.open}
        onClose={() => setConfirmDelete({ open: false, id: '', name: '' })}
        onConfirm={handleDelete}
        title="Delete Teacher Record?"
        itemName={confirmDelete.name}
        description={`You are about to remove ${confirmDelete.name || 'this teacher'} from faculty records. This action is permanent and cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Keep Record"
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

export default Teachers;
