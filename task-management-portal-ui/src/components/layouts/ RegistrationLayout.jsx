import React from "react";
import { Box, Container, Paper, Typography, Chip } from "@mui/material";

/**
 * Modern Clean Layout inspired by Stripe & Atlassian design systems.
 * Palette: White, Slate/Light Blue (#0969DA, #EFF6FF), Light Grey (#F8FAFC).
 */
export default function RegistrationLayout({
  children,
  currentStep = 5,
  totalSteps = 5,
}) {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#F8FAFC",
        background: "radial-gradient(circle at 50% 0%, #EFF6FF 0%, #F8FAFC 70%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: { xs: 2, sm: 4 },
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      <Container maxWidth="lg" disableGutters>
        <Paper
          elevation={0}
          sx={{
            bgcolor: "#FFFFFF",
            borderRadius: "16px",
            border: "1px solid #E2E8F0",
            boxShadow:
              "0 20px 25px -5px rgba(15, 23, 42, 0.05), 0 8px 10px -6px rgba(15, 23, 42, 0.03)",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Top Wizard Bar */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              px: { xs: 3, sm: 4 },
              py: 2.5,
              borderBottom: "1px solid #F1F5F9",
              bgcolor: "#FFFFFF",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Box
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  bgcolor: "#0969DA",
                  boxShadow: "0 0 0 4px #DBEAFE",
                }}
              />
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  fontSize: "1.05rem",
                  color: "#0F172A",
                  letterSpacing: "-0.02em",
                }}
              >
                Registration Wizard
              </Typography>
            </Box>

            <Chip
              label={`Step ${currentStep} of ${totalSteps}`}
              size="small"
              sx={{
                bgcolor: "#EFF6FF",
                color: "#0969DA",
                fontWeight: 600,
                fontSize: "0.8rem",
                borderRadius: "20px",
                px: 1,
                border: "1px solid #DBEAFE",
              }}
            />
          </Box>

          {/* Main Card Content Body */}
          <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
            {children}
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}