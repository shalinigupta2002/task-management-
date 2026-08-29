import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Box, Button, Typography, Alert, CircularProgress, Chip, FormControl, InputLabel, Select, MenuItem,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LandingNavbar from "../components/home/LandingNavbar";
import LandingFooter from "../components/home/LandingFooter";
import onboardingService, { saveOnboardingSession } from "../services/onboardingService";
import { getErrorMessage } from "../utils/session";
import toast from "../utils/toast";

export default function CheckoutPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const initialPlanId = params.get("planId") || "";
  const initialCycle = params.get("cycle") === "YEARLY" ? "YEARLY" : "MONTHLY";

  const [plans, setPlans] = useState([]);
  const [planId, setPlanId] = useState(initialPlanId);
  const [billingCycle, setBillingCycle] = useState(initialCycle);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        const list = await onboardingService.listPlans();
        if (!active) return;
        setPlans(Array.isArray(list) ? list : []);
        if (!planId && list?.[0]?.id) setPlanId(list[0].id);
      } catch (err) {
        if (active) setError(getErrorMessage(err, "Failed to load plans"));
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const selectedPlan = useMemo(
    () => plans.find((p) => p.id === planId) || null,
    [plans, planId]
  );

  const amount = useMemo(() => {
    if (!selectedPlan) return 0;
    return Number(billingCycle === "YEARLY" ? selectedPlan.yearlyPrice : selectedPlan.monthlyPrice) || 0;
  }, [selectedPlan, billingCycle]);

  const handleCheckout = async () => {
    if (!planId) {
      toast.error("Select a plan");
      return;
    }
    try {
      setSubmitting(true);
      setError("");
      const checkout = await onboardingService.createCheckout({
        subscriptionPlanId: planId,
        billingCycle,
      });
      saveOnboardingSession({
        referenceCode: checkout.referenceCode,
        sessionToken: checkout.sessionToken,
      });
      navigate(`/payment/success?ref=${encodeURIComponent(checkout.referenceCode)}`, {
        state: { checkout },
      });
    } catch (err) {
      setError(getErrorMessage(err, "Failed to start checkout"));
      toast.error(getErrorMessage(err, "Failed to start checkout"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ bgcolor: "#F8FAFC", minHeight: "100vh" }}>
      <LandingNavbar activePage="pricing" />
      <Box sx={{ maxWidth: 720, mx: "auto", px: 2, py: 5 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate("/pricing")} sx={{ textTransform: "none", mb: 2, color: "#64748B" }}>
          Back to Pricing
        </Button>
        <Typography sx={{ fontWeight: 800, fontSize: "1.75rem", color: "#0F172A", mb: 1 }}>Checkout</Typography>
        <Typography sx={{ color: "#64748B", mb: 3 }}>Confirm your plan. Payment is verified before company creation.</Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {loading ? (
          <Box display="flex" justifyContent="center" py={6}><CircularProgress /></Box>
        ) : (
          <Box sx={{ bgcolor: "#FFF", border: "1px solid #E8EDF5", borderRadius: 3, p: 3 }}>
            <FormControl fullWidth size="small" sx={{ mb: 2 }}>
              <InputLabel id="plan-label">Plan</InputLabel>
              <Select labelId="plan-label" label="Plan" value={planId} onChange={(e) => setPlanId(e.target.value)}>
                {plans.map((p) => (
                  <MenuItem key={p.id} value={p.id}>{p.planName}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth size="small" sx={{ mb: 2 }}>
              <InputLabel id="cycle-label">Billing Cycle</InputLabel>
              <Select labelId="cycle-label" label="Billing Cycle" value={billingCycle} onChange={(e) => setBillingCycle(e.target.value)}>
                <MenuItem value="MONTHLY">Monthly</MenuItem>
                <MenuItem value="YEARLY">Yearly</MenuItem>
              </Select>
            </FormControl>

            <Box sx={{ bgcolor: "#F8FAFC", borderRadius: 2, p: 2, mb: 2 }}>
              <Typography sx={{ fontWeight: 700, mb: 0.5 }}>{selectedPlan?.planName || "—"}</Typography>
              <Typography sx={{ color: "#64748B", fontSize: "0.85rem", mb: 1 }}>{selectedPlan?.description}</Typography>
              <Chip label={`${billingCycle === "YEARLY" ? "Yearly" : "Monthly"} · INR`} size="small" sx={{ mb: 1 }} />
              <Typography sx={{ fontWeight: 800, color: "#2563EB", fontSize: "1.5rem" }}>
                ₹{amount.toLocaleString("en-IN")}
                <Typography component="span" sx={{ color: "#64748B", fontSize: "0.9rem", fontWeight: 500 }}>
                  /{billingCycle === "YEARLY" ? "year" : "month"}
                </Typography>
              </Typography>
            </Box>

            <Button
              fullWidth
              variant="contained"
              disabled={submitting || !planId}
              onClick={handleCheckout}
              sx={{ textTransform: "none", bgcolor: "#2563EB", fontWeight: 700, py: 1.2, borderRadius: 2 }}
            >
              {submitting ? "Creating checkout..." : "Proceed to Payment"}
            </Button>
          </Box>
        )}
      </Box>
      <LandingFooter />
    </Box>
  );
}
