import React from "react";
import PropTypes from "prop-types";
import { Box, Button, CircularProgress } from "@mui/material";

export default function WizardFooter({
  activeStep,
  totalSteps,
  onPrevious,
  onNext,
  onSubmit,
  isSubmitting,
}) {
  const isLastStep = activeStep === totalSteps;

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        pt: 3,
        mt: 3,
        borderTop: "1px solid",
        borderColor: "divider",
      }}
    >
      <Button
        variant="outlined"
        onClick={onPrevious}
        disabled={activeStep === 1 || isSubmitting}
      >
        Previous
      </Button>

      <Box sx={{ display: "flex", gap: 2 }}>
        {isLastStep ? (
          <Button
            variant="contained"
            color="primary"
            onClick={onSubmit}
            disabled={isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={18} color="inherit" /> : null}
          >
            {isSubmitting ? "Submitting..." : "Complete Registration"}
          </Button>
        ) : (
          <Button variant="contained" onClick={onNext}>
            Next
          </Button>
        )}
      </Box>
    </Box>
  );
}

WizardFooter.propTypes = {
  activeStep: PropTypes.number.isRequired,
  totalSteps: PropTypes.number.isRequired,
  onPrevious: PropTypes.func.isRequired,
  onNext: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  isSubmitting: PropTypes.bool,
};