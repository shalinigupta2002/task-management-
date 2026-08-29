import { Box, Typography, Avatar, InputBase } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import DashboardIcon from "@mui/icons-material/Dashboard";
import AssignmentIcon from "@mui/icons-material/Assignment";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import AssessmentIcon from "@mui/icons-material/Assessment";
import PeopleIcon from "@mui/icons-material/People";
import SettingsIcon from "@mui/icons-material/Settings";

const PRIMARY = "#0056D2";
const SIDEBAR = [DashboardIcon, AssignmentIcon, CalendarMonthIcon, AssessmentIcon, PeopleIcon, SettingsIcon];

export default function BenefitsDashboardPreview() {
  return (
    <Box sx={{ display: "flex", minHeight: 380, bgcolor: "#F4F7FE", fontSize: "0.6rem" }}>
      <Box sx={{ width: 52, bgcolor: "#0F172A", py: 1.5, display: "flex", flexDirection: "column", alignItems: "center", gap: 0.6 }}>
        <Box sx={{ width: 28, height: 28, borderRadius: 1.5, bgcolor: PRIMARY, display: "flex", alignItems: "center", justifyContent: "center", mb: 1 }}>
          <AssignmentTurnedInIcon sx={{ color: "#FFF", fontSize: 14 }} />
        </Box>
        {SIDEBAR.map((Icon, i) => (
          <Box key={i} sx={{ width: 30, height: 30, borderRadius: 1.5, bgcolor: i === 0 ? PRIMARY : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon sx={{ color: "#FFF", fontSize: 14 }} />
          </Box>
        ))}
      </Box>

      <Box sx={{ flex: 1, p: 1.25, minWidth: 0 }}>
        <Box display="flex" alignItems="center" gap={1} mb={1}>
          <Typography sx={{ fontWeight: 700, color: "#0F172A", fontSize: "0.75rem", flexShrink: 0 }}>Dashboard</Typography>
          <Box sx={{ flex: 1, maxWidth: 120, display: "flex", alignItems: "center", bgcolor: "#FFF", borderRadius: 1.5, px: 0.8, py: 0.3, border: "1px solid #E8EDF5" }}>
            <SearchIcon sx={{ fontSize: 11, color: "#94A3B8", mr: 0.4 }} />
            <InputBase placeholder="Search..." sx={{ fontSize: "0.5rem", flex: 1 }} />
          </Box>
          <Avatar sx={{ width: 22, height: 22, fontSize: "0.45rem", bgcolor: "#CBD5E1" }}>SM</Avatar>
        </Box>

        <Box display="grid" gridTemplateColumns="repeat(4,1fr)" gap={0.6} mb={1}>
          {[
            { v: "128", l: "Total Tasks", c: PRIMARY },
            { v: "42", l: "Completed", c: "#22C55E" },
            { v: "15", l: "In Progress", c: "#F97316" },
            { v: "9", l: "Overdue", c: "#EF4444" },
          ].map((s) => (
            <Box key={s.l} sx={{ bgcolor: "#FFF", borderRadius: 1.5, p: 0.7, border: "1px solid #E8EDF5" }}>
              <Typography sx={{ fontWeight: 800, color: s.c, fontSize: "0.8rem", lineHeight: 1 }}>{s.v}</Typography>
              <Typography sx={{ color: "#94A3B8", fontSize: "0.48rem" }}>{s.l}</Typography>
            </Box>
          ))}
        </Box>

        <Box display="grid" gridTemplateColumns="1fr 1fr" gap={0.7}>
          <Box sx={{ bgcolor: "#FFF", borderRadius: 1.5, p: 1, border: "1px solid #E8EDF5" }}>
            <Typography sx={{ fontWeight: 700, fontSize: "0.62rem", mb: 0.6, color: "#0F172A" }}>Tasks by Status</Typography>
            <Box display="flex" alignItems="center" gap={0.8}>
              <Box sx={{
                width: 46, height: 46, borderRadius: "50%", flexShrink: 0,
                background: `conic-gradient(${PRIMARY} 0deg 120deg, #22C55E 120deg 220deg, #F97316 220deg 300deg, #EF4444 300deg 360deg)`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Box sx={{ width: 28, height: 28, borderRadius: "50%", bgcolor: "#FFF", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Typography sx={{ fontWeight: 800, fontSize: "0.5rem" }}>128</Typography>
                </Box>
              </Box>
              <Box>
                {[{ l: "Open", c: PRIMARY }, { l: "Done", c: "#22C55E" }, { l: "Overdue", c: "#EF4444" }].map((d) => (
                  <Box key={d.l} display="flex" alignItems="center" gap={0.4} mb={0.25}>
                    <Box sx={{ width: 5, height: 5, borderRadius: "50%", bgcolor: d.c }} />
                    <Typography sx={{ fontSize: "0.48rem", color: "#64748B" }}>{d.l}</Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>

          <Box sx={{ bgcolor: "#FFF", borderRadius: 1.5, p: 1, border: "1px solid #E8EDF5" }}>
            <Typography sx={{ fontWeight: 700, fontSize: "0.62rem", mb: 0.5, color: "#0F172A" }}>Tasks Nearing Due</Typography>
            {["Daily Backup Check", "Team Meeting"].map((t) => (
              <Box key={t} py={0.35} sx={{ borderBottom: "1px solid #F1F5F9" }}>
                <Typography sx={{ fontSize: "0.52rem", fontWeight: 500, color: "#334155" }}>{t}</Typography>
              </Box>
            ))}
          </Box>

          <Box sx={{ bgcolor: "#FFF", borderRadius: 1.5, p: 1, border: "1px solid #E8EDF5" }}>
            <Typography sx={{ fontWeight: 700, fontSize: "0.62rem", mb: 0.5, color: "#0F172A" }}>Tasks Trend</Typography>
            <Box display="flex" alignItems="flex-end" gap={0.25} height={42}>
              {[35, 50, 40, 65, 55, 75, 60, 80].map((h, i) => (
                <Box key={i} sx={{ flex: 1, height: `${h}%`, bgcolor: PRIMARY, borderRadius: "2px 2px 0 0", opacity: 0.65 + i * 0.04 }} />
              ))}
            </Box>
          </Box>

          <Box sx={{ bgcolor: "#FFF", borderRadius: 1.5, p: 1, border: "1px solid #E8EDF5" }}>
            <Typography sx={{ fontWeight: 700, fontSize: "0.62rem", mb: 0.4, color: "#0F172A" }}>My Calendar</Typography>
            <Box display="grid" gridTemplateColumns="repeat(7,1fr)" gap={0.15}>
              {Array.from({ length: 21 }, (_, i) => i + 1).map((d) => (
                <Box key={d} sx={{
                  textAlign: "center", fontSize: "0.42rem", py: 0.15, borderRadius: 0.5,
                  bgcolor: d === 15 ? PRIMARY : "transparent",
                  color: d === 15 ? "#FFF" : "#64748B",
                  fontWeight: d === 15 ? 700 : 400,
                }}>
                  {d}
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export function TestimonialCard({ quote, name, role, avatar, avatarColor }) {
  return (
    <Box sx={{
      bgcolor: "#FFFFFF",
      borderRadius: "16px",
      p: { xs: 2.5, md: 3 },
      border: "1px solid #E2E8F0",
      boxShadow: "0 2px 12px rgba(15,23,42,0.04)",
      height: "100%",
      display: "flex",
      flexDirection: "column",
    }}>
      <Typography sx={{ color: PRIMARY, fontSize: "1.75rem", lineHeight: 1, mb: 1.25, fontWeight: 800, fontFamily: "Georgia, serif" }}>
        "
      </Typography>
      <Typography sx={{ color: "#334155", fontSize: "0.875rem", lineHeight: 1.75, flex: 1, mb: 2.5 }}>
        {quote}
      </Typography>
      <Box display="flex" alignItems="center" gap={1.5} mb={1.25}>
        <Avatar sx={{ width: 44, height: 44, bgcolor: avatarColor || PRIMARY, fontSize: "0.85rem", fontWeight: 700 }}>
          {avatar}
        </Avatar>
        <Box>
          <Typography sx={{ fontWeight: 700, color: "#0F172A", fontSize: "0.875rem", lineHeight: 1.3 }}>{name}</Typography>
          <Typography sx={{ color: "#94A3B8", fontSize: "0.78rem", lineHeight: 1.4 }}>{role}</Typography>
        </Box>
      </Box>
      <Box display="flex" gap={0.25}>
        {[1, 2, 3, 4, 5].map((s) => (
          <Typography key={s} sx={{ color: "#FBBF24", fontSize: "1rem", lineHeight: 1 }}>★</Typography>
        ))}
      </Box>
    </Box>
  );
}

export function CtaIllustration() {
  return (
    <Box sx={{ position: "relative", width: { xs: 200, md: 240 }, height: { xs: 160, md: 190 }, mx: "auto", flexShrink: 0 }}>
      <Box sx={{
        position: "absolute", top: 8, left: 12, width: 28, height: 28, borderRadius: "50%",
        border: `2px solid ${PRIMARY}`, display: "flex", alignItems: "center", justifyContent: "center",
        bgcolor: "#FFF", fontSize: "0.65rem", color: PRIMARY, fontWeight: 700,
      }}>
        ⏱
      </Box>
      <Box sx={{
        position: "absolute", top: 4, right: 20, width: 24, height: 24, borderRadius: "50%",
        border: `2px solid ${PRIMARY}`, bgcolor: "#EFF6FF", fontSize: "0.55rem",
        display: "flex", alignItems: "center", justifyContent: "center", color: PRIMARY,
      }}>
        ⏱
      </Box>

      <Box sx={{
        position: "absolute", top: 36, left: "50%", transform: "translateX(-50%)",
        width: { xs: 130, md: 150 }, height: { xs: 88, md: 100 },
        bgcolor: "#FFF", borderRadius: 2, border: "2px solid #E2E8F0",
        boxShadow: "0 8px 24px rgba(15,23,42,0.08)", p: 1,
      }}>
        <Box sx={{ width: "100%", height: 8, bgcolor: PRIMARY, borderRadius: 1, mb: 0.75 }} />
        <Box display="flex" gap={0.5} mb={0.5}>
          {[1, 2, 3].map((i) => (
            <Box key={i} sx={{ flex: 1, height: 22, bgcolor: "#EFF6FF", borderRadius: 0.5 }} />
          ))}
        </Box>
        <Box sx={{ width: 36, height: 36, borderRadius: "50%", bgcolor: PRIMARY, display: "flex", alignItems: "center", justifyContent: "center", mx: "auto" }}>
          <Typography sx={{ color: "#FFF", fontSize: "1rem", fontWeight: 700 }}>✓</Typography>
        </Box>
      </Box>

      <Box sx={{ position: "absolute", bottom: 0, left: 0, width: 52, height: 72 }}>
        <Box sx={{ width: 28, height: 28, borderRadius: "50%", bgcolor: "#FDBA74", mx: "auto", mb: 0.5 }} />
        <Box sx={{ width: 44, height: 36, bgcolor: PRIMARY, borderRadius: "18px 18px 0 0", mx: "auto" }} />
        <Box sx={{ width: 52, height: 8, bgcolor: "#CBD5E1", borderRadius: 1, mt: 0.5 }} />
      </Box>

      <Box sx={{ position: "absolute", bottom: 0, right: 0, width: 52, height: 78 }}>
        <Box sx={{ width: 28, height: 28, borderRadius: "50%", bgcolor: "#FCD34D", mx: "auto", mb: 0.5 }} />
        <Box sx={{ width: 44, height: 42, bgcolor: "#7C3AED", borderRadius: "18px 18px 0 0", mx: "auto" }} />
        <Box sx={{ width: 52, height: 8, bgcolor: "#CBD5E1", borderRadius: 1, mt: 0.5 }} />
      </Box>
    </Box>
  );
}
