import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Box, Snackbar } from '@mui/material';
import PersonOutlined from '@mui/icons-material/PersonOutlined';
import VerifiedUserOutlined from '@mui/icons-material/VerifiedUserOutlined';
import UpcomingOutlined from '@mui/icons-material/UpcomingOutlined';
import DeleteConfirmDialog from '../../components/common/DeleteConfirmDialog';
import {
  createStudent,
  deleteStudent,
  getStudentStats,
  listStudents,
  updateStudent,
  resetStudentPassword,
} from '../../services/studentService';
import { listClasses } from '../../services/classService';
import { getUserRole } from '../../utils/auth';
import { useUIState } from '../../context/UIContext';
import { FILTER_ALL, STUDENT_GENDER, STUDENT_STATUS, USER_ROLES } from '../../constants/enums';
import StudentsView from './StudentsView';
import StudentFormDialog from './StudentCreateDialog';
import StudentDetailsDialog from './StudentDetailsDialog';
import ResetPasswordDialog from './ResetPasswordDialog';

const LIMIT = 10;

const emptyForm = {
  name: '',
  email: '',
  gender: STUDENT_GENDER.MALE,
  dob: '',
  classId: '',
  grade: '',
  sectionName: '',
  status: STUDENT_STATUS.ACTIVE,
  bloodGroup: '',
  fullAddress: '',
  fatherName: '',
  fatherEmail: '',
  fatherPhone: '',
  fatherOccupation: '',
  motherName: '',
  motherEmail: '',
  motherPhone: '',
  motherOccupation: '',
  emergencyPhone: '',
  profilePhoto: null,
  removeProfilePhoto: false,
};

const formatAddress = (address) => {
  if (!address) return '';
  const parts = [
    address.street,
    address.city,
    address.state,
    address.zip,
    address.country,
  ].map((item) => String(item || '').trim()).filter(Boolean);
  return parts.join(', ');
};

const metricSpec = [
  {
    key: 'attendanceRate',
    title: 'Attendance (Today)',
    icon: PersonOutlined,
    container: 'pastelMint',
    border: 'mintDark',
    iconColor: 'successMain',
    textColor: 'successDeep',
    formatter: (value) => `${value || 0}%`,
  },
  {
    key: 'verifiedProfiles',
    title: 'Verified Profiles',
    icon: VerifiedUserOutlined,
    container: 'pastelBlue',
    border: 'blueDark',
    iconColor: 'infoMain',
    textColor: 'infoDeep',
    formatter: (value) => `${value || 0}%`,
  },
  {
    key: 'newEnrollments',
    title: 'New Enrollments',
    icon: UpcomingOutlined,
    container: 'pastelLavender',
    border: 'lavenderDark',
    iconColor: 'lavenderMain',
    textColor: 'purpleDeep',
    formatter: (value) => `${value || 0}`,
  },
];

const statusChipSx = (status, theme) => {
  if (status === STUDENT_STATUS.ACTIVE) {
    return {
      backgroundColor: theme.palette.success.light,
      color: theme.palette.success.main,
      borderColor: theme.palette.success.main,
    };
  }
  if (status === STUDENT_STATUS.BLOCKED) {
    return {
      backgroundColor: theme.palette.error.light,
      color: theme.palette.error.main,
      borderColor: theme.palette.error.main,
    };
  }

  return {
    backgroundColor: theme.palette.grey[100],
    color: theme.palette.grey[500],
    borderColor: theme.palette.grey[200],
  };
};

const Students = () => {
  const { selectedAcademicYearId } = useUIState();
  const role = getUserRole();
  const canManage = role === USER_ROLES.SUPER_ADMIN || role === USER_ROLES.ADMIN;
  const canResetPassword = [USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.TEACHER].includes(role);
  const [students, setStudents] = useState([]);
  const [stats, setStats] = useState({
    attendanceRate: 0,
    verifiedProfiles: 0,
    newEnrollments: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [q, setQ] = useState('');
  const [grade, setGrade] = useState(FILTER_ALL);
  const [section, setSection] = useState(FILTER_ALL);
  const [status, setStatus] = useState(FILTER_ALL);
  const [appliedQ, setAppliedQ] = useState('');
  const [appliedGrade, setAppliedGrade] = useState(FILTER_ALL);
  const [appliedSection, setAppliedSection] = useState(FILTER_ALL);
  const [appliedStatus, setAppliedStatus] = useState(FILTER_ALL);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState('create');
  const [editingId, setEditingId] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [showErrors, setShowErrors] = useState(false);
  const [photoPreview, setPhotoPreview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [viewStudent, setViewStudent] = useState(null);
  const [dispatchInfo, setDispatchInfo] = useState(null);
  const [classCatalog, setClassCatalog] = useState([]);

  const [deleteState, setDeleteState] = useState({ open: false, id: '', name: '' });
  const [resetState, setResetState] = useState({ open: false, id: '', name: '', email: '' });
  const [resetting, setResetting] = useState(false);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const params = { page, limit: LIMIT };
      if (appliedQ.trim()) params.q = appliedQ.trim();
      if (appliedGrade !== FILTER_ALL) params.grade = appliedGrade;
      if (appliedSection !== FILTER_ALL) params.section = appliedSection;
      if (appliedStatus !== FILTER_ALL) params.status = appliedStatus;

      const [listRes, statsRes] = await Promise.all([
        listStudents(params),
        getStudentStats(),
      ]);

      setStudents(listRes.items || []);
      setTotal(listRes.pagination?.total || 0);
      setStats(statsRes || {});
    } catch (err) {
      setError(err.message || 'Failed to load students');
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, appliedGrade, appliedSection, appliedStatus, appliedQ, selectedAcademicYearId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    return () => {
      if (photoPreview) URL.revokeObjectURL(photoPreview);
    };
  }, [photoPreview]);

  const gradeOptions = useMemo(() => {
    const values = new Set(students.map((item) => item.grade).filter(Boolean));
    return Array.from(values).sort();
  }, [students]);

  const sectionOptions = useMemo(() => {
    const values = new Set(students.map((item) => item.sectionName).filter(Boolean));
    return Array.from(values).sort();
  }, [students]);

  const handleSearchSubmit = useCallback((event) => {
    event.preventDefault();
    setAppliedQ(q);
    setAppliedGrade(grade);
    setAppliedSection(section);
    setAppliedStatus(status);
    setPage(1);
  }, [grade, q, section, status]);

  const openCreateDialog = useCallback(() => {
    setForm(emptyForm);
    setShowErrors(false);
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoPreview('');
    setDialogMode('create');
    setEditingId('');
    setDialogOpen(true);
  }, [photoPreview]);

  const openEditDialog = useCallback((student) => {
    setDialogMode('edit');
    setEditingId(student._id);
    setShowErrors(false);
    const parentRecord = student.parentId || {};
    const parentFullName = [parentRecord.firstName, parentRecord.lastName].filter(Boolean).join(' ');
    setForm({
      ...emptyForm,
      name: student.name || '',
      email: student.email || '',
      gender: student.gender || STUDENT_GENDER.MALE,
      dob: student.dob ? String(student.dob).slice(0, 10) : '',
      classId: student.classId || '',
      grade: student.grade || '',
      sectionName: student.sectionName || '',
      status: student.status || STUDENT_STATUS.ACTIVE,
      bloodGroup: student.bloodGroup || '',
      fullAddress: formatAddress(student.address),
      fatherName: student.fatherName || parentFullName || '',
      fatherEmail: student.fatherEmail || parentRecord.email || '',
      fatherPhone: student.fatherPhone || parentRecord.phone || '',
      fatherOccupation: student.fatherOccupation || '',
      motherName: student.motherName || '',
      motherEmail: student.motherEmail || '',
      motherPhone: student.motherPhone || '',
      motherOccupation: student.motherOccupation || '',
      emergencyPhone: student.emergencyPhone || parentRecord.emergencyContact || '',
      profilePhoto: null,
      removeProfilePhoto: false,
    });
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoPreview(student.profilePhotoUrl || '');
    setDialogOpen(true);
  }, [photoPreview]);

  const openViewDialog = useCallback((student) => {
    setViewStudent(student);
    setViewDialogOpen(true);
  }, []);

  const handlePhotoChange = (file) => {
    setForm((prev) => ({ ...prev, profilePhoto: file || null, removeProfilePhoto: false }));
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoPreview(file ? URL.createObjectURL(file) : '');
  };

  const handleRemovePhoto = () => {
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoPreview('');
    setForm((prev) => ({ ...prev, profilePhoto: null, removeProfilePhoto: true }));
  };

  const handleSubmitStudent = async () => {
    if (!form.name.trim() || !form.dob || !form.grade || !form.sectionName || !form.fatherName.trim() || !form.fatherEmail.trim() || !form.fatherPhone.trim() || !form.emergencyPhone.trim()) {
      setShowErrors(true);
      setToast({ open: true, severity: 'error', message: 'Please complete all required fields' });
      return;
    }

    setSubmitting(true);

    try {
      const trimmedFullAddress = form.fullAddress.trim();

      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        gender: form.gender,
        dob: form.dob,
        classId: form.classId || undefined,
        grade: form.grade.trim(),
        sectionName: form.sectionName.trim().toUpperCase(),
        profilePhoto: form.profilePhoto,
        status: dialogMode === 'edit' ? form.status : undefined,
        removeProfilePhoto: dialogMode === 'edit' ? form.removeProfilePhoto : undefined,
        bloodGroup: form.bloodGroup.trim() || undefined,
        address: trimmedFullAddress ? { street: trimmedFullAddress } : undefined,
        fatherName: form.fatherName.trim(),
        fatherEmail: form.fatherEmail.trim(),
        fatherPhone: form.fatherPhone.trim(),
        fatherOccupation: form.fatherOccupation.trim() || undefined,
        motherName: form.motherName.trim() || undefined,
        motherEmail: form.motherEmail.trim() || undefined,
        motherPhone: form.motherPhone.trim() || undefined,
        motherOccupation: form.motherOccupation.trim() || undefined,
        emergencyPhone: form.emergencyPhone.trim(),
      };

      if (dialogMode === 'create') {
        const response = await createStudent(payload);
        setDispatchInfo(response.accountDispatch || null);
        setToast({ open: true, severity: 'success', message: 'Student created successfully' });
        setPage(1);
      } else {
        await updateStudent(editingId, payload);
        setToast({ open: true, severity: 'success', message: 'Student updated successfully' });
      }

      setDialogOpen(false);
      setShowErrors(false);
      await loadData();
    } catch (err) {
      setToast({ open: true, severity: 'error', message: err.message || 'Unable to save student' });
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    const loadClassCatalog = async () => {
      try {
        const response = await listClasses({
          page: 1,
          limit: 100,
          status: STUDENT_STATUS.ACTIVE,
        });
        setClassCatalog(response.items || []);
      } catch (_error) {
        setClassCatalog([]);
      }
    };

    loadClassCatalog();
  }, []);

  const dialogGradeOptions = useMemo(() => {
    const values = new Set(classCatalog.map((item) => String(item.name || '').trim()).filter(Boolean));
    return Array.from(values).sort();
  }, [classCatalog]);

  const dialogSectionOptions = useMemo(() => {
    if (!form.grade) return [];

    const matchedClasses = classCatalog.filter((item) => String(item.name || '').trim() === form.grade);
    const values = new Set();
    matchedClasses.forEach((item) => {
      (item.sections || []).forEach((sectionItem) => {
        const sectionName = String(sectionItem.name || '').trim().toUpperCase();
        if (sectionName) values.add(sectionName);
      });
    });

    return Array.from(values).sort();
  }, [classCatalog, form.grade]);

  const resolveClassId = (nextGrade, nextSection) => {
    if (!nextGrade || !nextSection) return '';
    const matched = classCatalog.find(
      (item) =>
        String(item.name || '').trim() === nextGrade &&
        (item.sections || []).some(
          (sectionItem) => String(sectionItem.name || '').trim().toUpperCase() === nextSection
        )
    );
    return matched?._id || '';
  };

  const handleDeleteStudent = async () => {
    try {
      await deleteStudent(deleteState.id);
      setDeleteState({ open: false, id: '', name: '' });
      setToast({ open: true, severity: 'success', message: 'Student deleted successfully' });
      await loadData();
    } catch (err) {
      setToast({ open: true, severity: 'error', message: err.message || 'Unable to delete student' });
    }
  };

  const handleResetPassword = async () => {
    if (!resetState.id) return;
    setResetting(true);
    try {
      const res = await resetStudentPassword(resetState.id);
      setToast({
        open: true,
        severity: 'success',
        message: res?.message || 'Temporary password sent to parent email',
      });
      setResetState({ open: false, id: '', name: '', email: '' });
    } catch (err) {
      setToast({
        open: true,
        severity: 'error',
        message: err.message || 'Unable to reset student password',
      });
    } finally {
      setResetting(false);
    }
  };

  return (
    <Box>
      <StudentsView
        canManage={canManage}
        openCreateDialog={openCreateDialog}
        openViewDialog={openViewDialog}
        dispatchInfo={dispatchInfo}
        q={q}
        setQ={setQ}
        handleSearchSubmit={handleSearchSubmit}
        grade={grade}
        setGrade={setGrade}
        section={section}
        setSection={setSection}
        status={status}
        setStatus={setStatus}
        gradeOptions={gradeOptions}
        sectionOptions={sectionOptions}
        FILTER_ALL={FILTER_ALL}
        STUDENT_STATUS={STUDENT_STATUS}
        error={error}
        students={students}
        openEditDialog={openEditDialog}
        setDeleteState={setDeleteState}
        page={page}
        setPage={setPage}
        totalPages={totalPages}
        total={total}
        loading={loading}
        metricSpec={metricSpec}
        stats={stats}
        statusChipSx={statusChipSx}
        canResetPassword={canResetPassword}
        onResetPassword={(student) =>
          setResetState({
            open: true,
            id: student._id,
            name: student.name || 'this student',
            email: student.parentId?.email || student.fatherEmail || student.motherEmail || '',
          })
        }
        onResetFilters={() => {
          setQ('');
          setGrade(FILTER_ALL);
          setSection(FILTER_ALL);
          setStatus(FILTER_ALL);
          setAppliedQ('');
          setAppliedGrade(FILTER_ALL);
          setAppliedSection(FILTER_ALL);
          setAppliedStatus(FILTER_ALL);
          setPage(1);
        }}
      />

      {canManage ? (
        <>
          <StudentFormDialog
            dialogOpen={dialogOpen}
            setDialogOpen={setDialogOpen}
            submitting={submitting}
            handleSubmitStudent={handleSubmitStudent}
            dialogMode={dialogMode}
            form={form}
            setForm={setForm}
            STUDENT_GENDER={STUDENT_GENDER}
            STUDENT_STATUS={STUDENT_STATUS}
            dialogGradeOptions={dialogGradeOptions}
            dialogSectionOptions={dialogSectionOptions}
            resolveClassId={resolveClassId}
            handlePhotoChange={handlePhotoChange}
            photoPreview={photoPreview}
            handleRemovePhoto={handleRemovePhoto}
            showErrors={showErrors}
          />

          <DeleteConfirmDialog
            open={deleteState.open}
            onClose={() => setDeleteState({ open: false, id: '', name: '' })}
            onConfirm={handleDeleteStudent}
            title="Delete Student Record?"
            itemName={deleteState.name}
            description={`You are about to remove ${deleteState.name || 'this student'} from the registry. This action is permanent and will delete all associated attendance and academic data.`}
            confirmLabel="Delete"
            cancelLabel="Keep Record"
          />
        </>
      ) : null}

      <ResetPasswordDialog
        open={resetState.open}
        onClose={() => setResetState({ open: false, id: '', name: '', email: '' })}
        onConfirm={handleResetPassword}
        confirming={resetting}
        title="Reset Student Password?"
        itemName={resetState.name}
      />

      <StudentDetailsDialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        student={viewStudent}
        canManage={canManage}
        onEdit={() => {
          if (!viewStudent) return;
          setViewDialogOpen(false);
          openEditDialog(viewStudent);
        }}
      />

      <Snackbar open={toast.open} autoHideDuration={3500} onClose={() => setToast((prev) => ({ ...prev, open: false }))} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <Alert severity={toast.severity} onClose={() => setToast((prev) => ({ ...prev, open: false }))}>
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Students;
