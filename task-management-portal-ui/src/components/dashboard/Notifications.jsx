import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import {
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Chip,
  Divider,
  Box,
} from "@mui/material";

import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import LockResetIcon from "@mui/icons-material/LockReset";

export default function Notifications() {
  const [notificationsList, setNotificationsList] = useState([]);

  useEffect(() => {
    // Read dynamic user profile state from localStorage
    let employee = null;
    try {
      const stored = localStorage.getItem("employeeProfile");
      if (stored) {
        employee = JSON.parse(stored);
      }
    } catch (e) {
      console.error("Failed to parse employee details for notifications", e);
    }

    // Build dynamic notifications array
    const dynamicList = [];

    // 1. Account Creation / Login Notification
    dynamicList.push({
      id: "login-auth",
      title: "Account Active",
      message: employee?.username
        ? `Logged in as ${employee.username}`
        : "Successfully authenticated to portal.",
      type: "Auth",
      color: "success",
      icon: <LockResetIcon color="success" />,
    });

    // 2. Profile Completion Status
    if (employee?.firstName && employee?.email && employee?.department) {
      dynamicList.push({
        id: "profile-complete",
        title: "Profile Configured",
        message: `Profile active for ${employee.firstName} ${employee.lastName || ""}`.trim(),
        type: "Profile",
        color: "primary",
        icon: <AssignmentIndIcon color="primary" />,
      });
    } else {
      dynamicList.push({
        id: "profile-pending",
        title: "Profile Incomplete",
        message: "Please update your personal and company details in the Profile tab.",
        type: "Profile",
        color: "warning",
        icon: <WarningAmberIcon color="warning" />,
      });
    }

    // 3. Document Verification Status
    if (employee?.idDocumentUrl || employee?.idDocumentFile || employee?.idDocumentNumber) {
      dynamicList.push({
        id: "doc-verified",
        title: "Identity Document Uploaded",
        message: "Your identity verification document has been submitted.",
        type: "Verification",
        color: "info",
        icon: <CheckCircleOutlineIcon color="info" />,
      });
    } else {
      dynamicList.push({
        id: "doc-pending",
        title: "Document Pending",
        message: "Upload identity proof to finalize compliance setup.",
        type: "Verification",
        color: "warning",
        icon: <WarningAmberIcon color="warning" />,
      });
    }

    setNotificationsList(dynamicList);
  }, []);

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 3,
        border: "1px solid #E2E8F0",
        bgcolor: "#FFFFFF",
        height: "100%",
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
          <NotificationsActiveIcon sx={{ color: "#3B82F6" }} />
          <Typography variant="h6" sx={{ fontWeight: 700, color: "#0F172A" }}>
            Notifications & Alerts
          </Typography>
        </Box>

        <Divider sx={{ borderColor: "#F1F5F9", mb: 1 }} />

        <List disablePadding>
          {notificationsList.map((item, index) => (
            <React.Fragment key={item.id}>
              <ListItem
                sx={{ px: 1, py: 1.5 }}
                secondaryAction={
                  <Chip
                    label={item.type}
                    color={item.color}
                    size="small"
                    variant="outlined"
                    sx={{ fontWeight: 600 }}
                  />
                }
              >
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: "#F8FAFC", border: "1px solid #E2E8F0" }}>
                    {item.icon}
                  </Avatar>
                </ListItemAvatar>

                <ListItemText
                  primary={
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#0F172A" }}>
                      {item.title}
                    </Typography>
                  }
                  secondary={
                    <Typography variant="body2" sx={{ color: "#64748B", fontSize: "0.85rem" }}>
                      {item.message}
                    </Typography>
                  }
                />
              </ListItem>

              {index !== notificationsList.length - 1 && (
                <Divider sx={{ borderColor: "#F1F5F9" }} />
              )}
            </React.Fragment>
          ))}
        </List>
      </CardContent>
    </Card>
  );
}

Notifications.propTypes = {
  // Can be extended if passing real-time notifications via props or WebSockets later
};