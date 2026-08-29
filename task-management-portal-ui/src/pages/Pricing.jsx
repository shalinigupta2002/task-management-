import { Box } from "@mui/material";
import LandingNavbar from "../components/home/LandingNavbar";
import PricingSection from "../components/home/PricingSection";
import LandingFooter from "../components/home/LandingFooter";

export default function Pricing() {
  return (
    <Box sx={{ bgcolor: "#FFFFFF", minHeight: "100vh", width: "100%" }}>
      <LandingNavbar activePage="pricing" />
      <PricingSection />
      <LandingFooter />
    </Box>
  );
}
