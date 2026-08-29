import { Box, Typography, Button, Chip, Avatar } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import AddIcon from "@mui/icons-material/Add";

const cell = { px: 1, py: 0.6, fontSize: "0.65rem", color: "#334155", borderBottom: "1px solid #F1F5F9" };
const th = { ...cell, fontWeight: 700, color: "#64748B", bgcolor: "#F8FAFC" };

function TaskMasterMockup() {
  const rows = [
    { n: "Monthly Compliance", c: "Compliance", f: "Monthly", p: "High", s: "Open", sc: "#2563EB" },
    { n: "IT Asset Check", c: "Operations", f: "Weekly", p: "Medium", s: "In Progress", sc: "#16A34A" },
    { n: "Security Audit", c: "Security", f: "Quarterly", p: "High", s: "Review", sc: "#7C3AED" },
  ];
  return (
    <Box sx={{ bgcolor: "#FFF", borderRadius: 2, border: "1px solid #E8EDF5", overflow: "hidden" }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" px={1.5} py={1} sx={{ borderBottom: "1px solid #F1F5F9" }}>
        <Typography sx={{ fontWeight: 700, fontSize: "0.75rem", color: "#0F172A" }}>Task Master</Typography>
        <Button size="small" startIcon={<AddIcon sx={{ fontSize: 14 }} />} sx={{ textTransform: "none", fontSize: "0.65rem", bgcolor: "#2563EB", color: "#FFF", borderRadius: 1.5, py: 0.3, minHeight: 0 }}>Add Task</Button>
      </Box>
      <Box display="grid" gridTemplateColumns="2fr 1fr 1fr 0.8fr 0.8fr">
        {["Task Name", "Category", "Frequency", "Priority", "Status"].map((h) => (
          <Box key={h} sx={th}>{h}</Box>
        ))}
        {rows.flatMap((r) => [
          <Box key={`${r.n}-n`} sx={cell}>{r.n}</Box>,
          <Box key={`${r.n}-c`} sx={cell}>{r.c}</Box>,
          <Box key={`${r.n}-f`} sx={cell}>{r.f}</Box>,
          <Box key={`${r.n}-p`} sx={cell}><Chip label={r.p} size="small" sx={{ height: 18, fontSize: "0.55rem", bgcolor: r.p === "High" ? "#FEF2F2" : "#FFF7ED", color: r.p === "High" ? "#DC2626" : "#EA580C" }} /></Box>,
          <Box key={`${r.n}-s`} sx={cell}><Chip label={r.s} size="small" sx={{ height: 18, fontSize: "0.55rem", bgcolor: `${r.sc}18`, color: r.sc }} /></Box>,
        ])}
      </Box>
    </Box>
  );
}

function UsersMockup() {
  const users = [
    { n: "Rahul Verma", e: "rahul@company.com", d: "Engineering", r: "Employee" },
    { n: "Priya Sharma", e: "priya@company.com", d: "HR", r: "Admin" },
  ];
  return (
    <Box sx={{ bgcolor: "#FFF", borderRadius: 2, border: "1px solid #E8EDF5", overflow: "hidden" }}>
      <Box display="flex" justifyContent="space-between" px={1.5} py={1} sx={{ borderBottom: "1px solid #F1F5F9" }}>
        <Typography sx={{ fontWeight: 700, fontSize: "0.75rem" }}>Users</Typography>
        <Button size="small" sx={{ textTransform: "none", fontSize: "0.65rem", bgcolor: "#16A34A", color: "#FFF", borderRadius: 1.5, py: 0.3, minHeight: 0 }}>Add User</Button>
      </Box>
      {users.map((u) => (
        <Box key={u.n} display="flex" alignItems="center" gap={1} px={1.5} py={1} sx={{ borderBottom: "1px solid #F1F5F9" }}>
          <Avatar sx={{ width: 28, height: 28, fontSize: "0.7rem", bgcolor: "#2563EB" }}>{u.n[0]}</Avatar>
          <Box flex={1}>
            <Typography sx={{ fontSize: "0.7rem", fontWeight: 600, color: "#0F172A" }}>{u.n}</Typography>
            <Typography sx={{ fontSize: "0.6rem", color: "#94A3B8" }}>{u.e}</Typography>
          </Box>
          <Typography sx={{ fontSize: "0.6rem", color: "#64748B" }}>{u.d}</Typography>
          <Chip label="Active" size="small" sx={{ height: 18, fontSize: "0.55rem", bgcolor: "#F0FDF4", color: "#16A34A" }} />
        </Box>
      ))}
    </Box>
  );
}

function WorkflowMockup() {
  const steps = ["Draft", "Approval", "Open", "In Progress", "Review", "Closed"];
  const colors = ["#94A3B8", "#2563EB", "#16A34A", "#F97316", "#7C3AED", "#16A34A"];
  return (
    <Box sx={{ bgcolor: "#FFF", borderRadius: 2, border: "1px solid #E8EDF5", p: 1.5 }}>
      <Box display="flex" justifyContent="space-between" mb={1.5}>
        {steps.map((s, i) => (
          <Box key={s} textAlign="center" flex={1}>
            <Box sx={{ width: 24, height: 24, borderRadius: "50%", bgcolor: `${colors[i]}20`, color: colors[i], display: "flex", alignItems: "center", justifyContent: "center", mx: "auto", fontSize: "0.6rem", fontWeight: 700 }}>{i + 1}</Box>
            <Typography sx={{ fontSize: "0.5rem", color: "#64748B", mt: 0.3 }}>{s}</Typography>
          </Box>
        ))}
      </Box>
      <Box sx={{ bgcolor: "#F8FAFC", borderRadius: 1.5, p: 1.2, border: "1px solid #E8EDF5" }}>
        <Typography sx={{ fontSize: "0.65rem", fontWeight: 700, color: "#0F172A" }}>Current Status</Typography>
        <Typography sx={{ fontSize: "0.6rem", color: "#64748B" }}>Assigned to: Rahul Verma · Due: 30 May 2025</Typography>
      </Box>
    </Box>
  );
}

function ApprovalsMockup() {
  const items = ["Monthly Compliance Report", "IT Asset Verification"];
  return (
    <Box sx={{ bgcolor: "#FFF", borderRadius: 2, border: "1px solid #E8EDF5", overflow: "hidden" }}>
      <Box display="flex" gap={1} px={1.5} py={1} sx={{ borderBottom: "1px solid #F1F5F9" }}>
        {["Pending", "Approved", "Rejected"].map((t, i) => (
          <Chip key={t} label={t} size="small" sx={{ height: 22, fontSize: "0.6rem", fontWeight: 600, bgcolor: i === 0 ? "#FFF7ED" : "#F8FAFC", color: i === 0 ? "#EA580C" : "#64748B" }} />
        ))}
      </Box>
      {items.map((item) => (
        <Box key={item} display="flex" justifyContent="space-between" alignItems="center" px={1.5} py={1} sx={{ borderBottom: "1px solid #F1F5F9" }}>
          <Typography sx={{ fontSize: "0.7rem", fontWeight: 500, color: "#334155" }}>{item}</Typography>
          <Box display="flex" gap={0.5}>
            <Button size="small" sx={{ textTransform: "none", fontSize: "0.6rem", bgcolor: "#F0FDF4", color: "#16A34A", minHeight: 0, py: 0.3, px: 1 }}>Approve</Button>
            <Button size="small" sx={{ textTransform: "none", fontSize: "0.6rem", bgcolor: "#FEF2F2", color: "#DC2626", minHeight: 0, py: 0.3, px: 1 }}>Reject</Button>
          </Box>
        </Box>
      ))}
    </Box>
  );
}

function CalendarMockup() {
  const days = Array.from({ length: 28 }, (_, i) => i + 1);
  const marked = [5, 12, 18, 22];
  return (
    <Box sx={{ bgcolor: "#FFF", borderRadius: 2, border: "1px solid #E8EDF5", p: 1.5 }}>
      <Typography sx={{ fontWeight: 700, fontSize: "0.75rem", mb: 1 }}>May 2025</Typography>
      <Box display="grid" gridTemplateColumns="repeat(7,1fr)" gap={0.3}>
        {days.map((d) => (
          <Box key={d} sx={{ textAlign: "center", py: 0.5, borderRadius: 1, fontSize: "0.6rem", fontWeight: marked.includes(d) ? 700 : 400, bgcolor: d === 22 ? "#2563EB" : marked.includes(d) ? "#EFF6FF" : "transparent", color: d === 22 ? "#FFF" : "#334155" }}>{d}</Box>
        ))}
      </Box>
    </Box>
  );
}

function ReportsMockup() {
  const data = [{ l: "Open", c: "#2563EB", v: 32 }, { l: "In Progress", c: "#F97316", v: 24 }, { l: "Completed", c: "#16A34A", v: 45 }, { l: "Overdue", c: "#EF4444", v: 8 }];
  return (
    <Box sx={{ bgcolor: "#FFF", borderRadius: 2, border: "1px solid #E8EDF5", p: 1.5, display: "flex", gap: 2, alignItems: "center" }}>
      <Box sx={{ width: 80, height: 80, borderRadius: "50%", border: "8px solid #2563EB", borderTopColor: "#16A34A", borderRightColor: "#F97316", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Typography sx={{ fontWeight: 800, fontSize: "0.7rem", color: "#0F172A" }}>1,248</Typography>
      </Box>
      <Box flex={1}>
        <Typography sx={{ fontWeight: 700, fontSize: "0.75rem", mb: 0.8 }}>Tasks by Status</Typography>
        {data.map((d) => (
          <Box key={d.l} display="flex" alignItems="center" gap={0.8} mb={0.4}>
            <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: d.c }} />
            <Typography sx={{ fontSize: "0.6rem", color: "#64748B", flex: 1 }}>{d.l}</Typography>
            <Typography sx={{ fontSize: "0.6rem", fontWeight: 700, color: "#334155" }}>{d.v}%</Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

function NotificationsMockup() {
  const notes = [
    { t: "Rahul Verma completed task", time: "10 min ago" },
    { t: "New approval request received", time: "1 hour ago" },
    { t: "Task due tomorrow: Security Audit", time: "3 hours ago" },
  ];
  return (
    <Box sx={{ bgcolor: "#FFF", borderRadius: 2, border: "1px solid #E8EDF5", overflow: "hidden" }}>
      <Typography sx={{ fontWeight: 700, fontSize: "0.75rem", px: 1.5, py: 1, borderBottom: "1px solid #F1F5F9" }}>Notifications</Typography>
      {notes.map((n) => (
        <Box key={n.t} px={1.5} py={1} sx={{ borderBottom: "1px solid #F1F5F9" }}>
          <Typography sx={{ fontSize: "0.7rem", fontWeight: 500, color: "#334155" }}>{n.t}</Typography>
          <Typography sx={{ fontSize: "0.6rem", color: "#94A3B8" }}>{n.time}</Typography>
        </Box>
      ))}
    </Box>
  );
}

function SecurityMockup() {
  const roles = [
    { r: "Administrator", p: "Full system access" },
    { r: "Approver", p: "Approve & reject tasks" },
    { r: "Employee", p: "View & complete assigned tasks" },
  ];
  return (
    <Box sx={{ bgcolor: "#FFF", borderRadius: 2, border: "1px solid #E8EDF5", overflow: "hidden" }}>
      <Typography sx={{ fontWeight: 700, fontSize: "0.75rem", px: 1.5, py: 1, borderBottom: "1px solid #F1F5F9" }}>User Roles</Typography>
      {roles.map((row) => (
        <Box key={row.r} display="flex" px={1.5} py={0.8} sx={{ borderBottom: "1px solid #F1F5F9" }}>
          <Typography sx={{ fontSize: "0.7rem", fontWeight: 600, color: "#0F172A", width: "40%" }}>{row.r}</Typography>
          <Typography sx={{ fontSize: "0.65rem", color: "#64748B" }}>{row.p}</Typography>
        </Box>
      ))}
    </Box>
  );
}

const MAP = {
  taskMaster: TaskMasterMockup,
  users: UsersMockup,
  workflow: WorkflowMockup,
  approvals: ApprovalsMockup,
  calendar: CalendarMockup,
  reports: ReportsMockup,
  notifications: NotificationsMockup,
  security: SecurityMockup,
};

export default function FeatureMockup({ type }) {
  const Comp = MAP[type];
  return Comp ? <Comp /> : null;
}

export function BulletList({ items, color }) {
  return (
    <Box component="ul" sx={{ m: 0, pl: 0, listStyle: "none" }}>
      {items.map((b) => (
        <Box component="li" key={b} display="flex" alignItems="center" gap={1} mb={0.8}>
          <CheckIcon sx={{ color, fontSize: 16 }} />
          <Typography sx={{ fontSize: "0.78rem", color: "#475569", lineHeight: 1.4 }}>{b}</Typography>
        </Box>
      ))}
    </Box>
  );
}
