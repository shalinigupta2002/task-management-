import React from "react";
import { Box, Paper, Typography, Grid } from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import AssignmentIcon from "@mui/icons-material/Assignment";
import PeopleIcon from "@mui/icons-material/People";

export default function Statistics() {
  const stats = [
    { title: "Total Tasks", value: "24", icon: <AssignmentIcon color="primary" />, color: "#eff6ff" },
    { title: "Completed", value: "18", icon: <TrendingUpIcon color="success" />, color: "#f0fdf4" },
    { title: "Team Members", value: "12", icon: <PeopleIcon color="warning" />, color: "#fffbeb" },
  ];

  return (
    <Grid container spacing={3}>
      {stats.map((item, index) => (
        <Grid item xs={12} sm={4} key={index}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderRadius: 3,
              border: "1px solid #e2e8f0",
              bgcolor: item.color,
            }}
          >
            <Box>
              <Typography variant="body2" color="text.secondary" fontWeight={600}>
                {item.title}
              </Typography>
              <Typography variant="h4" fontWeight={700} sx={{ mt: 1 }}>
                {item.value}
              </Typography>
            </Box>
            <Box
              sx={{
                p: 1.5,
                borderRadius: 2,
                bgcolor: "#ffffff",
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {item.icon}
            </Box>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
}