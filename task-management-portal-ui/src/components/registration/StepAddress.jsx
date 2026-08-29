import PropTypes from "prop-types";
import { Grid, TextField, FormControlLabel, Checkbox, Box, Typography } from "@mui/material";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import StepHeader from "./StepHeader";
import { GLASS_INPUT_STYLES } from "../../theme/glassStyles";

export default function StepAddress({ formData, updateFormData, errors = {} }) {
  const handleChange = (e) => {
    updateFormData({ [e.target.name]: e.target.value });
  };

  const handleCheckbox = (e) => {
    if (e.target.checked) {
      updateFormData({
        permanentAddress: formData.currentAddress || "",
        permanentCountry: formData.currentCountry || "",
        permanentState: formData.currentState || "",
        permanentCity: formData.currentCity || "",
        permanentPinCode: formData.currentPinCode || "",
      });
    }
  };

  return (
    <>
      <StepHeader
        title="Address Details"
        subtitle="Provide current and permanent residential details."
        icon={<LocationOnOutlinedIcon />}
      />

      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#38BDF8", mb: 0.5 }}>
            Current Address
          </Typography>
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            size="small"
            multiline
            rows={2}
            label="Address Line"
            name="currentAddress"
            value={formData.currentAddress || ""}
            onChange={handleChange}
            error={!!errors.currentAddress}
            helperText={errors.currentAddress}
            sx={GLASS_INPUT_STYLES}
          />
        </Grid>

        <Grid item xs={12} sm={3}>
          <TextField
            fullWidth
            size="small"
            label="Country"
            name="currentCountry"
            value={formData.currentCountry || ""}
            onChange={handleChange}
            error={!!errors.currentCountry}
            helperText={errors.currentCountry}
            sx={GLASS_INPUT_STYLES}
          />
        </Grid>

        <Grid item xs={12} sm={3}>
          <TextField
            fullWidth
            size="small"
            label="State"
            name="currentState"
            value={formData.currentState || ""}
            onChange={handleChange}
            error={!!errors.currentState}
            helperText={errors.currentState}
            sx={GLASS_INPUT_STYLES}
          />
        </Grid>

        <Grid item xs={12} sm={3}>
          <TextField
            fullWidth
            size="small"
            label="City"
            name="currentCity"
            value={formData.currentCity || ""}
            onChange={handleChange}
            error={!!errors.currentCity}
            helperText={errors.currentCity}
            sx={GLASS_INPUT_STYLES}
          />
        </Grid>

        <Grid item xs={12} sm={3}>
          <TextField
            fullWidth
            size="small"
            label="Postal / Zip Code"
            name="currentPinCode"
            value={formData.currentPinCode || ""}
            onChange={handleChange}
            error={!!errors.currentPinCode}
            helperText={errors.currentPinCode}
            sx={GLASS_INPUT_STYLES}
          />
        </Grid>

        <Grid item xs={12}>
          <Box sx={{ my: 0.5 }}>
            <FormControlLabel
              control={
                <Checkbox
                  size="small"
                  onChange={handleCheckbox}
                  sx={{
                    color: "rgba(255, 255, 255, 0.4)",
                    "&.Mui-checked": { color: "#38BDF8" },
                  }}
                />
              }
              label={
                <Typography variant="body2" sx={{ color: "rgba(255, 255, 255, 0.8)" }}>
                  Permanent address is same as current address
                </Typography>
              }
            />
          </Box>
        </Grid>

        <Grid item xs={12}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#38BDF8", mb: 0.5 }}>
            Permanent Address
          </Typography>
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            size="small"
            multiline
            rows={2}
            label="Address Line"
            name="permanentAddress"
            value={formData.permanentAddress || ""}
            onChange={handleChange}
            sx={GLASS_INPUT_STYLES}
          />
        </Grid>

        <Grid item xs={12} sm={3}>
          <TextField
            fullWidth
            size="small"
            label="Country"
            name="permanentCountry"
            value={formData.permanentCountry || ""}
            onChange={handleChange}
            sx={GLASS_INPUT_STYLES}
          />
        </Grid>

        <Grid item xs={12} sm={3}>
          <TextField
            fullWidth
            size="small"
            label="State"
            name="permanentState"
            value={formData.permanentState || ""}
            onChange={handleChange}
            sx={GLASS_INPUT_STYLES}
          />
        </Grid>

        <Grid item xs={12} sm={3}>
          <TextField
            fullWidth
            size="small"
            label="City"
            name="permanentCity"
            value={formData.permanentCity || ""}
            onChange={handleChange}
            sx={GLASS_INPUT_STYLES}
          />
        </Grid>

        <Grid item xs={12} sm={3}>
          <TextField
            fullWidth
            size="small"
            label="Postal / Zip Code"
            name="permanentPinCode"
            value={formData.permanentPinCode || ""}
            onChange={handleChange}
            sx={GLASS_INPUT_STYLES}
          />
        </Grid>
      </Grid>
    </>
  );
}

StepAddress.propTypes = {
  formData: PropTypes.object.isRequired,
  updateFormData: PropTypes.func.isRequired,
  errors: PropTypes.object,
};