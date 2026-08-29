import PropTypes from "prop-types";
import { Controller } from "react-hook-form";
import { FormControl, InputLabel, Select, MenuItem, FormHelperText } from "@mui/material";
import { fieldSx } from "./styles";

export default function FormSelect({ name, control, label, options, required, disabled }) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <FormControl fullWidth error={Boolean(error)} sx={fieldSx} disabled={disabled} required={required}>
          <InputLabel id={`${name}-label`}>{label}</InputLabel>
          <Select {...field} labelId={`${name}-label`} label={label} inputProps={{ "aria-label": label }}>
            {options.map((opt) => {
              const val = typeof opt === "object" ? opt.value : opt;
              const lbl = typeof opt === "object" ? opt.label : opt;
              return <MenuItem key={val} value={val}>{lbl}</MenuItem>;
            })}
          </Select>
          {error && <FormHelperText>{error.message}</FormHelperText>}
        </FormControl>
      )}
    />
  );
}

FormSelect.propTypes = {
  name: PropTypes.string.isRequired,
  control: PropTypes.object.isRequired,
  label: PropTypes.string.isRequired,
  options: PropTypes.array.isRequired,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
};
