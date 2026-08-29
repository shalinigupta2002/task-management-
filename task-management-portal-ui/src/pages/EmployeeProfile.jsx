import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box } from "@mui/material";

// Layout & Stepper Imports
import RegistrationLayout from "../components/registration/RegistrationLayout";
import WizardFooter from "../components/registration/WizardFooter";

// Step Component Imports
import StepBasicInfo from "../components/registration/StepBasicInfo";
import StepCompanyInfo from "../components/registration/StepCompanyInfo";
import StepAddress from "../components/registration/StepAddress";
import StepDocuments from "../components/registration/StepDocuments";
import StepAccount from "../components/registration/StepAccount";
import SuccessState from "../components/registration/SuccessState";

const initialFormData = {
  employeeCode: "",
  firstName: "",
  lastName: "",
  gender: "",
  dob: "",
  mobile: "",
  email: "",

  companyName: "",
  companyCode: "",
  department: "",
  designation: "",
  reportingManager: "",
  joiningDate: "",
  employmentType: "Full Time",
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
  idDocumentNumber: "",
  idDocumentUrl: "",

  username: "",
  systemRole: "Employee",
  password: "",
  confirmPassword: "",
  requirePasswordReset: true,
  enableTwoFactor: false,
};

export default function Register() {
  const navigate = useNavigate();

  const [activeStep, setActiveStep] = useState(1);
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const updateFormData = (newData) => {
    setFormData((prev) => ({ ...prev, ...newData }));
    setErrors({});
  };

  const handleNext = () => {
    if (activeStep < 5) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (activeStep > 1) {
      setActiveStep((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Generate random Employee Code if not set
      const autoEmpCode =
        formData.employeeCode || `EMP-${Math.floor(100 + Math.random() * 900)}`;

      // Construct file label based on actual uploaded file or selected document type
      const documentName = formData.idDocumentUrl
        ? "Identity Document Link"
        : `${(formData.selectedIdType || "Identification").toUpperCase()}_Document`;

      const documentList = [
        {
          id: "id-doc-1",
          name: documentName,
          type: formData.selectedIdType || "Identification",
          idNumber: formData.idDocumentNumber || "",
          uploadDate: new Date().toISOString().split("T")[0],
          url: formData.idDocumentUrl || "",
          status: "Verified",
        },
      ];

      const { idDocumentFile: _, ...cleanFormData } = formData;

      const completeProfileData = {
        ...cleanFormData,
        employeeCode: autoEmpCode,
        documents: documentList,
      };

      // Synchronize to localStorage for both Login and Profile components
      localStorage.setItem("registeredUser", JSON.stringify(completeProfileData));
      localStorage.setItem("employeeProfile", JSON.stringify(completeProfileData));
      localStorage.setItem("formData", JSON.stringify(completeProfileData));

      setIsCompleted(true);
    } catch (error) {
      console.error("Submission Failure", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (activeStep) {
      case 1:
        return (
          <StepBasicInfo
            formData={formData}
            updateFormData={updateFormData}
            errors={errors}
          />
        );
      case 2:
        return (
          <StepCompanyInfo
            formData={formData}
            updateFormData={updateFormData}
            errors={errors}
          />
        );
      case 3:
        return (
          <StepAddress
            formData={formData}
            updateFormData={updateFormData}
            errors={errors}
          />
        );
      case 4:
        return (
          <StepDocuments
            formData={formData}
            updateFormData={updateFormData}
          />
        );
      case 5:
        return (
          <StepAccount
            formData={formData}
            updateFormData={updateFormData}
            errors={errors}
          />
        );
      default:
        return null;
    }
  };

  return (
    <RegistrationLayout
      activeStep={activeStep}
      totalSteps={5}
      onStepClick={(step) => setActiveStep(step)}
    >
      {isCompleted ? (
        <SuccessState formData={formData} onFinish={() => navigate("/login")} />
      ) : (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            height: "100%",
            justifyContent: "space-between",
          }}
        >
          <Box sx={{ flex: 1 }}>{renderStep()}</Box>
          <WizardFooter
            activeStep={activeStep}
            totalSteps={5}
            onPrevious={handlePrevious}
            onNext={handleNext}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        </Box>
      )}
    </RegistrationLayout>
  );
}