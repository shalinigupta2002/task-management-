import { Box, Typography } from "@mui/material";
import AssignmentIcon from "@mui/icons-material/Assignment";
import HowToRegIcon from "@mui/icons-material/HowToReg";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import GroupsIcon from "@mui/icons-material/Groups";
import { NAVY, MUTED, PRIMARY } from "./landingStyles";

const FEATURES = [
  { icon: AssignmentIcon, title: "Streamlined Task Management", desc: "Create, organize and assign tasks with categories, priorities and deadlines.", color: PRIMARY, bg: "#EFF6FF" },
  { icon: HowToRegIcon, title: "Defined Workflows", desc: "Multi-level approvals, reviews and closures ensure accountability at every step.", color: "#16A34A", bg: "#F0FDF4" },
  { icon: EventAvailableIcon, title: "Never Miss a Task", desc: "Daily, monthly & yearly calendar views keep you and your team always on track.", color: "#7C3AED", bg: "#F5F3FF" },
  { icon: ShowChartIcon, title: "Actionable Insights", desc: "Detailed reports and dashboards help you make data-driven decisions.", color: "#F97316", bg: "#FFF7ED" },
  { icon: VerifiedUserIcon, title: "Compliance Made Easy", desc: "Track compliance tasks, set frequencies and maintain audit-ready records.", color: "#EF4444", bg: "#FEF2F2" },
  { icon: GroupsIcon, title: "Team Collaboration", desc: "Centralize communication and task updates for better teamwork.", color: "#0D9488", bg: "#F0FDFA" },
];

const sectionContainer = { maxWidth: 1280, mx: "auto", px: { xs: 2, sm: 3, md: 4 } };

export default function FeaturesSection() {
  return (
    <Box id="features" sx={{ bgcolor: "#FAFBFC", pt: { xs: 6, md: 8 }, pb: { xs: 4, md: 5 } }}>
      <Box sx={sectionContainer}>
        <Typography
          align="center"
          sx={{ fontWeight: 800, fontSize: { xs: "1.6rem", md: "2rem" }, mb: { xs: 4, md: 5.5 }, lineHeight: 1.35 }}
        >
          <Box component="span" sx={{ color: "#1A1A1A" }}>Why </Box>
          <Box component="span" sx={{ color: NAVY }}>Teams Love </Box>
          <Box
            component="span"
            sx={{
              color: PRIMARY,
              textDecoration: "underline",
              textUnderlineOffset: 8,
              textDecorationThickness: 3,
              textDecorationColor: PRIMARY,
            }}
          >
            TaskFlow
          </Box>
        </Typography>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              md: "repeat(3, 1fr)",
              lg: "repeat(6, 1fr)",
            },
            gap: 2,
          }}
        >
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <Box
                key={f.title}
                sx={{
                  bgcolor: "#FFFFFF",
                  borderRadius: "12px",
                  px: 2,
                  py: 3,
                  height: "100%",
                  textAlign: "center",
                  boxShadow: "0 4px 16px rgba(15,23,42,0.06)",
                  border: "1px solid rgba(229,231,235,0.6)",
                }}
              >
                <Box
                  sx={{
                    width: 64,
                    height: 64,
                    borderRadius: "50%",
                    bgcolor: f.bg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mx: "auto",
                    mb: 2,
                  }}
                >
                  <Icon sx={{ color: f.color, fontSize: 28 }} />
                </Box>
                <Typography sx={{ fontWeight: 700, color: NAVY, fontSize: "0.875rem", mb: 1.25, lineHeight: 1.4 }}>
                  {f.title}
                </Typography>
                <Typography sx={{ color: MUTED, fontSize: "0.75rem", lineHeight: 1.65 }}>
                  {f.desc}
                </Typography>
              </Box>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
}
