import {
    Card,
    CardContent,
    Typography,
  } from "@mui/material";
  
  import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
  } from "recharts";
  
  const data = [
    {
      month: "Jan",
      Completed: 18,
      Pending: 6,
    },
    {
      month: "Feb",
      Completed: 24,
      Pending: 8,
    },
    {
      month: "Mar",
      Completed: 30,
      Pending: 10,
    },
    {
      month: "Apr",
      Completed: 28,
      Pending: 9,
    },
    {
      month: "May",
      Completed: 36,
      Pending: 7,
    },
    {
      month: "Jun",
      Completed: 42,
      Pending: 5,
    },
  ];
  
  function DashboardChart() {
    return (
      <Card
        elevation={4}
        sx={{
          mt: 4,
          borderRadius: 3,
        }}
      >
        <CardContent>
          <Typography
            variant="h6"
            fontWeight="bold"
            mb={3}
          >
            Monthly Task Statistics
          </Typography>
  
          <ResponsiveContainer
            width="100%"
            height={350}
          >
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
  
              <XAxis dataKey="month" />
  
              <YAxis />
  
              <Tooltip />
  
              <Bar
                dataKey="Completed"
                fill="#2e7d32"
                radius={[5, 5, 0, 0]}
              />
  
              <Bar
                dataKey="Pending"
                fill="#ed6c02"
                radius={[5, 5, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    );
  }
  
  export default DashboardChart;