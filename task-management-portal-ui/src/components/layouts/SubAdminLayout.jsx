import PropTypes from "prop-types";
import { Box, Toolbar } from "@mui/material";
import SubAdminSidebar, { SUB_ADMIN_DRAWER_WIDTH } from "./SubAdminSidebar";
import SubAdminNavbar from "./SubAdminNavbar";

export default function SubAdminLayout({ children }) {
  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#F4F7FE" }}>
      <SubAdminSidebar />
      <Box component="main" sx={{
        flexGrow: 1, width: { sm: `calc(100% - ${SUB_ADMIN_DRAWER_WIDTH}px)` }, minWidth: 0,
        minHeight: "100vh", display: "flex", flexDirection: "column", bgcolor: "#F4F7FE", overflowX: "auto",
      }}>
        <SubAdminNavbar />
        <Toolbar sx={{ mb: 0.5 }} />
        <Box sx={{ flexGrow: 1, p: { xs: 2, sm: 2.5, md: 3 }, width: "100%", boxSizing: "border-box" }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}

SubAdminLayout.propTypes = { children: PropTypes.node.isRequired };
