import { Box, Typography, IconButton } from "@mui/material";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import TwitterIcon from "@mui/icons-material/Twitter";
import FacebookIcon from "@mui/icons-material/Facebook";
import YouTubeIcon from "@mui/icons-material/YouTube";
import { NAVY, PRIMARY } from "./landingStyles";

const LINK_COLOR = "#475569";
const sectionContainer = { maxWidth: 1280, mx: "auto", px: { xs: 2, sm: 3, md: 4 } };

const LINKS = {
  Product: ["Features", "How It Works", "Integrations", "Updates"],
  Resources: ["Help Center", "User Guide", "Templates", "Blog"],
  Company: ["About Us", "Contact Us", "Careers", "Privacy Policy"],
  Legal: ["Terms of Service", "Refund Policy", "Security", "Compliance"],
};

export default function LandingFooter() {
  return (
    <Box component="footer" sx={{ bgcolor: "#F8FAFC", pt: { xs: 6, md: 8 }, pb: { xs: 4, md: 5 } }}>
      <Box sx={sectionContainer}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "1fr 1fr",
              md: "minmax(240px, 1.4fr) repeat(4, minmax(0, 1fr))",
            },
            gap: { xs: 4, md: 5 },
            mb: { xs: 4, md: 5 },
            alignItems: "start",
          }}
        >
          {/* Brand column */}
          <Box sx={{ gridColumn: { xs: "1 / -1", sm: "1 / -1", md: "auto" } }}>
            <Box display="flex" alignItems="center" gap={1.5} mb={2}>
              <Box sx={{
                width: 40, height: 40, borderRadius: 2, bgcolor: PRIMARY,
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                <AssignmentTurnedInIcon sx={{ color: "#FFF", fontSize: 22 }} />
              </Box>
              <Box>
                <Typography sx={{ fontWeight: 800, fontSize: "1.05rem", color: NAVY, lineHeight: 1.2 }}>
                  TaskFlow
                </Typography>
                <Typography sx={{ fontSize: "0.65rem", color: PRIMARY, lineHeight: 1.25, mt: 0.15, fontWeight: 500 }}>
                  Task Management System
                </Typography>
              </Box>
            </Box>
            <Typography sx={{ color: LINK_COLOR, fontSize: "0.875rem", lineHeight: 1.7, mb: 2.5, maxWidth: 300 }}>
              TaskFlow helps teams automate workflows, stay organized and get more done.
            </Typography>
            <Box display="flex" gap={1.25}>
              {[LinkedInIcon, TwitterIcon, FacebookIcon, YouTubeIcon].map((Icon, i) => (
                <IconButton
                  key={i}
                  size="small"
                  sx={{
                    color: NAVY,
                    bgcolor: "#E2E8F0",
                    width: 38,
                    height: 38,
                    "&:hover": { bgcolor: "#CBD5E1", color: PRIMARY },
                  }}
                >
                  <Icon sx={{ fontSize: 18 }} />
                </IconButton>
              ))}
            </Box>
          </Box>

          {/* Link columns — single row on desktop */}
          {Object.entries(LINKS).map(([title, items]) => (
            <Box key={title}>
              <Typography sx={{ fontWeight: 700, fontSize: "0.9rem", mb: 1.75, color: NAVY }}>
                {title}
              </Typography>
              {items.map((item) => (
                <Typography
                  key={item}
                  sx={{
                    color: LINK_COLOR,
                    fontSize: "0.85rem",
                    mb: 1.25,
                    cursor: "pointer",
                    lineHeight: 1.5,
                    "&:hover": { color: PRIMARY },
                  }}
                >
                  {item}
                </Typography>
              ))}
            </Box>
          ))}
        </Box>

        <Box sx={{ textAlign: "center" }}>
          <Typography sx={{ color: "#94A3B8", fontSize: "0.8rem" }}>
            © 2025 TaskFlow. All rights reserved.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
