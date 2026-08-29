import { useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import {
  Box, Typography, Grid, Button, TextField, Radio, RadioGroup, FormControlLabel,
  Avatar, Chip, LinearProgress, IconButton, Breadcrumbs, Link,
} from "@mui/material";
import EmployeeLayout from "../components/layouts/EmployeeLayout";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import EventRepeatIcon from "@mui/icons-material/EventRepeat";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import ExternalLinkAttachment, { AttachmentLinkList } from "../components/shared/ExternalLinkAttachment";
import DescriptionIcon from "@mui/icons-material/Description";
import CheckIcon from "@mui/icons-material/Check";

const card = { borderRadius: 3, bgcolor: "#FFFFFF", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", border: "1px solid #E8EDF5", p: 2 };

const TASK = {
  id: "TASK-2025-00045",
  title: "Monthly Compliance Report",
  category: "Compliance",
  frequency: "Monthly",
  dueDate: "31 May 2025",
  priority: "High",
  assignedBy: "Anita Sharma",
  description: "Prepare and submit the monthly compliance report including all regulatory checkpoints, audit logs, and department sign-offs as per company policy.",
  createdOn: "01 May 2025",
  assignedTo: { name: "Sandeep Malik", role: "Compliance Analyst", dept: "Compliance", date: "01 May 2025" },
  subTasks: [
    { label: "Collect audit logs from all departments", done: true, date: "28 May 2025" },
    { label: "Prepare compliance summary document", done: true, date: "30 May 2025" },
  ],
  history: [
    { event: "Task assigned", by: "Anita Sharma", date: "01 May 2025, 09:00 AM" },
    { event: "Task started", by: "Sandeep Malik", date: "05 May 2025, 10:30 AM" },
  ],
  files: [
    { name: "compliance_report_may.pdf", size: "2.4 MB", type: "pdf" },
    { name: "audit_logs.xlsx", size: "856 KB", type: "xlsx" },
    { name: "summary_notes.docx", size: "124 KB", type: "docx" },
  ],
};

function SideCard({ title, children }) {
  return (
    <Box sx={{ ...card, mb: 2 }}>
      <Typography sx={{ fontWeight: 700, color: "#0F172A", fontSize: "0.9rem", mb: 1.5 }}>{title}</Typography>
      {children}
    </Box>
  );
}

function MetaRow({ label, value, highlight }) {
  return (
    <Box display="flex" justifyContent="space-between" mb={1}>
      <Typography sx={{ fontSize: "0.82rem", color: "#64748B" }}>{label}</Typography>
      <Typography sx={{ fontSize: "0.82rem", fontWeight: 600, color: highlight || "#0F172A", textAlign: "right" }}>{value}</Typography>
    </Box>
  );
}

export default function CompleteTask() {
  const navigate = useNavigate();
  const [status, setStatus] = useState("completed");
  const [summary, setSummary] = useState("Completed all compliance checkpoints. Audit logs collected from IT, Finance, and HR departments. Summary report prepared and verified.");
  const [comments, setComments] = useState("");
  const [attachmentLinks, setAttachmentLinks] = useState(
    TASK.files.map((f) => ({
      id: f.name,
      name: f.name,
      url: f.url || "",
      type: f.type,
    }))
  );

  return (
    <EmployeeLayout>
      <Box sx={{ pb: 3 }}>
        <Box display="flex" flexWrap="wrap" justifyContent="space-between" alignItems="flex-start" gap={2} mb={2}>
          <Box>
            <Breadcrumbs sx={{ fontSize: "0.8rem", mb: 1 }}>
              <Link component={RouterLink} to="/employee/dashboard" underline="hover" color="#94A3B8" sx={{ fontSize: "0.8rem" }}>Home</Link>
              <Link component={RouterLink} to="/employee/tasks" underline="hover" color="#64748B" sx={{ fontSize: "0.8rem" }}>My Tasks</Link>
              <Typography color="#2563EB" sx={{ fontSize: "0.8rem", fontWeight: 600 }}>Complete Task</Typography>
            </Breadcrumbs>
          </Box>
          <Box display="flex" gap={1} flexWrap="wrap">
            <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate("/employee/tasks")}
              sx={{ textTransform: "none", borderColor: "#E2E8F0", color: "#64748B", borderRadius: 2 }}>Back to Task</Button>
            <Button variant="outlined" startIcon={<SaveOutlinedIcon />} sx={{ textTransform: "none", borderColor: "#2563EB", color: "#2563EB", borderRadius: 2 }}>Save as Draft</Button>
            <Button variant="contained" startIcon={<CheckCircleOutlineIcon />} sx={{ textTransform: "none", bgcolor: "#2563EB", borderRadius: 2, "&:hover": { bgcolor: "#1D4ED8" } }}>Mark as Completed</Button>
          </Box>
        </Box>

        <Grid container spacing={2.5}>
          <Grid item xs={12} lg={8}>
            <Box sx={{ ...card, mb: 2, display: "flex", gap: 2, alignItems: "flex-start" }}>
              <Box sx={{ width: 52, height: 52, borderRadius: 2, bgcolor: "#FFF7ED", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <DescriptionIcon sx={{ color: "#F97316", fontSize: 28 }} />
              </Box>
              <Box flex={1}>
                <Box display="flex" alignItems="center" gap={1} flexWrap="wrap" mb={0.5}>
                  <Typography sx={{ fontSize: "0.78rem", color: "#64748B", fontWeight: 600 }}>{TASK.id}</Typography>
                  <Chip label="Due Today" size="small" sx={{ height: 22, bgcolor: "#FFF7ED", color: "#EA580C", fontWeight: 700, fontSize: "0.7rem" }} />
                </Box>
                <Typography sx={{ fontWeight: 800, color: "#0F172A", fontSize: "1.35rem", mb: 1.5 }}>{TASK.title}</Typography>
                <Box display="flex" flexWrap="wrap" gap={2}>
                  {[
                    { icon: CategoryOutlinedIcon, label: TASK.category },
                    { icon: EventRepeatIcon, label: TASK.frequency },
                    { icon: CalendarTodayOutlinedIcon, label: TASK.dueDate },
                    { icon: ArrowUpwardIcon, label: TASK.priority, color: "#EF4444" },
                    { icon: PersonOutlineIcon, label: TASK.assignedBy },
                  ].map(({ icon: Icon, label, color }) => (
                    <Box key={label} display="flex" alignItems="center" gap={0.6}>
                      <Icon sx={{ fontSize: 16, color: color || "#94A3B8" }} />
                      <Typography sx={{ fontSize: "0.82rem", color: "#64748B" }}>{label}</Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Box>

            <Box sx={{ ...card, mb: 2 }}>
              <Typography sx={{ fontWeight: 700, color: "#0F172A", fontSize: "0.9rem", mb: 1 }}>Task Description</Typography>
              <Typography sx={{ color: "#64748B", fontSize: "0.85rem", lineHeight: 1.7 }}>{TASK.description}</Typography>
            </Box>

            <Box sx={{ ...card }}>
              <Typography sx={{ fontWeight: 700, color: "#0F172A", fontSize: "1rem", mb: 2 }}>Task Completion Details</Typography>

              <Typography sx={{ fontWeight: 600, color: "#334155", fontSize: "0.85rem", mb: 1 }}>Completion Status</Typography>
              <RadioGroup row value={status} onChange={(e) => setStatus(e.target.value)} sx={{ mb: 2.5 }}>
                {[
                  { v: "completed", l: "Completed", c: "#16A34A" },
                  { v: "issues", l: "Completed with Issues", c: "#F97316" },
                  { v: "not", l: "Not Completed", c: "#EF4444" },
                ].map((o) => (
                  <FormControlLabel key={o.v} value={o.v} control={<Radio sx={{ color: o.c, "&.Mui-checked": { color: o.c } }} />}
                    label={<Typography sx={{ fontSize: "0.85rem", fontWeight: 500 }}>{o.l}</Typography>} />
                ))}
              </RadioGroup>

              <Typography sx={{ fontWeight: 600, color: "#334155", fontSize: "0.85rem", mb: 1 }}>Summary of Work Done</Typography>
              <TextField fullWidth multiline rows={4} value={summary} onChange={(e) => setSummary(e.target.value)}
                inputProps={{ maxLength: 1000 }}
                sx={{ mb: 0.5, "& .MuiOutlinedInput-root": { borderRadius: 2 } }} />
              <Typography align="right" sx={{ fontSize: "0.75rem", color: "#94A3B8", mb: 2 }}>{summary.length}/1000</Typography>

              <Grid container spacing={2} sx={{ mb: 2.5 }}>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth type="date" label="Completion Date" defaultValue="2025-05-31" InputLabelProps={{ shrink: true }}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth type="time" label="Time" defaultValue="16:30" InputLabelProps={{ shrink: true }}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }} />
                </Grid>
              </Grid>

              <Typography sx={{ fontWeight: 600, color: "#334155", fontSize: "0.85rem", mb: 1 }}>Attachments</Typography>
              <ExternalLinkAttachment
                value={attachmentLinks}
                onChange={setAttachmentLinks}
                helperText="Attach Google Drive or external document links only"
              />
              <Box sx={{ mt: 1 }}>
                <AttachmentLinkList
                  items={attachmentLinks}
                  onRemove={(id) => setAttachmentLinks((prev) => prev.filter((item) => item.id !== id))}
                  emptyText={null}
                />
              </Box>

              <Typography sx={{ fontWeight: 600, color: "#334155", fontSize: "0.85rem", mb: 1, mt: 2 }}>Comments (Optional)</Typography>
              <TextField fullWidth multiline rows={3} value={comments} onChange={(e) => setComments(e.target.value)} placeholder="Add any additional comments..."
                sx={{ mb: 3, "& .MuiOutlinedInput-root": { borderRadius: 2 } }} />

              <Box display="flex" justifyContent="center" gap={1.5}>
                <Button variant="outlined" startIcon={<SaveOutlinedIcon />} sx={{ textTransform: "none", borderColor: "#2563EB", color: "#2563EB", borderRadius: 2, px: 3 }}>Save as Draft</Button>
                <Button variant="contained" startIcon={<CheckCircleOutlineIcon />} sx={{ textTransform: "none", bgcolor: "#16A34A", borderRadius: 2, px: 3, "&:hover": { bgcolor: "#15803D" } }}>Mark as Completed</Button>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} lg={4}>
            <SideCard title="Task Details">
              <MetaRow label="Task ID" value={TASK.id} />
              <MetaRow label="Category" value={TASK.category} />
              <MetaRow label="Frequency" value={TASK.frequency} />
              <MetaRow label="Due Date" value={`${TASK.dueDate} (Due Today)`} highlight="#EF4444" />
              <MetaRow label="Priority" value={TASK.priority} highlight="#EF4444" />
              <MetaRow label="Created On" value={TASK.createdOn} />
            </SideCard>

            <SideCard title="Assignment Details">
              <Typography sx={{ fontSize: "0.75rem", color: "#94A3B8", mb: 0.5 }}>Assigned By</Typography>
              <Box display="flex" alignItems="center" gap={1} mb={1.5}>
                <Avatar sx={{ width: 32, height: 32, bgcolor: "#7C3AED", fontSize: "0.75rem" }}>AS</Avatar>
                <Box>
                  <Typography sx={{ fontWeight: 600, fontSize: "0.85rem" }}>{TASK.assignedBy}</Typography>
                  <Typography sx={{ fontSize: "0.75rem", color: "#64748B" }}>Manager · Compliance</Typography>
                </Box>
              </Box>
              <Typography sx={{ fontSize: "0.75rem", color: "#94A3B8", mb: 0.5 }}>Assigned To</Typography>
              <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                <Avatar sx={{ width: 32, height: 32, bgcolor: "#2563EB", fontSize: "0.75rem" }}>SM</Avatar>
                <Box>
                  <Typography sx={{ fontWeight: 600, fontSize: "0.85rem" }}>{TASK.assignedTo.name}</Typography>
                  <Typography sx={{ fontSize: "0.75rem", color: "#64748B" }}>{TASK.assignedTo.role} · {TASK.assignedTo.dept}</Typography>
                </Box>
              </Box>
              <Typography sx={{ fontSize: "0.75rem", color: "#94A3B8" }}>Assigned on {TASK.assignedTo.date}</Typography>
            </SideCard>

            <SideCard title="Sub Tasks">
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography sx={{ fontSize: "0.82rem", color: "#64748B" }}>Progress</Typography>
                <Typography sx={{ fontSize: "0.82rem", fontWeight: 700, color: "#16A34A" }}>100%</Typography>
              </Box>
              <LinearProgress variant="determinate" value={100} sx={{ height: 8, borderRadius: 4, mb: 2, bgcolor: "#F1F5F9", "& .MuiLinearProgress-bar": { bgcolor: "#16A34A", borderRadius: 4 } }} />
              {TASK.subTasks.map((s) => (
                <Box key={s.label} display="flex" gap={1} mb={1.2}>
                  <CheckIcon sx={{ color: "#16A34A", fontSize: 18, mt: 0.2 }} />
                  <Box>
                    <Typography sx={{ fontSize: "0.82rem", color: "#334155", textDecoration: "line-through" }}>{s.label}</Typography>
                    <Typography sx={{ fontSize: "0.72rem", color: "#94A3B8" }}>Completed {s.date}</Typography>
                  </Box>
                </Box>
              ))}
            </SideCard>

            <SideCard title="Task History">
              {TASK.history.map((h, i) => (
                <Box key={h.date} display="flex" gap={1.5} mb={i < TASK.history.length - 1 ? 2 : 0}>
                  <Box sx={{ width: 10, display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: "#2563EB", flexShrink: 0 }} />
                    {i < TASK.history.length - 1 && <Box sx={{ width: 2, flex: 1, bgcolor: "#E2E8F0", mt: 0.5 }} />}
                  </Box>
                  <Box pb={1}>
                    <Typography sx={{ fontWeight: 600, fontSize: "0.82rem", color: "#0F172A" }}>{h.event}</Typography>
                    <Typography sx={{ fontSize: "0.75rem", color: "#64748B" }}>{h.by} · {h.date}</Typography>
                  </Box>
                </Box>
              ))}
              <Button sx={{ textTransform: "none", color: "#2563EB", fontSize: "0.82rem", mt: 1, p: 0 }}>View all history</Button>
            </SideCard>
          </Grid>
        </Grid>
      </Box>
    </EmployeeLayout>
  );
}
