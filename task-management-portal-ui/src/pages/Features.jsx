import { Box } from "@mui/material";
import LandingNavbar from "../components/home/LandingNavbar";
import LandingFooter from "../components/home/LandingFooter";
import FeatureCardGrid from "../components/features/FeatureCardGrid";
import { FeaturesHero, FeatureTabs, FeaturesCta, PartnersSection, useFeatureFilter } from "../components/features/FeatureSections";

export default function Features() {
  const { category, setCategory } = useFeatureFilter();

  return (
    <Box sx={{ bgcolor: "#FFFFFF", minHeight: "100vh", width: "100%" }}>
      <LandingNavbar activePage="features" />
      <FeaturesHero />
      <Box sx={{ maxWidth: 1280, mx: "auto", px: { xs: 2, sm: 3, md: 4 }, pb: 6 }}>
        <FeatureTabs active={category} onChange={setCategory} />
        <FeatureCardGrid category={category} />
      </Box>
      <FeaturesCta />
      <PartnersSection />
      <LandingFooter />
    </Box>
  );
}
