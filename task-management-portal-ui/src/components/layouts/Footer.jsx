import { Box, Typography, Link, Stack } from "@mui/material";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        mt: "auto",
        py: 2.5,
        px: { xs: 2, sm: 4 },
        borderTop: "1px solid #E2E8F0",
        bgcolor: "#FFFFFF",
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },
        justifyContent: "space-between",
        alignItems: "center",
        gap: 1.5,
      }}
    >
      {/* Copyright Information */}
      <Typography variant="body2" sx={{ color: "#64748B", fontSize: "0.875rem" }}>
        © {currentYear} <strong>Task Portal</strong>. All rights reserved.
      </Typography>

      {/* Footer Navigation Links */}
      <Stack
        direction="row"
        spacing={2.5}
        sx={{
          fontSize: "0.875rem",
          "& a": {
            color: "#64748B",
            textDecoration: "none",
            fontWeight: 500,
            transition: "color 0.2s ease-in-out",
            "&:hover": {
              color: "#3B82F6",
            },
          },
        }}
      >
        <Link href="#" underline="none">
          Privacy Policy
        </Link>
        <Link href="#" underline="none">
          Terms of Service
        </Link>
        <Link href="#" underline="none">
          Support
        </Link>
      </Stack>
    </Box>
  );
}