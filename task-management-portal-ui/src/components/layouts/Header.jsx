import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import {
  AppBar,
  Avatar,
  Badge,
  Box,
  IconButton,
  Toolbar,
  Typography,
  Menu,
  MenuItem,
  Divider,
  ListItemIcon,
} from "@mui/material";

import {
  NotificationsOutlined,
  PersonOutline,
  LogoutOutlined,
  SettingsOutlined,
} from "@mui/icons-material";

const DRAWER_WIDTH = 250;

export default function Header({ drawerWidth = DRAWER_WIDTH }) {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [user, setUser] = useState({
    name: "Admin",
    role: "Administrator",
  });

  const isMenuOpen = Boolean(anchorEl);

  // Load active logged-in user dynamically from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("employeeProfile");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.firstName || parsed.username) {
          setUser({
            name: parsed.firstName
              ? `${parsed.firstName} ${parsed.lastName || ""}`.trim()
              : parsed.username,
            role: parsed.role || parsed.designation || "Administrator",
          });
        }
      }
    } catch (e) {
      console.error("Failed to parse user session in Header", e);
    }
  }, []);

  const handleOpenProfileMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleNavigateProfile = () => {
    handleCloseMenu();
    navigate("/dashboard/profile");
  };

  const handleLogout = () => {
    handleCloseMenu();
    localStorage.removeItem("isAuthenticated");
    navigate("/login");
  };

  return (
    <AppBar
      position="fixed"
      color="inherit"
      elevation={0}
      sx={{
        width: { sm: `calc(100% - ${drawerWidth}px)` },
        ml: { sm: `${drawerWidth}px` },
        bgcolor: "#FFFFFF",
        borderBottom: "1px solid #E2E8F0",
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar sx={{ justifyContent: "space-between", px: { xs: 2, sm: 4 } }}>
        {/* Title / Section Header */}
        <Typography
          variant="h6"
          sx={{
            fontWeight: 800,
            color: "#0F172A",
            fontSize: "1.25rem",
          }}
        >
          Dashboard
        </Typography>

        {/* Right Side Control Panel */}
        <Box display="flex" alignItems="center" gap={2}>
          {/* Notifications Button */}
          <IconButton
            size="large"
            aria-label="show notifications"
            sx={{
              color: "#64748B",
              "&:hover": { bgcolor: "#F1F5F9" },
            }}
          >
            <Badge badgeContent={3} color="error">
              <NotificationsOutlined />
            </Badge>
          </IconButton>

          <Divider orientation="vertical" flexItem sx={{ my: 1, borderColor: "#E2E8F0" }} />

          {/* Interactive Profile Menu Trigger */}
          <Box
            onClick={handleOpenProfileMenu}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              cursor: "pointer",
              p: 0.5,
              borderRadius: 2,
              transition: "background-color 0.2s ease",
              "&:hover": {
                bgcolor: "#F8FAFC",
              },
            }}
          >
            <Avatar
              sx={{
                bgcolor: "#1E3A8A",
                color: "#FFFFFF",
                fontWeight: 700,
                width: 38,
                height: 38,
              }}
            >
              {user.name.charAt(0).toUpperCase()}
            </Avatar>

            <Box sx={{ display: { xs: "none", sm: "block" } }}>
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: 14,
                  color: "#0F172A",
                  lineHeight: 1.2,
                }}
              >
                {user.name}
              </Typography>

              <Typography
                sx={{
                  fontSize: 12,
                  color: "#64748B",
                  fontWeight: 500,
                }}
              >
                {user.role}
              </Typography>
            </Box>
          </Box>

          {/* Dropdown Menu */}
          <Menu
            anchorEl={anchorEl}
            open={isMenuOpen}
            onClose={handleCloseMenu}
            onClick={handleCloseMenu}
            transformOrigin={{ horizontal: "right", vertical: "top" }}
            anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
            PaperProps={{
              elevation: 0,
              sx: {
                overflow: "visible",
                filter: "drop-shadow(0px 4px 12px rgba(0,0,0,0.08))",
                mt: 1.5,
                borderRadius: 2.5,
                minWidth: 190,
                border: "1px solid #E2E8F0",
                "& .MuiMenuItem-root": {
                  px: 2,
                  py: 1,
                  fontSize: 14,
                  fontWeight: 500,
                },
              },
            }}
          >
            <MenuItem onClick={handleNavigateProfile}>
              <ListItemIcon>
                <PersonOutline fontSize="small" sx={{ color: "#3B82F6" }} />
              </ListItemIcon>
              View Profile
            </MenuItem>

            <MenuItem onClick={handleNavigateProfile}>
              <ListItemIcon>
                <SettingsOutlined fontSize="small" sx={{ color: "#64748B" }} />
              </ListItemIcon>
              Settings
            </MenuItem>

            <Divider sx={{ my: 0.5, borderColor: "#F1F5F9" }} />

            <MenuItem onClick={handleLogout} sx={{ color: "#EF4444" }}>
              <ListItemIcon>
                <LogoutOutlined fontSize="small" sx={{ color: "#EF4444" }} />
              </ListItemIcon>
              Logout
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

Header.propTypes = {
  drawerWidth: PropTypes.number,
};