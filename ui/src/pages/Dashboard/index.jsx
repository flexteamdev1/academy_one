import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Box, Stack, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Groups2Outlined from '@mui/icons-material/Groups2Outlined';
import BadgeOutlined from '@mui/icons-material/BadgeOutlined';
import AccountBalanceWalletOutlined from '@mui/icons-material/AccountBalanceWalletOutlined';
import EmojiPeopleOutlined from '@mui/icons-material/EmojiPeopleOutlined';
import StatsGrid from './StatsGrid';
import AdmissionsCard from './AdmissionsCard';
import EventsCard from './EventsCard';
import { getStudentStats, listStudents } from '../../services/studentService';
import { getTeacherStats } from '../../services/teacherService';
import { getAttendanceSummary } from '../../services/attendanceService';
import { listNotices } from '../../services/noticeService';
import { useUIState } from '../../context/UIContext';

const Dashboard = () => {
  const { selectedAcademicYearId } = useUIState();
  const navigate = useNavigate();
  const [admissions, setAdmissions] = useState([]);
  const [loadingAdmissions, setLoadingAdmissions] = useState(true);
  const [admissionsError, setAdmissionsError] = useState('');
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [eventsError, setEventsError] = useState('');
  const [studentStats, setStudentStats] = useState(null);
  const [teacherStats, setTeacherStats] = useState(null);
  const [attendanceSummary, setAttendanceSummary] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState('');

  useEffect(() => {
    const loadAdmissions = async () => {
      setLoadingAdmissions(true);
      setAdmissionsError('');
      try {
        const response = await listStudents({ page: 1, limit: 5 });
        const items = response.items || [];
        setAdmissions(items);
      } catch (err) {
        setAdmissionsError(err.message || 'Failed to load admissions');
      } finally {
        setLoadingAdmissions(false);
      }
    };

    loadAdmissions();
  }, [selectedAcademicYearId]);

  useEffect(() => {
    let isMounted = true;

    const loadEvents = async () => {
      setLoadingEvents(true);
      setEventsError('');
      try {
        const response = await listNotices({ page: 1, limit: 4, status: 'PUBLISHED' });
        const items = response.items || [];

        const mapped = items.map((notice) => {
          const dateValue = notice.scheduledAt || notice.publishedAt || notice.createdAt;
          const date = dateValue ? new Date(dateValue) : null;
          const validDate = date && !Number.isNaN(date.getTime()) ? date : null;

          const day = validDate
            ? validDate.toLocaleDateString('en-US', { day: '2-digit' })
            : '--';
          const month = validDate
            ? validDate.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()
            : '---';
          const time = validDate
            ? validDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
            : 'All day';

          const metaBits = [time, notice.createdByName || 'Notice'];

          return {
            id: notice._id,
            day,
            month,
            title: notice.title || 'Untitled Notice',
            meta: metaBits.filter(Boolean).join(' • '),
          };
        });

        if (isMounted) {
          setEvents(mapped);
        }
      } catch (err) {
        if (isMounted) {
          setEventsError(err.message || 'Failed to load notices');
        }
      } finally {
        if (isMounted) {
          setLoadingEvents(false);
        }
      }
    };

    loadEvents();

    return () => {
      isMounted = false;
    };
  }, [selectedAcademicYearId]);

  useEffect(() => {
    let isMounted = true;

    const loadStats = async () => {
      setStatsLoading(true);
      setStatsError('');

      const attendanceParams = selectedAcademicYearId
        ? { academicYearId: selectedAcademicYearId }
        : {};

      const [studentsResult, teachersResult, attendanceResult] = await Promise.allSettled([
        getStudentStats(),
        getTeacherStats(),
        getAttendanceSummary(attendanceParams),
      ]);

      if (!isMounted) return;

      const errors = [];

      if (studentsResult.status === 'fulfilled') {
        setStudentStats(studentsResult.value);
      } else {
        errors.push(studentsResult.reason?.message || 'Student stats unavailable');
      }

      if (teachersResult.status === 'fulfilled') {
        setTeacherStats(teachersResult.value);
      } else {
        errors.push(teachersResult.reason?.message || 'Teacher stats unavailable');
      }

      if (attendanceResult.status === 'fulfilled') {
        setAttendanceSummary(attendanceResult.value);
      } else {
        errors.push(attendanceResult.reason?.message || 'Attendance summary unavailable');
      }

      if (errors.length) {
        setStatsError(errors[0]);
      }

      setStatsLoading(false);
    };

    loadStats();

    return () => {
      isMounted = false;
    };
  }, [selectedAcademicYearId]);

  const formatNumber = useCallback((value) => {
    if (value === null || value === undefined) return '--';
    return new Intl.NumberFormat('en-US').format(value);
  }, []);

  const statCards = useMemo(
    () => [
      {
        label: 'Total Students',
        value: statsLoading ? '--' : formatNumber(studentStats?.total || 0),
        trend: statsLoading ? '' : `${formatNumber(studentStats?.active || 0)} active`,
        icon: Groups2Outlined,
        iconColor: 'info.main',
      },
      {
        label: 'Faculty Staff',
        value: statsLoading ? '--' : formatNumber(teacherStats?.total || 0),
        trend: statsLoading ? '' : `${formatNumber(teacherStats?.onLeave || 0)} on leave`,
        icon: BadgeOutlined,
        iconColor: 'secondary.main',
      },
      {
        label: 'New Enrollments',
        value: statsLoading ? '--' : formatNumber(studentStats?.newEnrollments || 0),
        trend: statsLoading ? '' : `${formatNumber(studentStats?.inactive || 0)} inactive`,
        icon: AccountBalanceWalletOutlined,
        iconColor: 'success.main',
      },
      {
        label: 'Avg. Attendance',
        value: statsLoading
          ? '--'
          : `${attendanceSummary?.summary?.avgAttendance ?? 0}%`,
        trend: statsLoading
          ? ''
          : `${formatNumber(attendanceSummary?.summary?.pendingSubmissions || 0)} pending`,
        icon: EmojiPeopleOutlined,
        iconColor: 'warning.main',
      },
    ],
    [attendanceSummary, formatNumber, statsLoading, studentStats, teacherStats]
  );

  return (
    <Box sx={{ width: '100%', px: 0, pb: 1 }}>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={1.5}
        alignItems={{ xs: 'flex-start', md: 'center' }}
        justifyContent="space-between"
        sx={{ mb: 2.4 }}
      >
        <Box>
          <Typography sx={{ fontSize: { xs: '1.8rem', md: '2.2rem' }, fontWeight: 800, color: 'text.primary', lineHeight: 1.2 }}>
            Welcome Back, Admin
          </Typography>
          <Typography sx={{ mt: 0.4, color: 'text.secondary', fontSize: '0.95rem' }}>
            Here&apos;s what&apos;s happening in your school system today.
          </Typography>
        </Box>
      </Stack>

      <StatsGrid statCards={statCards} />
      {statsError ? (
        <Typography sx={{ mt: 1, color: 'error.main', fontSize: '0.82rem' }}>
          {statsError}
        </Typography>
      ) : null}

      <Box
        sx={{
          mt: 2,
          display: 'grid',
          gap: 2,
          gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' },
          alignItems: 'stretch',
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, height: '100%' }}>
          <Box sx={{ flex: 1, display: 'flex' }}>
            <AdmissionsCard admissions={admissions} loading={loadingAdmissions} />
          </Box>
          {admissionsError ? (
            <Typography sx={{ mt: 1, color: 'error.main', fontSize: '0.82rem' }}>
              {admissionsError}
            </Typography>
          ) : null}
        </Box>

        <Box sx={{ display: 'flex' }}>
          <EventsCard
            events={events}
            loading={loadingEvents}
            onAddReminder={() => navigate('/notices')}
          />
        </Box>
      </Box>
      {eventsError ? (
        <Typography sx={{ mt: 1, color: 'error.main', fontSize: '0.82rem' }}>
          {eventsError}
        </Typography>
      ) : null}
    </Box>
  );
};

export default Dashboard;
