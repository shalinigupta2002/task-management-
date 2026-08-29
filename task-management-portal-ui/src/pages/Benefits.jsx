import { Box } from "@mui/material";
import LandingNavbar from "../components/home/LandingNavbar";
import LandingFooter from "../components/home/LandingFooter";
import { BenefitsHero, CoreBenefitsGrid, TestimonialsSection, BenefitsCta } from "../components/benefits/BenefitsPageSections";

export default function Benefits() {
  return (
    <Box sx={{ bgcolor: "#FFFFFF", minHeight: "100vh", width: "100%" }}>
      <LandingNavbar activePage="benefits" />
      <BenefitsHero />
      <CoreBenefitsGrid />
      <TestimonialsSection />
      <BenefitsCta />
      <LandingFooter />
    </Box>
  );
}
