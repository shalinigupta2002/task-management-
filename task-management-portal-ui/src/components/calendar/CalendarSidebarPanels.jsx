import { Box, Typography } from "@mui/material";
import CalendarEventBox from "./CalendarEventBox";
import { resolveCalendarVisualStatus } from "../../utils/calendarStatusUtils";
import { formatNearingDueSubtitle } from "../../utils/taskDueWindows";

const card = {
  borderRadius: 3,
  bgcolor: "#FFFFFF",
  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
  border: "1px solid #E8EDF5",
  p: 2,
};

const SECTION_ACCENT = {
  "Today's Tasks": "#0EA5E9",
  "Tasks Nearing Due": "#F59E0B",
  "Completed Tasks": "#16A34A",
  "Overdue Tasks": "#DC2626",
};

const EMPTY_COPY = {
  "Today's Tasks": "No tasks due today",
  "Tasks Nearing Due": "No tasks nearing due",
  "Completed Tasks": "No completed tasks",
  "Overdue Tasks": "No overdue tasks",
};

/**
 * Calendar right-side summary panels.
 * Buckets: Today's Tasks | Tasks Nearing Due | Completed | Overdue
 */
export default function CalendarSidebarPanels({
  todayTasks = [],
  nearingDueTasks = [],
  completedTasks = [],
  overdueTasks = [],
  today = new Date(),
  onTaskClick,
  maxPerSection = 4,
}) {
  const sections = [
    { title: "Today's Tasks", list: todayTasks },
    { title: "Tasks Nearing Due", list: nearingDueTasks },
    { title: "Completed Tasks", list: completedTasks },
    { title: "Overdue Tasks", list: overdueTasks },
  ];

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      {sections.map((section) => {
        const accent = SECTION_ACCENT[section.title];
        return (
          <Box key={section.title} sx={{ ...card, borderTop: `3px solid ${accent}` }}>
            <Typography sx={{ fontWeight: 700, mb: 1.5, color: "#0F172A" }}>{section.title}</Typography>
            {section.list.length === 0 ? (
              <Typography sx={{ color: "#94A3B8", fontSize: "0.85rem" }}>
                {EMPTY_COPY[section.title] || "None"}
              </Typography>
            ) : (
              section.list.slice(0, maxPerSection).map((t) => {
                const subtitle =
                  section.title === "Tasks Nearing Due"
                    ? formatNearingDueSubtitle(t, today)
                    : t.dueDateLabel || t.dueDate || t.occurrenceDate || "";
                return (
                  <Box
                    key={t.id || `${t.title}-${subtitle}`}
                    py={0.75}
                    sx={{
                      borderBottom: "1px solid #F1F5F9",
                      cursor: onTaskClick ? "pointer" : "default",
                      "&:last-child": { borderBottom: "none" },
                    }}
                    onClick={() => onTaskClick?.(t)}
                  >
                    <CalendarEventBox
                      title={t.title}
                      visualStatus={
                        section.title === "Overdue Tasks"
                          ? "overdue"
                          : resolveCalendarVisualStatus(t, today)
                      }
                      subtitle={typeof subtitle === "string" && subtitle.includes("T")
                        ? new Date(subtitle).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
                        : String(subtitle)}
                      showLabel={false}
                    />
                  </Box>
                );
              })
            )}
          </Box>
        );
      })}
    </Box>
  );
}
