import { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import {
  Box, Typography, Grid, TextField, MenuItem, FormControl, InputLabel, Select,
  Button, IconButton, InputAdornment, FormControlLabel, Switch, CircularProgress, Tooltip,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import {
  generateStrongPassword,
  isStrongPassword,
  PASSWORD_HELPER,
} from "../../utils/passwordStrength";
import { toast } from "../../utils/toast";

const card = {
  borderRadius: 3,
  bgcolor: "#FFFFFF",
  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
  border: "1px solid #E8EDF5",
  p: 2.5,
  mb: 2,
};

const fieldSx = {
  "& .MuiOutlinedInput-root": { borderRadius: 2, bgcolor: "#F8FAFC" },
};

/**
 * Single-page Account Details form for creating/editing employees.
 * mode: "create" | "edit"
 * lockDepartment: when true (SUB_ADMIN), department select is disabled
 * previewEmployeeCode: next system-generated code (create mode preview only)
 */
export default function EmployeeAccountDetailsForm({
  mode = "create",
  initialValues = {},
  departments = [],
  lockDepartment = false,
  lockedDepartmentId = "",
  submitting = false,
  previewEmployeeCode = "",
  onCancel,
  onSubmit,
}) {
  const [form, setForm] = useState({
    employeeId: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    designation: "",
    departmentId: lockDepartment ? lockedDepartmentId : "",
    joiningDate: "",
    employmentType: "Full Time",
    password: "",
    confirmPassword: "",
    requirePasswordChange: true,
    enableTwoFactor: false,
    status: "ACTIVE",
    ...initialValues,
    ...(lockDepartment ? { departmentId: lockedDepartmentId || initialValues.departmentId || "" } : {}),
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (mode === "create" && previewEmployeeCode) {
      setForm((f) => ({ ...f, employeeId: previewEmployeeCode }));
    }
  }, [mode, previewEmployeeCode]);

  const passwordMismatch = Boolean(
    form.password && form.confirmPassword && form.password !== form.confirmPassword
  );
  const passwordWeak = Boolean(mode === "create" && form.password && !isStrongPassword(form.password));

  const departmentOptions = useMemo(() => departments || [], [departments]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "employeeId") return; // immutable / system-generated
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleToggle = (e) => {
    const { name, checked } = e.target;
    setForm((f) => ({ ...f, [name]: checked }));
  };

  const handleGeneratePassword = () => {
    const generated = generateStrongPassword(14);
    setForm((f) => ({ ...f, password: generated, confirmPassword: generated }));
    setShowPassword(true);
    toast.success("Strong password generated");
  };

  const validate = () => {
    const next = {};
    if (!form.firstName.trim()) next.firstName = "First name is required";
    if (!form.lastName.trim()) next.lastName = "Last name is required";
    if (!form.email.trim()) next.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) next.email = "Invalid email";

    if (mode === "create") {
      if (!form.password) next.password = "Password is required";
      else if (!isStrongPassword(form.password)) next.password = PASSWORD_HELPER;
      if (!form.confirmPassword) next.confirmPassword = "Confirm password is required";
      else if (form.password !== form.confirmPassword) next.confirmPassword = "Passwords do not match";
    } else if (form.password) {
      if (!isStrongPassword(form.password)) next.password = PASSWORD_HELPER;
      if (form.password !== form.confirmPassword) next.confirmPassword = "Passwords do not match";
    }

    if (!lockDepartment && !form.departmentId) {
      // department optional for Main Admin unless business requires it
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error("Please fix the highlighted fields");
      return;
    }

    const payload = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim(),
      phone: form.phone.trim() || null,
      designation: form.designation.trim() || null,
      departmentId: lockDepartment
        ? (lockedDepartmentId || form.departmentId || null)
        : (form.departmentId || null),
      status: form.status || "ACTIVE",
      joiningDate: form.joiningDate || null,
    };
    // employeeId is never sent on create — backend generates it
    if (mode === "edit") {
      // display-only; backend ignores mutations
    }

    if (mode === "create" || form.password) {
      payload.password = form.password;
      payload.confirmPassword = form.confirmPassword;
    }

    // UI-only preferences (not persisted in current User schema)
    payload._meta = {
      employmentType: form.employmentType || null,
      requirePasswordChange: form.requirePasswordChange,
      enableTwoFactor: form.enableTwoFactor,
    };

    onSubmit(payload);
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Box mb={2.5}>
        <Typography sx={{ fontWeight: 800, color: "#0F172A", fontSize: "1.35rem" }}>Account Details</Typography>
        <Typography sx={{ color: "#64748B", fontSize: "0.9rem", mt: 0.5 }}>
          Enter the employee's personal information and account credentials.
        </Typography>
      </Box>

      <Box sx={card}>
        <Typography sx={{ fontWeight: 700, color: "#0F172A", mb: 2 }}>Employee Information</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              size="small"
              label="Employee Code"
              name="employeeId"
              value={form.employeeId || (mode === "create" ? "Generating…" : "—")}
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
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              select fullWidth size="small" label="Employment Type" name="employmentType"
              value={form.employmentType} onChange={handleChange} sx={fieldSx}
            >
              {["Full Time", "Part Time", "Contract", "Intern"].map((t) => (
                <MenuItem key={t} value={t}>{t}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth size="small" label="First Name *" name="firstName"
              value={form.firstName} onChange={handleChange}
              error={!!errors.firstName} helperText={errors.firstName} sx={fieldSx}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth size="small" label="Last Name *" name="lastName"
              value={form.lastName} onChange={handleChange}
              error={!!errors.lastName} helperText={errors.lastName} sx={fieldSx}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth size="small" label="Email *" name="email" type="email"
              value={form.email} onChange={handleChange}
              error={!!errors.email} helperText={errors.email}
              sx={fieldSx} disabled={mode === "edit"}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth size="small" label="Phone" name="phone"
              value={form.phone} onChange={handleChange} sx={fieldSx}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth size="small" label="Designation" name="designation"
              value={form.designation} onChange={handleChange} sx={fieldSx}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth size="small" sx={fieldSx} disabled={lockDepartment}>
              <InputLabel>Department</InputLabel>
              <Select
                label="Department"
                name="departmentId"
                value={form.departmentId || ""}
                onChange={handleChange}
              >
                {!lockDepartment && <MenuItem value="">No Department</MenuItem>}
                {departmentOptions.map((d) => (
                  <MenuItem key={d.id} value={d.id}>{d.departmentName}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth size="small" type="date" label="Joining Date" name="joiningDate"
              value={form.joiningDate} onChange={handleChange}
              InputLabelProps={{ shrink: true }} sx={fieldSx}
            />
          </Grid>
        </Grid>
      </Box>

      <Box sx={card}>
        <Typography sx={{ fontWeight: 700, color: "#0F172A", mb: 2 }}>Account & Security</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth size="small" label="System Role *" value="EMPLOYEE" disabled
              helperText="Fixed to EMPLOYEE for this registration flow" sx={fieldSx}
            />
          </Grid>
          {mode === "edit" && (
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small" sx={fieldSx}>
                <InputLabel>Status</InputLabel>
                <Select label="Status" name="status" value={form.status} onChange={handleChange}>
                  <MenuItem value="ACTIVE">Active</MenuItem>
                  <MenuItem value="INACTIVE">Inactive</MenuItem>
                  <MenuItem value="SUSPENDED">Suspended</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          )}

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth size="small"
              type={showPassword ? "text" : "password"}
              label={mode === "create" ? "Password *" : "New Password"}
              name="password"
              value={form.password}
              onChange={handleChange}
              error={!!errors.password || passwordWeak}
              helperText={errors.password || (passwordWeak ? PASSWORD_HELPER : (mode === "edit" ? "Leave blank to keep current password" : PASSWORD_HELPER))}
              sx={fieldSx}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Tooltip title={showPassword ? "Hide" : "Show"}>
                      <IconButton size="small" onClick={() => setShowPassword((v) => !v)} edge="end">
                        {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                      </IconButton>
                    </Tooltip>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth size="small"
              type={showConfirm ? "text" : "password"}
              label={mode === "create" ? "Confirm Password *" : "Confirm New Password"}
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              error={!!errors.confirmPassword || passwordMismatch}
              helperText={errors.confirmPassword || (passwordMismatch ? "Passwords do not match" : " ")}
              sx={fieldSx}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setShowConfirm((v) => !v)} edge="end">
                      {showConfirm ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <Button
              type="button"
              variant="outlined"
              startIcon={<AutorenewIcon />}
              onClick={handleGeneratePassword}
              sx={{ textTransform: "none", borderRadius: 2, mb: 1 }}
            >
              Generate Password
            </Button>
          </Grid>
          <Grid item xs={12}>
            <Box sx={{ p: 2, borderRadius: 2, border: "1px solid #E8EDF5", bgcolor: "#F8FAFC" }}>
              <FormControlLabel
                control={
                  <Switch
                    size="small"
                    name="requirePasswordChange"
                    checked={form.requirePasswordChange}
                    onChange={handleToggle}
                  />
                }
                label={
                  <Box>
                    <Typography sx={{ fontWeight: 600, fontSize: "0.875rem", color: "#0F172A" }}>Require Password Change</Typography>
                    <Typography sx={{ fontSize: "0.75rem", color: "#94A3B8" }}>User should change password on first login</Typography>
                  </Box>
                }
              />
              <FormControlLabel
                sx={{ mt: 1, display: "flex" }}
                control={
                  <Switch
                    size="small"
                    name="enableTwoFactor"
                    checked={form.enableTwoFactor}
                    onChange={handleToggle}
                  />
                }
                label={
                  <Box>
                    <Typography sx={{ fontWeight: 600, fontSize: "0.875rem", color: "#0F172A" }}>Enable Two-Factor Authentication</Typography>
                    <Typography sx={{ fontSize: "0.75rem", color: "#94A3B8" }}>Preference flag (stored when backend support is available)</Typography>
                  </Box>
                }
              />
            </Box>
          </Grid>
        </Grid>
      </Box>

      <Box display="flex" justifyContent="space-between" gap={2} mt={1}>
        <Button onClick={onCancel} disabled={submitting} sx={{ textTransform: "none", color: "#64748B" }}>
          Cancel
        </Button>
        <Button
          type="submit"
          variant="contained"
          disabled={submitting}
          sx={{ textTransform: "none", bgcolor: "#2563EB", borderRadius: 2, px: 3, "&:hover": { bgcolor: "#1D4ED8" } }}
        >
          {submitting ? <CircularProgress size={22} color="inherit" /> : (mode === "create" ? "Create Employee" : "Save Changes")}
        </Button>
      </Box>
    </Box>
  );
}

EmployeeAccountDetailsForm.propTypes = {
  mode: PropTypes.oneOf(["create", "edit"]),
  initialValues: PropTypes.object,
  departments: PropTypes.array,
  lockDepartment: PropTypes.bool,
  lockedDepartmentId: PropTypes.string,
  submitting: PropTypes.bool,
  previewEmployeeCode: PropTypes.string,
  onCancel: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};
