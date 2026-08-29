import { Box, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { MUTED, PRIMARY } from "./landingStyles";

const TITLE_COLOR = "#001A41";
const sectionContainer = { maxWidth: 1280, mx: "auto", px: { xs: 2, sm: 3, md: 4 } };

export default function CtaBanner() {
  const navigate = useNavigate();

  return (
    <Box sx={{ bgcolor: "#FFFFFF", pb: { xs: 6, md: 8 } }}>
      <Box sx={sectionContainer}>
        <Box sx={{
          bgcolor: "#F4F7FE",
          borderRadius: "14px",
          py: { xs: 3, md: 3.5 },
          px: { xs: 3, md: 4.5 },
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          alignItems: { xs: "flex-start", md: "center" },
          gap: { xs: 2.5, md: 3.5 },
        }}>
          <Box sx={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            flexShrink: 0,
            bgcolor: "#EDE9FE",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            <RocketLaunchIcon sx={{ color: PRIMARY, fontSize: 28 }} />
          </Box>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontWeight: 700, color: TITLE_COLOR, fontSize: { xs: "1.05rem", md: "1.15rem" }, lineHeight: 1.4, mb: 0.5 }}>
              Ready to Transform How Your Team Works?
            </Typography>
            <Typography sx={{ color: MUTED, fontSize: { xs: "0.875rem", md: "0.9rem" }, lineHeight: 1.6 }}>
              Start your free 14-day trial today. No credit card required.
            </Typography>
          </Box>

          <Button
            variant="contained"
            endIcon={<ArrowForwardIcon sx={{ fontSize: 18 }} />}
            onClick={() => navigate("/register")}
            sx={{
              textTransform: "none",
              bgcolor: PRIMARY,
              borderRadius: "10px",
              fontWeight: 600,
              px: 3,
              py: 1.25,
              fontSize: "0.9rem",
              flexShrink: 0,
              whiteSpace: "nowrap",
              boxShadow: "none",
              "&:hover": { bgcolor: "#004BB5", boxShadow: "none" },
            }}
          >
            Get Started Free
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
