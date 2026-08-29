import { Box } from "@mui/material";
import LandingNavbar from "../components/home/LandingNavbar";
import LandingFooter from "../components/home/LandingFooter";
import { HowItWorksHero, WorkflowStepsSection, HowItWorksCta } from "../components/howItWorks/HowItWorksSections";

export default function HowItWorks() {
  return (
    <Box sx={{ bgcolor: "#FFFFFF", minHeight: "100vh", width: "100%" }}>
      <LandingNavbar activePage="how-it-works" />
      <HowItWorksHero />
      <WorkflowStepsSection />
      <HowItWorksCta />
      <LandingFooter />
    </Box>
  );
}
