import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  Box, Typography, Button, FormGroup, FormControlLabel, Checkbox, Chip, Switch,
  CircularProgress, Alert,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import Layout from "../../components/layouts/Layout";
import SubAdminLayout from "../../components/layouts/SubAdminLayout";
import { PageHeader, card } from "../../components/main-admin/shared";
import preferenceService from "../../services/preferenceService";
import { getErrorMessage } from "../../utils/session";
import toast from "../../utils/toast";

const ALERT_OPTIONS = [
  { id: "taskReminder", label: "Task reminders" },
  { id: "overdueReminder", label: "Overdue reminders" },
  { id: "messageNotification", label: "New messages" },
  { id: "systemNotification", label: "System alerts" },
];

const DEFAULTS = {
  taskReminder: true,
  overdueReminder: true,
  messageNotification: true,
  systemNotification: true,
  emailNotification: false,
  inAppNotification: true,
};

export default function NotificationSettings() {
  const location = useLocation();
  const isSubAdmin = location.pathname.startsWith("/sub-admin");
  const PageLayout = isSubAdmin ? SubAdminLayout : Layout;

  const [settings, setSettings] = useState(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        const pref = await preferenceService.get();
        if (!active) return;
        setSettings({
          taskReminder: pref?.taskReminder !== false,
          overdueReminder: pref?.overdueReminder !== false,
          messageNotification: pref?.messageNotification !== false,
          systemNotification: pref?.systemNotification !== false,
          emailNotification: Boolean(pref?.emailNotification),
          inAppNotification: pref?.inAppNotification !== false,
        });
        setError("");
      } catch (err) {
        if (active) setError(getErrorMessage(err, "Failed to load notification preferences"));
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const toggle = (key) => setSettings((prev) => ({ ...prev, [key]: !prev[key] }));

  const handleSave = async () => {
    try {
      setSaving(true);
      setError("");
      await preferenceService.update(settings);
      setSaved(true);
      toast.success("Notification preferences saved");
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      const msg = getErrorMessage(err, "Failed to save preferences");
      setError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageLayout>
      <Box sx={{ pb: 3 }}>
        <PageHeader
          title="Notification Settings"
          crumbs={[
            { label: "Settings", to: isSubAdmin ? "/sub-admin/notification-settings" : "/dashboard/company-settings" },
            { label: "Notification Settings" },
          ]}
        />

        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}

        {loading ? (
          <Box display="flex" justifyContent="center" py={6}><CircularProgress /></Box>
        ) : (
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" }, gap: 2 }}>
            <Box sx={card}>
              <Typography sx={{ fontWeight: 700, color: "#0F172A", mb: 2 }}>Alert Types</Typography>
              <FormGroup>
                {ALERT_OPTIONS.map((r) => (
                  <FormControlLabel
                    key={r.id}
                    control={
                      <Checkbox
                        checked={Boolean(settings[r.id])}
                        onChange={() => toggle(r.id)}
                        sx={{ color: "#2563EB", "&.Mui-checked": { color: "#2563EB" } }}
                      />
                    }
                    label={<Typography sx={{ fontSize: "0.85rem", color: "#334155" }}>{r.label}</Typography>}
                  />
                ))}
              </FormGroup>
            </Box>

            <Box sx={card}>
              <Typography sx={{ fontWeight: 700, color: "#0F172A", mb: 2 }}>Channels</Typography>
              <Box display="flex" justifyContent="space-between" alignItems="center" py={1.5} sx={{ borderBottom: "1px solid #F1F5F9" }}>
                <Box>
                  <Typography sx={{ fontWeight: 600, color: "#334155", fontSize: "0.9rem" }}>In App</Typography>
                  <Typography sx={{ fontSize: "0.78rem", color: "#94A3B8" }}>Show notifications inside the portal</Typography>
                </Box>
                <Switch checked={settings.inAppNotification} onChange={() => toggle("inAppNotification")} />
              </Box>
              <Box display="flex" justifyContent="space-between" alignItems="center" py={1.5}>
                <Box>
                  <Typography sx={{ fontWeight: 600, color: "#334155", fontSize: "0.9rem" }}>Email</Typography>
                  <Typography sx={{ fontSize: "0.78rem", color: "#94A3B8" }}>Send email notifications for tasks and alerts</Typography>
                </Box>
                <Switch checked={settings.emailNotification} onChange={() => toggle("emailNotification")} />
              </Box>
            </Box>
          </Box>
        )}

        <Box display="flex" alignItems="center" gap={2} mt={2}>
          <Button startIcon={<SaveIcon />} variant="contained" disabled={loading || saving} onClick={handleSave}
            sx={{ textTransform: "none", bgcolor: "#2563EB", borderRadius: 2 }}>
            {saving ? "Saving..." : "Save Preferences"}
          </Button>
          {saved && <Chip label="Saved" size="small" sx={{ bgcolor: "#F0FDF4", color: "#16A34A" }} />}
        </Box>
      </Box>
    </PageLayout>
  );
}
