import PropTypes from "prop-types";
import { Controller } from "react-hook-form";
import { TextField } from "@mui/material";
import { fieldSx } from "./styles";

export default function FormTextField({
  name, control, label, type = "text", multiline = false, rows, required, disabled, placeholder, autoComplete,
}) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <TextField
          {...field}
          fullWidth
          label={label}
          type={type}
          multiline={multiline}
          rows={rows}
          required={required}
          disabled={disabled}
          placeholder={placeholder}
          autoComplete={autoComplete}
          error={Boolean(error)}
          helperText={error?.message}
          sx={fieldSx}
          inputProps={{ "aria-invalid": Boolean(error), "aria-describedby": error ? `${name}-error` : undefined }}
          FormHelperTextProps={{ id: error ? `${name}-error` : undefined }}
        />
      )}
    />
  );
}

FormTextField.propTypes = {
  name: PropTypes.string.isRequired,
  control: PropTypes.object.isRequired,
  label: PropTypes.string,
  type: PropTypes.string,
  multiline: PropTypes.bool,
  rows: PropTypes.number,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  placeholder: PropTypes.string,
  autoComplete: PropTypes.string,
};
