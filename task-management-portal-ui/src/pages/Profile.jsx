import { useEffect, useState } from "react";
import {
  Box, Container, Grid, Paper, Avatar, Typography, Chip, Button, Divider,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Stack, CircularProgress, Alert,
} from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import Layout from "../components/layouts/Layout";
import useCurrentUser from "../hooks/useCurrentUser";
import employeeService from "../services/employeeService";
import { getErrorMessage } from "../utils/session";
import { toast } from "../utils/toast";

export default function Profile() {
  const { user, loading, error: loadError, refresh } = useCurrentUser();
  const [openEditModal, setOpenEditModal] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      setEditForm({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
        designation: user.designation || "",
      });
    }
  }, [user]);

  const handleSave = async () => {
    try {
      setSaving(true);
      setError("");
      await employeeService.updateMe({
        firstName: editForm.firstName?.trim(),
        lastName: editForm.lastName?.trim(),
        phone: editForm.phone?.trim() || null,
        designation: editForm.designation?.trim() || null,
      });
      await refresh();
      setOpenEditModal(false);
      toast.success("Profile updated");
    } catch (err) {
      const msg = getErrorMessage(err, "Failed to update profile");
      setError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const name = user
    ? `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email || "User"
    : "User";
  const initials = `${user?.firstName?.[0] || ""}${user?.lastName?.[0] || ""}`.toUpperCase() || "U";
  const role = user?.role?.name || user?.roleName || user?.role || "—";
  const department = user?.department?.departmentName || "—";
  const company = user?.company?.companyName || "—";

  return (
    <Layout>
      <Container maxWidth="lg" sx={{ py: 3 }}>
        {(loadError || error) && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
            {error || loadError}
          </Alert>
        )}

        {loading && !user ? (
          <Box display="flex" justifyContent="center" py={8}><CircularProgress /></Box>
        ) : !user ? (
          <Typography sx={{ color: "#64748B" }}>Failed to load profile from the server.</Typography>
        ) : (
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3, borderRadius: 3, textAlign: "center" }}>
                <Avatar sx={{ width: 88, height: 88, mx: "auto", mb: 2, bgcolor: "#2563EB", fontSize: "1.5rem" }}>
                  {initials}
                </Avatar>
                <Typography sx={{ fontWeight: 700, fontSize: "1.25rem" }}>{name}</Typography>
                <Chip label={role} size="small" sx={{ mt: 1, bgcolor: "#EFF6FF", color: "#2563EB", fontWeight: 600 }} />
                <Button
                  startIcon={<EditOutlinedIcon />}
                  variant="outlined"
                  sx={{ mt: 2, textTransform: "none", borderRadius: 2 }}
                  onClick={() => setOpenEditModal(true)}
                >
                  Edit Profile
                </Button>
              </Paper>
            </Grid>
            <Grid item xs={12} md={8}>
              <Paper sx={{ p: 3, borderRadius: 3 }}>
                <Typography sx={{ fontWeight: 700, mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
                  <PersonOutlineIcon fontSize="small" /> Personal Information
                </Typography>
                <Grid container spacing={2}>
                  {[
                    { l: "Email", v: user.email },
                    { l: "Phone", v: user.phone || "—" },
                    { l: "Employee ID", v: user.employeeId || "—" },
                    { l: "Designation", v: user.designation || "—" },
                  ].map((f) => (
                    <Grid item xs={12} sm={6} key={f.l}>
                      <Typography sx={{ fontSize: "0.75rem", color: "#94A3B8" }}>{f.l}</Typography>
                      <Typography sx={{ fontWeight: 600 }}>{f.v}</Typography>
                    </Grid>
                  ))}
                </Grid>
                <Divider sx={{ my: 3 }} />
                <Typography sx={{ fontWeight: 700, mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
                  <BusinessOutlinedIcon fontSize="small" /> Organization
                </Typography>
                <Grid container spacing={2}>
                  {[
                    { l: "Company", v: company },
                    { l: "Department", v: department },
                    { l: "Role", v: role, icon: true },
                  ].map((f) => (
                    <Grid item xs={12} sm={6} key={f.l}>
                      <Typography sx={{ fontSize: "0.75rem", color: "#94A3B8" }}>{f.l}</Typography>
                      <Typography sx={{ fontWeight: 600, display: "flex", alignItems: "center", gap: 0.5 }}>
                        {f.icon && <BadgeOutlinedIcon sx={{ fontSize: 16, color: "#64748B" }} />}
                        {f.v}
                      </Typography>
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        )}

        <Dialog open={openEditModal} onClose={() => setOpenEditModal(false)} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 3 } }}>
          <DialogTitle sx={{ fontWeight: 700 }}>Edit Profile</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField label="First Name" value={editForm.firstName || ""} onChange={(e) => setEditForm((p) => ({ ...p, firstName: e.target.value }))} />
              <TextField label="Last Name" value={editForm.lastName || ""} onChange={(e) => setEditForm((p) => ({ ...p, lastName: e.target.value }))} />
              <TextField label="Email" value={editForm.email || ""} disabled />
              <TextField label="Phone" value={editForm.phone || ""} onChange={(e) => setEditForm((p) => ({ ...p, phone: e.target.value }))} />
              <TextField label="Designation" value={editForm.designation || ""} onChange={(e) => setEditForm((p) => ({ ...p, designation: e.target.value }))} />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setOpenEditModal(false)} sx={{ textTransform: "none" }}>Cancel</Button>
            <Button variant="contained" disabled={saving} onClick={handleSave} sx={{ textTransform: "none", bgcolor: "#2563EB" }}>
              {saving ? "Saving..." : "Save"}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Layout>
  );
}
