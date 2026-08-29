import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box, Grid, Button, TextField, CircularProgress, FormControlLabel, Switch, Checkbox, Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SuperAdminLayout from "../../components/layouts/SuperAdminLayout";
import { PageHeader, card, fieldSx } from "../../components/super-admin/shared";
import { addAuditLog } from "../../utils/superAdminStorage";
import { planService } from "../../services";
import toast from "../../utils/toast";

const emptyForm = {
  name: "",
  description: "",
  monthlyPrice: "",
  yearlyPrice: "",
  currency: "INR",
  users: "",
  storage: "",
  features: "",
  enabled: true,
  billingMonthly: true,
  billingYearly: true,
};

export default function PlanForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (isEdit) {
      const fetchPlan = async () => {
        setLoading(true);
        try {
          const res = await planService.getById(id);
          if (res.success) {
            const p = res.data;
            setForm({
              name: p.planName || p.name || "",
              description: p.description || "",
              monthlyPrice: String(p.monthlyPrice ?? ""),
              yearlyPrice: String(p.yearlyPrice ?? ""),
              currency: p.currency || "INR",
              users: String(p.users ?? p.maxEmployees ?? ""),
              storage: p.storage || "",
              features: Array.isArray(p.features) ? p.features.join("\n") : "",
              enabled: p.enabled !== false && p.status !== "INACTIVE",
              billingMonthly: p.billingOptions?.monthly !== false,
              billingYearly: p.billingOptions?.yearly !== false,
            });
          } else {
            toast.error("Plan not found");
          }
        } catch (err) {
          console.error(err);
          toast.error("Failed to load plan details");
        } finally {
          setLoading(false);
        }
      };
      fetchPlan();
    }
  }, [id, isEdit]);

  const validate = () => {
    if (!form.name.trim()) { toast.error("Plan name is required"); return false; }
    if (!form.description.trim()) { toast.error("Description is required"); return false; }
    const monthly = Number(form.monthlyPrice);
    const yearly = Number(form.yearlyPrice);
    if (form.monthlyPrice === "" || Number.isNaN(monthly) || monthly < 0) { toast.error("Enter a valid monthly price"); return false; }
    if (form.yearlyPrice === "" || Number.isNaN(yearly) || yearly < 0) { toast.error("Enter a valid yearly price"); return false; }
    if (!form.users.trim()) { toast.error("Maximum users is required"); return false; }
    if (!form.storage.trim()) { toast.error("Storage is required"); return false; }
    if (!form.billingMonthly && !form.billingYearly) { toast.error("At least one billing option must be enabled"); return false; }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const usersVal = form.users.trim();
    const maxEmployees = usersVal.toLowerCase() === "unlimited" ? "Unlimited" : Number(usersVal);

    const payload = {
      planName: form.name.trim(),
      description: form.description.trim(),
      monthlyPrice: Number(form.monthlyPrice),
      yearlyPrice: Number(form.yearlyPrice),
      currency: form.currency,
      maxEmployees,
      users: maxEmployees,
      storage: form.storage.trim(),
      features: form.features.split("\n").map((f) => f.trim()).filter(Boolean),
      enabled: form.enabled,
      status: form.enabled ? "ACTIVE" : "INACTIVE",
      billingOptions: { monthly: form.billingMonthly, yearly: form.billingYearly },
    };

    try {
      setSaving(true);
      if (isEdit) {
        await planService.update(id, payload);
        toast.success("Plan updated successfully");
      } else {
        await planService.create(payload);
        toast.success("Plan created successfully");
      }
      addAuditLog({
        id: `al-${Date.now()}`,
        action: isEdit ? "Plan Updated" : "Plan Created",
        entity: form.name,
        user: "Super Admin",
        date: new Date().toLocaleString(),
        ip: "192.168.1.1",
      });
      navigate("/super-admin/plans");
    } catch (err) {
      toast.error(err.message || "Failed to save plan");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SuperAdminLayout>
      <Box component="form" onSubmit={handleSubmit} sx={{ pb: 3, maxWidth: 720 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ textTransform: "none", color: "#64748B", mb: 1 }}>Back</Button>
        <PageHeader title={isEdit ? "Edit Plan" : "Add Plan"} crumbs={[{ label: "Plan Management", to: "/super-admin/plans" }, { label: isEdit ? "Edit Plan" : "Add Plan" }]} />

        {loading ? (
          <Box display="flex" justifyContent="center" py={8}><CircularProgress /></Box>
        ) : (
          <Box sx={card}>
            <Grid container spacing={2}>
              <Grid item xs={12}><TextField fullWidth size="small" label="Plan Name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required sx={fieldSx} /></Grid>
              <Grid item xs={12}><TextField fullWidth size="small" label="Description" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} required multiline rows={2} sx={fieldSx} /></Grid>
              <Grid item xs={12} sm={6}><TextField fullWidth size="small" label="Monthly Price (₹)" type="number" inputProps={{ min: 0 }} value={form.monthlyPrice} onChange={(e) => setForm((f) => ({ ...f, monthlyPrice: e.target.value }))} required sx={fieldSx} /></Grid>
              <Grid item xs={12} sm={6}><TextField fullWidth size="small" label="Yearly Price (₹)" type="number" inputProps={{ min: 0 }} value={form.yearlyPrice} onChange={(e) => setForm((f) => ({ ...f, yearlyPrice: e.target.value }))} required sx={fieldSx} /></Grid>
              <Grid item xs={12} sm={6}><TextField fullWidth size="small" label="Currency" value={form.currency} InputProps={{ readOnly: true }} sx={fieldSx} /></Grid>
              <Grid item xs={12} sm={6}><TextField fullWidth size="small" label="Maximum Users" value={form.users} onChange={(e) => setForm((f) => ({ ...f, users: e.target.value }))} required placeholder="10 or Unlimited" sx={fieldSx} /></Grid>
              <Grid item xs={12} sm={6}><TextField fullWidth size="small" label="Storage" value={form.storage} onChange={(e) => setForm((f) => ({ ...f, storage: e.target.value }))} required placeholder="5 GB" sx={fieldSx} /></Grid>
              <Grid item xs={12}><TextField fullWidth multiline rows={5} label="Features (one per line)" value={form.features} onChange={(e) => setForm((f) => ({ ...f, features: e.target.value }))} sx={fieldSx} /></Grid>
              <Grid item xs={12}>
                <Typography sx={{ fontSize: "0.8rem", fontWeight: 600, color: "#334155", mb: 0.5 }}>Billing Availability</Typography>
                <FormControlLabel control={<Checkbox checked={form.billingMonthly} onChange={(e) => setForm((f) => ({ ...f, billingMonthly: e.target.checked }))} size="small" />} label="Monthly" />
                <FormControlLabel control={<Checkbox checked={form.billingYearly} onChange={(e) => setForm((f) => ({ ...f, billingYearly: e.target.checked }))} size="small" />} label="Yearly" />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel control={<Switch checked={form.enabled} onChange={(e) => setForm((f) => ({ ...f, enabled: e.target.checked }))} />} label="Plan Enabled" />
              </Grid>
            </Grid>
            <Box display="flex" gap={1.5} mt={2}>
              <Button type="submit" variant="contained" disabled={saving} sx={{ textTransform: "none", bgcolor: "#2563EB", borderRadius: 2, fontWeight: 600 }}>
                {saving ? "Saving..." : isEdit ? "Save Plan" : "Create Plan"}
              </Button>
              <Button variant="outlined" onClick={() => navigate(-1)} sx={{ textTransform: "none", borderRadius: 2 }}>Cancel</Button>
            </Box>
          </Box>
        )}
      </Box>
    </SuperAdminLayout>
  );
}
