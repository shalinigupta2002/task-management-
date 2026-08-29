import { Box, Typography, Grid, Chip } from "@mui/material";
import AssignmentIcon from "@mui/icons-material/Assignment";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PeopleIcon from "@mui/icons-material/People";
import ApartmentIcon from "@mui/icons-material/Apartment";

const card = { borderRadius: 3, bgcolor: "#FFFFFF", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", border: "1px solid #E8EDF5", p: 2 };

const STATS = [
  { title: "Total Tasks", value: "1,248", trend: "+12.5%", up: true, icon: AssignmentIcon, color: "#2563EB", bg: "#EFF6FF" },
  { title: "Completed Tasks", value: "432", trend: "+18.7%", up: true, icon: CheckCircleOutlineIcon, color: "#16A34A", bg: "#F0FDF4" },
  { title: "In Progress", value: "356", trend: "-6.4%", up: false, icon: HourglassEmptyIcon, color: "#F97316", bg: "#FFF7ED" },
  { title: "Overdue Tasks", value: "98", trend: "+8.3%", up: false, icon: AccessTimeIcon, color: "#FFFFFF", bg: "#DC2626" },
  { title: "Total Users", value: "156", trend: "+5.2%", up: true, icon: PeopleIcon, color: "#14B8A6", bg: "#F0FDFA" },
  { title: "Departments", value: "12", trend: "No change", up: null, icon: ApartmentIcon, color: "#EC4899", bg: "#FDF2F8" },
];

export default function AdminStatsCards() {
  return (
    <Grid container spacing={2}>
      {STATS.map((s) => {
        const Icon = s.icon;
        return (
          <Grid item xs={12} sm={6} md={4} lg={2} key={s.title}>
            <Box sx={card}>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1.5}>
                <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: s.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon sx={{ color: s.color, fontSize: 22 }} />
                </Box>
                {s.up !== null && (
                  <Chip label={s.trend} size="small" sx={{ height: 22, fontSize: "0.65rem", fontWeight: 600, bgcolor: s.up ? "#F0FDF4" : "#FEF2F2", color: s.up ? "#16A34A" : "#DC2626" }} />
                )}
              </Box>
              <Typography sx={{ fontWeight: 800, color: "#0F172A", fontSize: "1.5rem", lineHeight: 1.2 }}>{s.value}</Typography>
              <Typography sx={{ color: "#64748B", fontSize: "0.78rem", fontWeight: 500, mt: 0.3 }}>{s.title}</Typography>
              {s.up === null && <Typography sx={{ color: "#94A3B8", fontSize: "0.65rem", mt: 0.3 }}>{s.trend}</Typography>}
            </Box>
          </Grid>
        );
      })}
    </Grid>
  );
}
