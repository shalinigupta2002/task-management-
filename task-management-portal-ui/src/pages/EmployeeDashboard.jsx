import { Box, Grid } from "@mui/material";
import EmployeeLayout from "../components/layouts/EmployeeLayout";
import DashboardCards from "../components/dashboard/DashboardCards";
import RecentTasks from "../components/dashboard/RecentTasks";
import UpcomingTasks from "../components/dashboard/NearingDueTasks";
import CalendarWidget from "../components/dashboard/CalendarWidget";
import TaskWorkflow from "../components/dashboard/TaskWorkflow";

export default function EmployeeDashboard() {
  return (
    <EmployeeLayout>
      <Box sx={{ pb: 3 }}>
        <DashboardCards />
        <Grid container spacing={2.5} sx={{ mt: 0.5 }}>
          <Grid item xs={12} lg={8}>
            <RecentTasks employeeMode />
          </Grid>
          <Grid item xs={12} lg={4}>
            <Box display="flex" flexDirection="column" gap={2.5}>
              <CalendarWidget />
              <UpcomingTasks />
            </Box>
          </Grid>
        </Grid>
        <Box sx={{ mt: 2.5 }}>
          <TaskWorkflow />
        </Box>
      </Box>
    </EmployeeLayout>
  );
}
