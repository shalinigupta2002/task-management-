import { Grid, Card, CardContent, Typography, Box } from "@mui/material";

import AssignmentIcon from "@mui/icons-material/Assignment";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

const cards = [
  {
    title: "Total Tasks",
    value: 128,
    color: "#3B82F6",
    bgColor: "#EFF6FF",
    icon: <AssignmentIcon sx={{ fontSize: 28 }} />,
  },
  {
    title: "Completed",
    value: 42,
    color: "#22C55E",
    bgColor: "#F0FDF4",
    icon: <CheckCircleOutlineIcon sx={{ fontSize: 28 }} />,
  },
  {
    title: "In Progress",
    value: 15,
    color: "#F97316",
    bgColor: "#FFF7ED",
    icon: <HourglassEmptyIcon sx={{ fontSize: 28 }} />,
  },
  {
    title: "Overdue",
    value: 9,
    color: "#EF4444",
    bgColor: "#FEF2F2",
    icon: <AccessTimeIcon sx={{ fontSize: 28 }} />,
  },
];

const cardStyle = {
  borderRadius: 3,
  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
  border: "none",
  height: "100%",
};

function DashboardCards() {
  return (
    <Grid container spacing={2.5}>
      {cards.map((card) => (
        <Grid item xs={12} sm={6} lg={3} key={card.title}>
          <Card elevation={0} sx={cardStyle}>
            <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
              <Box display="flex" alignItems="center" gap={2}>
                <Box
                  sx={{
                    color: card.color,
                    bgcolor: card.bgColor,
                    p: 1.5,
                    borderRadius: 2.5,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {card.icon}
                </Box>

                <Box>
                  <Typography
                    variant="h4"
                    sx={{ fontWeight: 700, color: "#0F172A", lineHeight: 1.2 }}
                  >
                    {card.value}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: "#64748B", mt: 0.3, fontWeight: 500 }}
                  >
                    {card.title}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}

export default DashboardCards;
