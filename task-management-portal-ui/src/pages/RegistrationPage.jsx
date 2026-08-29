import React, { useState } from "react";
import { Box, Grid } from "@mui/material";

// All imported relative to src/pages/Register.jsx
import RegistrationLayout from "../components/registration/RegistrationLayout";
import RegistrationStepper from "../components/registration/RegistrationStepper";
import WizardFooter from "../components/registration/WizardFooter";
import StepBasicInfo from "../components/registration/StepBasicInfo";
import StepCompanyInfo from "../components/registration/StepCompanyInfo";
import StepAddress from "../components/registration/StepAddress";
import StepDocuments from "../components/registration/StepDocuments";
import StepAccount from "../components/registration/StepAccount";

const initialFormData = {
  // Basic Info
  employeeCode: "",
  firstName: "",
  lastName: "",
  gender: "",
  dob: "",
  mobile: "",
  email: "",

  // Company Info
  department: "",
  designation: "",
  reportingManager: "",
  joiningDate: "",
  employmentType: "Permanent",
  status: "Active",
  officeLocation: "",

  // Address Details
  currentAddress: "",
  currentCountry: "",
  currentState: "",
  currentCity: "",
  currentPinCode: "",
  permanentAddress: "",
  permanentCountry: "",
  permanentState: "",
  permanentCity: "",
  permanentPinCode: "",

  // Documents
  documents: {},

  // Account & Security
  username: "",
  systemRole: "Employee",
  password: "",
  confirmPassword: "",
  requirePasswordReset: true,
  enableTwoFactor: false,
};

export default function Register() {
  const [activeStep, setActiveStep] = useState(1);
  const [formData, setFormData] = useState(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateFormData = (newData) => {
    setFormData((prev) => ({ ...prev, ...newData }));
  };

  const handleNext = () => {
    if (activeStep < 5) setActiveStep((prev) => prev + 1);
  };

  const handlePrevious = () => {
    if (activeStep > 1) setActiveStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      alert("Employee registered successfully!");
    }, 1200);
  };

  const renderActiveStepComponent = () => {
    switch (activeStep) {
      case 1:
        return <StepBasicInfo formData={formData} updateFormData={updateFormData} />;
      case 2:
        return <StepCompanyInfo formData={formData} updateFormData={updateFormData} />;
      case 3:
        return <StepAddress formData={formData} updateFormData={updateFormData} />;
      case 4:
        return <StepDocuments formData={formData} updateFormData={updateFormData} />;
      case 5:
        return <StepAccount formData={formData} updateFormData={updateFormData} />;
      default:
        return null;
    }
  };

  return (
    <RegistrationLayout currentStep={activeStep} totalSteps={5}>
      <Grid container sx={{ flex: 1, minHeight: 500 }}>
        {/* Left Navigation Stepper */}
        <Grid
          item
          xs={12}
          md={3.5}
          sx={{
            borderRight: { md: "1px solid #F1F5F9" },
            bgcolor: "#FAFAFA",
          }}
        >
          <RegistrationStepper
            activeStep={activeStep}
            onStepClick={(step) => setActiveStep(step)}
          />
        </Grid>

        {/* Main Content Area & Controls */}
        <Grid
          item
          xs={12}
          md={8.5}
          sx={{
            p: { xs: 3, sm: 4, md: 5 },
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <Box>{renderActiveStepComponent()}</Box>

          <WizardFooter
            activeStep={activeStep}
            totalSteps={5}
            onPrevious={handlePrevious}
            onNext={handleNext}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        </Grid>
      </Grid>
    </RegistrationLayout>
  );
}