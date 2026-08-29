import PropTypes from "prop-types";
import { Box, Typography, Button } from "@mui/material";
import InboxOutlinedIcon from "@mui/icons-material/InboxOutlined";
import { card } from "./styles";

const PRESETS = {
  employees: { title: "No employees found", description: "There are no employees matching your filters. Try adjusting search or add a new employee.", actionLabel: "Add Employee" },
  tasks: { title: "No tasks found", description: "You have no tasks assigned yet or none match your current filters.", actionLabel: "Create Task" },
  departments: { title: "No departments found", description: "Start by creating your first department to organize your team.", actionLabel: "Add Department" },
  reports: { title: "No report data", description: "Reports will appear once there is enough activity in your organization.", actionLabel: null },
  messages: { title: "No messages yet", description: "Start a conversation with your team from the contacts list.", actionLabel: "New Message" },
  notifications: { title: "All caught up", description: "You have no notifications at the moment.", actionLabel: null },
  calendar: { title: "No events scheduled", description: "Your calendar is clear for this period.", actionLabel: null },
  plans: { title: "No plans found", description: "Create subscription plans to assign to companies.", actionLabel: "Add Plan" },
  companies: { title: "No companies found", description: "Add your first tenant company to get started.", actionLabel: "Add Company" },
  generic: { title: "Nothing here yet", description: "No data available for this section.", actionLabel: null },
};

export default function EmptyState({ type = "generic", title, description, actionLabel, onAction, icon: Icon = InboxOutlinedIcon }) {
  const preset = PRESETS[type] || PRESETS.generic;
  return (
    <Box sx={{ ...card, textAlign: "center", py: 6, px: 3 }} role="status" aria-live="polite">
      <Box sx={{ width: 64, height: 64, borderRadius: 3, bgcolor: "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center", mx: "auto", mb: 2 }}>
        <Icon sx={{ color: "#2563EB", fontSize: 32 }} aria-hidden />
      </Box>
      <Typography sx={{ fontWeight: 700, color: "#0F172A", fontSize: "1.1rem", mb: 1 }}>{title || preset.title}</Typography>
      <Typography sx={{ color: "#64748B", fontSize: "0.9rem", maxWidth: 360, mx: "auto", mb: onAction ? 2 : 0 }}>{description || preset.description}</Typography>
      {onAction && (
        <Button variant="contained" onClick={onAction} sx={{ textTransform: "none", bgcolor: "#2563EB", borderRadius: 2, mt: 1 }}>
          {actionLabel || preset.actionLabel}
        </Button>
      )}
    </Box>
  );
}

EmptyState.propTypes = {
  type: PropTypes.string,
  title: PropTypes.string,
  description: PropTypes.string,
  actionLabel: PropTypes.string,
  onAction: PropTypes.func,
  icon: PropTypes.elementType,
};
