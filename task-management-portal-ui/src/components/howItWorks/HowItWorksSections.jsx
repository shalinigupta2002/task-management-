import { useNavigate } from "react-router-dom";
import { Box, Typography, Button, Chip } from "@mui/material";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CreditCardOutlinedIcon from "@mui/icons-material/CreditCardOutlined";
import { PROCESS_STEPS, WORKFLOW_STEPS } from "./howItWorksData";
import StepMockup from "./StepMockups";

const NAVY = "#0F172A";
const PRIMARY = "#0056D2";
const MUTED = "#64748B";
const sectionContainer = { maxWidth: 1280, mx: "auto", px: { xs: 2, sm: 3, md: 4 } };

export function HowItWorksHero() {
  return (
    <Box sx={{ py: { xs: 4, md: 5 }, bgcolor: "#FAFBFC" }}>
      <Box sx={{ ...sectionContainer, textAlign: "center" }}>
        <Chip
          label="HOW IT WORKS"
          sx={{
            bgcolor: "#EFF6FF",
            color: PRIMARY,
            fontWeight: 700,
            fontSize: "0.68rem",
            letterSpacing: "0.06em",
            height: 26,
            mb: 1.5,
            borderRadius: "999px",
            "& .MuiChip-label": { px: 1.75 },
          }}
        />

        <Typography sx={{
          fontSize: { xs: "1.65rem", md: "2.25rem" },
          fontWeight: 800,
          color: NAVY,
          lineHeight: 1.2,
          mb: 1,
          letterSpacing: "-0.02em",
        }}>
          Simple Process.{" "}
          <Box component="span" sx={{ color: PRIMARY }}>Powerful Results.</Box>
        </Typography>

        <Typography sx={{
          color: MUTED,
          fontSize: { xs: "0.9rem", md: "0.98rem" },
          maxWidth: 580,
          mx: "auto",
          lineHeight: 1.65,
          mb: { xs: 3, md: 3.5 },
        }}>
          TaskFlow is designed to help teams plan, execute and complete work in a structured and transparent way.
        </Typography>

        <Box sx={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "center",
          flexWrap: { xs: "wrap", lg: "nowrap" },
          gap: { xs: 1.5, md: 0 },
          maxWidth: 1000,
          mx: "auto",
        }}>
          {PROCESS_STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <Box key={step.label} sx={{ display: "flex", alignItems: "flex-start" }}>
                <Box sx={{ width: { xs: 130, sm: 145, md: 155 }, px: { xs: 0.25, md: 0.5 } }}>
                  <Box sx={{
                    width: 52,
                    height: 52,
                    borderRadius: "12px",
                    bgcolor: step.bg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mx: "auto",
                    mb: 1,
                    boxShadow: "0 1px 4px rgba(15,23,42,0.04)",
                  }}>
                    <Icon sx={{ color: step.color, fontSize: 26 }} />
                  </Box>
                  <Typography sx={{ fontWeight: 700, color: NAVY, fontSize: "0.85rem", mb: 0.5, lineHeight: 1.3 }}>
                    {step.title}
                  </Typography>
                  <Typography sx={{ color: MUTED, fontSize: "0.74rem", lineHeight: 1.55, maxWidth: 145, mx: "auto" }}>
                    {step.desc}
                  </Typography>
                </Box>

                {i < PROCESS_STEPS.length - 1 && (
                  <Box sx={{
                    display: { xs: "none", lg: "flex" },
                    alignItems: "center",
                    height: 52,
                    px: 0.25,
                    flexShrink: 0,
                  }}>
                    <ChevronRightIcon sx={{ color: "#CBD5E1", fontSize: 18 }} />
                  </Box>
                )}
              </Box>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
}

export function WorkflowStepsSection() {
  return (
    <Box sx={{ py: { xs: 4, md: 5 }, bgcolor: "#FFFFFF" }}>
      <Box sx={sectionContainer}>
        <Typography align="center" sx={{ fontWeight: 800, color: NAVY, fontSize: { xs: "1.5rem", md: "2rem" }, mb: 0.75, letterSpacing: "-0.02em" }}>
          Step-by-Step Workflow
        </Typography>
        <Typography align="center" sx={{ color: MUTED, fontSize: { xs: "0.88rem", md: "0.95rem" }, mb: { xs: 3, md: 3.5 }, maxWidth: 480, mx: "auto", lineHeight: 1.6 }}>
          See how TaskFlow streamlines your task from start to finish.
        </Typography>

        <Box sx={{ position: "relative" }}>
          {WORKFLOW_STEPS.map((step, index) => {
            const TipIcon = step.tip.icon;
            const isLast = index === WORKFLOW_STEPS.length - 1;

            return (
              <Box
                key={step.num}
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", lg: "200px minmax(0, 1fr) 240px" },
                  gap: { xs: 2, lg: 2 },
                  mb: isLast ? 0 : { xs: 3, md: 3.5 },
                  alignItems: "start",
                }}
              >
                <Box sx={{ display: "flex", gap: 1.25 }}>
                  <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                    <Box sx={{
                      width: 38,
                      height: 38,
                      borderRadius: "50%",
                      bgcolor: step.color,
                      color: "#FFFFFF",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 800,
                      fontSize: "0.9rem",
                      flexShrink: 0,
                      zIndex: 1,
                    }}>
                      {step.num}
                    </Box>
                    {!isLast && (
                      <Box sx={{ width: 2, flex: 1, minHeight: { xs: 16, lg: 48 }, bgcolor: "#E2E8F0", mt: 0.75 }} />
                    )}
                  </Box>

                  <Box sx={{ pt: 0.25 }}>
                    <Typography sx={{ fontWeight: 800, color: NAVY, fontSize: { xs: "0.98rem", md: "1.05rem" }, mb: 0.5, lineHeight: 1.3 }}>
                      {step.title}
                    </Typography>
                    <Typography sx={{ color: MUTED, fontSize: "0.8rem", lineHeight: 1.6, maxWidth: 200 }}>
                      {step.desc}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ gridColumn: { xs: "1", lg: "2" } }}>
                  <StepMockup type={step.mockup} />
                </Box>

                <Box sx={{
                  gridColumn: { xs: "1", lg: "3" },
                  bgcolor: step.tip.bg,
                  borderRadius: "12px",
                  p: 1.75,
                  border: "1px solid",
                  borderColor: `${step.tip.color}22`,
                  alignSelf: { lg: "start" },
                }}>
                  <Box display="flex" alignItems="center" gap={0.75} mb={0.75}>
                    <TipIcon sx={{ color: step.tip.color, fontSize: 20 }} />
                    <Typography sx={{ fontWeight: 700, color: step.tip.color, fontSize: "0.85rem" }}>
                      {step.tip.label}
                    </Typography>
                  </Box>
                  <Typography sx={{ color: "#475569", fontSize: "0.8rem", lineHeight: 1.55 }}>
                    {step.tip.text}
                  </Typography>
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
}

export function HowItWorksCtaIllustration() {
  return (
    <Box sx={{ position: "relative", width: { xs: 200, md: 230 }, height: { xs: 150, md: 175 }, mx: "auto", flexShrink: 0 }}>
      {/* Dashboard screen */}
      <Box sx={{
        position: "absolute",
        top: 8,
        left: "50%",
        transform: "translateX(-50%)",
        width: { xs: 150, md: 175 },
        height: { xs: 105, md: 120 },
        bgcolor: "#FFFFFF",
        borderRadius: 2,
        border: "2px solid #E2E8F0",
        boxShadow: "0 10px 28px rgba(15,23,42,0.1)",
        p: 1.25,
        zIndex: 1,
      }}>
        <Box sx={{ width: "100%", height: 7, bgcolor: PRIMARY, borderRadius: 1, mb: 1 }} />

        <Box display="flex" gap={1} mb={0.75}>
          <Box sx={{
            width: 52,
            height: 52,
            borderRadius: "50%",
            flexShrink: 0,
            background: `conic-gradient(${PRIMARY} 0deg 140deg, #EC4899 140deg 360deg)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            <Box sx={{ width: 30, height: 30, borderRadius: "50%", bgcolor: "#FFF" }} />
          </Box>
          <Box sx={{ flex: 1 }}>
            {["Task A", "Task B", "Task C"].map((t) => (
              <Box key={t} display="flex" alignItems="center" gap={0.5} mb={0.35}>
                <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: "#22C55E", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Typography sx={{ color: "#FFF", fontSize: "0.45rem", lineHeight: 1 }}>✓</Typography>
                </Box>
                <Box sx={{ flex: 1, height: 5, bgcolor: "#EFF6FF", borderRadius: 1 }} />
              </Box>
            ))}
          </Box>
        </Box>

        <Box display="flex" alignItems="flex-end" gap={0.35} height={28}>
          {[45, 70, 55, 85, 60].map((h, i) => (
            <Box key={i} sx={{ flex: 1, height: `${h}%`, bgcolor: i % 2 === 0 ? PRIMARY : "#7C3AED", borderRadius: "2px 2px 0 0", opacity: 0.75 }} />
          ))}
        </Box>
      </Box>

      {/* Woman with laptop — left */}
      <Box sx={{ position: "absolute", bottom: 0, left: 4, width: 58, zIndex: 2 }}>
        <Box sx={{ width: 26, height: 26, borderRadius: "50%", bgcolor: "#FDBA74", mx: "auto", mb: 0.4 }} />
        <Box sx={{ width: 40, height: 34, bgcolor: PRIMARY, borderRadius: "16px 16px 0 0", mx: "auto" }} />
        <Box sx={{ width: 48, height: 6, bgcolor: "#334155", borderRadius: "0 0 4px 4px", mx: "auto" }} />
        <Box sx={{ width: 54, height: 4, bgcolor: "#94A3B8", borderRadius: 1, mt: 0.4, mx: "auto" }} />
      </Box>

      {/* Man pointing — right */}
      <Box sx={{ position: "absolute", bottom: 0, right: 0, width: 58, zIndex: 2 }}>
        <Box sx={{ width: 26, height: 26, borderRadius: "50%", bgcolor: "#FCD34D", mx: "auto", mb: 0.4 }} />
        <Box sx={{ width: 40, height: 38, bgcolor: "#22C55E", borderRadius: "16px 16px 0 0", mx: "auto" }} />
        <Box sx={{
          position: "absolute",
          top: 42,
          right: -8,
          width: 22,
          height: 8,
          bgcolor: "#FDBA74",
          borderRadius: 4,
          transform: "rotate(-20deg)",
        }} />
        <Box sx={{ width: 54, height: 4, bgcolor: "#94A3B8", borderRadius: 1, mt: 0.4, mx: "auto" }} />
      </Box>
    </Box>
  );
}

export function HowItWorksCta() {
  const navigate = useNavigate();
  const TRUST = [
    { label: "14-Day Free Trial", icon: CheckCircleOutlineIcon },
    { label: "No Credit Card Required", icon: CreditCardOutlinedIcon },
    { label: "Cancel Anytime", icon: CheckCircleOutlineIcon },
  ];

  return (
    <Box sx={{ py: { xs: 4, md: 5 }, bgcolor: "#FFFFFF" }}>
      <Box sx={{
        ...sectionContainer,
        bgcolor: "#F4F7FE",
        borderRadius: "16px",
        border: "1px solid #DBEAFE",
        p: { xs: 2.5, md: 3 },
        display: "grid",
        gridTemplateColumns: { xs: "1fr", lg: "auto 1fr auto" },
        gap: { xs: 2.5, md: 3 },
        alignItems: "center",
      }}>
        <HowItWorksCtaIllustration />

        <Box sx={{ px: { lg: 1 } }}>
          <Typography sx={{
            fontWeight: 800,
            color: NAVY,
            fontSize: { xs: "1.2rem", md: "1.45rem" },
            mb: 0.75,
            lineHeight: 1.3,
          }}>
            Ready to Simplify the Way Your Team Works?
          </Typography>
          <Typography sx={{ color: MUTED, fontSize: { xs: "0.85rem", md: "0.9rem" }, lineHeight: 1.6, mb: 1.75, maxWidth: 480 }}>
            Join thousands of teams that trust TaskFlow to get things done.
          </Typography>
          <Box sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: { xs: 1.5, md: 2.5 },
            alignItems: "center",
          }}>
            {TRUST.map((t) => {
              const Icon = t.icon;
              return (
                <Box key={t.label} display="flex" alignItems="center" gap={0.75}>
                  <Box sx={{
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    bgcolor: "#EFF6FF",
                    border: `1.5px solid ${PRIMARY}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}>
                    <Icon sx={{ color: PRIMARY, fontSize: 13 }} />
                  </Box>
                  <Typography sx={{ color: PRIMARY, fontSize: "0.82rem", fontWeight: 600, whiteSpace: "nowrap" }}>
                    {t.label}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        </Box>

        <Box sx={{
          display: "flex",
          flexDirection: "column",
          gap: 1.5,
          width: { xs: "100%", lg: "auto" },
          minWidth: { lg: 200 },
        }}>
          <Button
            variant="contained"
            fullWidth
            onClick={() => navigate("/register")}
            sx={{
              textTransform: "none",
              bgcolor: PRIMARY,
              borderRadius: "12px",
              fontWeight: 700,
              py: 1.35,
              fontSize: "0.9rem",
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
              borderRadius: "12px",
              fontWeight: 600,
              py: 1.35,
              fontSize: "0.9rem",
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
