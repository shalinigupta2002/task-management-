import { useNavigate, useLocation } from "react-router-dom";
import {
  Drawer, Toolbar, List, ListItemButton, ListItemIcon, ListItemText, Box, Divider, Typography, Collapse,
} from "@mui/material";
import {
  Dashboard, Apartment, People, Category, Schedule, Assignment,
  Assessment, CalendarMonth, Settings, AdminPanelSettings, NotificationsNone, Chat, History, Business,
  Logout, AssignmentTurnedIn, ListAlt, PersonAdd, ExpandLess, ExpandMore, Add as AddIcon, Security,
} from "@mui/icons-material";

export const DRAWER_WIDTH = 260;

const MENUS = [
  { title: "Dashboard", icon: Dashboard, path: "/dashboard", exact: true },
  {
    title: "User Management", icon: People, path: "/dashboard/users",
    subKey: "management",
    sub: [
      { title: "Users", icon: ListAlt, path: "/dashboard/users" },
      { title: "Add Employee", icon: PersonAdd, path: "/dashboard/employees/add" },
      { title: "Add Sub Admin", icon: PersonAdd, path: "/dashboard/admins/add" },
      { title: "Roles & Permissions", icon: AdminPanelSettings, path: "/dashboard/roles" },
    ],
  },
  {
    title: "Departments", icon: Apartment, path: "/dashboard/departments",
    subKey: "departments",
    sub: [
      { title: "Department List", icon: ListAlt, path: "/dashboard/departments" },
      { title: "+ Add Department", icon: AddIcon, path: "/dashboard/departments/add" },
    ],
  },
  {
    title: "Task Categories", icon: Category, path: "/dashboard/categories",
    subKey: "categories",
    sub: [
      { title: "Category List", icon: ListAlt, path: "/dashboard/categories" },
      { title: "Add Category", icon: AddIcon, path: "/dashboard/categories/add" },
    ],
  },
  {
    title: "Frequencies", icon: Schedule, path: "/dashboard/frequencies",
    subKey: "frequencies",
    sub: [
      { title: "Frequency List", icon: ListAlt, path: "/dashboard/frequencies" },
      { title: "Add Frequency", icon: AddIcon, path: "/dashboard/frequencies/add" },
    ],
  },
  {
    title: "Tasks", icon: Assignment, path: "/dashboard/tasks",
    subKey: "tasks",
    sub: [
      { title: "Task List", icon: ListAlt, path: "/dashboard/tasks" },
      { title: "Add Task", icon: AddIcon, path: "/dashboard/tasks/add" },
    ],
  },
  { title: "Calendar", icon: CalendarMonth, path: "/dashboard/calendar",
    subKey: "calendar",
    sub: [
      { title: "Daily View", icon: ListAlt, path: "/dashboard/calendar" },
      { title: "Monthly View", icon: CalendarMonth, path: "/dashboard/calendar/monthly" },
      { title: "Yearly View", icon: CalendarMonth, path: "/dashboard/calendar/yearly" },
    ],
  },
  { title: "Reports", icon: Assessment, path: "/dashboard/reports" },
  { title: "Notifications", icon: NotificationsNone, path: "/dashboard/notifications" },
  { title: "Messages", icon: Chat, path: "/dashboard/messages" },
  { title: "Audit Logs", icon: History, path: "/dashboard/audit-logs" },
  {
    title: "Settings", icon: Settings, path: "/dashboard/company-settings",
    subKey: "settings",
    sub: [
      { title: "Company Settings", icon: Business, path: "/dashboard/company-settings" },
      { title: "Notification Settings", icon: NotificationsNone, path: "/dashboard/notification-settings" },
      { title: "Profile", icon: PersonAdd, path: "/dashboard/profile" },
    ],
  },
];

function isMenuActive(path, exact, pathname) {
  if (exact) return pathname === path;
  return pathname === path || pathname.startsWith(`${path}/`);
}

function isSubMenuOpen(menu, pathname) {
  if (!menu.sub) return false;
  if (menu.subKey === "management") {
    return pathname.startsWith("/dashboard/users") || pathname.startsWith("/dashboard/employees") || pathname.startsWith("/dashboard/admins") || pathname.startsWith("/dashboard/roles");
  }
  if (menu.subKey === "departments") {
    return pathname.startsWith("/dashboard/departments");
  }
  if (menu.subKey === "settings") {
    return pathname.startsWith("/dashboard/company-settings") || pathname.startsWith("/dashboard/notification-settings") || pathname === "/dashboard/profile";
  }
  if (menu.subKey === "categories") {
    return pathname.startsWith("/dashboard/categories");
  }
  if (menu.subKey === "frequencies") {
    return pathname.startsWith("/dashboard/frequencies");
  }
  if (menu.subKey === "tasks") {
    return pathname.startsWith("/dashboard/tasks");
  }
  if (menu.subKey === "calendar") {
    return pathname.startsWith("/dashboard/calendar");
  }
  return menu.sub.some((s) => pathname === s.path || pathname.startsWith(`${s.path}/`));
}

function isMenuSelected(menu, pathname) {
  if (menu.sub) return isSubMenuOpen(menu, pathname);
  return isMenuActive(menu.path, menu.exact, pathname);
}

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Drawer variant="permanent" sx={{
      width: DRAWER_WIDTH, flexShrink: 0,
      "& .MuiDrawer-paper": {
        width: DRAWER_WIDTH, boxSizing: "border-box", background: "#0F172A", color: "#FFF",
        borderRight: "none", display: "flex", flexDirection: "column",
      },
    }}>
      <Toolbar sx={{ px: 2, py: 2, gap: 1.5 }}>
        <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: "#2563EB", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <AssignmentTurnedIn sx={{ color: "#FFF", fontSize: 20 }} />
        </Box>
        <Box>
          <Typography sx={{ fontWeight: 800, fontSize: "1.05rem", lineHeight: 1.1 }}>TaskFlow</Typography>
          <Typography sx={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.5)" }}>Task Management System</Typography>
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
                <ListItemButton selected={selected} onClick={() => navigate(menu.sub ? menu.sub[0].path : menu.path)} sx={{
                  borderRadius: 2, py: 1, px: 1.5, minHeight: 40,
                  color: selected ? "#FFF" : "rgba(255,255,255,0.6)",
                  bgcolor: selected ? "#2563EB !important" : "transparent",
                  "&:hover": { bgcolor: selected ? "#2563EB !important" : "rgba(255,255,255,0.08)" },
                }}>
                  <ListItemIcon sx={{ color: "inherit", minWidth: 34 }}>
                    <Icon sx={{ fontSize: 20 }} />
                  </ListItemIcon>
                  <ListItemText primary={menu.title} primaryTypographyProps={{ fontSize: "0.82rem", fontWeight: selected ? 600 : 400 }} />
                  {menu.sub && (subOpen ? <ExpandLess sx={{ fontSize: 18 }} /> : <ExpandMore sx={{ fontSize: 18 }} />)}
                </ListItemButton>

                {menu.sub && (
                  <Collapse in={subOpen}>
                    <List disablePadding sx={{ pl: 2, mt: 0.3 }}>
                      {menu.sub.map((sub) => {
                        const SubIcon = sub.icon;
                        const subActive = menu.subKey === "management"
                          ? (sub.path === "/dashboard/users"
                            ? location.pathname === "/dashboard/users" || (location.pathname.startsWith("/dashboard/users/") && !location.pathname.endsWith("/add") && !location.pathname.includes("/edit"))
                            : sub.path === "/dashboard/employees/add"
                              ? location.pathname === "/dashboard/employees/add"
                              : sub.path === "/dashboard/admins/add"
                                ? location.pathname === "/dashboard/admins/add"
                                : location.pathname.startsWith(sub.path))
                          : menu.subKey === "departments"
                          ? (sub.path === "/dashboard/departments"
                            ? location.pathname === "/dashboard/departments" || (location.pathname.startsWith("/dashboard/departments/") && location.pathname !== "/dashboard/departments/add")
                            : location.pathname === sub.path)
                          : menu.subKey === "tasks"
                          ? (sub.path === "/dashboard/tasks"
                            ? location.pathname === "/dashboard/tasks"
                              || (location.pathname.startsWith("/dashboard/tasks/")
                                && !location.pathname.startsWith("/dashboard/tasks/assigned")
                                && location.pathname !== "/dashboard/tasks/add"
                                && !location.pathname.includes("/edit/"))
                            : sub.path === "/dashboard/tasks/add"
                              ? location.pathname === "/dashboard/tasks/add"
                              : location.pathname.startsWith(sub.path))
                          : menu.subKey === "calendar"
                            ? (sub.path === "/dashboard/calendar"
                              ? location.pathname === "/dashboard/calendar"
                              : location.pathname === sub.path)
                            : location.pathname === sub.path;
                        return (
                          <ListItemButton key={sub.title} selected={subActive} onClick={() => navigate(sub.path)} sx={{
                            borderRadius: 2, py: 0.7, px: 1.5, minHeight: 34,
                            color: subActive ? "#60A5FA" : "rgba(255,255,255,0.5)",
                            bgcolor: subActive ? "rgba(37,99,235,0.2) !important" : "transparent",
                          }}>
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
          selected={location.pathname.startsWith("/dashboard/messages") && location.state?.contactRole === "SUPER_ADMIN"}
          onClick={() => navigate("/dashboard/messages", { state: { contactRole: "SUPER_ADMIN" } })}
          sx={{
            borderRadius: 2, py: 0.75, px: 1.25, minHeight: 36, mb: 0.75,
            color: location.pathname.startsWith("/dashboard/messages") && location.state?.contactRole === "SUPER_ADMIN" ? "#60A5FA" : "rgba(255,255,255,0.65)",
            bgcolor: location.pathname.startsWith("/dashboard/messages") && location.state?.contactRole === "SUPER_ADMIN" ? "rgba(37,99,235,0.2) !important" : "transparent",
            "&:hover": { bgcolor: "rgba(255,255,255,0.08)" },
          }}
        >
          <ListItemIcon sx={{ color: "inherit", minWidth: 30 }}>
            <Security sx={{ fontSize: 18 }} />
          </ListItemIcon>
          <ListItemText primary="Contact Super Admin" primaryTypographyProps={{ fontSize: "0.78rem" }} />
        </ListItemButton>

        <ListItemButton onClick={() => { localStorage.removeItem("isAuthenticated"); navigate("/login"); }}
          sx={{ borderRadius: 2, py: 0.8, color: "#F87171", "&:hover": { bgcolor: "rgba(248,113,113,0.1)" } }}>
          <ListItemIcon sx={{ color: "#F87171", minWidth: 34 }}><Logout sx={{ fontSize: 18 }} /></ListItemIcon>
          <ListItemText primary="Logout" primaryTypographyProps={{ fontSize: "0.82rem" }} />
        </ListItemButton>
      </Box>
    </Drawer>
  );
}
