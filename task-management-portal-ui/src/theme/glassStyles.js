export const GLASS_INPUT_STYLES = {
    "& .MuiOutlinedInput-root": {
      borderRadius: "12px",
      color: "#FFFFFF",
      backgroundColor: "rgba(255, 255, 255, 0.05)",
      transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
      "& fieldset": {
        borderColor: "rgba(255, 255, 255, 0.15)",
      },
      "&:hover fieldset": {
        borderColor: "#38BDF8",
      },
      "&.Mui-focused fieldset": {
        borderColor: "#38BDF8",
        borderWidth: "1.5px",
        boxShadow: "0 0 12px rgba(56, 189, 248, 0.25)",
      },
      "&.Mui-error fieldset": {
        borderColor: "#EF4444",
      },
    },
    "& .MuiInputLabel-root": {
      color: "rgba(255, 255, 255, 0.7)",
      fontSize: "0.875rem",
    },
    "& .MuiInputLabel-root.Mui-focused": {
      color: "#38BDF8 !important",
      fontWeight: 600,
    },
    "& .MuiInputBase-input": {
      color: "#FFFFFF",
      fontSize: "0.925rem",
    },
    "& .MuiSvgIcon-root": {
      color: "rgba(255, 255, 255, 0.6)",
    },
    "& .MuiFormHelperText-root": {
      color: "#F87171",
    },
  };
  
  export const GLASS_MENU_PROPS = {
    PaperProps: {
      sx: {
        bgcolor: "#0F172A",
        color: "#FFFFFF",
        borderRadius: "12px",
        border: "1px solid rgba(255, 255, 255, 0.12)",
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.6)",
        "& .MuiMenuItem-root": {
          fontSize: 14,
          fontWeight: 500,
          py: 1.2,
          px: 2,
          "&:hover": {
            bgcolor: "rgba(56, 189, 248, 0.12)",
          },
          "&.Mui-selected": {
            bgcolor: "#2563EB",
            fontWeight: 600,
            "&:hover": {
              bgcolor: "#1D4ED8",
            },
          },
        },
      },
    },
  };