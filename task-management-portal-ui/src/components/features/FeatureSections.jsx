import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, Button } from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { CATEGORIES, PARTNERS } from "./featureData";

export function FeatureTabs({ active, onChange }) {
  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: { xs: 1, md: 2 }, mb: 5, px: 2 }}>
      {CATEGORIES.map((cat) => {
        const Icon = cat.icon;
        const selected = active === cat.id;
        return (
          <Box key={cat.id} onClick={() => onChange(cat.id)}
            sx={{
              display: "flex", alignItems: "center", gap: 0.8, px: 2, py: 1.2, borderRadius: 2,
              cursor: "pointer", transition: "all 0.2s",
              bgcolor: selected ? "#EFF6FF" : "transparent",
              borderBottom: selected ? "2px solid #2563EB" : "2px solid transparent",
              "&:hover": { bgcolor: "#F8FAFC" },
            }}>
            <Icon sx={{ fontSize: 18, color: selected ? "#2563EB" : "#94A3B8" }} />
            <Typography sx={{ fontSize: { xs: "0.75rem", md: "0.85rem" }, fontWeight: selected ? 700 : 500, color: selected ? "#2563EB" : "#64748B", whiteSpace: "nowrap" }}>
              {cat.label}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
}

export function FeaturesHero() {
  return (
    <Box sx={{ textAlign: "center", py: { xs: 5, md: 7 }, px: 2, background: "linear-gradient(180deg, #EFF6FF 0%, #FFFFFF 100%)" }}>
      <Typography sx={{ fontSize: { xs: "1.75rem", md: "2.75rem" }, fontWeight: 800, color: "#0F172A", lineHeight: 1.2, mb: 2, maxWidth: 800, mx: "auto" }}>
        Everything You Need to{" "}
        <Box component="span" sx={{ color: "#2563EB" }}>Manage Tasks Effortlessly</Box>
      </Typography>
      <Typography sx={{ color: "#64748B", fontSize: { xs: "0.95rem", md: "1.05rem" }, maxWidth: 640, mx: "auto", lineHeight: 1.7 }}>
        TaskFlow brings planning, assigning, tracking, and completing work into one place — so your team stays aligned and productive.
      </Typography>
    </Box>
  );
}

export function PartnersSection() {
  return (
    <Box sx={{ bgcolor: "#F8FAFC", py: { xs: 4, md: 5 }, px: 2, textAlign: "center" }}>
      <Typography sx={{ color: "#64748B", fontSize: "0.9rem", fontWeight: 500, mb: 3 }}>Trusted by teams across industries</Typography>
      <Box display="flex" flexWrap="wrap" justifyContent="center" gap={{ xs: 2, md: 4 }}>
        {PARTNERS.map((p) => (
          <Typography key={p} sx={{ color: "#94A3B8", fontWeight: 700, fontSize: { xs: "0.85rem", md: "1rem" }, letterSpacing: 0.5 }}>{p}</Typography>
        ))}
      </Box>
    </Box>
  );
}

export function FeaturesCta() {
  const navigate = useNavigate();
  const TRUST = ["14-Day Free Trial", "No Credit Card Required", "Cancel Anytime"];

  return (
    <Box sx={{ py: { xs: 5, md: 7 }, px: { xs: 2, md: 4 } }}>
      <Box sx={{
        maxWidth: 1100, mx: "auto", bgcolor: "#EFF6FF", borderRadius: 4, p: { xs: 3, md: 5 },
        display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1.2fr" }, gap: 4, alignItems: "center",
      }}>
        <Box sx={{ display: { xs: "none", md: "block" }, height: 200, bgcolor: "#DBEAFE", borderRadius: 3, position: "relative" }}>
          <Box sx={{ position: "absolute", top: 20, left: 20, width: "70%", height: 120, bgcolor: "#FFF", borderRadius: 2, boxShadow: "0 8px 24px rgba(0,0,0,0.08)" }} />
          <Box sx={{ position: "absolute", bottom: 20, right: 20, width: "50%", height: 80, bgcolor: "#FFF", borderRadius: 2, boxShadow: "0 4px 16px rgba(0,0,0,0.06)" }} />
        </Box>
        <Box>
          <Typography sx={{ fontWeight: 800, color: "#0F172A", fontSize: { xs: "1.35rem", md: "1.75rem" }, mb: 1.5 }}>
            Ready to Experience the Full Power of TaskFlow?
          </Typography>
          <Typography sx={{ color: "#64748B", mb: 3, fontSize: "0.95rem" }}>
            Join 500+ organizations already using TaskFlow to streamline their workflows.
          </Typography>
          <Box display="flex" flexWrap="wrap" gap={1.5} mb={3}>
            <Button variant="contained" onClick={() => navigate("/register")}
              sx={{ textTransform: "none", bgcolor: "#2563EB", borderRadius: 2.5, fontWeight: 700, px: 3, "&:hover": { bgcolor: "#1D4ED8" } }}>
              Start Free Trial
            </Button>
            <Button variant="outlined" onClick={() => navigate("/login")}
              sx={{ textTransform: "none", borderColor: "#E2E8F0", color: "#334155", borderRadius: 2.5, fontWeight: 600, px: 3, bgcolor: "#FFF", "&:hover": { borderColor: "#2563EB" } }}>
              Book a Demo
            </Button>
          </Box>
          <Box display="flex" flexWrap="wrap" gap={2}>
            {TRUST.map((t) => (
              <Box key={t} display="flex" alignItems="center" gap={0.5}>
                <CheckCircleOutlineIcon sx={{ color: "#22C55E", fontSize: 16 }} />
                <Typography sx={{ color: "#64748B", fontSize: "0.8rem" }}>{t}</Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export function useFeatureFilter() {
  const [category, setCategory] = useState("all");
  return { category, setCategory };
}
