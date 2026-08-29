import { Card, CardContent, Typography, Box } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import dayjs from "dayjs";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

function CalendarWidget() {
  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 3,
        boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
      }}
    >
      <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
        <Typography
          variant="h6"
          sx={{ fontWeight: 700, color: "#0F172A", fontSize: "1.05rem", mb: 1 }}
        >
          My Calendar
        </Typography>

        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DateCalendar
            defaultValue={dayjs("2025-05-22")}
            sx={{
              width: "100%",
              "& .MuiPickersCalendarHeader-root": {
                pl: 0,
                pr: 0,
              },
              "& .MuiPickersCalendarHeader-label": {
                fontWeight: 600,
                color: "#0F172A",
                fontSize: "0.95rem",
              },
              "& .MuiDayCalendar-header": {
                justifyContent: "space-around",
              },
              "& .MuiDayCalendar-weekDayLabel": {
                color: "#94A3B8",
                fontWeight: 500,
                fontSize: "0.75rem",
              },
              "& .MuiPickersDay-root": {
                fontSize: "0.85rem",
                fontWeight: 500,
                color: "#334155",
                "&.Mui-selected": {
                  bgcolor: "#2563EB !important",
                  color: "#FFFFFF",
                  fontWeight: 700,
                },
                "&:hover": {
                  bgcolor: "#EFF6FF",
                },
              },
              "& .MuiPickersArrowSwitcher-button": {
                color: "#64748B",
              },
            }}
            slots={{
              leftArrowIcon: ChevronLeftIcon,
              rightArrowIcon: ChevronRightIcon,
            }}
          />
        </LocalizationProvider>

        <Box display="flex" justifyContent="center" mt={-1}>
          <Box
            component="button"
            sx={{
              px: 2,
              py: 0.5,
              borderRadius: 5,
              border: "1px solid #E2E8F0",
              bgcolor: "#FFFFFF",
              color: "#64748B",
              fontSize: "0.78rem",
              fontWeight: 500,
              cursor: "pointer",
              "&:hover": { bgcolor: "#F8FAFC" },
            }}
          >
            Today
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

export default CalendarWidget;
