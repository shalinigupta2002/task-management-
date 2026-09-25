import { useState } from "react";
import { Box, Grid, Button, TextField, Switch, FormControlLabel, Typography, Alert } from "@mui/material";
import SuperAdminLayout from "../../components/layouts/SuperAdminLayout";
import { PageHeader, card, fieldSx } from "../../components/super-admin/shared";

const DEFAULTS = {
  platformName: "TaskFlow",
  supportEmail: "",
  defaultPlan: "",
  trialDays: "14",
  maxUploadSize: "10",
  sessionTimeout: "120",
  maintenanceMode: false,
  allowRegistration: true,
};

/**
 * Platform settings UI.
 * No dedicated platform-settings API exists yet — values are in-memory defaults only.
 * They are NOT written to localStorage (avoids fake "saved production config").
 */
export default function GlobalSettings() {
  const [settings, setSettings] = useState(DEFAULTS);

  const handleChange = (key, value) => setSettings((s) => ({ ...s, [key]: value }));

  return (
    <SuperAdminLayout>
      <Box sx={{ pb: 3, maxWidth: 800 }}>
        <PageHeader title="Global Settings" crumbs={[{ label: "Global Settings" }]} />
        <Alert severity="info" sx={{ mb: 2 }}>
          Platform settings are not persisted to the backend yet. Values below are defaults for review only and will reset on refresh.
        </Alert>
        <Box sx={card}>
          <Typography sx={{ fontWeight: 700, color: "#0F172A", mb: 2 }}>Platform Configuration</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}><TextField fullWidth size="small" label="Platform Name" value={settings.platformName} onChange={(e) => handleChange("platformName", e.target.value)} sx={fieldSx} /></Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth size="small" label="Support Email" value={settings.supportEmail} onChange={(e) => handleChange("supportEmail", e.target.value)} sx={fieldSx} /></Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth size="small" label="Default Plan ID" value={settings.defaultPlan} onChange={(e) => handleChange("defaultPlan", e.target.value)} sx={fieldSx} /></Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth size="small" label="Trial Days" value={settings.trialDays} onChange={(e) => handleChange("trialDays", e.target.value)} sx={fieldSx} /></Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth size="small" label="Max Upload Size (MB)" value={settings.maxUploadSize} onChange={(e) => handleChange("maxUploadSize", e.target.value)} sx={fieldSx} /></Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth size="small" label="Session Timeout (min)" value={settings.sessionTimeout} onChange={(e) => handleChange("sessionTimeout", e.target.value)} sx={fieldSx} /></Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel control={<Switch checked={settings.maintenanceMode} onChange={(e) => handleChange("maintenanceMode", e.target.checked)} />} label="Maintenance Mode" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel control={<Switch checked={settings.allowRegistration} onChange={(e) => handleChange("allowRegistration", e.target.checked)} />} label="Allow Registration" />
            </Grid>
          </Grid>
          <Button variant="contained" disabled sx={{ mt: 2, textTransform: "none", bgcolor: "#94A3B8", borderRadius: 2, fontWeight: 600 }}>
            Save unavailable (no API)
          </Button>
        </Box>
      </Box>
    </SuperAdminLayout>
  );
}
