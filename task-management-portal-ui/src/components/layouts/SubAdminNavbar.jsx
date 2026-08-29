import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  AppBar, Avatar, Badge, Box, IconButton, Toolbar, Typography, Menu, MenuItem, Divider, ListItemIcon, InputBase,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import PersonOutline from "@mui/icons-material/PersonOutline";
import Logout from "@mui/icons-material/Logout";
import { SUB_ADMIN_DRAWER_WIDTH } from "./SubAdminSidebar";
import { getAuthUser } from "../../utils/session";
import notificationService from "../../services/notificationService";

const PAGE_TITLES = {
  "/sub-admin/dashboard": "Dashboard",
  "/sub-admin/employees": "Employees",
  "/sub-admin/departments": "Departments",
  "/sub-admin/categories": "Task Categories",
  "/sub-admin/frequencies": "Frequencies",
  "/sub-admin/tasks": "Tasks",
  "/sub-admin/calendar": "Calendar",
  "/sub-admin/reports": "Reports",
  "/sub-admin/messages": "Messages",
  "/sub-admin/notifications": "Notifications",
  "/sub-admin/profile": "Profile",
};

function getPageTitle(pathname) {
  if (pathname.startsWith("/sub-admin/frequencies/add")) return "Add Frequency";
  if (pathname.startsWith("/sub-admin/frequencies/edit")) return "Edit Frequency";
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  // Longer paths first so /sub-admin/tasks matches before shorter prefixes incorrectly
  const entries = Object.entries(PAGE_TITLES).sort((a, b) => b[0].length - a[0].length);
  for (const [path, title] of entries) {
    if (pathname === path || pathname.startsWith(`${path}/`)) return title;
  }
  return "Dashboard";
}

export default function SubAdminNavbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const authUser = getAuthUser();
  const fullName = authUser?.name || `${authUser?.firstName || ""} ${authUser?.lastName || ""}`.trim() || "Sub Admin";
  const initials = fullName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase() || "SA";

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const result = await notificationService.getCount();
        if (active) setUnreadCount(result?.unreadCount ?? 0);
      } catch {
        /* ignore badge load failure */
      }
    })();
    return () => { active = false; };
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userRole");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <AppBar position="fixed" elevation={0} sx={{
      width: `calc(100% - ${SUB_ADMIN_DRAWER_WIDTH}px)`, ml: `${SUB_ADMIN_DRAWER_WIDTH}px`,
      bgcolor: "#FFFFFF", borderBottom: "1px solid #E8EDF5", zIndex: (t) => t.zIndex.drawer + 1,
    }}>
      <Toolbar sx={{ justifyContent: "space-between", px: { xs: 2, sm: 3 }, gap: 2, minHeight: 64 }}>
        <Typography sx={{ fontWeight: 700, color: "#0F172A", fontSize: "1.15rem", flexShrink: 0 }}>{getPageTitle(location.pathname)}</Typography>
        <Box sx={{
          display: { xs: "none", md: "flex" }, alignItems: "center", flex: 1, maxWidth: 460, mx: "auto",
          bgcolor: "#F8FAFC", borderRadius: 2.5, px: 2, py: 0.5, border: "1px solid #E8EDF5",
        }}>
          <SearchIcon sx={{ color: "#94A3B8", fontSize: 20, mr: 1 }} />
          <InputBase placeholder="Search employees, tasks..." sx={{ flex: 1, fontSize: "0.875rem", color: "#334155" }} />
        </Box>
        <Box display="flex" alignItems="center" gap={1}>
          <IconButton onClick={() => navigate("/sub-admin/notifications")}>
            <Badge badgeContent={unreadCount} color="error" max={99}>
              <NotificationsNoneIcon sx={{ color: "#64748B" }} />
            </Badge>
          </IconButton>
          <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
            <Avatar sx={{ width: 36, height: 36, bgcolor: "#2563EB", fontSize: "0.85rem" }}>{initials}</Avatar>
          </IconButton>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)} PaperProps={{ sx: { borderRadius: 2, mt: 1, minWidth: 180 } }}>
            <Box px={2} py={1}>
              <Typography sx={{ fontWeight: 600, fontSize: "0.85rem" }}>{fullName}</Typography>
              <Typography sx={{ fontSize: "0.75rem", color: "#64748B" }}>Sub Admin</Typography>
            </Box>
            <Divider />
            <MenuItem onClick={() => { setAnchorEl(null); navigate("/sub-admin/profile"); }}>
              <ListItemIcon><PersonOutline fontSize="small" /></ListItemIcon>Profile
            </MenuItem>
            <MenuItem onClick={handleLogout} sx={{ color: "#DC2626" }}>
              <ListItemIcon><Logout fontSize="small" sx={{ color: "#DC2626" }} /></ListItemIcon>Logout
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
