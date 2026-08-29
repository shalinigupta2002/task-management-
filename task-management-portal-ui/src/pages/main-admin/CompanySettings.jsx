import { useState } from "react";
import {
  Box, Typography, Button, TextField, Grid, FormControlLabel, Switch, Chip,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import Layout from "../../components/layouts/Layout";
import { PageHeader, card, fieldSx } from "../../components/main-admin/shared";
import { getCompanySettings, setCompanySettings } from "../../utils/mainAdminStorage";

export default function CompanySettings() {
  const [settings, setSettings] = useState(getCompanySettings());
  const [saved, setSaved] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSave = () => {
    setCompanySettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <Layout>
      <Box sx={{ pb: 3 }}>
        <PageHeader title="Company Settings" crumbs={[{ label: "Company Settings" }]} />

        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" }, gap: 2 }}>
          <Box sx={card}>
            <Typography sx={{ fontWeight: 700, color: "#0F172A", mb: 2 }}>Company Information</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}><TextField fullWidth label="Company Name" name="companyName" value={settings.companyName} onChange={handleChange} sx={fieldSx} /></Grid>
              <Grid item xs={12} sm={6}><TextField fullWidth label="Email" name="companyEmail" value={settings.companyEmail} onChange={handleChange} sx={fieldSx} /></Grid>
              <Grid item xs={12} sm={6}><TextField fullWidth label="Phone" name="companyPhone" value={settings.companyPhone} onChange={handleChange} sx={fieldSx} /></Grid>
              <Grid item xs={12}><TextField fullWidth label="Address" name="address" value={settings.address} onChange={handleChange} multiline rows={2} sx={fieldSx} /></Grid>
              <Grid item xs={12}><TextField fullWidth label="Company Logo URL" name="logo" value={settings.logo} onChange={handleChange} placeholder="https://..." sx={fieldSx} /></Grid>
            </Grid>
          </Box>

          <Box sx={card}>
            <Typography sx={{ fontWeight: 700, color: "#0F172A", mb: 2 }}>Working Hours & Timezone</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}><TextField fullWidth label="Start Time" name="workingHoursStart" type="time" value={settings.workingHoursStart} onChange={handleChange} InputLabelProps={{ shrink: true }} sx={fieldSx} /></Grid>
              <Grid item xs={12} sm={6}><TextField fullWidth label="End Time" name="workingHoursEnd" type="time" value={settings.workingHoursEnd} onChange={handleChange} InputLabelProps={{ shrink: true }} sx={fieldSx} /></Grid>
              <Grid item xs={12}><TextField fullWidth label="Timezone" name="timezone" value={settings.timezone} onChange={handleChange} sx={fieldSx} /></Grid>
              <Grid item xs={12}><TextField fullWidth label="Date Format" name="dateFormat" value={settings.dateFormat} onChange={handleChange} sx={fieldSx} /></Grid>
            </Grid>
          </Box>

          <Box sx={card}>
            <Typography sx={{ fontWeight: 700, color: "#0F172A", mb: 2 }}>Password Policy</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}><TextField fullWidth label="Minimum Length" name="passwordMinLength" type="number" value={settings.passwordMinLength} onChange={handleChange} sx={fieldSx} /></Grid>
              <Grid item xs={12} sm={6}><TextField fullWidth label="Expiry (days)" name="passwordExpiryDays" type="number" value={settings.passwordExpiryDays} onChange={handleChange} sx={fieldSx} /></Grid>
              <Grid item xs={12}><FormControlLabel control={<Switch name="passwordRequireSpecial" checked={settings.passwordRequireSpecial} onChange={handleChange} />} label="Require special characters" /></Grid>
              <Grid item xs={12}><FormControlLabel control={<Switch name="passwordRequireNumber" checked={settings.passwordRequireNumber} onChange={handleChange} />} label="Require numbers" /></Grid>
            </Grid>
          </Box>

          <Box sx={card}>
            <Typography sx={{ fontWeight: 700, color: "#0F172A", mb: 2 }}>Notification Preferences</Typography>
            <FormControlLabel control={<Switch name="inAppNotifications" checked={settings.inAppNotifications} onChange={handleChange} />} label="In-app notifications" />
            <FormControlLabel control={<Switch name="emailNotifications" checked={settings.emailNotifications} onChange={handleChange} />} label="Email notifications" sx={{ display: "block" }} />
          </Box>
        </Box>

        <Box display="flex" alignItems="center" gap={2} mt={2}>
          <Button startIcon={<SaveIcon />} variant="contained" onClick={handleSave} sx={{ textTransform: "none", bgcolor: "#2563EB", borderRadius: 2 }}>Save Company Settings</Button>
          {saved && <Chip label="Settings saved" size="small" sx={{ bgcolor: "#F0FDF4", color: "#16A34A" }} />}
        </Box>
      </Box>
    </Layout>
  );
}
