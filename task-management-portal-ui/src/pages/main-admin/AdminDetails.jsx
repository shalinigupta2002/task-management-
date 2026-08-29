import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Box, Typography, Button, Grid, Chip, Avatar, CircularProgress, Alert } from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Layout from "../../components/layouts/Layout";
import { PageHeader, StatusBadge, card } from "../../components/main-admin/shared";
import employeeService from "../../services/employeeService";
import { getErrorMessage, toDisplayStatus } from "../../utils/session";

const PERMISSION_LABELS = {
  "department.read": "View Departments",
  "user.read": "View Users / Employees",
  "user.write": "Manage Employees",
};

export default function AdminDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        const user = await employeeService.getById(id);
        if (!active) return;
        setAdmin(user);
      } catch (err) {
        if (active) setError(getErrorMessage(err, "Failed to load Sub Admin"));
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [id]);

  if (loading) {
    return (
      <Layout>
        <Box display="flex" justifyContent="center" py={8}>
          <CircularProgress size={32} />
        </Box>
      </Layout>
    );
  }

  if (error || !admin) {
    return (
      <Layout>
        <Box sx={{ pb: 3 }}>
          <Alert severity="error" sx={{ mb: 2 }}>{error || "Sub admin not found."}</Alert>
          <Button onClick={() => navigate("/dashboard/admins")} sx={{ mt: 2, textTransform: "none" }}>
            Back to Sub Admin List
          </Button>
        </Box>
      </Layout>
    );
  }

  const fullName = `${admin.firstName || ""} ${admin.lastName || ""}`.trim() || admin.email;
  const statusLabel = toDisplayStatus(admin.status);
  const permLabels = (admin.role?.permissions || [])
    .map((rp) => {
      const name = rp.permission?.name || rp.name;
      return PERMISSION_LABELS[name] || rp.permission?.description || name;
    })
    .filter(Boolean);

  return (
    <Layout>
      <Box sx={{ pb: 3 }}>
        <PageHeader
          title="Sub Admin Profile"
          crumbs={[
            { label: "Sub Admin Management", to: "/dashboard/admins" },
            { label: fullName },
          ]}
        />
        <Box display="flex" gap={2} mb={2} flexWrap="wrap">
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate("/dashboard/admins")}
            sx={{ textTransform: "none", color: "#64748B" }}
          >
            Back
          </Button>
          <Button
            startIcon={<EditOutlinedIcon />}
            variant="contained"
            onClick={() => navigate(`/dashboard/admins/${id}/edit`)}
            sx={{ textTransform: "none", bgcolor: "#2563EB", borderRadius: 2 }}
          >
            Edit Sub Admin
          </Button>
        </Box>

        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1fr 2fr" }, gap: 2 }}>
          <Box sx={card} textAlign="center">
            <Avatar sx={{ width: 80, height: 80, bgcolor: "#2563EB", fontSize: "1.5rem", mx: "auto", mb: 2 }}>
              {fullName.split(" ").map((w) => w[0]).join("").slice(0, 2)}
            </Avatar>
            <Typography sx={{ fontWeight: 700, color: "#0F172A", fontSize: "1.2rem" }}>{fullName}</Typography>
            <Typography sx={{ color: "#64748B", fontSize: "0.85rem", mb: 1 }}>
              {admin.role?.name || "SUB_ADMIN"}
            </Typography>
            <StatusBadge status={statusLabel} />
          </Box>

          <Box sx={card}>
            <Typography sx={{ fontWeight: 700, color: "#0F172A", mb: 2 }}>Sub Admin Details</Typography>
            <Grid container spacing={2}>
              {[
                ["Full Name", fullName],
                ["Email", admin.email],
                ["Phone", admin.phone || "—"],
                ["Department", admin.department?.departmentName || "—"],
                ["Role", admin.role?.name || "SUB_ADMIN"],
                ["Status", statusLabel],
                ["Last Login", admin.lastLogin ? new Date(admin.lastLogin).toLocaleString() : "Never"],
                ["Created Date", admin.createdAt ? new Date(admin.createdAt).toLocaleDateString() : "—"],
              ].map(([label, value]) => (
                <Grid item xs={12} sm={6} key={label}>
                  <Typography sx={{ fontSize: "0.75rem", color: "#94A3B8", textTransform: "uppercase", fontWeight: 600 }}>
                    {label}
                  </Typography>
                  <Typography sx={{ fontSize: "0.9rem", color: "#0F172A", fontWeight: 500, mt: 0.3 }}>
                    {value}
                  </Typography>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Box>

        <Box sx={{ ...card, mt: 2 }}>
          <Typography sx={{ fontWeight: 700, color: "#0F172A", mb: 1.5 }}>Assigned Permissions</Typography>
          <Box display="flex" flexWrap="wrap" gap={1}>
            {permLabels.length
              ? permLabels.map((l) => (
                <Chip key={l} label={l} size="small" sx={{ bgcolor: "#EFF6FF", color: "#2563EB", fontWeight: 500 }} />
              ))
              : (
                <Typography sx={{ color: "#64748B", fontSize: "0.85rem" }}>
                  Permissions are defined on the SUB_ADMIN system role.
                </Typography>
              )}
          </Box>
        </Box>
      </Box>
    </Layout>
  );
}
