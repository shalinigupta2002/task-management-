import { useNavigate } from "react-router-dom";
import { Box, Typography, Button } from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { HERO_VALUES, CORE_BENEFITS, STATS, TESTIMONIALS } from "./benefitData";
import BenefitsDashboardPreview, { TestimonialCard, CtaIllustration } from "./BenefitsSections";

const NAVY = "#0F172A";
const PRIMARY = "#0056D2";
const MUTED = "#64748B";
const sectionContainer = { maxWidth: 1280, mx: "auto", px: { xs: 2, sm: 3, md: 4 } };

export function BenefitsHero() {
  return (
    <Box sx={{ py: { xs: 5, md: 8 }, bgcolor: "#F8FAFC" }}>
      <Box sx={{
        ...sectionContainer,
        display: "grid",
        gridTemplateColumns: { xs: "1fr", lg: "1fr 1.15fr" },
        gap: { xs: 5, lg: 6 },
        alignItems: "center",
      }}>
        {/* Left — headline + 2×2 benefits */}
        <Box>
          <Typography sx={{
            fontSize: { xs: "1.75rem", md: "2.5rem" },
            fontWeight: 800,
            color: NAVY,
            lineHeight: 1.2,
            mb: 2,
            letterSpacing: "-0.02em",
          }}>
            More Than a Task Manager.
            <br />
            <Box component="span" sx={{ color: PRIMARY }}>A Productivity Multiplier.</Box>
          </Typography>
          <Typography sx={{ color: MUTED, fontSize: { xs: "0.95rem", md: "1.05rem" }, lineHeight: 1.7, mb: 4, maxWidth: 520 }}>
            TaskFlow helps teams plan better, work smarter and achieve more—every single day.
          </Typography>

          <Box sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" },
            gap: { xs: 3, md: 3.5 },
          }}>
            {HERO_VALUES.map((v) => {
              const Icon = v.icon;
              return (
                <Box key={v.title} display="flex" alignItems="flex-start" gap={1.5}>
                  <Box sx={{
                    width: 44, height: 44, borderRadius: 2, bgcolor: v.bg, flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    border: `1px solid ${PRIMARY}22`,
                  }}>
                    <Icon sx={{ color: v.color, fontSize: 22 }} />
                  </Box>
                  <Box>
                    <Typography sx={{ fontWeight: 700, color: NAVY, fontSize: "0.95rem", mb: 0.5, lineHeight: 1.3 }}>
                      {v.title}
                    </Typography>
                    <Typography sx={{ color: MUTED, fontSize: "0.82rem", lineHeight: 1.6 }}>
                      {v.desc}
                    </Typography>
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Box>

        {/* Right — dashboard mockup */}
        <Box sx={{
          borderRadius: 3,
          overflow: "hidden",
          boxShadow: "0 24px 56px rgba(15,23,42,0.12)",
          border: "1px solid #E2E8F0",
        }}>
          <BenefitsDashboardPreview />
        </Box>
      </Box>
    </Box>
  );
}

export function CoreBenefitsGrid() {
  return (
    <Box sx={{ py: { xs: 6, md: 9 }, bgcolor: "#FFFFFF" }}>
      <Box sx={sectionContainer}>
        <Typography align="center" sx={{ fontSize: { xs: "1.75rem", md: "2.25rem" }, fontWeight: 800, color: NAVY, mb: 1.5, letterSpacing: "-0.02em" }}>
          Why Teams Choose <Box component="span" sx={{ color: PRIMARY }}>TaskFlow</Box>
        </Typography>
        <Typography align="center" sx={{ color: MUTED, mb: { xs: 4, md: 5 }, maxWidth: 560, mx: "auto", fontSize: { xs: "0.95rem", md: "1rem" }, lineHeight: 1.7 }}>
          Powerful benefits that help teams of all sizes work better together.
        </Typography>

        <Box sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, minmax(0, 1fr))",
            md: "repeat(3, minmax(0, 1fr))",
          },
          gap: 2.5,
          mb: { xs: 4, md: 5 },
        }}>
          {CORE_BENEFITS.map((b) => {
            const Icon = b.icon;
            return (
              <Box
                key={b.title}
                sx={{
                  bgcolor: "#FFFFFF",
                  borderRadius: "12px",
                  p: 2.5,
                  height: "100%",
                  border: "1px solid #E2E8F0",
                  boxShadow: "0 1px 3px rgba(15,23,42,0.04)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  transition: "all 0.2s",
                  "&:hover": { boxShadow: "0 8px 24px rgba(15,23,42,0.08)", transform: "translateY(-2px)" },
                }}
              >
                <Box sx={{
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  bgcolor: b.bg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  mb: 1.5,
                }}>
                  <Icon sx={{ color: b.color, fontSize: 24 }} />
                </Box>
                <Typography sx={{ fontWeight: 700, color: NAVY, fontSize: "0.95rem", mb: 0.75, lineHeight: 1.35 }}>
                  {b.title}
                </Typography>
                <Typography sx={{ color: MUTED, fontSize: "0.82rem", lineHeight: 1.65 }}>
                  {b.desc}
                </Typography>
              </Box>
            );
          })}
        </Box>

        <BenefitsStatsBanner />
      </Box>
    </Box>
  );
}

export function BenefitsStatsBanner() {
  return (
    <Box sx={{
      bgcolor: PRIMARY,
      borderRadius: "16px",
      px: { xs: 2.5, md: 4 },
      py: { xs: 3, md: 3.5 },
    }}>
      <Box sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "repeat(2, 1fr)",
          sm: "repeat(3, 1fr)",
          lg: "repeat(5, 1fr)",
        },
        gap: { xs: 3, md: 0 },
        alignItems: "center",
      }}>
        {STATS.map((s, i) => {
          const Icon = s.icon;
          return (
            <Box
              key={s.label}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.25,
                px: { md: i > 0 ? 2 : 0 },
                position: "relative",
                borderLeft: {
                  md: i > 0 ? "1px solid rgba(255,255,255,0.2)" : "none",
                },
              }}
            >
              <Icon sx={{ color: "#FFFFFF", fontSize: { xs: 28, md: 32 }, flexShrink: 0, opacity: 0.95 }} />
              <Box>
                <Typography sx={{ fontWeight: 800, color: "#FFFFFF", fontSize: { xs: "1.15rem", md: "1.35rem" }, lineHeight: 1.1 }}>
                  {s.value}
                </Typography>
                <Typography sx={{ color: "rgba(255,255,255,0.85)", fontSize: { xs: "0.68rem", md: "0.72rem" }, fontWeight: 500, mt: 0.35, lineHeight: 1.35 }}>
                  {s.label}
                </Typography>
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}

export function TestimonialsSection() {
  return (
    <Box sx={{ py: { xs: 6, md: 9 }, bgcolor: "#FFFFFF" }}>
      <Box sx={sectionContainer}>
        <Typography align="center" sx={{ fontSize: { xs: "1.75rem", md: "2.25rem" }, fontWeight: 800, color: NAVY, mb: { xs: 4, md: 5 }, letterSpacing: "-0.02em" }}>
          Loved by Teams Across Industries
        </Typography>

        <Box sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, minmax(0, 1fr))",
            md: "repeat(3, minmax(0, 1fr))",
          },
          gap: 3,
        }}>
          {TESTIMONIALS.map((t) => (
            <TestimonialCard key={t.name} {...t} />
          ))}
        </Box>

        <Box display="flex" justifyContent="center" alignItems="center" gap={1} mt={4}>
          {[0, 1, 2].map((d) => (
            <Box
              key={d}
              sx={{
                width: d === 1 ? 10 : 8,
                height: d === 1 ? 10 : 8,
                borderRadius: "50%",
                bgcolor: d === 1 ? PRIMARY : "#CBD5E1",
                transition: "all 0.2s",
              }}
            />
          ))}
        </Box>
      </Box>
    </Box>
  );
}

export function BenefitsCta() {
  const navigate = useNavigate();
  const TRUST = ["14-Day Free Trial", "No Credit Card Required", "Cancel Anytime"];

  return (
    <Box sx={{ py: { xs: 5, md: 7 }, bgcolor: "#FFFFFF" }}>
      <Box sx={{
        ...sectionContainer,
        bgcolor: "#F4F7FE",
        borderRadius: "20px",
        border: "1px solid #DBEAFE",
        p: { xs: 3, md: 4 },
        display: "grid",
        gridTemplateColumns: { xs: "1fr", lg: "auto 1fr auto" },
        gap: { xs: 3, md: 4 },
        alignItems: "center",
      }}>
        <CtaIllustration />

        <Box sx={{ px: { lg: 1 } }}>
          <Typography sx={{ fontWeight: 800, color: NAVY, fontSize: { xs: "1.35rem", md: "1.65rem" }, mb: 1.25, lineHeight: 1.3 }}>
            Experience the Benefits of TaskFlow
          </Typography>
          <Typography sx={{ color: MUTED, fontSize: { xs: "0.875rem", md: "0.95rem" }, lineHeight: 1.7, mb: 2.5, maxWidth: 480 }}>
            Join 500+ organizations that trust TaskFlow to streamline their work and achieve more every day.
          </Typography>
          <Box sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: { xs: 1.5, md: 2.5 },
            alignItems: "center",
          }}>
            {TRUST.map((t) => (
              <Box key={t} display="flex" alignItems="center" gap={0.75}>
                <CheckCircleOutlineIcon sx={{ color: PRIMARY, fontSize: 20 }} />
                <Typography sx={{ color: "#475569", fontSize: "0.85rem", fontWeight: 500, whiteSpace: "nowrap" }}>{t}</Typography>
              </Box>
            ))}
          </Box>
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, width: { xs: "100%", lg: "auto" }, minWidth: { lg: 180 } }}>
          <Button
            variant="contained"
            fullWidth
            onClick={() => navigate("/register")}
            sx={{
              textTransform: "none",
              bgcolor: PRIMARY,
              borderRadius: 2,
              fontWeight: 700,
              py: 1.25,
              boxShadow: "none",
              "&:hover": { bgcolor: "#004BB5", boxShadow: "none" },
            }}
          >
            Start Free Trial
          </Button>
          <Button
            variant="outlined"
            fullWidth
            onClick={() => navigate("/login")}
            sx={{
              textTransform: "none",
              borderColor: PRIMARY,
              color: PRIMARY,
              borderRadius: 2,
              fontWeight: 600,
              py: 1.25,
              bgcolor: "#FFFFFF",
              "&:hover": { bgcolor: "#EFF6FF", borderColor: PRIMARY },
            }}
          >
            Book a Demo
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
