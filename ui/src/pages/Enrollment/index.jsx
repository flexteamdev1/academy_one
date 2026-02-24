import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  FormControl,
  InputAdornment,
  MenuItem,
  Select,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import PersonAddAlt1Outlined from '@mui/icons-material/PersonAddAlt1Outlined';
import GroupsOutlined from '@mui/icons-material/GroupsOutlined';
import FiberNewOutlined from '@mui/icons-material/FiberNewOutlined';
import CheckCircleOutlined from '@mui/icons-material/CheckCircleOutlined';
import SchoolOutlined from '@mui/icons-material/SchoolOutlined';
import SearchOutlined from '@mui/icons-material/SearchOutlined';
import FilterListOutlined from '@mui/icons-material/FilterListOutlined';
import ChevronLeftRounded from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRounded from '@mui/icons-material/ChevronRightRounded';
import HowToRegOutlined from '@mui/icons-material/HowToRegOutlined';
import DeleteOutlineOutlined from '@mui/icons-material/DeleteOutlineOutlined';
import EditOutlined from '@mui/icons-material/EditOutlined';
import AppTableHead from '../../components/common/AppTableHead';
import PageCard from '../../components/common/PageCard';
import StatCard from '../../components/common/StatCard';
import AppDialog from '../../components/common/AppDialog';
import { listClasses } from '../../services/classService';
import { getUserInfo, getUserRole } from '../../utils/auth';
import { filterClassesForTeacher, getTeacherId } from '../../utils/teacherAccess';
import { createStudent } from '../../services/studentService';
import StudentFormDialog from '../Students/StudentCreateDialog';
import { createLead, deleteLead, listLeads, updateLead } from '../../services/leadService';
import { FILTER_ALL, LEAD_STATUS, STUDENT_GENDER, STUDENT_STATUS, USER_ROLES } from '../../constants/enums';

const LIMIT = 10;

const emptyLeadForm = {
  name: '',
  email: '',
  phone: '',
  guardianName: '',
  guardianEmail: '',
  guardianPhone: '',
  gradeInterested: '',
  source: '',
  notes: '',
  status: LEAD_STATUS.NEW,
};

const emptyEnrollmentForm = {
  name: '',
  email: '',
  gender: STUDENT_GENDER.MALE,
  dob: '',
  grade: '',
  sectionName: '',
  classId: '',
  status: STUDENT_STATUS.ACTIVE,
  parentFirstName: '',
  parentLastName: '',
  parentEmail: '',
  parentPhone: '',
  parentRelation: '',
  parentOccupation: '',
  parentEmergencyContact: '',
  profilePhoto: null,
  removeProfilePhoto: false,
};

const statusChipSx = (status, theme) => {
  switch (status) {
    case LEAD_STATUS.NEW:
      return { backgroundColor: theme.palette.info.light, color: theme.palette.info.dark, borderColor: theme.palette.info.main };
    case LEAD_STATUS.CONTACTED:
      return { backgroundColor: theme.palette.warning.light, color: theme.palette.warning.dark, borderColor: theme.palette.warning.main };
    case LEAD_STATUS.QUALIFIED:
      return { backgroundColor: theme.palette.success.light, color: theme.palette.success.dark, borderColor: theme.palette.success.main };
    case LEAD_STATUS.CONVERTED:
      return { backgroundColor: theme.palette.secondary.light, color: theme.palette.secondary.dark, borderColor: theme.palette.secondary.main };
    case LEAD_STATUS.LOST:
      return { backgroundColor: theme.palette.grey[100], color: theme.palette.grey[600], borderColor: theme.palette.grey[300] };
    default:
      return {};
  }
};

const splitGuardianName = (name) => {
  const clean = String(name || '').trim();
  if (!clean) return { first: '', last: '' };
  const parts = clean.split(' ');
  return {
    first: parts[0] || '',
    last: parts.slice(1).join(' ').trim(),
  };
};

const Enrollment = () => {
  const role = getUserRole();
  const canManage = role === USER_ROLES.SUPER_ADMIN || role === USER_ROLES.ADMIN;

  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [q, setQ] = useState('');
  const [status, setStatus] = useState(FILTER_ALL);
  const [appliedQ, setAppliedQ] = useState('');
  const [appliedStatus, setAppliedStatus] = useState(FILTER_ALL);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [selectedLead, setSelectedLead] = useState(null);
  const [leadDialogOpen, setLeadDialogOpen] = useState(false);
  const [leadDialogMode, setLeadDialogMode] = useState('create');
  const [leadForm, setLeadForm] = useState(emptyLeadForm);
  const [showLeadErrors, setShowLeadErrors] = useState(false);
  const [processing, setProcessing] = useState(false);

  const [enrollmentForm, setEnrollmentForm] = useState(emptyEnrollmentForm);
  const [showEnrollmentErrors, setShowEnrollmentErrors] = useState(false);
  const [enrollmentDialogOpen, setEnrollmentDialogOpen] = useState(false);
  const [photoPreview, setPhotoPreview] = useState('');
  const [classCatalog, setClassCatalog] = useState([]);
  const user = getUserInfo();
  const teacherId = role === 'teacher' ? getTeacherId(user) : '';
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  const loadLeads = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = { page, limit: LIMIT };
      if (appliedQ.trim()) params.q = appliedQ.trim();
      if (appliedStatus !== FILTER_ALL) params.status = appliedStatus;
      const response = await listLeads(params);
      setLeads(response.items || []);
      setTotal(response.pagination?.total || 0);
    } catch (err) {
      setError(err.message || 'Failed to load leads');
    } finally {
      setLoading(false);
    }
  }, [page, appliedQ, appliedStatus]);

  useEffect(() => {
    loadLeads();
  }, [loadLeads]);

  useEffect(() => {
    const loadClassCatalog = async () => {
      try {
        const response = await listClasses({ page: 1, limit: 100, status: STUDENT_STATUS.ACTIVE });
        const items = response.items || [];
        if (teacherId) {
          const filtered = filterClassesForTeacher(items, teacherId);
          setClassCatalog(filtered.classes);
        } else {
          setClassCatalog(items);
        }
      } catch (_error) {
        setClassCatalog([]);
      }
    };
    loadClassCatalog();
  }, [teacherId]);

  const handleSearchSubmit = useCallback((event) => {
    event.preventDefault();
    setAppliedQ(q);
    setAppliedStatus(status);
    setPage(1);
  }, [q, status]);

  const dialogGradeOptions = useMemo(() => {
    const values = new Set(classCatalog.map((item) => String(item.name || '').trim()).filter(Boolean));
    return Array.from(values).sort();
  }, [classCatalog]);

  const dialogSectionOptions = useMemo(() => {
    if (!enrollmentForm.grade) return [];
    const matchedClasses = classCatalog.filter((item) => String(item.name || '').trim() === enrollmentForm.grade);
    const values = new Set();
    matchedClasses.forEach((item) => {
      (item.sections || []).forEach((sectionItem) => {
        const sectionName = String(sectionItem.name || '').trim().toUpperCase();
        if (sectionName) values.add(sectionName);
      });
    });
    return Array.from(values).sort();
  }, [classCatalog, enrollmentForm.grade]);

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

  const openCreateLead = () => {
    setLeadDialogMode('create');
    setLeadForm(emptyLeadForm);
    setShowLeadErrors(false);
    setLeadDialogOpen(true);
  };

  const openEditLead = (lead) => {
    setLeadDialogMode('edit');
    setShowLeadErrors(false);
    setLeadForm({
      name: lead.name || '',
      email: lead.email || '',
      phone: lead.phone || '',
      guardianName: lead.guardianName || '',
      guardianEmail: lead.guardianEmail || '',
      guardianPhone: lead.guardianPhone || '',
      gradeInterested: lead.gradeInterested || '',
      source: lead.source || '',
      notes: lead.notes || '',
      status: lead.status || LEAD_STATUS.NEW,
    });
    setSelectedLead(lead);
    setLeadDialogOpen(true);
  };

  const handleSaveLead = async () => {
    if (!canManage) return;
    if (!leadForm.name.trim()) {
      setShowLeadErrors(true);
      setToast({ open: true, severity: 'error', message: 'Lead name is required' });
      return;
    }
    setProcessing(true);
    try {
      if (leadDialogMode === 'create') {
        await createLead(leadForm);
        setToast({ open: true, severity: 'success', message: 'Lead created successfully' });
      } else if (selectedLead) {
        await updateLead(selectedLead._id, leadForm);
        setToast({ open: true, severity: 'success', message: 'Lead updated successfully' });
      }
      setLeadDialogOpen(false);
      setShowLeadErrors(false);
      await loadLeads();
    } catch (err) {
      setToast({ open: true, severity: 'error', message: err.message || 'Unable to save lead' });
    } finally {
      setProcessing(false);
    }
  };

  const handleDeleteLead = async (lead) => {
    if (!canManage) return;
    if (!lead?._id) return;
    setProcessing(true);
    try {
      await deleteLead(lead._id);
      if (selectedLead?._id === lead._id) {
        setSelectedLead(null);
        setEnrollmentForm(emptyEnrollmentForm);
      }
      setToast({ open: true, severity: 'success', message: 'Lead deleted successfully' });
      await loadLeads();
    } catch (err) {
      setToast({ open: true, severity: 'error', message: err.message || 'Unable to delete lead' });
    } finally {
      setProcessing(false);
    }
  };

  const handleSelectLead = (lead) => {
    setSelectedLead(lead);
    setShowEnrollmentErrors(false);
    const guardianSplit = splitGuardianName(lead.guardianName);
    setEnrollmentForm((prev) => ({
      ...prev,
      name: lead.name || '',
      email: lead.email || '',
      parentFirstName: guardianSplit.first,
      parentLastName: guardianSplit.last,
      parentEmail: lead.guardianEmail || lead.email || '',
      parentPhone: lead.guardianPhone || lead.phone || '',
      grade: lead.gradeInterested || prev.grade,
    }));
  };

  useEffect(() => {
    return () => {
      if (photoPreview) URL.revokeObjectURL(photoPreview);
    };
  }, [photoPreview]);

  useEffect(() => {
    if (!enrollmentDialogOpen && photoPreview) {
      URL.revokeObjectURL(photoPreview);
      setPhotoPreview('');
      setEnrollmentForm((prev) => ({ ...prev, profilePhoto: null, removeProfilePhoto: false }));
    }
  }, [enrollmentDialogOpen, photoPreview]);

  const handlePhotoChange = (file) => {
    setEnrollmentForm((prev) => ({ ...prev, profilePhoto: file || null, removeProfilePhoto: false }));
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoPreview(file ? URL.createObjectURL(file) : '');
  };

  const handleRemovePhoto = () => {
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoPreview('');
    setEnrollmentForm((prev) => ({ ...prev, profilePhoto: null, removeProfilePhoto: true }));
  };

  const openEnrollmentDialog = () => {
    if (!selectedLead) {
      setToast({ open: true, severity: 'error', message: 'Select a lead first' });
      return;
    }
    setShowEnrollmentErrors(false);
    setEnrollmentDialogOpen(true);
  };

  const handleConvertToStudent = async () => {
    if (!canManage) return;
    if (!enrollmentForm.grade || !enrollmentForm.sectionName) {
      setShowEnrollmentErrors(true);
      setToast({ open: true, severity: 'error', message: 'Please select grade and section' });
      return;
    }
    if (!enrollmentForm.name.trim() || !enrollmentForm.dob || !enrollmentForm.parentFirstName.trim() || !enrollmentForm.parentEmail.trim()) {
      setShowEnrollmentErrors(true);
      setToast({ open: true, severity: 'error', message: 'Student name, DOB, parent first name, and parent email are required' });
      return;
    }

    setProcessing(true);
    try {
      const payload = {
        name: enrollmentForm.name.trim(),
        email: enrollmentForm.email.trim(),
        gender: enrollmentForm.gender,
        dob: enrollmentForm.dob,
        classId: enrollmentForm.classId || undefined,
        grade: enrollmentForm.grade.trim(),
        sectionName: enrollmentForm.sectionName.trim().toUpperCase(),
        profilePhoto: enrollmentForm.profilePhoto,
        status: STUDENT_STATUS.ACTIVE,
        parentFirstName: enrollmentForm.parentFirstName.trim(),
        parentLastName: enrollmentForm.parentLastName.trim(),
        parentEmail: enrollmentForm.parentEmail.trim(),
        parentPhone: enrollmentForm.parentPhone.trim(),
        parentRelation: enrollmentForm.parentRelation.trim(),
        parentOccupation: enrollmentForm.parentOccupation.trim(),
        parentEmergencyContact: enrollmentForm.parentEmergencyContact.trim(),
      };

      const response = await createStudent(payload);
      if (selectedLead?._id) {
        try {
          await updateLead(selectedLead._id, {
            status: LEAD_STATUS.CONVERTED,
            convertedStudentId: response?.student?._id || undefined,
          });
        } catch (leadError) {
          setToast({
            open: true,
            severity: 'warning',
            message: leadError.message || 'Student created, but lead status update failed',
          });
        }
      }
      setToast({ open: true, severity: 'success', message: 'Lead converted to student successfully' });
      setEnrollmentForm(emptyEnrollmentForm);
      setShowEnrollmentErrors(false);
      setEnrollmentDialogOpen(false);
      setSelectedLead(null);
      await loadLeads();
    } catch (err) {
      setToast({ open: true, severity: 'error', message: err.message || 'Unable to convert lead' });
    } finally {
      setProcessing(false);
    }
  };

  const leadStats = useMemo(() => {
    const snapshot = {
      total: leads.length,
      new: 0,
      qualified: 0,
      converted: 0,
    };
    leads.forEach((lead) => {
      if (lead.status === LEAD_STATUS.NEW) snapshot.new += 1;
      if (lead.status === LEAD_STATUS.QUALIFIED) snapshot.qualified += 1;
      if (lead.status === LEAD_STATUS.CONVERTED) snapshot.converted += 1;
    });
    return snapshot;
  }, [leads]);

  return (
    <Box>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'flex-end' }} justifyContent="space-between" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ mb: 0.6 }}>
            Student Enrollment
          </Typography>
          <Typography variant="subtitle1">
            Capture admissions leads and convert them into enrolled students.
          </Typography>
        </Box>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.2}>
          <Button
            startIcon={<PersonAddAlt1Outlined />}
            onClick={openCreateLead}
            disabled={!canManage}
            sx={{
              backgroundColor: (theme) => theme.palette.info.light,
              border: '1px solid',
              borderColor: (theme) => theme.palette.info.main,
              color: (theme) => theme.palette.info.dark,
              fontWeight: 700,
              '&:hover': { backgroundColor: (theme) => theme.palette.info.main },
            }}
          >
            {canManage ? 'Add Lead' : 'Read Only'}
          </Button>
          <Button
            startIcon={<HowToRegOutlined />}
            onClick={openEnrollmentDialog}
            disabled={!canManage || !selectedLead || selectedLead?.status === LEAD_STATUS.CONVERTED || processing}
            sx={{
              backgroundColor: (theme) => theme.palette.success.light,
              border: '1px solid',
              borderColor: (theme) => theme.palette.success.main,
              color: (theme) => theme.palette.success.dark,
              fontWeight: 700,
              '&:hover': { backgroundColor: (theme) => theme.palette.success.main },
            }}
          >
            Convert Selected
          </Button>
        </Stack>
      </Stack>

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2.2} sx={{ mb: 3 }}>
        {[
          { label: 'Visible Leads', value: leadStats.total, icon: GroupsOutlined, color: 'info.main' },
          { label: 'New Leads', value: leadStats.new, icon: FiberNewOutlined, color: 'warning.main' },
          { label: 'Qualified', value: leadStats.qualified, icon: CheckCircleOutlined, color: 'success.main' },
          { label: 'Converted', value: leadStats.converted, icon: SchoolOutlined, color: 'secondary.main' },
        ].map((item) => (
          <StatCard
            key={item.label}
            label={item.label}
            value={item.value}
            icon={item.icon}
            iconColor={item.color}
            sx={{ flex: 1 }}
          />
        ))}
      </Stack>

      <PageCard sx={{ p: 2, mb: 3 }}>
        <Stack component="form" onSubmit={handleSearchSubmit} direction={{ xs: 'column', lg: 'row' }} spacing={2} alignItems="center">
          <Box sx={{ flex: 1, width: '100%' }}>
            <TextField
              fullWidth
              placeholder="Search leads, guardians, phone or email..."
              size="small"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchOutlined fontSize="small" sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              }}
              sx={{ '& .MuiOutlinedInput-root': { backgroundColor: (theme) => theme.palette.grey[50] } }}
            />
          </Box>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.2} sx={{ width: { xs: '100%', lg: 'auto' } }}>
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <Select value={status} onChange={(e) => { setStatus(e.target.value); }} sx={{ backgroundColor: (theme) => theme.palette.grey[50] }}>
                <MenuItem value={FILTER_ALL}>All Status</MenuItem>
                {Object.values(LEAD_STATUS).map((value) => (
                  <MenuItem key={value} value={value}>{value}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button type="submit" variant="outlined" startIcon={<FilterListOutlined />}>
              Apply
            </Button>
          </Stack>
        </Stack>
      </PageCard>

      {error ? <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> : null}

      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2.2}>
        <PageCard sx={{ flex: 1, overflow: 'hidden' }}>
          <TableContainer>
            <Table>
              <AppTableHead
                columns={[
                  { key: 'lead', label: 'Lead' },
                  { key: 'grade', label: 'Grade' },
                  { key: 'guardian', label: 'Guardian' },
                  { key: 'status', label: 'Status' },
                  { key: 'actions', label: 'Actions', align: 'right' },
                ]}
              />
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5}>Loading leads...</TableCell>
                  </TableRow>
                ) : null}
                {!loading && leads.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5}>No leads found.</TableCell>
                  </TableRow>
                ) : null}
                {!loading && leads.map((lead) => (
                  <TableRow
                    key={lead._id}
                    onClick={() => handleSelectLead(lead)}
                    sx={{
                      cursor: 'pointer',
                      backgroundColor: selectedLead?._id === lead._id ? 'rgba(94, 53, 177, 0.06)' : 'transparent',
                      '&:hover': { backgroundColor: 'rgba(94, 53, 177, 0.06)' },
                    }}
                  >
                    <TableCell>
                      <Typography sx={{ fontWeight: 600 }}>{lead.name}</Typography>
                      <Typography sx={{ color: 'text.secondary', fontSize: '0.78rem' }}>
                        {lead.email || lead.phone || 'No contact'}
                      </Typography>
                    </TableCell>
                    <TableCell>{lead.gradeInterested || 'N/A'}</TableCell>
                    <TableCell>
                      <Typography sx={{ fontWeight: 600 }}>{lead.guardianName || 'N/A'}</Typography>
                      <Typography sx={{ color: 'text.secondary', fontSize: '0.78rem' }}>
                        {lead.guardianEmail || lead.guardianPhone || 'No guardian contact'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={lead.status}
                        variant="outlined"
                        sx={(theme) => ({
                          fontWeight: 600,
                          borderRadius: 999,
                          ...statusChipSx(lead.status, theme),
                        })}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <Button
                          size="small"
                          startIcon={<EditOutlined />}
                          disabled={!canManage}
                          onClick={(event) => {
                            event.stopPropagation();
                            openEditLead(lead);
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          size="small"
                          color="error"
                          startIcon={<DeleteOutlineOutlined />}
                          onClick={(event) => {
                            event.stopPropagation();
                            handleDeleteLead(lead);
                          }}
                          disabled={!canManage || processing}
                        >
                          Delete
                        </Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 2, py: 1.5 }}>
            <Typography sx={{ color: 'text.secondary', fontSize: '0.78rem' }}>
              Showing {leads.length} of {total} leads
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <Button
                size="small"
                startIcon={<ChevronLeftRounded />}
                disabled={page <= 1}
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              >
                Prev
              </Button>
              <Typography sx={{ fontSize: '0.78rem' }}>
                Page {page} of {totalPages}
              </Typography>
              <Button
                size="small"
                endIcon={<ChevronRightRounded />}
                disabled={page >= totalPages}
                onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              >
                Next
              </Button>
            </Stack>
          </Stack>
        </PageCard>

        <PageCard sx={{ flex: 1, p: 2.4 }}>
          <Stack spacing={2}>
            <Box>
              <Typography variant="h6">Enrollment Form</Typography>
              <Typography sx={{ color: 'text.secondary', fontSize: '0.82rem' }}>
                Use “Convert Selected” to open the student enrollment form.
              </Typography>
            </Box>
            <Divider />
            {selectedLead ? (
              <Alert severity="info">
                Selected lead: <b>{selectedLead.name}</b> ({selectedLead.status})
              </Alert>
            ) : (
              <Alert severity="warning">No lead selected. Choose a lead to start enrollment.</Alert>
            )}
            <Button
              variant="contained"
              onClick={openEnrollmentDialog}
              disabled={!canManage || !selectedLead || selectedLead?.status === LEAD_STATUS.CONVERTED || processing}
            >
              Open Enrollment Form
            </Button>
          </Stack>
        </PageCard>
      </Stack>

      <StudentFormDialog
        dialogOpen={enrollmentDialogOpen}
        setDialogOpen={setEnrollmentDialogOpen}
        submitting={processing}
        handleSubmitStudent={handleConvertToStudent}
        dialogMode="create"
        form={enrollmentForm}
        setForm={setEnrollmentForm}
        STUDENT_GENDER={STUDENT_GENDER}
        STUDENT_STATUS={STUDENT_STATUS}
        dialogGradeOptions={dialogGradeOptions}
        dialogSectionOptions={dialogSectionOptions}
        resolveClassId={resolveClassId}
        handlePhotoChange={handlePhotoChange}
        photoPreview={photoPreview}
        handleRemovePhoto={handleRemovePhoto}
        showErrors={showEnrollmentErrors}
      />

      <AppDialog
        open={leadDialogOpen}
        onClose={() => setLeadDialogOpen(false)}
        title={leadDialogMode === 'edit' ? 'Edit Lead' : 'Create Lead'}
        maxWidth="sm"
        contentDividers
        secondaryAction={{ label: 'Cancel', onClick: () => setLeadDialogOpen(false) }}
        primaryAction={{
          label: processing ? 'Saving...' : leadDialogMode === 'edit' ? 'Save Lead' : 'Create Lead',
          onClick: handleSaveLead,
          disabled: processing,
        }}
      >
        <Stack spacing={1.6}>
          <TextField
            fullWidth
            label="Lead Name"
            required
            value={leadForm.name}
            onChange={(e) => setLeadForm((prev) => ({ ...prev, name: e.target.value }))}
            error={showLeadErrors && !leadForm.name.trim()}
            helperText={showLeadErrors && !leadForm.name.trim() ? 'Required' : ' '}
          />
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}>
            <TextField
              fullWidth
              label="Email"
              placeholder="Optional"
              value={leadForm.email}
              onChange={(e) => setLeadForm((prev) => ({ ...prev, email: e.target.value }))}
            />
            <TextField
              fullWidth
              label="Phone"
              placeholder="Optional"
              value={leadForm.phone}
              onChange={(e) => setLeadForm((prev) => ({ ...prev, phone: e.target.value }))}
            />
          </Stack>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}>
            <TextField
              fullWidth
              label="Guardian Name"
              placeholder="Optional"
              value={leadForm.guardianName}
              onChange={(e) => setLeadForm((prev) => ({ ...prev, guardianName: e.target.value }))}
            />
            <TextField
              fullWidth
              label="Guardian Email"
              placeholder="Optional"
              value={leadForm.guardianEmail}
              onChange={(e) => setLeadForm((prev) => ({ ...prev, guardianEmail: e.target.value }))}
            />
          </Stack>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}>
            <TextField
              fullWidth
              label="Guardian Phone"
              placeholder="Optional"
              value={leadForm.guardianPhone}
              onChange={(e) => setLeadForm((prev) => ({ ...prev, guardianPhone: e.target.value }))}
            />
            <TextField
              fullWidth
              label="Grade Interested"
              placeholder="Optional"
              value={leadForm.gradeInterested}
              onChange={(e) => setLeadForm((prev) => ({ ...prev, gradeInterested: e.target.value }))}
            />
          </Stack>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}>
            <TextField
              fullWidth
              label="Source"
              placeholder="Optional"
              value={leadForm.source}
              onChange={(e) => setLeadForm((prev) => ({ ...prev, source: e.target.value }))}
            />
            <TextField
              select
              fullWidth
              label="Status"
              value={leadForm.status}
              onChange={(e) => setLeadForm((prev) => ({ ...prev, status: e.target.value }))}
            >
              {Object.values(LEAD_STATUS).map((value) => (
                <MenuItem key={value} value={value}>{value}</MenuItem>
              ))}
            </TextField>
          </Stack>
          <TextField
            fullWidth
            multiline
            minRows={3}
            label="Notes"
            placeholder="Optional"
            value={leadForm.notes}
            onChange={(e) => setLeadForm((prev) => ({ ...prev, notes: e.target.value }))}
          />
        </Stack>
      </AppDialog>

      <Snackbar open={toast.open} autoHideDuration={3500} onClose={() => setToast((prev) => ({ ...prev, open: false }))} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <Alert severity={toast.severity} onClose={() => setToast((prev) => ({ ...prev, open: false }))}>
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Enrollment;
