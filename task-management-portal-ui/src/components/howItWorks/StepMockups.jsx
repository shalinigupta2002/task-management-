import { Box, Typography, Button, LinearProgress, MenuItem, TextField, Avatar } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

const PRIMARY = "#0056D2";

const card = {
  bgcolor: "#FFFFFF",
  borderRadius: "12px",
  border: "1px solid #E8EDF5",
  boxShadow: "0 4px 16px rgba(15,23,42,0.05)",
  p: { xs: 1.75, md: 2 },
  height: "100%",
};

function Label({ children }) {
  return (
    <Typography sx={{ fontSize: "0.72rem", fontWeight: 600, color: "#64748B", mb: 0.5 }}>
      {children}
    </Typography>
  );
}

function InputBox({ children, sx }) {
  return (
    <Box sx={{
      bgcolor: "#F8FAFC",
      border: "1px solid #E2E8F0",
      borderRadius: "10px",
      px: 1.25,
      py: 0.75,
      fontSize: "0.78rem",
      color: "#334155",
      ...sx,
    }}>
      {children}
    </Box>
  );
}

export function CreateTaskMockup() {
  return (
    <Box sx={card}>
      <Typography sx={{ fontWeight: 700, fontSize: "0.9rem", color: "#0F172A", mb: 1.25 }}>
        Create New Task
      </Typography>

      <Box sx={{ mb: 1 }}>
        <Label>Task Title</Label>
        <InputBox>Monthly Compliance Report</InputBox>
      </Box>

      <Box display="grid" gridTemplateColumns="1fr 1fr" gap={1.25} sx={{ mb: 1 }}>
        <Box>
          <Label>Category</Label>
          <InputBox>Compliance</InputBox>
        </Box>
        <Box>
          <Label>Frequency</Label>
          <InputBox>Monthly</InputBox>
        </Box>
        <Box>
          <Label>Priority</Label>
          <InputBox sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
            <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "#EF4444" }} />
            High
          </InputBox>
        </Box>
        <Box>
          <Label>Due Date</Label>
          <InputBox sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            31 May 2025
            <CalendarTodayOutlinedIcon sx={{ fontSize: 14, color: "#94A3B8" }} />
          </InputBox>
        </Box>
      </Box>

      <Box sx={{ mb: 1.25 }}>
        <Label>Description</Label>
        <InputBox sx={{ minHeight: 56, lineHeight: 1.5 }}>
          Complete all regulatory compliance checks and submit the monthly report to the compliance team.
        </InputBox>
      </Box>

      <Box display="flex" justifyContent="flex-end">
        <Button
          variant="contained"
          sx={{
            textTransform: "none",
            bgcolor: PRIMARY,
            fontSize: "0.78rem",
            fontWeight: 700,
            borderRadius: "10px",
            px: 2.5,
            py: 0.75,
            boxShadow: "none",
            "&:hover": { bgcolor: "#004BB5", boxShadow: "none" },
          }}
        >
          Save
        </Button>
      </Box>
    </Box>
  );
}

export function AssignTaskMockup() {
  return (
    <Box sx={card}>
      <Typography sx={{ fontWeight: 700, fontSize: "0.9rem", color: "#0F172A", mb: 1.25 }}>
        Assign Task
      </Typography>

      <Box sx={{ mb: 1 }}>
        <Label>Assign To</Label>
        <InputBox sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Avatar sx={{ width: 24, height: 24, fontSize: "0.6rem", bgcolor: "#7C3AED" }}>AS</Avatar>
          Anita Sharma
          <KeyboardArrowDownIcon sx={{ ml: "auto", fontSize: 18, color: "#94A3B8" }} />
        </InputBox>
      </Box>

      <Box display="grid" gridTemplateColumns="1fr 1fr" gap={1.25} sx={{ mb: 1 }}>
        <Box>
          <Label>Due Date</Label>
          <InputBox sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            31 May 2025
            <CalendarTodayOutlinedIcon sx={{ fontSize: 14, color: "#94A3B8" }} />
          </InputBox>
        </Box>
        <Box>
          <Label>Priority</Label>
          <InputBox sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
            <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "#EF4444" }} />
            High
            <KeyboardArrowDownIcon sx={{ ml: "auto", fontSize: 18, color: "#94A3B8" }} />
          </InputBox>
        </Box>
      </Box>

      <Box sx={{ mb: 1.25 }}>
        <Label>Notes (Optional)</Label>
        <InputBox sx={{ minHeight: 48, color: "#94A3B8" }}>
          Add any instructions or context for the assignee...
        </InputBox>
      </Box>

      <Box display="flex" justifyContent="flex-end">
        <Button
          variant="contained"
          sx={{
            textTransform: "none",
            bgcolor: "#22C55E",
            fontSize: "0.78rem",
            fontWeight: 700,
            borderRadius: "10px",
            px: 2.5,
            py: 0.75,
            boxShadow: "none",
            "&:hover": { bgcolor: "#16A34A", boxShadow: "none" },
          }}
        >
          Assign
        </Button>
      </Box>
    </Box>
  );
}

export function ApprovalMockup() {
  const nodes = ["Submitted", "Manager", "Head", "Final Approver", "Approved"];

  return (
    <Box sx={card}>
      <Typography sx={{ fontWeight: 700, fontSize: "0.9rem", color: "#0F172A", mb: 1.25 }}>
        Approval Workflow
      </Typography>

      <Box display="flex" alignItems="flex-start" mb={1.25}>
        {nodes.map((n, i) => (
          <Box key={n} display="flex" alignItems="center" sx={{ flex: i === nodes.length - 1 ? "0 0 auto" : 1, minWidth: 0 }}>
            <Box textAlign="center" sx={{ minWidth: 52 }}>
              <Box sx={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                bgcolor: i === 0 ? "#22C55E" : i === 1 ? PRIMARY : "#E2E8F0",
                color: i <= 1 ? "#FFF" : "#94A3B8",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mx: "auto",
                fontSize: i === 0 ? "0.75rem" : "0.65rem",
                fontWeight: 700,
              }}>
                {i === 0 ? <CheckIcon sx={{ fontSize: 14 }} /> : i + 1}
              </Box>
              <Typography sx={{ fontSize: "0.58rem", color: "#64748B", mt: 0.5, lineHeight: 1.2, px: 0.25 }}>
                {n}
              </Typography>
            </Box>
            {i < nodes.length - 1 && (
              <Box sx={{ flex: 1, height: 2, bgcolor: i === 0 ? PRIMARY : "#E2E8F0", mx: 0.25, mt: -1.8 }} />
            )}
          </Box>
        ))}
      </Box>

      <Box sx={{ bgcolor: "#F8FAFC", borderRadius: "10px", border: "1px solid #E2E8F0", p: 1, mb: 1 }}>
        <Typography sx={{ fontSize: "0.68rem", fontWeight: 600, color: "#64748B", mb: 0.75 }}>
          Current Approver
        </Typography>
        <Box display="flex" alignItems="center" gap={1}>
          <Avatar sx={{ width: 28, height: 28, fontSize: "0.65rem", bgcolor: PRIMARY }}>RV</Avatar>
          <Box>
            <Typography sx={{ fontSize: "0.78rem", fontWeight: 700, color: "#0F172A", lineHeight: 1.2 }}>
              Rahul Verma
            </Typography>
            <Typography sx={{ fontSize: "0.68rem", color: "#94A3B8" }}>Manager</Typography>
          </Box>
        </Box>
      </Box>

      <Box display="flex" gap={1}>
        <Button
          variant="outlined"
          sx={{
            textTransform: "none",
            fontSize: "0.75rem",
            fontWeight: 600,
            flex: 1,
            borderRadius: "10px",
            borderColor: "#22C55E",
            color: "#16A34A",
            bgcolor: "#F0FDF4",
            "&:hover": { bgcolor: "#DCFCE7", borderColor: "#22C55E" },
          }}
        >
          Approve
        </Button>
        <Button
          variant="outlined"
          sx={{
            textTransform: "none",
            fontSize: "0.75rem",
            fontWeight: 600,
            flex: 1,
            borderRadius: "10px",
            borderColor: "#FCA5A5",
            color: "#DC2626",
            bgcolor: "#FEF2F2",
            "&:hover": { bgcolor: "#FEE2E2", borderColor: "#FCA5A5" },
          }}
        >
          Reject
        </Button>
      </Box>
    </Box>
  );
}

export function ExecuteMockup() {
  return (
    <Box sx={card}>
      <Typography sx={{ fontWeight: 700, fontSize: "0.9rem", color: "#0F172A", mb: 1.25 }}>
        Task Progress
      </Typography>

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.75}>
        <Typography sx={{ fontSize: "0.72rem", fontWeight: 600, color: "#64748B" }}>Progress</Typography>
        <Typography sx={{ fontSize: "0.78rem", fontWeight: 800, color: "#22C55E" }}>65%</Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={65}
        sx={{
          height: 10,
          borderRadius: 999,
          mb: 1.25,
          bgcolor: "#F1F5F9",
          "& .MuiLinearProgress-bar": { bgcolor: "#22C55E", borderRadius: 999 },
        }}
      />

      <Box sx={{ mb: 1 }}>
        <Label>Update</Label>
        <InputBox>Data collection completed.</InputBox>
      </Box>

      <Box>
        <Label>Attachments</Label>
        <Box sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          bgcolor: "#F8FAFC",
          border: "1px solid #E2E8F0",
          borderRadius: "10px",
          px: 1.25,
          py: 1,
        }}>
          <InsertDriveFileOutlinedIcon sx={{ fontSize: 20, color: PRIMARY }} />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontSize: "0.75rem", fontWeight: 600, color: "#334155", lineHeight: 1.2 }}>
              Compliance_Data_May.xlsx
            </Typography>
            <Typography sx={{ fontSize: "0.65rem", color: "#94A3B8" }}>2.4 MB</Typography>
          </Box>
          <Box sx={{
            width: 30,
            height: 30,
            borderRadius: "8px",
            bgcolor: "#EFF6FF",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            <DownloadOutlinedIcon sx={{ fontSize: 16, color: PRIMARY }} />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export function ReviewMockup() {
  return (
    <Box sx={card}>
      <Typography sx={{ fontWeight: 700, fontSize: "0.9rem", color: "#0F172A", mb: 1.25 }}>
        Review & Close
      </Typography>

      <Box sx={{ mb: 1 }}>
        <Label>Review Comments</Label>
        <InputBox sx={{ minHeight: 56, lineHeight: 1.5 }}>
          Well done! All requirements are met.
        </InputBox>
      </Box>

      <Box sx={{ mb: 1.25 }}>
        <Label>Decision</Label>
        <TextField
          select
          size="small"
          fullWidth
          defaultValue="approve"
          sx={{
            "& .MuiOutlinedInput-root": {
              fontSize: "0.78rem",
              borderRadius: "10px",
              bgcolor: "#F8FAFC",
            },
          }}
        >
          <MenuItem value="approve">Approve & Close</MenuItem>
          <MenuItem value="reopen">Re-open Task</MenuItem>
        </TextField>
      </Box>

      <Box display="flex" justifyContent="flex-end">
        <Button
          variant="contained"
          sx={{
            textTransform: "none",
            bgcolor: "#14B8A6",
            fontSize: "0.78rem",
            fontWeight: 700,
            borderRadius: "10px",
            px: 2.5,
            py: 0.75,
            boxShadow: "none",
            "&:hover": { bgcolor: "#0D9488", boxShadow: "none" },
          }}
        >
          Close Task
        </Button>
      </Box>
    </Box>
  );
}

const MOCKUPS = {
  create: CreateTaskMockup,
  assign: AssignTaskMockup,
  approve: ApprovalMockup,
  execute: ExecuteMockup,
  review: ReviewMockup,
};

export default function StepMockup({ type }) {
  const Comp = MOCKUPS[type];
  return Comp ? <Comp /> : null;
}
