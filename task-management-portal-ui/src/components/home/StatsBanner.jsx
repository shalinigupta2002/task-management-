import { Box, Typography, Grid } from "@mui/material";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import ScheduleOutlinedIcon from "@mui/icons-material/ScheduleOutlined";
import { PRIMARY } from "./landingStyles";

const STATS = [
  { icon: GroupsOutlinedIcon, value: "500+", label: "Organizations" },
  { icon: CheckCircleOutlineIcon, value: "25K+", label: "Active Users" },
  { icon: AssignmentOutlinedIcon, value: "1M+", label: "Tasks Completed" },
  { icon: ScheduleOutlinedIcon, value: "98%", label: "Customer Satisfaction" },
];

const sectionContainer = { maxWidth: 1280, mx: "auto", px: { xs: 2, sm: 3, md: 4 } };

export default function StatsBanner() {
  return (
    <Box sx={{ bgcolor: "#FAFBFC", pb: { xs: 6, md: 8 } }}>
      <Box sx={sectionContainer}>
        <Box
          sx={{
            bgcolor: PRIMARY,
            borderRadius: "20px",
            px: { xs: 3, md: 5 },
            py: { xs: 4, md: 4.5 },
          }}
        >
          <Grid container alignItems="center" spacing={{ xs: 4, md: 2 }}>
            <Grid item xs={12} md={4}>
              <Typography
                sx={{
                  fontWeight: 800,
                  color: "#FFFFFF",
                  fontSize: { xs: "1.35rem", md: "1.65rem" },
                  lineHeight: 1.35,
                  mb: 1.5,
                }}
              >
                Built for Productivity.
                <br />
                Designed for Impact.
              </Typography>
              <Typography sx={{ color: "rgba(255,255,255,0.9)", fontSize: "0.875rem", lineHeight: 1.7, maxWidth: 340 }}>
                Trusted by organizations to simplify work, improve accountability and drive results.
              </Typography>
            </Grid>

            <Grid item xs={12} md={8}>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "repeat(2, 1fr)", sm: "repeat(4, 1fr)" },
                  gap: { xs: 3, md: 2 },
                  pl: { md: 2 },
                }}
              >
                {STATS.map((s) => {
                  const Icon = s.icon;
                  return (
                    <Box key={s.label} sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
                      <Icon sx={{ color: "#FFFFFF", fontSize: { xs: 26, md: 30 }, flexShrink: 0 }} />
                      <Box>
                        <Typography
                          sx={{
                            fontWeight: 800,
                            color: "#FFFFFF",
                            fontSize: { xs: "1.1rem", md: "1.3rem" },
                            lineHeight: 1.1,
                          }}
                        >
                          {s.value}
                        </Typography>
                        <Typography
                          sx={{
                            color: "rgba(255,255,255,0.88)",
                            fontSize: "0.72rem",
                            fontWeight: 500,
                            mt: 0.35,
                            lineHeight: 1.3,
                          }}
                        >
                          {s.label}
                        </Typography>
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Box>
  );
}
