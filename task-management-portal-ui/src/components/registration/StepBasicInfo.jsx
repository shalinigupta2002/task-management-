import PropTypes from "prop-types";
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
} from "@mui/material";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import StepHeader from "./StepHeader";
import { GLASS_INPUT_STYLES, GLASS_MENU_PROPS } from "../../theme/glassStyles";

// Base styling for uniform height, glass aesthetics, and glowing focus border
const INPUT_STYLE_OVERRIDE = {
  ...GLASS_INPUT_STYLES,
  width: "100%",
  "& .MuiOutlinedInput-root": {
    ...GLASS_INPUT_STYLES?.["& .MuiOutlinedInput-root"],
    borderRadius: "8px",
    height: "44px",
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    transition: "all 0.2s ease-in-out",
    "&:hover": {
      backgroundColor: "rgba(255, 255, 255, 0.05)",
      borderColor: "rgba(99, 102, 241, 0.5)",
    },
    "&.Mui-focused": {
      borderColor: "#6366f1",
      boxShadow: "0 0 0 3px rgba(99, 102, 241, 0.25)",
    },
  },
  "& .MuiInputLabel-root": {
    fontSize: "0.875rem",
    color: "#94a3b8",
    "&.Mui-focused": {
      color: "#818cf8",
    },
  },
  "& .MuiSelect-select": {
    display: "flex",
    alignItems: "center",
    height: "100%",
    boxSizing: "border-box",
  },
};

export default function StepBasicInfo({ formData, updateFormData, errors = {} }) {
  const handleChange = (e) => {
    updateFormData({ [e.target.name]: e.target.value });
  };

  return (
    <Box sx={{ width: "100%", maxWidth: "800px", mx: "auto" }}>
      <StepHeader
        title="Basic Information"
        subtitle="Provide the employee's personal details to start registration."
        icon={<PersonOutlineIcon />}
      />

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, mt: 3 }}>
        {/* Row 1: Employee Code, First Name, Last Name */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
            gap: 2,
            width: "100%",
          }}
        >
          <TextField
            fullWidth
            size="small"
            label="Employee Code"
            name="employeeCode"
            placeholder="e.g. EMP-101"
            value={formData.employeeCode || ""}
            onChange={handleChange}
            error={!!errors.employeeCode}
            helperText={errors.employeeCode}
            sx={INPUT_STYLE_OVERRIDE}
          />

          <TextField
            fullWidth
            size="small"
            label="First Name"
            name="firstName"
            placeholder="John"
            value={formData.firstName || ""}
            onChange={handleChange}
            error={!!errors.firstName}
            helperText={errors.firstName}
            sx={INPUT_STYLE_OVERRIDE}
          />

          <TextField
            fullWidth
            size="small"
            label="Last Name"
            name="lastName"
            placeholder="Doe"
            value={formData.lastName || ""}
            onChange={handleChange}
            error={!!errors.lastName}
            helperText={errors.lastName}
            sx={INPUT_STYLE_OVERRIDE}
          />
        </Box>

        {/* Row 2: Gender, Date of Birth, Mobile Number */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
            gap: 2,
            width: "100%",
          }}
        >
          <FormControl
            fullWidth
            size="small"
            error={!!errors.gender}
            sx={INPUT_STYLE_OVERRIDE}
          >
            <InputLabel id="gender-label">Gender</InputLabel>
            <Select
              labelId="gender-label"
              id="gender-select"
              name="gender"
              value={formData.gender || ""}
              label="Gender"
              onChange={handleChange}
              MenuProps={GLASS_MENU_PROPS}
            >
              <MenuItem value="Male">Male</MenuItem>
              <MenuItem value="Female">Female</MenuItem>
              <MenuItem value="Other">Other</MenuItem>
              <MenuItem value="Prefer not to say">Prefer not to say</MenuItem>
            </Select>
            {errors.gender && <FormHelperText>{errors.gender}</FormHelperText>}
          </FormControl>

          <TextField
            fullWidth
            size="small"
            label="Date of Birth"
            name="dob"
            type="date"
            value={formData.dob || ""}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
            error={!!errors.dob}
            helperText={errors.dob}
            sx={INPUT_STYLE_OVERRIDE}
          />

          <TextField
            fullWidth
            size="small"
            label="Mobile Number"
            name="mobile"
            placeholder="+1 (555) 000-0000"
            value={formData.mobile || ""}
            onChange={handleChange}
            error={!!errors.mobile}
            helperText={errors.mobile}
            sx={INPUT_STYLE_OVERRIDE}
          />
        </Box>

        {/* Row 3: Email Address */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
            gap: 2,
            width: "100%",
          }}
        >
          <Box sx={{ gridColumn: { sm: "span 2", xs: "span 1" } }}>
            <TextField
              fullWidth
              size="small"
              label="Email Address"
              name="email"
              type="email"
              placeholder="john.doe@example.com"
              value={formData.email || ""}
              onChange={handleChange}
              error={!!errors.email}
              helperText={errors.email}
              sx={INPUT_STYLE_OVERRIDE}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

StepBasicInfo.propTypes = {
  formData: PropTypes.object.isRequired,
  updateFormData: PropTypes.func.isRequired,
  errors: PropTypes.object,
};