import React from 'react';
import { TableCell, TableHead, TableRow } from '@mui/material';

const AppTableHead = ({ columns = [] }) => (
  <TableHead>
    <TableRow
      sx={{
        backgroundColor: (theme) => theme.customColors.stone50,
        '& .MuiTableCell-root': {
          fontSize: '0.72rem',
          fontWeight: 700,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: (theme) => theme.customColors.stone400,
          borderBottomColor: (theme) => theme.customColors.stone100,
        },
      }}
    >
      {columns.map((column) => (
        <TableCell key={column.key || column.label} align={column.align || 'left'}>
          {column.label}
        </TableCell>
      ))}
    </TableRow>
  </TableHead>
);

export default AppTableHead;
