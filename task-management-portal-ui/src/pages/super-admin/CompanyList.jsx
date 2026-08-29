import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Grid, Button, TextField, MenuItem, Select, FormControl,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  IconButton, InputAdornment, Pagination, Menu,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import BusinessIcon from "@mui/icons-material/Business";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import PauseCircleOutlineIcon from "@mui/icons-material/PauseCircleOutline";
import SuperAdminLayout from "../../components/layouts/SuperAdminLayout";
import { StatCard, PageHeader, StatusBadge, ConfirmDialog, card, tableHeadCell } from "../../components/super-admin/shared";
import { getCompanies, setCompanies, addAuditLog } from "../../utils/superAdminStorage";

export default function CompanyList() {
  const navigate = useNavigate();
  const [companies, setLocal] = useState(getCompanies());
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selected, setSelected] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const rowsPerPage = 10;

  const refresh = () => setLocal(getCompanies());

  const filtered = useMemo(() => companies.filter((c) => {
    const q = search.toLowerCase();
    return (
      (!q || c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q) || c.email.toLowerCase().includes(q)) &&
      (status === "all" || c.status === status)
    );
  }), [companies, search, status]);

  const paged = filtered.slice((page - 1) * rowsPerPage, page * rowsPerPage);
  const totalPages = Math.ceil(filtered.length / rowsPerPage) || 1;

  const handleAction = (action) => {
    if (!selected) return;
    const updated = companies.map((c) => {
      if (c.id !== selected.id) return c;
      if (action === "suspend") return { ...c, status: "Suspended" };
      if (action === "activate") return { ...c, status: "Active" };
      return c;
    });
    if (action === "delete") {
      setCompanies(companies.filter((c) => c.id !== selected.id));
      addAuditLog({ id: `al-${Date.now()}`, action: "Company Deleted", entity: selected.name, user: "Super Admin", date: new Date().toLocaleString(), ip: "192.168.1.1" });
    } else {
      setCompanies(updated);
      addAuditLog({ id: `al-${Date.now()}`, action: action === "suspend" ? "Company Suspended" : "Company Activated", entity: selected.name, user: "Super Admin", date: new Date().toLocaleString(), ip: "192.168.1.1" });
    }
    setMenuAnchor(null);
    setConfirm(null);
    refresh();
  };

  return (
    <SuperAdminLayout>
      <Box sx={{ pb: 3 }}>
        <Box display="flex" flexWrap="wrap" justifyContent="space-between" alignItems="flex-start" gap={2} mb={1}>
          <PageHeader title="Company Management" crumbs={[{ label: "Company Management" }, { label: "Company List" }]} />
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate("/super-admin/companies/add")}
            sx={{ textTransform: "none", bgcolor: "#2563EB", borderRadius: 2, fontWeight: 600, "&:hover": { bgcolor: "#1D4ED8" } }}>
            Add Company
          </Button>
        </Box>

        <Grid container spacing={2} sx={{ my: 2.5 }}>
          <Grid item xs={12} sm={4}><StatCard title="Total Companies" value={String(companies.length)} icon={BusinessIcon} color="#2563EB" bg="#EFF6FF" /></Grid>
          <Grid item xs={12} sm={4}><StatCard title="Active" value={String(companies.filter((c) => c.status === "Active").length)} icon={CheckCircleOutlineIcon} color="#16A34A" bg="#F0FDF4" /></Grid>
          <Grid item xs={12} sm={4}><StatCard title="Suspended" value={String(companies.filter((c) => c.status === "Suspended").length)} icon={PauseCircleOutlineIcon} color="#DC2626" bg="#FEF2F2" /></Grid>
        </Grid>

        <Box sx={{ ...card, mb: 2, display: "flex", flexWrap: "wrap", gap: 1.5, alignItems: "center" }}>
          <TextField size="small" placeholder="Search companies..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            sx={{ flex: 1, minWidth: 220, "& .MuiOutlinedInput-root": { borderRadius: 2, bgcolor: "#F8FAFC" } }}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: "#94A3B8", fontSize: 20 }} /></InputAdornment> }} />
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <Select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} sx={{ borderRadius: 2, bgcolor: "#F8FAFC", fontSize: "0.85rem" }}>
              <MenuItem value="all">All Status</MenuItem>
              <MenuItem value="Active">Active</MenuItem>
              <MenuItem value="Suspended">Suspended</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ ...card, p: 0, overflow: "hidden" }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: "#F8FAFC" }}>
                  {["Company", "Code", "Plan", "Employees", "Status", "Expiry", "Actions"].map((h) => (
                    <TableCell key={h} sx={tableHeadCell}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {paged.map((c) => (
                  <TableRow key={c.id} hover sx={{ "& td": { borderBottom: "1px solid #F1F5F9", py: 1.5 } }}>
                    <TableCell sx={{ fontWeight: 600, color: "#0F172A", fontSize: "0.875rem" }}>{c.name}</TableCell>
                    <TableCell sx={{ color: "#64748B", fontSize: "0.85rem" }}>{c.code}</TableCell>
                    <TableCell sx={{ color: "#334155", fontSize: "0.85rem" }}>{c.planName}</TableCell>
                    <TableCell sx={{ color: "#334155", fontSize: "0.85rem" }}>{c.employees}</TableCell>
                    <TableCell><StatusBadge status={c.status} /></TableCell>
                    <TableCell sx={{ color: "#64748B", fontSize: "0.82rem" }}>{c.subscriptionExpiry}</TableCell>
                    <TableCell>
                      <Box display="flex" gap={0.3}>
                        <IconButton size="small" sx={{ color: "#2563EB" }} onClick={() => navigate(`/super-admin/companies/${c.id}`)}><VisibilityOutlinedIcon sx={{ fontSize: 18 }} /></IconButton>
                        <IconButton size="small" sx={{ color: "#64748B" }} onClick={() => navigate(`/super-admin/companies/${c.id}/edit`)}><EditOutlinedIcon sx={{ fontSize: 18 }} /></IconButton>
                        <IconButton size="small" sx={{ color: "#64748B" }} onClick={(e) => { setSelected(c); setMenuAnchor(e.currentTarget); }}><MoreVertIcon sx={{ fontSize: 18 }} /></IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Box display="flex" justifyContent="space-between" alignItems="center" px={2} py={1.5} sx={{ borderTop: "1px solid #E8EDF5" }}>
            <Box component="span" sx={{ color: "#64748B", fontSize: "0.82rem" }}>Showing {paged.length} of {filtered.length} companies</Box>
            <Pagination count={totalPages} page={page} onChange={(_, v) => setPage(v)} size="small" shape="rounded" sx={{ "& .Mui-selected": { bgcolor: "#2563EB !important", color: "#FFF" } }} />
          </Box>
        </Box>
      </Box>

      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={() => setMenuAnchor(null)}>
        {selected?.status === "Active" && <MenuItem onClick={() => setConfirm({ action: "suspend", title: "Suspend Company", message: `Suspend ${selected.name}?`, label: "Suspend", color: "#DC2626" })}>Suspend Company</MenuItem>}
        {selected?.status === "Suspended" && <MenuItem onClick={() => setConfirm({ action: "activate", title: "Activate Company", message: `Activate ${selected.name}?`, label: "Activate" })}>Activate Company</MenuItem>}
        <MenuItem onClick={() => setConfirm({ action: "delete", title: "Delete Company", message: `Permanently delete ${selected?.name}?`, label: "Delete", color: "#DC2626" })} sx={{ color: "#DC2626" }}>Delete Company</MenuItem>
      </Menu>

      <ConfirmDialog
        open={Boolean(confirm)}
        title={confirm?.title}
        message={confirm?.message}
        confirmLabel={confirm?.label}
        confirmColor={confirm?.color}
        onClose={() => setConfirm(null)}
        onConfirm={() => handleAction(confirm?.action)}
      />
    </SuperAdminLayout>
  );
}
