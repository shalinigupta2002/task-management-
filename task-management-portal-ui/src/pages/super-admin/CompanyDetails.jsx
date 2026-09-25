import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box, Grid, Button, Tabs, Tab, Typography, CircularProgress, Alert, Chip,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import SuperAdminLayout from "../../components/layouts/SuperAdminLayout";
import { PageHeader, StatusBadge, card } from "../../components/super-admin/shared";
import companyService from "../../services/companyService";
import planService from "../../services/planService";
import { getErrorMessage } from "../../utils/session";

function TabPanel({ value, index, children }) {
  if (value !== index) return null;
  return <Box sx={{ pt: 2 }}>{children}</Box>;
}

function normalizeStatus(status) {
  if (!status) return "";
  const s = String(status).toUpperCase();
  if (s === "ACTIVE") return "Active";
  if (s === "INACTIVE" || s === "SUSPENDED") return "Suspended";
  return status;
}

export default function CompanyDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const [company, setCompany] = useState(null);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const [c, planResult] = await Promise.all([
        companyService.getById(id),
        planService.getAll().catch(() => ({ data: [] })),
      ]);
      setCompany(c);
      const planList = planResult?.data || planResult?.items || (Array.isArray(planResult) ? planResult : []);
      setPlans(Array.isArray(planList) ? planList : []);
    } catch (err) {
      setCompany(null);
      setError(getErrorMessage(err, "Failed to load company"));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <SuperAdminLayout>
        <Box display="flex" justifyContent="center" py={8}><CircularProgress /></Box>
      </SuperAdminLayout>
    );
  }

  if (!company) {
    return (
      <SuperAdminLayout>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Typography sx={{ color: "#64748B" }}>Company not found.</Typography>
        <Button onClick={() => navigate("/super-admin/companies")} sx={{ mt: 2, textTransform: "none" }}>Back to list</Button>
      </SuperAdminLayout>
    );
  }

  const sub = company.subscriptions?.[0] || company.subscription || null;
  const planName = sub?.plan?.planName || plans.find((p) => p.id === (sub?.planId || company.subscriptionPlanId))?.planName || "—";
  const status = normalizeStatus(company.status);
  const employeeCount = company._count?.users ?? 0;
  const deptCount = company._count?.departments ?? 0;
  const expiry = sub?.endDate ? new Date(sub.endDate).toLocaleDateString("en-GB") : "—";
  const tabs = ["Information", "Subscription"];

  return (
    <SuperAdminLayout>
      <Box sx={{ pb: 3 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate("/super-admin/companies")} sx={{ textTransform: "none", color: "#64748B", mb: 1 }}>Back</Button>
        <Box display="flex" flexWrap="wrap" justifyContent="space-between" alignItems="flex-start" gap={2} mb={1}>
          <PageHeader title={company.companyName || company.name} crumbs={[
            { label: "Company Management", to: "/super-admin/companies" },
            { label: "Company Details" },
          ]} />
          <Box display="flex" gap={1} alignItems="center">
            <StatusBadge status={status} />
            <Button variant="outlined" startIcon={<EditOutlinedIcon />} onClick={() => navigate(`/super-admin/companies/${id}/edit`)}
              sx={{ textTransform: "none", borderColor: "#2563EB", color: "#2563EB", borderRadius: 2 }}>Edit Company</Button>
          </Box>
        </Box>

        <Grid container spacing={2} sx={{ mb: 2 }}>
          {[
            { l: "Plan", v: planName },
            { l: "Employees", v: employeeCount },
            { l: "Departments", v: deptCount },
            { l: "Expiry", v: expiry },
          ].map((s) => (
            <Grid item xs={6} sm={3} key={s.l}>
              <Box sx={card}>
                <Typography sx={{ fontSize: "0.75rem", color: "#94A3B8", mb: 0.5 }}>{s.l}</Typography>
                <Typography sx={{ fontWeight: 700, color: "#0F172A" }}>{s.v}</Typography>
              </Box>
            </Grid>
          ))}
        </Grid>

        <Box sx={card}>
          <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderBottom: "1px solid #E8EDF5", "& .MuiTab-root": { textTransform: "none", fontWeight: 600 } }}>
            {tabs.map((t) => <Tab key={t} label={t} />)}
          </Tabs>

          <TabPanel value={tab} index={0}>
            <Grid container spacing={2}>
              {[
                { l: "Company Name", v: company.companyName },
                { l: "Code", v: company.companyCode },
                { l: "Email", v: company.email },
                { l: "Phone", v: company.phone || "—" },
                { l: "Address", v: company.address || "—" },
                { l: "Status", v: status },
              ].map((f) => (
                <Grid item xs={12} sm={6} key={f.l}>
                  <Typography sx={{ fontSize: "0.75rem", color: "#94A3B8" }}>{f.l}</Typography>
                  <Typography sx={{ fontWeight: 600, color: "#0F172A" }}>{f.v || "—"}</Typography>
                </Grid>
              ))}
            </Grid>
          </TabPanel>

          <TabPanel value={tab} index={1}>
            {sub ? (
              <Box>
                <Typography sx={{ fontWeight: 600, mb: 1 }}>Current subscription</Typography>
                <Chip label={planName} sx={{ mr: 1, mb: 1 }} />
                <Typography sx={{ color: "#64748B", fontSize: "0.9rem" }}>
                  Status: {sub.status || "—"} · Expiry: {expiry}
                </Typography>
              </Box>
            ) : (
              <Typography sx={{ color: "#64748B" }}>No subscription records for this company.</Typography>
            )}
          </TabPanel>
        </Box>
      </Box>
    </SuperAdminLayout>
  );
}
