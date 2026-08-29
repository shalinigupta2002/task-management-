import { useEffect, useState } from "react";
import {
  Box, Typography, TextField, Button, Grid, Avatar, Chip, CircularProgress, Alert,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import EmployeeLayout from "../../components/layouts/EmployeeLayout";
import { PageHeader, card, fieldSx } from "../../components/employee/shared";
import employeeService from "../../services/employeeService";
import useCurrentUser from "../../hooks/useCurrentUser";
import { getErrorMessage } from "../../utils/session";
import { formatTaskTableDate } from "../../utils/dateUtils";
import { toast } from "../../utils/toast";

function mapForm(user) {
  return {
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    phone: user?.phone || "",
    employeeId: user?.employeeId || "",
    designation: user?.designation || "",
    department: user?.department?.departmentName || "",
    joiningDate: user?.joiningDate ? formatTaskTableDate(user.joiningDate) : "",
    role: user?.role?.name || user?.roleName || "EMPLOYEE",
    photo: user?.profileImage || "",
  };
}

export default function EmployeeProfilePage() {
  const { user, loading, error: loadError, refresh } = useCurrentUser();
  const [form, setForm] = useState(mapForm(null));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) setForm(mapForm(user));
  }, [user]);

  const handleSave = async () => {
    try {
      setSaving(true);
      setError("");
      await employeeService.updateMe({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        phone: form.phone.trim() || null,
        designation: form.designation.trim() || null,
      });
      await refresh();
      toast.success("Profile updated");
    } catch (err) {
      const msg = getErrorMessage(err, "Failed to update profile");
      setError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const initials = `${form.firstName?.[0] || ""}${form.lastName?.[0] || ""}`.toUpperCase();

  return (
    <EmployeeLayout>
      <Box sx={{ pb: 3 }}>
        <PageHeader title="My Profile" crumbs={[{ label: "Profile" }]} />

        {(loadError || error) && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
            {error || loadError}
          </Alert>
        )}

        {loading && !user ? (
          <Box display="flex" justifyContent="center" py={6}><CircularProgress /></Box>
        ) : !user && loadError ? (
          <Typography sx={{ color: "#64748B" }}>Failed to load profile</Typography>
        ) : (
          <>
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1fr 2fr" }, gap: 2 }}>
              <Box sx={card} textAlign="center">
                <Avatar
                  src={form.photo || undefined}
                  sx={{ width: 96, height: 96, bgcolor: "#2563EB", fontSize: "2rem", mx: "auto", mb: 2 }}
                >
                  {initials || "?"}
                </Avatar>
                <Typography sx={{ fontWeight: 700, fontSize: "1.2rem", color: "#0F172A" }}>
                  {form.firstName} {form.lastName}
                </Typography>
                <Typography sx={{ color: "#64748B", mb: 0.5 }}>{form.designation || "—"}</Typography>
                <Chip
                  label={form.department || "No Department"}
                  size="small"
                  sx={{ bgcolor: "#EFF6FF", color: "#2563EB", fontWeight: 600, mb: 1 }}
                />
                <Typography sx={{ fontSize: "0.82rem", color: "#94A3B8", fontFamily: "monospace" }}>
                  {form.employeeId || "—"}
                </Typography>
                <Chip
                  label={form.role}
                  size="small"
                  sx={{ mt: 1, bgcolor: "#F8FAFC", color: "#64748B", fontWeight: 600 }}
                />
              </Box>

              <Box sx={card}>
                <Typography sx={{ fontWeight: 700, color: "#0F172A", mb: 2 }}>Edit Profile</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="First Name" value={form.firstName}
                      onChange={(e) => setForm((p) => ({ ...p, firstName: e.target.value }))} sx={fieldSx} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="Last Name" value={form.lastName}
                      onChange={(e) => setForm((p) => ({ ...p, lastName: e.target.value }))} sx={fieldSx} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="Email" value={form.email} disabled sx={fieldSx}
                      helperText="Email cannot be changed here" />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="Phone" value={form.phone}
                      onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} sx={fieldSx} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="Employee Code" value={form.employeeId} disabled sx={fieldSx} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="Department" value={form.department || "—"} disabled sx={fieldSx} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="Designation" value={form.designation}
                      onChange={(e) => setForm((p) => ({ ...p, designation: e.target.value }))} sx={fieldSx} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="Joining Date" value={form.joiningDate || "—"} disabled sx={fieldSx}
                      helperText={!form.joiningDate ? "Not set on this account" : undefined} />
                  </Grid>
                </Grid>
                <Box display="flex" alignItems="center" gap={2} mt={2}>
                  <Button
                    startIcon={<SaveIcon />}
                    variant="contained"
                    disabled={saving}
                    onClick={handleSave}
                    sx={{ textTransform: "none", bgcolor: "#2563EB", borderRadius: 2 }}
                  >
                    {saving ? "Saving…" : "Save Profile"}
                  </Button>
                </Box>
              </Box>
            </Box>

            <Box sx={{ ...card, mt: 2 }}>
              <Typography sx={{ fontWeight: 700, mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
                <LockOutlinedIcon fontSize="small" /> Change Password
              </Typography>
              <Typography sx={{ color: "#94A3B8", fontSize: "0.85rem" }}>
                Password changes are managed through your administrator or the secure password-reset flow.
              </Typography>
            </Box>
          </>
        )}
      </Box>
    </EmployeeLayout>
  );
}
