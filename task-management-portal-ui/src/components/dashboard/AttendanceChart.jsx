import { Card, CardContent, Typography } from "@mui/material";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";

const attendanceData = [
  {
    name: "Present",
    value: 92,
  },
  {
    name: "Absent",
    value: 5,
  },
  {
    name: "Leave",
    value: 3,
  },
];

const COLORS = [
  "#4CAF50",
  "#F44336",
  "#FFC107",
];

function AttendanceChart() {
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
          Attendance Summary
        </Typography>

        <ResponsiveContainer
          width="100%"
          height={300}
        >
          <PieChart>
            <Pie
              data={attendanceData}
              dataKey="value"
              nameKey="name"
              outerRadius={100}
              label
            >
              {attendanceData.map((entry, index) => (
                <Cell
                  key={index}
                  fill={COLORS[index]}
                />
              ))}
            </Pie>

            <Tooltip />

            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export default AttendanceChart;