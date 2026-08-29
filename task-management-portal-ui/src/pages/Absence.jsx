import { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";

function Absence() {
  const [leave, setLeave] = useState({
    leaveType: "",
    fromDate: "",
    toDate: "",
    reason: "",
  });

  const handleChange = (e) => {
    setLeave({
      ...leave,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = () => {
    // Spring Boot API
    // axios.post("/api/leaves", leave);
  };

  return (
    <Box p={3}>
      <Typography variant="h4" fontWeight="bold" mb={3}>
        Apply Leave
      </Typography>

      <Card>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="Leave Type"
                name="leaveType"
                value={leave.leaveType}
                onChange={handleChange}
              >
                <MenuItem value="Casual Leave">Casual Leave</MenuItem>
                <MenuItem value="Sick Leave">Sick Leave</MenuItem>
                <MenuItem value="Earned Leave">Earned Leave</MenuItem>
                <MenuItem value="Work From Home">Work From Home</MenuItem>
                <MenuItem value="Half Day">Half Day</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="date"
                label="From Date"
                name="fromDate"
                value={leave.fromDate}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="date"
                label="To Date"
                name="toDate"
                value={leave.toDate}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Reason"
                name="reason"
                value={leave.reason}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12}>
              <Button
                variant="contained"
                size="large"
                onClick={handleSubmit}
              >
                Submit Leave Request
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
}

export default Absence;