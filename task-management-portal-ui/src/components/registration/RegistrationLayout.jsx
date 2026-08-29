import PropTypes from "prop-types";
import { Box, Paper, Typography } from "@mui/material";
import RegistrationStepper from "./RegistrationStepper";

export default function RegistrationLayout({
  children,
  activeStep = 1,
  totalSteps = 5,
  onStepClick,
}) {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "#020617",
        background: "radial-gradient(circle at 50% 50%, #0f172a 0%, #020617 100%)",
        py: 4,
        px: 2,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: "100%",
          maxWidth: 1100, // Matches Login container width exactly
          minHeight: 640, // Matches Login container height exactly
          borderRadius: "24px",
          overflow: "hidden",
          background: "rgba(255, 255, 255, 0.03)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.12)",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.7)",
          display: "flex",
          flexDirection: "column",
          color: "#FFFFFF",
        }}
      >
        {/* Top Header Bar */}
        <Box
          sx={{
            px: 4,
            py: 2.5,
            borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "rgba(255, 255, 255, 0.02)",
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700, color: "#FFFFFF", fontSize: "1.1rem" }}>
            Registration Wizard
          </Typography>

          <Typography
            sx={{
              px: 2,
              py: 0.5,
              borderRadius: 20,
              bgcolor: "rgba(56, 189, 248, 0.12)",
              color: "#38BDF8",
              fontWeight: 600,
              fontSize: 13,
              border: "1px solid rgba(56, 189, 248, 0.2)",
            }}
          >
            Step {activeStep} of {totalSteps}
          </Typography>
        </Box>

        {/* Inner Content Grid */}
        <Box sx={{ display: "flex", flex: 1, minHeight: 0, flexDirection: { xs: "column", md: "row" } }}>
          {/* SINGLE Left Navigation Stepper Sidebar */}
          <Box
            sx={{
              width: { xs: "100%", md: 300 },
              background: "rgba(255, 255, 255, 0.015)",
              borderRight: { md: "1px solid rgba(255, 255, 255, 0.1)" },
              borderBottom: { xs: "1px solid rgba(255, 255, 255, 0.1)", md: "none" },
            }}
          >
            <RegistrationStepper activeStep={activeStep} onStepClick={onStepClick} />
          </Box>

          {/* Right Active Form Area */}
          <Box
            sx={{
              flex: 1,
              p: { xs: 3, sm: 4, md: 4.5 },
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              overflowY: "auto",
            }}
          >
            {children}
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}

RegistrationLayout.propTypes = {
  children: PropTypes.node.isRequired,
  activeStep: PropTypes.number,
  totalSteps: PropTypes.number,
  onStepClick: PropTypes.func,
};