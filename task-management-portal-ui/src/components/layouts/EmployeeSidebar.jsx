import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  Drawer, Toolbar, List, ListItemButton, ListItemIcon, ListItemText, Box, Divider, Typography, Avatar, Badge,
} from "@mui/material";
import {
  Dashboard, Assignment, CalendarMonth, Notifications, Chat, History, Person, Logout, AssignmentTurnedIn,
  SupportAgent,
} from "@mui/icons-material";
import messageService from "../../services/messageService";
import useCurrentUser from "../../hooks/useCurrentUser";
import notificationService from "../../services/notificationService";
import { STORAGE_KEYS } from "../../constants/storageKeys";

export const EMPLOYEE_DRAWER_WIDTH = 260;

const MENUS = [
  { title: "Dashboard", icon: Dashboard, path: "/employee/dashboard", exact: true },
  { title: "My Tasks", icon: Assignment, path: "/employee/tasks" },
  { title: "Calendar", icon: CalendarMonth, path: "/employee/calendar" },
  { title: "Notifications", icon: Notifications, path: "/employee/notifications", badgeKey: "notifications" },
  { title: "Messages", icon: Chat, path: "/employee/messages", badgeKey: "messages" },
  { title: "Activity History", icon: History, path: "/employee/activity" },
  { title: "Profile", icon: Person, path: "/employee/profile" },
];

const CONTACT_ACTIONS = [
  {
    title: "Contact Sub Admin",
    icon: SupportAgent,
    contactRole: "SUB_ADMIN",
  },
];

function isActive(path, exact, pathname) {
  if (exact) return pathname === path;
  if (path === "/employee/tasks") return pathname === path || (pathname.startsWith("/employee/tasks/") && !pathname.includes("/complete"));
  return pathname === path || pathname.startsWith(`${path}/`);
}

function clearAuth() {
  localStorage.removeItem(STORAGE_KEYS.isAuthenticated);
  localStorage.removeItem(STORAGE_KEYS.accessToken);
  localStorage.removeItem(STORAGE_KEYS.refreshToken);
  localStorage.removeItem(STORAGE_KEYS.user);
  localStorage.removeItem("userRole");
  localStorage.removeItem("isAuthenticated");
}

const bottomItemSx = (selected) => ({
  borderRadius: 2,
  py: 0.75,
  px: 1.25,
  minHeight: 36,
  color: selected ? "#60A5FA" : "rgba(255,255,255,0.65)",
  bgcolor: selected ? "rgba(37,99,235,0.2) !important" : "transparent",
  "&:hover": { bgcolor: selected ? "rgba(37,99,235,0.25) !important" : "rgba(255,255,255,0.08)" },
});

export default function EmployeeSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useCurrentUser();
  const [unreadNotifs, setUnreadNotifs] = useState(0);
  const [unreadMsgs, setUnreadMsgs] = useState(0);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const result = await notificationService.getCount();
        if (active) setUnreadNotifs(result?.unreadCount ?? 0);
      } catch {
        if (active) setUnreadNotifs(0);
      }
    })();
    (async () => {
      try {
        const result = await messageService.getUnreadCount();
        if (active) setUnreadMsgs(result?.unreadCount ?? 0);
      } catch {
        if (active) setUnreadMsgs(0);
      }
    })();
    return () => { active = false; };
  }, [location.pathname]);

  const firstName = user?.firstName || "";
  const lastName = user?.lastName || "";
  const initials = `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase() || "?";
  const displayName = `${firstName} ${lastName}`.trim() || "Employee";
  const contactRole = location.state?.contactRole;
  const onMessages = location.pathname.startsWith("/employee/messages");
  const profileActive = isActive("/employee/profile", false, location.pathname);

  const getBadge = (key) => {
    if (key === "notifications") return unreadNotifs || undefined;
    if (key === "messages") return unreadMsgs || undefined;
    return undefined;
  };

  const openContact = (role) => {
    navigate("/employee/messages", { state: { contactRole: role } });
  };

  return (
    <Drawer variant="permanent" sx={{
      width: EMPLOYEE_DRAWER_WIDTH, flexShrink: 0,
      "& .MuiDrawer-paper": {
        width: EMPLOYEE_DRAWER_WIDTH, boxSizing: "border-box", background: "#0F172A", color: "#FFF",
        borderRight: "none", display: "flex", flexDirection: "column",
      },
    }}>
      <Toolbar sx={{ px: 2, py: 2, gap: 1.5 }}>
        <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: "#2563EB", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <AssignmentTurnedIn sx={{ color: "#FFF", fontSize: 20 }} />
        </Box>
        <Box>
          <Typography sx={{ fontWeight: 800, fontSize: "1.05rem", lineHeight: 1.1 }}>TaskFlow</Typography>
          <Typography sx={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.5)" }}>Employee Portal</Typography>
        </Box>
      </Toolbar>
      <Divider sx={{ borderColor: "rgba(255,255,255,0.08)", mx: 2 }} />
      <Box sx={{ flex: 1, overflowY: "auto", px: 1.5, py: 1.5 }}>
        <List disablePadding sx={{ display: "flex", flexDirection: "column", gap: 0.3 }}>
          {MENUS.map((menu) => {
            const selected = isActive(menu.path, menu.exact, location.pathname);
            const Icon = menu.icon;
            const badge = menu.badgeKey ? getBadge(menu.badgeKey) : undefined;
            return (
              <ListItemButton key={menu.title} selected={selected} onClick={() => navigate(menu.path)} sx={{
                borderRadius: 2, py: 1, px: 1.5, minHeight: 40,
                color: selected ? "#FFF" : "rgba(255,255,255,0.6)",
                bgcolor: selected ? "#2563EB !important" : "transparent",
                "&:hover": { bgcolor: selected ? "#2563EB !important" : "rgba(255,255,255,0.08)" },
              }}>
                <ListItemIcon sx={{ color: "inherit", minWidth: 34 }}>
                  {badge ? (
                    <Badge badgeContent={badge} color="error" sx={{ "& .MuiBadge-badge": { fontSize: "0.6rem", minWidth: 16, height: 16 } }}>
                      <Icon sx={{ fontSize: 20 }} />
                    </Badge>
                  ) : <Icon sx={{ fontSize: 20 }} />}
                </ListItemIcon>
                <ListItemText primary={menu.title} primaryTypographyProps={{ fontSize: "0.82rem", fontWeight: selected ? 600 : 400 }} />
              </ListItemButton>
            );
          })}
        </List>
      </Box>
      <Box sx={{ px: 1.5, py: 1.5, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        <List disablePadding sx={{ display: "flex", flexDirection: "column", gap: 0.25, mb: 1 }}>
          {CONTACT_ACTIONS.map((action) => {
            const Icon = action.icon;
            const selected = onMessages && contactRole === action.contactRole;
            return (
              <ListItemButton
                key={action.contactRole}
                selected={selected}
                onClick={() => openContact(action.contactRole)}
                sx={bottomItemSx(selected)}
              >
                <ListItemIcon sx={{ color: "inherit", minWidth: 30 }}>
                  <Icon sx={{ fontSize: 18 }} />
                </ListItemIcon>
                <ListItemText
                  primary={action.title}
                  primaryTypographyProps={{ fontSize: "0.78rem", fontWeight: selected ? 600 : 400 }}
                />
              </ListItemButton>
            );
          })}
        </List>

        <Box
          display="flex"
          alignItems="center"
          gap={1.5}
          sx={{
            cursor: "pointer",
            borderRadius: 2,
            px: 1.25,
            py: 0.85,
            bgcolor: profileActive ? "rgba(37,99,235,0.2)" : "transparent",
            "&:hover": { bgcolor: "rgba(255,255,255,0.08)" },
          }}
          onClick={() => navigate("/employee/profile")}
        >
          <Avatar sx={{ width: 34, height: 34, bgcolor: "#2563EB", fontSize: "0.8rem" }}>
            {initials}
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontWeight: 600, fontSize: "0.8rem", color: "#FFF", lineHeight: 1.2 }} noWrap>
              {displayName}
            </Typography>
            <Typography sx={{ fontSize: "0.68rem", color: profileActive ? "#60A5FA" : "rgba(255,255,255,0.5)" }}>
              Profile
            </Typography>
          </Box>
        </Box>

        <ListItemButton
          onClick={() => { clearAuth(); navigate("/login"); }}
          sx={{ borderRadius: 2, mt: 0.75, py: 0.8, color: "#F87171", "&:hover": { bgcolor: "rgba(248,113,113,0.1)" } }}
        >
          <ListItemIcon sx={{ color: "#F87171", minWidth: 34 }}><Logout sx={{ fontSize: 18 }} /></ListItemIcon>
          <ListItemText primary="Logout" primaryTypographyProps={{ fontSize: "0.82rem" }} />
        </ListItemButton>
      </Box>
    </Drawer>
  );
}
