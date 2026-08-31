import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Box, Grid, Button, TextField, Typography, Alert, CircularProgress,
  InputAdornment, IconButton, Tooltip,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import AutofixHighIcon from "@mui/icons-material/AutoFixHigh";
import LandingNavbar from "../components/home/LandingNavbar";
import LandingFooter from "../components/home/LandingFooter";
import { card, fieldSx } from "../components/super-admin/shared";
import onboardingService, { loadOnboardingSession, clearOnboardingSession } from "../services/onboardingService";
import { getErrorMessage } from "../utils/session";
import toast from "../utils/toast";

function generateStrongPassword(length = 14) {
  const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lower = "abcdefghijkmnopqrstuvwxyz";
  const numbers = "23456789";
  const special = "@#$%&*!?";
  const all = upper + lower + numbers + special;
  const pick = (chars) => {
    const arr = new Uint32Array(1);
    window.crypto.getRandomValues(arr);
    return chars[arr[0] % chars.length];
  };
  const chars = [pick(upper), pick(lower), pick(numbers), pick(special)];
  while (chars.length < length) chars.push(pick(all));
  for (let i = chars.length - 1; i > 0; i -= 1) {
    const arr = new Uint32Array(1);
    window.crypto.getRandomValues(arr);
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

export default function CompanyOnboardingPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const ref = params.get("ref");

  const [sessionInfo, setSessionInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [form, setForm] = useState({
    companyName: "",
    email: "",
    address: "",
    mainAdminName: "",
    mainAdminEmail: "",
    mainAdminPhone: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    let active = true;
    (async () => {
      const session = loadOnboardingSession();
      if (!session?.referenceCode || !session?.sessionToken) {
        setError("Onboarding session missing. Complete payment first.");
        setLoading(false);
        return;
      }
      if (ref && ref !== session.referenceCode) {
        setError("This onboarding link does not match your payment session.");
        setLoading(false);
        return;
      }
      try {
        const data = await onboardingService.getSession(session);
        if (!active) return;
        if (data.status === "ONBOARDING_COMPLETED") {
          navigate("/company/onboarding/success", { replace: true, state: { result: data } });
          return;
        }
        if (data.status !== "ONBOARDING_PENDING" && data.status !== "PAYMENT_SUCCESS") {
          setError("Payment must be completed before company registration.");
          setSessionInfo(data);
          setLoading(false);
          return;
        }
        setSessionInfo(data);
      } catch (err) {
        if (active) setError(getErrorMessage(err, "Unable to load onboarding session"));
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [ref, navigate]);

  const mismatch = form.password && form.confirmPassword && form.password !== form.confirmPassword;
  const weak = form.password && !isStrongPassword(form.password);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleGenerate = () => {
    const pwd = generateStrongPassword(14);
    setForm((f) => ({ ...f, password: pwd, confirmPassword: pwd }));
    setShowPassword(true);
    toast.success("Strong password generated");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const session = loadOnboardingSession();
    if (!session) {
      setError("Onboarding session missing");
      return;
    }
    if (!form.companyName.trim() || !form.email.trim() || !form.address.trim()) {
      toast.error("Company fields are required");
      return;
    }
    if (!form.mainAdminName.trim() || !form.mainAdminEmail.trim()) {
      toast.error("Main Admin fields are required");
      return;
    }
    if (!isStrongPassword(form.password)) {
      toast.error("Password does not meet policy");
      return;
    }
    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      const result = await onboardingService.complete({
        referenceCode: session.referenceCode,
        sessionToken: session.sessionToken,
        company: {
          companyName: form.companyName.trim(),
          email: form.email.trim(),
          address: form.address.trim(),
        },
        mainAdmin: {
          name: form.mainAdminName.trim(),
          email: form.mainAdminEmail.trim(),
          phone: form.mainAdminPhone.trim() || null,
          password: form.password,
          confirmPassword: form.confirmPassword,
        },
      });
      clearOnboardingSession();
      toast.success("Company created successfully");
      navigate("/company/onboarding/success", { state: { result } });
    } catch (err) {
      setError(getErrorMessage(err, "Failed to complete onboarding"));
      toast.error(getErrorMessage(err, "Failed to complete onboarding"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ bgcolor: "#F8FAFC", minHeight: "100vh" }}>
      <LandingNavbar activePage="pricing" />
      <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 900, mx: "auto", px: 2, py: 4 }}>
        <Typography sx={{ fontWeight: 800, fontSize: "1.75rem", color: "#0F172A", mb: 0.5 }}>
          Create Your Company
        </Typography>
        <Typography sx={{ color: "#64748B", mb: 3 }}>
          Complete registration after successful payment. Company Code is generated automatically.
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {loading ? (
          <Box display="flex" justifyContent="center" py={6}><CircularProgress /></Box>
        ) : (
          <>
            <Box sx={{ ...card, mb: 2 }}>
              <Typography sx={{ fontWeight: 700, mb: 1 }}>Selected Plan</Typography>
              <Typography sx={{ fontWeight: 600 }}>{sessionInfo?.plan?.planName || "—"}</Typography>
              <Typography sx={{ color: "#64748B", fontSize: "0.9rem" }}>
                ₹{(sessionInfo?.amountRupees || 0).toLocaleString("en-IN")} / {sessionInfo?.billingCycle === "YEARLY" ? "year" : "month"} · Read-only after payment
              </Typography>
            </Box>

            <Box sx={card}>
              <Typography sx={{ fontWeight: 700, color: "#0F172A", mb: 2 }}>Company Information</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth size="small" label="Company Name *" name="companyName" value={form.companyName} onChange={handleChange} required sx={fieldSx} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth size="small" label="Company Email *" name="email" type="email" value={form.email} onChange={handleChange} required sx={fieldSx} />
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth size="small" label="Address *" name="address" value={form.address} onChange={handleChange} required multiline rows={2} sx={fieldSx} />
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth size="small" label="Company Code" value="Automatically generated after company creation" InputProps={{ readOnly: true }} sx={fieldSx} />
                </Grid>
              </Grid>
            </Box>

            <Box sx={{ ...card, mt: 2 }}>
              <Typography sx={{ fontWeight: 700, color: "#0F172A", mb: 2 }}>Main Admin</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth size="small" label="Name *" name="mainAdminName" value={form.mainAdminName} onChange={handleChange} required sx={fieldSx} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth size="small" label="Email *" name="mainAdminEmail" type="email" value={form.mainAdminEmail} onChange={handleChange} required helperText="Used as Main Admin login email" sx={fieldSx} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth size="small" label="Phone" name="mainAdminPhone" value={form.mainAdminPhone} onChange={handleChange} sx={fieldSx} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth size="small" label="Password *" name="password"
                    type={showPassword ? "text" : "password"}
                    value={form.password} onChange={handleChange} required
                    error={Boolean(weak)} helperText={weak ? "Min 12 chars with upper, lower, number, special" : " "}
                    sx={fieldSx}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <Tooltip title={showPassword ? "Hide" : "Show"}>
                            <IconButton size="small" onClick={() => setShowPassword((v) => !v)}>{showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}</IconButton>
                          </Tooltip>
                          <Tooltip title="Copy">
                            <span>
                              <IconButton size="small" disabled={!form.password} onClick={async () => { await navigator.clipboard.writeText(form.password); toast.success("Copied"); }}>
                                <ContentCopyIcon fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>
                        </InputAdornment>
                      ),
                    }}
                  />
                  <Button type="button" size="small" variant="outlined" startIcon={<AutofixHighIcon />} onClick={handleGenerate} sx={{ mt: 0.5, textTransform: "none", borderRadius: 2 }}>
                    Generate Password
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth size="small" label="Confirm Password *" name="confirmPassword"
                    type={showConfirm ? "text" : "password"}
                    value={form.confirmPassword} onChange={handleChange} required
                    error={Boolean(mismatch)} helperText={mismatch ? "Passwords do not match." : " "}
                    sx={fieldSx}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton size="small" onClick={() => setShowConfirm((v) => !v)}>
                            {showConfirm ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              </Grid>
            </Box>

            <Box display="flex" gap={1.5} mt={2}>
              <Button
                type="submit"
                variant="contained"
                disabled={saving || mismatch || weak || !form.password}
                sx={{ textTransform: "none", bgcolor: "#2563EB", borderRadius: 2, fontWeight: 600, px: 3 }}
              >
                {saving ? "Creating..." : "Create Company"}
              </Button>
              <Button variant="outlined" onClick={() => navigate("/pricing")} sx={{ textTransform: "none", borderRadius: 2 }}>
                Cancel
              </Button>
            </Box>
          </>
        )}
      </Box>
      <LandingFooter />
    </Box>
  );
}
