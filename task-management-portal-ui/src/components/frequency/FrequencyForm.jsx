import PropTypes from "prop-types";
import {
  TextField,
  Button,
  CircularProgress,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
  Typography,
  Box,
  Stack,
} from "@mui/material";
import { Save } from "@mui/icons-material";
import { formatDaysInterval } from "../../utils/session";
import {
  FREQUENCY_NAME_OPTIONS,
  FREQUENCY_DEFAULTS,
} from "../../constants/frequencyOptions";

export { FREQUENCY_NAME_OPTIONS, FREQUENCY_DEFAULTS };

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 2,
    bgcolor: "#F8FAFC",
    "& fieldset": { borderColor: "#E2E8F0" },
    "&:hover fieldset": { borderColor: "#2563EB" },
    "&.Mui-focused fieldset": { borderColor: "#2563EB", borderWidth: "2px" },
  },
  "& .MuiInputLabel-root.Mui-focused": { color: "#2563EB" },
};

export default function FrequencyForm({
  formData,
  errors,
  onChange,
  onCancel,
  submitting,
  isEdit,
  submitLabel,
}) {
  const intervalPreview = formData.daysInterval
    ? formatDaysInterval(Number(formData.daysInterval))
    : "Enter how many days between each occurrence";

  return (
    <Stack spacing={2.5}>
      <Box>
        <Typography sx={{ fontWeight: 700, color: "#0F172A", fontSize: "0.95rem", mb: 0.5 }}>
          Frequency details
        </Typography>
        <Typography sx={{ color: "#64748B", fontSize: "0.82rem" }}>
          Choose a supported type. Interval and duration control how recurring tasks are scheduled.
        </Typography>
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
          gap: 2.5,
        }}
      >
        <FormControl fullWidth required error={Boolean(errors.name)} sx={fieldSx}>
          <InputLabel id="frequency-name-label">Frequency Name</InputLabel>
          <Select
            labelId="frequency-name-label"
            name="name"
            value={formData.name || ""}
            onChange={onChange}
            label="Frequency Name"
            disabled={isEdit}
            displayEmpty
          >
            <MenuItem value="" disabled>
              Select frequency type
            </MenuItem>
            {FREQUENCY_NAME_OPTIONS.map((name) => (
              <MenuItem key={name} value={name}>{name}</MenuItem>
            ))}
          </Select>
          <FormHelperText>
            {errors.name || (isEdit ? "Frequency name cannot be changed after creation" : "Must match a supported system frequency type")}
          </FormHelperText>
        </FormControl>

        <FormControl fullWidth sx={fieldSx} error={Boolean(errors.status)}>
          <InputLabel id="frequency-status-label">Status</InputLabel>
          <Select
            labelId="frequency-status-label"
            name="status"
            value={formData.status || "Active"}
            onChange={onChange}
            label="Status"
          >
            <MenuItem value="Active">Active</MenuItem>
            <MenuItem value="Inactive">Inactive</MenuItem>
          </Select>
          <FormHelperText>
            {errors.status || "Inactive frequencies cannot be assigned to new tasks"}
          </FormHelperText>
        </FormControl>
      </Box>

      <TextField
        fullWidth
        label="Description"
        name="description"
        value={formData.description}
        onChange={onChange}
        multiline
        rows={3}
        placeholder="e.g. A recurring frequency used for daily tasks."
        variant="outlined"
        sx={fieldSx}
        helperText="Optional short description shown in frequency lists"
      />

      <Box
        sx={{
          p: 2,
          borderRadius: 2.5,
          bgcolor: "#F8FAFC",
          border: "1px solid #E2E8F0",
        }}
      >
        <Typography sx={{ fontWeight: 700, color: "#0F172A", fontSize: "0.9rem", mb: 0.5 }}>
          Schedule settings
        </Typography>
        <Typography sx={{ color: "#64748B", fontSize: "0.8rem", mb: 2 }}>
          {formData.name === "Custom"
            ? "Custom frequencies require both interval and duration values."
            : "Defaults are suggested when you pick a frequency name. Adjust if needed."}
        </Typography>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
            gap: 2,
          }}
        >
          <TextField
            fullWidth
            label="Interval (Days)"
            name="daysInterval"
            type="number"
            value={formData.daysInterval}
            onChange={onChange}
            required
            error={Boolean(errors.daysInterval)}
            helperText={errors.daysInterval || intervalPreview}
            placeholder="e.g. 1 for daily, 7 for weekly"
            variant="outlined"
            inputProps={{ min: 1, step: 1 }}
            sx={fieldSx}
          />
          <TextField
            fullWidth
            label="Number of Days (Duration)"
            name="numberOfDays"
            type="number"
            value={formData.numberOfDays}
            onChange={onChange}
            required
            error={Boolean(errors.numberOfDays)}
            helperText={errors.numberOfDays || "How many days the schedule window should cover"}
            placeholder="e.g. 7, 30"
            variant="outlined"
            inputProps={{ min: 1, step: 1 }}
            sx={fieldSx}
          />
        </Box>
      </Box>

      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1.5, pt: 1 }}>
        <Button
          variant="outlined"
          onClick={onCancel}
          disabled={submitting}
          sx={{ textTransform: "none", borderColor: "#cbd5e1", color: "#475569", px: 3, borderRadius: 2 }}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="contained"
          disabled={submitting}
          startIcon={submitting ? <CircularProgress size={18} color="inherit" /> : <Save />}
          sx={{ bgcolor: "#2563eb", textTransform: "none", px: 3, borderRadius: 2, fontWeight: 600, "&:hover": { bgcolor: "#1D4ED8" } }}
        >
          {submitLabel || (isEdit ? "Update Frequency" : "Save Frequency")}
        </Button>
      </Box>
    </Stack>
  );
}

FrequencyForm.propTypes = {
  formData: PropTypes.shape({
    name: PropTypes.string,
    numberOfDays: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    daysInterval: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    description: PropTypes.string,
    status: PropTypes.string,
  }).isRequired,
  errors: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  submitting: PropTypes.bool,
  isEdit: PropTypes.bool,
  submitLabel: PropTypes.string,
};

FrequencyForm.defaultProps = {
  submitting: false,
  isEdit: false,
  submitLabel: "",
};
