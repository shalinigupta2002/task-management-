import { useNavigate, useLocation } from "react-router-dom";
import {
  Drawer, Toolbar, List, ListItemButton, ListItemIcon, ListItemText, Box, Divider, Typography, Avatar, Collapse, Badge,
} from "@mui/material";
import {
  Dashboard, Business, AddBusiness, ListAlt, CardMembership, Add as AddIcon,
  Assessment, NotificationsNone, Chat, History, Settings, Logout, AssignmentTurnedIn, ExpandLess, ExpandMore,
} from "@mui/icons-material";
import { getNotifications } from "../../utils/superAdminStorage";

export const DRAWER_WIDTH = 260;

const MENUS = [
  { title: "Dashboard", icon: Dashboard, path: "/super-admin/dashboard", exact: true },
  {
    title: "Company Management", icon: Business, path: "/super-admin/companies",
    subKey: "companies",
    sub: [
      { title: "Company List", icon: ListAlt, path: "/super-admin/companies" },
      { title: "Add Company", icon: AddBusiness, path: "/super-admin/companies/add" },
    ],
  },
  {
    title: "Plan Management", icon: CardMembership, path: "/super-admin/plans",
    subKey: "plans",
    sub: [
      { title: "Plan List", icon: ListAlt, path: "/super-admin/plans" },
      { title: "Add Plan", icon: AddIcon, path: "/super-admin/plans/add" },
    ],
  },
  { title: "Reports", icon: Assessment, path: "/super-admin/reports" },
  { title: "Notifications", icon: NotificationsNone, path: "/super-admin/notifications", badgeFromStorage: true },
  { title: "Messages", icon: Chat, path: "/super-admin/messages" },
  { title: "Audit Logs", icon: History, path: "/super-admin/audit-logs" },
  { title: "Global Settings", icon: Settings, path: "/super-admin/settings" },
];

function isMenuActive(path, exact, pathname) {
  if (exact) return pathname === path;
  return pathname === path || pathname.startsWith(`${path}/`);
}

function isSubMenuOpen(menu, pathname) {
  if (!menu.sub) return false;
  return menu.sub.some((s) => pathname === s.path || pathname.startsWith(`${s.path}/`));
}

function isMenuSelected(menu, pathname) {
  if (menu.sub) return isSubMenuOpen(menu, pathname);
  return isMenuActive(menu.path, menu.exact, pathname);
}

export default function SuperAdminSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const unreadNotifications = getNotifications().filter((n) => !n.read).length;

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
          <Typography sx={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.5)" }}>Super Admin Portal</Typography>
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
                  onClick={() => navigate(menu.sub ? menu.sub[0].path : menu.path)}
                  sx={{
                    borderRadius: 2, py: 1, px: 1.5, minHeight: 40,
                    color: selected ? "#FFF" : "rgba(255,255,255,0.6)",
                    bgcolor: selected ? "#2563EB !important" : "transparent",
                    "&:hover": { bgcolor: selected ? "#2563EB !important" : "rgba(255,255,255,0.08)" },
                  }}
                >
                  <ListItemIcon sx={{ color: "inherit", minWidth: 34 }}>
                    {menu.badgeFromStorage && unreadNotifications > 0 ? (
                      <Badge badgeContent={unreadNotifications} color="error" sx={{ "& .MuiBadge-badge": { fontSize: "0.6rem", minWidth: 16, height: 16 } }}>
                        <Icon sx={{ fontSize: 20 }} />
                      </Badge>
                    ) : (
                      <Icon sx={{ fontSize: 20 }} />
                    )}
                  </ListItemIcon>
                  <ListItemText primary={menu.title} primaryTypographyProps={{ fontSize: "0.82rem", fontWeight: selected ? 600 : 400 }} />
                  {menu.sub && (subOpen ? <ExpandLess sx={{ fontSize: 18 }} /> : <ExpandMore sx={{ fontSize: 18 }} />)}
                </ListItemButton>

                {menu.sub && (
                  <Collapse in={subOpen}>
                    <List disablePadding sx={{ pl: 2, mt: 0.3 }}>
                      {menu.sub.map((sub) => {
                        const SubIcon = sub.icon;
                        const subActive = location.pathname === sub.path || (sub.path !== "/super-admin/companies" && sub.path !== "/super-admin/plans" && location.pathname.startsWith(sub.path));
                        const isListPath = sub.path === "/super-admin/companies" || sub.path === "/super-admin/plans";
                        const active = isListPath
                          ? location.pathname === sub.path || (location.pathname.startsWith(`${sub.path}/`) && !location.pathname.endsWith("/add"))
                          : location.pathname === sub.path;
                        return (
                          <ListItemButton key={sub.title} selected={active} onClick={() => navigate(sub.path)} sx={{
                            borderRadius: 2, py: 0.7, px: 1.5, minHeight: 34,
                            color: active ? "#60A5FA" : "rgba(255,255,255,0.5)",
                            bgcolor: active ? "rgba(37,99,235,0.2) !important" : "transparent",
                          }}>
                            <ListItemIcon sx={{ color: "inherit", minWidth: 28 }}><SubIcon sx={{ fontSize: 16 }} /></ListItemIcon>
                            <ListItemText primary={sub.title} primaryTypographyProps={{ fontSize: "0.78rem", fontWeight: active ? 600 : 400 }} />
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

      <Box sx={{ px: 2, py: 2, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        <Box display="flex" alignItems="center" gap={1.5}>
          <Avatar sx={{ width: 36, height: 36, bgcolor: "#2563EB", fontSize: "0.85rem" }}>SA</Avatar>
          <Box>
            <Typography sx={{ fontWeight: 600, fontSize: "0.82rem", color: "#FFF" }}>Super Admin</Typography>
            <Typography sx={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.5)" }}>Platform Owner</Typography>
          </Box>
        </Box>
        <ListItemButton
          onClick={() => {
            localStorage.removeItem("isAuthenticated");
            localStorage.removeItem("userRole");
            localStorage.removeItem("accessToken");
            localStorage.removeItem("user");
            navigate("/login");
          }}
          sx={{ borderRadius: 2, mt: 1, py: 0.8, color: "#F87171", "&:hover": { bgcolor: "rgba(248,113,113,0.1)" } }}
        >
          <ListItemIcon sx={{ color: "#F87171", minWidth: 34 }}><Logout sx={{ fontSize: 18 }} /></ListItemIcon>
          <ListItemText primary="Logout" primaryTypographyProps={{ fontSize: "0.82rem" }} />
        </ListItemButton>
      </Box>
    </Drawer>
  );
}
