import { useState, useMemo, useEffect, useCallback } from "react";
import { Link as RouterLink, useNavigate, useLocation } from "react-router-dom";
import {
  Box, Typography, Grid, Button, TextField, MenuItem, Select, FormControl,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Checkbox, IconButton, Chip, InputAdornment, Pagination, Breadcrumbs, Link,
  Menu, CircularProgress,
} from "@mui/material";
import Layout from "../layouts/Layout";
import SubAdminLayout from "../layouts/SubAdminLayout";
import ConfirmDialog from "../shared/ConfirmDialog";
import SearchIcon from "@mui/icons-material/Search";
import FileUploadOutlinedIcon from "@mui/icons-material/FileUploadOutlined";
import AddIcon from "@mui/icons-material/Add";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import FilterListIcon from "@mui/icons-material/FilterList";
import ApartmentIcon from "@mui/icons-material/Apartment";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import PauseCircleOutlineIcon from "@mui/icons-material/PauseCircleOutline";
import PeopleIcon from "@mui/icons-material/People";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import departmentService from "../../services/departmentService";
import { toast } from "../../utils/toast";
import { getCompanyId, getErrorMessage, toApiStatus } from "../../utils/session";
import { mapDepartmentRow } from "../../utils/departmentDisplay";

const card = { borderRadius: 3, bgcolor: "#FFFFFF", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", border: "1px solid #E8EDF5", p: 2 };

function StatusBadge({ status }) {
  const active = status === "Active";
  return (
    <Chip label={status} size="small" sx={{
      height: 24, fontSize: "0.72rem", fontWeight: 600,
      bgcolor: active ? "#F0FDF4" : "#FEF2F2", color: active ? "#16A34A" : "#DC2626",
    }} />
  );
}

function StatCard({ title, value, sub, subColor, icon: Icon, color, bg }) {
  return (
    <Box sx={card}>
      <Box display="flex" gap={1.5} alignItems="flex-start">
        <Box sx={{ width: 44, height: 44, borderRadius: 2.5, bgcolor: bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Icon sx={{ color, fontSize: 24 }} />
        </Box>
        <Box>
          <Typography sx={{ fontWeight: 800, color: "#0F172A", fontSize: "1.5rem", lineHeight: 1.2 }}>{value}</Typography>
          <Typography sx={{ color: "#64748B", fontSize: "0.78rem", fontWeight: 500 }}>{title}</Typography>
          {sub && <Typography sx={{ color: subColor || "#94A3B8", fontSize: "0.72rem", mt: 0.3, fontWeight: subColor ? 600 : 400 }}>{sub}</Typography>}
        </Box>
      </Box>
    </Box>
  );
}

function StatusLegend() {
  const items = [
    { color: "#16A34A", label: "Active", desc: "Department is active and operational" },
    { color: "#F97316", label: "Inactive", desc: "Department is temporarily inactive" },
    { color: "#EF4444", label: "Deleted", desc: "Department is deleted from system" },
  ];
  return (
    <Box sx={{ ...card, mb: 2 }}>
      <Typography sx={{ fontWeight: 700, color: "#0F172A", fontSize: "0.9rem", mb: 1.5 }}>Department Status</Typography>
      {items.map((item) => (
        <Box key={item.label} display="flex" gap={1.2} mb={1.5}>
          <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: item.color, mt: 0.6, flexShrink: 0 }} />
          <Box>
            <Typography sx={{ fontWeight: 600, color: "#334155", fontSize: "0.82rem" }}>{item.label}</Typography>
            <Typography sx={{ color: "#94A3B8", fontSize: "0.75rem", lineHeight: 1.4 }}>{item.desc}</Typography>
          </Box>
        </Box>
      ))}
    </Box>
  );
}

export default function DepartmentTable() {
  const navigate = useNavigate();
  const location = useLocation();
  const isSubAdmin = location.pathname.startsWith("/sub-admin");
  const PageLayout = isSubAdmin ? SubAdminLayout : Layout;

  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selected, setSelected] = useState([]);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [menuDepartment, setMenuDepartment] = useState(null);
  const [confirm, setConfirm] = useState(null);

  const loadDepartments = useCallback(async () => {
    try {
      setLoading(true);
      const companyId = getCompanyId();
      const params = { limit: 100, ...(companyId ? { companyId } : {}) };
      const result = await departmentService.getAll(params);
      setDepartments((result.items || []).map(mapDepartmentRow));
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to load departments"));
      setDepartments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDepartments();
  }, [loadDepartments]);

  const filtered = useMemo(() => departments.filter((d) => {
    const q = search.toLowerCase();
    return (
      (!q || d.name.toLowerCase().includes(q) || d.code.toLowerCase().includes(q) || d.description.toLowerCase().includes(q)) &&
      (statusFilter === "all" || d.status === statusFilter)
    );
  }), [departments, search, statusFilter]);

  const paged = filtered.slice((page - 1) * rowsPerPage, page * rowsPerPage);
  const totalPages = Math.ceil(filtered.length / rowsPerPage) || 1;

  const activeCount = departments.filter((d) => d.status === "Active").length;
  const inactiveCount = departments.length - activeCount;
  const totalUsers = departments.reduce((sum, d) => sum + (d.users || 0), 0);
  const activePct = departments.length ? ((activeCount / departments.length) * 100).toFixed(1) : "0";
  const inactivePct = departments.length ? ((inactiveCount / departments.length) * 100).toFixed(1) : "0";

  const handleView = (deptId) =>
    navigate(isSubAdmin ? `/sub-admin/departments/view/${deptId}` : `/dashboard/departments/view/${deptId}`);
  const handleEdit = (deptId) => navigate(`/dashboard/departments/edit/${deptId}`);

  const openMenu = (event, dept) => {
    event.stopPropagation();
    setMenuAnchor(event.currentTarget);
    setMenuDepartment(dept);
  };

  const closeMenu = () => {
    setMenuAnchor(null);
    setMenuDepartment(null);
  };

  const handleToggleStatus = async (dept) => {
    if (!dept) return;
    const nextStatus = dept.status === "Active" ? "Inactive" : "Active";
    try {
      await departmentService.update(dept.id, { status: toApiStatus(nextStatus) });
      toast.success(`Department ${nextStatus === "Active" ? "activated" : "deactivated"} successfully`);
      loadDepartments();
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to update department status"));
    }
  };

  const handleDelete = async () => {
    if (!confirm?.id) return;
    try {
      await departmentService.delete(confirm.id);
      toast.success("Department deleted successfully");
      setConfirm(null);
      loadDepartments();
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to delete department"));
    }
  };

  return (
    <PageLayout>
      <Box sx={{ pb: 3 }}>
        <Grid container spacing={2.5}>
          <Grid item xs={12} lg={9}>
            <Box display="flex" flexWrap="wrap" justifyContent="space-between" alignItems="flex-start" gap={2} mb={2}>
              <Box>
                <Typography sx={{ fontWeight: 800, color: "#0F172A", fontSize: "1.5rem" }}>Departments</Typography>
                <Breadcrumbs sx={{ mt: 0.5, fontSize: "0.8rem" }}>
                  <Link component={RouterLink} to={isSubAdmin ? "/sub-admin/dashboard" : "/dashboard"} underline="hover" color="#94A3B8" sx={{ fontSize: "0.8rem" }}>Home</Link>
                  <Typography color="#64748B" sx={{ fontSize: "0.8rem" }}>Departments</Typography>
                  <Typography color="#2563EB" sx={{ fontSize: "0.8rem", fontWeight: 600 }}>Department List</Typography>
                </Breadcrumbs>
              </Box>
              <Box display="flex" gap={1}>
                <Button variant="outlined" startIcon={<FileUploadOutlinedIcon />} sx={{ textTransform: "none", borderColor: "#2563EB", color: "#2563EB", borderRadius: 2, fontWeight: 600 }}>Export</Button>
                {!isSubAdmin && (
                  <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate("/dashboard/departments/add")}
                    sx={{ textTransform: "none", bgcolor: "#2563EB", borderRadius: 2, fontWeight: 600, "&:hover": { bgcolor: "#1D4ED8" } }}>Add Department</Button>
                )}
              </Box>
            </Box>

            <Grid container spacing={2} sx={{ mb: 2.5 }}>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard title="Total Departments" value={String(departments.length)} sub="All departments in system" icon={ApartmentIcon} color="#7C3AED" bg="#F5F3FF" />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard title="Active Departments" value={String(activeCount)} sub={`${activePct}% of total departments`} subColor="#16A34A" icon={CheckCircleOutlineIcon} color="#16A34A" bg="#F0FDF4" />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard title="Inactive Departments" value={String(inactiveCount)} sub={`${inactivePct}% of total departments`} subColor="#F97316" icon={PauseCircleOutlineIcon} color="#F97316" bg="#FFF7ED" />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard title="Total Users" value={String(totalUsers)} sub="Across all departments" icon={PeopleIcon} color="#2563EB" bg="#EFF6FF" />
              </Grid>
            </Grid>

            <Box sx={{ ...card, mb: 2, display: "flex", flexWrap: "wrap", gap: 1.5, alignItems: "center" }}>
              <TextField size="small" placeholder="Search department by name, code or description..." value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                sx={{ flex: 1, minWidth: 220, "& .MuiOutlinedInput-root": { borderRadius: 2, bgcolor: "#F8FAFC" } }}
                InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: "#94A3B8", fontSize: 20 }} /></InputAdornment> }} />
              <FormControl size="small" sx={{ minWidth: 130 }}>
                <Select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} sx={{ borderRadius: 2, bgcolor: "#F8FAFC", fontSize: "0.85rem" }}>
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="Active">Active</MenuItem>
                  <MenuItem value="Inactive">Inactive</MenuItem>
                </Select>
              </FormControl>
              <Button variant="outlined" startIcon={<FilterListIcon />} sx={{ textTransform: "none", borderColor: "#E2E8F0", color: "#64748B", borderRadius: 2, fontSize: "0.85rem" }}>Filters</Button>
              <Button onClick={() => { setSearch(""); setStatusFilter("all"); setPage(1); }} sx={{ textTransform: "none", color: "#64748B", fontSize: "0.85rem" }}>Clear</Button>
            </Box>

            <Box sx={{ ...card, p: 0, overflow: "hidden" }}>
              {loading ? (
                <Box display="flex" justifyContent="center" py={6}>
                  <CircularProgress size={32} />
                </Box>
              ) : (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: "#F8FAFC" }}>
                        <TableCell padding="checkbox">
                          <Checkbox size="small" checked={paged.length > 0 && selected.length === paged.length}
                            indeterminate={selected.length > 0 && selected.length < paged.length}
                            onChange={(e) => setSelected(e.target.checked ? paged.map((d) => d.id) : [])} />
                        </TableCell>
                        {["Department Name", "Department Code", "Description", "Head of Department", "Total Users", "Status", "Actions"].map((h) => (
                          <TableCell key={h} sx={{ fontWeight: 700, color: "#64748B", fontSize: "0.75rem", textTransform: "uppercase", py: 1.5, whiteSpace: "nowrap" }}>{h}</TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paged.map((d) => (
                        <TableRow key={d.id} hover sx={{ "& td": { borderBottom: "1px solid #F1F5F9", py: 1.5 } }}>
                          <TableCell padding="checkbox">
                            <Checkbox size="small" checked={selected.includes(d.id)}
                              onChange={() => setSelected((s) => s.includes(d.id) ? s.filter((x) => x !== d.id) : [...s, d.id])} />
                          </TableCell>
                          <TableCell sx={{ fontWeight: 600, color: "#0F172A", fontSize: "0.875rem", minWidth: 160 }}>{d.name}</TableCell>
                          <TableCell><Chip label={d.code} size="small" sx={{ height: 24, fontWeight: 700, bgcolor: "#F1F5F9", color: "#334155", fontSize: "0.72rem" }} /></TableCell>
                          <TableCell sx={{ color: "#64748B", fontSize: "0.82rem", maxWidth: 200 }}>{d.description || "—"}</TableCell>
                          <TableCell sx={{ color: "#334155", fontSize: "0.85rem", fontWeight: 500 }}>{d.head}</TableCell>
                          <TableCell sx={{ color: "#334155", fontSize: "0.85rem", fontWeight: 600 }}>{d.users}</TableCell>
                          <TableCell><StatusBadge status={d.status} /></TableCell>
                          <TableCell>
                            <Box display="flex" gap={0.3}>
                              <IconButton size="small" sx={{ color: "#2563EB" }} aria-label={`View ${d.name}`} onClick={() => handleView(d.id)}>
                                <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />
                              </IconButton>
                              {!isSubAdmin && (
                                <>
                                  <IconButton size="small" sx={{ color: "#64748B" }} aria-label={`Edit ${d.name}`} onClick={() => handleEdit(d.id)}>
                                    <EditOutlinedIcon sx={{ fontSize: 18 }} />
                                  </IconButton>
                                  <IconButton size="small" sx={{ color: "#64748B" }} aria-label={`Actions for ${d.name}`} onClick={(e) => openMenu(e, d)}>
                                    <MoreVertIcon sx={{ fontSize: 18 }} />
                                  </IconButton>
                                </>
                              )}
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}

              <Box display="flex" flexWrap="wrap" justifyContent="space-between" alignItems="center" px={2} py={1.5} sx={{ borderTop: "1px solid #E8EDF5" }}>
                <Typography sx={{ color: "#64748B", fontSize: "0.82rem" }}>
                  Showing {filtered.length === 0 ? 0 : (page - 1) * rowsPerPage + 1} to {Math.min(page * rowsPerPage, filtered.length)} of {filtered.length} departments
                </Typography>
                <Box display="flex" alignItems="center" gap={2}>
                  <FormControl size="small">
                    <Select value={rowsPerPage} onChange={(e) => { setRowsPerPage(e.target.value); setPage(1); }} sx={{ fontSize: "0.82rem", borderRadius: 2 }}>
                      {[10, 25, 50].map((n) => <MenuItem key={n} value={n}>{n} / page</MenuItem>)}
                    </Select>
                  </FormControl>
                  <Pagination count={totalPages} page={page} onChange={(_, v) => setPage(v)} size="small" shape="rounded"
                    sx={{ "& .Mui-selected": { bgcolor: "#2563EB !important", color: "#FFF" } }} />
                </Box>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} lg={3}>
            <Box sx={{ ...card, mb: 2 }}>
              <Typography sx={{ fontWeight: 700, color: "#0F172A", fontSize: "0.9rem", mb: 1 }}>About Departments</Typography>
              <Typography sx={{ color: "#64748B", fontSize: "0.82rem", lineHeight: 1.7 }}>
                Departments help organize users and tasks within your organization. Each department can have a head, assigned users, and linked tasks.
              </Typography>
            </Box>
            <StatusLegend />
          </Grid>
        </Grid>
      </Box>

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={closeMenu}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <MenuItem onClick={() => { if (menuDepartment) handleView(menuDepartment.id); closeMenu(); }}>
          <VisibilityOutlinedIcon sx={{ mr: 1, fontSize: 18 }} /> View
        </MenuItem>
        <MenuItem onClick={() => { if (menuDepartment) handleEdit(menuDepartment.id); closeMenu(); }}>
          <EditOutlinedIcon sx={{ mr: 1, fontSize: 18 }} /> Edit
        </MenuItem>
        <MenuItem onClick={() => { const dept = menuDepartment; closeMenu(); if (dept) handleToggleStatus(dept); }}>
          <PauseCircleOutlineIcon sx={{ mr: 1, fontSize: 18 }} />
          {menuDepartment?.status === "Active" ? "Deactivate" : "Activate"}
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (menuDepartment) setConfirm({ id: menuDepartment.id, name: menuDepartment.name });
            closeMenu();
          }}
          sx={{ color: "#DC2626" }}
        >
          <DeleteOutlineIcon sx={{ mr: 1, fontSize: 18 }} /> Delete
        </MenuItem>
      </Menu>

      <ConfirmDialog
        open={Boolean(confirm)}
        title="Delete Department"
        message={`Are you sure you want to delete ${confirm?.name}? This action cannot be undone.`}
        confirmLabel="Delete"
        confirmColor="#DC2626"
        onClose={() => setConfirm(null)}
        onConfirm={handleDelete}
      />
    </PageLayout>
  );
}
