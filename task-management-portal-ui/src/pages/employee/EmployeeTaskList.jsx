import { useState, useMemo, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Typography, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  IconButton, InputAdornment, MenuItem, Select, FormControl, InputLabel, Pagination,
  CircularProgress, Alert, Button,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import EmployeeLayout from "../../components/layouts/EmployeeLayout";
import { PageHeader, TaskStatusBadge, PriorityBadge, card, tableHeadCell, fieldSx } from "../../components/employee/shared";
import taskService from "../../services/taskService";
import { getAuthUser, getErrorMessage } from "../../utils/session";
import { mapEmployeeTask } from "../../utils/employeeTaskMapper";
import { getCompleteDateDisplay } from "../../utils/dateUtils";
import { isOverdueDisplayStatus, OVERDUE_FULL } from "../../constants/overdueStyles";

const SORT_OPTIONS = ["Due Date", "Priority", "Status", "Assigned Date"];

export default function EmployeeTaskList() {
  const navigate = useNavigate();
  const authUser = useMemo(() => getAuthUser() || {}, []);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [priority, setPriority] = useState("all");
  const [category, setCategory] = useState("all");
  const [assignedBy, setAssignedBy] = useState("all");
  const [sort, setSort] = useState("Due Date");
  const [page, setPage] = useState(1);

  const loadTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      // No assignedToId / companyId from client — backend scopes from JWT
      const result = await taskService.getAll({ limit: 100 });
      const items = (result.items || []).map((t) => mapEmployeeTask(t, authUser.id));
      setTasks(items);
    } catch (err) {
      setTasks([]);
      setError(getErrorMessage(err, "Failed to load tasks"));
    } finally {
      setLoading(false);
    }
  }, [authUser.id]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const categories = [...new Set(tasks.map((t) => t.category).filter((c) => c && c !== "—"))];
  const assigners = [...new Set(tasks.map((t) => t.assignedBy).filter((a) => a && a !== "—"))];

  const filtered = useMemo(() => {
    let list = [...tasks];
    const q = search.toLowerCase();
    if (q) {
      list = list.filter((t) =>
        t.title.toLowerCase().includes(q)
        || String(t.taskCode || "").toLowerCase().includes(q)
        || String(t.id).toLowerCase().includes(q)
      );
    }
    if (status !== "all") list = list.filter((t) => t.status === status);
    if (priority !== "all") list = list.filter((t) => t.priority === priority);
    if (category !== "all") list = list.filter((t) => t.category === category);
    if (assignedBy !== "all") list = list.filter((t) => t.assignedBy === assignedBy);
    if (sort === "Priority") {
      const order = { High: 0, Medium: 1, Low: 2 };
      list.sort((a, b) => (order[a.priority] ?? 9) - (order[b.priority] ?? 9));
    } else if (sort === "Status") {
      list.sort((a, b) => String(a.status).localeCompare(String(b.status)));
    } else if (sort === "Assigned Date") {
      list.sort((a, b) => String(b.assignedDate).localeCompare(String(a.assignedDate)));
    } else {
      list.sort((a, b) => {
        const da = a.dueDateRaw ? new Date(a.dueDateRaw).getTime() : 0;
        const db = b.dueDateRaw ? new Date(b.dueDateRaw).getTime() : 0;
        return da - db;
      });
    }
    return list;
  }, [tasks, search, status, priority, category, assignedBy, sort]);

  const paged = filtered.slice((page - 1) * 8, page * 8);

  return (
    <EmployeeLayout>
      <Box sx={{ pb: 3 }}>
        <PageHeader title="My Tasks" crumbs={[{ label: "My Tasks" }]} />

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
            {error}
          </Alert>
        )}

        <Box sx={{ ...card, mb: 2 }}>
          <TextField size="small" placeholder="Search tasks..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} fullWidth sx={{ mb: 2, ...fieldSx }}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: "#94A3B8", fontSize: 20 }} /></InputAdornment> }} />
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "repeat(5, 1fr)" }, gap: 2 }}>
            <FormControl size="small" sx={fieldSx}><InputLabel>Status</InputLabel>
              <Select value={status} label="Status" onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
                <MenuItem value="all">All</MenuItem>
                {["Open", "In Progress", "Completed", "Overdue"].map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl size="small" sx={fieldSx}><InputLabel>Priority</InputLabel>
              <Select value={priority} label="Priority" onChange={(e) => { setPriority(e.target.value); setPage(1); }}>
                <MenuItem value="all">All</MenuItem>
                {["High", "Medium", "Low"].map((p) => <MenuItem key={p} value={p}>{p}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl size="small" sx={fieldSx}><InputLabel>Category</InputLabel>
              <Select value={category} label="Category" onChange={(e) => { setCategory(e.target.value); setPage(1); }}>
                <MenuItem value="all">All</MenuItem>
                {categories.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl size="small" sx={fieldSx}><InputLabel>Assigned By</InputLabel>
              <Select value={assignedBy} label="Assigned By" onChange={(e) => { setAssignedBy(e.target.value); setPage(1); }}>
                <MenuItem value="all">All</MenuItem>
                {assigners.map((a) => <MenuItem key={a} value={a}>{a}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl size="small" sx={fieldSx}><InputLabel>Sort</InputLabel>
              <Select value={sort} label="Sort" onChange={(e) => setSort(e.target.value)}>
                {SORT_OPTIONS.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
              </Select>
            </FormControl>
          </Box>
        </Box>

        <Box sx={{ ...card, p: 0, overflow: "hidden" }}>
          {loading ? (
            <Box display="flex" justifyContent="center" py={6}><CircularProgress size={32} /></Box>
          ) : filtered.length === 0 ? (
            <Box textAlign="center" py={6} px={3}>
              <Typography sx={{ fontWeight: 700, color: "#0F172A", mb: 1 }}>
                {error ? "Failed to load tasks" : "No tasks assigned to you."}
              </Typography>
              <Typography sx={{ color: "#64748B", fontSize: "0.9rem", mb: 2 }}>
                {error
                  ? "Please try again or contact your administrator."
                  : "You have no tasks assigned to you at the moment."}
              </Typography>
              {!error && (
                <Button
                  startIcon={<CalendarMonthIcon />}
                  onClick={() => navigate("/employee/calendar")}
                  sx={{ textTransform: "none", borderRadius: 2 }}
                  variant="outlined"
                >
                  Go to Calendar
                </Button>
              )}
            </Box>
          ) : (
            <>
              <TableContainer sx={{ overflowX: "auto" }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: "#F8FAFC" }}>
                      {["Task ID", "Task Name", "Priority", "Category", "Assigned By", "Assigned Date", "Due Date", "Complete Date", "Status", "Actions"].map((h) => (
                        <TableCell key={h} sx={tableHeadCell}>{h}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paged.map((t) => {
                      const overdue = isOverdueDisplayStatus(t.status);
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
                        <TableCell sx={{ color: "#64748B", fontSize: "0.82rem", fontFamily: "monospace" }}>{t.taskCode}</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: "#0F172A", fontSize: "0.875rem" }}>{t.title}</TableCell>
                        <TableCell><PriorityBadge priority={t.priority} /></TableCell>
                        <TableCell sx={{ color: "#64748B", fontSize: "0.85rem" }}>{t.category}</TableCell>
                        <TableCell sx={{ color: "#334155", fontSize: "0.85rem" }}>{t.assignedBy}</TableCell>
                        <TableCell sx={{ color: "#64748B", fontSize: "0.82rem" }}>{t.assignedDate}</TableCell>
                        <TableCell sx={{ color: "#64748B", fontSize: "0.82rem" }}>{t.dueDate}</TableCell>
                        <TableCell sx={{ color: "#64748B", fontSize: "0.82rem" }}>{getCompleteDateDisplay(t)}</TableCell>
                        <TableCell><TaskStatusBadge status={t.status} /></TableCell>
                        <TableCell>
                          <IconButton size="small" onClick={() => navigate(`/employee/tasks/${t.id}`)} sx={{ color: "#2563EB" }}>
                            <VisibilityOutlinedIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
              <Box display="flex" justifyContent="center" py={2}>
                <Pagination count={Math.ceil(filtered.length / 8) || 1} page={page} onChange={(_, v) => setPage(v)} size="small" />
              </Box>
            </>
          )}
        </Box>
      </Box>
    </EmployeeLayout>
  );
}
