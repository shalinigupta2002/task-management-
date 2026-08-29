import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
  Link,
} from "@mui/material";

const tasks = [
  {
    id: 1,
    task: "Monthly Compliance Report",
    dueDate: "30 May 2025",
    priority: "High",
    status: "Open",
  },
  {
    id: 2,
    task: "IT Asset Verification",
    dueDate: "28 May 2025",
    priority: "Medium",
    status: "In Progress",
  },
  {
    id: 3,
    task: "Employee Onboarding Docs",
    dueDate: "25 May 2025",
    priority: "High",
    status: "Review",
  },
  {
    id: 4,
    task: "Quarterly Budget Review",
    dueDate: "20 May 2025",
    priority: "Medium",
    status: "Overdue",
  },
  {
    id: 5,
    task: "Security Audit Checklist",
    dueDate: "15 Jun 2025",
    priority: "High",
    status: "Open",
  },
];

const priorityConfig = {
  High: { color: "#EF4444", label: "High" },
  Medium: { color: "#F97316", label: "Medium" },
  Low: { color: "#22C55E", label: "Low" },
};

const statusConfig = {
  Open: { bg: "#EFF6FF", color: "#2563EB", label: "Open" },
  "In Progress": { bg: "#F0FDF4", color: "#16A34A", label: "In Progress" },
  Review: { bg: "#F5F3FF", color: "#7C3AED", label: "Review" },
  Overdue: { bg: "#DC2626", color: "#FFFFFF", label: "Overdue" },
};

function PriorityDot({ priority }) {
  const config = priorityConfig[priority];
  return (
    <Box display="flex" alignItems="center" gap={1}>
      <Box
        sx={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          bgcolor: config.color,
        }}
      />
      <Typography variant="body2" sx={{ color: "#334155", fontSize: "0.875rem" }}>
        {config.label}
      </Typography>
    </Box>
  );
}

function StatusBadge({ status }) {
  const config = statusConfig[status];
  return (
    <Box
      component="span"
      sx={{
        display: "inline-block",
        px: 1.5,
        py: 0.4,
        borderRadius: 5,
        bgcolor: config.bg,
        color: config.color,
        fontSize: "0.78rem",
        fontWeight: 600,
      }}
    >
      {config.label}
    </Box>
  );
}

function RecentTasks({ employeeMode = false }) {
  const navigate = useNavigate();
  const tasksPath = employeeMode ? "/employee/tasks" : "/dashboard/tasks";

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 3,
        boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
        height: "100%",
      }}
    >
      <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: "#0F172A", fontSize: "1.05rem" }}>
            My Tasks
          </Typography>
          <Link
            component="button"
            onClick={() => navigate(tasksPath)}
            sx={{
              fontSize: "0.875rem",
              fontWeight: 600,
              color: "#2563EB",
              textDecoration: "none",
              cursor: "pointer",
              "&:hover": { textDecoration: "underline" },
            }}
          >
            View All
          </Link>
        </Box>

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                {["Task", "Due Date", "Priority", "Status"].map((col) => (
                  <TableCell
                    key={col}
                    sx={{
                      fontWeight: 600,
                      color: "#64748B",
                      fontSize: "0.8rem",
                      borderBottom: "1px solid #F1F5F9",
                      py: 1,
                    }}
                  >
                    {col}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {tasks.map((task) => (
                <TableRow
                  key={task.id}
                  sx={{
                    "&:hover": { bgcolor: "#F8FAFC" },
                    "& td": { borderBottom: "1px solid #F1F5F9", py: 1.5 },
                  }}
                >
                  <TableCell sx={{ color: "#0F172A", fontWeight: 500, fontSize: "0.875rem" }}>
                    {task.task}
                  </TableCell>
                  <TableCell sx={{ color: "#64748B", fontSize: "0.875rem" }}>
                    {task.dueDate}
                  </TableCell>
                  <TableCell>
                    <PriorityDot priority={task.priority} />
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={task.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
}

export default RecentTasks;
