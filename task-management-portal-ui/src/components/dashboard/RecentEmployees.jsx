import {
    Avatar,
    Card,
    CardContent,
    Chip,
    Divider,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Typography,
  } from "@mui/material";
  
  const employees = [
    {
      id: 1,
      name: "John Doe",
      department: "IT",
      designation: "Software Engineer",
      joiningDate: "10 Jan 2026",
      status: "Active",
    },
    {
      id: 2,
      name: "Emily Smith",
      department: "HR",
      designation: "HR Executive",
      joiningDate: "18 Feb 2026",
      status: "Active",
    },
    {
      id: 3,
      name: "David Wilson",
      department: "Finance",
      designation: "Accountant",
      joiningDate: "05 Mar 2026",
      status: "Inactive",
    },
    {
      id: 4,
      name: "Sophia Brown",
      department: "Marketing",
      designation: "Marketing Executive",
      joiningDate: "20 Apr 2026",
      status: "Active",
    },
  ];
  
  function RecentEmployees() {
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
            Recently Joined Employees
          </Typography>
  
          <List>
            {employees.map((employee, index) => (
              <div key={employee.id}>
                <ListItem
                  secondaryAction={
                    <Chip
                      label={employee.status}
                      color={
                        employee.status === "Active"
                          ? "success"
                          : "error"
                      }
                      size="small"
                    />
                  }
                >
                  <ListItemAvatar>
                    <Avatar>
                      {employee.name.charAt(0)}
                    </Avatar>
                  </ListItemAvatar>
  
                  <ListItemText
                    primary={employee.name}
                    secondary={
                      <>
                        {employee.designation}
                        <br />
                        {employee.department}
                        <br />
                        Joined: {employee.joiningDate}
                      </>
                    }
                  />
                </ListItem>
  
                {index !== employees.length - 1 && <Divider />}
              </div>
            ))}
          </List>
        </CardContent>
      </Card>
    );
  }
  
  export default RecentEmployees;