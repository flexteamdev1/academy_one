import React from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';

const AppDialog = ({
  open,
  onClose,
  title,
  children,
  maxWidth = 'sm',
  fullWidth = true,
  contentDividers = false,
  primaryAction,
  secondaryAction,
}) => (
  <Dialog open={open} onClose={onClose} maxWidth={maxWidth} fullWidth={fullWidth}>
    {title ? <DialogTitle sx={{ px: 3, pt: 3, pb: 1.5 }}>{title}</DialogTitle> : null}
    <DialogContent dividers={contentDividers} sx={{ px: 3, pb: 3 }}>
      {children}
    </DialogContent>
    {(primaryAction || secondaryAction) ? (
      <DialogActions sx={{ px: 3, pb: 2, pt: 2 }}>
        {secondaryAction ? (
          <Button onClick={secondaryAction.onClick} disabled={secondaryAction.disabled}>
            {secondaryAction.label}
          </Button>
        ) : null}
        {primaryAction ? (
          <Button
            onClick={primaryAction.onClick}
            variant={primaryAction.variant || 'contained'}
            disabled={primaryAction.disabled}
          >
            {primaryAction.label}
          </Button>
        ) : null}
      </DialogActions>
    ) : null}
  </Dialog>
);

export default AppDialog;
