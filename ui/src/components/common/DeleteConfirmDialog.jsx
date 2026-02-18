import React from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  Stack,
  Typography,
} from '@mui/material';
import WarningAmberRounded from '@mui/icons-material/WarningAmberRounded';
import DeleteOutlineOutlined from '@mui/icons-material/DeleteOutlineOutlined';

const DeleteConfirmDialog = ({
  open,
  onClose,
  onConfirm,
  title = 'Delete Record?',
  itemName = '',
  description = '',
  confirmLabel = 'Delete',
  cancelLabel = 'Keep Record',
  confirming = false,
}) => {
  const message = description || `You are about to remove ${itemName || 'this record'}. This action is permanent and cannot be undone.`;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ p: 3.2, textAlign: 'center' }}>
          <Box
            sx={{
              width: 74,
              height: 74,
              borderRadius: '50%',
              mx: 'auto',
              mb: 2.3,
              display: 'grid',
              placeItems: 'center',
              backgroundColor: (theme) => theme.customColors.pastelRose,
              color: (theme) => theme.customColors.roseMain,
            }}
          >
            <WarningAmberRounded sx={{ fontSize: 38 }} />
          </Box>

          <Typography sx={{ fontSize: '2rem', fontWeight: 800, color: (theme) => theme.customColors.charcoalText }}>
            {title}
          </Typography>

          <Typography sx={{ mt: 1.1, color: 'text.secondary', fontSize: '0.98rem', lineHeight: 1.7 }}>
            {message}
          </Typography>
        </Box>

        <Stack
          direction="row"
          spacing={1.4}
          justifyContent="center"
          sx={{
            borderTop: '1px solid',
            borderColor: (theme) => theme.customColors.stone100,
            backgroundColor: (theme) => theme.customColors.stone50,
            px: 2.5,
            py: 2.1,
          }}
        >
          <Button
            onClick={onClose}
            variant="outlined"
            sx={{
              minWidth: 140,
              borderRadius: (theme) => theme.customRadius.md,
              borderColor: (theme) => theme.customColors.stone300,
              color: 'text.primary',
              fontWeight: 800,
              textTransform: 'none',
              '&:hover': { borderColor: 'primary.main', backgroundColor: 'background.paper' },
            }}
          >
            {cancelLabel}
          </Button>
          <Button
            onClick={onConfirm}
            disabled={confirming}
            startIcon={<DeleteOutlineOutlined />}
            variant="contained"
            color="error"
            sx={{
              minWidth: 120,
              borderRadius: (theme) => theme.customRadius.md,
              fontWeight: 800,
              textTransform: 'none',
              boxShadow: 'none',
            }}
          >
            {confirming ? 'Deleting...' : confirmLabel}
          </Button>
        </Stack>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteConfirmDialog;
