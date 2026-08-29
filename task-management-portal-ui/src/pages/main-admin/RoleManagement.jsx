import { useState } from "react";
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, FormGroup, FormControlLabel, Checkbox, IconButton, Chip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import Layout from "../../components/layouts/Layout";
import { PageHeader, card, tableHeadCell, fieldSx } from "../../components/main-admin/shared";
import { PERMISSIONS } from "../../data/mainAdminData";
import { getRoles, addRole, updateRole } from "../../utils/mainAdminStorage";

export default function RoleManagement() {
  const [roles, setRoles] = useState(getRoles());
  const [dialog, setDialog] = useState(null);
  const [form, setForm] = useState({ name: "", permissions: [] });

  const openCreate = () => {
    setForm({ name: "", permissions: [] });
    setDialog({ mode: "create" });
  };

  const openEdit = (role) => {
    setForm({ name: role.name, permissions: [...role.permissions] });
    setDialog({ mode: "edit", id: role.id });
  };

  const togglePerm = (permId) => {
    setForm((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permId) ? prev.permissions.filter((p) => p !== permId) : [...prev.permissions, permId],
    }));
  };

  const handleSave = () => {
    if (dialog.mode === "create") {
      addRole({ id: `role-${Date.now()}`, name: form.name, type: "custom", permissions: form.permissions });
    } else {
      updateRole(dialog.id, { name: form.name, permissions: form.permissions });
    }
    setRoles(getRoles());
    setDialog(null);
  };

  return (
    <Layout>
      <Box sx={{ pb: 3 }}>
        <PageHeader title="Role Management" crumbs={[{ label: "Sub Admin Management", to: "/dashboard/admins" }, { label: "Roles & Permissions" }]} />
        <Box sx={{ ...card, mb: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography sx={{ color: "#64748B", fontSize: "0.9rem" }}>Build roles with granular permissions for sub admins</Typography>
          <Button startIcon={<AddIcon />} variant="contained" onClick={openCreate} sx={{ textTransform: "none", bgcolor: "#2563EB", borderRadius: 2 }}>Create Custom Role</Button>
        </Box>

        <Box sx={{ ...card, p: 0, overflow: "hidden" }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: "#F8FAFC" }}>
                  {["Role Name", "Type", "Permissions", "Actions"].map((h) => (
                    <TableCell key={h} sx={tableHeadCell}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {roles.map((role) => (
                  <TableRow key={role.id} hover sx={{ "& td": { borderBottom: "1px solid #F1F5F9", py: 1.5 } }}>
                    <TableCell sx={{ fontWeight: 600, color: "#0F172A" }}>{role.name}</TableCell>
                    <TableCell><Chip label={role.type === "system" ? "System" : "Custom"} size="small" sx={{ bgcolor: role.type === "system" ? "#F5F3FF" : "#EFF6FF", color: role.type === "system" ? "#7C3AED" : "#2563EB", fontWeight: 600, fontSize: "0.72rem" }} /></TableCell>
                    <TableCell>
                      <Box display="flex" flexWrap="wrap" gap={0.5}>
                        {role.permissions.slice(0, 4).map((pid) => {
                          const label = PERMISSIONS.find((p) => p.id === pid)?.label;
                          return label ? <Chip key={pid} label={label} size="small" sx={{ height: 22, fontSize: "0.65rem", bgcolor: "#F8FAFC", color: "#64748B" }} /> : null;
                        })}
                        {role.permissions.length > 4 && <Chip label={`+${role.permissions.length - 4}`} size="small" sx={{ height: 22, fontSize: "0.65rem" }} />}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <IconButton size="small" onClick={() => openEdit(role)} sx={{ color: "#2563EB" }}><EditOutlinedIcon fontSize="small" /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        <Dialog open={Boolean(dialog)} onClose={() => setDialog(null)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
          <DialogTitle sx={{ fontWeight: 700 }}>{dialog?.mode === "create" ? "Create Custom Role" : "Edit Role Permissions"}</DialogTitle>
          <DialogContent>
            <TextField fullWidth label="Role Name" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} sx={{ mb: 2, mt: 1, ...fieldSx }} disabled={dialog?.mode === "edit" && roles.find((r) => r.id === dialog.id)?.type === "system"} />
            <Typography sx={{ fontWeight: 600, mb: 1, color: "#334155" }}>Permissions</Typography>
            <FormGroup>
              {PERMISSIONS.map((p) => (
                <FormControlLabel key={p.id} control={<Checkbox checked={form.permissions.includes(p.id)} onChange={() => togglePerm(p.id)} sx={{ color: "#2563EB", "&.Mui-checked": { color: "#2563EB" } }} />}
                  label={<Typography sx={{ fontSize: "0.85rem" }}>{p.label}</Typography>} />
              ))}
            </FormGroup>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setDialog(null)} sx={{ textTransform: "none", color: "#64748B" }}>Cancel</Button>
            <Button onClick={handleSave} variant="contained" sx={{ textTransform: "none", bgcolor: "#2563EB" }}>Save Role</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Layout>
  );
}
