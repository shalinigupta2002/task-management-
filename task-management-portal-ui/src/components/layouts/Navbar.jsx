import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  AppBar, Avatar, Badge, Box, IconButton, Toolbar, Typography, Menu, MenuItem, Divider, ListItemIcon, InputBase,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import PersonOutline from "@mui/icons-material/PersonOutline";
import Logout from "@mui/icons-material/Logout";
import { DRAWER_WIDTH } from "./Sidebar";

const PAGE_TITLES = {
  "/dashboard": "Dashboard",
  "/dashboard/departments": "Departments",
  "/dashboard/employees": "Employees",
  "/dashboard/categories": "Task Categories",
  "/dashboard/frequencies": "Frequencies",
  "/dashboard/tasks": "Tasks",
  "/dashboard/reports": "Reports",
  "/dashboard/calendar": "Calendar",
  "/approvals": "Approvals",
  "/settings": "Settings",
};

function getPageTitle(pathname) {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  if (pathname.startsWith("/dashboard/calendar/monthly")) return "Calendar";
  if (pathname.startsWith("/dashboard/calendar/yearly")) return "Calendar";
  if (pathname.startsWith("/dashboard/tasks/assigned")) return "Assigned Tasks";
  if (pathname.includes("/approve")) return "Tasks";
  if (pathname.includes("/review") || pathname.includes("/send-back") || pathname.includes("/close")) return "Tasks";
  if (pathname.startsWith("/dashboard/tasks/add") || pathname.startsWith("/dashboard/tasks/edit")) return "Tasks";
  for (const [path, title] of Object.entries(PAGE_TITLES)) {
    if (path !== "/dashboard" && pathname.startsWith(path)) return title;
  }
  return "Dashboard";
}

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState(null);
  const [user, setUser] = useState({ name: "Sandeep Mallik", role: "Administrator" });
  const pageTitle = getPageTitle(location.pathname);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("employeeProfile");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.firstName || parsed.username) {
          setUser({
            name: parsed.firstName ? `${parsed.firstName} ${parsed.lastName || ""}`.trim() : parsed.username,
            role: parsed.role || "Administrator",
          });
        }
      }
    } catch (e) {
      console.error("Failed to parse user profile", e);
    }
  }, []);

  return (
    <AppBar position="fixed" elevation={0} sx={{
      width: `calc(100% - ${DRAWER_WIDTH}px)`, ml: `${DRAWER_WIDTH}px`,
      bgcolor: "#FFFFFF", borderBottom: "1px solid #E8EDF5", zIndex: (t) => t.zIndex.drawer + 1,
    }}>
      <Toolbar sx={{ justifyContent: "space-between", px: { xs: 2, sm: 3 }, gap: 2, minHeight: 64 }}>
        <Box display="flex" alignItems="center" gap={1.5} flexShrink={0}>
          <IconButton size="small" sx={{ display: { md: "none" } }}><MenuIcon /></IconButton>
          <Typography sx={{ fontWeight: 700, color: "#0F172A", fontSize: "1.15rem" }}>{pageTitle}</Typography>
        </Box>

        <Box sx={{
          display: { xs: "none", md: "flex" }, alignItems: "center", flex: 1, maxWidth: 460, mx: "auto",
          bgcolor: "#F8FAFC", borderRadius: 2.5, px: 2, py: 0.5, border: "1px solid #E8EDF5",
        }}>
          <SearchIcon sx={{ color: "#94A3B8", fontSize: 20, mr: 1 }} />
          <InputBase placeholder="Search tasks, users, departments..." sx={{ flex: 1, fontSize: "0.875rem", color: "#334155" }} />
        </Box>

        <Box display="flex" alignItems="center" gap={0.5}>
          <IconButton size="small">
            <Badge badgeContent={12} color="error"><NotificationsNoneIcon sx={{ color: "#64748B" }} /></Badge>
          </IconButton>
          <IconButton size="small" onClick={() => navigate("/settings")}>
            <SettingsOutlinedIcon sx={{ color: "#64748B" }} />
          </IconButton>
          <Box onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ display: "flex", alignItems: "center", gap: 1, cursor: "pointer", ml: 1, p: 0.5, borderRadius: 2, "&:hover": { bgcolor: "#F8FAFC" } }}>
            <Avatar src="https://i.pravatar.cc/150?img=12" sx={{ width: 36, height: 36 }} />
            <Box sx={{ display: { xs: "none", sm: "block" } }}>
              <Typography sx={{ fontWeight: 600, fontSize: 13, color: "#0F172A", lineHeight: 1.2 }}>{user.name}</Typography>
              <Typography sx={{ fontSize: 11, color: "#64748B" }}>{user.role}</Typography>
            </Box>
          </Box>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)} PaperProps={{ sx: { borderRadius: 2, minWidth: 180, border: "1px solid #E2E8F0" } }}>
            <MenuItem onClick={() => { setAnchorEl(null); navigate("/dashboard/profile"); }}>
              <ListItemIcon><PersonOutline fontSize="small" sx={{ color: "#2563EB" }} /></ListItemIcon>View Profile
            </MenuItem>
            <Divider />
            <MenuItem onClick={() => { setAnchorEl(null); localStorage.removeItem("isAuthenticated"); navigate("/login"); }} sx={{ color: "#EF4444" }}>
              <ListItemIcon><Logout fontSize="small" sx={{ color: "#EF4444" }} /></ListItemIcon>Logout
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
