import PropTypes from "prop-types";
import { Box, Toolbar } from "@mui/material";
import Sidebar, { DRAWER_WIDTH } from "./Sidebar";
import Navbar from "./Navbar";

export default function Layout({ children }) {
  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#F4F7FE" }}>
      <Sidebar />
      <Box component="main" sx={{
        flexGrow: 1, width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` }, minWidth: 0,
        minHeight: "100vh", display: "flex", flexDirection: "column", bgcolor: "#F4F7FE", overflowX: "auto",
      }}>
        <Navbar />
        <Toolbar sx={{ mb: 0.5 }} />
        <Box sx={{ flexGrow: 1, p: { xs: 2, sm: 2.5, md: 3 }, width: "100%", boxSizing: "border-box" }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}

Layout.propTypes = { children: PropTypes.node.isRequired };
