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
  
  const departmentData = [
    {
      department: "IT",
      employees: 42,
    },
    {
      department: "HR",
      employees: 15,
    },
    {
      department: "Finance",
      employees: 18,
    },
    {
      department: "Sales",
      employees: 25,
    },
    {
      department: "Marketing",
      employees: 20,
    },
  ];
  
  function DepartmentStatistics() {
    return (
      <Card
        elevation={4}
        sx={{
          borderRadius: 3,
          height: "100%",
        }}
      >
        <CardContent>
          <Typography
            variant="h6"
            fontWeight="bold"
            mb={2}
          >
            Department Statistics
          </Typography>
  
          <ResponsiveContainer
            width="100%"
            height={300}
          >
            <BarChart data={departmentData}>
              <CartesianGrid strokeDasharray="3 3" />
  
              <XAxis dataKey="department" />
  
              <YAxis />
  
              <Tooltip />
  
              <Bar
                dataKey="employees"
                fill="#1976d2"
                radius={[5, 5, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    );
  }
  
  export default DepartmentStatistics;