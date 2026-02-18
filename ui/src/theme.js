import { createTheme } from '@mui/material/styles';

const modernPalette = {
  bgDefault: '#f5f7fb',
  bgSidebar: '#f7f9fd',
  bgPaper: '#ffffff',
  primary: '#0f6fff',
  primaryHover: '#0a5ce0',
  secondary: '#14b8a6',
  secondaryHover: '#0f9b8c',
  textPrimary: '#1f2937',
  textSecondary: '#6b7280',
  border: '#dbe3ef',
  borderStrong: '#c2cddd',
  stone50: '#f8fafd',
  stone100: '#eff4fa',
  stone200: '#dbe3ef',
  stone300: '#c2cddd',
  stone400: '#64748b',
  pastelBlue: '#eaf2ff',
  pastelMint: '#e9faf7',
  pastelLavender: '#f4efff',
  pastelRose: '#fff1f4',
  amberSoft: '#fff6e8',
  mintDark: '#caeee6',
  blueDark: '#d6e6ff',
  lavenderDark: '#e4dbff',
  success: '#10b981',
  successDeep: '#166534',
  info: '#0ea5e9',
  infoDeep: '#155e75',
  warning: '#f59e0b',
  warningText: '#92400e',
  danger: '#ef4444',
  dangerSoft: '#fef2f2',
  dangerText: '#b91c1c',
};

const theme = createTheme({
  palette: {
    primary: {
      main: modernPalette.primary,
      dark: modernPalette.primaryHover,
      light: '#9bc5ff',
      contrastText: '#ffffff',
    },
    secondary: {
      main: modernPalette.secondary,
      dark: modernPalette.secondaryHover,
      light: '#a7f3d0',
      contrastText: '#ffffff',
    },
    success: { main: modernPalette.success },
    info: { main: modernPalette.info },
    warning: { main: modernPalette.warning },
    error: { main: modernPalette.danger },
    background: {
      default: modernPalette.bgDefault,
      paper: modernPalette.bgPaper,
    },
    text: {
      primary: modernPalette.textPrimary,
      secondary: modernPalette.textSecondary,
    },
    divider: modernPalette.border,
  },
  customRadius: {
    xs: 8,
    sm: 10,
    md: 12,
    lg: 16,
    xl: 20,
    full: 999,
  },
  customColors: {
    creamBg: modernPalette.bgDefault,
    warmSidebar: modernPalette.bgSidebar,
    sunsetOrange: modernPalette.primary,
    sunsetOrangeHover: modernPalette.primaryHover,
    mutedTeal: modernPalette.secondary,
    mutedTealHover: modernPalette.secondaryHover,
    warmGray: modernPalette.textSecondary,
    softBorder: modernPalette.border,
    charcoal: modernPalette.textPrimary,
    layoutBg: modernPalette.bgDefault,
    sidebarActiveBg: '#eaf2ff',
    sidebarItemHoverBg: '#f1f5f9',
    mutedSurface: modernPalette.bgPaper,
    mutedBorder: modernPalette.border,
    avatarWarmBg: '#dbeafe',
    avatarWarmText: '#1e3a8a',
    subtleBorder: modernPalette.border,
    breadcrumbSlash: modernPalette.stone300,
    calendarAccent: modernPalette.primary,
    pastelMint: modernPalette.pastelMint,
    pastelBlue: modernPalette.pastelBlue,
    pastelLavender: modernPalette.pastelLavender,
    pastelRose: modernPalette.pastelRose,
    mintDark: modernPalette.mintDark,
    blueDark: modernPalette.blueDark,
    lavenderDark: modernPalette.lavenderDark,
    stone50: modernPalette.stone50,
    stone100: modernPalette.stone100,
    stone200: modernPalette.stone200,
    stone300: modernPalette.stone300,
    stone400: modernPalette.stone400,
    charcoalText: modernPalette.textPrimary,
    dangerText: modernPalette.dangerText,
    successMain: modernPalette.success,
    infoMain: modernPalette.info,
    successDeep: modernPalette.successDeep,
    infoDeep: modernPalette.infoDeep,
    purpleDeep: '#5b21b6',
    lavenderMain: '#7c3aed',
    roseMain: '#ef4444',
    roseBorder: '#fecdd3',
    amberSoft: modernPalette.amberSoft,
    successSoft: modernPalette.pastelMint,
    successText: modernPalette.successDeep,
    infoSoft: '#ecfeff',
    infoText: modernPalette.infoDeep,
    warningSoft: modernPalette.amberSoft,
    warningText: modernPalette.warningText,
    dangerSoft: modernPalette.dangerSoft,
    overlayWhite60: 'rgba(255,255,255,0.6)',
    overlayWhite20: 'rgba(255,255,255,0.2)',
    overlayWhite30: 'rgba(255,255,255,0.3)',
    overlayWhite40: 'rgba(255,255,255,0.4)',
    overlayWhite50: 'rgba(255,255,255,0.5)',
    blurBlobLight: 'rgba(191, 219, 254, 0.55)',
    loginSoftIndigo: modernPalette.primaryHover,
    dashboardCardOne: '#f2f7ff',
    dashboardCardTwo: '#eefbf8',
    dashboardCardThree: '#fff5eb',
    dashboardCardFour: '#f7f3ff',
    dashboardAccentOne: '#0f6fff',
    dashboardAccentTwo: '#0f9b8c',
    dashboardAccentThree: '#ea580c',
    dashboardAccentFour: '#7c3aed',
    softSurface: '#f9fbfe',
  },
  typography: {
    fontFamily: '"Inter", "Segoe UI", sans-serif',
    h1: { fontFamily: '"Outfit", "Inter", sans-serif', fontWeight: 800, color: modernPalette.textPrimary },
    h2: { fontFamily: '"Outfit", "Inter", sans-serif', fontWeight: 800, color: modernPalette.textPrimary },
    h3: { fontFamily: '"Outfit", "Inter", sans-serif', fontWeight: 700, color: modernPalette.textPrimary },
    h4: { fontFamily: '"Outfit", "Inter", sans-serif', fontWeight: 700, color: modernPalette.textPrimary },
    h5: { fontFamily: '"Outfit", "Inter", sans-serif', fontWeight: 700, color: modernPalette.textPrimary },
    h6: { fontFamily: '"Outfit", "Inter", sans-serif', fontWeight: 600, color: modernPalette.textPrimary },
    button: { fontFamily: '"Outfit", "Inter", sans-serif', fontWeight: 600 },
    subtitle1: { color: modernPalette.textSecondary },
    body1: { color: modernPalette.textPrimary },
    body2: { color: modernPalette.textSecondary },
  },
  shape: {
    borderRadius: 1,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: modernPalette.bgDefault,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          textTransform: 'none',
          fontWeight: 700,
          boxShadow: 'none',
        },
        containedPrimary: {
          backgroundColor: modernPalette.primary,
          '&:hover': {
            backgroundColor: modernPalette.primaryHover,
            boxShadow: '0 8px 20px rgba(37, 99, 235, 0.2)',
          },
        },
        outlined: {
          borderColor: modernPalette.borderStrong,
          color: modernPalette.textPrimary,
          '&:hover': {
            borderColor: modernPalette.primary,
            backgroundColor: modernPalette.stone50,
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          backgroundColor: modernPalette.bgPaper,
          '& fieldset': {
            border: `1px solid ${modernPalette.border}`,
          },
          '&:hover fieldset': {
            borderColor: modernPalette.borderStrong,
          },
          '&.Mui-focused fieldset': {
            borderColor: modernPalette.primary,
            borderWidth: 1,
          },
        },
        input: {
          padding: '16px 14px',
          fontSize: '0.92rem',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          border: `1px solid ${modernPalette.border}`,
          boxShadow: '0 12px 28px rgba(15, 23, 42, 0.05)',
          backgroundColor: modernPalette.bgPaper,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        rounded: {
          borderRadius: 16,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 16,
          border: `1px solid ${modernPalette.border}`,
          boxShadow: '0 24px 60px rgba(15, 23, 42, 0.14)',
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          fontWeight: 700,
          paddingBottom: 8,
        },
      },
    },
    MuiDialogContent: {
      styleOverrides: {
        root: {
          paddingTop: 12,
          paddingBottom: 12,
        },
      },
    },
    MuiDialogActions: {
      styleOverrides: {
        root: {
          padding: '14px 24px 18px',
          borderTop: `1px solid ${modernPalette.stone100}`,
          backgroundColor: modernPalette.stone50,
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          borderRadius: 12,
          border: `1px solid ${modernPalette.border}`,
          boxShadow: '0 12px 30px rgba(15, 23, 42, 0.1)',
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          margin: '2px 6px',
          minHeight: 36,
        },
      },
    },
    MuiTableContainer: {
      styleOverrides: {
        root: {
          borderRadius: 14,
          border: `1px solid ${modernPalette.border}`,
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          backgroundColor: modernPalette.stone50,
          color: modernPalette.stone400,
          fontWeight: 700,
          borderBottomColor: modernPalette.stone100,
          paddingTop: 12,
          paddingBottom: 12,
        },
        root: {
          borderBottomColor: modernPalette.stone100,
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:last-child td': {
            borderBottom: 0,
          },
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: `1px solid ${modernPalette.border}`,
          backgroundColor: modernPalette.bgSidebar,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(255,255,255,0.86)',
          borderBottom: `1px solid ${modernPalette.border}`,
        },
      },
    },
  },
});

export default theme;
