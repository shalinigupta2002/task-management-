import { Box, Card, Typography } from "@mui/material";

import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import SecurityIcon from "@mui/icons-material/Security";
import BadgeIcon from "@mui/icons-material/Badge";

const roles = [
  {
    id: "SUPER_ADMIN",
    title: "Super Admin",
    subtitle: "System Configuration & Full Control",
    icon: <AdminPanelSettingsIcon sx={{ fontSize: 42 }} />,
    color: "#DC2626",
  },
  {
    id: "ADMIN",
    title: "Admin",
    subtitle: "Department & Employee Management",
    icon: <SecurityIcon sx={{ fontSize: 42 }} />,
    color: "#2563EB",
  },
  {
    id: "EMPLOYEE",
    title: "Employee",
    subtitle: "Tasks, Attendance & Leave",
    icon: <BadgeIcon sx={{ fontSize: 42 }} />,
    color: "#16A34A",
  },
];

function RoleSelector({ value, onChange }) {
  return (
    <Box
      sx={{
        display: "grid",
        gap: 2,
        gridTemplateColumns: {
          xs: "1fr",
          sm: "repeat(3,1fr)",
        },
        mb: 4,
      }}
    >
      {roles.map((role) => {
        const selected = value === role.id;

        return (
          <Card
            key={role.id}
            onClick={() => onChange(role.id)}
            sx={{
              cursor: "pointer",

              borderRadius: 3,

              p: 3,

              textAlign: "center",

              transition: ".3s",

              border: selected
                ? `2px solid ${role.color}`
                : "2px solid transparent",

              background: selected
                ? `${role.color}10`
                : "#fff",

              "&:hover": {
                transform: "translateY(-5px)",
                boxShadow:
                  "0 12px 25px rgba(0,0,0,.10)",
              },
            }}
          >
            <Box
              sx={{
                width: 70,
                height: 70,
                mx: "auto",

                mb: 2,

                borderRadius: "50%",

                bgcolor: role.color,

                color: "#fff",

                display: "flex",

                alignItems: "center",

                justifyContent: "center",
              }}
            >
              {role.icon}
            </Box>

            <Typography
              fontWeight={700}
              fontSize={18}
            >
              {role.title}
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              mt={1}
            >
              {role.subtitle}
            </Typography>
          </Card>
        );
      })}
    </Box>
  );
}

export default RoleSelector;