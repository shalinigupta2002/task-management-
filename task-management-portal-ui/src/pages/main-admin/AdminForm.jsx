import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box, Typography, TextField, Button, MenuItem, Select, FormControl, InputLabel,
  FormGroup, FormControlLabel, Checkbox, CircularProgress, Alert, InputAdornment, IconButton,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import ContentCopy from "@mui/icons-material/ContentCopy";
import Layout from "../../components/layouts/Layout";
import { PageHeader, card, fieldSx } from "../../components/main-admin/shared";
import employeeService from "../../services/employeeService";
import departmentService from "../../services/departmentService";
import { toast } from "../../utils/toast";
import { getErrorMessage } from "../../utils/session";
import {
  generateStrongPassword,
  isStrongPassword,
  PASSWORD_HELPER,
} from "../../utils/passwordStrength";

/** Friendly labels for seeded RolePermission names on SUB_ADMIN */
const PERMISSION_LABELS = {
  "department.read": "View Departments",
  "user.read": "View Users / Employees",
  "user.write": "Manage Employees",
};

function splitFullName(fullName) {
  const parts = String(fullName || "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { firstName: "", lastName: "" };
  if (parts.length === 1) return { firstName: parts[0], lastName: "-" };
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
}

export default function AdminForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [departments, setDepartments] = useState([]);
  const [rolePermissions, setRolePermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    departmentId: "",
    status: "ACTIVE",
    password: "",
    confirmPassword: "",
    employeeId: "",
  });
  const [previewCode, setPreviewCode] = useState("");

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        setError("");
        const [deptRes, preview] = await Promise.all([
          departmentService.getAll({ limit: 100, status: "ACTIVE" }),
          isEdit
            ? Promise.resolve(null)
            : employeeService.previewEmployeeCode("SUB_ADMIN").catch(() => null),
        ]);
        if (!active) return;
        const depts = (deptRes.items || deptRes || []).filter(
          (d) => !d.status || d.status === "ACTIVE"
        );
        setDepartments(depts);
        if (preview?.employeeId) setPreviewCode(preview.employeeId);

        // Role permissions come from SUB_ADMIN RolePermission (not per-user)
        try {
          const { default: api } = await import("../../api/axios");
          const { unwrapList, unwrapData } = await import("../../utils/session");
          const rolesRes = unwrapList(await api.get("/v1/role", { params: { limit: 50 } }));
          const roles = rolesRes.items || [];
          const subRole = roles.find((r) => r.name === "SUB_ADMIN");
          if (subRole?.id) {
            const detail = unwrapData(await api.get(`/v1/role/${subRole.id}`));
            const perms = (detail?.permissions || [])
              .map((rp) => rp.permission || rp)
              .filter(Boolean);
            if (active) setRolePermissions(perms);
          }
        } catch {
          if (active) {
            setRolePermissions([
              { name: "department.read", description: "View departments" },
              { name: "user.read", description: "View users" },
              { name: "user.write", description: "Manage users" },
            ]);
          }
        }

        if (isEdit) {
          const user = await employeeService.getById(id);
          if (!active) return;
          if (user?.role?.name && user.role.name !== "SUB_ADMIN") {
            setError("This user is not a Sub Admin");
            return;
          }
          setForm({
            fullName: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
            email: user.email || "",
            phone: user.phone || "",
            departmentId: user.departmentId || user.department?.id || "",
            status: user.status || "ACTIVE",
            password: "",
            confirmPassword: "",
            employeeId: user.employeeId || "",
          });
        } else if (depts.length && !form.departmentId) {
          setForm((prev) => ({
            ...prev,
            departmentId: depts[0].id,
            employeeId: preview?.employeeId || prev.employeeId,
          }));
        } else if (preview?.employeeId) {
          setForm((prev) => ({ ...prev, employeeId: preview.employeeId }));
        }
      } catch (err) {
        if (active) setError(getErrorMessage(err, "Failed to load form data"));
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleGeneratePassword = () => {
    const generated = generateStrongPassword(14);
    setForm((prev) => ({ ...prev, password: generated, confirmPassword: generated }));
    setShowPassword(true);
    toast.success("Strong password generated");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const { firstName, lastName } = splitFullName(form.fullName);
    if (!firstName.trim()) {
      setError("Full Name is required");
      return;
    }
    if (!form.email.trim()) {
      setError("Email is required");
      return;
    }
    if (!form.departmentId) {
      setError("Department is required");
      return;
    }

    if (!isEdit) {
      if (!form.password) {
        setError("Password is required");
        return;
      }
      if (!isStrongPassword(form.password)) {
        setError(PASSWORD_HELPER);
        return;
      }
      if (form.password !== form.confirmPassword) {
        setError("Passwords do not match");
        return;
      }
    } else if (form.password) {
      if (!isStrongPassword(form.password)) {
        setError(PASSWORD_HELPER);
        return;
      }
      if (form.password !== form.confirmPassword) {
        setError("Passwords do not match");
        return;
      }
    }

    try {
      setSubmitting(true);
      if (isEdit) {
        const payload = {
          firstName,
          lastName: lastName === "-" ? firstName : lastName,
          phone: form.phone || null,
          departmentId: form.departmentId,
          status: form.status,
        };
        if (form.password) payload.password = form.password;
        await employeeService.update(id, payload);
        toast.success("Sub Admin updated successfully");
      } else {
        await employeeService.createSubAdmin({
          firstName,
          lastName: lastName === "-" ? firstName : lastName,
          email: form.email.trim(),
          phone: form.phone || null,
          password: form.password,
          confirmPassword: form.confirmPassword,
          departmentId: form.departmentId,
          status: form.status,
        });
        toast.success("Sub Admin created successfully");
      }
      navigate("/dashboard/admins");
    } catch (err) {
      console.error("Sub Admin save failed:", err);
      const msg = getErrorMessage(err, isEdit ? "Failed to update Sub Admin" : "Failed to create Sub Admin");
      setError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <Box sx={{ pb: 3 }}>
        <PageHeader
          title={isEdit ? "Edit Sub Admin" : "Add Sub Admin"}
          crumbs={[
            { label: "Sub Admin Management", to: "/dashboard/admins" },
            { label: isEdit ? "Edit" : "Add" },
          ]}
        />
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/dashboard/admins")}
          sx={{ mb: 2, textTransform: "none", color: "#64748B" }}
        >
          Back to Sub Admin List
        </Button>

        {loading ? (
          <Box display="flex" justifyContent="center" py={6}>
            <CircularProgress size={32} />
          </Box>
        ) : (
          <Box component="form" onSubmit={handleSubmit}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
                {error}
              </Alert>
            )}

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 1.6fr) minmax(260px, 1fr)" },
                gap: 2,
                alignItems: "start",
              }}
            >
              <Box sx={{ ...card, minWidth: 0, overflow: "visible" }}>
                <Typography sx={{ fontWeight: 700, color: "#0F172A", mb: 2 }}>Sub Admin Details</Typography>

                {/* CSS grid — MUI v7 Grid ignores legacy item/xs/sm and was collapsing Department */}
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: {
                      xs: "1fr",
                      sm: "repeat(2, minmax(0, 1fr))",
                      md: "repeat(4, minmax(180px, 1fr))",
                    },
                    gap: 2,
                    width: "100%",
                  }}
                >
                  <Box sx={{ gridColumn: { xs: "1", sm: "span 1", md: "span 2" }, minWidth: 0 }}>
                    <TextField
                      fullWidth
                      label="Employee Code"
                      name="employeeId"
                      value={
                        isEdit
                          ? (form.employeeId || "—")
                          : (previewCode || form.employeeId || "Generating…")
                      }
                      InputProps={{ readOnly: true }}
                      helperText="Automatically generated"
                      sx={{
                        ...fieldSx,
                        "& .MuiOutlinedInput-root": {
                          ...fieldSx["& .MuiOutlinedInput-root"],
                          bgcolor: "#F1F5F9",
                        },
                        "& .MuiInputBase-input": { fontFamily: "monospace", fontWeight: 700 },
                      }}
                    />
                  </Box>
                  <Box sx={{ gridColumn: { xs: "1", sm: "span 1", md: "span 2" }, minWidth: 0 }}>
                    <TextField
                      fullWidth
                      label="Full Name *"
                      name="fullName"
                      value={form.fullName}
                      onChange={handleChange}
                      required
                      sx={fieldSx}
                    />
                  </Box>
                  <Box sx={{ gridColumn: { xs: "1", sm: "span 1", md: "span 2" }, minWidth: 0 }}>
                    <TextField
                      fullWidth
                      label="Email *"
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      required
                      disabled={isEdit}
                      sx={fieldSx}
                    />
                  </Box>
                  <Box sx={{ gridColumn: { xs: "1", sm: "span 1", md: "span 2" }, minWidth: 0 }}>
                    <TextField
                      fullWidth
                      label="Phone"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      sx={fieldSx}
                    />
                  </Box>
                  <Box sx={{ minWidth: 180 }}>
                    <FormControl fullWidth required sx={{ ...fieldSx, minWidth: 180 }}>
                      <InputLabel id="subadmin-department-label">Department *</InputLabel>
                      <Select
                        labelId="subadmin-department-label"
                        id="subadmin-department"
                        name="departmentId"
                        value={form.departmentId || ""}
                        label="Department *"
                        onChange={handleChange}
                        displayEmpty
                        renderValue={(selected) => {
                          if (!selected) return "Select Department";
                          const dept = departments.find((d) => d.id === selected);
                          return dept?.departmentName || dept?.name || "Select Department";
                        }}
                        MenuProps={{
                          PaperProps: { sx: { maxHeight: 320, minWidth: 220 } },
                        }}
                        sx={{
                          "& .MuiSelect-select": {
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          },
                        }}
                      >
                        {departments.length === 0 && (
                          <MenuItem value="" disabled>
                            No departments available
                          </MenuItem>
                        )}
                        {departments.map((d) => (
                          <MenuItem key={d.id} value={d.id}>
                            {d.departmentName || d.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                  <Box sx={{ minWidth: 0 }}>
                    <FormControl fullWidth sx={fieldSx}>
                      <InputLabel id="subadmin-role-label">Role</InputLabel>
                      <Select
                        labelId="subadmin-role-label"
                        value="SUB_ADMIN"
                        label="Role"
                        disabled
                      >
                        <MenuItem value="SUB_ADMIN">Sub Admin</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                  <Box sx={{ minWidth: 0 }}>
                    <FormControl fullWidth sx={fieldSx}>
                      <InputLabel id="subadmin-status-label">Status</InputLabel>
                      <Select
                        labelId="subadmin-status-label"
                        name="status"
                        value={form.status}
                        label="Status"
                        onChange={handleChange}
                      >
                        <MenuItem value="ACTIVE">Active</MenuItem>
                        <MenuItem value="INACTIVE">Inactive</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>

                  <Box sx={{ gridColumn: "1 / -1", minWidth: 0 }}>
                    <Typography sx={{ fontWeight: 600, color: "#334155", fontSize: "0.85rem", mb: 1 }}>
                      {isEdit ? "Reset Password (optional)" : "Login Password"}
                    </Typography>
                    <Box
                      display="flex"
                      flexDirection={{ xs: "column", sm: "row" }}
                      gap={1.5}
                      alignItems={{ xs: "stretch", sm: "flex-start" }}
                      sx={{ mb: 1.5 }}
                    >
                      <TextField
                        fullWidth
                        label="Password *"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        value={form.password}
                        onChange={handleChange}
                        required={!isEdit}
                        helperText={PASSWORD_HELPER}
                        sx={{ ...fieldSx, flex: 1, minWidth: 0 }}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              {form.password && (
                                <IconButton
                                  onClick={() => {
                                    navigator.clipboard.writeText(form.password);
                                    toast.success("Password copied");
                                  }}
                                  edge="end"
                                  size="small"
                                  title="Copy Password"
                                  sx={{ mr: 0.5 }}
                                >
                                  <ContentCopy fontSize="small" />
                                </IconButton>
                              )}
                              <IconButton onClick={() => setShowPassword((v) => !v)} edge="end" size="small">
                                {showPassword ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                      <Button
                        type="button"
                        variant="outlined"
                        onClick={handleGeneratePassword}
                        sx={{
                          height: 56,
                          textTransform: "none",
                          borderRadius: 2,
                          minWidth: { xs: "100%", sm: 180 },
                          flexShrink: 0,
                          whiteSpace: "nowrap",
                        }}
                        startIcon={<AutorenewIcon />}
                      >
                        Generate Password
                      </Button>
                    </Box>
                    <TextField
                      fullWidth
                      label="Confirm Password *"
                      name="confirmPassword"
                      type={showConfirm ? "text" : "password"}
                      value={form.confirmPassword}
                      onChange={handleChange}
                      required={!isEdit || Boolean(form.password)}
                      sx={fieldSx}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={() => setShowConfirm((v) => !v)} edge="end" size="small">
                              {showConfirm ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Box>
                </Box>
              </Box>

              <Box sx={{ ...card, minWidth: 0 }}>
                <Typography sx={{ fontWeight: 700, color: "#0F172A", mb: 1 }}>Permissions</Typography>
                <Typography sx={{ color: "#64748B", fontSize: "0.8rem", mb: 2 }}>
                  Assigned by the system Sub Admin role (RolePermission). Not stored per user.
                </Typography>
                <FormGroup>
                  {(rolePermissions.length
                    ? rolePermissions
                    : Object.keys(PERMISSION_LABELS).map((name) => ({ name }))
                  ).map((p) => {
                    const name = p.name || p;
                    const label = PERMISSION_LABELS[name] || p.description || name;
                    return (
                      <FormControlLabel
                        key={name}
                        control={
                          <Checkbox
                            checked
                            disabled
                            sx={{ color: "#2563EB", "&.Mui-checked": { color: "#2563EB" } }}
                          />
                        }
                        label={<Typography sx={{ fontSize: "0.85rem", color: "#334155" }}>{label}</Typography>}
                      />
                    );
                  })}
                </FormGroup>
              </Box>
            </Box>

            <Box display="flex" gap={2} mt={2}>
              <Button
                type="submit"
                variant="contained"
                disabled={submitting}
                startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
                sx={{ textTransform: "none", bgcolor: "#2563EB", borderRadius: 2 }}
              >
                {isEdit ? "Update Sub Admin" : "Create Sub Admin"}
              </Button>
              <Button
                onClick={() => navigate("/dashboard/admins")}
                disabled={submitting}
                sx={{ textTransform: "none", color: "#64748B" }}
              >
                Cancel
              </Button>
            </Box>
          </Box>
        )}
      </Box>
    </Layout>
  );
}
