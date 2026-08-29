import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  AppBar, Avatar, Badge, Box, IconButton, Toolbar, Typography, Menu, MenuItem, Divider, ListItemIcon, InputBase,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import PersonOutline from "@mui/icons-material/PersonOutline";
import Logout from "@mui/icons-material/Logout";
import { DRAWER_WIDTH } from "./SuperAdminSidebar";
import { getNotifications } from "../../utils/superAdminStorage";

const PAGE_TITLES = {
  "/super-admin/dashboard": "Dashboard",
  "/super-admin/companies": "Company Management",
  "/super-admin/companies/add": "Add Company",
  "/super-admin/plans": "Plan Management",
  "/super-admin/plans/add": "Add Plan",
  "/super-admin/reports": "Reports",
  "/super-admin/notifications": "Notifications",
  "/super-admin/messages": "Messages",
  "/super-admin/audit-logs": "Audit Logs",
  "/super-admin/settings": "Global Settings",
};

function getPageTitle(pathname) {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  if (pathname.includes("/super-admin/companies/") && pathname.includes("/edit")) return "Edit Company";
  if (pathname.includes("/super-admin/companies/")) return "Company Details";
  if (pathname.includes("/super-admin/plans/") && pathname.includes("/edit")) return "Edit Plan";
  for (const [path, title] of Object.entries(PAGE_TITLES)) {
    if (path !== "/super-admin/dashboard" && pathname.startsWith(path)) return title;
  }
  return "Super Admin";
}

export default function SuperAdminNavbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState(null);
  const unread = getNotifications().filter((n) => !n.read).length;
  const pageTitle = getPageTitle(location.pathname);

  return (
    <AppBar position="sticky" elevation={0} sx={{
      width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
      ml: { sm: `${DRAWER_WIDTH}px` },
      bgcolor: "#FFFFFF", color: "#0F172A", borderBottom: "1px solid #E8EDF5",
    }}>
      <Toolbar sx={{ justifyContent: "space-between", gap: 2, minHeight: { xs: 64, sm: 68 } }}>
        <Typography sx={{ fontWeight: 700, fontSize: "1.1rem", color: "#0F172A" }}>{pageTitle}</Typography>

        <Box display="flex" alignItems="center" gap={1}>
          <Box sx={{ display: { xs: "none", md: "flex" }, alignItems: "center", bgcolor: "#F8FAFC", borderRadius: 2, px: 1.5, py: 0.5, border: "1px solid #E8EDF5", minWidth: 220 }}>
            <SearchIcon sx={{ color: "#94A3B8", fontSize: 20, mr: 1 }} />
            <InputBase placeholder="Search..." sx={{ fontSize: "0.85rem", flex: 1 }} />
          </Box>
          <IconButton onClick={() => navigate("/super-admin/notifications")}>
            <Badge badgeContent={unread} color="error">
              <NotificationsNoneIcon sx={{ color: "#64748B" }} />
            </Badge>
          </IconButton>
          <IconButton onClick={() => navigate("/super-admin/settings")}>
            <SettingsOutlinedIcon sx={{ color: "#64748B" }} />
          </IconButton>
          <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
            <Avatar sx={{ width: 34, height: 34, bgcolor: "#2563EB", fontSize: "0.8rem" }}>SA</Avatar>
          </IconButton>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)} PaperProps={{ sx: { borderRadius: 2, minWidth: 180, mt: 1 } }}>
            <MenuItem onClick={() => { setAnchorEl(null); navigate("/super-admin/settings"); }}>
              <ListItemIcon><PersonOutline fontSize="small" /></ListItemIcon> Profile
            </MenuItem>
            <Divider />
            <MenuItem onClick={() => {
              localStorage.removeItem("isAuthenticated");
              localStorage.removeItem("userRole");
              localStorage.removeItem("accessToken");
              localStorage.removeItem("user");
              navigate("/login");
            }}>
              <ListItemIcon><Logout fontSize="small" sx={{ color: "#DC2626" }} /></ListItemIcon>
              <Typography sx={{ color: "#DC2626", fontSize: "0.875rem" }}>Logout</Typography>
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
