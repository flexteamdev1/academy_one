import React from 'react';
import {
  Box,
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogContent,
  Divider,
  FormControlLabel,
  Grid,
  MenuItem,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import CloudUploadOutlined from '@mui/icons-material/CloudUploadOutlined';
import SendOutlined from '@mui/icons-material/SendOutlined';
import PageCard from '../../components/common/PageCard';

const NoticeForm = ({
  open,
  onClose,
  form,
  setForm,
  audienceOptions,
  gradeOptions,
  deliveryOptions,
  submitting,
  onSubmit,
}) => {
  const toggleAudience = (audience) => {
    setForm((prev) => {
      const exists = prev.audiences.includes(audience);
      if (exists) {
        return { ...prev, audiences: prev.audiences.filter((item) => item !== audience) };
      }
      return { ...prev, audiences: [...prev.audiences, audience] };
    });
  };

  const addGradeFromSelect = () => {
    if (!form.selectedGrade || form.grades.includes(form.selectedGrade)) return;
    setForm((prev) => ({ ...prev, grades: [...prev.grades, prev.selectedGrade] }));
  };

  const removeGrade = (grade) => {
    setForm((prev) => ({
      ...prev,
      grades: prev.grades.filter((item) => item !== grade),
    }));
  };

  const toggleChannel = (channel) => {
    setForm((prev) => {
      const exists = prev.channels.includes(channel);
      if (exists) {
        return { ...prev, channels: prev.channels.filter((item) => item !== channel) };
      }
      return { ...prev, channels: [...prev.channels, channel] };
    });
  };

  const onAttachmentPick = (event) => {
    const files = Array.from(event.target.files || []);
    const next = files.map((file) => ({
      name: file.name,
      size: `${Math.max(1, Math.round(file.size / 1024))} KB`,
    }));

    setForm((prev) => ({ ...prev, attachments: [...prev.attachments, ...next] }));
    event.target.value = '';
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogContent sx={{ p: { xs: 2, md: 3 } }}>
        <Typography variant="h4" sx={{ mb: 0.5 }}>
          Create New Notice
        </Typography>
        <Typography sx={{ color: 'text.secondary', mb: 2.5 }}>
          Draft an announcement for students, teachers, or parents.
        </Typography>

        <PageCard sx={{ p: 2.5 }}>
          <Typography sx={{ fontWeight: 700, mb: 1.3 }}>Target Audience</Typography>
          <Divider sx={{ mb: 2 }} />

          <Grid container spacing={2} sx={{ mb: 2.5 }}>
            <Grid item xs={12} md={6}>
              <Typography sx={{ fontSize: '0.82rem', color: 'text.secondary', mb: 0.6 }}>
                Who is this for?
              </Typography>
              <Stack direction="row" flexWrap="wrap" useFlexGap gap={0.5}>
                {audienceOptions.map((item) => (
                  <FormControlLabel
                    key={item.value}
                    control={(
                      <Checkbox
                        checked={form.audiences.includes(item.value)}
                        onChange={() => toggleAudience(item.value)}
                        size="small"
                      />
                    )}
                    label={item.label}
                    sx={{ mr: 0.8 }}
                  />
                ))}
              </Stack>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography sx={{ fontSize: '0.82rem', color: 'text.secondary', mb: 0.6 }}>
                Specific grades (Optional)
              </Typography>
              <Stack direction="row" spacing={1}>
                <TextField
                  select
                  fullWidth
                  value={form.selectedGrade}
                  onChange={(event) => setForm((prev) => ({ ...prev, selectedGrade: event.target.value }))}
                >
                  {gradeOptions.map((grade) => (
                    <MenuItem key={grade} value={grade}>
                      {grade}
                    </MenuItem>
                  ))}
                </TextField>
                <Button variant="outlined" onClick={addGradeFromSelect}>Add</Button>
              </Stack>
              <Stack direction="row" spacing={0.7} flexWrap="wrap" useFlexGap sx={{ mt: 1 }}>
                {form.grades.map((grade) => (
                  <Chip key={grade} size="small" label={grade} onDelete={() => removeGrade(grade)} />
                ))}
              </Stack>
            </Grid>
          </Grid>

          <Typography sx={{ fontWeight: 700, mb: 1.3 }}>Notice Details</Typography>
          <Divider sx={{ mb: 2 }} />

          <Stack spacing={1.5} sx={{ mb: 2.3 }}>
            <Box>
              <Typography sx={{ fontSize: '0.82rem', color: 'text.secondary', mb: 0.6 }}>Subject / Title</Typography>
              <TextField
                fullWidth
                placeholder="e.g. Annual Sports Day Registration"
                value={form.title}
                onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
              />
            </Box>

            <Box>
              <Typography sx={{ fontSize: '0.82rem', color: 'text.secondary', mb: 0.6 }}>Message Body</Typography>
              <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1.5, overflow: 'hidden' }}>
                <Stack direction="row" spacing={1.2} sx={{ px: 1.2, py: 0.8, bgcolor: 'action.hover', borderBottom: '1px solid', borderColor: 'divider', color: 'text.secondary', fontSize: '0.85rem' }}>
                  <span>B</span>
                  <span>I</span>
                  <span>U</span>
                  <span>•</span>
                  <span>1.</span>
                  <span>Link</span>
                </Stack>
                <TextField
                  fullWidth
                  multiline
                  minRows={6}
                  placeholder="Type your announcement details here..."
                  value={form.body}
                  onChange={(event) => setForm((prev) => ({ ...prev, body: event.target.value }))}
                  variant="standard"
                  InputProps={{ disableUnderline: true, sx: { p: 1.2 } }}
                />
              </Box>
            </Box>

            <Box>
              <Typography sx={{ fontSize: '0.82rem', color: 'text.secondary', mb: 0.6 }}>Attachments (PDF, JPG, PNG)</Typography>
              <Box sx={{ border: '1px dashed', borderColor: 'divider', borderRadius: 1.5, p: 2.2, textAlign: 'center', bgcolor: 'action.hover' }}>
                <CloudUploadOutlined sx={{ color: 'text.secondary', mb: 0.7 }} />
                <Typography sx={{ fontSize: '0.92rem', mb: 0.5 }}>
                  Click to upload or drag and drop
                </Typography>
                <Typography sx={{ color: 'text.secondary', fontSize: '0.8rem', mb: 1 }}>
                  Maximum file size 10MB
                </Typography>
                <Button component="label" size="small" variant="outlined">
                  Choose files
                  <input type="file" multiple hidden onChange={onAttachmentPick} />
                </Button>
              </Box>
              {form.attachments.length ? (
                <Stack spacing={0.6} sx={{ mt: 1 }}>
                  {form.attachments.map((attachment) => (
                    <Typography key={`${attachment.name}-${attachment.size}`} sx={{ fontSize: '0.82rem', color: 'text.secondary' }}>
                      {attachment.name} · {attachment.size}
                    </Typography>
                  ))}
                </Stack>
              ) : null}
            </Box>
          </Stack>

          <Typography sx={{ fontWeight: 700, mb: 1.3 }}>Publishing Options</Typography>
          <Divider sx={{ mb: 2 }} />

          <Grid container spacing={2.5}>
            <Grid item xs={12} md={6}>
              <Typography sx={{ fontSize: '0.82rem', color: 'text.secondary', mb: 0.6 }}>Schedule</Typography>
              <RadioGroup
                value={form.schedule}
                onChange={(event) => setForm((prev) => ({ ...prev, schedule: event.target.value }))}
              >
                <FormControlLabel value="publish_now" control={<Radio size="small" />} label="Publish immediately" />
                <FormControlLabel value="schedule_later" control={<Radio size="small" />} label="Schedule for later" />
              </RadioGroup>

              {form.schedule === 'schedule_later' ? (
                <TextField
                  type="datetime-local"
                  fullWidth
                  value={form.scheduledAt}
                  onChange={(event) => setForm((prev) => ({ ...prev, scheduledAt: event.target.value }))}
                  sx={{ mt: 1 }}
                  InputLabelProps={{ shrink: true }}
                />
              ) : null}
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography sx={{ fontSize: '0.82rem', color: 'text.secondary', mb: 0.6 }}>Delivery Channels</Typography>
              <Stack>
                {deliveryOptions.map((channel) => (
                  <FormControlLabel
                    key={channel.value}
                    control={(
                      <Checkbox
                        checked={form.channels.includes(channel.value)}
                        onChange={() => toggleChannel(channel.value)}
                        size="small"
                      />
                    )}
                    label={channel.label}
                  />
                ))}
              </Stack>
            </Grid>
          </Grid>

          <Divider sx={{ mt: 2.2, mb: 1.8 }} />

          <Stack direction="row" spacing={1} justifyContent="end">
            <Button variant="outlined" onClick={onClose} disabled={submitting}>Cancel</Button>
            <Button variant="outlined" onClick={() => onSubmit('draft')} disabled={submitting || !form.title.trim() || !form.body.trim() || !form.audiences.length}>Save Draft</Button>
            <Button
              variant="contained"
              onClick={() => onSubmit('publish')}
              startIcon={<SendOutlined fontSize="small" />}
              disabled={
                submitting ||
                !form.title.trim() ||
                !form.body.trim() ||
                !form.audiences.length ||
                (form.schedule === 'schedule_later' && !form.scheduledAt)
              }
            >
              {submitting ? 'Submitting...' : 'Publish Notice'}
            </Button>
          </Stack>
        </PageCard>
      </DialogContent>
    </Dialog>
  );
};

export default NoticeForm;
