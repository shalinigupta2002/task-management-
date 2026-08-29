import PropTypes from "prop-types";
import { Box, Typography } from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import BusinessIcon from "@mui/icons-material/Business";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import FolderIcon from "@mui/icons-material/Folder";
import LockIcon from "@mui/icons-material/Lock";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

const steps = [
  { stepNumber: 1, label: "Basic Info", subtitle: "Personal details", icon: <PersonIcon /> },
  { stepNumber: 2, label: "Company", subtitle: "Role & organization", icon: <BusinessIcon /> },
  { stepNumber: 3, label: "Address", subtitle: "Residential location", icon: <LocationOnIcon /> },
  { stepNumber: 4, label: "Documents", subtitle: "Identity verification", icon: <FolderIcon /> },
  { stepNumber: 5, label: "Account", subtitle: "Login credentials", icon: <LockIcon /> },
];

export default function RegistrationStepper({ activeStep = 1, onStepClick }) {
  const handleStepClick = (stepNumber) => {
    // Allows navigating back to previous/completed steps or step-by-step click
    if (onStepClick && stepNumber <= activeStep + 1) {
      onStepClick(stepNumber);
    }
  };

  return (
    <Box
      sx={{
        p: 3.5,
        display: "flex",
        flexDirection: "column",
        gap: 3,
        height: "100%",
      }}
    >
      {steps.map((step) => {
        const completed = activeStep > step.stepNumber;
        const active = activeStep === step.stepNumber;
        const isSelectable = step.stepNumber <= activeStep;

        return (
          <Box
            key={step.stepNumber}
            onClick={() => handleStepClick(step.stepNumber)}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              cursor: isSelectable ? "pointer" : "default",
              opacity: completed || active ? 1 : 0.45,
              transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
              p: 1,
              borderRadius: "10px",
              "&:hover": {
                opacity: 1,
                bgcolor: isSelectable ? "rgba(255, 255, 255, 0.04)" : "transparent",
              },
            }}
          >
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: completed
                  ? "#10B981"
                  : active
                  ? "#2563EB"
                  : "rgba(255, 255, 255, 0.08)",
                color: "#FFFFFF",
                fontWeight: 700,
                boxShadow: active ? "0 0 14px rgba(37, 99, 235, 0.6)" : "none",
                transition: "all 0.25s ease",
              }}
            >
              {completed ? <CheckCircleIcon sx={{ fontSize: 20 }} /> : step.icon}
            </Box>

            <Box>
              <Typography
                sx={{
                  fontWeight: active ? 700 : 500,
                  color: active ? "#FFFFFF" : "rgba(255, 255, 255, 0.8)",
                  fontSize: "0.925rem",
                }}
              >
                {step.label}
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: "rgba(255, 255, 255, 0.45)", display: "block" }}
              >
                {step.subtitle}
              </Typography>
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}

RegistrationStepper.propTypes = {
  activeStep: PropTypes.number,
  onStepClick: PropTypes.func,
};