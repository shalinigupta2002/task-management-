import PropTypes from "prop-types";
import { Box } from "@mui/material";
import BrandingPanel from "./BrandingPanel";

function LoginLayout({ children }) {
  return (
    <Box
      sx={{
        height: "100dvh",
        width: "100vw",
        maxWidth: "100%",
        display: "flex",
        bgcolor: "#F4F7FE",
        overflow: "hidden",
        boxSizing: "border-box",
        position: "relative",
        left: "50%",
        right: "50%",
        ml: "-50vw",
        mr: "-50vw",
      }}
    >
      <Box sx={{ display: { xs: "none", lg: "flex" }, width: "45%", height: "100%", minHeight: 0, overflow: "hidden" }}>
        <BrandingPanel />
      </Box>

      <Box
        sx={{
          flex: 1,
          height: "100%",
          minHeight: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: { xs: 2, sm: 3 },
          overflow: "hidden",
          boxSizing: "border-box",
        }}
      >
        <Box
          sx={{
            width: "100%",
            maxWidth: 420,
            maxHeight: "100%",
            bgcolor: "#FFFFFF",
            borderRadius: 3,
            p: { xs: 2.5, sm: 3 },
            boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
            border: "1px solid #E8EDF5",
            overflow: "hidden",
            boxSizing: "border-box",
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}

LoginLayout.propTypes = { children: PropTypes.node.isRequired };
export default LoginLayout;
