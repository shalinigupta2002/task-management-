import PropTypes from "prop-types";
import { useState } from "react";
import {
  Grid,
  TextField,
  MenuItem,
  InputAdornment,
  IconButton,
  FormControlLabel,
  Switch,
  Typography,
  Box,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import StepHeader from "./StepHeader";
import { GLASS_INPUT_STYLES, GLASS_MENU_PROPS } from "../../theme/glassStyles";

export default function StepAccount({ formData, updateFormData, errors = {} }) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    updateFormData({ [e.target.name]: e.target.value });
  };

  const handleToggle = (e) => {
    updateFormData({ [e.target.name]: e.target.checked });
  };

  return (
    <>
      <StepHeader
        title="Account & Security"
        subtitle="Set up portal credentials and access control options."
        icon={<LockOutlinedIcon />}
      />

      <Grid container spacing={2.5}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            size="small"
            label="Username"
            name="username"
            value={formData.username || ""}
            onChange={handleChange}
            error={!!errors.username}
            helperText={errors.username}
            sx={GLASS_INPUT_STYLES}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            select
            fullWidth
            size="small"
            label="System Role"
            name="systemRole"
            value={formData.systemRole || "Employee"}
            onChange={handleChange}
            sx={GLASS_INPUT_STYLES}
            SelectProps={{ MenuProps: GLASS_MENU_PROPS }}
          >
            <MenuItem value="Employee">Employee</MenuItem>
            <MenuItem value="Manager">Manager</MenuItem>
            <MenuItem value="HR Admin">HR Admin</MenuItem>
            <MenuItem value="System Admin">System Admin</MenuItem>
          </TextField>
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            size="small"
            type={showPassword ? "text" : "password"}
            label="Password"
            name="password"
            value={formData.password || ""}
            onChange={handleChange}
            error={!!errors.password}
            helperText={errors.password}
            sx={GLASS_INPUT_STYLES}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            size="small"
            type={showConfirmPassword ? "text" : "password"}
            label="Confirm Password"
            name="confirmPassword"
            value={formData.confirmPassword || ""}
            onChange={handleChange}
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword}
            sx={GLASS_INPUT_STYLES}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    edge="end"
                  >
                    {showConfirmPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Grid>

        <Grid item xs={12}>
          <Box
            sx={{
              p: 2,
              borderRadius: "12px",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              bgcolor: "rgba(255, 255, 255, 0.02)",
              display: "flex",
              flexDirection: "column",
              gap: 1.5,
              mt: 1,
            }}
          >
            <FormControlLabel
              control={
                <Switch
                  size="small"
                  name="requirePasswordReset"
                  checked={formData.requirePasswordReset ?? true}
                  onChange={handleToggle}
                  sx={{
                    "& .MuiSwitch-switchBase.Mui-checked": { color: "#38BDF8" },
                    "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                      backgroundColor: "#38BDF8",
                    },
                  }}
                />
              }
              label={
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: "#FFFFFF" }}>
                    Require Password Change
                  </Typography>
                  <Typography variant="caption" sx={{ color: "rgba(255, 255, 255, 0.5)" }}>
                    User must change password upon first login.
                  </Typography>
                </Box>
              }
            />

            <FormControlLabel
              control={
                <Switch
                  size="small"
                  name="enableTwoFactor"
                  checked={formData.enableTwoFactor || false}
                  onChange={handleToggle}
                  sx={{
                    "& .MuiSwitch-switchBase.Mui-checked": { color: "#38BDF8" },
                    "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                      backgroundColor: "#38BDF8",
                    },
                  }}
                />
              }
              label={
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: "#FFFFFF" }}>
                    Enable Two-Factor Authentication (2FA)
                  </Typography>
                  <Typography variant="caption" sx={{ color: "rgba(255, 255, 255, 0.5)" }}>
                    Require an authenticator app or code for access.
                  </Typography>
                </Box>
              }
            />
          </Box>
        </Grid>
      </Grid>
    </>
  );
}

StepAccount.propTypes = {
  formData: PropTypes.object.isRequired,
  updateFormData: PropTypes.func.isRequired,
  errors: PropTypes.object,
};