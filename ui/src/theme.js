import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#5B5CE3",
      light: "#8E8FF0",
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: "#F3A6C8",
    },
    success: {
      main: "#2FAF74",
    },
    info: {
      main: "#4C8EF7",
    },
    warning: {
      main: "#F2B248",
    },
    background: {
      default: "#FAF7F2",
      paper: "#FFFFFF",
    },
    text: {
      primary: "#1F2A37",
      secondary: "#6B7280",
    },
    divider: "#EEE6DD",
  },
  typography: {
    fontFamily: '"Plus Jakarta Sans", "Segoe UI", sans-serif',
    h1: { fontWeight: 800, color: "#1F2A37" },
    h2: { fontWeight: 800, color: "#1F2A37" },
    h3: { fontWeight: 700, color: "#1F2A37" },
    h4: { fontWeight: 700, color: "#1F2A37" },
    h5: { fontWeight: 700, color: "#1F2A37" },
    h6: { fontWeight: 600, color: "#1F2A37" },
    subtitle1: { color: "#6B7280" },
    subtitle2: {
      fontWeight: 600,
      color: "#7C7C7C",
      letterSpacing: "0.08em",
      fontSize: "0.72rem",
      textTransform: "uppercase",
    },
    body1: { color: "#1F2A37" },
    body2: { color: "#6B7280" },
  },
  shape: {
    borderRadius: 2,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          textTransform: "none",
          fontWeight: 600,
          padding: "10px 22px",
          boxShadow: "none",
        },
        containedPrimary: {
          backgroundColor: "#5B5CE3",
          "&:hover": {
            backgroundColor: "#4B4CD8",
            boxShadow: "0px 8px 18px rgba(91, 92, 227, 0.25)",
          },
        },
        outlined: {
          borderColor: "#E6DFD6",
          color: "#1F2A37",
          "&:hover": {
            borderColor: "#D7CEC4",
            backgroundColor: "#FFFDF9",
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          backgroundColor: "#FFFDF9",
          "& fieldset": {
            border: "1px solid #EFE7DD",
          },
          "&:hover fieldset": {
            borderColor: "#E4DACE",
          },
          "&.Mui-focused fieldset": {
            borderColor: "#5B5CE3",
            borderWidth: "1px",
          },
        },
        input: {
          padding: "14px 16px",
          fontSize: "0.95rem",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          border: "1px solid #F0E7DD",
          boxShadow: "0px 18px 40px rgba(31, 42, 55, 0.06)",
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: "1px solid #F0E7DD",
        },
      },
    },
  },
});

export default theme;
