import { Card, CardContent, Typography, Box } from "@mui/material";

/** Placeholder list — prefer dashboard nearingDueTasks from API when wired */
const nearingDueTasks = [
  {
    id: 1,
    title: "Daily System Backup Check",
    date: "Due tomorrow",
    frequency: "Daily",
    frequencyColor: "#D97706",
    frequencyBg: "#FFFBEB",
    borderColor: "#F59E0B",
  },
  {
    id: 2,
    title: "Weekly Team Meeting",
    date: "Due in 2 days",
    frequency: "Weekly",
    frequencyColor: "#2563EB",
    frequencyBg: "#EFF6FF",
    borderColor: "#F59E0B",
  },
];

function NearingDueTasks() {
  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 3,
        boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
      }}
    >
      <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
        <Typography
          variant="h6"
          sx={{ fontWeight: 700, color: "#0F172A", fontSize: "1.05rem", mb: 2 }}
        >
          Tasks Nearing Due
        </Typography>

        <Box display="flex" flexDirection="column" gap={1.5}>
          {nearingDueTasks.length === 0 ? (
            <Typography sx={{ color: "#94A3B8", fontSize: "0.85rem" }}>No tasks nearing due</Typography>
          ) : (
            nearingDueTasks.map((task) => (
              <Box
                key={task.id}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: "#FFFBEB",
                  borderLeft: `4px solid ${task.borderColor}`,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: 1,
                }}
              >
                <Box>
                  <Typography
                    sx={{ fontWeight: 600, color: "#0F172A", fontSize: "0.875rem", mb: 0.5 }}
                  >
                    {task.title}
                  </Typography>
                  <Typography sx={{ color: "#64748B", fontSize: "0.8rem" }}>
                    {task.date}
                  </Typography>
                </Box>

                <Box
                  component="span"
                  sx={{
                    px: 1.2,
                    py: 0.3,
                    borderRadius: 5,
                    bgcolor: task.frequencyBg,
                    color: task.frequencyColor,
                    fontSize: "0.72rem",
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                  }}
                >
                  {task.frequency}
                </Box>
              </Box>
            ))
          )}
        </Box>
      </CardContent>
    </Card>
  );
}

export default NearingDueTasks;
