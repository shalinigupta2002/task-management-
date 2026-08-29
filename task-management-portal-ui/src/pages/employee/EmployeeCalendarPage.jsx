import { useState, useEffect, useMemo } from "react";
import { Box, Typography, Chip } from "@mui/material";
import EmployeeLayout from "../../components/layouts/EmployeeLayout";
import { PageHeader, card } from "../../components/employee/shared";
import CalendarEventBox from "../../components/calendar/CalendarEventBox";
import CalendarStatusLegend from "../../components/calendar/CalendarStatusLegend";
import CalendarSidebarPanels from "../../components/calendar/CalendarSidebarPanels";
import { resolveCalendarVisualStatus } from "../../utils/calendarStatusUtils";
import { classifyCalendarSidebarTasks } from "../../utils/taskDueWindows";
import taskOccurrenceService from "../../services/taskOccurrenceService";
import { USE_MOCK_API } from "../../constants/config";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function toDayKey(date) {
  const d = new Date(date);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function buildEvent(item, day, dayKey, today) {
  return {
    ...item,
    dayKey,
    day,
    visualStatus: resolveCalendarVisualStatus(item, today),
  };
}

function formatDueLabel(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export default function EmployeeCalendarPage() {
  const [view, setView] = useState("Month");
  const [apiOccurrences, setApiOccurrences] = useState([]);
  const now = useMemo(() => new Date(), []);
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const startDay = new Date(now.getFullYear(), now.getMonth(), 1).getDay();

  useEffect(() => {
    if (USE_MOCK_API) {
      setApiOccurrences([]);
      return;
    }
    const from = new Date(now.getFullYear(), now.getMonth(), 1);
    const to = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    taskOccurrenceService
      .getCalendar({ from: from.toISOString(), to: to.toISOString() })
      .then((rows) => {
        setApiOccurrences(rows || []);
      })
      .catch(() => {
        setApiOccurrences([]);
      });
  }, [now]);

  // Never fall back to demo/localStorage tasks when using the real API
  const events = useMemo(() => {
    if (USE_MOCK_API) return [];
    return apiOccurrences.flatMap((occ) =>
      (occ.assignees || [{ status: occ.status || "OPEN" }]).map((a, idx) => {
        const item = {
          id: `${occ.id}-${a.assigneeId || idx}`,
          title: occ.task?.title || "Task",
          status: a.status || occ.status || "OPEN",
          occurrenceDate: occ.occurrenceDate,
          dueDate: occ.occurrenceDate,
        };
        return buildEvent(item, new Date(occ.occurrenceDate).getDate(), toDayKey(occ.occurrenceDate), now);
      })
    );
  }, [apiOccurrences, now]);

  const sidebarSource = useMemo(() => {
    if (USE_MOCK_API) return [];
    return apiOccurrences.flatMap((occ) =>
      (occ.assignees || [{ status: occ.status || "OPEN" }]).map((a, idx) => ({
        id: `${occ.id}-${a.assigneeId || idx}`,
        title: occ.task?.title || "Task",
        status: a.status || occ.status || "OPEN",
        dueDate: occ.occurrenceDate,
        occurrenceDate: occ.occurrenceDate,
        dueDateLabel: formatDueLabel(occ.occurrenceDate),
      }))
    );
  }, [apiOccurrences]);

  const { todayTasks, nearingDueTasks, completedTasks, overdueTasks } = useMemo(
    () => classifyCalendarSidebarTasks(sidebarSource, now),
    [sidebarSource, now]
  );

  return (
    <EmployeeLayout>
      <Box sx={{ pb: 3 }}>
        <PageHeader title="Task Calendar" crumbs={[{ label: "Calendar" }]} />
        <Box display="flex" gap={1} mb={2} flexWrap="wrap">
          {["Month", "Week", "Day"].map((v) => (
            <Chip
              key={v}
              label={`${v} View`}
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
        </Box>

        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1fr 320px" }, gap: 2 }}>
          <Box sx={card}>
            {view === "Month" && (
              <>
                <Typography sx={{ fontWeight: 700, color: "#0F172A", mb: 2 }}>
                  {now.toLocaleDateString("en-GB", { month: "long", year: "numeric" })}
                </Typography>
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
                    const key = `${now.getFullYear()}-${now.getMonth()}-${day}`;
                    const dayEvents = events.filter((ev) => ev.dayKey === key || ev.day === day);
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
                          <CalendarEventBox key={ev.dayKey || ev.id || ev.title} title={ev.title} visualStatus={ev.visualStatus} compact />
                        ))}
                      </Box>
                    );
                  })}
                </Box>
                <Box mt={2}>
                  <CalendarStatusLegend />
                </Box>
              </>
            )}

            {view === "Week" && (
              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(7, 1fr)" }, gap: 1 }}>
                {DAYS.map((d, i) => (
                  <Box key={d} sx={{ p: 1.5, borderRadius: 2, border: "1px solid #F1F5F9", minHeight: 120 }}>
                    <Typography sx={{ fontWeight: 600, fontSize: "0.82rem", mb: 1 }}>{d}</Typography>
                    {events.filter((_, idx) => idx % 7 === i).map((ev) => (
                      <CalendarEventBox
                        key={ev.dayKey || ev.id || ev.title}
                        title={ev.title}
                        visualStatus={ev.visualStatus}
                      />
                    ))}
                  </Box>
                ))}
              </Box>
            )}

            {view === "Day" && (
              <Box sx={{ p: 2, bgcolor: "#F8FAFC", borderRadius: 2 }}>
                <Typography sx={{ fontWeight: 700, mb: 2 }}>
                  {now.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                </Typography>
                {todayTasks.length === 0 ? (
                  <Typography sx={{ color: "#94A3B8", fontSize: "0.85rem" }}>No tasks due today</Typography>
                ) : (
                  todayTasks.map((t) => (
                    <CalendarEventBox
                      key={t.id}
                      title={t.title}
                      visualStatus={resolveCalendarVisualStatus(t, now)}
                    />
                  ))
                )}
              </Box>
            )}
          </Box>

          <CalendarSidebarPanels
            todayTasks={todayTasks}
            nearingDueTasks={nearingDueTasks}
            completedTasks={completedTasks}
            overdueTasks={overdueTasks}
            today={now}
          />
        </Box>
      </Box>
    </EmployeeLayout>
  );
}
