import React from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  Stack,
  Typography,
} from '@mui/material';
import LockResetRounded from '@mui/icons-material/LockResetRounded'; // Updated Icon
import KeyIcon from '@mui/icons-material/Key'; // Updated Icon

const ResetPasswordDialog = ({
  open,
  onClose,
  onConfirm,
  title = 'Reset Password?',
  itemName = '',
  description = '',
  confirmLabel = 'Send Temporary Password',
  cancelLabel = 'Cancel',
  confirming = false,
}) => {
  const message = description || `A temporary password will be generated for ${itemName || 'this student'} and sent to their registered email.`;

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
              backgroundColor: 'primary.light', 
              color: 'primary.main',
              opacity: 0.9
            }}
          >
            <LockResetRounded sx={{ fontSize: 38 }} />
          </Box>

          <Typography sx={{ fontSize: '1.8rem', fontWeight: 800, color: 'text.primary', lineHeight: 1.2 }}>
            {title}
          </Typography>

          <Typography sx={{ mt: 1.5, color: 'text.secondary', fontSize: '0.98rem', lineHeight: 1.6 }}>
            {message}
          </Typography>
        </Box>

        <Stack
          direction="row"
          spacing={1.4}
          justifyContent="center"
          sx={{
            borderTop: '1px solid',
            borderColor: 'grey.100',
            backgroundColor: 'grey.50',
            px: 2.5,
            py: 2.1,
          }}
        >
          <Button
            onClick={onClose}
            variant="outlined"
            sx={{
              minWidth: 120,
              borderRadius: 1,
              borderColor: 'grey.300',
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
            startIcon={!confirming && <KeyIcon />}
            variant="contained"
            color="primary" // Changed from error to primary
            sx={{
              minWidth: 160,
              borderRadius: 1,
              fontWeight: 800,
              textTransform: 'none',
              boxShadow: 'none',
            }}
          >
            {confirming ? 'Sending...' : confirmLabel}
          </Button>
        </Stack>
      </DialogContent>
    </Dialog>
  );
};

export default ResetPasswordDialog;