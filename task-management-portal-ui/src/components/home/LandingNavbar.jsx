import { useNavigate } from "react-router-dom";
import { AppBar, Toolbar, Box, Button, Typography } from "@mui/material";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import PropTypes from "prop-types";
import { CONTAINER, NAVY, PRIMARY } from "./landingStyles";

const NAV = [
  { label: "Features", path: "/features", page: "features" },
  { label: "Benefits", path: "/benefits", page: "benefits" },
  { label: "How It Works", path: "/how-it-works", page: "how-it-works" },
  { label: "Pricing", path: "/pricing", page: "pricing" },
];

const navLinkSx = {
  color: "#475569",
  fontWeight: 500,
  fontSize: "0.875rem",
  cursor: "pointer",
  lineHeight: 1,
  whiteSpace: "nowrap",
  px: 0.5,
  py: 0.75,
  "&:hover": { color: PRIMARY },
};

export default function LandingNavbar({ activePage }) {
  const navigate = useNavigate();

  const handleNav = (item) => {
    navigate(item.path);
  };

  return (
    <AppBar position="sticky" elevation={0} sx={{ bgcolor: "#FFFFFF", borderBottom: "1px solid #E8EDF5" }}>
      <Toolbar disableGutters sx={{
        ...CONTAINER,
        position: "relative",
        width: "100%",
        minHeight: { xs: 68, md: 76 },
        py: { xs: 1, md: 1.25 },
        display: "flex",
        alignItems: "center",
      }}>
        {/* Logo — left */}
        <Box
          display="flex"
          alignItems="center"
          gap={1.5}
          sx={{ cursor: "pointer", flexShrink: 0, zIndex: 2 }}
          onClick={() => navigate("/")}
        >
          <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: PRIMARY, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <AssignmentTurnedInIcon sx={{ color: "#FFF", fontSize: 22 }} />
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 800, color: NAVY, fontSize: "1.05rem", lineHeight: 1.15 }}>TaskFlow</Typography>
            <Typography sx={{ color: "#94A3B8", fontSize: "0.62rem", display: { xs: "none", sm: "block" }, lineHeight: 1.25, mt: 0.15 }}>
              Task Management System
            </Typography>
          </Box>
        </Box>

        {/* Nav links — true center */}
        <Box sx={{
          display: { xs: "none", lg: "flex" },
          position: "absolute",
          left: "50%",
          transform: "translateX(-50%)",
          alignItems: "center",
          gap: 4.5,
          zIndex: 1,
        }}>
          {NAV.map((item) => {
            const active = activePage === item.page;
            return (
              <Typography
                key={item.label}
                onClick={() => handleNav(item)}
                sx={{
                  ...navLinkSx,
                  color: active ? PRIMARY : navLinkSx.color,
                  fontWeight: active ? 600 : navLinkSx.fontWeight,
                  position: "relative",
                  "&::after": active ? {
                    content: '""',
                    position: "absolute",
                    left: 0,
                    right: 0,
                    bottom: 0,
                    height: 2,
                    bgcolor: PRIMARY,
                    borderRadius: 1,
                  } : undefined,
                }}
              >
                {item.label}
              </Typography>
            );
          })}
        </Box>

        {/* Actions — right */}
        <Box sx={{ ml: "auto", display: "flex", alignItems: "center", gap: 2, flexShrink: 0, zIndex: 2 }}>
          <Button
            onClick={() => navigate("/login")}
            sx={{
              textTransform: "none",
              color: NAVY,
              fontWeight: 600,
              fontSize: "0.875rem",
              display: { xs: "none", sm: "inline-flex" },
              minWidth: "auto",
              px: 1.5,
              py: 0.75,
            }}
          >
            Login
          </Button>
          <Button
            variant="contained"
            onClick={() => navigate("/register")}
            sx={{
              textTransform: "none",
              bgcolor: PRIMARY,
              fontSize: "0.875rem",
              fontWeight: 600,
              px: 2.75,
              py: 1.05,
              borderRadius: 2,
              whiteSpace: "nowrap",
              boxShadow: "none",
              "&:hover": { bgcolor: "#004BB5", boxShadow: "none" },
            }}
          >
            Get Started Free
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

LandingNavbar.propTypes = { activePage: PropTypes.string };
LandingNavbar.defaultProps = { activePage: "home" };
