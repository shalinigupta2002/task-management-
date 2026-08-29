import { Box } from "@mui/material";
import LandingNavbar from "../components/home/LandingNavbar";
import HeroSection from "../components/home/HeroSection";
import FeaturesSection from "../components/home/FeaturesSection";
import StatsBanner from "../components/home/StatsBanner";
import PricingSection from "../components/home/PricingSection";
import LandingFooter from "../components/home/LandingFooter";

export default function Home() {
  return (
    <Box sx={{ bgcolor: "#FFFFFF", minHeight: "100vh", width: "100%", overflowX: "hidden" }}>
      <LandingNavbar activePage="home" />
      <HeroSection />
      <FeaturesSection />
      <StatsBanner />
      <PricingSection />
      <LandingFooter />
    </Box>
  );
}
