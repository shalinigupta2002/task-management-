import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box, Grid, Button, Tabs, Tab, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TextField, MenuItem, Select, FormControl, Chip, Dialog, DialogTitle, DialogContent, DialogActions,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import LockResetIcon from "@mui/icons-material/LockReset";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import SuperAdminLayout from "../../components/layouts/SuperAdminLayout";
import { PageHeader, StatusBadge, ConfirmDialog, card, tableHeadCell, fieldSx } from "../../components/super-admin/shared";
import { getCompanyById, updateCompany, getPlans, addAuditLog } from "../../utils/superAdminStorage";

function TabPanel({ value, index, children }) {
  if (value !== index) return null;
  return <Box sx={{ pt: 2 }}>{children}</Box>;
}

export default function CompanyDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const [company, setCompany] = useState(() => getCompanyById(id));
  const [dialog, setDialog] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [form, setForm] = useState({});
  const plans = getPlans();

  if (!company) {
    return (
      <SuperAdminLayout>
        <Typography sx={{ color: "#64748B" }}>Company not found.</Typography>
        <Button onClick={() => navigate("/super-admin/companies")} sx={{ mt: 2, textTransform: "none" }}>Back to list</Button>
      </SuperAdminLayout>
    );
  }

  const refresh = () => setCompany(getCompanyById(id));

  const openSubDialog = (type, data = {}) => {
    setForm(data);
    setDialog(type);
  };

  const saveSubscription = () => {
    const plan = plans.find((p) => p.id === form.planId);
    const history = [...(company.subscriptionHistory || []), {
      id: `sh-${Date.now()}`, action: dialog === "upgrade" ? "Plan Upgraded" : dialog === "downgrade" ? "Plan Downgraded" : dialog === "extend" ? "Expiry Extended" : "Plan Updated",
      plan: plan?.name || company.planName, date: new Date().toISOString().slice(0, 10), by: "Super Admin",
    }];
    updateCompany(id, {
      planId: form.planId || company.planId,
      planName: plan?.name || company.planName,
      subscriptionExpiry: form.subscriptionExpiry || company.subscriptionExpiry,
      subscriptionHistory: history,
    });
    addAuditLog({ id: `al-${Date.now()}`, action: "Subscription Updated", entity: company.name, user: "Super Admin", date: new Date().toLocaleString(), ip: "192.168.1.1" });
    setDialog(null);
    refresh();
  };

  const resetMainAdminPassword = () => {
    addAuditLog({ id: `al-${Date.now()}`, action: "Main Admin Password Reset", entity: company.name, user: "Super Admin", date: new Date().toLocaleString(), ip: "192.168.1.1" });
    setConfirm(null);
  };

  const saveSettings = () => {
    updateCompany(id, { settings: form });
    setDialog(null);
    refresh();
  };

  const tabs = ["Information", "Subscription", "Main Admin", "Sub Admins", "Departments", "Employees", "Tasks", "Settings"];

  return (
    <SuperAdminLayout>
      <Box sx={{ pb: 3 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate("/super-admin/companies")} sx={{ textTransform: "none", color: "#64748B", mb: 1 }}>Back</Button>
        <Box display="flex" flexWrap="wrap" justifyContent="space-between" alignItems="flex-start" gap={2} mb={1}>
          <PageHeader title={company.name} crumbs={[
            { label: "Company Management", to: "/super-admin/companies" },
            { label: "Company Details" },
          ]} />
          <Box display="flex" gap={1}>
            <StatusBadge status={company.status} />
            <Button variant="outlined" startIcon={<EditOutlinedIcon />} onClick={() => navigate(`/super-admin/companies/${id}/edit`)}
              sx={{ textTransform: "none", borderColor: "#2563EB", color: "#2563EB", borderRadius: 2 }}>Edit Company</Button>
          </Box>
        </Box>

        <Grid container spacing={2} sx={{ mb: 2 }}>
          {[
            { l: "Plan", v: company.planName },
            { l: "Employees", v: company.employees },
            { l: "Departments", v: Array.isArray(company.departments) ? company.departments.length : (company.departments || 0) },
            { l: "Expiry", v: company.subscriptionExpiry },
          ].map((s) => (
            <Grid item xs={6} sm={3} key={s.l}>
              <Box sx={card}>
                <Typography sx={{ color: "#64748B", fontSize: "0.75rem" }}>{s.l}</Typography>
                <Typography sx={{ fontWeight: 700, color: "#0F172A", fontSize: "1.1rem" }}>{s.v}</Typography>
              </Box>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ ...card, p: 0 }}>
          <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto"
            sx={{ px: 2, borderBottom: "1px solid #E8EDF5", "& .Mui-selected": { color: "#2563EB !important" }, "& .MuiTabs-indicator": { bgcolor: "#2563EB" } }}>
            {tabs.map((t) => <Tab key={t} label={t} sx={{ textTransform: "none", fontWeight: 600, fontSize: "0.85rem" }} />)}
          </Tabs>

          <Box sx={{ p: 2 }}>
            <TabPanel value={tab} index={0}>
              <Grid container spacing={2}>
                {[["Company Code", company.code], ["Email", company.email], ["Phone", company.phone], ["Industry", company.industry], ["Address", company.address], ["Created", company.createdAt]].map(([l, v]) => (
                  <Grid item xs={12} sm={6} key={l}>
                    <Typography sx={{ color: "#64748B", fontSize: "0.78rem", mb: 0.3 }}>{l}</Typography>
                    <Typography sx={{ color: "#0F172A", fontWeight: 600, fontSize: "0.9rem" }}>{v}</Typography>
                  </Grid>
                ))}
              </Grid>
            </TabPanel>

            <TabPanel value={tab} index={1}>
              <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
                <Button size="small" variant="contained" onClick={() => openSubDialog("assign", { planId: company.planId })} sx={{ textTransform: "none", bgcolor: "#2563EB" }}>Assign Plan</Button>
                <Button size="small" variant="outlined" onClick={() => openSubDialog("edit", { planId: company.planId, subscriptionExpiry: company.subscriptionExpiry })} sx={{ textTransform: "none" }}>Edit Plan</Button>
                <Button size="small" variant="outlined" onClick={() => openSubDialog("upgrade", { planId: "business" })} sx={{ textTransform: "none" }}>Upgrade</Button>
                <Button size="small" variant="outlined" onClick={() => openSubDialog("downgrade", { planId: "starter" })} sx={{ textTransform: "none" }}>Downgrade</Button>
                <Button size="small" variant="outlined" onClick={() => openSubDialog("extend", { subscriptionExpiry: "2027-12-31" })} sx={{ textTransform: "none" }}>Extend Expiry</Button>
              </Box>
              <Typography sx={{ fontWeight: 700, mb: 1 }}>Subscription History</Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead><TableRow sx={{ bgcolor: "#F8FAFC" }}>{["Action", "Plan", "Date", "By"].map((h) => <TableCell key={h} sx={tableHeadCell}>{h}</TableCell>)}</TableRow></TableHead>
                  <TableBody>
                    {(company.subscriptionHistory || []).map((h) => (
                      <TableRow key={h.id}><TableCell>{h.action}</TableCell><TableCell>{h.plan}</TableCell><TableCell>{h.date}</TableCell><TableCell>{h.by}</TableCell></TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </TabPanel>

            <TabPanel value={tab} index={2}>
              {company.mainAdmin && (
                <Box sx={card}>
                  <Grid container spacing={2}>
                    {[["Name", company.mainAdmin.name], ["Email", company.mainAdmin.email], ["Phone", company.mainAdmin.phone], ["Last Login", company.mainAdmin.lastLogin], ["Status", company.mainAdmin.status]].map(([l, v]) => (
                      <Grid item xs={12} sm={6} key={l}><Typography sx={{ color: "#64748B", fontSize: "0.78rem" }}>{l}</Typography><Typography sx={{ fontWeight: 600 }}>{v}</Typography></Grid>
                    ))}
                  </Grid>
                  <Box display="flex" gap={1} mt={2}>
                    <Button startIcon={<LockResetIcon />} variant="outlined" onClick={() => setConfirm({ title: "Reset Password", message: `Reset password for ${company.mainAdmin.name}?`, action: resetMainAdminPassword })} sx={{ textTransform: "none" }}>Reset Password</Button>
                    <Button startIcon={<EditOutlinedIcon />} variant="outlined" sx={{ textTransform: "none" }}>Edit Main Admin</Button>
                    <Button startIcon={<DeleteOutlineIcon />} color="error" variant="outlined" sx={{ textTransform: "none" }}>Delete Main Admin</Button>
                  </Box>
                </Box>
              )}
            </TabPanel>

            <TabPanel value={tab} index={3}>
              <TableContainer>
                <Table size="small">
                  <TableHead><TableRow sx={{ bgcolor: "#F8FAFC" }}>{["Name", "Email", "Roles", "Permissions", "Departments", "Last Login"].map((h) => <TableCell key={h} sx={tableHeadCell}>{h}</TableCell>)}</TableRow></TableHead>
                  <TableBody>
                    {(company.subAdmins || []).map((sa) => (
                      <TableRow key={sa.id}>
                        <TableCell sx={{ fontWeight: 600 }}>{sa.name}</TableCell>
                        <TableCell>{sa.email}</TableCell>
                        <TableCell>{sa.roles?.join(", ")}</TableCell>
                        <TableCell>{sa.permissions?.join(", ")}</TableCell>
                        <TableCell>{sa.departments?.join(", ")}</TableCell>
                        <TableCell>{sa.lastLogin}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </TabPanel>

            <TabPanel value={tab} index={4}>
              <Box display="flex" flexWrap="wrap" gap={1}>
                {(company.departments || []).map((d) => <Chip key={d} label={d} sx={{ bgcolor: "#EFF6FF", color: "#2563EB", fontWeight: 600 }} />)}
              </Box>
            </TabPanel>

            <TabPanel value={tab} index={5}>
              <TableContainer>
                <Table size="small">
                  <TableHead><TableRow sx={{ bgcolor: "#F8FAFC" }}>{["Name", "Email", "Department", "Role", "Status"].map((h) => <TableCell key={h} sx={tableHeadCell}>{h}</TableCell>)}</TableRow></TableHead>
                  <TableBody>
                    {(company.companyEmployees || []).map((e) => (
                      <TableRow key={e.id}><TableCell sx={{ fontWeight: 600 }}>{e.name}</TableCell><TableCell>{e.email}</TableCell><TableCell>{e.department}</TableCell><TableCell>{e.role}</TableCell><TableCell><StatusBadge status={e.status} /></TableCell></TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </TabPanel>

            <TabPanel value={tab} index={6}>
              <TableContainer>
                <Table size="small">
                  <TableHead><TableRow sx={{ bgcolor: "#F8FAFC" }}>{["Task", "Assignee", "Status", "Due Date"].map((h) => <TableCell key={h} sx={tableHeadCell}>{h}</TableCell>)}</TableRow></TableHead>
                  <TableBody>
                    {(company.companyTasks || []).map((t) => (
                      <TableRow key={t.id}><TableCell sx={{ fontWeight: 600 }}>{t.title}</TableCell><TableCell>{t.assignee}</TableCell><TableCell>{t.status}</TableCell><TableCell>{t.dueDate}</TableCell></TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </TabPanel>

            <TabPanel value={tab} index={7}>
              <Grid container spacing={2}>
                {Object.entries(company.settings || {}).map(([k, v]) => (
                  <Grid item xs={12} sm={6} key={k}>
                    <Typography sx={{ color: "#64748B", fontSize: "0.78rem", textTransform: "capitalize" }}>{k.replace(/([A-Z])/g, " $1")}</Typography>
                    <Typography sx={{ fontWeight: 600 }}>{String(v)}</Typography>
                  </Grid>
                ))}
              </Grid>
              <Button sx={{ mt: 2, textTransform: "none" }} variant="outlined" onClick={() => openSubDialog("settings", { ...company.settings })}>Edit Company Settings</Button>
            </TabPanel>
          </Box>
        </Box>
      </Box>

      <Dialog open={Boolean(dialog && dialog !== "settings")} onClose={() => setDialog(null)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>{dialog === "extend" ? "Extend Expiry" : "Update Subscription"}</DialogTitle>
        <DialogContent>
          {dialog !== "extend" && (
            <FormControl fullWidth size="small" sx={{ mt: 1, mb: 2 }}>
              <Select value={form.planId || company.planId} onChange={(e) => setForm((f) => ({ ...f, planId: e.target.value }))} sx={{ borderRadius: 2, bgcolor: "#F8FAFC" }}>
                {plans.map((p) => <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>)}
              </Select>
            </FormControl>
          )}
          {(dialog === "extend" || dialog === "edit") && (
            <TextField fullWidth size="small" label="Expiry Date" value={form.subscriptionExpiry || ""} onChange={(e) => setForm((f) => ({ ...f, subscriptionExpiry: e.target.value }))} sx={fieldSx} />
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialog(null)} sx={{ textTransform: "none" }}>Cancel</Button>
          <Button variant="contained" onClick={saveSubscription} sx={{ textTransform: "none", bgcolor: "#2563EB" }}>Save</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={dialog === "settings"} onClose={() => setDialog(null)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>Company Settings</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            {["timezone", "dateFormat", "language"].map((k) => (
              <Grid item xs={12} sm={6} key={k}>
                <TextField fullWidth size="small" label={k} value={form[k] || ""} onChange={(e) => setForm((f) => ({ ...f, [k]: e.target.value }))} sx={fieldSx} />
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialog(null)} sx={{ textTransform: "none" }}>Cancel</Button>
          <Button variant="contained" onClick={saveSettings} sx={{ textTransform: "none", bgcolor: "#2563EB" }}>Save</Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog open={Boolean(confirm)} title={confirm?.title} message={confirm?.message} onClose={() => setConfirm(null)} onConfirm={confirm?.action} confirmLabel="Confirm" />
    </SuperAdminLayout>
  );
}
