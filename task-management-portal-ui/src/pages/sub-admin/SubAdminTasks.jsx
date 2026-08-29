import { useState, useCallback, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, IconButton, Tooltip, CircularProgress, TextField, InputAdornment,
  FormControl, Select, MenuItem as SelectItem, Pagination, Grid, Alert,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import SearchIcon from "@mui/icons-material/Search";
import AssignmentIcon from "@mui/icons-material/Assignment";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import SubAdminLayout from "../../components/layouts/SubAdminLayout";
import ConfirmDialog from "../../components/shared/ConfirmDialog";
import { PageHeader, card, tableHeadCell } from "../../components/main-admin/shared";
import TaskStatusBadge from "../../components/tasks/TaskStatusBadge";
import { PRIORITY_DOT } from "../../components/tasks/taskShared";
import taskService from "../../services/taskService";
import { getDepartmentId, getErrorMessage } from "../../utils/session";
import { toast } from "../../utils/toast";
import { isOverdueDisplayStatus, OVERDUE_FULL } from "../../constants/overdueStyles";

const STATUS_MAP = {
  OPEN: "Open",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  OVERDUE: "Overdue",
  CANCELLED: "Closed",
  DRAFT: "Draft",
};

/** Dashboard pendingTasks = OPEN + IN_PROGRESS (not a due-date window). */
const PENDING_DISPLAY_STATUSES = new Set(["Open", "In Progress"]);

function parseStatusQueryParam(search) {
  const raw = new URLSearchParams(search).get("status");
  if (!raw) return "all";
  const key = String(raw).trim().toLowerCase();
  if (key === "pending") return "Pending";
  if (key === "open") return "Open";
  if (key === "in_progress" || key === "in-progress" || key === "in progress") return "In Progress";
  if (key === "completed") return "Completed";
  if (key === "overdue") return "Overdue";
  if (key === "closed" || key === "cancelled") return "Closed";
  if (["Open", "In Progress", "Completed", "Overdue", "Closed", "Pending", "all"].includes(raw)) {
    return raw;
  }
  return "all";
}

function statusFilterToQueryValue(filter) {
  if (!filter || filter === "all") return null;
  if (filter === "Pending") return "pending";
  if (filter === "In Progress") return "in_progress";
  if (filter === "Open") return "open";
  if (filter === "Completed") return "completed";
  if (filter === "Overdue") return "overdue";
  if (filter === "Closed") return "closed";
  return String(filter).toLowerCase();
}

function matchesStatusFilter(taskStatus, filter) {
  if (filter === "all") return true;
  if (filter === "Pending") return PENDING_DISPLAY_STATUSES.has(taskStatus);
  return taskStatus === filter;
}

const PRIORITY_MAP = { HIGH: "High", MEDIUM: "Medium", LOW: "Low", CRITICAL: "High" };

function formatDueDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function mapTaskRow(task) {
  const assignees = (task.assignments || [])
    .filter((a) => a.status !== "CANCELLED")
    .map((a) => {
      const u = a.assignedTo;
      if (!u) return null;
      return [u.firstName, u.lastName].filter(Boolean).join(" ") || u.email;
    })
    .filter(Boolean);

  const approver = task.approver;
  const approverName = approver
    ? [approver.firstName, approver.lastName].filter(Boolean).join(" ") || approver.email
    : "—";

  return {
    id: task.id,
    title: task.title,
    category: task.category?.categoryName || "—",
    frequency: task.frequency?.frequencyName || task.recurrenceType || "—",
    department: task.department?.departmentName || "—",
    priority: PRIORITY_MAP[task.priority] || task.priority || "Medium",
    status: STATUS_MAP[task.status] || task.status || "Open",
    rawStatus: task.status,
    dueDate: formatDueDate(task.dueDate),
    startDate: formatDueDate(task.startDate),
    assignee: assignees.join(", ") || "—",
    assigneeCount: assignees.length,
    approver: approverName,
    recurrence: task.recurrenceType || "ONE_TIME",
    hasAssignments: assignees.length > 0,
  };
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

export default function SubAdminTasks() {
  const navigate = useNavigate();
  const location = useLocation();
  const isAssignedView = location.pathname.includes("/assigned");
  const departmentId = getDepartmentId();
  const dueWindowParam = useMemo(() => new URLSearchParams(location.search).get("dueWindow") || "all", [location.search]);
  const statusParam = useMemo(() => parseStatusQueryParam(location.search), [location.search]);

  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState(statusParam);
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [dueWindowFilter, setDueWindowFilter] = useState(dueWindowParam);
  const [page, setPage] = useState(1);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const rowsPerPage = 10;

  useEffect(() => {
    setDueWindowFilter(dueWindowParam);
  }, [dueWindowParam]);

  useEffect(() => {
    setStatusFilter(statusParam);
    setPage(1);
  }, [statusParam]);

  const loadTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const params = { limit: 100 };
      if (dueWindowFilter && dueWindowFilter !== "all") params.dueWindow = dueWindowFilter;
      const [taskResult, statsResult] = await Promise.all([
        taskService.getAll(params),
        taskService.getDashboardStats().catch(() => null),
      ]);
      setTasks((taskResult.items || []).map(mapTaskRow));
      setStats(statsResult);
    } catch (err) {
      setTasks([]);
      setError(getErrorMessage(err, "Failed to load tasks"));
      toast.error(getErrorMessage(err, "Failed to load tasks"));
    } finally {
      setLoading(false);
    }
  }, [dueWindowFilter]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks, location.pathname]);

  const scopedTasks = useMemo(() => {
    if (!isAssignedView) return tasks;
    return tasks.filter((t) => t.hasAssignments);
  }, [tasks, isAssignedView]);

  const filtered = useMemo(() => scopedTasks.filter((t) => {
    const q = search.toLowerCase();
    return (
      (!q || t.title.toLowerCase().includes(q) || t.category.toLowerCase().includes(q) || t.assignee.toLowerCase().includes(q))
      && matchesStatusFilter(t.status, statusFilter)
      && (priorityFilter === "all" || t.priority === priorityFilter)
    );
  }), [scopedTasks, search, statusFilter, priorityFilter]);

  const paged = filtered.slice((page - 1) * rowsPerPage, page * rowsPerPage);
  const totalPages = Math.ceil(filtered.length / rowsPerPage) || 1;

  const handleEdit = (task) => navigate(`/sub-admin/tasks/edit/${task.id}`);
  const handleAssign = (task) => navigate(`/sub-admin/tasks/edit/${task.id}`, { state: { tab: 1 } });

  const handleDeleteConfirm = async () => {
    if (!confirmDelete || deleting) return;
    try {
      setDeleting(true);
      await taskService.delete(confirmDelete.id);
      toast.success("Task deleted successfully.");
      setConfirmDelete(null);
      setTasks((prev) => prev.filter((t) => t.id !== confirmDelete.id));
      setStats((prev) => (prev ? {
        ...prev,
        totalTasks: Math.max(0, (prev.totalTasks || 1) - 1),
      } : prev));
      // Refresh stats from API when available
      try {
        const companyParams = departmentId ? { departmentId } : {};
        const nextStats = await taskService.getDashboardStats(companyParams);
        if (nextStats) setStats(nextStats);
      } catch {
        /* keep optimistic stats */
      }
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to delete task"));
    } finally {
      setDeleting(false);
    }
  };

  const updateStatusFilter = (value) => {
    setStatusFilter(value);
    setPage(1);
    const params = new URLSearchParams(location.search);
    const queryValue = statusFilterToQueryValue(value);
    if (!queryValue) params.delete("status");
    else params.set("status", queryValue);
    const qs = params.toString();
    navigate(`${location.pathname}${qs ? `?${qs}` : ""}`, { replace: true });
  };

  const pendingFallbackCount = scopedTasks.filter((t) => PENDING_DISPLAY_STATUSES.has(t.status)).length;

  const statCards = [
    { title: "Total Tasks", value: String(stats?.totalTasks ?? scopedTasks.length), icon: AssignmentIcon, color: "#2563EB", bg: "#EFF6FF" },
    { title: "Pending", value: String(stats?.pendingTasks ?? pendingFallbackCount), icon: HourglassEmptyIcon, color: "#F97316", bg: "#FFF7ED" },
    { title: "Completed", value: String(stats?.completedTasks ?? scopedTasks.filter((t) => t.status === "Completed").length), icon: CheckCircleOutlineIcon, color: "#16A34A", bg: "#F0FDF4" },
    { title: "Overdue", value: String(stats?.overdueTasks ?? scopedTasks.filter((t) => t.status === "Overdue").length), icon: AccessTimeIcon, color: "#FFFFFF", bg: "#DC2626" },
  ];

  return (
    <SubAdminLayout>
      <Box sx={{ pb: 3 }}>
        <PageHeader
          title={isAssignedView ? "Assigned Tasks" : "Tasks"}
          crumbs={[{ label: "Tasks" }, ...(isAssignedView ? [{ label: "Assigned Tasks" }] : [{ label: "Task List" }])]}
          homePath="/sub-admin/dashboard"
        />

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>
        )}

        <Grid container spacing={2} sx={{ mb: 2.5 }}>
          {statCards.map((s) => {
            const Icon = s.icon;
            return (
              <Grid key={s.title} size={{ xs: 12, sm: 6, md: 3 }}>
                <StatCard {...s} icon={Icon} />
              </Grid>
            );
          })}
        </Grid>

        <Box sx={{ ...card, mb: 2, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
          <Typography sx={{ color: "#64748B", fontSize: "0.9rem" }}>
            {isAssignedView ? "Tasks with employee assignments" : "Department-scoped tasks"}
            {departmentId ? "" : ""}
          </Typography>
          <Button startIcon={<AddIcon />} variant="contained" onClick={() => navigate("/sub-admin/tasks/add")} sx={{ textTransform: "none", bgcolor: "#2563EB", borderRadius: 2 }}>
            Create Task
          </Button>
        </Box>

        <Box sx={{ ...card, mb: 2, display: "flex", flexWrap: "wrap", gap: 1.5, alignItems: "center" }}>
          <TextField
            size="small"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            sx={{ flex: 1, minWidth: 200, "& .MuiOutlinedInput-root": { borderRadius: 2, bgcolor: "#F8FAFC" } }}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: "#94A3B8", fontSize: 20 }} /></InputAdornment> }}
          />
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <Select
              value={statusFilter}
              onChange={(e) => updateStatusFilter(e.target.value)}
              displayEmpty
              sx={{ borderRadius: 2, bgcolor: "#F8FAFC", fontSize: "0.85rem" }}
            >
              <SelectItem value="all">All Status</SelectItem>
              {["Pending", "Open", "In Progress", "Completed", "Overdue", "Closed"].map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
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
              displayEmpty
              sx={{ borderRadius: 2, bgcolor: "#F8FAFC", fontSize: "0.85rem" }}
            >
              <SelectItem value="all">All Due Dates</SelectItem>
              <SelectItem value="today">Due Today</SelectItem>
              <SelectItem value="nearingDue">Nearing Due</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 130 }}>
            <Select value={priorityFilter} onChange={(e) => { setPriorityFilter(e.target.value); setPage(1); }} displayEmpty sx={{ borderRadius: 2, bgcolor: "#F8FAFC", fontSize: "0.85rem" }}>
              <SelectItem value="all">All Priority</SelectItem>
              {["High", "Medium", "Low"].map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ ...card, p: 0, overflow: "hidden" }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: "#F8FAFC" }}>
                  {["Task", "Category", "Frequency", "Department", "Assignees", "Approver", "Priority", "Status", "Due Date", "Actions"].map((h) => (
                    <TableCell key={h} sx={tableHeadCell}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={10} sx={{ py: 6, textAlign: "center" }}>
                      <CircularProgress size={28} />
                    </TableCell>
                  </TableRow>
                ) : paged.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} sx={{ py: 4, textAlign: "center", color: "#64748B" }}>
                      {error ? "Unable to load tasks" : "No tasks found"}
                    </TableCell>
                  </TableRow>
                ) : paged.map((t) => {
                  const overdue = isOverdueDisplayStatus(t.status) || t.rawStatus === "OVERDUE";
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
                    <TableCell sx={{ fontWeight: 600, color: "#0F172A", fontSize: "0.875rem", minWidth: 160 }}>{t.title}</TableCell>
                    <TableCell sx={{ color: "#64748B", fontSize: "0.82rem" }}>{t.category}</TableCell>
                    <TableCell><Chip label={t.frequency} size="small" sx={{ height: 24, fontSize: "0.72rem", bgcolor: "#F1F5F9", color: "#334155" }} /></TableCell>
                    <TableCell sx={{ color: "#64748B", fontSize: "0.82rem" }}>{t.department}</TableCell>
                    <TableCell sx={{ color: "#334155", fontSize: "0.82rem", maxWidth: 160 }}>
                      {t.assignee}
                      {t.assigneeCount > 1 && (
                        <Chip label={`${t.assigneeCount} assignees`} size="small" sx={{ ml: 0.5, height: 20, fontSize: "0.65rem" }} />
                      )}
                    </TableCell>
                    <TableCell sx={{ color: "#64748B", fontSize: "0.82rem" }}>{t.approver}</TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={0.8}>
                        <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: PRIORITY_DOT[t.priority] }} />
                        <Typography sx={{ fontSize: "0.82rem" }}>{t.priority}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell><TaskStatusBadge status={t.status} /></TableCell>
                    <TableCell sx={{ color: "#64748B", fontSize: "0.82rem" }}>{t.dueDate}</TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", gap: 0.5, alignItems: "center" }}>
                        <Tooltip title="Edit task">
                          <IconButton size="small" sx={{ color: "#64748B" }} onClick={() => handleEdit(t)} aria-label="Edit Task">
                            <EditOutlinedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Task">
                          <IconButton
                            size="small"
                            sx={{ color: "#DC2626" }}
                            onClick={() => setConfirmDelete({ id: t.id, title: t.title })}
                            aria-label="Delete Task"
                          >
                            <DeleteOutlineIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Manage assignees">
                          <IconButton size="small" sx={{ color: "#2563EB" }} onClick={() => handleAssign(t)} aria-label="Manage assignees">
                            <AssignmentIndIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
          {!loading && filtered.length > 0 && (
            <Box display="flex" justifyContent="space-between" alignItems="center" px={2} py={1.5} sx={{ borderTop: "1px solid #E8EDF5" }}>
              <Typography sx={{ color: "#64748B", fontSize: "0.82rem" }}>
                Showing {(page - 1) * rowsPerPage + 1} to {Math.min(page * rowsPerPage, filtered.length)} of {filtered.length} tasks
              </Typography>
              <Pagination count={totalPages} page={page} onChange={(_, v) => setPage(v)} size="small" shape="rounded" sx={{ "& .Mui-selected": { bgcolor: "#2563EB !important", color: "#FFF" } }} />
            </Box>
          )}
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
    </SubAdminLayout>
  );
}
