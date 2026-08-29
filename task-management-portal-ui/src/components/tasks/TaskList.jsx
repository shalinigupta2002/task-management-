import { useState, useMemo, useEffect, useCallback } from "react";
import { Link as RouterLink, useNavigate, useLocation } from "react-router-dom";
import {
  Box, Typography, Grid, Button, TextField, MenuItem, Select, FormControl,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  IconButton, Chip, InputAdornment, Pagination, Breadcrumbs, Link, CircularProgress,
  Tooltip,
} from "@mui/material";
import Layout from "../layouts/Layout";
import ConfirmDialog from "../shared/ConfirmDialog";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import HowToRegIcon from "@mui/icons-material/HowToReg";
import AssignmentIcon from "@mui/icons-material/Assignment";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import TaskStatusBadge from "./TaskStatusBadge";
import { card, PRIORITY_DOT } from "./taskShared";
import taskService from "../../services/taskService";
import { getCompanyId, getUserRole, getDepartmentId, getAuthUser, getErrorMessage } from "../../utils/session";
import { toast } from "../../utils/toast";
import { isOverdueDisplayStatus, OVERDUE_FULL } from "../../constants/overdueStyles";

const STATUS_MAP = {
  OPEN: "Open",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  OVERDUE: "Overdue",
  CANCELLED: "Closed",
  PENDING_APPROVAL: "Pending Approval",
  APPROVED: "Completed",
};

const PRIORITY_MAP = { HIGH: "High", MEDIUM: "Medium", LOW: "Low", CRITICAL: "High" };

function formatDueDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function mapTaskRow(task) {
  const assignee = task.assignments?.[0]?.assignedTo;
  const assigneeName = assignee
    ? [assignee.firstName, assignee.lastName].filter(Boolean).join(" ") || assignee.email
    : task.assignee || "—";

  return {
    id: task.id,
    title: task.title,
    category: task.category?.categoryName || task.category || "—",
    frequency: task.frequency?.frequencyName || task.frequency || "—",
    priority: PRIORITY_MAP[task.priority] || task.priority || "Medium",
    status: STATUS_MAP[task.status] || task.status || "Open",
    rawStatus: task.status || "OPEN",
    dueDate: formatDueDate(task.dueDate),
    assignee: assigneeName,
    departmentId: task.departmentId || task.department?.id || null,
    createdById: task.createdById || task.createdBy?.id || null,
  };
}

function canDeleteTaskRow(userRole, task, userDeptId, authUser) {
  if (userRole === "MAIN_ADMIN" || userRole === "SUPER_ADMIN") return true;
  if (userRole === "SUB_ADMIN") {
    return task.departmentId === userDeptId || task.createdById === authUser?.id;
  }
  return false;
}

function StatCard({ title, value, icon: Icon, color, bg }) {
  return (
    <Box sx={{ ...card, p: 2 }}>
      <Box display="flex" gap={1.5} alignItems="flex-start">
        <Box sx={{ width: 44, height: 44, borderRadius: 2.5, bgcolor: bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Icon sx={{ color, fontSize: 24 }} />
        </Box>
        <Box>
          <Typography sx={{ fontWeight: 800, color: "#0F172A", fontSize: "1.5rem", lineHeight: 1.2 }}>{value}</Typography>
          <Typography sx={{ color: "#64748B", fontSize: "0.78rem", fontWeight: 500 }}>{title}</Typography>
        </Box>
      </Box>
    </Box>
  );
}

export default function TaskList() {
  const navigate = useNavigate();
  const location = useLocation();
  const userRole = getUserRole();
  const authUser = getAuthUser();
  const userDeptId = getDepartmentId();
  const isAssigned = location.pathname.includes("/assigned");
  const dueWindowParam = useMemo(() => new URLSearchParams(location.search).get("dueWindow") || "all", [location.search]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dueWindowFilter, setDueWindowFilter] = useState(dueWindowParam);
  const [page, setPage] = useState(1);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const rowsPerPage = 10;

  useEffect(() => {
    setDueWindowFilter(dueWindowParam);
  }, [dueWindowParam]);

  const loadTasks = useCallback(async () => {
    try {
      setLoading(true);
      const companyId = getCompanyId();
      const params = { limit: 100, ...(companyId ? { companyId } : {}) };
      if (dueWindowFilter && dueWindowFilter !== "all") params.dueWindow = dueWindowFilter;
      const result = await taskService.getAll(params);
      const items = result.items || [];
      setTasks(items.map(mapTaskRow));
    } catch {
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, [dueWindowFilter]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks, location.pathname]);

  const filtered = useMemo(() => tasks.filter((t) => {
    const q = search.toLowerCase();
    return (
      (!q || t.title.toLowerCase().includes(q) || t.category.toLowerCase().includes(q)) &&
      (statusFilter === "all" || t.status === statusFilter)
    );
  }), [tasks, search, statusFilter]);

  const paged = filtered.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  const stats = useMemo(() => ({
    total: tasks.length,
    inProgress: tasks.filter((t) => t.status === "In Progress" || t.rawStatus === "IN_PROGRESS").length,
    pendingApproval: tasks.filter((t) => t.status === "Pending Approval" || t.rawStatus === "PENDING_APPROVAL").length,
    completed: tasks.filter((t) => t.status === "Completed" || t.rawStatus === "COMPLETED" || t.rawStatus === "APPROVED").length,
  }), [tasks]);

  const handleDeleteConfirm = async () => {
    if (!confirmDelete || deleting) return;
    try {
      setDeleting(true);
      await taskService.delete(confirmDelete.id);
      toast.success("Task deleted successfully.");
      setTasks((prev) => prev.filter((t) => t.id !== confirmDelete.id));
      setConfirmDelete(null);
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to delete task"));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Layout>
      <Box sx={{ pb: 3 }}>
        <Box display="flex" flexWrap="wrap" justifyContent="space-between" alignItems="flex-start" gap={2} mb={2}>
          <Box>
            <Typography sx={{ fontWeight: 800, color: "#0F172A", fontSize: "1.5rem" }}>{isAssigned ? "Assigned Tasks" : "Tasks"}</Typography>
            <Breadcrumbs sx={{ mt: 0.5, fontSize: "0.8rem" }}>
              <Link component={RouterLink} to="/dashboard" underline="hover" color="#94A3B8" sx={{ fontSize: "0.8rem" }}>Home</Link>
              <Typography color="#64748B" sx={{ fontSize: "0.8rem" }}>Tasks</Typography>
              <Typography color="#2563EB" sx={{ fontSize: "0.8rem", fontWeight: 600 }}>{isAssigned ? "Assigned Tasks" : "Task List"}</Typography>
            </Breadcrumbs>
          </Box>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate("/dashboard/tasks/add")}
            sx={{ textTransform: "none", bgcolor: "#2563EB", borderRadius: 2, fontWeight: 600, "&:hover": { bgcolor: "#1D4ED8" } }}>Create Task</Button>
        </Box>

        <Grid container spacing={2} sx={{ mb: 2.5 }}>
          <Grid item xs={12} sm={6} md={3}><StatCard title="Total Tasks" value={String(stats.total)} icon={AssignmentIcon} color="#2563EB" bg="#EFF6FF" /></Grid>
          <Grid item xs={12} sm={6} md={3}><StatCard title="In Progress" value={String(stats.inProgress)} icon={PendingActionsIcon} color="#2563EB" bg="#EFF6FF" /></Grid>
          <Grid item xs={12} sm={6} md={3}><StatCard title="Pending Approval" value={String(stats.pendingApproval)} icon={HowToRegIcon} color="#F97316" bg="#FFF7ED" /></Grid>
          <Grid item xs={12} sm={6} md={3}><StatCard title="Completed" value={String(stats.completed)} icon={CheckCircleOutlineIcon} color="#16A34A" bg="#F0FDF4" /></Grid>
        </Grid>

        <Box sx={{ ...card, mb: 2, p: 1.5, display: "flex", flexWrap: "wrap", gap: 1.5, alignItems: "center" }}>
          <TextField size="small" placeholder="Search tasks..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            sx={{ flex: 1, minWidth: 200, "& .MuiOutlinedInput-root": { borderRadius: 2, bgcolor: "#F8FAFC" } }}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: "#94A3B8", fontSize: 20 }} /></InputAdornment> }} />
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <Select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} sx={{ borderRadius: 2, bgcolor: "#F8FAFC", fontSize: "0.85rem" }}>
              <MenuItem value="all">All Status</MenuItem>
              {["Draft", "Pending Approval", "In Progress", "Completed", "Under Review", "Closed"].map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <Select
              value={dueWindowFilter}
              onChange={(e) => {
                const value = e.target.value;
                setDueWindowFilter(value);
                setPage(1);
                const params = new URLSearchParams(location.search);
                if (value === "all") params.delete("dueWindow");
                else params.set("dueWindow", value);
                const qs = params.toString();
                navigate(`${location.pathname}${qs ? `?${qs}` : ""}`, { replace: true });
              }}
              sx={{ borderRadius: 2, bgcolor: "#F8FAFC", fontSize: "0.85rem" }}
            >
              <MenuItem value="all">All Due Dates</MenuItem>
              <MenuItem value="today">Due Today</MenuItem>
              <MenuItem value="nearingDue">Nearing Due</MenuItem>
              <MenuItem value="overdue">Overdue</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ ...card, p: 0, overflow: "hidden" }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: "#F8FAFC" }}>
                  {["Task Name", "Category", "Frequency", "Priority", "Status", "Due Date", "Assignee", "Actions"].map((h) => (
                    <TableCell key={h} sx={{ fontWeight: 700, color: "#64748B", fontSize: "0.75rem", textTransform: "uppercase", py: 1.5, whiteSpace: "nowrap" }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} sx={{ py: 6, textAlign: "center" }}>
                      <CircularProgress size={28} />
                    </TableCell>
                  </TableRow>
                ) : paged.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} sx={{ py: 4, textAlign: "center", color: "#64748B" }}>
                      No tasks found
                    </TableCell>
                  </TableRow>
                ) : paged.map((t) => {
                  const overdue = isOverdueDisplayStatus(t.status) || t.rawStatus === "OVERDUE";
                  const showDelete = canDeleteTaskRow(userRole, t, userDeptId, authUser);
                  return (
                  <TableRow
                    key={t.id}
                    hover
                    sx={{
                      bgcolor: overdue ? OVERDUE_FULL.rowBg : undefined,
                      borderLeft: overdue ? `4px solid ${OVERDUE_FULL.bg}` : undefined,
                      "& td": { borderBottom: "1px solid #F1F5F9", py: 1.5 },
                    }}
                  >
                    <TableCell sx={{ fontWeight: 600, color: "#0F172A", fontSize: "0.875rem", minWidth: 180 }}>{t.title}</TableCell>
                    <TableCell sx={{ color: "#64748B", fontSize: "0.82rem" }}>{t.category}</TableCell>
                    <TableCell><Chip label={t.frequency} size="small" sx={{ height: 24, fontSize: "0.72rem", bgcolor: "#F1F5F9", color: "#334155" }} /></TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={0.8}>
                        <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: PRIORITY_DOT[t.priority] }} />
                        <Typography sx={{ fontSize: "0.82rem", color: "#334155" }}>{t.priority}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell><TaskStatusBadge status={t.status} /></TableCell>
                    <TableCell sx={{ color: "#64748B", fontSize: "0.82rem" }}>{t.dueDate}</TableCell>
                    <TableCell sx={{ color: "#334155", fontSize: "0.85rem" }}>{t.assignee}</TableCell>
                    <TableCell>
                      <Box display="flex" gap={0.3}>
                        {(() => {
                          const isDraftOrOpen = t.rawStatus === "DRAFT" || t.rawStatus === "OPEN" || t.status === "Draft" || t.status === "Open";
                          let canEdit = true;
                          if (userRole === "SUB_ADMIN") {
                            canEdit = t.departmentId === userDeptId || t.createdById === authUser?.id;
                          } else if (userRole === "EMPLOYEE") {
                            canEdit = false;
                          }
                          const showEditIcon = isDraftOrOpen && canEdit;
                          return (
                            <Tooltip title={showEditIcon ? "Edit Task" : "View Task"}>
                              <IconButton
                                size="small"
                                sx={{ color: "#2563EB" }}
                                onClick={() => navigate(`/dashboard/tasks/edit/${t.id}`)}
                                aria-label={showEditIcon ? "Edit Task" : "View Task"}
                              >
                                {showEditIcon ? (
                                  <EditOutlinedIcon sx={{ fontSize: 18 }} />
                                ) : (
                                  <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />
                                )}
                              </IconButton>
                            </Tooltip>
                          );
                        })()}
                        {showDelete && (
                          <Tooltip title="Delete Task">
                            <IconButton
                              size="small"
                              sx={{ color: "#DC2626" }}
                              onClick={() => setConfirmDelete({ id: t.id, title: t.title })}
                              aria-label="Delete Task"
                            >
                              <DeleteOutlineIcon sx={{ fontSize: 18 }} />
                            </IconButton>
                          </Tooltip>
                        )}
                        {(t.rawStatus === "PENDING_APPROVAL" || t.status === "Pending Approval") && (
                          <Tooltip title="Approve Task">
                            <IconButton
                              size="small"
                              sx={{ color: "#16A34A" }}
                              onClick={() => navigate(`/dashboard/tasks/${t.id}/approve`)}
                              aria-label="Approve Task"
                            >
                              <HowToRegIcon sx={{ fontSize: 18 }} />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
          <Box display="flex" justifyContent="space-between" alignItems="center" px={2} py={1.5} sx={{ borderTop: "1px solid #E8EDF5" }}>
            <Typography sx={{ color: "#64748B", fontSize: "0.82rem" }}>Showing {paged.length} of {filtered.length} tasks</Typography>
            <Pagination count={Math.ceil(filtered.length / rowsPerPage) || 1} page={page} onChange={(_, v) => setPage(v)} size="small" shape="rounded"
              sx={{ "& .Mui-selected": { bgcolor: "#2563EB !important", color: "#FFF" } }} />
          </Box>
        </Box>
      </Box>

      <ConfirmDialog
        open={Boolean(confirmDelete)}
        title="Delete Task?"
        message="Are you sure you want to delete this task? This action cannot be undone."
        confirmLabel="Delete Task"
        confirmColor="#DC2626"
        loading={deleting}
        onClose={() => { if (!deleting) setConfirmDelete(null); }}
        onConfirm={handleDeleteConfirm}
      />
    </Layout>
  );
}
