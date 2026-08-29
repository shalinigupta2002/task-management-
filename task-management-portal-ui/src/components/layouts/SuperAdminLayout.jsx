import PropTypes from "prop-types";
import { Box } from "@mui/material";
import SuperAdminSidebar, { DRAWER_WIDTH } from "./SuperAdminSidebar";

export default function SuperAdminLayout({ children }) {
  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#F4F7FE" }}>
      <SuperAdminSidebar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
          minWidth: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          bgcolor: "#F4F7FE",
          overflowX: "auto",
        }}
      >
        <Box sx={{ flexGrow: 1, p: { xs: 2, sm: 2, md: 2.5 }, width: "100%", boxSizing: "border-box" }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}

SuperAdminLayout.propTypes = { children: PropTypes.node.isRequired };
