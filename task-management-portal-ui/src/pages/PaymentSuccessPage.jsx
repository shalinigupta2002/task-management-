import { useEffect, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Box, Button, Typography, Alert, CircularProgress } from "@mui/material";
import LandingNavbar from "../components/home/LandingNavbar";
import LandingFooter from "../components/home/LandingFooter";
import onboardingService, { loadOnboardingSession, saveOnboardingSession } from "../services/onboardingService";
import { getErrorMessage } from "../utils/session";
import toast from "../utils/toast";

export default function PaymentSuccessPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();
  const refFromQuery = params.get("ref");

  const [session, setSession] = useState(loadOnboardingSession());
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const checkout = location.state?.checkout;
    if (checkout?.referenceCode && checkout?.sessionToken) {
      saveOnboardingSession({
        referenceCode: checkout.referenceCode,
        sessionToken: checkout.sessionToken,
      });
      setSession({
        referenceCode: checkout.referenceCode,
        sessionToken: checkout.sessionToken,
      });
    }
  }, [location.state]);

  useEffect(() => {
    let active = true;
    (async () => {
      const current = loadOnboardingSession();
      if (!current?.referenceCode || !current?.sessionToken) {
        setError("No active checkout session. Please start from Pricing.");
        return;
      }
      if (refFromQuery && refFromQuery !== current.referenceCode) {
        setError("Onboarding reference does not match your session.");
        return;
      }
      try {
        const data = await onboardingService.getSession(current);
        if (active) setStatus(data);
      } catch (err) {
        if (active) setError(getErrorMessage(err, "Failed to load payment session"));
      }
    })();
    return () => { active = false; };
  }, [refFromQuery]);

  const payNow = async () => {
    const current = loadOnboardingSession();
    if (!current) return;
    try {
      setLoading(true);
      setError("");
      const result = await onboardingService.simulatePayment(current);
      setStatus(result);
      toast.success("Payment verified");
      navigate(`/company/onboarding?ref=${encodeURIComponent(current.referenceCode)}`);
    } catch (err) {
      setError(getErrorMessage(err, "Payment verification failed"));
      toast.error(getErrorMessage(err, "Payment verification failed"));
    } finally {
      setLoading(false);
    }
  };

  const failPay = async () => {
    const current = loadOnboardingSession();
    if (!current) return;
    try {
      setLoading(true);
      const result = await onboardingService.failPayment(current);
      setStatus(result);
      toast.error("Payment failed");
    } catch (err) {
      setError(getErrorMessage(err, "Could not mark payment failed"));
    } finally {
      setLoading(false);
    }
  };

  const paid = status?.status === "ONBOARDING_PENDING" || status?.status === "PAYMENT_SUCCESS";

  return (
    <Box sx={{ bgcolor: "#F8FAFC", minHeight: "100vh" }}>
      <LandingNavbar activePage="pricing" />
      <Box sx={{ maxWidth: 720, mx: "auto", px: 2, py: 5 }}>
        <Typography sx={{ fontWeight: 800, fontSize: "1.75rem", color: "#0F172A", mb: 1 }}>Payment</Typography>
        <Typography sx={{ color: "#64748B", mb: 3 }}>
          Complete payment to unlock company registration. Company records are created only after verification.
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {!session ? (
          <Alert severity="warning">
            No checkout session found.
            <Button onClick={() => navigate("/pricing")} sx={{ ml: 1, textTransform: "none" }}>Go to Pricing</Button>
          </Alert>
        ) : !status && !error ? (
          <Box display="flex" justifyContent="center" py={6}><CircularProgress /></Box>
        ) : status && (
          <Box sx={{ bgcolor: "#FFF", border: "1px solid #E8EDF5", borderRadius: 3, p: 3 }}>
            <Typography sx={{ fontWeight: 700, mb: 1 }}>{status.plan?.planName}</Typography>
            <Typography sx={{ color: "#64748B", mb: 1 }}>
              {status.billingCycle === "YEARLY" ? "Yearly" : "Monthly"} · ₹{(status.amountRupees || 0).toLocaleString("en-IN")}
            </Typography>
            <Typography sx={{ fontSize: "0.85rem", color: "#94A3B8", mb: 2 }}>
              Reference: {status.referenceCode}
            </Typography>
            <Typography sx={{ mb: 2 }}>
              Status: <strong>{status.status}</strong>
            </Typography>

            {paid ? (
              <Button
                fullWidth
                variant="contained"
                onClick={() => navigate(`/company/onboarding?ref=${encodeURIComponent(session.referenceCode)}`)}
                sx={{ textTransform: "none", bgcolor: "#2563EB", fontWeight: 700, py: 1.2, borderRadius: 2 }}
              >
                Continue to Company Registration
              </Button>
            ) : (
              <Box display="flex" gap={1.5} flexDirection={{ xs: "column", sm: "row" }}>
                <Button
                  fullWidth
                  variant="contained"
                  disabled={loading || status.status === "PAYMENT_FAILED"}
                  onClick={payNow}
                  sx={{ textTransform: "none", bgcolor: "#16A34A", fontWeight: 700, py: 1.2, borderRadius: 2 }}
                >
                  {loading ? "Verifying..." : `Pay ₹${(status.amountRupees || 0).toLocaleString("en-IN")}`}
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  disabled={loading}
                  onClick={failPay}
                  sx={{ textTransform: "none", borderRadius: 2 }}
                >
                  Simulate Failed Payment
                </Button>
              </Box>
            )}
          </Box>
        )}
      </Box>
      <LandingFooter />
    </Box>
  );
}
