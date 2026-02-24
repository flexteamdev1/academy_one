import React from 'react';
import {
  FormControl,
  Grid,
  IconButton,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
  Button,
} from '@mui/material';
import AddRounded from '@mui/icons-material/AddRounded';
import DeleteOutlineOutlined from '@mui/icons-material/DeleteOutlineOutlined';
import AppDialog from '../../components/common/AppDialog';
import PageCard from '../../components/common/PageCard';

const ClassFormDialog = ({
  dialogOpen,
  setDialogOpen,
  dialogMode,
  submitting,
  handleDialogSubmit,
  form,
  setForm,
  meta,
  CLASS_STATUS,
  addSectionRow,
  onChangeSection,
  removeSectionRow,
  formatTeacherName,
  showErrors,
}) => (
  <AppDialog
    open={dialogOpen}
    onClose={() => setDialogOpen(false)}
    maxWidth="md"
    title={dialogMode === 'create' ? 'Create New Class' : 'Update Class'}
    primaryAction={{
      label: submitting ? 'Saving...' : dialogMode === 'create' ? 'Create Class' : 'Save Changes',
      onClick: handleDialogSubmit,
      disabled: submitting,
    }}
    secondaryAction={{ label: 'Cancel', onClick: () => setDialogOpen(false) }}
  >
    <Stack spacing={2} sx={{ pt: 1 }}>
      <Grid container spacing={1.5}>
        <Grid item xs={12} md={5}>
          <TextField
            label="Class Name"
            fullWidth
            required
            value={form.name}
            onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
            placeholder="Grade 8"
            error={showErrors && !form.name.trim()}
            helperText={showErrors && !form.name.trim() ? 'Required' : ' '}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            select
            label="Academic Year"
            fullWidth
            required
            value={form.academicYearId}
            onChange={(event) => setForm((prev) => ({ ...prev, academicYearId: event.target.value }))}
          >
            <MenuItem value="">Select Academic Year</MenuItem>
            {meta.academicYears.map((year) => (
              <MenuItem key={year._id} value={year._id}>{year.name}</MenuItem>
            ))}
          </TextField>
        </Grid>

        <Grid item xs={12} md={3}>
          <FormControl fullWidth>
            <Select
              value={form.status}
              onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value }))}
            >
              <MenuItem value={CLASS_STATUS.ACTIVE}>Active</MenuItem>
              <MenuItem value={CLASS_STATUS.INACTIVE}>Inactive</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography sx={{ fontWeight: 700, fontSize: '0.92rem' }}>
          Sections <Typography component="span" sx={{ color: 'error.main' }}>*</Typography>
        </Typography>
        <Button size="small" startIcon={<AddRounded />} onClick={addSectionRow}>Add Section</Button>
      </Stack>

      <Stack spacing={1.4}>
        {form.sections.map((section, index) => (
          <PageCard key={`section-${index}`} sx={{ p: 1.2 }}>
            <Grid container spacing={1.1} alignItems="center">
              <Grid item xs={12} sm={2}>
                <TextField
                  fullWidth
                  label="Section"
                  required
                  value={section.name}
                  onChange={(event) => onChangeSection(index, 'name', event.target.value.toUpperCase())}
                  inputProps={{ maxLength: 2 }}
                  error={showErrors && !section.name.trim()}
                  helperText={showErrors && !section.name.trim() ? 'Required' : ' '}
                />
              </Grid>
              <Grid item xs={12} sm={2}>
                <TextField
                  fullWidth
                  label="Capacity"
                  type="number"
                  value={section.capacity}
                  onChange={(event) => onChangeSection(index, 'capacity', event.target.value)}
                  inputProps={{ min: 1, max: 80 }}
                />
              </Grid>
              <Grid item xs={12} sm={5}>
                <FormControl fullWidth>
                  <Select
                    value={section.classTeacherId}
                    onChange={(event) => onChangeSection(index, 'classTeacherId', event.target.value)}
                    displayEmpty
                  >
                    <MenuItem value="">No Homeroom Teacher</MenuItem>
                    {meta.teachers.map((teacher) => (
                      <MenuItem key={teacher._id} value={teacher._id}>
                        {formatTeacherName(teacher)} ({teacher.employeeId || 'N/A'})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={9} sm={2}>
                <FormControl fullWidth>
                  <Select
                    value={section.status}
                    onChange={(event) => onChangeSection(index, 'status', event.target.value)}
                  >
                    <MenuItem value={CLASS_STATUS.ACTIVE}>Active</MenuItem>
                    <MenuItem value={CLASS_STATUS.INACTIVE}>Inactive</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={3} sm={1}>
                <IconButton
                  onClick={() => removeSectionRow(index)}
                  disabled={form.sections.length <= 1}
                  sx={{ color: (theme) => theme.palette.error.main }}
                >
                  <DeleteOutlineOutlined fontSize="small" />
                </IconButton>
              </Grid>
            </Grid>
          </PageCard>
        ))}
      </Stack>
    </Stack>
  </AppDialog>
);

export default ClassFormDialog;
