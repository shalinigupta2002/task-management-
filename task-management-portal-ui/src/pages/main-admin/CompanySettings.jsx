import { useEffect, useState } from "react";
import {
  Box, Typography, Button, TextField, Grid, FormControlLabel, Switch, Chip, CircularProgress, Alert,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import Layout from "../../components/layouts/Layout";
import { PageHeader, card, fieldSx } from "../../components/main-admin/shared";
import companyService from "../../services/companyService";
import preferenceService from "../../services/preferenceService";
import { getAuthUser } from "../../utils/session";
import { getErrorMessage } from "../../utils/session";
import { toast } from "../../utils/toast";

/**
 * Company profile → company API.
 * Notification toggles → preference API.
 * Working-hours / password-policy fields are UI review only (no backend settings API yet).
 */
export default function CompanySettings() {
  const authUser = getAuthUser();
  const companyId = authUser?.companyId || authUser?.company?.id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [settings, setSettings] = useState({
    companyName: "",
    companyEmail: "",
    companyPhone: "",
    address: "",
    logo: "",
    workingHoursStart: "09:00",
    workingHoursEnd: "18:00",
    timezone: "Asia/Kolkata",
    dateFormat: "DD/MM/YYYY",
    passwordMinLength: 8,
    passwordExpiryDays: 90,
    passwordRequireSpecial: true,
    passwordRequireNumber: true,
    inAppNotifications: true,
    emailNotifications: true,
  });

  useEffect(() => {
    let active = true;
    (async () => {
      if (!companyId) {
        setLoading(false);
        setError("No company associated with this account.");
        return;
      }
      try {
        setLoading(true);
        const [company, prefs] = await Promise.all([
          companyService.getById(companyId),
          preferenceService.get().catch(() => null),
        ]);
        if (!active) return;
        setSettings((prev) => ({
          ...prev,
          companyName: company.companyName || company.name || "",
          companyEmail: company.email || "",
          companyPhone: company.phone || "",
          address: company.address || "",
          logo: company.logo || "",
          inAppNotifications: prefs?.inAppNotification !== false,
          emailNotifications: Boolean(prefs?.emailNotification),
        }));
        setError("");
      } catch (err) {
        if (active) setError(getErrorMessage(err, "Failed to load company settings"));
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [companyId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSave = async () => {
    if (!companyId) return;
    try {
      setSaving(true);
      setError("");
      await Promise.all([
        companyService.update(companyId, {
          companyName: settings.companyName.trim(),
          email: settings.companyEmail.trim(),
          phone: settings.companyPhone.trim() || null,
          address: settings.address.trim() || null,
          logo: settings.logo.trim() || null,
        }),
        preferenceService.update({
          inAppNotification: settings.inAppNotifications,
          emailNotification: settings.emailNotifications,
        }),
      ]);
      setSaved(true);
      toast.success("Company settings saved");
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      const msg = getErrorMessage(err, "Failed to save company settings");
      setError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout>
      <Box sx={{ pb: 3 }}>
        <PageHeader title="Company Settings" crumbs={[{ label: "Company Settings" }]} />
        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}
        {loading ? (
          <Box display="flex" justifyContent="center" py={6}><CircularProgress /></Box>
        ) : (
          <>
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
                <Alert severity="info" sx={{ mb: 2 }}>These preference fields are UI-only until a company preferences API is added.</Alert>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}><TextField fullWidth label="Start Time" name="workingHoursStart" type="time" value={settings.workingHoursStart} onChange={handleChange} InputLabelProps={{ shrink: true }} sx={fieldSx} /></Grid>
                  <Grid item xs={12} sm={6}><TextField fullWidth label="End Time" name="workingHoursEnd" type="time" value={settings.workingHoursEnd} onChange={handleChange} InputLabelProps={{ shrink: true }} sx={fieldSx} /></Grid>
                  <Grid item xs={12}><TextField fullWidth label="Timezone" name="timezone" value={settings.timezone} onChange={handleChange} sx={fieldSx} /></Grid>
                  <Grid item xs={12}><TextField fullWidth label="Date Format" name="dateFormat" value={settings.dateFormat} onChange={handleChange} sx={fieldSx} /></Grid>
                </Grid>
              </Box>

              <Box sx={card}>
                <Typography sx={{ fontWeight: 700, color: "#0F172A", mb: 2 }}>Password Policy</Typography>
                <Alert severity="info" sx={{ mb: 2 }}>Password policy is enforced by backend validation rules; these toggles are not production source of truth.</Alert>
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
              <Button startIcon={<SaveIcon />} variant="contained" disabled={saving || !companyId} onClick={handleSave} sx={{ textTransform: "none", bgcolor: "#2563EB", borderRadius: 2 }}>
                {saving ? "Saving..." : "Save Company Settings"}
              </Button>
              {saved && <Chip label="Company profile saved" size="small" sx={{ bgcolor: "#F0FDF4", color: "#16A34A" }} />}
            </Box>
          </>
        )}
      </Box>
    </Layout>
  );
}
