import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Stack,
  Button,
  Grid,
  Paper,
  Avatar,
  Chip,
  LinearProgress,
  CircularProgress,
} from '@mui/material';
import {
  EditOutlined as EditIcon,
  FileDownloadOutlined as DownloadIcon,
  CakeOutlined as BirthIcon,
  Male as MaleIcon,
  Female as FemaleIcon,
  LocationOnOutlined as AddressIcon,
  BadgeOutlined as ParentIcon,
  LocalPhoneOutlined as PhoneIcon,
  EmailOutlined as EmailIcon,
  NotificationImportantOutlined as EmergencyIcon,
  ArrowBackOutlined as BackIcon,
  SchoolOutlined,
} from '@mui/icons-material';
import { getLinkedStudents, getStudentById } from '../services/userService';
import { getMyAttendance } from '../services/attendanceService';
import { useUIState } from '../context/UIContext';
import StudentFormDialog from './Students/StudentCreateDialog';
import { STUDENT_GENDER, STUDENT_STATUS } from '../constants/enums';
import { updateMyStudent } from '../services/userService';

const ModernStudentProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { selectedAcademicYearId } = useUIState();
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState(null);
  const [attendanceStats, setAttendanceStats] = useState({ presentPercentage: 0 });
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    gender: STUDENT_GENDER.MALE,
    dob: '',
    grade: '',
    sectionName: '',
    classId: '',
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
  });
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editErrors, setEditErrors] = useState(false);
  const [photoPreview, setPhotoPreview] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        let studentData;
        if (id) {
          studentData = await getStudentById(id);
        } else {
          const res = await getLinkedStudents();
          if (res.items && res.items.length > 0) {
            studentData = res.items[0];
          }
        }

        if (studentData) {
          setStudent(studentData);
          // Only fetch attendance if it's the student viewing themselves or if we have an ID
          const attendanceRes = await getMyAttendance({
            academicYearId: selectedAcademicYearId,
            studentId: id || undefined // getMyAttendance might need to support studentId for admins
          });

          if (attendanceRes && attendanceRes.stats) {
            setAttendanceStats(attendanceRes.stats);
          }
        }
      } catch (err) {
        console.error('Failed to fetch profile data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, selectedAcademicYearId]);

  useEffect(() => {
    return () => {
      if (photoPreview) URL.revokeObjectURL(photoPreview);
    };
  }, [photoPreview]);

  const dialogGradeOptions = useMemo(() => (
    student?.grade ? [student.grade] : []
  ), [student]);

  const dialogSectionOptions = useMemo(() => (
    student?.sectionName ? [student.sectionName] : []
  ), [student]);

  const resolveClassId = () => (student?.classId || '');

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

  const openEdit = () => {
    if (!student) return;
    setEditErrors(false);
    setEditForm({
      name: student.name || '',
      email: student.email || '',
      gender: student.gender || STUDENT_GENDER.MALE,
      dob: student.dob ? String(student.dob).slice(0, 10) : '',
      grade: student.grade || '',
      sectionName: student.sectionName || '',
      classId: student.classId || '',
      status: student.status || STUDENT_STATUS.ACTIVE,
      bloodGroup: student.bloodGroup || '',
      fullAddress: formatAddress(student.address),
      fatherName: student.fatherName || '',
      fatherEmail: student.fatherEmail || '',
      fatherPhone: student.fatherPhone || '',
      fatherOccupation: student.fatherOccupation || '',
      motherName: student.motherName || '',
      motherEmail: student.motherEmail || '',
      motherPhone: student.motherPhone || '',
      motherOccupation: student.motherOccupation || '',
      emergencyPhone: student.emergencyPhone || '',
      profilePhoto: null,
      removeProfilePhoto: false,
    });
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoPreview(student.profilePhotoUrl || '');
    setEditOpen(true);
  };

  const handlePhotoChange = (file) => {
    setEditForm((prev) => ({ ...prev, profilePhoto: file || null, removeProfilePhoto: false }));
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoPreview(file ? URL.createObjectURL(file) : '');
  };

  const handleRemovePhoto = () => {
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoPreview('');
    setEditForm((prev) => ({ ...prev, profilePhoto: null, removeProfilePhoto: true }));
  };

  const handleSubmitEdit = async () => {
    if (!student) return;
    if (!editForm.name.trim() || !editForm.dob || !editForm.fatherName.trim() || !editForm.fatherEmail.trim() || !editForm.fatherPhone.trim() || !editForm.emergencyPhone.trim()) {
      setEditErrors(true);
      return;
    }

    setEditSubmitting(true);
    try {
      const trimmedFullAddress = editForm.fullAddress.trim();
      const payload = {
        name: editForm.name.trim(),
        email: editForm.email.trim(),
        gender: editForm.gender,
        dob: editForm.dob,
        bloodGroup: editForm.bloodGroup.trim() || undefined,
        address: trimmedFullAddress ? { street: trimmedFullAddress } : undefined,
        fatherName: editForm.fatherName.trim(),
        fatherEmail: editForm.fatherEmail.trim(),
        fatherPhone: editForm.fatherPhone.trim(),
        fatherOccupation: editForm.fatherOccupation.trim() || undefined,
        motherName: editForm.motherName.trim() || undefined,
        motherEmail: editForm.motherEmail.trim() || undefined,
        motherPhone: editForm.motherPhone.trim() || undefined,
        motherOccupation: editForm.motherOccupation.trim() || undefined,
        emergencyPhone: editForm.emergencyPhone.trim(),
        profilePhoto: editForm.profilePhoto,
        removeProfilePhoto: editForm.removeProfilePhoto,
      };

      const updated = await updateMyStudent(student._id, payload);
      setStudent(updated);
      setEditOpen(false);
      setEditErrors(false);
    } catch (err) {
      console.error('Failed to update profile:', err);
    } finally {
      setEditSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh', bgcolor: '#f8fafd' }}>
        <CircularProgress size={40} sx={{ color: '#5346e0' }} />
      </Box>
    );
  }

  if (!student) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography>No student profile found.</Typography>
      </Box>
    );
  }

  const addressText = (() => {
    if (!student?.address) return '';
    if (typeof student.address === 'string') return student.address;
    const parts = [
      student.address.street,
      student.address.city,
      student.address.state,
      student.address.zip,
      student.address.country,
    ].map((item) => String(item || '').trim()).filter(Boolean);
    return parts.join(', ');
  })();

  return (
    <Box sx={{ p: 4, bgcolor: '#f8fafd', minHeight: '100vh' }}>
      <Box sx={{ mb: 2 }}>
        <Button
          variant="text"
          startIcon={<BackIcon />}
          onClick={() => navigate(-1)}
          sx={{ textTransform: 'none', fontWeight: 700 }}
        >
          Back
        </Button>
      </Box>
      {/* Top Profile Header */}
      <Paper elevation={0} sx={{ p: 4, borderRadius: '40px', border: '1px solid #eef2f6', mb: 4 }}>
        <Grid container spacing={4} alignItems="center">
          <Grid item>
            <Box sx={{ position: 'relative' }}>
              <Avatar
                src={student.profilePhotoUrl}
                sx={{ width: 120, height: 120, borderRadius: '32px', border: '4px solid #fff', boxShadow: '0 8px 16px rgba(0,0,0,0.08)' }}
              />
              <Box sx={{ position: 'absolute', bottom: 5, right: 5, width: 16, height: 16, bgcolor: '#22c55e', borderRadius: '50%', border: '3px solid #fff' }} />
            </Box>
          </Grid>
          <Grid item xs>
            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
              <Typography variant="h3" sx={{ fontWeight: 900, color: '#1a1d23' }}>{student.name}</Typography>
              <Chip
                label="ACTIVE ENROLLMENT"
                sx={{
                  bgcolor: '#e0e7ff',
                  color: '#5346e0',
                  fontWeight: 800,
                  fontSize: '10px',
                  height: 24,
                  borderRadius: '6px'
                }}
              />
            </Stack>
            <Stack direction="row" spacing={3}>
              <Stack direction="row" spacing={1} alignItems="center">
                <SchoolOutlined sx={{ color: '#5346e0', fontSize: 18 }} />
                <Typography sx={{ color: '#64748b', fontWeight: 600, fontSize: '14px' }}>Grade {student.grade}-{student.sectionName}</Typography>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <ParentIcon sx={{ color: '#5346e0', fontSize: 18 }} />
                <Typography sx={{ color: '#64748b', fontWeight: 600, fontSize: '14px' }}>Roll No: {student.rollNo || 'N/A'}</Typography>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <EmailIcon sx={{ color: '#5346e0', fontSize: 18 }} />
                <Typography sx={{ color: '#64748b', fontWeight: 600, fontSize: '14px' }}>{student.email || 'N/A'}</Typography>
              </Stack>
            </Stack>
          </Grid>
          <Grid item>
            <Stack direction="row" spacing={2}>
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                sx={{ borderRadius: '14px', textTransform: 'none', fontWeight: 800, px: 3, border: '1px solid #e2e8f0', color: '#64748b' }}
                onClick={openEdit}
              >
                Edit Profile
              </Button>
              <Button
                variant="contained"
                disableElevation
                startIcon={<DownloadIcon />}
                sx={{ borderRadius: '14px', textTransform: 'none', fontWeight: 800, px: 3, bgcolor: '#5346e0' }}
              >
                Download ID
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={4}>
        {/* Left Column */}
        <Grid item xs={12} md={4}>
          <Stack spacing={4}>
            {/* Personal Details Card */}
            <Paper elevation={0} sx={{ p: 4, borderRadius: '32px', border: '1px solid #eef2f6' }}>
              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 4 }}>
                <BirthIcon sx={{ color: '#5346e0' }} />
                <Typography variant="h6" sx={{ fontWeight: 900 }}>Personal Details</Typography>
              </Stack>

              <Box sx={{ mb: 3 }}>
                <Typography variant="overline" sx={{ color: '#94a3b8', fontWeight: 800 }}>DATE OF BIRTH</Typography>
                <Typography sx={{ fontWeight: 800, color: '#1a1d23' }}>
                  {student.dob ? new Date(student.dob).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'N/A'}
                  <Typography component="span" sx={{ color: '#64748b', ml: 1, fontWeight: 600 }}>
                    ({Math.floor((new Date() - new Date(student.dob)) / 31557600000)} Years)
                  </Typography>
                </Typography>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="overline" sx={{ color: '#94a3b8', fontWeight: 800 }}>BLOOD GROUP</Typography>
                <Typography sx={{ fontWeight: 800, color: '#1a1d23' }}>{student.bloodGroup || 'N/A'}</Typography>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="overline" sx={{ color: '#94a3b8', fontWeight: 800 }}>GENDER</Typography>
                <Typography sx={{ fontWeight: 800, color: '#1a1d23' }}>{student.gender || 'N/A'}</Typography>
              </Box>

              <Box>
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
                  <AddressIcon sx={{ color: '#5346e0', fontSize: 18 }} />
                  <Typography variant="overline" sx={{ color: '#94a3b8', fontWeight: 800 }}>FULL ADDRESS</Typography>
                </Stack>
                <Typography sx={{ fontWeight: 800, color: '#1a1d23', maxWidth: '250px' }}>
                  {addressText || 'N/A'}
                </Typography>
              </Box>
            </Paper>

            {/* Attendance Summary Card */}
            <Paper elevation={0} sx={{ p: 4, borderRadius: '32px', border: '1px solid #eef2f6', bgcolor: '#f5f3ff' }}>
              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 3 }}>
                <Box sx={{ bgcolor: '#5346e0', borderRadius: '8px', p: 0.5, display: 'flex' }}>
                  <Typography sx={{ fontSize: '14px', color: '#fff' }}>✔</Typography>
                </Box>
                <Typography sx={{ fontWeight: 900, color: '#5346e0', fontSize: '15px' }}>Attendance Summary</Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                <Box sx={{ flex: 1, mr: 2 }}>
                  <LinearProgress
                    variant="determinate"
                    value={attendanceStats.presentPercentage || 0}
                    sx={{
                      height: 8,
                      borderRadius: 10,
                      bgcolor: 'rgba(83, 70, 224, 0.1)',
                      '& .MuiLinearProgress-bar': { bgcolor: '#5346e0', borderRadius: 10 }
                    }}
                  />
                </Box>
                <Typography sx={{ fontWeight: 900, color: '#5346e0' }}>{Math.round(attendanceStats.presentPercentage || 0)}%</Typography>
              </Stack>
              <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
                {attendanceStats.presentPercentage >= 90 ? 'Excellent! Keep up the consistency.' :
                  attendanceStats.presentPercentage >= 75 ? 'Good job! Aim for even higher.' :
                    'Consistency is key! Keep attending classes.'}
              </Typography>
            </Paper>
          </Stack>
        </Grid>

        {/* Right Column */}
        <Grid item xs={12} md={8}>
          <Stack spacing={4}>
            {/* Parent Details Card */}
            <Paper elevation={0} sx={{ p: 0, borderRadius: '32px', border: '1px solid #eef2f6', overflow: 'hidden' }}>
              <Box sx={{ p: 4, pb: 2, bgcolor: '#fcfcfd', borderBottom: '1px solid #eef2f6' }}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <ParentIcon sx={{ color: '#5346e0' }} />
                  <Typography variant="h6" sx={{ fontWeight: 900 }}>Parent Details</Typography>
                </Stack>
              </Box>
              <Box sx={{ p: 4 }}>
                <Grid container spacing={6}>
                  <Grid item xs={12} sm={6}>
                    <Stack direction="row" spacing={1.5} sx={{ mb: 3 }}>
                      <MaleIcon sx={{ color: '#94a3b8' }} />
                      <Typography variant="overline" sx={{ fontWeight: 800, color: '#1a1d23' }}>FATHER'S PROFILE</Typography>
                    </Stack>
                    <Box sx={{ pl: 4.5 }}>
                      <Typography sx={{ fontWeight: 800, color: '#1a1d23' }}>{student.fatherName || 'N/A'}</Typography>
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.6 }}>
                        <EmailIcon sx={{ fontSize: 16, color: '#64748b' }} />
                        <Typography sx={{ color: '#64748b', fontWeight: 600, fontSize: '14px' }}>{student.fatherEmail || 'N/A'}</Typography>
                      </Stack>
                      <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, display: 'block', mb: 1.5 }}>
                        {student.fatherOccupation || 'N/A'}
                      </Typography>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <PhoneIcon sx={{ fontSize: 16, color: '#64748b' }} />
                        <Typography sx={{ color: '#64748b', fontWeight: 600, fontSize: '14px' }}>{student.fatherPhone || 'N/A'}</Typography>
                      </Stack>
                    </Box>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Stack direction="row" spacing={1.5} sx={{ mb: 3 }}>
                      <FemaleIcon sx={{ color: '#94a3b8' }} />
                      <Typography variant="overline" sx={{ fontWeight: 800, color: '#1a1d23' }}>MOTHER'S PROFILE</Typography>
                    </Stack>
                    <Box sx={{ pl: 4.5 }}>
                      <Typography sx={{ fontWeight: 800, color: '#1a1d23' }}>{student.motherName || 'N/A'}</Typography>
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.6 }}>
                        <EmailIcon sx={{ fontSize: 16, color: '#64748b' }} />
                        <Typography sx={{ color: '#64748b', fontWeight: 600, fontSize: '14px' }}>{student.motherEmail || 'N/A'}</Typography>
                      </Stack>
                      <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, display: 'block', mb: 1.5 }}>
                        {student.motherOccupation || 'N/A'}
                      </Typography>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <PhoneIcon sx={{ fontSize: 16, color: '#64748b' }} />
                        <Typography sx={{ color: '#64748b', fontWeight: 600, fontSize: '14px' }}>{student.motherPhone || 'N/A'}</Typography>
                      </Stack>
                    </Box>
                  </Grid>
                </Grid>

                {/* Emergency Contact */}
                <Box sx={{ mt: 5, p: 3, borderRadius: '24px', bgcolor: '#fff5f5', border: '1px solid #fee2e2' }}>
                  <Grid container alignItems="center" spacing={3}>
                    <Grid item>
                      <Box sx={{
                        width: 50,
                        height: 50,
                        borderRadius: '50%',
                        bgcolor: '#fecaca',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <EmergencyIcon sx={{ color: '#ef4444' }} />
                      </Box>
                    </Grid>
                    <Grid item xs>
                      <Typography variant="caption" sx={{ color: '#ef4444', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px', display: 'block' }}>
                        EMERGENCY CONTACT
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 900, color: '#1a1d23' }}>{student.fatherName || student.motherName || 'N/A'}</Typography>
                    </Grid>
                    <Grid item>
                      <Paper
                        elevation={0}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          px: 3,
                          py: 1.5,
                          borderRadius: '16px',
                          bgcolor: '#fff',
                          border: '1px solid #fee2e2'
                        }}
                      >
                        <PhoneIcon sx={{ color: '#ef4444', mr: 2 }} />
                        <Typography variant="h6" sx={{ fontWeight: 900, color: '#1a1d23' }}>
                          {student.emergencyPhone || 'N/A'}
                        </Typography>
                      </Paper>
                    </Grid>
                  </Grid>
                </Box>
              </Box>
            </Paper>
          </Stack>
        </Grid>
      </Grid>

      <StudentFormDialog
        dialogOpen={editOpen}
        setDialogOpen={setEditOpen}
        submitting={editSubmitting}
        handleSubmitStudent={handleSubmitEdit}
        dialogMode="edit"
        form={editForm}
        setForm={setEditForm}
        STUDENT_GENDER={STUDENT_GENDER}
        STUDENT_STATUS={STUDENT_STATUS}
        dialogGradeOptions={dialogGradeOptions}
        dialogSectionOptions={dialogSectionOptions}
        resolveClassId={resolveClassId}
        handlePhotoChange={handlePhotoChange}
        photoPreview={photoPreview}
        handleRemovePhoto={handleRemovePhoto}
        showErrors={editErrors}
        showStatus={false}
      />
    </Box>
  );
};

export default ModernStudentProfile;
