import { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  MenuItem,
  Grid,
  Chip,
} from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import RestartAltIcon from "@mui/icons-material/RestartAlt";

const card = { borderRadius: 3, bgcolor: "#FFFFFF", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" };

export default function ReportFilter({ onFilterChange, onReset }) {
  const [filters, setFilters] = useState({ startDate: "", endDate: "", department: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleApply = (e) => {
    e.preventDefault();
    onFilterChange?.(filters);
  };

  const handleResetForm = () => {
    setFilters({ startDate: "", endDate: "", department: "" });
    onReset?.();
  };

  return (
    <Box component="form" onSubmit={handleApply} sx={{ ...card, p: 2.5 }}>
      <Grid container spacing={2} alignItems="flex-end">
        <Grid item xs={12} sm={6} md={3}>
          <Typography sx={{ fontSize: "0.8rem", fontWeight: 600, color: "#64748B", mb: 0.8 }}>Start Date</Typography>
          <TextField type="date" name="startDate" value={filters.startDate} onChange={handleChange} fullWidth size="small"
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, bgcolor: "#F8FAFC" } }} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Typography sx={{ fontSize: "0.8rem", fontWeight: 600, color: "#64748B", mb: 0.8 }}>End Date</Typography>
          <TextField type="date" name="endDate" value={filters.endDate} onChange={handleChange} fullWidth size="small"
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, bgcolor: "#F8FAFC" } }} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Typography sx={{ fontSize: "0.8rem", fontWeight: 600, color: "#64748B", mb: 0.8 }}>Department</Typography>
          <TextField select name="department" value={filters.department} onChange={handleChange} fullWidth size="small"
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, bgcolor: "#F8FAFC" } }}>
            <MenuItem value="">All Departments</MenuItem>
            <MenuItem value="Engineering">Engineering</MenuItem>
            <MenuItem value="HR">HR</MenuItem>
            <MenuItem value="Finance">Finance</MenuItem>
            <MenuItem value="Operations">Operations</MenuItem>
          </TextField>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Box display="flex" gap={1}>
            <Button type="submit" variant="contained" startIcon={<FilterListIcon />} sx={{ flex: 1, textTransform: "none", bgcolor: "#2563EB", borderRadius: 2, fontWeight: 600, "&:hover": { bgcolor: "#1D4ED8" } }}>Filter</Button>
            <Button type="button" variant="outlined" onClick={handleResetForm} startIcon={<RestartAltIcon />} sx={{ textTransform: "none", borderColor: "#E2E8F0", color: "#334155", borderRadius: 2, fontWeight: 600 }}>Reset</Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
