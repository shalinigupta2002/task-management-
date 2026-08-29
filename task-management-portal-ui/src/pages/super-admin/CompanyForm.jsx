import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box, Grid, Button, TextField, MenuItem, Select, FormControl, InputLabel, Typography,
  InputAdornment, IconButton, Alert, CircularProgress, Dialog, DialogTitle, DialogContent,
  DialogActions, Tooltip,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import AutofixHighIcon from "@mui/icons-material/AutofixHigh";
import SuperAdminLayout from "../../components/layouts/SuperAdminLayout";
import { PageHeader, card, fieldSx } from "../../components/super-admin/shared";
import companyService from "../../services/companyService";
import planService from "../../services/planService";
import { getErrorMessage } from "../../utils/session";
import toast from "../../utils/toast";

const emptyForm = {
  companyName: "",
  companyCode: "",
  email: "",
  address: "",
  subscriptionPlanId: "",
  mainAdminName: "",
  mainAdminEmail: "",
  mainAdminPhone: "",
  password: "",
  confirmPassword: "",
};

function generateStrongPassword(length = 14) {
  const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lower = "abcdefghijkmnopqrstuvwxyz";
  const numbers = "23456789";
  const special = "@#$%&*!?";
  const all = upper + lower + numbers + special;
  const cryptoObj = window.crypto;

  const pick = (chars) => {
    const arr = new Uint32Array(1);
    cryptoObj.getRandomValues(arr);
    return chars[arr[0] % chars.length];
  };

  const chars = [pick(upper), pick(lower), pick(numbers), pick(special)];
  while (chars.length < length) chars.push(pick(all));

  for (let i = chars.length - 1; i > 0; i -= 1) {
    const arr = new Uint32Array(1);
    cryptoObj.getRandomValues(arr);
    const j = arr[0] % (i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join("");
}

function isStrongPassword(password) {
  return (
    typeof password === "string"
    && password.length >= 12
    && /[A-Z]/.test(password)
    && /[a-z]/.test(password)
    && /[0-9]/.test(password)
    && /[^A-Za-z0-9]/.test(password)
  );
}

function formatPlanPrice(plan) {
  const price = Number(plan?.monthlyPrice ?? 0);
  const formatted = Number.isFinite(price)
    ? price.toLocaleString("en-IN", { maximumFractionDigits: 2 })
    : "0";
  return `${plan.planName || plan.name} — ₹${formatted}/month`;
}

export default function CompanyForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState(emptyForm);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [credentialsDialog, setCredentialsDialog] = useState(null);

  const passwordMismatch = Boolean(
    form.password && form.confirmPassword && form.password !== form.confirmPassword
  );
  const passwordWeak = Boolean(form.password && !isStrongPassword(form.password));

  const activePlans = useMemo(
    () => (plans || []).filter((p) => (p.status || "ACTIVE") === "ACTIVE"),
    [plans]
  );

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        setError("");
        const planRes = await planService.getAll({ limit: 100, status: "ACTIVE" });
        const planList = Array.isArray(planRes?.data)
          ? planRes.data
          : Array.isArray(planRes?.data?.items)
            ? planRes.data.items
            : Array.isArray(planRes)
              ? planRes
              : [];
        if (!active) return;
        setPlans(planList);

        if (isEdit) {
          const company = await companyService.getById(id);
          if (!active) return;
          const currentPlanId = company?.subscriptions?.[0]?.subscriptionPlanId
            || company?.subscriptions?.[0]?.subscriptionPlan?.id
            || "";
          setForm({
            companyName: company.companyName || "",
            companyCode: company.companyCode || "",
            email: company.email || "",
            address: company.address || "",
            subscriptionPlanId: currentPlanId,
            mainAdminName: "",
            mainAdminEmail: "",
            mainAdminPhone: "",
            password: "",
            confirmPassword: "",
          });
        } else if (planList.length > 0) {
          setForm((f) => ({
            ...f,
            subscriptionPlanId: f.subscriptionPlanId || planList[0].id,
          }));
        }
      } catch (err) {
        if (active) setError(getErrorMessage(err, "Failed to load form data"));
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleGeneratePassword = () => {
    const generated = generateStrongPassword(14);
    setForm((f) => ({ ...f, password: generated, confirmPassword: generated }));
    setShowPassword(true);
    toast.success("Strong password generated");
  };

  const handleCopyPassword = async () => {
    if (!form.password) return;
    try {
      await navigator.clipboard.writeText(form.password);
      toast.success("Password copied");
    } catch {
      toast.error("Unable to copy password");
    }
  };

  const validateCreate = () => {
    if (!form.companyName.trim()) return "Company Name is required";
    if (!form.email.trim()) return "Company Email is required";
    if (!form.address.trim()) return "Address is required";
    if (!form.subscriptionPlanId) return "Plan is required";
    if (!form.mainAdminName.trim()) return "Main Admin Name is required";
    if (!form.mainAdminEmail.trim()) return "Main Admin Email is required";
    if (!form.password) return "Password is required";
    if (!isStrongPassword(form.password)) {
      return "Password must be at least 12 characters and include uppercase, lowercase, number, and special character";
    }
    if (!form.confirmPassword) return "Confirm Password is required";
    if (form.password !== form.confirmPassword) return "Passwords do not match.";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (isEdit) {
      try {
        setSaving(true);
        await companyService.update(id, {
          companyName: form.companyName.trim(),
          email: form.email.trim(),
          address: form.address.trim(),
        });
        toast.success("Company updated successfully");
        navigate(`/super-admin/companies/${id}`);
      } catch (err) {
        setError(getErrorMessage(err, "Failed to update company"));
        toast.error(getErrorMessage(err, "Failed to update company"));
      } finally {
        setSaving(false);
      }
      return;
    }

    const validationError = validateCreate();
    if (validationError) {
      setError(validationError);
      toast.error(validationError);
      return;
    }

    try {
      setSaving(true);
      const created = await companyService.create({
        companyName: form.companyName.trim(),
        email: form.email.trim(),
        address: form.address.trim(),
        subscriptionPlanId: form.subscriptionPlanId,
        mainAdmin: {
          name: form.mainAdminName.trim(),
          email: form.mainAdminEmail.trim(),
          phone: form.mainAdminPhone.trim() || null,
          password: form.password,
          confirmPassword: form.confirmPassword,
        },
      });

      const selectedPlan = plans.find((p) => p.id === form.subscriptionPlanId);

      toast.success("Company and Main Admin created successfully");
      setCredentialsDialog({
        companyName: created?.companyName || form.companyName,
        companyCode: created?.companyCode || "N/A",
        loginEmail: form.mainAdminEmail.trim(),
        password: form.password,
        planName: selectedPlan?.planName || "Starter",
      });
    } catch (err) {
      setError(getErrorMessage(err, "Failed to create company"));
      toast.error(getErrorMessage(err, "Failed to create company"));
    } finally {
      setSaving(false);
    }
  };

  const createDisabled = saving
    || passwordMismatch
    || passwordWeak
    || !form.password
    || !form.confirmPassword;

  return (
    <SuperAdminLayout>
      <Box component="form" onSubmit={handleSubmit} sx={{ pb: 3, maxWidth: 900 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ textTransform: "none", color: "#64748B", mb: 1 }}>
          Back
        </Button>
        <PageHeader
          title={isEdit ? "Edit Company" : "Add Company"}
          crumbs={[
            { label: "Company Management", to: "/super-admin/companies" },
            { label: isEdit ? "Edit Company" : "Add Company" },
          ]}
        />

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {loading ? (
          <Box display="flex" justifyContent="center" py={6}><CircularProgress /></Box>
        ) : (
          <>
            <Box sx={card}>
              <Typography sx={{ fontWeight: 700, color: "#0F172A", mb: 2 }}>Company Information</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth size="small" label="Company Name *" name="companyName" value={form.companyName} onChange={handleChange} required sx={fieldSx} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Company Code"
                    name="companyCode"
                    value={isEdit ? form.companyCode : "Automatically generated after company creation"}
                    disabled
                    sx={fieldSx}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth size="small" label="Email *" name="email" type="email" value={form.email} onChange={handleChange} required sx={fieldSx} helperText="Company business email" />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth size="small" required>
                    <InputLabel id="plan-label">Plan *</InputLabel>
                    <Select
                      labelId="plan-label"
                      label="Plan *"
                      name="subscriptionPlanId"
                      value={form.subscriptionPlanId}
                      onChange={handleChange}
                      sx={{ borderRadius: 2, bgcolor: "#F8FAFC" }}
                      disabled={isEdit}
                    >
                      {activePlans.map((p) => (
                        <MenuItem key={p.id} value={p.id}>{formatPlanPrice(p)}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth size="small" label="Address *" name="address" value={form.address} onChange={handleChange} required multiline rows={2} sx={fieldSx} />
                </Grid>
              </Grid>
            </Box>

            {!isEdit && (
              <Box sx={{ ...card, mt: 2 }}>
                <Typography sx={{ fontWeight: 700, color: "#0F172A", mb: 2 }}>Main Admin</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth size="small" label="Name *" name="mainAdminName" value={form.mainAdminName} onChange={handleChange} required sx={fieldSx} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth size="small" label="Email *" name="mainAdminEmail" type="email" value={form.mainAdminEmail} onChange={handleChange} required sx={fieldSx} helperText="Used as Main Admin login email" />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth size="small" label="Phone" name="mainAdminPhone" value={form.mainAdminPhone} onChange={handleChange} sx={fieldSx} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Password *"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                      onChange={handleChange}
                      required
                      error={passwordWeak}
                      helperText={passwordWeak ? "Min 12 chars with upper, lower, number, special" : " "}
                      sx={fieldSx}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <Tooltip title={showPassword ? "Hide password" : "Show password"}>
                              <IconButton size="small" onClick={() => setShowPassword((v) => !v)} edge="end">
                                {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Copy password">
                              <span>
                                <IconButton size="small" onClick={handleCopyPassword} disabled={!form.password} edge="end">
                                  <ContentCopyIcon fontSize="small" />
                                </IconButton>
                              </span>
                            </Tooltip>
                          </InputAdornment>
                        ),
                      }}
                    />
                    <Button
                      type="button"
                      variant="outlined"
                      size="small"
                      startIcon={<AutofixHighIcon />}
                      onClick={handleGeneratePassword}
                      sx={{ mt: 0.5, textTransform: "none", borderRadius: 2 }}
                    >
                      Generate Password
                    </Button>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Confirm Password *"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={form.confirmPassword}
                      onChange={handleChange}
                      required
                      error={passwordMismatch}
                      helperText={passwordMismatch ? "Passwords do not match." : " "}
                      sx={fieldSx}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton size="small" onClick={() => setShowConfirmPassword((v) => !v)} edge="end">
                              {showConfirmPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                </Grid>
              </Box>
            )}

            <Box display="flex" gap={1.5} mt={2}>
              <Button
                type="submit"
                variant="contained"
                disabled={isEdit ? saving : createDisabled}
                sx={{ textTransform: "none", bgcolor: "#2563EB", borderRadius: 2, fontWeight: 600, px: 3, "&:hover": { bgcolor: "#1D4ED8" } }}
              >
                {saving ? "Saving..." : isEdit ? "Save Changes" : "Create Company"}
              </Button>
              <Button variant="outlined" onClick={() => navigate(-1)} disabled={saving} sx={{ textTransform: "none", borderRadius: 2, borderColor: "#E2E8F0", color: "#64748B" }}>
                Cancel
              </Button>
            </Box>
          </>
        )}
      </Box>

      <Dialog open={Boolean(credentialsDialog)} onClose={() => { setCredentialsDialog(null); navigate("/super-admin/companies"); }} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Company Created Successfully</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            This password is shown only once. Copy and share it securely with the Main Admin.
          </Alert>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, mt: 1 }}>
            <Typography><strong>Company Name:</strong> {credentialsDialog?.companyName}</Typography>
            <Box display="flex" alignItems="center" gap={1}>
              <Typography><strong>Company Code:</strong> {credentialsDialog?.companyCode}</Typography>
              <IconButton
                size="small"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(credentialsDialog?.companyCode || "");
                    toast.success("Company Code copied");
                  } catch {
                    toast.error("Unable to copy Company Code");
                  }
                }}
              >
                <ContentCopyIcon fontSize="small" />
              </IconButton>
            </Box>
            <Typography><strong>Main Admin Email:</strong> {credentialsDialog?.loginEmail}</Typography>
            <Typography><strong>Plan:</strong> {credentialsDialog?.planName || "Starter"}</Typography>
            <Box display="flex" alignItems="center" gap={1}>
              <Typography sx={{ fontFamily: "monospace" }}><strong>Password:</strong> {credentialsDialog?.password}</Typography>
              <IconButton
                size="small"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(credentialsDialog?.password || "");
                    toast.success("Password copied");
                  } catch {
                    toast.error("Unable to copy password");
                  }
                }}
              >
                <ContentCopyIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            onClick={() => { setCredentialsDialog(null); navigate("/super-admin/companies"); }}
            sx={{ textTransform: "none", bgcolor: "#2563EB" }}
          >
            Done
          </Button>
        </DialogActions>
      </Dialog>
    </SuperAdminLayout>
  );
}
