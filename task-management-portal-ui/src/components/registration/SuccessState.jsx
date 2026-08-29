import PropTypes from "prop-types";
import { Box, Typography, Button, Paper, Divider, Stack } from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

export default function SuccessState({ formData, onFinish }) {
  return (
    <Box
      sx={{
        py: 4,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
      }}
    >
      <Box
        sx={{
          width: 68,
          height: 68,
          borderRadius: "50%",
          bgcolor: "rgba(16, 185, 129, 0.15)",
          border: "1px solid #10B981",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#10B981",
          mb: 2,
        }}
      >
        <CheckCircleOutlineIcon sx={{ fontSize: 40 }} />
      </Box>

      <Typography variant="h5" sx={{ fontWeight: 700, color: "#FFFFFF", mb: 1 }}>
        Registration Complete!
      </Typography>

      <Typography variant="body2" sx={{ color: "rgba(255, 255, 255, 0.6)", maxWidth: 420, mb: 3.5 }}>
        The employee account for{" "}
        <strong style={{ color: "#38BDF8" }}>
          {formData.firstName} {formData.lastName}
        </strong>{" "}
        has been initialized successfully.
      </Typography>

      <Paper
        elevation={0}
        sx={{
          width: "100%",
          maxWidth: 450,
          p: 3,
          borderRadius: "14px",
          bgcolor: "rgba(255, 255, 255, 0.03)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          textAlign: "left",
          mb: 4,
        }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#FFFFFF", mb: 2 }}>
          Account Summary
        </Typography>

        <Stack spacing={1.5}>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="caption" sx={{ color: "rgba(255, 255, 255, 0.5)" }}>
              Work Email
            </Typography>
            <Typography variant="caption" sx={{ fontWeight: 600, color: "#FFFFFF" }}>
              {formData.email || "N/A"}
            </Typography>
          </Box>

          <Divider sx={{ borderColor: "rgba(255, 255, 255, 0.08)" }} />

          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="caption" sx={{ color: "rgba(255, 255, 255, 0.5)" }}>
              Department
            </Typography>
            <Typography variant="caption" sx={{ fontWeight: 600, color: "#FFFFFF" }}>
              {formData.department || "N/A"}
            </Typography>
          </Box>

          <Divider sx={{ borderColor: "rgba(255, 255, 255, 0.08)" }} />

          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="caption" sx={{ color: "rgba(255, 255, 255, 0.5)" }}>
              System Role
            </Typography>
            <Typography variant="caption" sx={{ fontWeight: 600, color: "#38BDF8" }}>
              {formData.systemRole || "Employee"}
            </Typography>
          </Box>
        </Stack>
      </Paper>

      <Button
        variant="contained"
        endIcon={<ArrowForwardIcon />}
        onClick={onFinish}
        sx={{
          bgcolor: "#2563EB",
          color: "#FFFFFF",
          fontWeight: 600,
          textTransform: "none",
          borderRadius: "8px",
          px: 3.5,
          py: 1.2,
          "&:hover": { bgcolor: "#1D4ED8" },
        }}
      >
        Return to Portal
      </Button>
    </Box>
  );
}

SuccessState.propTypes = {
  formData: PropTypes.object.isRequired,
  onFinish: PropTypes.func.isRequired,
};