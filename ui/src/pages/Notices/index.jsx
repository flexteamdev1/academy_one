import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  InputAdornment,
  MenuItem,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import AddRounded from '@mui/icons-material/AddRounded';
import SearchOutlined from '@mui/icons-material/SearchOutlined';
import { createNotice, listNotices } from '../../services/noticeService';
import { getUserRole } from '../../utils/auth';
import NoticeList from './NoticeList';
import NoticeViewer from './NoticeViewer';
import NoticeForm from './NoticeForm';

const audienceOptions = [
  { label: 'Students', value: 'STUDENT' },
  { label: 'Parents', value: 'PARENT' },
  { label: 'Teachers', value: 'TEACHER' },
  { label: 'Staff', value: 'ADMIN' },
];

const audienceLabelMap = audienceOptions.reduce((acc, item) => {
  acc[item.value] = item.label;
  return acc;
}, {});

const gradeOptions = ['All Grades', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5'];

const statusTabs = [
  { label: 'All', value: 'ALL' },
  { label: 'Published', value: 'PUBLISHED' },
  { label: 'Drafts', value: 'DRAFT' },
  { label: 'Scheduled', value: 'SCHEDULED' },
  { label: 'Archived', value: 'ARCHIVED' },
];

const deliveryOptions = [
  { label: 'In-App Notification', value: 'IN_APP' },
  { label: 'Email Alert', value: 'EMAIL' },
  { label: 'SMS (Critical only)', value: 'SMS' },
];

const channelLabelMap = deliveryOptions.reduce((acc, item) => {
  acc[item.value] = item.label;
  return acc;
}, {});

const formatDate = (value, withTime = false) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';

  if (withTime) {
    return date.toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const statusLabel = (status) => {
  if (status === 'DRAFT') return 'Draft';
  if (status === 'PUBLISHED') return 'Published';
  if (status === 'SCHEDULED') return 'Scheduled';
  if (status === 'ARCHIVED') return 'Archived';
  return status || '—';
};

const getStatusColor = (status) => {
  if (status === 'PUBLISHED') return 'success';
  if (status === 'SCHEDULED') return 'info';
  if (status === 'DRAFT') return 'warning';
  if (status === 'ARCHIVED') return 'default';
  return 'default';
};

const makeInitialForm = () => ({
  title: '',
  body: '',
  audiences: ['STUDENT', 'PARENT'],
  selectedGrade: 'Grade 1',
  grades: ['All Grades'],
  attachments: [],
  schedule: 'publish_now',
  scheduledAt: '',
  channels: ['IN_APP', 'EMAIL'],
});

const normalizeNotice = (notice) => ({
  id: String(notice?._id || ''),
  title: String(notice?.title || ''),
  body: String(notice?.content || ''),
  audiences: Array.isArray(notice?.visibleFor) ? notice.visibleFor : [],
  grades: Array.isArray(notice?.grades) ? notice.grades : [],
  createdBy: notice?.createdBy?.name || notice?.createdBy?.email || notice?.createdByName || 'System',
  createdAt: notice?.createdAt || null,
  publishedAt: notice?.publishedAt || null,
  scheduledAt: notice?.scheduledAt || null,
  status: String(notice?.status || ''),
  channels: Array.isArray(notice?.channels) ? notice.channels : [],
  attachments: Array.isArray(notice?.attachments) ? notice.attachments : [],
});

const Notices = () => {
  const role = getUserRole();
  const canCreate = ['super_admin', 'admin', 'teacher'].includes(role);

  const [notices, setNotices] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [audienceFilter, setAudienceFilter] = useState('ALL');
  const [gradeFilter, setGradeFilter] = useState('ALL');
  const [statusTab, setStatusTab] = useState('ALL');
  const [selectedNoticeId, setSelectedNoticeId] = useState('');

  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState(makeInitialForm);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    const timer = window.setTimeout(() => setSearch(searchInput.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const loadNotices = async () => {
    setLoading(true);
    setError('');

    try {
      const params = { page: 1, limit: 50 };
      if (search) params.q = search;
      if (statusTab !== 'ALL') params.status = statusTab;
      if (audienceFilter !== 'ALL') params.audience = audienceFilter;
      if (gradeFilter !== 'ALL') params.grade = gradeFilter;

      const response = await listNotices(params);
      const items = (response.items || []).map(normalizeNotice);
      setNotices(items);
      setTotal(response.pagination?.total || items.length);
    } catch (err) {
      setError(err.message || 'Failed to load notices');
      setNotices([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, statusTab, audienceFilter, gradeFilter]);

  useEffect(() => {
    if (!notices.length) {
      setSelectedNoticeId('');
      return;
    }
    if (!notices.some((notice) => notice.id === selectedNoticeId)) {
      setSelectedNoticeId(notices[0].id);
    }
  }, [notices, selectedNoticeId]);

  const selectedNotice = useMemo(
    () => notices.find((notice) => notice.id === selectedNoticeId) || null,
    [notices, selectedNoticeId],
  );

  const closeCreateModal = () => {
    if (submitting) return;
    setCreateOpen(false);
  };

  const submitNotice = async (mode) => {
    if (!canCreate) return;

    const status = mode === 'draft'
      ? 'DRAFT'
      : (form.schedule === 'schedule_later' ? 'SCHEDULED' : 'PUBLISHED');

    const payload = {
      title: form.title.trim(),
      content: form.body.trim(),
      visibleFor: form.audiences,
      grades: form.grades,
      channels: form.channels,
      attachments: form.attachments,
      status,
      scheduledAt: form.schedule === 'schedule_later' ? form.scheduledAt : undefined,
    };

    setSubmitting(true);

    try {
      const created = normalizeNotice(await createNotice(payload));
      setCreateOpen(false);
      setStatusTab('ALL');
      setAudienceFilter('ALL');
      setGradeFilter('ALL');
      setSearchInput('');
      setNotices((prev) => [created, ...prev]);
      setTotal((prev) => prev + 1);
      setSelectedNoticeId(created.id);
      setToast({ open: true, severity: 'success', message: 'Notice created successfully' });
      await loadNotices();
    } catch (err) {
      setToast({
        open: true,
        severity: 'error',
        message: err.message || 'Unable to create notice',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box>
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2} sx={{ mb: 2.5 }}>
        <Box>
          <Typography variant="h4" sx={{ mb: 0.6 }}>
            Notices Board
          </Typography>
          <Typography variant="subtitle1">
            Create, schedule and manage school-wide announcements in one place.
          </Typography>
        </Box>

        {canCreate ? (
          <Button variant="contained" startIcon={<AddRounded />} onClick={() => { setForm(makeInitialForm()); setCreateOpen(true); }}>
            Create notice
          </Button>
        ) : null}
      </Stack>

      <Box
        sx={{
          mb: 2,
          display: 'grid',
          gap: 1.2,
          gridTemplateColumns: {
            xs: '1fr',
            lg: 'minmax(320px, 1fr) 170px 150px auto',
          },
          alignItems: 'center',
        }}
      >
        <TextField
          placeholder="Search by title, content or created by"
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          sx={{ width: '100%' }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchOutlined fontSize="small" />
              </InputAdornment>
            ),
          }}
        />

        <TextField
          select
          value={audienceFilter}
          onChange={(event) => setAudienceFilter(event.target.value)}
          sx={{ minWidth: { xs: '100%', sm: 170 } }}
        >
          <MenuItem value="ALL">All audiences</MenuItem>
          {audienceOptions.map((item) => (
            <MenuItem key={item.value} value={item.value}>
              {item.label}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          value={gradeFilter}
          onChange={(event) => setGradeFilter(event.target.value)}
          sx={{ minWidth: { xs: '100%', sm: 150 } }}
        >
          <MenuItem value="ALL">All grades</MenuItem>
          {gradeOptions.filter((grade) => grade !== 'All Grades').map((grade) => (
            <MenuItem key={grade} value={grade}>
              {grade}
            </MenuItem>
          ))}
        </TextField>

        <Stack
          direction="row"
          spacing={0.5}
          sx={{
            p: 0.5,
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
            flexWrap: 'nowrap',
            overflowX: 'auto',
          }}
        >
          {statusTabs.map((tab) => (
            <Button
              key={tab.value}
              size="small"
              variant={statusTab === tab.value ? 'contained' : 'text'}
              color={statusTab === tab.value ? 'primary' : 'inherit'}
              onClick={() => setStatusTab(tab.value)}
              sx={{ minWidth: 0, px: 1.3, flexShrink: 0, color: statusTab === tab.value ? undefined : 'text.secondary' }}
            >
              {tab.label}
            </Button>
          ))}
        </Stack>
      </Box>

      {error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      ) : null}

      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: {
            xs: '1fr',
            lg: 'minmax(320px, 34%) minmax(0, 1fr)',
          },
          alignItems: 'stretch',
        }}
      >
        <Box>
          <NoticeList
            notices={notices}
            total={total}
            loading={loading}
            selectedNoticeId={selectedNoticeId}
            setSelectedNoticeId={setSelectedNoticeId}
            audienceLabelMap={audienceLabelMap}
            formatDate={formatDate}
            getStatusColor={getStatusColor}
            statusLabel={statusLabel}
          />
        </Box>

        <Box>
          <NoticeViewer
            selectedNotice={selectedNotice}
            canCreate={canCreate}
            getStatusColor={getStatusColor}
            statusLabel={statusLabel}
            formatDate={formatDate}
            audienceLabelMap={audienceLabelMap}
            channelLabelMap={channelLabelMap}
          />
        </Box>
      </Box>

      <NoticeForm
        open={createOpen}
        onClose={closeCreateModal}
        form={form}
        setForm={setForm}
        audienceOptions={audienceOptions}
        gradeOptions={gradeOptions}
        deliveryOptions={deliveryOptions}
        submitting={submitting}
        onSubmit={submitNotice}
      />

      <Snackbar
        open={toast.open}
        autoHideDuration={2800}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setToast((prev) => ({ ...prev, open: false }))}
          severity={toast.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Notices;
