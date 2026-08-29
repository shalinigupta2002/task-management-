import PropTypes from "prop-types";
import { Box, Typography } from "@mui/material";

export default function StepHeader({ title, subtitle, icon }) {
  return (
    <Box sx={{ mb: 3.5 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 0.5 }}>
        {icon && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#38BDF8",
              fontSize: 28,
            }}
          >
            {icon}
          </Box>
        )}
        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            fontSize: { xs: "1.25rem", sm: "1.4rem" },
            color: "#FFFFFF",
            letterSpacing: "-0.01em",
          }}
        >
          {title}
        </Typography>
      </Box>

      {subtitle && (
        <Typography
          variant="body2"
          sx={{
            color: "rgba(255, 255, 255, 0.6)",
            fontSize: "0.875rem",
            lineHeight: 1.5,
          }}
        >
          {subtitle}
        </Typography>
      )}
    </Box>
  );
}

StepHeader.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  icon: PropTypes.node,
};