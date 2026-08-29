import { useState } from "react";
import { Box, Button, Grid, Typography } from "@mui/material";

// Icons for vertical stepper
import PersonIcon from "@mui/icons-material/Person";
import BusinessIcon from "@mui/icons-material/Business";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import FolderIcon from "@mui/icons-material/Folder";
import LockIcon from "@mui/icons-material/Lock";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

import StepBasicInfo from "./StepBasicInfo";
import StepCompanyInfo from "./StepCompanyInfo";
import StepAddress from "./StepAddress";
import StepDocuments from "./StepDocuments";
import StepAccount from "./StepAccount";

const steps = [
  { label: "Basic Info", subtext: "Personal details", icon: <PersonIcon /> },
  { label: "Company", subtext: "Department & Role", icon: <BusinessIcon /> },
  { label: "Address", subtext: "Current & Permanent", icon: <LocationOnIcon /> },
  { label: "Documents", subtext: "Identity & Files", icon: <FolderIcon /> },
  { label: "Account", subtext: "Security & Login", icon: <LockIcon /> },
];

function StepperForm() {
  const [activeStep, setActiveStep] = useState(0);

  const [formData, setFormData] = useState({
    employeeCode: "",
    firstName: "",
    lastName: "",
    gender: "",
    dob: "",
    bloodGroup: "",
    mobile: "",
    email: "",

    department: "",
    designation: "",
    reportingManager: "",
    joiningDate: "",
    employmentType: "",
    status: "",
    officeLocation: "",

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

    selectedIdType: "aadhaar",
    idDocumentUrl: "",

    profilePhoto: null,
    resume: null,
    certificates: null,

    username: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
  });

  const updateFormData = (data) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const nextStep = () => setActiveStep((prev) => Math.min(prev + 1, steps.length - 1));
  const backStep = () => setActiveStep((prev) => Math.max(prev - 1, 0));

  const renderStep = () => {
    switch (activeStep) {
      case 0:
        return <StepBasicInfo formData={formData} updateFormData={updateFormData} />;
      case 1:
        return <StepCompanyInfo formData={formData} updateFormData={updateFormData} />;
      case 2:
        return <StepAddress formData={formData} updateFormData={updateFormData} />;
      case 3:
        return <StepDocuments formData={formData} updateFormData={updateFormData} />;
      case 4:
        return <StepAccount formData={formData} updateFormData={updateFormData} />;
      default:
        return null;
    }
  };

  return (
    <Box sx={{ width: "100%", color: "#fff" }}>
      {/* Top Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, color: "#fff" }}>
          Employee Setup Portal
        </Typography>
        <Typography variant="body2" sx={{ color: "rgba(255, 255, 255, 0.5)" }}>
          Follow the simple steps to complete employee registration.
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* Left Sidebar Steps */}
        <Grid item xs={12} md={4}>
          <Box
            sx={{
              position: "relative",
              pl: 1,
              "&::before": {
                content: '""',
                position: "absolute",
                top: 24,
                bottom: 24,
                left: 27,
                width: "2px",
                background: "rgba(255, 255, 255, 0.1)",
                zIndex: 0,
              },
            }}
          >
            {steps.map((s, index) => {
              const isActive = activeStep === index;
              const isCompleted = activeStep > index;

              return (
                <Box
                  key={s.label}
                  onClick={() => setActiveStep(index)}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    mb: 3,
                    cursor: "pointer",
                    position: "relative",
                    zIndex: 1,
                  }}
                >
                  <Box
                    sx={{
                      width: 42,
                      height: 42,
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: isCompleted || isActive ? "#10B981" : "rgba(255,255,255,0.08)",
                      color: isCompleted || isActive ? "#fff" : "rgba(255,255,255,0.4)",
                      boxShadow: isActive ? "0 0 15px rgba(16, 185, 129, 0.5)" : "none",
                      transition: "all 0.3s ease",
                      mr: 2,
                    }}
                  >
                    {s.icon}
                  </Box>

                  <Box>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        color: isActive
                          ? "#fff"
                          : isCompleted
                          ? "rgba(255,255,255,0.8)"
                          : "rgba(255,255,255,0.4)",
                        fontWeight: isActive ? 700 : 500,
                      }}
                    >
                      {s.label}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.4)" }}>
                      {s.subtext}
                    </Typography>
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Grid>

        {/* Right Active Form Area */}
        <Grid item xs={12} md={8}>
          <Box
            sx={{
              borderLeft: { md: "1px solid rgba(255,255,255,0.08)" },
              pl: { md: 5 },
              minHeight: "420px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <Box>
              <Typography variant="caption" sx={{ color: "#10B981", fontWeight: 700, letterSpacing: 1 }}>
                STEP 0{activeStep + 1}
              </Typography>
              <Typography variant="h5" sx={{ color: "#fff", fontWeight: 800, mt: 0.5, mb: 3 }}>
                {steps[activeStep].label}
              </Typography>

              {renderStep()}
            </Box>

            {/* Bottom Actions */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mt: 5,
                pt: 3,
                borderTop: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <Button
                disabled={activeStep === 0}
                onClick={backStep}
                startIcon={<ArrowBackIcon />}
                sx={{
                  color: "#fff",
                  textTransform: "none",
                  borderRadius: "10px",
                  px: 3,
                  "&:disabled": { color: "rgba(255,255,255,0.2)" },
                }}
              >
                Previous
              </Button>

              <Button
                variant="contained"
                onClick={nextStep}
                endIcon={<ArrowForwardIcon />}
                sx={{
                  background: "#10B981",
                  color: "#fff",
                  fontWeight: 700,
                  borderRadius: "12px",
                  px: 4,
                  py: 1.2,
                  textTransform: "none",
                  boxShadow: "0 8px 20px rgba(16, 185, 129, 0.3)",
                  "&:hover": { background: "#059669" },
                }}
              >
                {activeStep === steps.length - 1 ? "Finish & Submit" : "Next Step"}
              </Button>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}

export default StepperForm;