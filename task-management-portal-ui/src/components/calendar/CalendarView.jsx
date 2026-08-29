import { useState, useMemo, useEffect } from "react";
import { useNavigate, useLocation, Link as RouterLink } from "react-router-dom";
import {
  Box, Typography, Grid, Button, IconButton, Chip, Select, MenuItem, FormControl,
  ToggleButton, ToggleButtonGroup, Breadcrumbs, Link,
} from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import AddIcon from "@mui/icons-material/Add";
import ListAltIcon from "@mui/icons-material/ListAlt";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const card = { borderRadius: 3, bgcolor: "#FFFFFF", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", border: "1px solid #E8EDF5" };
const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const MONTH_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const STATUS_STYLE = {
  Completed: { bg: "#F0FDF4", border: "#BBF7D0", pill: "#DCFCE7", pillText: "#16A34A" },
  "In Progress": { bg: "#EFF6FF", border: "#BFDBFE", pill: "#DBEAFE", pillText: "#2563EB" },
  Open: { bg: "#FFF7ED", border: "#FED7AA", pill: "#FFEDD5", pillText: "#EA580C" },
  Overdue: { bg: "#DC2626", border: "#B91C1C", pill: "#DC2626", pillText: "#FFFFFF" },
};

const DAILY_TASKS = [
  { id: 1, title: "Morning Standup Meeting", category: "Operations", start: 7, end: 8, status: "Completed" },
  { id: 2, title: "Compliance Report Review", category: "Compliance", start: 9, end: 10, status: "In Progress" },
  { id: 3, title: "HR Policy Update", category: "Human Resources", start: 10, end: 11, status: "Open" },
  { id: 4, title: "Budget Planning Session", category: "Finance", start: 11, end: 12, status: "Open" },
  { id: 5, title: "Server Maintenance", category: "Information Technology", start: 13, end: 14, status: "Overdue" },
  { id: 6, title: "Client Follow-up Call", category: "Customer Support", start: 14, end: 15, status: "Open" },
  { id: 7, title: "Marketing Campaign Review", category: "Marketing", start: 15, end: 16, status: "In Progress" },
  { id: 8, title: "Legal Document Review", category: "Legal", start: 16, end: 17, status: "Open" },
  { id: 9, title: "End of Day Report", category: "Operations", start: 17, end: 18, status: "Open" },
];

const TASK_SUMMARY = [
  { label: "Open", count: 8, color: "#F97316" },
  { label: "In Progress", count: 3, color: "#2563EB" },
  { label: "Completed", count: 5, color: "#16A34A" },
  { label: "Overdue", count: 2, color: "#EF4444" },
  { label: "Closed", count: 1, color: "#64748B" },
];

const PRIORITY_DATA = [
  { name: "High", value: 3, color: "#EF4444" },
  { name: "Medium", value: 8, color: "#F97316" },
  { name: "Low", value: 8, color: "#16A34A" },
];

const HOURS = Array.from({ length: 14 }, (_, i) => i + 7);

function formatHour(h) {
  if (h === 0 || h === 24) return "12:00 AM";
  if (h === 12) return "12:00 PM";
  if (h < 12) return `${String(h).padStart(2, "0")}:00 AM`;
  return `${String(h - 12).padStart(2, "0")}:00 PM`;
}

function formatHourRange(start, end) {
  return `${formatHour(start)} - ${formatHour(end)}`;
}

function StatusPill({ status }) {
  const s = STATUS_STYLE[status] || STATUS_STYLE.Open;
  return (
    <Chip label={status} size="small" sx={{
      height: 24, fontSize: "0.72rem", fontWeight: 600,
      bgcolor: s.pill, color: s.pillText, border: "none",
    }} />
  );
}

function TaskCard({ task }) {
  const s = STATUS_STYLE[task.status] || STATUS_STYLE.Open;
  const Icon = task.status === "Completed" ? AssignmentOutlinedIcon : DescriptionOutlinedIcon;
  return (
    <Box sx={{
      display: "flex", alignItems: "center", gap: 1.5, px: 1.5, py: 1,
      bgcolor: s.bg, border: `1px solid ${s.border}`, borderLeft: `4px solid ${s.pillText}`,
      borderRadius: 2, width: "100%",
    }}>
      <Box sx={{ width: 36, height: 36, borderRadius: 1.5, bgcolor: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Icon sx={{ fontSize: 18, color: s.pillText }} />
      </Box>
      <Box flex={1} minWidth={0}>
        <Typography sx={{ fontWeight: 700, color: "#0F172A", fontSize: "0.875rem", lineHeight: 1.3 }}>{task.title}</Typography>
        <Typography sx={{ color: "#64748B", fontSize: "0.75rem" }}>{task.category} · {formatHourRange(task.start, task.end)}</Typography>
      </Box>
      <StatusPill status={task.status} />
    </Box>
  );
}

function MiniCalendar({ date, onSelect }) {
  const y = date.getFullYear(), m = date.getMonth();
  const start = (new Date(y, m, 1).getDay() + 6) % 7;
  const dim = new Date(y, m + 1, 0).getDate();
  const today = new Date();

  return (
    <Box sx={{ ...card, p: 2 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
        <Typography sx={{ fontWeight: 700, color: "#0F172A", fontSize: "0.9rem" }}>{MONTHS[m]} {y}</Typography>
        <Box display="flex" gap={0.3}>
          <IconButton size="small" onClick={() => onSelect(new Date(y, m - 1, date.getDate()))}><ChevronLeftIcon sx={{ fontSize: 18 }} /></IconButton>
          <IconButton size="small" onClick={() => onSelect(new Date(y, m + 1, date.getDate()))}><ChevronRightIcon sx={{ fontSize: 18 }} /></IconButton>
        </Box>
      </Box>
      <Box display="grid" gridTemplateColumns="repeat(7, 1fr)" gap={0.5} mb={0.5}>
        {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((d) => (
          <Typography key={d} align="center" sx={{ fontSize: "0.65rem", fontWeight: 600, color: "#94A3B8" }}>{d}</Typography>
        ))}
      </Box>
      <Box display="grid" gridTemplateColumns="repeat(7, 1fr)" gap={0.5}>
        {Array.from({ length: start + dim }, (_, i) => {
          const day = i - start + 1;
          if (day < 1 || day > dim) return <Box key={i} />;
          const isSelected = day === date.getDate();
          const isToday = day === today.getDate() && m === today.getMonth() && y === today.getFullYear();
          return (
            <Box key={i} onClick={() => onSelect(new Date(y, m, day))} sx={{
              width: 28, height: 28, mx: "auto", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", fontSize: "0.75rem", fontWeight: isSelected ? 700 : 500,
              bgcolor: isSelected ? "#2563EB" : "transparent",
              color: isSelected ? "#FFF" : isToday ? "#2563EB" : "#334155",
              border: isToday && !isSelected ? "1px solid #2563EB" : "none",
              "&:hover": { bgcolor: isSelected ? "#2563EB" : "#F1F5F9" },
            }}>{day}</Box>
          );
        })}
      </Box>
    </Box>
  );
}

function TaskSummaryPanel() {
  return (
    <Box sx={{ ...card, p: 2, mb: 2 }}>
      <Typography sx={{ fontWeight: 700, color: "#0F172A", fontSize: "0.9rem", mb: 1.5 }}>My Tasks Summary</Typography>
      {TASK_SUMMARY.map((item) => (
        <Box key={item.label} display="flex" justifyContent="space-between" alignItems="center" mb={1}>
          <Box display="flex" alignItems="center" gap={1}>
            <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: item.color }} />
            <Typography sx={{ fontSize: "0.82rem", color: "#334155" }}>{item.label}</Typography>
          </Box>
          <Typography sx={{ fontWeight: 700, fontSize: "0.82rem", color: "#0F172A" }}>{item.count}</Typography>
        </Box>
      ))}
      <Box sx={{ mt: 1.5, pt: 1.5, borderTop: "1px solid #E8EDF5", display: "flex", justifyContent: "space-between" }}>
        <Typography sx={{ fontWeight: 600, color: "#64748B", fontSize: "0.82rem" }}>Total Tasks</Typography>
        <Typography sx={{ fontWeight: 800, color: "#2563EB", fontSize: "0.9rem" }}>19</Typography>
      </Box>
    </Box>
  );
}

function PriorityChart() {
  return (
    <Box sx={{ ...card, p: 2, mb: 2 }}>
      <Typography sx={{ fontWeight: 700, color: "#0F172A", fontSize: "0.9rem", mb: 1 }}>Priority Summary</Typography>
      <Box sx={{ height: 160 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={PRIORITY_DATA} cx="50%" cy="50%" innerRadius={45} outerRadius={65} paddingAngle={3} dataKey="value">
              {PRIORITY_DATA.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </Box>
      <Box display="flex" flexDirection="column" gap={0.8}>
        {PRIORITY_DATA.map((p) => (
          <Box key={p.name} display="flex" justifyContent="space-between" alignItems="center">
            <Box display="flex" alignItems="center" gap={1}>
              <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: p.color }} />
              <Typography sx={{ fontSize: "0.78rem", color: "#64748B" }}>{p.name}</Typography>
            </Box>
            <Typography sx={{ fontWeight: 700, fontSize: "0.78rem", color: "#0F172A" }}>{p.value}</Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

function QuickActions({ navigate }) {
  const actions = [
    { label: "Create New Task", icon: AddIcon, path: "/dashboard/tasks/add" },
    { label: "My Assigned Tasks", icon: ListAltIcon, path: "/dashboard/tasks/assigned" },
    { label: "View Monthly Calendar", icon: CalendarMonthOutlinedIcon, path: "/dashboard/calendar/monthly" },
  ];
  return (
    <Box sx={{ ...card, p: 2 }}>
      <Typography sx={{ fontWeight: 700, color: "#0F172A", fontSize: "0.9rem", mb: 1.5 }}>Quick Actions</Typography>
      {actions.map((a) => {
        const Icon = a.icon;
        return (
          <Button key={a.label} fullWidth variant="outlined" startIcon={<Icon sx={{ fontSize: 18 }} />}
            onClick={() => navigate(a.path)}
            sx={{
              justifyContent: "flex-start", textTransform: "none", mb: 1, borderColor: "#E2E8F0",
              color: "#334155", fontWeight: 600, fontSize: "0.82rem", borderRadius: 2, py: 1,
              "&:hover": { borderColor: "#2563EB", bgcolor: "#F8FAFF", color: "#2563EB" },
            }}>{a.label}</Button>
        );
      })}
    </Box>
  );
}

function formatTime(h, m = 0) {
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 || 12;
  return `${String(hour12).padStart(2, "0")}:${String(m).padStart(2, "0")} ${period}`;
}

function DailyTimeline({ tasks, currentHour, currentMinute, showNowLine }) {
  const tasksByHour = useMemo(() => {
    const map = {};
    HOURS.forEach((h) => { map[h] = []; });
    tasks.forEach((t) => { if (map[t.start]) map[t.start].push(t); });
    return map;
  }, [tasks]);

  const nowMinutes = currentHour * 60 + currentMinute;
  const startMinutes = 7 * 60;
  const endMinutes = 21 * 60;
  const nowTop = showNowLine ? ((nowMinutes - startMinutes) / (endMinutes - startMinutes)) * (HOURS.length * 64) : 0;

  return (
    <Box sx={{ ...card, overflow: "hidden", position: "relative" }}>
      <Box display="grid" gridTemplateColumns="100px 1fr" sx={{ bgcolor: "#F8FAFC", borderBottom: "1px solid #E8EDF5" }}>
        <Box sx={{ px: 2, py: 1.5 }}><Typography sx={{ fontWeight: 700, color: "#64748B", fontSize: "0.75rem", textTransform: "uppercase" }}>Time</Typography></Box>
        <Box sx={{ px: 2, py: 1.5 }}><Typography sx={{ fontWeight: 700, color: "#64748B", fontSize: "0.75rem", textTransform: "uppercase" }}>Tasks</Typography></Box>
      </Box>

      <Box sx={{ position: "relative" }}>
        {showNowLine && (
          <Box sx={{ position: "absolute", left: 0, right: 0, top: nowTop, zIndex: 2, display: "flex", alignItems: "center", pointerEvents: "none" }}>
            <Box sx={{ width: 100, pr: 1, display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 0.5 }}>
              <Typography sx={{ fontSize: "0.7rem", fontWeight: 700, color: "#EF4444" }}>
                {formatTime(currentHour, currentMinute)}
              </Typography>
            </Box>
            <Box flex={1} display="flex" alignItems="center">
              <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "#EF4444", flexShrink: 0 }} />
              <Box sx={{ flex: 1, height: 2, bgcolor: "#EF4444" }} />
            </Box>
          </Box>
        )}

        {HOURS.map((hour) => (
          <Box key={hour} display="grid" gridTemplateColumns="100px 1fr" sx={{ minHeight: 64, borderBottom: "1px solid #F1F5F9" }}>
            <Box sx={{ px: 2, py: 1.5, borderRight: "1px solid #F1F5F9" }}>
              <Typography sx={{ fontSize: "0.8rem", fontWeight: 500, color: "#64748B" }}>{formatHour(hour)}</Typography>
            </Box>
            <Box sx={{ px: 2, py: 1, display: "flex", flexDirection: "column", gap: 1, justifyContent: "center" }}>
              {tasksByHour[hour]?.length
                ? tasksByHour[hour].map((task) => <TaskCard key={task.id} task={task} />)
                : <Box sx={{ height: 8 }} />}
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

function MonthGridView({ date, onDateChange }) {
  const y = date.getFullYear(), m = date.getMonth();
  const start = (new Date(y, m, 1).getDay() + 6) % 7;
  const dim = new Date(y, m + 1, 0).getDate();
  const slots = Math.ceil((start + dim) / 7) * 7;

  return (
    <Box sx={{ ...card, overflow: "hidden" }}>
      <Box display="grid" gridTemplateColumns="repeat(7, 1fr)" sx={{ bgcolor: "#F8FAFC", borderBottom: "1px solid #E8EDF5" }}>
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
          <Box key={d} sx={{ py: 1.5, textAlign: "center" }}>
            <Typography sx={{ fontWeight: 700, color: "#64748B", fontSize: "0.75rem" }}>{d}</Typography>
          </Box>
        ))}
      </Box>
      <Box display="grid" gridTemplateColumns="repeat(7, 1fr)">
        {Array.from({ length: slots }).map((_, i) => {
          const day = i - start + 1;
          const valid = day > 0 && day <= dim;
          const isSelected = valid && day === date.getDate();
          return (
            <Box key={i} onClick={() => valid && onDateChange(new Date(y, m, day))} sx={{
              minHeight: 90, p: 1, borderRight: "1px solid #F1F5F9", borderBottom: "1px solid #F1F5F9",
              bgcolor: valid ? "#FFF" : "#FAFBFC", cursor: valid ? "pointer" : "default",
              "&:hover": valid ? { bgcolor: "#F8FAFF" } : {},
            }}>
              {valid && (
                <Box sx={{
                  width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                  fontWeight: isSelected ? 700 : 500, fontSize: "0.82rem",
                  bgcolor: isSelected ? "#2563EB" : "transparent", color: isSelected ? "#FFF" : "#334155",
                }}>{day}</Box>
              )}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}

export default function CalendarView() {
  const navigate = useNavigate();
  const location = useLocation();
  const [date, setDate] = useState(new Date(2024, 4, 20));
  const [view, setView] = useState("day");
  const [taskFilter, setTaskFilter] = useState("all");
  const now = new Date();

  const pathView = location.pathname.includes("/monthly") ? "month"
    : location.pathname.includes("/yearly") ? "year" : null;

  useEffect(() => {
    if (pathView) setView(pathView);
    else if (view === "month" || view === "year") setView("day");
  }, [location.pathname, pathView]);

  const activeView = pathView || view;
  const isToday = date.toDateString() === now.toDateString();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const showNowLine = isToday && nowMinutes >= 7 * 60 && nowMinutes <= 21 * 60;

  const breadcrumbLabel = activeView === "month" ? "Monthly View"
    : activeView === "year" ? "Yearly View" : "Daily View";

  const dateLabel = `${date.getDate()} ${MONTH_SHORT[date.getMonth()]} ${date.getFullYear()}, ${DAYS[date.getDay()]}`;

  const shiftDate = (days) => {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    setDate(d);
  };

  return (
    <Box sx={{ pb: 3 }}>
      <Box display="flex" flexWrap="wrap" justifyContent="space-between" alignItems="flex-start" gap={2} mb={2}>
        <Box>
          <Typography sx={{ fontWeight: 800, color: "#0F172A", fontSize: "1.5rem" }}>
            Calendar — {activeView === "day" ? "Daily View" : activeView === "month" ? "Monthly View" : "Yearly View"}
          </Typography>
          <Breadcrumbs sx={{ mt: 0.5, fontSize: "0.8rem" }}>
            <Link component={RouterLink} to="/dashboard" underline="hover" color="#94A3B8" sx={{ fontSize: "0.8rem" }}>Home</Link>
            <Typography color="#64748B" sx={{ fontSize: "0.8rem" }}>Calendar</Typography>
            <Typography color="#2563EB" sx={{ fontSize: "0.8rem", fontWeight: 600 }}>{breadcrumbLabel}</Typography>
          </Breadcrumbs>
        </Box>
      </Box>

      <Grid container spacing={2.5}>
        <Grid item xs={12} lg={9}>
          <Box sx={{ ...card, p: 1.5, mb: 2, display: "flex", flexWrap: "wrap", gap: 1.5, alignItems: "center", justifyContent: "space-between" }}>
            <Box display="flex" flexWrap="wrap" gap={1} alignItems="center">
              <Button variant="outlined" onClick={() => setDate(new Date())} sx={{ textTransform: "none", borderColor: "#E2E8F0", color: "#334155", fontWeight: 600, borderRadius: 2, fontSize: "0.85rem" }}>Today</Button>
              <IconButton size="small" onClick={() => shiftDate(activeView === "month" ? -30 : -1)} sx={{ border: "1px solid #E2E8F0", borderRadius: 2 }}><ChevronLeftIcon /></IconButton>
              <IconButton size="small" onClick={() => shiftDate(activeView === "month" ? 30 : 1)} sx={{ border: "1px solid #E2E8F0", borderRadius: 2 }}><ChevronRightIcon /></IconButton>
              <Typography sx={{ fontWeight: 700, color: "#0F172A", fontSize: "0.95rem", ml: 0.5 }}>{dateLabel}</Typography>
            </Box>
            <Box display="flex" flexWrap="wrap" gap={1} alignItems="center">
              <ToggleButtonGroup exclusive size="small" value={activeView} onChange={(_, v) => {
                if (!v) return;
                setView(v);
                if (v === "day") navigate("/dashboard/calendar");
                else if (v === "month") navigate("/dashboard/calendar/monthly");
                else navigate("/dashboard/calendar/yearly");
              }} sx={{ "& .MuiToggleButton-root": { textTransform: "none", fontSize: "0.8rem", fontWeight: 600, px: 1.5, borderColor: "#E2E8F0", color: "#64748B", "&.Mui-selected": { bgcolor: "#2563EB", color: "#FFF", borderColor: "#2563EB" } } }}>
                <ToggleButton value="day">Day</ToggleButton>
                <ToggleButton value="week">Week</ToggleButton>
                <ToggleButton value="month">Month</ToggleButton>
                <ToggleButton value="year">Year</ToggleButton>
              </ToggleButtonGroup>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <Select value={taskFilter} onChange={(e) => setTaskFilter(e.target.value)} sx={{ borderRadius: 2, fontSize: "0.85rem", bgcolor: "#F8FAFC" }}>
                  <MenuItem value="all">All Tasks</MenuItem>
                  <MenuItem value="open">Open</MenuItem>
                  <MenuItem value="progress">In Progress</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                </Select>
              </FormControl>
              <IconButton size="small" sx={{ border: "1px solid #E2E8F0", borderRadius: 2 }}><MoreVertIcon sx={{ fontSize: 20, color: "#64748B" }} /></IconButton>
            </Box>
          </Box>

          {activeView === "day" && (
            <DailyTimeline tasks={DAILY_TASKS} currentHour={now.getHours()} currentMinute={now.getMinutes()} showNowLine={showNowLine} />
          )}
          {activeView === "month" && (
            <MonthGridView date={date} onDateChange={(d) => { setDate(d); navigate("/dashboard/calendar"); setView("day"); }} />
          )}
          {(activeView === "week" || activeView === "year") && (
            <Box sx={{ ...card, p: 4, textAlign: "center" }}>
              <CalendarMonthOutlinedIcon sx={{ fontSize: 48, color: "#CBD5E1", mb: 1 }} />
              <Typography sx={{ fontWeight: 700, color: "#334155", mb: 0.5 }}>{activeView === "week" ? "Week View" : "Year View"} coming soon</Typography>
              <Typography sx={{ color: "#94A3B8", fontSize: "0.85rem" }}>Switch to Day or Month view to browse tasks.</Typography>
            </Box>
          )}
        </Grid>

        <Grid item xs={12} lg={3}>
          <MiniCalendar date={date} onSelect={setDate} />
          <TaskSummaryPanel />
          <PriorityChart />
          <QuickActions navigate={navigate} />
        </Grid>
      </Grid>
    </Box>
  );
}
