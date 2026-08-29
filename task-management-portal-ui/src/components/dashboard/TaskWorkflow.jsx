import { Card, CardContent, Typography, Box } from "@mui/material";

import EditNoteIcon from "@mui/icons-material/EditNote";
import HowToRegIcon from "@mui/icons-material/HowToReg";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import RateReviewIcon from "@mui/icons-material/RateReview";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

const steps = [
  { label: "Draft", icon: EditNoteIcon, color: "#94A3B8", bg: "#F1F5F9" },
  { label: "Approval", icon: HowToRegIcon, color: "#3B82F6", bg: "#EFF6FF" },
  { label: "Open", icon: FolderOpenIcon, color: "#22C55E", bg: "#F0FDF4" },
  { label: "In Progress", icon: HourglassEmptyIcon, color: "#F97316", bg: "#FFF7ED" },
  { label: "Review", icon: RateReviewIcon, color: "#8B5CF6", bg: "#F5F3FF" },
  { label: "Closed", icon: CheckCircleIcon, color: "#22C55E", bg: "#F0FDF4" },
];

function TaskWorkflow() {
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
          sx={{ fontWeight: 700, color: "#0F172A", fontSize: "1.05rem", mb: 3 }}
        >
          Task Workflow
        </Typography>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 1,
          }}
        >
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <Box
                key={step.label}
                sx={{ display: "flex", alignItems: "center", flex: "1 1 auto", minWidth: 80 }}
              >
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 1,
                    flex: 1,
                  }}
                >
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: "50%",
                      bgcolor: step.bg,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: step.color,
                    }}
                  >
                    <Icon sx={{ fontSize: 24 }} />
                  </Box>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "#64748B",
                      fontWeight: 500,
                      fontSize: "0.75rem",
                      textAlign: "center",
                    }}
                  >
                    {step.label}
                  </Typography>
                </Box>

                {index < steps.length - 1 && (
                  <ArrowForwardIcon
                    sx={{ color: "#CBD5E1", fontSize: 18, mx: 0.5, flexShrink: 0 }}
                  />
                )}
              </Box>
            );
          })}
        </Box>
      </CardContent>
    </Card>
  );
}

export default TaskWorkflow;
