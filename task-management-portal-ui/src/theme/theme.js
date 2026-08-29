import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#2563EB",
      light: "#3B82F6",
      dark: "#1D4ED8",
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: "#0EA5E9",
    },
    success: {
      main: "#10B981",
    },
    warning: {
      main: "#F59E0B",
    },
    error: {
      main: "#EF4444",
    },
    info: {
      main: "#0EA5E9",
    },
    background: {
      default: "#F8FAFC",
      paper: "#FFFFFF",
    },
    text: {
      primary: "#0F172A",
      secondary: "#64748B",
    },
    divider: "#E2E8F0",
  },

  typography: {
    fontFamily: [
      "Inter",
      "-apple-system",
      "BlinkMacSystemFont",
      '"Segoe UI"',
      "Roboto",
      "sans-serif",
    ].join(","),
    h1: { fontWeight: 800, fontSize: "2.5rem", lineHeight: 1.2 },
    h2: { fontWeight: 700, fontSize: "2rem", lineHeight: 1.25 },
    h3: { fontWeight: 700, fontSize: "1.5rem", lineHeight: 1.3 },
    h4: { fontWeight: 700, fontSize: "1.25rem", lineHeight: 1.35 },
    h5: { fontWeight: 600, fontSize: "1.1rem", lineHeight: 1.4 },
    h6: { fontWeight: 600, fontSize: "1rem", lineHeight: 1.4 },
    button: { fontWeight: 600, textTransform: "none" },
  },

  shape: {
    borderRadius: 12,
  },

  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: "#F8FAFC",
          color: "#0F172A",
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 10,
          fontWeight: 600,
        },
      },
    },
  },
});

export default theme;