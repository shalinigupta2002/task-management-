import PropTypes from "prop-types";
import { FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import { fieldSx } from "./styles";

export default function FilterDropdown({
  label, value, onChange, options, size = "small", fullWidth = true, allLabel = "All", showAll = true,
}) {
  return (
    <FormControl fullWidth={fullWidth} size={size} sx={fieldSx}>
      <InputLabel id={`filter-${label}`}>{label}</InputLabel>
      <Select labelId={`filter-${label}`} value={value} label={label} onChange={(e) => onChange(e.target.value)} inputProps={{ "aria-label": `Filter by ${label}` }}>
        {showAll && <MenuItem value="all">{allLabel}</MenuItem>}
        {options.map((opt) => {
          const val = typeof opt === "object" ? opt.value : opt;
          const lbl = typeof opt === "object" ? opt.label : opt;
          return <MenuItem key={val} value={val}>{lbl}</MenuItem>;
        })}
      </Select>
    </FormControl>
  );
}

FilterDropdown.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  options: PropTypes.array.isRequired,
  size: PropTypes.string,
  fullWidth: PropTypes.bool,
  allLabel: PropTypes.string,
  showAll: PropTypes.bool,
};
