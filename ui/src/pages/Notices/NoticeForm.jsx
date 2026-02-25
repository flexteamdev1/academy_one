import React, { useEffect } from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
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
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import CloudUploadOutlined from '@mui/icons-material/CloudUploadOutlined';
import SendOutlined from '@mui/icons-material/SendOutlined';
import PageCard from '../../components/common/PageCard';
import { sanitizeHtml, stripHtml } from './noticeUtils';

const NoticeForm = ({
  open,
  onClose,
  form,
  setForm,
  audienceOptions,
  gradeOptions,
  submitting,
  onSubmit,
  showErrors,
  mode = 'create',
}) => {
  const hasBodyContent = Boolean(stripHtml(form.body));
  const isEditing = mode === 'edit';

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
    if (!form.selectedGrade || form.selectedGrade === 'All Grades') return;
    if (form.grades.includes(form.selectedGrade)) return;
    setForm((prev) => ({ ...prev, grades: [...prev.grades, prev.selectedGrade] }));
  };

  const removeGrade = (grade) => {
    setForm((prev) => ({
      ...prev,
      grades: prev.grades.filter((item) => item !== grade),
    }));
  };

  const onAttachmentPick = (event) => {
    const files = Array.from(event.target.files || []);
    const next = files.map((file) => ({
      file,
      name: file.name,
      size: `${Math.max(1, Math.round(file.size / 1024))} KB`,
      sizeBytes: file.size,
    }));

    setForm((prev) => ({ ...prev, attachments: [...prev.attachments, ...next] }));
    event.target.value = '';
  };

  const removeAttachment = (target) => {
    setForm((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((item) => item !== target),
    }));
  };

  useEffect(() => {
    if (!open) return;
    if (form.body == null) {
      setForm((prev) => ({ ...prev, body: '' }));
    }
  }, [open, form.body, setForm]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogContent sx={{ p: { xs: 2, md: 3 } }}>
        <Typography variant="h4" sx={{ mb: 0.5 }}>
          {isEditing ? 'Edit Notice' : 'Create New Notice'}
        </Typography>
        <Typography sx={{ color: 'text.secondary', mb: 2.5 }}>
          {isEditing ? 'Update this draft notice before publishing.' : 'Draft an announcement for students, teachers, or parents.'}
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
              {showErrors && !form.audiences.length ? (
                <Typography sx={{ mt: 0.6, fontSize: '0.75rem', color: 'error.main' }}>
                  Select at least one audience.
                </Typography>
              ) : null}
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
              <Typography sx={{ fontSize: '0.82rem', color: 'text.secondary', mb: 0.6 }}>
                Subject / Title <Box component="span" sx={{ color: 'error.main' }}>*</Box>
              </Typography>
              <TextField
                fullWidth
                placeholder="e.g. Annual Sports Day Registration"
                value={form.title}
                onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
                error={showErrors && !form.title.trim()}
                helperText={showErrors && !form.title.trim() ? 'Required' : ' '}
              />
            </Box>

            <Box>
              <Typography sx={{ fontSize: '0.82rem', color: 'text.secondary', mb: 0.6 }}>
                Message Body <Box component="span" sx={{ color: 'error.main' }}>*</Box>
              </Typography>
              <Box
                sx={{
                  border: '1px solid',
                  borderColor: showErrors && !hasBodyContent ? 'error.main' : 'divider',
                  borderRadius: 1.5,
                  overflow: 'hidden',
                  '& .ck.ck-editor__main > .ck-editor__editable': {
                    minHeight: 160,
                    fontSize: '0.95rem',
                    lineHeight: 1.6,
                    borderColor: 'divider',
                  },
                  '& .ck.ck-toolbar': {
                    borderColor: 'divider',
                    backgroundColor: 'action.hover',
                  },
                }}
              >
                <CKEditor
                  editor={ClassicEditor}
                  data={form.body || ''}
                  onReady={(editor) => {
                    editor.editing.view.change((writer) => {
                      writer.setStyle(
                          'min-height',
                          '350px',
                          editor.editing.view.document.getRoot()
                      )
                      writer.setStyle(
                          'max-height',
                          '350px',
                          editor.editing.view.document.getRoot()
                      )
                    })
                  }}
                  onChange={(_event, editor) => {
                    const html = sanitizeHtml(editor.getData());
                    setForm((prev) => ({ ...prev, body: html }));
                  }}
                  config={{
                    toolbar: ['bold', 'italic', 'underline', '|', 'numberedList', 'bulletedList', '|', 'link', '|', 'undo', 'redo'],
                  }}
                />
              </Box>
              {showErrors && !hasBodyContent ? (
                <Typography sx={{ mt: 0.6, fontSize: '0.75rem', color: 'error.main' }}>
                  Required
                </Typography>
              ) : null}
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
                  <input
                    type="file"
                    multiple
                    hidden
                    accept=".pdf,.png,.jpg,.jpeg,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                    onChange={onAttachmentPick}
                  />
                </Button>
              </Box>
              {form.attachments.length ? (
                <Stack spacing={0.6} sx={{ mt: 1 }}>
                  {form.attachments.map((attachment) => (
                    <Stack
                      key={`${attachment.name}-${attachment.size}-${attachment.sizeBytes}`}
                      direction="row"
                      spacing={1}
                      alignItems="center"
                      justifyContent="space-between"
                    >
                      <Typography sx={{ fontSize: '0.82rem', color: 'text.secondary' }}>
                        {attachment.name} · {attachment.size}
                      </Typography>
                      <Button size="small" onClick={() => removeAttachment(attachment)}>Remove</Button>
                    </Stack>
                  ))}
                </Stack>
              ) : null}
            </Box>
          </Stack>

          <Typography sx={{ fontWeight: 700, mb: 1.3 }}>Publishing Options</Typography>
          <Divider sx={{ mb: 2 }} />

          <Typography sx={{ color: 'text.secondary', fontSize: '0.9rem' }}>
            Notices are published immediately after submission.
          </Typography>

          <Divider sx={{ mt: 2.2, mb: 1.8 }} />

          <Stack direction="row" spacing={1} justifyContent="end">
            <Button variant="outlined" onClick={onClose} disabled={submitting}>Cancel</Button>
            <Button
              variant="outlined"
              onClick={() => onSubmit('draft')}
              disabled={submitting || !form.title.trim() || !hasBodyContent || !form.audiences.length}
            >
              {isEditing ? 'Update Draft' : 'Save Draft'}
            </Button>
            <Button
              variant="contained"
              onClick={() => onSubmit('publish')}
              startIcon={<SendOutlined fontSize="small" />}
              disabled={
                submitting ||
                !form.title.trim() ||
                !hasBodyContent ||
                !form.audiences.length
              }
            >
              {submitting ? 'Submitting...' : (isEditing ? 'Publish Update' : 'Publish Notice')}
            </Button>
          </Stack>
        </PageCard>
      </DialogContent>
    </Dialog>
  );
};

export default NoticeForm;
