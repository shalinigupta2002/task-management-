import { useState } from "react";
import { Link as RouterLink, useNavigate, useLocation } from "react-router-dom";
import {
  Box, Typography, Grid, Button, TextField, Stepper, Step, StepLabel, Chip, Tabs, Tab, Breadcrumbs, Link,
} from "@mui/material";
import Layout from "../layouts/Layout";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import ReplyIcon from "@mui/icons-material/Reply";
import TaskStatusBadge from "./TaskStatusBadge";
import { AttachmentLinkList } from "../shared/ExternalLinkAttachment";
import { card, SAMPLE_TASK, PRIORITY_DOT } from "./taskShared";

function ApprovalStepper({ activeStep, steps, approvedSteps = [] }) {
  return (
    <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 3, "& .MuiStepLabel-label": { fontSize: "0.78rem", fontWeight: 600 } }}>
      {steps.map((label, i) => (
        <Step key={label} completed={approvedSteps.includes(i)}>
          <StepLabel StepIconProps={{
            sx: { color: approvedSteps.includes(i) ? "#16A34A !important" : i === activeStep ? "#2563EB !important" : "#CBD5E1 !important" },
          }}>{label}</StepLabel>
        </Step>
      ))}
    </Stepper>
  );
}

function TaskSummaryCard() {
  return (
    <Box sx={{ ...card, p: 2, mb: 2, display: "flex", gap: 2, alignItems: "flex-start" }}>
      <Box sx={{ width: 48, height: 48, borderRadius: 2, bgcolor: "#FEF2F2", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <DescriptionOutlinedIcon sx={{ color: "#EF4444", fontSize: 28 }} />
      </Box>
      <Box flex={1}>
        <Typography sx={{ fontWeight: 800, color: "#0F172A", fontSize: "1.1rem", mb: 0.5 }}>{SAMPLE_TASK.title}</Typography>
        <Box display="flex" gap={1} flexWrap="wrap" mb={0.5}>
          <Chip label={SAMPLE_TASK.category} size="small" sx={{ bgcolor: "#F1F5F9", fontSize: "0.72rem" }} />
          <Chip label={SAMPLE_TASK.frequency} size="small" sx={{ bgcolor: "#EFF6FF", color: "#2563EB", fontSize: "0.72rem" }} />
        </Box>
        <Typography sx={{ fontSize: "0.82rem", color: "#64748B" }}>Submitted by {SAMPLE_TASK.submitter}</Typography>
      </Box>
    </Box>
  );
}

function ApproveView({ navigate }) {
  return (
    <Box>
      <Box display="flex" alignItems="center" gap={1.5} mb={2}>
        <Typography sx={{ fontWeight: 800, color: "#0F172A", fontSize: "1.5rem" }}>Approve Task</Typography>
        <TaskStatusBadge status="Pending Approval" />
      </Box>
      <TaskSummaryCard />
      <Box sx={{ ...card, p: 2.5, mb: 2 }}>
        <Typography sx={{ fontWeight: 700, color: "#0F172A", fontSize: "0.9rem", mb: 2 }}>Approval Workflow</Typography>
        <ApprovalStepper activeStep={1} approvedSteps={[0]} steps={["Level 1: Anita Desai", "Level 2: Vikram Singh", "Level 3: Sandeep Mallik"]} />
        <Typography sx={{ fontWeight: 600, color: "#334155", fontSize: "0.85rem", mb: 1 }}>Description</Typography>
        <Typography sx={{ color: "#64748B", fontSize: "0.85rem", lineHeight: 1.7, mb: 2 }}>{SAMPLE_TASK.description}</Typography>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          {[{ l: "Priority", v: SAMPLE_TASK.priority, dot: PRIORITY_DOT[SAMPLE_TASK.priority] }, { l: "Due Date", v: "25 May 2024" }, { l: "Effort", v: `${SAMPLE_TASK.effort} hrs` }].map((item) => (
            <Grid item xs={4} key={item.l}>
              <Box sx={{ bgcolor: "#F8FAFC", borderRadius: 2, p: 1.5 }}>
                <Typography sx={{ fontSize: "0.72rem", color: "#94A3B8", mb: 0.3 }}>{item.l}</Typography>
                <Box display="flex" alignItems="center" gap={0.8}>
                  {item.dot && <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: item.dot }} />}
                  <Typography sx={{ fontWeight: 700, fontSize: "0.85rem", color: "#0F172A" }}>{item.v}</Typography>
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
        <TextField fullWidth multiline rows={3} label="Your Comments (Optional)" placeholder="Add review comments..." sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }} />
      </Box>
      <Box display="flex" justifyContent="flex-end" gap={1.5}>
        <Button variant="outlined" startIcon={<CancelOutlinedIcon />} onClick={() => navigate("/dashboard/tasks/1/send-back")} sx={{ textTransform: "none", borderColor: "#EF4444", color: "#EF4444", borderRadius: 2 }}>Reject</Button>
        <Button variant="outlined" startIcon={<ReplyIcon />} onClick={() => navigate("/dashboard/tasks/1/send-back")} sx={{ textTransform: "none", borderColor: "#F97316", color: "#F97316", borderRadius: 2 }}>Send Back</Button>
        <Button variant="contained" startIcon={<CheckCircleIcon />} onClick={() => navigate("/dashboard/tasks/1/review")} sx={{ textTransform: "none", bgcolor: "#2563EB", borderRadius: 2, "&:hover": { bgcolor: "#1D4ED8" } }}>Approve & Forward</Button>
      </Box>
    </Box>
  );
}

function CompletedReviewView({ navigate }) {
  const [tab, setTab] = useState(0);
  return (
    <Box>
      <Box display="flex" alignItems="center" gap={1.5} mb={2}>
        <Typography sx={{ fontWeight: 800, color: "#0F172A", fontSize: "1.5rem" }}>Task Completed</Typography>
        <TaskStatusBadge status="Completed (Pending Review)" />
      </Box>
      <Box sx={{ ...card, p: 2.5, mb: 2 }}>
        <ApprovalStepper activeStep={3} approvedSteps={[0, 1, 2]} steps={["Assigned", "In Progress", "Completed", "Under Review", "Closed"]} />
      </Box>
      <Box sx={{ ...card, overflow: "hidden" }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ px: 2, borderBottom: "1px solid #E8EDF5", "& .MuiTab-root": { textTransform: "none", fontWeight: 600, fontSize: "0.85rem" }, "& .Mui-selected": { color: "#2563EB !important" } }}>
          <Tab label="Task Details" /><Tab label="Comments" /><Tab label="Attachments" />
        </Tabs>
        <Box sx={{ p: 2.5 }}>
          {tab === 0 && (
            <>
              <Typography sx={{ fontWeight: 700, color: "#0F172A", mb: 1 }}>{SAMPLE_TASK.title}</Typography>
              <Typography sx={{ color: "#64748B", fontSize: "0.85rem", lineHeight: 1.7, mb: 2 }}>{SAMPLE_TASK.description}</Typography>
            </>
          )}
          {tab === 1 && (
            <Box sx={{ bgcolor: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: 2, p: 2 }}>
              <Typography sx={{ fontWeight: 700, color: "#16A34A", fontSize: "0.85rem", mb: 0.5 }}>Employee Comments</Typography>
              <Typography sx={{ color: "#334155", fontSize: "0.85rem", lineHeight: 1.7 }}>All compliance checkpoints completed. Audit logs attached. Ready for final review.</Typography>
            </Box>
          )}
          {tab === 2 && (
            <AttachmentLinkList
              items={SAMPLE_TASK.attachments.map((f) => ({ id: f.name, name: f.name, url: f.url || "" }))}
              readOnly
            />
          )}
        </Box>
      </Box>
      <Box display="flex" justifyContent="flex-end" mt={2}>
        <Button variant="outlined" onClick={() => navigate("/dashboard/tasks/1/send-back")} sx={{ textTransform: "none", borderRadius: 2, color: "#64748B", borderColor: "#E2E8F0" }}>Withdraw</Button>
      </Box>
    </Box>
  );
}

function SendBackView({ navigate }) {
  return (
    <Box>
      <Typography sx={{ fontWeight: 800, color: "#0F172A", fontSize: "1.5rem", mb: 2 }}>Review & Re-open Task</Typography>
      <Box sx={{ bgcolor: "#FEFCE8", border: "1px solid #FDE68A", borderRadius: 2, p: 2, mb: 2 }}>
        <Typography sx={{ fontWeight: 700, color: "#CA8A04", fontSize: "0.85rem", mb: 0.5 }}>Previous Review Comments</Typography>
        <Typography sx={{ color: "#334155", fontSize: "0.85rem" }}>Please update section 3 of the compliance report with Q1 audit findings before resubmitting.</Typography>
      </Box>
      <Box sx={{ ...card, p: 2.5 }}>
        <Typography sx={{ fontWeight: 700, color: "#0F172A", fontSize: "0.9rem", mb: 1.5 }}>Send Back to Employee</Typography>
        <TextField fullWidth multiline rows={4} required label="Instructions for Employee" placeholder="Provide clear instructions for corrections..." sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }} />
      </Box>
      <Box display="flex" justifyContent="flex-end" gap={1.5} mt={2}>
        <Button variant="outlined" onClick={() => navigate("/dashboard/tasks")} sx={{ textTransform: "none", borderRadius: 2, color: "#64748B", borderColor: "#E2E8F0" }}>Cancel</Button>
        <Button variant="contained" onClick={() => navigate("/dashboard/tasks/edit/1")} sx={{ textTransform: "none", bgcolor: "#F97316", borderRadius: 2, "&:hover": { bgcolor: "#EA580C" } }}>Send Back & Re-open</Button>
      </Box>
    </Box>
  );
}

function CloseView({ navigate }) {
  return (
    <Box>
      <Box display="flex" alignItems="center" gap={1.5} mb={2}>
        <Typography sx={{ fontWeight: 800, color: "#0F172A", fontSize: "1.5rem" }}>Task Closure</Typography>
        <TaskStatusBadge status="Closed" />
      </Box>
      <Box sx={{ ...card, p: 2.5, mb: 2 }}>
        <ApprovalStepper activeStep={3} approvedSteps={[0, 1, 2]} steps={["Level 1", "Level 2", "Level 3", "Closed"]} />
      </Box>
      <Box sx={{ bgcolor: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: 2, p: 2, mb: 2 }}>
        <Typography sx={{ fontWeight: 700, color: "#16A34A", fontSize: "0.85rem", mb: 0.5 }}>Closing Comments</Typography>
        <Typography sx={{ color: "#334155", fontSize: "0.85rem", lineHeight: 1.7 }}>Task reviewed and approved. All compliance requirements met. Closing this task.</Typography>
      </Box>
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={6}>
          <Typography sx={{ fontSize: "0.75rem", color: "#94A3B8" }}>Closed On</Typography>
          <Typography sx={{ fontWeight: 600, color: "#0F172A" }}>28 May 2024, 04:30 PM</Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography sx={{ fontSize: "0.75rem", color: "#94A3B8" }}>Closed By</Typography>
          <Typography sx={{ fontWeight: 600, color: "#0F172A" }}>Sandeep Mallik</Typography>
        </Grid>
      </Grid>
      <Box display="flex" justifyContent="flex-end">
        <Button variant="contained" onClick={() => navigate("/dashboard/tasks")} sx={{ textTransform: "none", bgcolor: "#16A34A", borderRadius: 2, "&:hover": { bgcolor: "#15803D" } }}>Close Task</Button>
      </Box>
    </Box>
  );
}

export default function TaskWorkflow() {
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;
  const mode = path.includes("/approve") ? "approve" : path.includes("/review") ? "review" : path.includes("/send-back") ? "sendback" : path.includes("/close") ? "close" : "approve";
  const titles = { approve: "Approve Task", review: "Task Completed", sendback: "Review & Re-open", close: "Task Closure" };

  return (
    <Layout>
      <Box sx={{ pb: 3 }}>
        <Button component={RouterLink} to="/dashboard/tasks" startIcon={<ArrowBackIcon />} sx={{ textTransform: "none", color: "#64748B", mb: 1, pl: 0 }}>Back to Task List</Button>
        <Breadcrumbs sx={{ mb: 2, fontSize: "0.8rem" }}>
          <Link component={RouterLink} to="/dashboard" underline="hover" color="#94A3B8" sx={{ fontSize: "0.8rem" }}>Home</Link>
          <Link component={RouterLink} to="/dashboard/tasks" underline="hover" color="#64748B" sx={{ fontSize: "0.8rem" }}>Tasks</Link>
          <Typography color="#2563EB" sx={{ fontSize: "0.8rem", fontWeight: 600 }}>{titles[mode]}</Typography>
        </Breadcrumbs>
        {mode === "approve" && <ApproveView navigate={navigate} />}
        {mode === "review" && <CompletedReviewView navigate={navigate} />}
        {mode === "sendback" && <SendBackView navigate={navigate} />}
        {mode === "close" && <CloseView navigate={navigate} />}
      </Box>
    </Layout>
  );
}
