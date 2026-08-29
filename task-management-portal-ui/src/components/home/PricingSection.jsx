import { useState, useMemo } from "react";
import { Box, Typography, Button, Chip } from "@mui/material";
import { useNavigate } from "react-router-dom";
import CheckIcon from "@mui/icons-material/Check";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { MUTED, PRIMARY } from "./landingStyles";
import useLandingPlans from "../../hooks/useLandingPlans";
import { filterPlansByBilling, formatPlanPrice } from "../../utils/landingPlans";

const TITLE_COLOR = "#1A2B4B";
const GREEN = "#10B981";
const PURPLE = "#8B5CF6";

const sectionContainer = { maxWidth: 1280, mx: "auto", px: { xs: 2, sm: 3, md: 4 } };
const cardShadow = "0 4px 6px -1px rgba(0,0,0,0.08), 0 2px 4px -1px rgba(0,0,0,0.04)";

function BillingToggle({ yearly, maxSavingsPercent, onMonthly, onYearly }) {
  return (
    <Box display="flex" justifyContent="center" mb={5}>
      <Box sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 0.25,
        bgcolor: "#FFFFFF",
        borderRadius: 50,
        p: 0.5,
        border: "1px solid #E2E8F0",
      }}>
        <Box
          onClick={onMonthly}
          sx={{
            px: 3, py: 1, borderRadius: 50, cursor: "pointer", userSelect: "none",
            fontWeight: 600, fontSize: "0.875rem",
            color: !yearly ? PRIMARY : MUTED,
            bgcolor: !yearly ? "#FFFFFF" : "transparent",
            border: !yearly ? `2px solid ${PRIMARY}` : "2px solid transparent",
            transition: "all 0.2s",
          }}
        >
          Monthly
        </Box>
        <Box
          onClick={onYearly}
          sx={{
            px: 3, py: 1, borderRadius: 50, cursor: "pointer", userSelect: "none",
            fontWeight: 600, fontSize: "0.875rem",
            color: yearly ? PRIMARY : MUTED,
            bgcolor: "#FFFFFF",
            border: yearly ? `2px solid ${PRIMARY}` : "2px solid transparent",
            transition: "all 0.2s",
          }}
        >
          Yearly
        </Box>
        <Box
          onClick={onYearly}
          sx={{
            px: 2.5, py: 1, borderRadius: 50, cursor: "pointer", userSelect: "none",
            fontWeight: 600, fontSize: "0.8rem", whiteSpace: "nowrap",
            bgcolor: yearly ? PRIMARY : "#E2E8F0",
            color: yearly ? "#FFFFFF" : MUTED,
            transition: "all 0.2s",
          }}
        >
          {maxSavingsPercent > 0 ? `Yearly (Save up to ${maxSavingsPercent}%)` : "Yearly"}
        </Box>
      </Box>
    </Box>
  );
}

export default function PricingSection() {
  const [yearly, setYearly] = useState(false);
  const { plans, loading } = useLandingPlans();
  const navigate = useNavigate();

  const visiblePlans = useMemo(() => filterPlansByBilling(plans, yearly), [plans, yearly]);
  const maxSavingsPercent = useMemo(
    () => plans.reduce((max, p) => Math.max(max, p.savings?.percent || 0), 0),
    [plans]
  );

  return (
    <Box id="pricing" sx={{ bgcolor: "#FFFFFF", py: { xs: 6, md: 8 } }}>
      <Box sx={sectionContainer}>
        <Typography align="center" sx={{ fontWeight: 800, color: TITLE_COLOR, fontSize: { xs: "1.65rem", md: "2rem" }, mb: 1 }}>
          Simple, Transparent Pricing
        </Typography>
        <Typography align="center" sx={{ color: MUTED, mb: 4, fontSize: "0.95rem" }}>
          Choose the plan that&apos;s right for your team.
        </Typography>

        <BillingToggle
          yearly={yearly}
          maxSavingsPercent={maxSavingsPercent}
          onMonthly={() => setYearly(false)}
          onYearly={() => setYearly(true)}
        />

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, minmax(0, 1fr))",
              md: `repeat(${Math.min(Math.max(visiblePlans.length, 1), 4)}, minmax(0, 1fr))`,
            },
            gap: 2,
            mb: { xs: 5, md: 6 },
            alignItems: "stretch",
          }}
        >
          {loading ? (
            <Box sx={{ gridColumn: "1 / -1", display: "flex", justifyContent: "center", py: 8 }}>
              <Typography sx={{ color: MUTED, fontSize: "1rem" }}>Loading active subscription plans...</Typography>
            </Box>
          ) : visiblePlans.length === 0 ? (
            <Box sx={{ gridColumn: "1 / -1", textAlign: "center", py: 8 }}>
              <Typography sx={{ color: MUTED }}>No plans available for this billing period.</Typography>
            </Box>
          ) : (
            visiblePlans.map((plan) => {
              const pricing = formatPlanPrice(plan, yearly);
              return (
                <Box key={plan.id || plan.name} sx={{
                  borderRadius: "12px", p: 3, height: "100%", display: "flex", flexDirection: "column",
                  border: plan.popular ? `2px solid ${PRIMARY}` : "1px solid #E5E7EB",
                  boxShadow: cardShadow, position: "relative", bgcolor: "#FFFFFF",
                }}>
                  {plan.popular && (
                    <Chip label="Popular" size="small" sx={{
                      position: "absolute", top: 16, right: 16, bgcolor: PRIMARY, color: "#FFF",
                      fontWeight: 700, fontSize: "0.68rem", height: 24, borderRadius: 50,
                    }} />
                  )}

                  <Typography sx={{ fontWeight: 700, color: plan.popular ? PRIMARY : TITLE_COLOR, fontSize: "1.05rem", mb: 0.75 }}>
                    {plan.name}
                  </Typography>
                  <Typography sx={{ color: MUTED, fontSize: "0.82rem", mb: 2, lineHeight: 1.55, minHeight: 38 }}>
                    {plan.desc}
                  </Typography>

                  <Box sx={{ mb: 2, pb: 2, borderBottom: "1px solid #E5E7EB" }}>
                    <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.75 }}>
                      <Typography sx={{ fontWeight: 800, color: PRIMARY, fontSize: "1.85rem", lineHeight: 1 }}>
                        ₹ {pricing.amount.toLocaleString("en-IN")}
                      </Typography>
                      <Typography sx={{ color: MUTED, fontSize: "0.85rem" }}>/{pricing.period}</Typography>
                    </Box>
                    <Typography sx={{ color: MUTED, fontSize: "0.75rem", mt: 0.5 }}>{pricing.label}</Typography>
                    {yearly && plan.savings && (
                      <Typography sx={{ color: GREEN, fontSize: "0.75rem", fontWeight: 600, mt: 0.5 }}>
                        Save ₹{plan.savings.amount.toLocaleString("en-IN")}/year ({plan.savings.percent}%)
                      </Typography>
                    )}
                  </Box>

                  <Box sx={{ mb: 1.5 }}>
                    <Typography sx={{ color: "#475569", fontSize: "0.8rem", mb: 0.5 }}>
                      <strong>Users:</strong> {plan.users}
                    </Typography>
                    <Typography sx={{ color: "#475569", fontSize: "0.8rem", mb: 1 }}>
                      <strong>Storage:</strong> {plan.storage}
                    </Typography>
                  </Box>

                  <Box sx={{ flex: 1, mb: 2.5 }}>
                    {plan.features.map((f) => (
                      <Box key={f} display="flex" alignItems="flex-start" gap={1} mb={1.1}>
                        <CheckIcon sx={{ color: GREEN, fontSize: 17, mt: 0.15, flexShrink: 0 }} />
                        <Typography sx={{ color: "#6B7280", fontSize: "0.82rem", lineHeight: 1.5 }}>{f}</Typography>
                      </Box>
                    ))}
                  </Box>

                  <Button
                    fullWidth
                    variant={plan.popular ? "contained" : "outlined"}
                    onClick={() => navigate(`/checkout?planId=${encodeURIComponent(plan.id)}&cycle=${yearly ? "YEARLY" : "MONTHLY"}`)}
                    sx={{
                      textTransform: "none", borderRadius: "8px", fontWeight: 600, py: 1.15, fontSize: "0.875rem",
                      ...(plan.popular
                        ? { bgcolor: PRIMARY, boxShadow: "none", "&:hover": { bgcolor: "#004BB5" } }
                        : {
                          borderColor: PRIMARY, color: PRIMARY, bgcolor: "#FFFFFF", borderWidth: 1.5,
                          "&:hover": { borderWidth: 1.5, bgcolor: "#F8FAFF" },
                        }),
                    }}
                  >
                    {plan.cta || "Get Started"}
                  </Button>
                </Box>
              );
            })
          )}
        </Box>

        <Box sx={{
          background: "linear-gradient(90deg, #F4F7FE 0%, #FAFBFF 50%, #F4F7FE 100%)",
          borderRadius: "12px", py: { xs: 3, md: 3.5 }, px: { xs: 3, md: 4 },
          display: "flex", flexDirection: { xs: "column", md: "row" },
          alignItems: { xs: "flex-start", md: "center" }, gap: { xs: 2.5, md: 3 },
        }}>
          <Box sx={{
            width: 56, height: 56, borderRadius: "50%", flexShrink: 0, bgcolor: "#FFFFFF",
            border: "1px solid #E5E7EB", boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Box sx={{
              width: 44, height: 44, borderRadius: "50%", bgcolor: "#EDE9FE",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <RocketLaunchIcon sx={{ color: PURPLE, fontSize: 24 }} />
            </Box>
          </Box>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontWeight: 700, color: TITLE_COLOR, fontSize: { xs: "1.05rem", md: "1.12rem" }, mb: 0.5 }}>
              Ready to Transform How Your Team Works?
            </Typography>
            <Typography sx={{ color: MUTED, fontSize: "0.875rem", lineHeight: 1.6 }}>
              Start your free 14-day trial today. No credit card required.
            </Typography>
          </Box>

          <Button
            variant="contained"
            endIcon={<ArrowForwardIcon sx={{ fontSize: 18 }} />}
            onClick={() => navigate("/register")}
            sx={{
              textTransform: "none", bgcolor: PRIMARY, borderRadius: "8px", fontWeight: 600,
              px: 3, py: 1.2, fontSize: "0.9rem", flexShrink: 0, whiteSpace: "nowrap",
              boxShadow: "none", "&:hover": { bgcolor: "#004BB5", boxShadow: "none" },
            }}
          >
            Get Started Free
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
