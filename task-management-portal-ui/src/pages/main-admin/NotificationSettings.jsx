import { useState } from "react";
import { useLocation } from "react-router-dom";
import {
  Box, Typography, Button, FormGroup, FormControlLabel, Checkbox, TextField, Chip, Switch,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import Layout from "../../components/layouts/Layout";
import SubAdminLayout from "../../components/layouts/SubAdminLayout";
import { PageHeader, card, fieldSx } from "../../components/main-admin/shared";
import { getNotificationSettings, setNotificationSettings } from "../../utils/mainAdminStorage";

const REMINDER_OPTIONS = [
  { id: "30_min", label: "30 Minutes" },
  { id: "1_hour", label: "1 Hour" },
  { id: "6_hours", label: "6 Hours" },
  { id: "12_hours", label: "12 Hours" },
  { id: "1_day", label: "1 Day" },
  { id: "2_days", label: "2 Days" },
  { id: "3_days", label: "3 Days" },
  { id: "custom", label: "Custom Reminder" },
];

export default function NotificationSettings() {
  const location = useLocation();
  const isSubAdmin = location.pathname.startsWith("/sub-admin");
  const PageLayout = isSubAdmin ? SubAdminLayout : Layout;

  const [settings, setSettings] = useState(getNotificationSettings());
  const [saved, setSaved] = useState(false);

  const toggleReminder = (id) => {
    setSettings((prev) => ({
      ...prev,
      reminders: prev.reminders.includes(id) ? prev.reminders.filter((r) => r !== id) : [...prev.reminders, id],
    }));
  };

  const handleSave = () => {
    setNotificationSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <PageLayout>
      <Box sx={{ pb: 3 }}>
        <PageHeader title="Notification Settings" crumbs={[{ label: "Settings", to: isSubAdmin ? "/sub-admin/notification-settings" : "/dashboard/company-settings" }, { label: "Notification Settings" }]} />

        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" }, gap: 2 }}>
          <Box sx={card}>
            <Typography sx={{ fontWeight: 700, color: "#0F172A", mb: 2 }}>Reminder Before Due Date</Typography>
            <FormGroup>
              {REMINDER_OPTIONS.map((r) => (
                <FormControlLabel key={r.id}
                  control={<Checkbox checked={settings.reminders.includes(r.id)} onChange={() => toggleReminder(r.id)} sx={{ color: "#2563EB", "&.Mui-checked": { color: "#2563EB" } }} />}
                  label={<Typography sx={{ fontSize: "0.85rem", color: "#334155" }}>{r.label}</Typography>} />
              ))}
            </FormGroup>
            {settings.reminders.includes("custom") && (
              <TextField fullWidth type="number" label="Custom Reminder (hours before due date)" value={settings.customReminderHours}
                onChange={(e) => setSettings((p) => ({ ...p, customReminderHours: Number(e.target.value) }))} sx={{ mt: 2, ...fieldSx }} />
            )}
          </Box>

          <Box sx={card}>
            <Typography sx={{ fontWeight: 700, color: "#0F172A", mb: 2 }}>Notification Channels</Typography>
            <Box display="flex" justifyContent="space-between" alignItems="center" py={1.5} sx={{ borderBottom: "1px solid #F1F5F9" }}>
              <Box>
                <Typography sx={{ fontWeight: 600, color: "#334155", fontSize: "0.9rem" }}>In App</Typography>
                <Typography sx={{ fontSize: "0.78rem", color: "#94A3B8" }}>Show notifications inside the portal</Typography>
              </Box>
              <Switch checked={settings.channels.inApp} onChange={(e) => setSettings((p) => ({ ...p, channels: { ...p.channels, inApp: e.target.checked } }))} sx={{ "& .Mui-checked": { color: "#2563EB" }, "& .Mui-checked + .MuiSwitch-track": { bgcolor: "#2563EB" } }} />
            </Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" py={1.5}>
              <Box>
                <Typography sx={{ fontWeight: 600, color: "#334155", fontSize: "0.9rem" }}>Email</Typography>
                <Typography sx={{ fontSize: "0.78rem", color: "#94A3B8" }}>Send email notifications for tasks and alerts</Typography>
              </Box>
              <Switch checked={settings.channels.email} onChange={(e) => setSettings((p) => ({ ...p, channels: { ...p.channels, email: e.target.checked } }))} sx={{ "& .Mui-checked": { color: "#2563EB" }, "& .Mui-checked + .MuiSwitch-track": { bgcolor: "#2563EB" } }} />
            </Box>
          </Box>
        </Box>

        <Box display="flex" alignItems="center" gap={2} mt={2}>
          <Button startIcon={<SaveIcon />} variant="contained" onClick={handleSave} sx={{ textTransform: "none", bgcolor: "#2563EB", borderRadius: 2 }}>Save Settings</Button>
          {saved && <Chip label="Settings saved" size="small" sx={{ bgcolor: "#F0FDF4", color: "#16A34A" }} />}
        </Box>
      </Box>
    </PageLayout>
  );
}
