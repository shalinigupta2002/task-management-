import { Box, Typography } from "@mui/material";
import FeatureMockup, { BulletList } from "./FeatureMockups";
import { FEATURES } from "./featureData";

export default function FeatureCardGrid({ category }) {
  const filtered = category === "all" ? FEATURES : FEATURES.filter((f) => f.category === category);

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          lg: "repeat(2, minmax(0, 1fr))",
        },
        gap: 3,
        alignItems: "stretch",
      }}
    >
      {filtered.map((f) => (
        <Box
          key={f.id}
          sx={{
            bgcolor: "#FFFFFF",
            borderRadius: "12px",
            border: "1px solid #E5E7EB",
            boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
            overflow: "hidden",
            height: "100%",
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
          }}
        >
          <Box sx={{ p: { xs: 2.5, md: 2.5 }, display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <Box display="flex" alignItems="flex-start" gap={1} mb={1.25}>
              <Box sx={{
                width: 32, height: 32, borderRadius: 1.5, bgcolor: f.bg, flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Typography sx={{ fontWeight: 800, color: f.color, fontSize: "0.7rem" }}>
                  {f.num.replace(".", "")}
                </Typography>
              </Box>
              <Typography sx={{ fontWeight: 800, color: "#0F172A", fontSize: "0.9rem", lineHeight: 1.35 }}>
                {f.num} {f.title}
              </Typography>
            </Box>
            <Typography sx={{ color: "#64748B", fontSize: "0.78rem", lineHeight: 1.6, mb: 1.5 }}>
              {f.desc}
            </Typography>
            <BulletList items={f.bullets} color={f.color} />
          </Box>

          <Box sx={{
            bgcolor: "#F8FAFC",
            p: { xs: 2, md: 2 },
            display: "flex",
            alignItems: "center",
            borderTop: { xs: "1px solid #E8EDF5", sm: "none" },
            borderLeft: { sm: "1px solid #E8EDF5" },
            minWidth: 0,
          }}>
            <Box sx={{ width: "100%", overflow: "hidden" }}>
              <FeatureMockup type={f.mockup} />
            </Box>
          </Box>
        </Box>
      ))}
    </Box>
  );
}
