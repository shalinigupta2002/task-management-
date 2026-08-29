import PropTypes from "prop-types";
import { Box, Typography, Button } from "@mui/material";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import WifiOffIcon from "@mui/icons-material/WifiOff";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { useNavigate } from "react-router-dom";
import { card } from "./styles";

const CONFIG = {
  404: { code: "404", title: "Page Not Found", description: "The page you are looking for does not exist or has been moved.", icon: ErrorOutlineIcon, color: "#2563EB" },
  403: { code: "403", title: "Access Denied", description: "You do not have permission to access this resource.", icon: LockOutlinedIcon, color: "#DC2626" },
  500: { code: "500", title: "Something Went Wrong", description: "An unexpected error occurred. Please try again later.", icon: ErrorOutlineIcon, color: "#EA580C" },
  network: { code: "Offline", title: "No Internet Connection", description: "Please check your connection and try again.", icon: WifiOffIcon, color: "#64748B" },
};

export default function ErrorState({ type = "404", title, description, actionLabel = "Go Back", onAction }) {
  const navigate = useNavigate();
  const cfg = CONFIG[type] || CONFIG[404];
  const Icon = cfg.icon;

  return (
    <Box sx={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", p: 3 }} role="alert">
      <Box sx={{ ...card, textAlign: "center", maxWidth: 480, py: 5, px: 4 }}>
        <Box sx={{ width: 72, height: 72, borderRadius: 3, bgcolor: `${cfg.color}15`, display: "flex", alignItems: "center", justifyContent: "center", mx: "auto", mb: 2 }}>
          <Icon sx={{ color: cfg.color, fontSize: 36 }} />
        </Box>
        <Typography sx={{ fontWeight: 800, color: cfg.color, fontSize: "2.5rem", mb: 0.5 }}>{cfg.code}</Typography>
        <Typography sx={{ fontWeight: 700, color: "#0F172A", fontSize: "1.2rem", mb: 1 }}>{title || cfg.title}</Typography>
        <Typography sx={{ color: "#64748B", fontSize: "0.9rem", mb: 3 }}>{description || cfg.description}</Typography>
        <Button variant="contained" onClick={onAction || (() => navigate(-1))} sx={{ textTransform: "none", bgcolor: "#2563EB", borderRadius: 2 }}>
          {actionLabel}
        </Button>
      </Box>
    </Box>
  );
}

ErrorState.propTypes = {
  type: PropTypes.oneOf(["404", "403", "500", "network"]),
  title: PropTypes.string,
  description: PropTypes.string,
  actionLabel: PropTypes.string,
  onAction: PropTypes.func,
};
