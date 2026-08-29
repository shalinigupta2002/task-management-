import PropTypes from "prop-types";
import { Box, Chip } from "@mui/material";
import FilterDropdown from "./FilterDropdown";

export function CalendarViewFilters({ view, onViewChange }) {
  return (
    <Box display="flex" gap={1} flexWrap="wrap" role="group" aria-label="Calendar view">
      {["Month", "Week", "Day"].map((v) => (
        <Chip
          key={v}
          label={v}
          onClick={() => onViewChange(v)}
          clickable
          sx={{ bgcolor: view === v ? "#2563EB" : "#F8FAFC", color: view === v ? "#FFF" : "#64748B", fontWeight: 600, fontSize: "0.78rem" }}
          aria-pressed={view === v}
        />
      ))}
    </Box>
  );
}

CalendarViewFilters.propTypes = {
  view: PropTypes.string.isRequired,
  onViewChange: PropTypes.func.isRequired,
};

export function ReportFilters({ department, onDepartment, employee, onEmployee, departments = [], employees = [] }) {
  return (
    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr 1fr" }, gap: 2 }}>
      <FilterDropdown label="Department" value={department} onChange={onDepartment} options={departments} />
      <FilterDropdown label="Employee" value={employee} onChange={onEmployee} options={employees} />
      <FilterDropdown label="Date Range" value="all" onChange={() => {}} options={["Last 7 days", "Last 30 days", "Last 90 days", "Custom"]} showAll={false} />
    </Box>
  );
}

ReportFilters.propTypes = {
  department: PropTypes.string.isRequired,
  onDepartment: PropTypes.func.isRequired,
  employee: PropTypes.string.isRequired,
  onEmployee: PropTypes.func.isRequired,
  departments: PropTypes.array,
  employees: PropTypes.array,
};

export function EmployeeTableFilters({ department, onDepartment, status, onStatus, role, onRole, departments = [], roles = [] }) {
  return (
    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" }, gap: 2 }}>
      <FilterDropdown label="Department" value={department} onChange={onDepartment} options={departments} />
      <FilterDropdown label="Status" value={status} onChange={onStatus} options={["Active", "Inactive", "Locked"]} />
      <FilterDropdown label="Role" value={role} onChange={onRole} options={roles.length ? roles : ["Admin", "Manager", "Reviewer", "Employee"]} />
    </Box>
  );
}

EmployeeTableFilters.propTypes = {
  department: PropTypes.string.isRequired,
  onDepartment: PropTypes.func.isRequired,
  status: PropTypes.string.isRequired,
  onStatus: PropTypes.func.isRequired,
  role: PropTypes.string.isRequired,
  onRole: PropTypes.func.isRequired,
  departments: PropTypes.array,
  roles: PropTypes.array,
};

export function TaskTableFilters({ priority, onPriority, category, onCategory, assignedBy, onAssignedBy, status, onStatus, categories = [], assigners = [] }) {
  return (
    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "repeat(4, 1fr)" }, gap: 2 }}>
      <FilterDropdown label="Status" value={status} onChange={onStatus} options={["Open", "In Progress", "Completed", "Overdue", "Pending"]} />
      <FilterDropdown label="Priority" value={priority} onChange={onPriority} options={["High", "Medium", "Low"]} />
      <FilterDropdown label="Category" value={category} onChange={onCategory} options={categories} />
      <FilterDropdown label="Assigned By" value={assignedBy} onChange={onAssignedBy} options={assigners} />
    </Box>
  );
}

TaskTableFilters.propTypes = {
  priority: PropTypes.string.isRequired,
  onPriority: PropTypes.func.isRequired,
  category: PropTypes.string.isRequired,
  onCategory: PropTypes.func.isRequired,
  assignedBy: PropTypes.string.isRequired,
  onAssignedBy: PropTypes.func.isRequired,
  status: PropTypes.string.isRequired,
  onStatus: PropTypes.func.isRequired,
  categories: PropTypes.array,
  assigners: PropTypes.array,
};
