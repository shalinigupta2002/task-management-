import { Box, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DashboardPreview from "./DashboardPreview";
import { CONTAINER, NAVY, MUTED, PRIMARY } from "./landingStyles";

const TRUST = ["14-Day Free Trial", "No Credit Card Required", "Cancel Anytime"];

export default function HeroSection() {
  const navigate = useNavigate();

  return (
    <Box sx={{ position: "relative", bgcolor: "#F4F7FE", overflow: "hidden", pt: { xs: 5, md: 8 }, pb: { xs: 6, md: 10 } }}>
      {/* decorative blobs */}
      <Box sx={{ position: "absolute", top: -80, right: -60, width: 320, height: 320, borderRadius: "50%", bgcolor: "rgba(0,86,210,0.06)", pointerEvents: "none" }} />
      <Box sx={{ position: "absolute", bottom: -100, left: -80, width: 280, height: 280, borderRadius: "50%", bgcolor: "rgba(0,86,210,0.04)", pointerEvents: "none" }} />
      <Box sx={{ position: "absolute", top: "40%", left: "35%", width: 180, height: 180, borderRadius: "50%", bgcolor: "rgba(255,255,255,0.5)", pointerEvents: "none" }} />

      <Box sx={{ ...CONTAINER, position: "relative", zIndex: 1, display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1fr 1.15fr" }, gap: { xs: 5, lg: 6 }, alignItems: "center" }}>
        <Box>
          <Typography sx={{
            fontSize: { xs: "2rem", sm: "2.65rem", md: "3.2rem" },
            fontWeight: 800, lineHeight: 1.15, mb: 2.5, letterSpacing: "-0.02em",
          }}>
            <Box component="span" sx={{ color: NAVY }}>Organize Tasks.<br />Empower Teams.</Box>
            <br />
            <Box component="span" sx={{ color: PRIMARY }}>Achieve More.</Box>
          </Typography>
          <Typography sx={{ color: MUTED, fontSize: { xs: "0.95rem", md: "1.05rem" }, lineHeight: 1.75, mb: 4, maxWidth: 500 }}>
            TaskFlow helps you create, assign, track and complete tasks with an intelligent workflow and powerful reporting.
          </Typography>

          <Box display="flex" flexWrap="wrap" gap={1.5} mb={4}>
            <Button variant="contained" size="large" onClick={() => navigate("/register")}
              sx={{ textTransform: "none", bgcolor: PRIMARY, fontWeight: 700, px: 3.5, py: 1.35, fontSize: "0.95rem", borderRadius: 2, boxShadow: "0 4px 14px rgba(0,86,210,0.28)", "&:hover": { bgcolor: "#004BB5" } }}>
              Start Free Trial
            </Button>
            <Button variant="outlined" size="large" startIcon={<PlayCircleOutlineIcon sx={{ color: PRIMARY }} />}
              sx={{ textTransform: "none", borderColor: "#CBD5E1", color: NAVY, px: 3, py: 1.35, borderRadius: 2, fontWeight: 600, borderWidth: 1.5, bgcolor: "#FFFFFF", "&:hover": { borderColor: PRIMARY, bgcolor: "#FFFFFF", borderWidth: 1.5 } }}>
              Watch Demo
            </Button>
          </Box>

          <Box display="flex" flexWrap="wrap" gap={2.5}>
            {TRUST.map((t) => (
              <Box key={t} display="flex" alignItems="center" gap={0.75}>
                <CheckCircleIcon sx={{ color: PRIMARY, fontSize: 18 }} />
                <Typography sx={{ color: MUTED, fontSize: "0.85rem", fontWeight: 500 }}>{t}</Typography>
              </Box>
            ))}
          </Box>
        </Box>

        <Box sx={{ position: "relative" }}>
          <Box sx={{ borderRadius: 4, overflow: "hidden", boxShadow: "0 24px 60px rgba(15,23,42,0.14)", border: "1px solid rgba(226,232,240,0.8)" }}>
            <DashboardPreview />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
