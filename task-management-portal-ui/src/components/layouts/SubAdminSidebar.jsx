import { useNavigate, useLocation } from "react-router-dom";
import {
  Drawer, Toolbar, List, ListItemButton, ListItemIcon, ListItemText, Box, Divider, Typography, Avatar, Collapse,
} from "@mui/material";
import {
  Dashboard, Apartment, People, Category, Schedule, Assignment,
  Assessment, CalendarMonth, Settings, NotificationsNone, Chat, History, Business,
  Logout, AssignmentTurnedIn, ListAlt, PersonAdd, ExpandLess, ExpandMore, Add as AddIcon, PersonOutline,
  AdminPanelSettings,
} from "@mui/icons-material";
import { getAuthUser } from "../../utils/session";

export const SUB_ADMIN_DRAWER_WIDTH = 260;

const MENUS = [
  { title: "Dashboard", icon: Dashboard, path: "/sub-admin/dashboard", exact: true },
  { title: "Departments", icon: Apartment, path: "/sub-admin/departments" },
  {
    title: "Employees", icon: People, path: "/sub-admin/employees",
    subKey: "employees",
    sub: [
      { title: "Employee List", icon: ListAlt, path: "/sub-admin/employees" },
      { title: "Add Employee", icon: PersonAdd, path: "/sub-admin/employees", state: { openAdd: true } },
    ],
  },
  {
    title: "Task Categories", icon: Category, path: "/sub-admin/categories",
    subKey: "categories",
    sub: [
      { title: "Category List", icon: ListAlt, path: "/sub-admin/categories" },
    ],
  },
  {
    title: "Frequencies", icon: Schedule, path: "/sub-admin/frequencies",
    subKey: "frequencies",
    sub: [
      { title: "Frequency List", icon: ListAlt, path: "/sub-admin/frequencies" },
      { title: "+ Add Frequency", icon: AddIcon, path: "/sub-admin/frequencies/add" },
    ],
  },
  {
    title: "Tasks", icon: Assignment, path: "/sub-admin/tasks",
    subKey: "tasks",
    sub: [
      { title: "Task List", icon: ListAlt, path: "/sub-admin/tasks" },
      { title: "Add Task", icon: AddIcon, path: "/sub-admin/tasks/add" },
    ],
  },
  {
    title: "Calendar", icon: CalendarMonth, path: "/sub-admin/calendar",
    subKey: "calendar",
    sub: [
      { title: "Daily View", icon: ListAlt, path: "/sub-admin/calendar" },
      { title: "Monthly View", icon: CalendarMonth, path: "/sub-admin/calendar/monthly" },
      { title: "Yearly View", icon: CalendarMonth, path: "/sub-admin/calendar/yearly" },
    ],
  },
  { title: "Reports", icon: Assessment, path: "/sub-admin/reports" },
  { title: "Notifications", icon: NotificationsNone, path: "/sub-admin/notifications" },
  { title: "Messages", icon: Chat, path: "/sub-admin/messages" },
  { title: "Audit Logs", icon: History, path: "/sub-admin/audit-logs" },
  {
    title: "Settings", icon: Settings, path: "/sub-admin/notification-settings",
    subKey: "settings",
    sub: [
      { title: "Notification Settings", icon: NotificationsNone, path: "/sub-admin/notification-settings" },
      { title: "Profile", icon: PersonOutline, path: "/sub-admin/profile" },
    ],
  },
];

function isMenuActive(path, exact, pathname) {
  if (exact) return pathname === path;
  return pathname === path || pathname.startsWith(`${path}/`);
}

function isSubMenuOpen(menu, pathname) {
  if (!menu.sub) return false;
  if (menu.subKey === "settings") {
    return pathname.startsWith("/sub-admin/notification-settings") || pathname === "/sub-admin/profile";
  }
  if (menu.subKey === "employees") {
    return pathname.startsWith("/sub-admin/employees");
  }
  if (menu.subKey === "categories") {
    return pathname.startsWith("/sub-admin/categories");
  }
  if (menu.subKey === "frequencies") {
    return pathname.startsWith("/sub-admin/frequencies");
  }
  if (menu.subKey === "tasks") {
    return pathname.startsWith("/sub-admin/tasks");
  }
  if (menu.subKey === "calendar") {
    return pathname.startsWith("/sub-admin/calendar");
  }
  return menu.sub.some((s) => pathname === s.path || pathname.startsWith(`${s.path}/`));
}

function isMenuSelected(menu, pathname) {
  if (menu.sub) return isSubMenuOpen(menu, pathname);
  return isMenuActive(menu.path, menu.exact, pathname);
}

export default function SubAdminSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const authUser = getAuthUser();
  const fullName = authUser?.name || `${authUser?.firstName || ""} ${authUser?.lastName || ""}`.trim() || "Sub Admin";
  const roleLabel = authUser?.role?.name || authUser?.roleName || authUser?.role || "Sub Admin";
  const initials = fullName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase() || "SA";

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userRole");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleMenuClick = (menu) => {
    if (menu.sub) {
      // Find the first submenu item and navigate
      navigate(menu.sub[0].path, { state: menu.sub[0].state });
    } else {
      navigate(menu.path);
    }
  };

  return (
    <Drawer variant="permanent" sx={{
      width: SUB_ADMIN_DRAWER_WIDTH, flexShrink: 0,
      "& .MuiDrawer-paper": {
        width: SUB_ADMIN_DRAWER_WIDTH, boxSizing: "border-box", background: "#0F172A", color: "#FFF",
        borderRight: "none", display: "flex", flexDirection: "column",
      },
    }}>
      <Toolbar sx={{ px: 2, py: 2, gap: 1.5 }}>
        <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: "#2563EB", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <AssignmentTurnedIn sx={{ color: "#FFF", fontSize: 20 }} />
        </Box>
        <Box>
          <Typography sx={{ fontWeight: 800, fontSize: "1.05rem", lineHeight: 1.1 }}>TaskFlow</Typography>
          <Typography sx={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.5)" }}>Sub Admin Portal</Typography>
        </Box>
      </Toolbar>

      <Divider sx={{ borderColor: "rgba(255,255,255,0.08)", mx: 2 }} />

      <Box sx={{ flex: 1, overflowY: "auto", px: 1.5, py: 1.5 }}>
        <List disablePadding sx={{ display: "flex", flexDirection: "column", gap: 0.3 }}>
          {MENUS.map((menu) => {
            const selected = isMenuSelected(menu, location.pathname);
            const subOpen = menu.sub ? isSubMenuOpen(menu, location.pathname) : false;
            const Icon = menu.icon;

            return (
              <Box key={menu.title}>
                <ListItemButton
                  selected={selected}
                  onClick={() => handleMenuClick(menu)}
                  sx={{
                    borderRadius: 2, py: 1, px: 1.5, minHeight: 40,
                    color: selected ? "#FFF" : "rgba(255,255,255,0.6)",
                    bgcolor: selected && !menu.sub ? "#2563EB !important" : "transparent",
                    "&:hover": { bgcolor: selected && !menu.sub ? "#2563EB !important" : "rgba(255,255,255,0.08)" },
                  }}
                >
                  <ListItemIcon sx={{ color: "inherit", minWidth: 34 }}><Icon sx={{ fontSize: 20 }} /></ListItemIcon>
                  <ListItemText primary={menu.title} primaryTypographyProps={{ fontSize: "0.82rem", fontWeight: selected ? 600 : 400 }} />
                  {menu.sub && (subOpen ? <ExpandLess sx={{ fontSize: 18 }} /> : <ExpandMore sx={{ fontSize: 18 }} />)}
                </ListItemButton>
                {menu.sub && (
                  <Collapse in={subOpen}>
                    <List disablePadding sx={{ pl: 2, mt: 0.3 }}>
                      {menu.sub.map((sub) => {
                        const SubIcon = sub.icon;
                        // Exact match for list routes; prefix match for /add and /edit children
                        const subActive = sub.state
                          ? location.pathname === sub.path && Boolean(location.state?.openAdd)
                          : (location.pathname === sub.path
                            || (sub.path.endsWith("/add") && location.pathname.startsWith(sub.path))
                            || (sub.path.includes("/edit") && location.pathname.startsWith(sub.path.replace(/\/edit.*/, "/edit"))));
                        return (
                          <ListItemButton
                            key={sub.title}
                            selected={subActive}
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(sub.path, { state: sub.state });
                            }}
                            sx={{
                              borderRadius: 2, py: 0.7, px: 1.5, minHeight: 34,
                              color: subActive ? "#60A5FA" : "rgba(255,255,255,0.5)",
                              bgcolor: subActive ? "rgba(37,99,235,0.2) !important" : "transparent",
                            }}
                          >
                            <ListItemIcon sx={{ color: "inherit", minWidth: 28 }}><SubIcon sx={{ fontSize: 16 }} /></ListItemIcon>
                            <ListItemText primary={sub.title} primaryTypographyProps={{ fontSize: "0.78rem", fontWeight: subActive ? 600 : 400 }} />
                          </ListItemButton>
                        );
                      })}
                    </List>
                  </Collapse>
                )}
              </Box>
            );
          })}
        </List>
      </Box>

      <Box sx={{ px: 1.5, py: 1.5, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        <ListItemButton
          selected={location.pathname.startsWith("/sub-admin/messages") && location.state?.contactRole === "MAIN_ADMIN"}
          onClick={() => navigate("/sub-admin/messages", { state: { contactRole: "MAIN_ADMIN" } })}
          sx={{
            borderRadius: 2, py: 0.75, px: 1.25, minHeight: 36, mb: 0.75,
            color: location.pathname.startsWith("/sub-admin/messages") && location.state?.contactRole === "MAIN_ADMIN" ? "#60A5FA" : "rgba(255,255,255,0.65)",
            bgcolor: location.pathname.startsWith("/sub-admin/messages") && location.state?.contactRole === "MAIN_ADMIN" ? "rgba(37,99,235,0.2) !important" : "transparent",
            "&:hover": { bgcolor: "rgba(255,255,255,0.08)" },
          }}
        >
          <ListItemIcon sx={{ color: "inherit", minWidth: 30 }}>
            <AdminPanelSettings sx={{ fontSize: 18 }} />
          </ListItemIcon>
          <ListItemText primary="Contact Main Admin" primaryTypographyProps={{ fontSize: "0.78rem" }} />
        </ListItemButton>

        <Box display="flex" alignItems="center" gap={1.5} sx={{ cursor: "pointer", px: 0.5 }} onClick={() => navigate("/sub-admin/profile")}>
          <Avatar sx={{ width: 36, height: 36, bgcolor: "#2563EB", fontSize: "0.85rem" }}>{initials}</Avatar>
          <Box>
            <Typography sx={{ fontWeight: 600, fontSize: "0.82rem", color: "#FFF" }}>{fullName}</Typography>
            <Typography sx={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.5)" }}>{roleLabel}</Typography>
          </Box>
        </Box>
        <ListItemButton onClick={handleLogout} sx={{ borderRadius: 2, mt: 1, py: 0.8, color: "#F87171", "&:hover": { bgcolor: "rgba(248,113,113,0.1)" } }}>
          <ListItemIcon sx={{ color: "#F87171", minWidth: 34 }}><Logout sx={{ fontSize: 18 }} /></ListItemIcon>
          <ListItemText primary="Logout" primaryTypographyProps={{ fontSize: "0.82rem" }} />
        </ListItemButton>
      </Box>
    </Drawer>
  );
}
