import {
    Card,
    CardContent,
    Typography,
    Grid,
    Button,
  } from "@mui/material";
  
  import PersonAddIcon from "@mui/icons-material/PersonAdd";
  import AssignmentIcon from "@mui/icons-material/Assignment";
  import EventBusyIcon from "@mui/icons-material/EventBusy";
  import DescriptionIcon from "@mui/icons-material/Description";
  import AccountCircleIcon from "@mui/icons-material/AccountCircle";
  import SettingsIcon from "@mui/icons-material/Settings";
  
  import { useNavigate } from "react-router-dom";
  
  function QuickActions() {
    const navigate = useNavigate();
  
    const actions = [
      {
        title: "Add Employee",
        icon: <PersonAddIcon />,
        color: "primary",
        path: "/register",
      },
      {
        title: "Assign Task",
        icon: <AssignmentIcon />,
        color: "success",
        path: "/tasks",
      },
      {
        title: "Apply Leave",
        icon: <EventBusyIcon />,
        color: "warning",
        path: "/absence",
      },
      {
        title: "Reports",
        icon: <DescriptionIcon />,
        color: "secondary",
        path: "/reports",
      },
      {
        title: "My Profile",
        icon: <AccountCircleIcon />,
        color: "info",
        path: "/profile",
      },
      {
        title: "Settings",
        icon: <SettingsIcon />,
        color: "inherit",
        path: "/settings",
      },
    ];
  
    return (
      <Card
        elevation={4}
        sx={{
          mt: 3,
          borderRadius: 3,
        }}
      >
        <CardContent>
          <Typography
            variant="h6"
            fontWeight="bold"
            mb={3}
          >
            Quick Actions
          </Typography>
  
          <Grid container spacing={2}>
            {actions.map((action) => (
              <Grid item xs={12} sm={6} md={4} key={action.title}>
                <Button
                  fullWidth
                  variant="contained"
                  color={action.color}
                  startIcon={action.icon}
                  sx={{
                    py: 2,
                    borderRadius: 2,
                    textTransform: "none",
                    fontWeight: "bold",
                  }}
                  onClick={() => navigate(action.path)}
                >
                  {action.title}
                </Button>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>
    );
  }
  
  export default QuickActions;