import { createTheme, alpha } from '@mui/material/styles';

const palette = {
  primary: {
    light: '#ede7f6',
    main: '#5e35b1',
    dark: '#4527a0',
    contrastText: '#fff'
  },

  secondary: {
    light: '#e3f2fd',
    main: '#1e88e5',
    dark: '#1565c0',
    contrastText: '#fff'
  },

  error: {
    light: '#f4cccc',
    main: '#d32f2f',
    dark: '#9a0007'
  },

  warning: {
    light: '#fff8e1',
    main: '#ed6c02',
    dark: '#e65100'
  },

  info: {
    light: '#e3f2fd',
    main: '#0288d1',
    dark: '#01579b'
  },

  success: {
    light: '#edf7ed',
    main: '#2e7d32',
    dark: '#1b5e20'
  },

  grey: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#eeeeee',
    300: '#e0e0e0',
    400: '#bdbdbd',
    500: '#9e9e9e',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121'
  },

  text: {
    primary: '#1f2937',
    secondary: '#6b7280',
    disabled: '#9ca3af'
  },

  background: {
    paper: '#ffffff',
    default: '#f4f6fb'
  },

  divider: '#e3e8f1'
};

const typography = {
  fontFamily: `'Inter', sans-serif`,

  h1: {
    fontWeight: 700,
    fontSize: '2.25rem'
  },

  h2: {
    fontWeight: 700,
    fontSize: '1.875rem'
  },

  h3: {
    fontWeight: 600,
    fontSize: '1.5rem'
  },

  h4: {
    fontWeight: 600,
    fontSize: '1.25rem'
  },

  h5: {
    fontWeight: 600,
    fontSize: '1.1rem'
  },

  h6: {
    fontWeight: 600,
    fontSize: '1rem'
  },

  subtitle1: {
    fontSize: '0.875rem'
  },

  subtitle2: {
    fontSize: '0.75rem'
  },

  body1: {
    fontSize: '0.875rem'
  },

  body2: {
    fontSize: '0.75rem'
  },

  button: {
    textTransform: 'none',
    fontWeight: 600
  }
};

const customShadows = {
  z1: '0px 2px 8px rgba(0,0,0,0.05)',
  z8: '0px 8px 16px rgba(0,0,0,0.08)',
  z16: '0px 16px 32px rgba(0,0,0,0.1)',
  z24: '0px 24px 48px rgba(0,0,0,0.12)'
};

const components = {
  MuiCssBaseline: {
    styleOverrides: {
      body: {
        backgroundColor: palette.background.default
      }
    }
  },

  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: 8,
        fontWeight: 600,
        boxShadow: 'none'
      },

      containedPrimary: {
        '&:hover': {
          boxShadow: customShadows.z8
        }
      }
    }
  },

  MuiOutlinedInput: {
    styleOverrides: {
      root: {
        borderRadius: 8,
        backgroundColor: '#fff',

        '& fieldset': {
          borderColor: palette.divider
        },

        '&:hover fieldset': {
          borderColor: palette.primary.main
        },

        '&.Mui-focused fieldset': {
          borderColor: palette.primary.main
        }
      }
    }
  },

  MuiPaper: {
    styleOverrides: {
      rounded: {
        borderRadius: 12
      }
    }
  },

  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: 12,
        boxShadow: customShadows.z1,
        border: `1px solid ${palette.divider}`
      }
    }
  },

  MuiDialog: {
    styleOverrides: {
      paper: {
        borderRadius: 12,
        boxShadow: customShadows.z24
      }
    }
  },

  MuiTableCell: {
    styleOverrides: {
      head: {
        fontWeight: 600,
        backgroundColor: palette.grey[50]
      }
    }
  },

  MuiTooltip: {
    styleOverrides: {
      tooltip: {
        backgroundColor: '#111827',
        fontSize: '0.75rem'
      }
    }
  },

  MuiTabs: {
    styleOverrides: {
      indicator: {
        height: 3,
        borderRadius: 3
      }
    }
  },

  MuiAvatar: {
    styleOverrides: {
      root: {
        backgroundColor: alpha(palette.primary.main, 0.15),
        color: palette.primary.main
      }
    }
  },
};

const theme = createTheme({
  palette,
  typography,

  shape: {
    borderRadius: 4
  },

  shadows: [
    'none',
    customShadows.z1,
    customShadows.z1,
    customShadows.z1,
    customShadows.z8,
    customShadows.z8,
    customShadows.z8,
    customShadows.z16,
    customShadows.z16,
    customShadows.z16,
    customShadows.z24,
    customShadows.z24,
    customShadows.z24,
    customShadows.z24,
    customShadows.z24,
    customShadows.z24,
    customShadows.z24,
    customShadows.z24,
    customShadows.z24,
    customShadows.z24,
    customShadows.z24,
    customShadows.z24,
    customShadows.z24,
    customShadows.z24,
    customShadows.z24
  ],

  components
});

export default theme;
