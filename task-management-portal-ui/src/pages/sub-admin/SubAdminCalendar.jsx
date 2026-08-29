import { useState, useEffect, useMemo } from "react";
import { Box, Typography, Chip, CircularProgress, Alert } from "@mui/material";
import SubAdminLayout from "../../components/layouts/SubAdminLayout";
import { PageHeader, card } from "../../components/main-admin/shared";
import CalendarEventBox from "../../components/calendar/CalendarEventBox";
import CalendarStatusLegend from "../../components/calendar/CalendarStatusLegend";
import CalendarSidebarPanels from "../../components/calendar/CalendarSidebarPanels";
import taskOccurrenceService from "../../services/taskOccurrenceService";
import { resolveCalendarVisualStatus } from "../../utils/calendarStatusUtils";
import { classifyCalendarSidebarTasks } from "../../utils/taskDueWindows";
import { getErrorMessage } from "../../utils/session";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function toDayKey(date) {
  const d = new Date(date);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function formatDueLabel(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export default function SubAdminCalendar() {
  const [view, setView] = useState("Month");
  const [current, setCurrent] = useState(() => new Date());
  const [occurrences, setOccurrences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const daysInMonth = new Date(current.getFullYear(), current.getMonth() + 1, 0).getDate();
  const startDay = new Date(current.getFullYear(), current.getMonth(), 1).getDay();
  const monthLabel = current.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
  const today = useMemo(() => new Date(), []);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        setError("");
        const from = new Date(current.getFullYear(), current.getMonth(), 1);
        const to = new Date(current.getFullYear(), current.getMonth() + 1, 0, 23, 59, 59);
        const data = await taskOccurrenceService.getCalendar({
          from: from.toISOString(),
          to: to.toISOString(),
        });
        if (!active) return;
        setOccurrences(Array.isArray(data) ? data : []);
      } catch (err) {
        if (active) {
          setError(getErrorMessage(err, "Failed to load calendar"));
          setOccurrences([]);
        }
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [current]);

  const eventsByDay = useMemo(() => {
    const map = {};
    occurrences.forEach((occ) => {
      const date = occ.occurrenceDate || occ.date;
      if (!date) return;
      const key = toDayKey(date);
      const title = occ.task?.title || occ.title || "Task";
      const status = occ.assignees?.[0]?.status || occ.status || "OPEN";
      const item = {
        id: occ.id,
        title,
        status,
        visualStatus: resolveCalendarVisualStatus({ status, dueDate: date }, today),
      };
      if (!map[key]) map[key] = [];
      map[key].push(item);
    });
    return map;
  }, [occurrences, today]);

  const sidebarSource = useMemo(
    () =>
      occurrences.flatMap((occ) => {
        const date = occ.occurrenceDate || occ.date;
        const assignees = occ.assignees?.length ? occ.assignees : [{ status: occ.status || "OPEN" }];
        return assignees.map((a, idx) => ({
          id: `${occ.id}-${a.assigneeId || idx}`,
          title: occ.task?.title || occ.title || "Task",
          status: a.status || occ.status || "OPEN",
          dueDate: date,
          occurrenceDate: date,
          dueDateLabel: formatDueLabel(date),
        }));
      }),
    [occurrences]
  );

  const { todayTasks, nearingDueTasks, completedTasks, overdueTasks } = useMemo(
    () => classifyCalendarSidebarTasks(sidebarSource, today),
    [sidebarSource, today]
  );

  const shiftMonth = (delta) => {
    setCurrent((d) => new Date(d.getFullYear(), d.getMonth() + delta, 1));
  };

  return (
    <SubAdminLayout>
      <Box sx={{ pb: 3 }}>
        <PageHeader title="Task Calendar" crumbs={[{ label: "Calendar" }]} homePath="/sub-admin/dashboard" />

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box display="flex" gap={1} mb={2} flexWrap="wrap" alignItems="center">
          {["Month", "Week", "Day"].map((v) => (
            <Chip
              key={v}
              label={v}
              onClick={() => setView(v)}
              sx={{
                bgcolor: view === v ? "#2563EB" : "#F8FAFC",
                color: view === v ? "#FFF" : "#64748B",
                fontWeight: 600,
                fontSize: "0.78rem",
                cursor: "pointer",
              }}
            />
          ))}
          <Chip label="Previous" onClick={() => shiftMonth(-1)} sx={{ ml: "auto", cursor: "pointer" }} />
          <Chip label={monthLabel} sx={{ fontWeight: 700 }} />
          <Chip label="Next" onClick={() => shiftMonth(1)} sx={{ cursor: "pointer" }} />
        </Box>

        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1fr 320px" }, gap: 2 }}>
          <Box sx={card}>
            {loading ? (
              <Box display="flex" justifyContent="center" py={6}>
                <CircularProgress />
              </Box>
            ) : (
              <>
                <Typography sx={{ fontWeight: 700, color: "#0F172A", mb: 2 }}>{monthLabel} — Department Calendar</Typography>
                <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 1, mb: 1 }}>
                  {DAYS.map((d) => (
                    <Typography key={d} align="center" sx={{ fontWeight: 600, color: "#64748B", fontSize: "0.78rem", py: 1 }}>
                      {d}
                    </Typography>
                  ))}
                </Box>
                <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 1 }}>
                  {Array.from({ length: startDay }).map((_, i) => (
                    <Box key={`e-${i}`} />
                  ))}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const key = `${current.getFullYear()}-${current.getMonth()}-${day}`;
                    const dayEvents = eventsByDay[key] || [];
                    return (
                      <Box
                        key={day}
                        sx={{
                          minHeight: 88,
                          p: 1,
                          borderRadius: 2,
                          border: "1px solid #F1F5F9",
                          bgcolor: dayEvents.length ? "#FAFBFF" : "#FFF",
                        }}
                      >
                        <Typography sx={{ fontWeight: 600, fontSize: "0.82rem", color: "#334155", mb: 0.5 }}>{day}</Typography>
                        {dayEvents.slice(0, 3).map((ev) => (
                          <CalendarEventBox key={ev.id} title={ev.title} visualStatus={ev.visualStatus} compact />
                        ))}
                        {dayEvents.length > 3 && (
                          <Typography sx={{ fontSize: "0.65rem", color: "#64748B" }}>+{dayEvents.length - 3} more</Typography>
                        )}
                      </Box>
                    );
                  })}
                </Box>
                <Box mt={2}>
                  <CalendarStatusLegend />
                </Box>
              </>
            )}
          </Box>

          <CalendarSidebarPanels
            todayTasks={todayTasks}
            nearingDueTasks={nearingDueTasks}
            completedTasks={completedTasks}
            overdueTasks={overdueTasks}
            today={today}
          />
        </Box>
      </Box>
    </SubAdminLayout>
  );
}
