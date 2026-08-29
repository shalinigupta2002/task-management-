import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Box,
  Button,
} from "@mui/material";

export default function ProfileCompletion() {
  const navigate = useNavigate();
  const [completion, setCompletion] = useState(0);

  useEffect(() => {
    try {
      const employee = JSON.parse(localStorage.getItem("employeeProfile"));

      if (!employee) {
        setCompletion(0);
        return;
      }

      // Exact field mapping from Registration Form steps
      const fields = [
        // Basic Info
        employee.employeeCode,
        employee.firstName,
        employee.lastName,
        employee.gender,
        employee.dob,
        employee.mobile,
        employee.email,

        // Company
        employee.companyName,
        employee.department,
        employee.designation,
        employee.reportingManager,
        employee.joiningDate,
        employee.employmentType,
        employee.officeLocation,

        // Address
        employee.currentAddress,
        employee.currentCity,
        employee.currentState,
        employee.currentCountry,
        employee.currentPinCode,

        // Document
        employee.idDocumentNumber,
        employee.idDocumentUrl || employee.idDocumentFile,

        // Account
        employee.username,
      ];

      const completedFields = fields.filter(
        (field) => field !== undefined && field !== null && field !== ""
      ).length;

      const percentage = Math.round((completedFields / fields.length) * 100);
      setCompletion(percentage);
    } catch (e) {
      console.error("Error calculating profile completion", e);
      setCompletion(0);
    }
  }, []);

  const getProgressColor = () => {
    if (completion === 100) return "success";
    if (completion >= 60) return "primary";
    return "warning";
  };

  return (
    <Card elevation={2} sx={{ borderRadius: 3, height: "100%" }}>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight="bold">
          Profile Completion
        </Typography>

        <Typography variant="body2" color="text.secondary" mt={1}>
          {completion === 100
            ? "Your employee profile is complete."
            : "Complete your employee profile to unlock all features."}
        </Typography>

        <Box mt={3}>
          <LinearProgress
            variant="determinate"
            value={completion}
            color={getProgressColor()}
            sx={{ height: 10, borderRadius: 5 }}
          />
        </Box>

        <Typography mt={2} fontWeight="bold">
          {completion}% Completed
        </Typography>

        <Button
          variant="contained"
          fullWidth
          sx={{ mt: 3, borderRadius: 2, textTransform: "none" }}
          onClick={() => navigate("/dashboard/profile")}
        >
          {completion === 100 ? "View Profile" : "Complete Profile"}
        </Button>
      </CardContent>
    </Card>
  );
}