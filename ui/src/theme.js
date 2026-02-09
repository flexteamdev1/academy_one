import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#1A233A", // Dark Navy for Primary Buttons/Text
      light: "#2C3E50",
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: "#F48FB1", // Pastel Pink
    },
    background: {
      default: "#F3E5F5", // Fallback, we will use gradient in CSS
      paper: "#FFFFFF",
    },
    text: {
      primary: "#1A233A",
      secondary: "#64748B",
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      color: "#1A233A",
    },
    h2: {
      fontWeight: 700,
      color: "#1A233A",
    },
    h4: {
      fontWeight: 700,
      color: "#1A233A",
    },
    h5: {
      fontWeight: 700,
      color: "#1A233A", // "Welcome Back"
    },
    h6: {
      fontWeight: 600,
      color: "#1A233A",
    },
    subtitle1: {
      color: "#64748B",
    },
    subtitle2: {
      fontWeight: 600,
      color: "#64748B", // Label text like "ACADEMIC ID"
      letterSpacing: "0.05em",
      fontSize: "0.75rem",
    },
  },
  shape: {
    borderRadius: 16,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: "50px", // Pill shape
          textTransform: "none",
          fontWeight: 600,
          padding: "12px 24px",
          boxShadow: "none",
          "&:hover": {
            boxShadow: "0px 8px 20px rgba(26, 35, 58, 0.2)", // Softer shadow
          },
        },
        containedPrimary: {
          backgroundColor: "#1A233A",
          "&:hover": {
            backgroundColor: "#2C3E50",
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: "16px", // Slightly more rounded
          backgroundColor: "#F8FAFC",
          "& fieldset": {
            border: "1px solid #E2E8F0", // Subtle border initially
          },
          "&:hover fieldset": {
            borderColor: "#CBD5E1",
          },
          "&.Mui-focused fieldset": {
            borderColor: "#1A233A",
            borderWidth: "1px",
          },
        },
        input: {
          padding: "16px",
          fontSize: "1rem",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: "40px", // More rounded as in image
          boxShadow: "0px 24px 64px rgba(0, 0, 0, 0.08)", // Deeper, softer shadow
        },
      },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          border: "none",
          borderRadius: "50px !important", // Pill shape
          textTransform: "none",
          fontWeight: 600,
          color: "#64748B",
          padding: "8px 24px",
          "&.Mui-selected": {
            backgroundColor: "#FFFFFF",
            color: "#1A233A",
            boxShadow: "0px 2px 8px rgba(0,0,0,0.05)",
            "&:hover": {
              backgroundColor: "#FFFFFF",
            },
          },
          "&:hover": {
            backgroundColor: "rgba(0,0,0,0.02)",
          },
        },
      },
    },
    MuiToggleButtonGroup: {
      styleOverrides: {
        root: {
          backgroundColor: "#F8FAFC",
          padding: "6px",
          borderRadius: "50px",
          border: "1px solid #F1F5F9",
        },
      },
    },
  },
});

export default theme;
