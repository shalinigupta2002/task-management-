import { useCallback, useEffect, useState } from "react";
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, CircularProgress, Alert,
} from "@mui/material";
import Layout from "../../components/layouts/Layout";
import { PageHeader, card, tableHeadCell } from "../../components/main-admin/shared";
import roleService from "../../services/roleService";
import { getErrorMessage } from "../../utils/session";

export default function RoleManagement() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const result = await roleService.getAll();
      const list = result.items || (Array.isArray(result) ? result : []);
      setRoles(Array.isArray(list) ? list : []);
    } catch (err) {
      setRoles([]);
      setError(getErrorMessage(err, "Failed to load roles"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <Layout>
      <Box sx={{ pb: 3 }}>
        <PageHeader title="Role Management" crumbs={[{ label: "Sub Admin Management", to: "/dashboard/admins" }, { label: "Roles & Permissions" }]} />
        <Box sx={{ ...card, mb: 2 }}>
          <Typography sx={{ color: "#64748B", fontSize: "0.9rem" }}>
            System roles from the database. Custom role creation is managed by Super Admin.
          </Typography>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}

        <Box sx={{ ...card, p: 0, overflow: "hidden" }}>
          {loading ? (
            <Box display="flex" justifyContent="center" py={6}><CircularProgress /></Box>
          ) : roles.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 6, px: 2 }}>
              <Typography sx={{ fontWeight: 700, color: "#0F172A", mb: 1 }}>
                {error ? "Failed to load roles" : "No roles found."}
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: "#F8FAFC" }}>
                    {["Role Name", "Description", "Permissions"].map((h) => (
                      <TableCell key={h} sx={tableHeadCell}>{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {roles.map((role) => {
                    const perms = (role.rolePermissions || role.permissions || [])
                      .map((rp) => rp.permission?.name || rp.name || rp)
                      .filter(Boolean);
                    return (
                      <TableRow key={role.id} hover sx={{ "& td": { borderBottom: "1px solid #F1F5F9", py: 1.5 } }}>
                        <TableCell sx={{ fontWeight: 600, color: "#0F172A" }}>{role.name}</TableCell>
                        <TableCell sx={{ color: "#64748B", fontSize: "0.85rem" }}>{role.description || "—"}</TableCell>
                        <TableCell>
                          <Box display="flex" flexWrap="wrap" gap={0.5}>
                            {perms.slice(0, 6).map((p) => (
                              <Chip key={p} label={p} size="small" sx={{ height: 22, fontSize: "0.65rem", bgcolor: "#F8FAFC", color: "#64748B" }} />
                            ))}
                            {perms.length > 6 && <Chip label={`+${perms.length - 6}`} size="small" sx={{ height: 22, fontSize: "0.65rem" }} />}
                            {perms.length === 0 && (
                              <Typography sx={{ fontSize: "0.8rem", color: "#94A3B8" }}>No permissions listed</Typography>
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      </Box>
    </Layout>
  );
}
