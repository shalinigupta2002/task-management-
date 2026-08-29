import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import {
  Box, Typography, Grid, Button, TextField, MenuItem, Select, FormControl, InputLabel,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Checkbox, Avatar, IconButton, Chip, InputAdornment, Pagination, Breadcrumbs, Link, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions, DialogContentText
} from "@mui/material";
import Layout from "../components/layouts/Layout";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import PeopleIcon from "@mui/icons-material/People";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import PersonOffOutlinedIcon from "@mui/icons-material/PersonOffOutlined";
import employeeService from "../services/employeeService";
import departmentService from "../services/departmentService";
import EmployeeAccountDetailsForm from "../components/employees/EmployeeAccountDetailsForm";
import { toast } from "../utils/toast";
import { getErrorMessage } from "../utils/session";

const card = { borderRadius: 3, bgcolor: "#FFFFFF", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", border: "1px solid #E8EDF5", p: 2 };

const ROLE_STYLE = {
  SUPER_ADMIN: { bg: "#FFF1F2", color: "#E11D48", label: "Super Admin" },
  MAIN_ADMIN: { bg: "#F5F3FF", color: "#7C3AED", label: "Admin" },
  SUB_ADMIN: { bg: "#EFF6FF", color: "#1E40AF", label: "Sub Admin" },
  EMPLOYEE: { bg: "#EFF6FF", color: "#2563EB", label: "Employee" },
};

const STATUS_STYLE = {
  ACTIVE: { bg: "#F0FDF4", color: "#16A34A", label: "Active" },
  INACTIVE: { bg: "#F1F5F9", color: "#64748B", label: "Inactive" },
  LOCKED: { bg: "#FEF2F2", color: "#DC2626", label: "Locked" },
};

function RoleBadge({ role }) {
  const r = String(role).toUpperCase();
  const s = ROLE_STYLE[r] || { bg: "#EFF6FF", color: "#2563EB", label: role };
  return <Chip label={s.label} size="small" sx={{ height: 24, fontSize: "0.72rem", fontWeight: 600, bgcolor: s.bg, color: s.color }} />;
}

function StatusBadge({ status }) {
  const st = String(status).toUpperCase();
  const s = STATUS_STYLE[st] || { bg: "#F0FDF4", color: "#16A34A", label: status };
  return <Chip label={s.label} size="small" sx={{ height: 24, fontSize: "0.72rem", fontWeight: 600, bgcolor: s.bg, color: s.color }} />;
}

function StatCard({ title, value, sub, icon: Icon, color, bg, trend }) {
  return (
    <Box sx={card}>
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
        <Box sx={{ width: 44, height: 44, borderRadius: 2.5, bgcolor: bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon sx={{ color, fontSize: 24 }} />
        </Box>
        {trend && <Chip label={trend} size="small" sx={{ height: 22, fontSize: "0.65rem", fontWeight: 600, bgcolor: "#F0FDF4", color: "#16A34A" }} />}
      </Box>
      <Typography sx={{ fontWeight: 800, color: "#0F172A", fontSize: "1.75rem", lineHeight: 1.2 }}>{value}</Typography>
      <Typography sx={{ color: "#64748B", fontSize: "0.8rem", fontWeight: 500, mt: 0.3 }}>{title}</Typography>
      {sub && <Typography sx={{ color: "#94A3B8", fontSize: "0.72rem", mt: 0.3 }}>{sub}</Typography>}
    </Box>
  );
}

export default function UserManagement() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dept, setDept] = useState("all");
  const [role, setRole] = useState("all");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selected, setSelected] = useState([]);

  const [openForm, setOpenForm] = useState(false);
  const [submittingForm, setSubmittingForm] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const [openView, setOpenView] = useState(false);

  const [openDelete, setOpenDelete] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const params = { limit: 100 };
      if (dept !== "all") params.departmentId = dept;
      if (status !== "all") params.status = status;
      if (role !== "all") params.roleName = role;
      if (search.trim()) params.search = search.trim();

      const [usersRes, deptsRes] = await Promise.all([
        employeeService.getManagedUsers(params),
        departmentService.getAll(),
      ]);
      setUsers(usersRes.items || usersRes || []);
      setDepartments(deptsRes.items || deptsRes || []);
    } catch (err) {
      console.error("Failed to load users data:", err);
      toast.error("Failed to load user list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [role, dept, status]);

  const stats = useMemo(() => {
    const total = users.length;
    const active = users.filter((u) => String(u.status).toUpperCase() === "ACTIVE").length;
    const inactive = users.filter((u) => String(u.status).toUpperCase() === "INACTIVE").length;
    const suspended = users.filter((u) => String(u.status).toUpperCase() === "SUSPENDED" || String(u.status).toUpperCase() === "LOCKED").length;

    return { total, active, inactive, suspended };
  }, [users]);

  const filtered = useMemo(() => users.filter((u) => {
    const q = search.toLowerCase();
    const name = `${u.firstName || ""} ${u.lastName || ""}`.toLowerCase();
    const email = (u.email || "").toLowerCase();
    const employeeNumber = (u.employeeId || "").toLowerCase();
    const departmentName = (u.department?.departmentName || u.department || "").toLowerCase();
    const designation = (u.designation || "").toLowerCase();
    const uStatus = String(u.status || "").toUpperCase();
    const uRole = String(u.role?.name || u.role || "").toUpperCase();

    return (
      (!q
        || name.includes(q)
        || email.includes(q)
        || employeeNumber.includes(q)
        || departmentName.includes(q)
        || designation.includes(q)) &&
      (dept === "all" || u.departmentId === dept || u.department?.id === dept) &&
      (status === "all" || uStatus === status.toUpperCase()) &&
      (role === "all" || uRole === role.toUpperCase())
    );
  }), [users, search, dept, status, role]);

  const paged = filtered.slice((page - 1) * rowsPerPage, page * rowsPerPage);
  const totalPages = Math.ceil(filtered.length / rowsPerPage) || 1;

  const toggleAll = (e) => setSelected(e.target.checked ? paged.map((u) => u.id) : []);
  const toggleOne = (id) => setSelected((s) => s.includes(id) ? s.filter((x) => x !== id) : [...s, id]);

  const handleOpenEdit = (user) => {
    setSelectedUser(user);
    setOpenForm(true);
  };

  const handleOpenView = (user) => {
    setSelectedUser(user);
    setOpenView(true);
  };

  const handleOpenDelete = (user) => {
    setDeleteTarget(user);
    setOpenDelete(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      setSubmittingForm(true);
      await employeeService.delete(deleteTarget.id);
      toast.success("Employee deleted successfully");
      setOpenDelete(false);
      loadData();
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to delete employee"));
    } finally {
      setSubmittingForm(false);
    }
  };

  return (
    <Layout>
      <Box sx={{ pb: 3 }}>
        <Box display="flex" flexWrap="wrap" justifyContent="space-between" alignItems="flex-start" gap={2} mb={1}>
          <Box>
            <Typography sx={{ fontWeight: 800, color: "#0F172A", fontSize: "1.5rem" }}>Users</Typography>
            <Breadcrumbs sx={{ mt: 0.5, fontSize: "0.8rem", "& .MuiBreadcrumbs-separator": { mx: 0.5 } }}>
              <Link component={RouterLink} to="/dashboard" underline="hover" color="#94A3B8" sx={{ fontSize: "0.8rem" }}>Home</Link>
              <Typography color="#64748B" sx={{ fontSize: "0.8rem" }}>Management</Typography>
              <Typography color="#2563EB" sx={{ fontSize: "0.8rem", fontWeight: 600 }}>User Directory</Typography>
            </Breadcrumbs>
          </Box>
          <Box display="flex" gap={1}>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate("/dashboard/employees/add")} sx={{ textTransform: "none", bgcolor: "#2563EB", borderRadius: 2, fontWeight: 600, "&:hover": { bgcolor: "#1D4ED8" } }}>Add Employee</Button>
          </Box>
        </Box>

        <Grid container spacing={2} sx={{ my: 2.5 }}>
          <Grid item xs={12} sm={6} md={3}><StatCard title="Total Users" value={stats.total} icon={PeopleIcon} color="#2563EB" bg="#EFF6FF" /></Grid>
          <Grid item xs={12} sm={6} md={3}><StatCard title="Active Users" value={stats.active} sub={`${Math.round((stats.active / stats.total || 0) * 100)}% of total users`} icon={PersonOutlineIcon} color="#16A34A" bg="#F0FDF4" /></Grid>
          <Grid item xs={12} sm={6} md={3}><StatCard title="Inactive Users" value={stats.inactive} sub={`${Math.round((stats.inactive / stats.total || 0) * 100)}% of total users`} icon={PersonOffOutlinedIcon} color="#F97316" bg="#FFF7ED" /></Grid>
          <Grid item xs={12} sm={6} md={3}><StatCard title="Locked/Suspended Users" value={stats.suspended} sub={`${Math.round((stats.suspended / stats.total || 0) * 100)}% of total users`} icon={LockOutlinedIcon} color="#7C3AED" bg="#F5F3FF" /></Grid>
        </Grid>

        <Box sx={{ ...card, mb: 2, display: "flex", flexWrap: "wrap", gap: 1.5, alignItems: "center" }}>
          <TextField size="small" placeholder="Search by employee number, name, email or department..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            sx={{ flex: 1, minWidth: 220, "& .MuiOutlinedInput-root": { borderRadius: 2, bgcolor: "#F8FAFC" } }}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: "#94A3B8", fontSize: 20 }} /></InputAdornment> }} />
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <Select value={dept} onChange={(e) => { setDept(e.target.value); setPage(1); }} displayEmpty sx={{ borderRadius: 2, bgcolor: "#F8FAFC", fontSize: "0.85rem" }}>
              <MenuItem value="all">All Departments</MenuItem>
              {departments.map((d) => <MenuItem key={d.id} value={d.id}>{d.departmentName}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 130 }}>
            <Select value={role} onChange={(e) => { setRole(e.target.value); setPage(1); }} displayEmpty sx={{ borderRadius: 2, bgcolor: "#F8FAFC", fontSize: "0.85rem" }}>
              <MenuItem value="all">All Roles</MenuItem>
              <MenuItem value="SUB_ADMIN">Sub Admin</MenuItem>
              <MenuItem value="EMPLOYEE">Employee</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 130 }}>
            <Select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} displayEmpty sx={{ borderRadius: 2, bgcolor: "#F8FAFC", fontSize: "0.85rem" }}>
              <MenuItem value="all">All Status</MenuItem>
              {["ACTIVE", "INACTIVE", "SUSPENDED"].map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
            </Select>
          </FormControl>
          <Button onClick={() => { setSearch(""); setDept("all"); setRole("all"); setStatus("all"); setPage(1); }} sx={{ textTransform: "none", color: "#64748B", fontSize: "0.85rem" }}>Clear</Button>
        </Box>

        <Box sx={{ ...card, p: 0, overflow: "hidden" }}>
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
              <CircularProgress size={30} />
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: "#F8FAFC" }}>
                    <TableCell padding="checkbox"><Checkbox size="small" checked={paged.length > 0 && selected.length === paged.length} indeterminate={selected.length > 0 && selected.length < paged.length} onChange={toggleAll} /></TableCell>
                    {["Employee Code", "User", "Email", "Department", "Designation", "Role", "Status", "Actions"].map((h) => (
                      <TableCell key={h} sx={{ fontWeight: 700, color: "#64748B", fontSize: "0.78rem", textTransform: "uppercase", borderBottom: "1px solid #E8EDF5", py: 1.5 }}>{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paged.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} sx={{ py: 4, textAlign: "center", color: "#64748B" }}>No users found</TableCell>
                    </TableRow>
                  ) : paged.map((u) => {
                    const fullName = `${u.firstName || ""} ${u.lastName || ""}`;
                    const initials = (u.firstName?.[0] || "") + (u.lastName?.[0] || "");
                    const uRole = u.role?.name || u.role || "EMPLOYEE";
                    return (
                      <TableRow key={u.id} hover sx={{ "& td": { borderBottom: "1px solid #F1F5F9", py: 1.5 } }}>
                        <TableCell padding="checkbox"><Checkbox size="small" checked={selected.includes(u.id)} onChange={() => toggleOne(u.id)} /></TableCell>
                        <TableCell sx={{ color: "#0F172A", fontSize: "0.85rem", fontWeight: 700, fontFamily: "monospace" }}>{u.employeeId || "—"}</TableCell>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={1.5}>
                            <Avatar sx={{ width: 36, height: 36, bgcolor: "#2563EB", fontSize: "0.8rem", fontWeight: 700 }}>{initials || "E"}</Avatar>
                            <Typography sx={{ fontWeight: 600, color: "#0F172A", fontSize: "0.875rem" }}>{fullName}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ color: "#64748B", fontSize: "0.85rem" }}>{u.email}</TableCell>
                        <TableCell sx={{ color: "#334155", fontSize: "0.85rem", fontWeight: 500 }}>{u.department?.departmentName || u.department || "No Department"}</TableCell>
                        <TableCell sx={{ color: "#64748B", fontSize: "0.85rem" }}>{u.designation || "—"}</TableCell>
                        <TableCell><RoleBadge role={uRole} /></TableCell>
                        <TableCell><StatusBadge status={u.status} /></TableCell>
                        <TableCell>
                          <Box display="flex" gap={0.3}>
                            <IconButton size="small" sx={{ color: "#2563EB" }} onClick={() => handleOpenView(u)}><VisibilityOutlinedIcon sx={{ fontSize: 18 }} /></IconButton>
                            <IconButton size="small" sx={{ color: "#64748B" }} onClick={() => handleOpenEdit(u)}><EditOutlinedIcon sx={{ fontSize: 18 }} /></IconButton>
                            <IconButton size="small" sx={{ color: "#DC2626" }} onClick={() => handleOpenDelete(u)}><DeleteOutlineIcon sx={{ fontSize: 18 }} /></IconButton>
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          <Box display="flex" flexWrap="wrap" justifyContent="space-between" alignItems="center" px={2} py={1.5} sx={{ borderTop: "1px solid #E8EDF5" }}>
            <Typography sx={{ color: "#64748B", fontSize: "0.82rem" }}>
              Showing {filtered.length === 0 ? 0 : (page - 1) * rowsPerPage + 1} to {Math.min(page * rowsPerPage, filtered.length)} of {filtered.length} users
            </Typography>
            <Box display="flex" alignItems="center" gap={2}>
              <FormControl size="small">
                <Select value={rowsPerPage} onChange={(e) => { setRowsPerPage(e.target.value); setPage(1); }} sx={{ fontSize: "0.82rem", borderRadius: 2 }}>
                  {[10, 25, 50, 100].map((n) => <MenuItem key={n} value={n}>{n} / page</MenuItem>)}
                </Select>
              </FormControl>
              <Pagination count={totalPages} page={page} onChange={(_, v) => setPage(v)} size="small" shape="rounded" sx={{ "& .Mui-selected": { bgcolor: "#2563EB !important", color: "#FFF" } }} />
            </Box>
          </Box>
        </Box>
      </Box>

      <Dialog open={openForm} onClose={() => !submittingForm && setOpenForm(false)} fullWidth maxWidth="md" PaperProps={{ sx: { borderRadius: 3, p: 1 } }}>
        <Box sx={{ p: 2 }}>
          <EmployeeAccountDetailsForm
            mode="edit"
            departments={departments}
            initialValues={selectedUser ? {
              employeeId: selectedUser.employeeId || "",
              firstName: selectedUser.firstName || "",
              lastName: selectedUser.lastName || "",
              email: selectedUser.email || "",
              phone: selectedUser.phone || "",
              designation: selectedUser.designation || "",
              departmentId: selectedUser.departmentId || selectedUser.department?.id || "",
              status: selectedUser.status || "ACTIVE",
              password: "",
              confirmPassword: "",
            } : {}}
            submitting={submittingForm}
            onCancel={() => setOpenForm(false)}
            onSubmit={async (payload) => {
              try {
                setSubmittingForm(true);
                const { _meta, confirmPassword, ...apiPayload } = payload;
                void _meta;
                void confirmPassword;
                if (!apiPayload.password) delete apiPayload.password;
                await employeeService.update(selectedUser.id, apiPayload);
                toast.success("Employee updated successfully");
                setOpenForm(false);
                loadData();
              } catch (err) {
                toast.error(getErrorMessage(err, "Failed to update employee"));
              } finally {
                setSubmittingForm(false);
              }
            }}
          />
        </Box>
      </Dialog>

      <Dialog open={openView} onClose={() => setOpenView(false)} fullWidth maxWidth="xs" PaperProps={{ sx: { borderRadius: 3, p: 1 } }}>
        <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>Employee Details</DialogTitle>
        <DialogContent>
          {selectedUser && (
            <Box display="flex" flexDirection="column" gap={2} mt={1}>
              <Box display="flex" alignItems="center" gap={2} mb={1}>
                <Avatar sx={{ width: 50, height: 50, bgcolor: "#2563EB", fontSize: "1.2rem", fontWeight: 700 }}>
                  {(selectedUser.firstName?.[0] || "") + (selectedUser.lastName?.[0] || "")}
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>{selectedUser.firstName} {selectedUser.lastName}</Typography>
                  <Typography variant="body2" color="text.secondary">{selectedUser.email}</Typography>
                </Box>
              </Box>
              <Box sx={{ bgcolor: "#F8FAFC", p: 2, borderRadius: 2, border: "1px solid #E2E8F0" }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  <strong>Employee Code:</strong> {selectedUser.employeeId || "—"}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  <strong>Designation:</strong> {selectedUser.designation || "—"}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  <strong>Department:</strong> {selectedUser.department?.departmentName || selectedUser.department || "—"}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  <strong>Role:</strong> EMPLOYEE
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  <strong>Phone:</strong> {selectedUser.phone || "—"}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Status:</strong> {selectedUser.status}
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpenView(false)} variant="outlined" sx={{ textTransform: "none", borderColor: "#cbd5e1", color: "#475569", borderRadius: 2 }}>Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openDelete} onClose={() => setOpenDelete(false)}>
        <DialogTitle sx={{ fontWeight: 700 }}>Delete Employee</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete employee <strong>{deleteTarget ? `${deleteTarget.firstName} ${deleteTarget.lastName}` : ""}</strong>? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpenDelete(false)} sx={{ textTransform: "none", color: "#64748B" }} disabled={submittingForm}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} variant="contained" disabled={submittingForm} sx={{ textTransform: "none", bgcolor: "#DC2626", "&:hover": { bgcolor: "#B91C1C" }, borderRadius: 2 }}>
            {submittingForm ? <CircularProgress size={20} color="inherit" /> : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
}
