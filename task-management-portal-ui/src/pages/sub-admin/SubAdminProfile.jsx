import { useEffect, useState } from "react";
import { Box, Typography, TextField, Button, Grid, Avatar, Chip, CircularProgress, Alert } from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import SubAdminLayout from "../../components/layouts/SubAdminLayout";
import { PageHeader, card, fieldSx } from "../../components/main-admin/shared";
import employeeService from "../../services/employeeService";
import { getAuthUser, getErrorMessage } from "../../utils/session";
import { toast } from "../../utils/toast";

export default function SubAdminProfile() {
  const authUser = getAuthUser();
  const userId = authUser?.id || authUser?.userId;

  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    employeeId: "",
    designation: "",
  });
  const [passwords, setPasswords] = useState({ current: "", newPass: "", confirm: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    (async () => {
      if (!userId) {
        setError("User session not found");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const user = await employeeService.getById(userId);
        if (!active) return;
        setProfile(user);
        setForm({
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          email: user.email || "",
          phone: user.phone || "",
          employeeId: user.employeeId || "",
          designation: user.designation || "",
        });
      } catch (err) {
        if (active) setError(getErrorMessage(err, "Failed to load profile"));
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [userId]);

  const handleSave = async () => {
    if (!userId) return;
    try {
      setSaving(true);
      const updated = await employeeService.update(userId, {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        phone: form.phone || null,
        designation: form.designation || null,
      });
      setProfile(updated);
      const stored = getAuthUser();
      localStorage.setItem("user", JSON.stringify({
        ...stored,
        ...updated,
        name: `${updated.firstName} ${updated.lastName}`,
      }));
      toast.success("Profile updated");
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to update profile"));
    } finally {
      setSaving(false);
    }
  };

  const departmentName = profile?.department?.departmentName || profile?.department || "—";
  const roleName = profile?.role?.name || profile?.roleName || "SUB_ADMIN";
  const initials = `${form.firstName?.[0] || ""}${form.lastName?.[0] || ""}`.toUpperCase() || "SA";

  return (
    <SubAdminLayout>
      <Box sx={{ pb: 3 }}>
        <PageHeader title="Profile" crumbs={[{ label: "Profile" }]} homePath="/sub-admin/dashboard" />

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {loading ? (
          <Box display="flex" justifyContent="center" py={6}><CircularProgress /></Box>
        ) : (
          <>
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1fr 2fr" }, gap: 2 }}>
              <Box sx={card} textAlign="center">
                <Avatar sx={{ width: 80, height: 80, bgcolor: "#2563EB", fontSize: "1.5rem", mx: "auto", mb: 2 }}>{initials}</Avatar>
                <Typography sx={{ fontWeight: 700, fontSize: "1.2rem", color: "#0F172A" }}>{form.firstName} {form.lastName}</Typography>
                <Typography sx={{ color: "#64748B", mb: 1 }}>{roleName} · {departmentName}</Typography>
                <Chip label="Sub Admin" sx={{ bgcolor: "#EFF6FF", color: "#2563EB", fontWeight: 600 }} />
              </Box>

              <Box sx={card}>
                <Typography sx={{ fontWeight: 700, color: "#0F172A", mb: 2 }}>Edit Profile</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}><TextField fullWidth label="First Name" value={form.firstName} onChange={(e) => setForm((p) => ({ ...p, firstName: e.target.value }))} sx={fieldSx} /></Grid>
                  <Grid item xs={12} sm={6}><TextField fullWidth label="Last Name" value={form.lastName} onChange={(e) => setForm((p) => ({ ...p, lastName: e.target.value }))} sx={fieldSx} /></Grid>
                  <Grid item xs={12} sm={6}><TextField fullWidth label="Email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} sx={fieldSx} /></Grid>
                  <Grid item xs={12} sm={6}><TextField fullWidth label="Phone" value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} sx={fieldSx} /></Grid>
                  <Grid item xs={12} sm={6}><TextField fullWidth label="Employee Number" value={form.employeeId} disabled sx={fieldSx} /></Grid>
                  <Grid item xs={12} sm={6}><TextField fullWidth label="Department" value={departmentName} disabled sx={fieldSx} /></Grid>
                  <Grid item xs={12} sm={6}><TextField fullWidth label="Designation" value={form.designation} onChange={(e) => setForm((p) => ({ ...p, designation: e.target.value }))} sx={fieldSx} /></Grid>
                </Grid>
                <Button startIcon={<SaveIcon />} variant="contained" disabled={saving} onClick={handleSave} sx={{ mt: 2, textTransform: "none", bgcolor: "#2563EB", borderRadius: 2 }}>
                  {saving ? "Saving..." : "Save Profile"}
                </Button>
              </Box>
            </Box>

            <Box sx={{ ...card, mt: 2 }}>
              <Typography sx={{ fontWeight: 700, mb: 2, display: "flex", alignItems: "center", gap: 1 }}><LockOutlinedIcon fontSize="small" /> Change Password</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}><TextField fullWidth type="password" label="Current Password" value={passwords.current} onChange={(e) => setPasswords((p) => ({ ...p, current: e.target.value }))} sx={fieldSx} /></Grid>
                <Grid item xs={12} sm={4}><TextField fullWidth type="password" label="New Password" value={passwords.newPass} onChange={(e) => setPasswords((p) => ({ ...p, newPass: e.target.value }))} sx={fieldSx} /></Grid>
                <Grid item xs={12} sm={4}><TextField fullWidth type="password" label="Confirm Password" value={passwords.confirm} onChange={(e) => setPasswords((p) => ({ ...p, confirm: e.target.value }))} sx={fieldSx} /></Grid>
              </Grid>
              <Button
                variant="outlined"
                disabled={!passwords.newPass || passwords.newPass !== passwords.confirm}
                onClick={async () => {
                  try {
                    await employeeService.update(userId, { password: passwords.newPass });
                    toast.success("Password updated");
                    setPasswords({ current: "", newPass: "", confirm: "" });
                  } catch (err) {
                    toast.error(getErrorMessage(err, "Failed to update password"));
                  }
                }}
                sx={{ mt: 2, textTransform: "none", borderRadius: 2 }}
              >
                Update Password
              </Button>
            </Box>
          </>
        )}
      </Box>
    </SubAdminLayout>
  );
}
