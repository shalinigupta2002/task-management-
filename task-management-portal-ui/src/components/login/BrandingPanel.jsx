import { Box, Stack, Typography, Avatar } from "@mui/material";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import TaskAltRoundedIcon from "@mui/icons-material/TaskAltRounded";
import EventAvailableRoundedIcon from "@mui/icons-material/EventAvailableRounded";
import AnalyticsRoundedIcon from "@mui/icons-material/AnalyticsRounded";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";

const FEATURES = [
  { title: "Employee Management", description: "Manage your workforce efficiently", icon: <GroupsRoundedIcon /> },
  { title: "Task Tracking", description: "Assign and monitor daily tasks", icon: <TaskAltRoundedIcon /> },
  { title: "Attendance", description: "Track employee attendance in real-time", icon: <EventAvailableRoundedIcon /> },
  { title: "Reports & Analytics", description: "Generate strategic business insights", icon: <AnalyticsRoundedIcon /> },
];

function BrandingPanel() {
  return (
    <Box sx={{
      flex: 1,
      width: "100%",
      height: "100%",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      p: { lg: 3.5, xl: 4 },
      bgcolor: "#102542",
      color: "#FFFFFF",
      overflow: "hidden",
      boxSizing: "border-box",
    }}>
      <Box>
        <Box sx={{
          width: 46,
          height: 46,
          borderRadius: 2,
          bgcolor: "rgba(255,255,255,0.12)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mb: 2,
        }}>
          <AssignmentTurnedInIcon sx={{ fontSize: 24 }} />
        </Box>
        <Typography sx={{ fontSize: { lg: "1.65rem", xl: "1.85rem" }, fontWeight: 800, lineHeight: 1.2, mb: 1.25 }}>
          Task Management Portal
        </Typography>
        <Typography sx={{ color: "rgba(255,255,255,0.7)", lineHeight: 1.6, fontSize: "0.88rem", maxWidth: 380 }}>
          Securely manage employees, tasks, attendance, departments, and enterprise analytics from one unified dashboard.
        </Typography>
      </Box>

      <Stack spacing={1} sx={{ my: 2, minHeight: 0, overflow: "hidden" }}>
        {FEATURES.map((item) => (
          <Box
            key={item.title}
            sx={{
              display: "flex",
              alignItems: "center",
              p: 1.25,
              borderRadius: 2,
              bgcolor: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <Avatar sx={{ bgcolor: "rgba(37,99,235,0.3)", color: "#60A5FA", width: 38, height: 38, mr: 1.5 }}>
              {item.icon}
            </Avatar>
            <Box sx={{ minWidth: 0, textAlign: "left" }}>
              <Typography sx={{ fontWeight: 700, fontSize: "0.82rem", lineHeight: 1.3 }}>{item.title}</Typography>
              <Typography sx={{ color: "rgba(255,255,255,0.6)", fontSize: "0.72rem", mt: 0.15, lineHeight: 1.35 }}>
                {item.description}
              </Typography>
            </Box>
          </Box>
        ))}
      </Stack>

      <Typography sx={{ color: "rgba(255,255,255,0.4)", fontSize: "0.72rem", flexShrink: 0 }}>
        © {new Date().getFullYear()} Bold and Wise Ventures Pvt. Ltd.
      </Typography>
    </Box>
  );
}

export default BrandingPanel;
