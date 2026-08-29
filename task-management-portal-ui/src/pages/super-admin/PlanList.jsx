import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Grid, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  IconButton, Switch, Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  CircularProgress, Typography, Chip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";
import CardMembershipIcon from "@mui/icons-material/CardMembership";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import SuperAdminLayout from "../../components/layouts/SuperAdminLayout";
import { StatCard, PageHeader, ConfirmDialog, card, tableHeadCell, fieldSx } from "../../components/super-admin/shared";
import { addAuditLog } from "../../utils/superAdminStorage";
import { averageMonthlyPrice, averageYearlyPrice } from "../../utils/planStorage";
import { planService } from "../../services";
import toast from "../../utils/toast";

export default function PlanList() {
  const navigate = useNavigate();
  const [plans, setLocal] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pricingDialog, setPricingDialog] = useState(null);
  const [featuresDialog, setFeaturesDialog] = useState(null);
  const [detailsDialog, setDetailsDialog] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [form, setForm] = useState({});

  const loadPlans = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await planService.getAll();
      if (res.success) {
        setLocal(Array.isArray(res.data) ? res.data : []);
      } else {
        setError("Failed to load plans");
      }
    } catch (err) {
      console.error(err);
      setError("Error connecting to backend API");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlans();
  }, []);

  const togglePlan = async (id, currentEnabled) => {
    try {
      await planService.update(id, { enabled: !currentEnabled });
      toast.success("Plan status updated successfully");
      addAuditLog({ id: `al-${Date.now()}`, action: "Plan Toggled", entity: id, user: "Super Admin", date: new Date().toLocaleString(), ip: "192.168.1.1" });
      loadPlans();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update plan status");
    }
  };

  const savePricing = async () => {
    const monthly = Number(form.monthlyPrice);
    const yearly = Number(form.yearlyPrice);
    if (monthly < 0 || yearly < 0) {
      toast.error("Prices cannot be negative");
      return;
    }
    try {
      await planService.update(pricingDialog.id, { monthlyPrice: monthly, yearlyPrice: yearly });
      toast.success("Plan pricing updated successfully");
      setPricingDialog(null);
      loadPlans();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update plan pricing");
    }
  };

  const saveFeatures = async () => {
    try {
      await planService.update(featuresDialog.id, {
        features: form.features.split("\n").filter(Boolean),
      });
      toast.success("Plan features updated successfully");
      setFeaturesDialog(null);
      loadPlans();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update plan features");
    }
  };

  const handleDelete = async () => {
    try {
      await planService.delete(confirm.id);
      toast.success("Plan deleted successfully");
      setConfirm(null);
      loadPlans();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete plan");
    }
  };

  const avgMonthly = averageMonthlyPrice(plans);
  const avgYearly = averageYearlyPrice(plans);

  return (
    <SuperAdminLayout>
      <Box sx={{ pb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" gap={2} mb={1}>
          <PageHeader title="Plan Management" crumbs={[{ label: "Plan Management" }, { label: "Plan List" }]} />
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate("/super-admin/plans/add")}
            sx={{ textTransform: "none", bgcolor: "#2563EB", borderRadius: 2, fontWeight: 600 }}>Add Plan</Button>
        </Box>

        <Grid container spacing={2} sx={{ my: 2.5 }}>
          <Grid item xs={12} sm={4}>
            <StatCard title="Total Plans" value={String(plans.length)} icon={CardMembershipIcon} color="#2563EB" bg="#EFF6FF" />
          </Grid>
          <Grid item xs={12} sm={4}>
            <StatCard title="Enabled Plans" value={String(plans.filter((p) => p.enabled !== false && p.status !== "INACTIVE").length)} icon={CardMembershipIcon} color="#16A34A" bg="#F0FDF4" />
          </Grid>
          <Grid item xs={12} sm={4}>
            <StatCard
              title="Average Monthly Price"
              value={`₹${avgMonthly}`}
              sub={avgYearly > 0 ? `Avg Yearly: ₹${avgYearly.toLocaleString("en-IN")}` : undefined}
              icon={CurrencyRupeeIcon}
              color="#7C3AED"
              bg="#F5F3FF"
            />
          </Grid>
        </Grid>

        {loading ? (
          <Box display="flex" justifyContent="center" py={8}><CircularProgress /></Box>
        ) : error ? (
          <Box sx={{ ...card, p: 4, textAlign: "center", borderColor: "#FEE2E2", bgcolor: "#FEF2F2" }}>
            <Typography color="error" sx={{ fontWeight: 600 }}>{error}</Typography>
            <Button variant="outlined" color="primary" onClick={loadPlans} sx={{ mt: 2, textTransform: "none" }}>Try Again</Button>
          </Box>
        ) : (
          <Box sx={{ ...card, p: 0, overflow: "hidden" }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: "#F8FAFC" }}>
                    {["Plan", "Price", "Users", "Storage", "Features", "Status", "Enabled", "Actions"].map((h) => (
                      <TableCell key={h} sx={tableHeadCell}>{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {plans.map((p) => {
                    const enabled = p.enabled !== false && p.status !== "INACTIVE";
                    const name = p.planName || p.name;
                    return (
                      <TableRow key={p.id} hover sx={{ "& td": { borderBottom: "1px solid #F1F5F9", py: 1.5 } }}>
                        <TableCell>
                          <Typography
                            sx={{ fontWeight: 600, color: "#0F172A", cursor: "pointer", "&:hover": { color: "#2563EB" } }}
                            onClick={() => setDetailsDialog(p)}
                          >
                            {name}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ minWidth: 120 }}>
                          <Typography sx={{ fontSize: "0.82rem", fontWeight: 600, color: "#0F172A" }}>₹{p.monthlyPrice}/month</Typography>
                          <Typography sx={{ fontSize: "0.75rem", color: "#64748B" }}>₹{p.yearlyPrice}/year</Typography>
                        </TableCell>
                        <TableCell>{p.users ?? p.maxEmployees}</TableCell>
                        <TableCell>{p.storage}</TableCell>
                        <TableCell sx={{ fontSize: "0.82rem", color: "#64748B", maxWidth: 180 }}>
                          {(p.features || []).slice(0, 2).join(", ")}{(p.features || []).length > 2 ? "..." : ""}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={enabled ? "Active" : "Disabled"}
                            size="small"
                            sx={{
                              height: 22, fontSize: "0.65rem", fontWeight: 600,
                              bgcolor: enabled ? "#F0FDF4" : "#F1F5F9",
                              color: enabled ? "#16A34A" : "#64748B",
                            }}
                          />
                        </TableCell>
                        <TableCell><Switch checked={enabled} onChange={() => togglePlan(p.id, enabled)} size="small" /></TableCell>
                        <TableCell>
                          <Box display="flex" gap={0.3}>
                            <IconButton size="small" onClick={() => navigate(`/super-admin/plans/${p.id}/edit`)} title="Edit"><EditOutlinedIcon sx={{ fontSize: 18 }} /></IconButton>
                            <IconButton size="small" onClick={() => setDetailsDialog(p)} title="View details"><VisibilityOutlinedIcon sx={{ fontSize: 18 }} /></IconButton>
                            <IconButton size="small" onClick={() => { setForm({ monthlyPrice: p.monthlyPrice, yearlyPrice: p.yearlyPrice }); setPricingDialog(p); }} title="Change pricing"><CurrencyRupeeIcon sx={{ fontSize: 18 }} /></IconButton>
                            <IconButton size="small" onClick={() => { setForm({ features: (p.features || []).join("\n") }); setFeaturesDialog(p); }} title="Change features"><CardMembershipIcon sx={{ fontSize: 18 }} /></IconButton>
                            <IconButton size="small" sx={{ color: "#DC2626" }} onClick={() => setConfirm({ id: p.id, title: "Delete Plan", message: `Delete ${name} plan?` })} title="Delete"><DeleteOutlineIcon sx={{ fontSize: 18 }} /></IconButton>
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
      </Box>

      <Dialog open={Boolean(pricingDialog)} onClose={() => setPricingDialog(null)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>Change Pricing — {pricingDialog?.planName || pricingDialog?.name}</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 1.5, pt: 1 }}>
          <TextField fullWidth size="small" type="number" inputProps={{ min: 0 }} label="Monthly Price (₹)" value={form.monthlyPrice ?? ""} onChange={(e) => setForm((f) => ({ ...f, monthlyPrice: e.target.value }))} sx={fieldSx} />
          <TextField fullWidth size="small" type="number" inputProps={{ min: 0 }} label="Yearly Price (₹)" value={form.yearlyPrice ?? ""} onChange={(e) => setForm((f) => ({ ...f, yearlyPrice: e.target.value }))} sx={fieldSx} />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setPricingDialog(null)} sx={{ textTransform: "none" }}>Cancel</Button>
          <Button variant="contained" onClick={savePricing} sx={{ textTransform: "none", bgcolor: "#2563EB" }}>Save</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(featuresDialog)} onClose={() => setFeaturesDialog(null)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>Change Features — {featuresDialog?.planName || featuresDialog?.name}</DialogTitle>
        <DialogContent><TextField fullWidth multiline rows={5} value={form.features || ""} onChange={(e) => setForm({ features: e.target.value })} placeholder="One feature per line" sx={{ ...fieldSx, mt: 1 }} /></DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}><Button onClick={() => setFeaturesDialog(null)} sx={{ textTransform: "none" }}>Cancel</Button><Button variant="contained" onClick={saveFeatures} sx={{ textTransform: "none", bgcolor: "#2563EB" }}>Save</Button></DialogActions>
      </Dialog>

      <Dialog open={Boolean(detailsDialog)} onClose={() => setDetailsDialog(null)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>{detailsDialog?.planName || detailsDialog?.name}</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: "#64748B", fontSize: "0.9rem", mb: 2 }}>{detailsDialog?.description}</Typography>
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5, mb: 2 }}>
            <Box><Typography sx={{ fontSize: "0.75rem", color: "#94A3B8" }}>Monthly</Typography><Typography sx={{ fontWeight: 700 }}>₹{detailsDialog?.monthlyPrice} / month</Typography></Box>
            <Box><Typography sx={{ fontSize: "0.75rem", color: "#94A3B8" }}>Yearly</Typography><Typography sx={{ fontWeight: 700 }}>₹{detailsDialog?.yearlyPrice} / year</Typography></Box>
            <Box><Typography sx={{ fontSize: "0.75rem", color: "#94A3B8" }}>Users</Typography><Typography sx={{ fontWeight: 600 }}>{detailsDialog?.users ?? detailsDialog?.maxEmployees}</Typography></Box>
            <Box><Typography sx={{ fontSize: "0.75rem", color: "#94A3B8" }}>Storage</Typography><Typography sx={{ fontWeight: 600 }}>{detailsDialog?.storage}</Typography></Box>
          </Box>
          <Typography sx={{ fontSize: "0.75rem", color: "#94A3B8", mb: 0.5 }}>Features</Typography>
          {(detailsDialog?.features || []).map((f) => (
            <Typography key={f} sx={{ fontSize: "0.85rem", color: "#475569" }}>• {f}</Typography>
          ))}
          <Chip
            label={detailsDialog?.enabled !== false && detailsDialog?.status !== "INACTIVE" ? "Active" : "Disabled"}
            size="small"
            sx={{ mt: 2, fontWeight: 600 }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDetailsDialog(null)} sx={{ textTransform: "none" }}>Close</Button>
          <Button variant="contained" onClick={() => { setDetailsDialog(null); navigate(`/super-admin/plans/${detailsDialog.id}/edit`); }} sx={{ textTransform: "none", bgcolor: "#2563EB" }}>Edit Plan</Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog open={Boolean(confirm)} title={confirm?.title} message={confirm?.message} confirmLabel="Delete" confirmColor="#DC2626" onClose={() => setConfirm(null)} onConfirm={handleDelete} />
    </SuperAdminLayout>
  );
}
