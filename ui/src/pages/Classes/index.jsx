import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Box, Snackbar } from '@mui/material';
import ClassOutlined from '@mui/icons-material/ClassOutlined';
import ViewModuleOutlined from '@mui/icons-material/ViewModuleOutlined';
import PeopleAltOutlined from '@mui/icons-material/PeopleAltOutlined';
import BadgeOutlined from '@mui/icons-material/BadgeOutlined';
import DeleteConfirmDialog from '../../components/common/DeleteConfirmDialog';
import {
  createClass,
  deleteClass,
  getClassMeta,
  getClassStats,
  listClasses,
  updateClass,
} from '../../services/classService';
import { CLASS_STATUS, FILTER_ALL, USER_ROLES } from '../../constants/enums';
import { getUserRole } from '../../utils/auth';
import { useUIState } from '../../context/UIContext';
import ClassesView from './ClassesView';
import ClassFormDialog from './ClassFormDialog';

const LIMIT = 10;

const createEmptySection = () => ({
  name: '',
  capacity: 40,
  classTeacherId: '',
  status: CLASS_STATUS.ACTIVE,
});

const createEmptyForm = () => ({
  name: '',
  academicYearId: '',
  status: CLASS_STATUS.ACTIVE,
  sections: [createEmptySection()],
});

const formatTeacherName = (teacher) => {
  if (!teacher) return 'Unassigned';
  return `${teacher.firstName || ''} ${teacher.lastName || ''}`.trim() || teacher.employeeId || 'Unassigned';
};

const Classes = () => {
  const { selectedAcademicYearId } = useUIState();
  const role = getUserRole();
  const canManage = role === USER_ROLES.SUPER_ADMIN || role === USER_ROLES.ADMIN;

  const [items, setItems] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    totalSections: 0,
    assignedStudents: 0,
    teacherCoverage: 0,
  });
  const [meta, setMeta] = useState({ academicYears: [], teachers: [] });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [q, setQ] = useState('');
  const [status, setStatus] = useState(FILTER_ALL);
  const [academicYearId, setAcademicYearId] = useState(FILTER_ALL);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState('create');
  const [editingId, setEditingId] = useState('');
  const [form, setForm] = useState(createEmptyForm());
  const [submitting, setSubmitting] = useState(false);
  const [showErrors, setShowErrors] = useState(false);

  const [deleteState, setDeleteState] = useState({ open: false, id: '', name: '' });
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState({ open: false, severity: 'success', message: '' });

  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  const metricCards = useMemo(
    () => [
      {
        key: 'total',
        label: 'Total Classes',
        value: stats.total || 0,
        icon: ClassOutlined,
        bg: 'pastelLavender',
        border: 'lavenderDark',
        color: 'purpleDeep',
      },
      {
        key: 'sections',
        label: 'Total Sections',
        value: stats.totalSections || 0,
        icon: ViewModuleOutlined,
        bg: 'pastelBlue',
        border: 'blueDark',
        color: 'infoDeep',
      },
      {
        key: 'students',
        label: 'Assigned Students',
        value: stats.assignedStudents || 0,
        icon: PeopleAltOutlined,
        bg: 'pastelMint',
        border: 'mintDark',
        color: 'successDeep',
      },
      {
        key: 'coverage',
        label: 'Teacher Coverage',
        value: `${stats.teacherCoverage || 0}%`,
        icon: BadgeOutlined,
        bg: 'amberSoft',
        border: 'stone200',
        color: 'warning.main',
      },
    ],
    [stats]
  );

  const loadMeta = useCallback(async () => {
    try {
      const response = await getClassMeta();
      setMeta({
        academicYears: response.academicYears || [],
        teachers: response.teachers || [],
      });
    } catch (err) {
      setToast({ open: true, severity: 'error', message: err.message || 'Failed to load metadata' });
    }
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const params = { page, limit: LIMIT };
      if (q.trim()) params.q = q.trim();
      if (status !== FILTER_ALL) params.status = status;
      if (academicYearId !== FILTER_ALL) params.academicYearId = academicYearId;

      const [listRes, statsRes] = await Promise.all([listClasses(params), getClassStats()]);

      setItems(listRes.items || []);
      setTotal(listRes.pagination?.total || 0);
      setStats(statsRes || {});
    } catch (err) {
      setError(err.message || 'Failed to load classes');
    } finally {
      setLoading(false);
    }
  }, [page, q, status, academicYearId]);

  useEffect(() => {
    loadMeta();
  }, [loadMeta]);

  useEffect(() => {
    loadData();
  }, [loadData, selectedAcademicYearId]);

  const handleSearchSubmit = useCallback((event) => {
    event.preventDefault();
    setPage(1);
    loadData();
  }, [loadData]);

  const openCreateDialog = useCallback(() => {
    setDialogMode('create');
    setEditingId('');
    setForm({
      ...createEmptyForm(),
      academicYearId: meta.academicYears[0]?._id || '',
    });
    setShowErrors(false);
    setDialogOpen(true);
  }, [meta.academicYears]);

  const openEditDialog = useCallback((item) => {
    setDialogMode('edit');
    setEditingId(item._id);
    setShowErrors(false);
    setForm({
      name: item.name || '',
      academicYearId: item.academicYearId?._id || '',
      status: item.status || CLASS_STATUS.ACTIVE,
      sections: (item.sections || []).map((section) => ({
        name: section.name || '',
        capacity: section.capacity || 40,
        classTeacherId: section.classTeacherId?._id || section.classTeacherId || '',
        status: section.status || CLASS_STATUS.ACTIVE,
      })),
    });
    setDialogOpen(true);
  }, []);

  const onChangeSection = useCallback((index, key, value) => {
    setForm((prev) => {
      const nextSections = [...prev.sections];
      nextSections[index] = {
        ...nextSections[index],
        [key]: value,
      };
      return { ...prev, sections: nextSections };
    });
  }, []);

  const addSectionRow = useCallback(() => {
    setForm((prev) => ({
      ...prev,
      sections: [...prev.sections, createEmptySection()],
    }));
  }, []);

  const removeSectionRow = useCallback((index) => {
    setForm((prev) => {
      if (prev.sections.length <= 1) return prev;
      return {
        ...prev,
        sections: prev.sections.filter((_, idx) => idx !== index),
      };
    });
  }, []);

  const handleDialogSubmit = useCallback(async () => {
    const sections = form.sections
      .map((section) => ({
        name: String(section.name || '').trim().toUpperCase(),
        capacity: Number(section.capacity) || 40,
        classTeacherId: section.classTeacherId || null,
        status: section.status || CLASS_STATUS.ACTIVE,
      }))
      .filter((section) => !!section.name);

    if (!form.name.trim()) {
      setShowErrors(true);
      setToast({ open: true, severity: 'error', message: 'Class name is required' });
      return;
    }

    if (!sections.length) {
      setShowErrors(true);
      setToast({ open: true, severity: 'error', message: 'Add at least one valid section' });
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        name: form.name.trim(),
        academicYearId: form.academicYearId || undefined,
        status: form.status,
        sections,
      };

      if (dialogMode === 'create') {
        await createClass(payload);
        setToast({ open: true, severity: 'success', message: 'Class created successfully' });
        setPage(1);
      } else {
        await updateClass(editingId, payload);
        setToast({ open: true, severity: 'success', message: 'Class updated successfully' });
      }

      setDialogOpen(false);
      setShowErrors(false);
      await loadData();
    } catch (err) {
      setToast({ open: true, severity: 'error', message: err.message || 'Unable to save class' });
    } finally {
      setSubmitting(false);
    }
  }, [dialogMode, editingId, form, loadData]);

  const handleDeleteClass = useCallback(async () => {
    setDeleting(true);

    try {
      await deleteClass(deleteState.id);
      setDeleteState({ open: false, id: '', name: '' });
      setToast({ open: true, severity: 'success', message: 'Class deleted successfully' });

      if (items.length === 1 && page > 1) {
        setPage((prev) => prev - 1);
      } else {
        await loadData();
      }
    } catch (err) {
      setToast({ open: true, severity: 'error', message: err.message || 'Unable to delete class' });
    } finally {
      setDeleting(false);
    }
  }, [deleteState.id, items.length, loadData, page]);

  return (
    <Box>
      <ClassesView
        canManage={canManage}
        openCreateDialog={openCreateDialog}
        metricCards={metricCards}
        q={q}
        setQ={setQ}
        handleSearchSubmit={handleSearchSubmit}
        academicYearId={academicYearId}
        setAcademicYearId={setAcademicYearId}
        status={status}
        setStatus={setStatus}
        meta={meta}
        FILTER_ALL={FILTER_ALL}
        CLASS_STATUS={CLASS_STATUS}
        error={error}
        items={items}
        formatTeacherName={formatTeacherName}
        openEditDialog={openEditDialog}
        setDeleteState={setDeleteState}
        page={page}
        setPage={setPage}
        totalPages={totalPages}
        total={total}
        LIMIT={LIMIT}
        loading={loading}
        onResetFilters={() => {
          setQ('');
          setStatus(FILTER_ALL);
          setAcademicYearId(FILTER_ALL);
          setPage(1);
        }}
      />

      <ClassFormDialog
        dialogOpen={dialogOpen}
        setDialogOpen={setDialogOpen}
        dialogMode={dialogMode}
        submitting={submitting}
        handleDialogSubmit={handleDialogSubmit}
        form={form}
        setForm={setForm}
        meta={meta}
        CLASS_STATUS={CLASS_STATUS}
        addSectionRow={addSectionRow}
        onChangeSection={onChangeSection}
        removeSectionRow={removeSectionRow}
        formatTeacherName={formatTeacherName}
        showErrors={showErrors}
      />

      <DeleteConfirmDialog
        open={deleteState.open}
        onClose={() => setDeleteState({ open: false, id: '', name: '' })}
        onConfirm={handleDeleteClass}
        confirming={deleting}
        title="Delete Class?"
        itemName={deleteState.name}
        description="Deleting this class will remove its section setup. Classes with assigned students cannot be deleted."
      />

      <Snackbar
        open={toast.open}
        autoHideDuration={2800}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setToast((prev) => ({ ...prev, open: false }))}
          severity={toast.severity}
          sx={{ width: '100%' }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Classes;
