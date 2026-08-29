import PropTypes from "prop-types";
import { Box, TextField, MenuItem } from "@mui/material";
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import StepHeader from "./StepHeader";
import { GLASS_INPUT_STYLES, GLASS_MENU_PROPS } from "../../theme/glassStyles";

export default function StepCompanyInfo({ formData, updateFormData, errors = {} }) {
  const handleChange = (e) => {
    updateFormData({ [e.target.name]: e.target.value });
  };

  return (
    <>
      <StepHeader
        title="Company Information"
        subtitle="Enter the employee's role, department, and employment details."
        icon={<BusinessOutlinedIcon />}
      />

      {/* Grid container using modern CSS Grid layout to prevent squishing */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
          gap: 2.5,
          width: "100%",
        }}
      >
        {/* Row 1: Company Name & Company Code */}
        <TextField
          fullWidth
          size="small"
          label="Company Name"
          name="companyName"
          placeholder="e.g. Acme Corp"
          value={formData.companyName || ""}
          onChange={handleChange}
          sx={GLASS_INPUT_STYLES}
        />

        <TextField
          fullWidth
          size="small"
          label="Company Code"
          name="companyCode"
          placeholder="e.g. ACM-102"
          value={formData.companyCode || ""}
          onChange={handleChange}
          sx={GLASS_INPUT_STYLES}
        />

        {/* Row 2: Department & Designation */}
        <TextField
          select
          fullWidth
          size="small"
          label="Department"
          name="department"
          value={formData.department || ""}
          onChange={handleChange}
          error={!!errors.department}
          helperText={errors.department}
          sx={GLASS_INPUT_STYLES}
          SelectProps={{ MenuProps: GLASS_MENU_PROPS }}
        >
          <MenuItem value="" disabled>
            Select Department
          </MenuItem>
          <MenuItem value="Engineering">Engineering</MenuItem>
          <MenuItem value="IT">Information Technology</MenuItem>
          <MenuItem value="HR">Human Resources</MenuItem>
          <MenuItem value="Finance">Finance</MenuItem>
          <MenuItem value="Sales">Sales</MenuItem>
          <MenuItem value="Operations">Operations</MenuItem>
        </TextField>

        <TextField
          fullWidth
          size="small"
          label="Designation"
          name="designation"
          placeholder="Software Engineer"
          value={formData.designation || ""}
          onChange={handleChange}
          error={!!errors.designation}
          helperText={errors.designation}
          sx={GLASS_INPUT_STYLES}
        />

        {/* Row 3: Reporting Manager & Joining Date */}
        <TextField
          fullWidth
          size="small"
          label="Reporting Manager"
          name="reportingManager"
          placeholder="Jane Smith"
          value={formData.reportingManager || ""}
          onChange={handleChange}
          error={!!errors.reportingManager}
          helperText={errors.reportingManager}
          sx={GLASS_INPUT_STYLES}
        />

        <TextField
          fullWidth
          size="small"
          type="date"
          label="Joining Date"
          name="joiningDate"
          value={formData.joiningDate || ""}
          onChange={handleChange}
          InputLabelProps={{ shrink: true }}
          error={!!errors.joiningDate}
          helperText={errors.joiningDate}
          sx={GLASS_INPUT_STYLES}
        />

        {/* Row 4: Employment Type & Office Location */}
        <TextField
          select
          fullWidth
          size="small"
          label="Employment Type"
          name="employmentType"
          value={formData.employmentType || "Full Time"}
          onChange={handleChange}
          sx={GLASS_INPUT_STYLES}
          SelectProps={{ MenuProps: GLASS_MENU_PROPS }}
        >
          <MenuItem value="Full Time">Full Time</MenuItem>
          <MenuItem value="Part Time">Part Time</MenuItem>
          <MenuItem value="Contract">Contract</MenuItem>
          <MenuItem value="Intern">Intern</MenuItem>
        </TextField>

        <TextField
          fullWidth
          size="small"
          label="Office Location"
          name="officeLocation"
          placeholder="New York / Remote"
          value={formData.officeLocation || ""}
          onChange={handleChange}
          error={!!errors.officeLocation}
          helperText={errors.officeLocation}
          sx={GLASS_INPUT_STYLES}
        />
      </Box>
    </>
  );
}

StepCompanyInfo.propTypes = {
  formData: PropTypes.object.isRequired,
  updateFormData: PropTypes.func.isRequired,
  errors: PropTypes.object,
};