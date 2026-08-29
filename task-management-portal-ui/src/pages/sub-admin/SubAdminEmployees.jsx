import { useState, useEffect, useCallback, useMemo } from "react";
import { useLocation } from "react-router-dom";
import {
  Box, Typography, Button, TextField, MenuItem, Select, FormControl,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Avatar, IconButton, Chip, InputAdornment, Pagination, CircularProgress, Alert, Dialog,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import SubAdminLayout from "../../components/layouts/SubAdminLayout";
import { PageHeader, card, tableHeadCell } from "../../components/main-admin/shared";
import EmployeeAccountDetailsForm from "../../components/employees/EmployeeAccountDetailsForm";
import employeeService from "../../services/employeeService";
import departmentService from "../../services/departmentService";
import { toast } from "../../utils/toast";
import { getErrorMessage, getAuthUser } from "../../utils/session";

const STATUS_STYLE = {
  ACTIVE: { bg: "#F0FDF4", color: "#16A34A", label: "Active" },
  INACTIVE: { bg: "#F1F5F9", color: "#64748B", label: "Inactive" },
  LOCKED: { bg: "#FEF2F2", color: "#DC2626", label: "Locked" },
  SUSPENDED: { bg: "#FEF2F2", color: "#DC2626", label: "Suspended" },
};

function StatusBadge({ status }) {
  const st = String(status).toUpperCase();
  const s = STATUS_STYLE[st] || { bg: "#F0FDF4", color: "#16A34A", label: status };
  return <Chip label={s.label} size="small" sx={{ height: 24, fontSize: "0.72rem", fontWeight: 600, bgcolor: s.bg, color: s.color }} />;
}

export default function SubAdminEmployees() {
  const location = useLocation();
  const currentUser = useMemo(() => getAuthUser() || {}, []);
  const departmentId = currentUser.departmentId || "";

  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  const [openForm, setOpenForm] = useState(false);
  const [formMode, setFormMode] = useState("create");
  const [submitting, setSubmitting] = useState(false);
  const [selected, setSelected] = useState(null);
  const [openView, setOpenView] = useState(false);
  const [previewCode, setPreviewCode] = useState("");

  const openCreateForm = async () => {
    setFormMode("create");
    setSelected(null);
    try {
      const preview = await employeeService.previewEmployeeCode("EMPLOYEE");
      setPreviewCode(preview?.employeeId || "");
    } catch {
      setPreviewCode("");
    }
    setOpenForm(true);
  };

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const [usersRes, deptsRes] = await Promise.all([
        employeeService.getAll({ limit: 100 }),
        departmentService.getAll({ limit: 50 }),
      ]);
      setEmployees(usersRes.items || []);
      setDepartments(deptsRes.items || deptsRes || []);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load employees"));
      toast.error(getErrorMessage(err, "Failed to load employees"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (location.state?.openAdd) {
      openCreateForm();
      window.history.replaceState({}, document.title);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return employees.filter((e) => {
      const name = `${e.firstName || ""} ${e.lastName || ""}`.toLowerCase();
      const email = (e.email || "").toLowerCase();
      const empNo = (e.employeeId || "").toLowerCase();
      const st = String(e.status || "").toUpperCase();
      return (
        (!q || name.includes(q) || email.includes(q) || empNo.includes(q))
        && (statusFilter === "all" || st === statusFilter.toUpperCase())
      );
    });
  }, [employees, search, statusFilter]);

  const paged = filtered.slice((page - 1) * rowsPerPage, page * rowsPerPage);
  const totalPages = Math.ceil(filtered.length / rowsPerPage) || 1;

  const handleCreate = async (payload) => {
    try {
      setSubmitting(true);
      const { _meta, confirmPassword, employeeId: _code, ...apiPayload } = payload;
      void _meta;
      void confirmPassword;
      void _code;
      delete apiPayload.departmentId; // backend forces Sub Admin department
      const created = await employeeService.create(apiPayload);
      toast.success(`Employee created (${created?.employeeId || "code assigned"})`);
      setOpenForm(false);
      loadData();
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to create employee"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (payload) => {
    if (!selected) return;
    try {
      setSubmitting(true);
      const { _meta, confirmPassword, ...apiPayload } = payload;
      void _meta;
      void confirmPassword;
      if (!apiPayload.password) delete apiPayload.password;
      delete apiPayload.departmentId;
      await employeeService.update(selected.id, apiPayload);
      toast.success("Employee updated successfully");
      setOpenForm(false);
      loadData();
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to update employee"));
    } finally {
      setSubmitting(false);
    }
  };

  const deptName = departments.find((d) => d.id === departmentId)?.departmentName || "your department";

  return (
    <SubAdminLayout>
      <Box sx={{ pb: 3 }}>
        <PageHeader title="Employees" crumbs={[{ label: "Employees" }, { label: "Employee List" }]} homePath="/sub-admin/dashboard" />

        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}

        <Box sx={{ ...card, mb: 2, display: "flex", flexWrap: "wrap", gap: 1.5, alignItems: "center", justifyContent: "space-between" }}>
          <Typography sx={{ color: "#64748B", fontSize: "0.9rem" }}>
            Managing employees in <strong>{deptName}</strong>
          </Typography>
          <Button
            startIcon={<AddIcon />}
            variant="contained"
            onClick={() => { openCreateForm(); }}
            sx={{ textTransform: "none", bgcolor: "#2563EB", borderRadius: 2 }}
          >
            Add Employee
          </Button>
        </Box>

        <Box sx={{ ...card, mb: 2, display: "flex", flexWrap: "wrap", gap: 1.5, alignItems: "center" }}>
          <TextField
            size="small"
            placeholder="Search employees..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            sx={{ flex: 1, minWidth: 200, "& .MuiOutlinedInput-root": { borderRadius: 2, bgcolor: "#F8FAFC" } }}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: "#94A3B8", fontSize: 20 }} /></InputAdornment> }}
          />
          <FormControl size="small" sx={{ minWidth: 130 }}>
            <Select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} displayEmpty sx={{ borderRadius: 2, bgcolor: "#F8FAFC", fontSize: "0.85rem" }}>
              <MenuItem value="all">All Status</MenuItem>
              {["ACTIVE", "INACTIVE", "SUSPENDED"].map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ ...card, p: 0, overflow: "hidden" }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: "#F8FAFC" }}>
                  {["Employee Code", "Employee", "Email", "Designation", "Status", "Actions"].map((h) => (
                    <TableCell key={h} sx={tableHeadCell}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={6} align="center" sx={{ py: 6 }}><CircularProgress size={28} /></TableCell></TableRow>
                ) : paged.length === 0 ? (
                  <TableRow><TableCell colSpan={6} align="center" sx={{ py: 4, color: "#64748B" }}>No employees found</TableCell></TableRow>
                ) : paged.map((e) => {
                  const name = `${e.firstName || ""} ${e.lastName || ""}`.trim();
                  const initials = `${e.firstName?.[0] || ""}${e.lastName?.[0] || ""}`;
                  return (
                    <TableRow key={e.id} hover sx={{ "& td": { borderBottom: "1px solid #F1F5F9", py: 1.5 } }}>
                      <TableCell sx={{ fontFamily: "monospace", fontWeight: 700 }}>{e.employeeId || "—"}</TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1.5}>
                          <Avatar sx={{ width: 34, height: 34, bgcolor: "#2563EB", fontSize: "0.75rem" }}>{initials || "E"}</Avatar>
                          <Typography sx={{ fontWeight: 600, fontSize: "0.875rem" }}>{name}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ color: "#64748B", fontSize: "0.85rem" }}>{e.email}</TableCell>
                      <TableCell sx={{ color: "#64748B", fontSize: "0.85rem" }}>{e.designation || "—"}</TableCell>
                      <TableCell><StatusBadge status={e.status} /></TableCell>
                      <TableCell>
                        <IconButton size="small" sx={{ color: "#2563EB" }} onClick={() => { setSelected(e); setOpenView(true); }}><VisibilityOutlinedIcon sx={{ fontSize: 18 }} /></IconButton>
                        <IconButton size="small" sx={{ color: "#64748B" }} onClick={() => { setSelected(e); setFormMode("edit"); setOpenForm(true); }}><EditOutlinedIcon sx={{ fontSize: 18 }} /></IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
          <Box display="flex" justifyContent="space-between" alignItems="center" px={2} py={1.5} sx={{ borderTop: "1px solid #E8EDF5" }}>
            <Typography sx={{ color: "#64748B", fontSize: "0.82rem" }}>
              Showing {filtered.length === 0 ? 0 : (page - 1) * rowsPerPage + 1}–{Math.min(page * rowsPerPage, filtered.length)} of {filtered.length}
            </Typography>
            <Pagination count={totalPages} page={page} onChange={(_, v) => setPage(v)} size="small" shape="rounded" />
          </Box>
        </Box>
      </Box>

      <Dialog open={openForm} onClose={() => !submitting && setOpenForm(false)} fullWidth maxWidth="md" PaperProps={{ sx: { borderRadius: 3, p: 1 } }}>
        <Box sx={{ p: 2 }}>
          <EmployeeAccountDetailsForm
            mode={formMode}
            departments={departments.filter((d) => d.id === departmentId)}
            lockDepartment
            lockedDepartmentId={departmentId}
            initialValues={formMode === "edit" && selected ? {
              employeeId: selected.employeeId || "",
              firstName: selected.firstName || "",
              lastName: selected.lastName || "",
              email: selected.email || "",
              phone: selected.phone || "",
              designation: selected.designation || "",
              departmentId,
              status: selected.status || "ACTIVE",
              password: "",
              confirmPassword: "",
            } : { departmentId }}
            submitting={submitting}
            previewEmployeeCode={formMode === "create" ? previewCode : ""}
            onCancel={() => setOpenForm(false)}
            onSubmit={formMode === "create" ? handleCreate : handleUpdate}
          />
        </Box>
      </Dialog>

      <Dialog open={openView} onClose={() => setOpenView(false)} fullWidth maxWidth="xs" PaperProps={{ sx: { borderRadius: 3, p: 2 } }}>
        {selected && (
          <Box>
            <Typography sx={{ fontWeight: 700, mb: 2 }}>Employee Details</Typography>
            <Typography sx={{ fontSize: "0.85rem", mb: 1 }}><strong>Name:</strong> {selected.firstName} {selected.lastName}</Typography>
            <Typography sx={{ fontSize: "0.85rem", mb: 1 }}><strong>Employee Number:</strong> {selected.employeeId || "—"}</Typography>
            <Typography sx={{ fontSize: "0.85rem", mb: 1 }}><strong>Email:</strong> {selected.email}</Typography>
            <Typography sx={{ fontSize: "0.85rem", mb: 1 }}><strong>Role:</strong> EMPLOYEE</Typography>
            <Typography sx={{ fontSize: "0.85rem", mb: 2 }}><strong>Status:</strong> {selected.status}</Typography>
            <Button onClick={() => setOpenView(false)} sx={{ textTransform: "none" }}>Close</Button>
          </Box>
        )}
      </Dialog>
    </SubAdminLayout>
  );
}
