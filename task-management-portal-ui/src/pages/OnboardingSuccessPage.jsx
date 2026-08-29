import { useLocation, useNavigate } from "react-router-dom";
import { Box, Button, Typography, Alert, IconButton, Tooltip } from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import LandingNavbar from "../components/home/LandingNavbar";
import LandingFooter from "../components/home/LandingFooter";
import { card } from "../components/super-admin/shared";
import toast from "../utils/toast";

export default function OnboardingSuccessPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const result = location.state?.result;

  if (!result?.company) {
    return (
      <Box sx={{ bgcolor: "#F8FAFC", minHeight: "100vh" }}>
        <LandingNavbar />
        <Box sx={{ maxWidth: 720, mx: "auto", px: 2, py: 6 }}>
          <Alert severity="info">No registration result found.</Alert>
          <Button sx={{ mt: 2, textTransform: "none" }} onClick={() => navigate("/login")}>Go to Login</Button>
        </Box>
        <LandingFooter />
      </Box>
    );
  }

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(result.company.companyCode);
      toast.success("Company Code copied");
    } catch {
      toast.error("Unable to copy");
    }
  };

  return (
    <Box sx={{ bgcolor: "#F8FAFC", minHeight: "100vh" }}>
      <LandingNavbar />
      <Box sx={{ maxWidth: 720, mx: "auto", px: 2, py: 5 }}>
        <Typography sx={{ fontWeight: 800, fontSize: "1.75rem", color: "#0F172A", mb: 1 }}>
          Company Created Successfully
        </Typography>
        <Alert severity="success" sx={{ mb: 2 }}>
          Your tenant is active. Use the Main Admin email and the password you set to log in.
        </Alert>

        <Box sx={card}>
          <Typography sx={{ mb: 1 }}><strong>Company Name:</strong> {result.company.companyName}</Typography>
          <Box display="flex" alignItems="center" gap={0.5} mb={1}>
            <Typography><strong>Company Code:</strong> {result.company.companyCode}</Typography>
            <Tooltip title="Copy Company Code">
              <IconButton size="small" onClick={copyCode}><ContentCopyIcon fontSize="small" /></IconButton>
            </Tooltip>
          </Box>
          <Typography sx={{ mb: 1 }}><strong>Main Admin Email:</strong> {result.mainAdmin?.email}</Typography>
          <Typography sx={{ mb: 1 }}><strong>Plan:</strong> {result.plan?.planName}</Typography>
          <Typography sx={{ mb: 1 }}><strong>Billing:</strong> {result.plan?.billingCycle === "YEARLY" ? "Yearly" : "Monthly"}</Typography>
          <Typography><strong>Status:</strong> {result.status || "Active"}</Typography>
        </Box>

        <Box display="flex" gap={1.5} mt={3}>
          <Button variant="contained" onClick={() => navigate("/login")} sx={{ textTransform: "none", bgcolor: "#2563EB", fontWeight: 700, borderRadius: 2, px: 3 }}>
            Go to Login
          </Button>
        </Box>
      </Box>
      <LandingFooter />
    </Box>
  );
}
