import { useState, useMemo, useEffect, useCallback } from "react";
import { Link as RouterLink, useNavigate, useLocation } from "react-router-dom";
import {
  Box, Typography, Grid, Button, TextField, MenuItem, Select, FormControl,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  IconButton, Chip, InputAdornment, Pagination, Breadcrumbs, Link,
} from "@mui/material";
import Layout from "../components/layouts/Layout";
import SubAdminLayout from "../components/layouts/SubAdminLayout";
import SearchIcon from "@mui/icons-material/Search";
import FileUploadOutlinedIcon from "@mui/icons-material/FileUploadOutlined";
import AddIcon from "@mui/icons-material/Add";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import EventRepeatIcon from "@mui/icons-material/EventRepeat";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import PauseCircleOutlineIcon from "@mui/icons-material/PauseCircleOutline";
import PeopleOutlineIcon from "@mui/icons-material/PeopleOutline";
import ScheduleIcon from "@mui/icons-material/Schedule";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { ConfirmDialog, EmptyState, ErrorState, LoadingSkeleton } from "../components/shared";
import taskFrequencyService from "../services/taskFrequencyService";
import { toast } from "../utils/toast";
import { formatDaysInterval, getErrorMessage, toDisplayStatus } from "../utils/session";

const card = { borderRadius: 3, bgcolor: "#FFFFFF", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", border: "1px solid #E8EDF5", p: 2 };

function mapFrequencyRow(f) {
  return {
    id: f.id,
    name: f.frequencyName,
    description: f.description || "—",
    numberOfDays: f.numberOfDays ?? "—",
    interval: formatDaysInterval(f.daysInterval),
    status: toDisplayStatus(f.status || "ACTIVE"),
  };
}

function StatusBadge({ status }) {
  const active = status === "Active";
  return (
    <Chip label={status} size="small" sx={{
      height: 24, fontSize: "0.72rem", fontWeight: 600,
      bgcolor: active ? "#F0FDF4" : "#FFF7ED", color: active ? "#16A34A" : "#EA580C",
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
    { color: "#16A34A", label: "Active", desc: "Frequency is active and available for use" },
    { color: "#F97316", label: "Inactive", desc: "Frequency is inactive and cannot be used" },
    { color: "#EF4444", label: "Deleted", desc: "Frequency is deleted from the system" },
  ];
  return (
    <Box sx={{ ...card, mb: 2 }}>
      <Typography sx={{ fontWeight: 700, color: "#0F172A", fontSize: "0.9rem", mb: 1.5 }}>Status Legend</Typography>
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

function getApiErrorType(err) {
  if (!err?.response) return "network";
  const status = err.response.status;
  if (status === 403) return "403";
  if (status === 404) return "404";
  if (status >= 500) return "500";
  return "500";
}

export default function FrequencyMaster() {
  const navigate = useNavigate();
  const location = useLocation();
  const isSubAdmin = location.pathname.startsWith("/sub-admin");
  const PageLayout = isSubAdmin ? SubAdminLayout : Layout;

  const [frequencies, setFrequencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadFrequencies = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await taskFrequencyService.getAll({ limit: 100 });
      const items = Array.isArray(result) ? result : result.items || [];
      setFrequencies(items.map(mapFrequencyRow));
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFrequencies();
  }, [loadFrequencies]);

  const filtered = useMemo(() => frequencies.filter((f) => {
    const q = search.toLowerCase();
    return (
      (!q || f.name.toLowerCase().includes(q) || f.description.toLowerCase().includes(q) || String(f.numberOfDays).includes(q))
      && (statusFilter === "all" || f.status === statusFilter)
    );
  }), [frequencies, search, statusFilter]);

  const paged = filtered.slice((page - 1) * rowsPerPage, page * rowsPerPage);
  const totalPages = Math.ceil(filtered.length / rowsPerPage) || 1;
  const activeCount = frequencies.filter((f) => f.status === "Active").length;
  const inactiveCount = frequencies.filter((f) => f.status === "Inactive").length;

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await taskFrequencyService.delete(deleteTarget.id);
      toast.success("Frequency deleted successfully");
      setDeleteTarget(null);
      await loadFrequencies();
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to delete frequency"));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <PageLayout>
      <Box sx={{ pb: 3 }}>
        <Grid container spacing={2.5}>
          <Grid item xs={12} lg={9}>
            <Box display="flex" flexWrap="wrap" justifyContent="space-between" alignItems="flex-start" gap={2} mb={2}>
              <Box>
                <Typography sx={{ fontWeight: 800, color: "#0F172A", fontSize: "1.5rem" }}>Frequencies</Typography>
                <Breadcrumbs sx={{ mt: 0.5, fontSize: "0.8rem" }}>
                  <Link component={RouterLink} to={isSubAdmin ? "/sub-admin/dashboard" : "/dashboard"} underline="hover" color="#94A3B8" sx={{ fontSize: "0.8rem" }}>Home</Link>
                  <Typography color="#64748B" sx={{ fontSize: "0.8rem" }}>Frequencies</Typography>
                  <Typography color="#2563EB" sx={{ fontSize: "0.8rem", fontWeight: 600 }}>Frequency List</Typography>
                </Breadcrumbs>
              </Box>
              <Box display="flex" gap={1}>
                <Button variant="outlined" startIcon={<FileUploadOutlinedIcon />} sx={{ textTransform: "none", borderColor: "#2563EB", color: "#2563EB", borderRadius: 2, fontWeight: 600 }}>Export</Button>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => navigate(isSubAdmin ? "/sub-admin/frequencies/add" : "/dashboard/frequencies/add")}
                  sx={{ textTransform: "none", bgcolor: "#2563EB", borderRadius: 2, fontWeight: 600, "&:hover": { bgcolor: "#1D4ED8" } }}
                >
                  Add Frequency
                </Button>
              </Box>
            </Box>

            <Grid container spacing={2} sx={{ mb: 2.5 }}>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard title="Total Frequencies" value={frequencies.length} sub="All configured frequencies" icon={EventRepeatIcon} color="#2563EB" bg="#EFF6FF" />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard title="Active Frequencies" value={activeCount} sub={frequencies.length ? `${((activeCount / frequencies.length) * 100).toFixed(0)}% active` : "0% active"} subColor="#16A34A" icon={CheckCircleOutlineIcon} color="#16A34A" bg="#F0FDF4" />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard title="Inactive Frequencies" value={inactiveCount} sub={frequencies.length ? `${((inactiveCount / frequencies.length) * 100).toFixed(0)}% inactive` : "0% inactive"} subColor="#F97316" icon={PauseCircleOutlineIcon} color="#F97316" bg="#FFF7ED" />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard title="Used in Tasks" value={frequencies.length} sub="Tasks using these frequencies" icon={PeopleOutlineIcon} color="#7C3AED" bg="#F5F3FF" />
              </Grid>
            </Grid>

            <Box sx={{ ...card, p: 0, overflow: "hidden" }}>
              <Box display="flex" flexWrap="wrap" justifyContent="space-between" alignItems="center" gap={1.5} px={2} py={1.5} sx={{ borderBottom: "1px solid #E8EDF5" }}>
                <Box display="flex" flexWrap="wrap" gap={1.5} alignItems="center" flex={1}>
                  <TextField size="small" placeholder="Search frequency by name or description..." value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    sx={{ flex: 1, minWidth: 200, maxWidth: 340, "& .MuiOutlinedInput-root": { borderRadius: 2, bgcolor: "#F8FAFC" } }}
                    InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: "#94A3B8", fontSize: 20 }} /></InputAdornment> }} />
                  <FormControl size="small" sx={{ minWidth: 130 }}>
                    <Select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} sx={{ borderRadius: 2, bgcolor: "#F8FAFC", fontSize: "0.85rem" }}>
                      <MenuItem value="all">All Status</MenuItem>
                      <MenuItem value="Active">Active</MenuItem>
                      <MenuItem value="Inactive">Inactive</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
                <Button onClick={() => { setSearch(""); setStatusFilter("all"); setPage(1); }} sx={{ textTransform: "none", color: "#64748B", fontSize: "0.85rem" }}>Clear Filters</Button>
              </Box>

              {loading ? (
                <Box sx={{ p: 2 }}><LoadingSkeleton variant="table" rows={6} /></Box>
              ) : error ? (
                <Box sx={{ p: 2 }}>
                  <ErrorState type={getApiErrorType(error)} title="Failed to load frequencies" description={getErrorMessage(error)} />
                  <Box textAlign="center" mt={2}>
                    <Button variant="contained" onClick={loadFrequencies} sx={{ textTransform: "none", bgcolor: "#2563EB" }}>Retry</Button>
                  </Box>
                </Box>
              ) : filtered.length === 0 ? (
                <Box sx={{ p: 2 }}>
                  <EmptyState
                    title="No frequencies found"
                    description="Create your first task frequency or adjust your filters."
                    actionLabel="Add Frequency"
                    onAction={() => navigate(isSubAdmin ? "/sub-admin/frequencies/add" : "/dashboard/frequencies/add")}
                  />
                </Box>
              ) : (
                <>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow sx={{ bgcolor: "#F8FAFC" }}>
                          <TableCell sx={{ width: 40, py: 1.5 }} />
                          {["Frequency Name", "Description", "No. of Days", "Duration / Interval", "Status", "Actions"].map((h) => (
                            <TableCell key={h} sx={{ fontWeight: 700, color: "#64748B", fontSize: "0.75rem", textTransform: "uppercase", py: 1.5, whiteSpace: "nowrap" }}>{h}</TableCell>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {paged.map((f) => (
                          <TableRow key={f.id} hover sx={{ "& td": { borderBottom: "1px solid #F1F5F9", py: 1.5 } }}>
                            <TableCell sx={{ width: 40, px: 1 }}>
                              <DragIndicatorIcon sx={{ color: "#CBD5E1", fontSize: 20, cursor: "grab" }} />
                            </TableCell>
                            <TableCell sx={{ fontWeight: 600, color: "#0F172A", fontSize: "0.875rem", minWidth: 120 }}>{f.name}</TableCell>
                            <TableCell sx={{ color: "#64748B", fontSize: "0.82rem", maxWidth: 220 }}>{f.description}</TableCell>
                            <TableCell sx={{ color: "#334155", fontSize: "0.85rem", fontWeight: 600 }}>{f.numberOfDays}</TableCell>
                            <TableCell sx={{ color: "#334155", fontSize: "0.85rem", fontWeight: 500 }}>{f.interval}</TableCell>
                            <TableCell><StatusBadge status={f.status} /></TableCell>
                            <TableCell>
                              <Box display="flex" gap={0.3}>
                                <IconButton
                                  size="small"
                                  sx={{ color: "#2563EB" }}
                                  aria-label={`Edit ${f.name}`}
                                  onClick={() => navigate(isSubAdmin ? `/sub-admin/frequencies/edit/${f.id}` : `/dashboard/frequencies/edit/${f.id}`)}
                                >
                                  <EditOutlinedIcon sx={{ fontSize: 18 }} />
                                </IconButton>
                                {!isSubAdmin && (
                                  <IconButton size="small" sx={{ color: "#EF4444" }} aria-label={`Delete ${f.name}`} onClick={() => setDeleteTarget(f)}>
                                    <DeleteOutlineIcon sx={{ fontSize: 18 }} />
                                  </IconButton>
                                )}
                              </Box>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  <Box display="flex" flexWrap="wrap" justifyContent="space-between" alignItems="center" px={2} py={1.5} sx={{ borderTop: "1px solid #E8EDF5" }}>
                    <Typography sx={{ color: "#64748B", fontSize: "0.82rem" }}>
                      Showing {(page - 1) * rowsPerPage + 1} to {Math.min(page * rowsPerPage, filtered.length)} of {filtered.length} frequencies
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
                </>
              )}
            </Box>
          </Grid>

          <Grid item xs={12} lg={3}>
            <Box sx={{ ...card, mb: 2, borderColor: "#BFDBFE", bgcolor: "#F8FAFF" }}>
              <Typography sx={{ fontWeight: 700, color: "#0F172A", fontSize: "0.9rem", mb: 1 }}>About Frequency</Typography>
              <Typography sx={{ color: "#64748B", fontSize: "0.82rem", lineHeight: 1.7, mb: 1.5 }}>
                Frequencies define how often tasks are performed — daily, weekly, monthly, or custom intervals. They are used when creating recurring tasks.
              </Typography>
              <Box sx={{ display: "flex", justifyContent: "center", gap: 1, py: 1 }}>
                <Box sx={{ width: 56, height: 56, borderRadius: 2, bgcolor: "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <ScheduleIcon sx={{ fontSize: 28, color: "#2563EB" }} />
                </Box>
                <Box sx={{ width: 56, height: 56, borderRadius: 2, bgcolor: "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <AccessTimeIcon sx={{ fontSize: 28, color: "#2563EB" }} />
                </Box>
              </Box>
            </Box>
            <StatusLegend />
          </Grid>
        </Grid>
      </Box>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Frequency"
        message={deleteTarget ? `Are you sure you want to delete "${deleteTarget.name}"? This action cannot be undone.` : ""}
        confirmLabel={deleting ? "Deleting..." : "Delete"}
        confirmColor="#EF4444"
        onClose={() => !deleting && setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </PageLayout>
  );
}
