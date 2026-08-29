import PropTypes from "prop-types";
import { TextField, InputAdornment } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { fieldSx } from "./styles";

export default function SearchBar({
  value, onChange, placeholder = "Search...", fullWidth = true, size = "small", onSubmit, ariaLabel = "Search",
}) {
  return (
    <TextField
      fullWidth={fullWidth}
      size={size}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      onKeyDown={(e) => e.key === "Enter" && onSubmit?.(value)}
      inputProps={{ "aria-label": ariaLabel }}
      sx={fieldSx}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon sx={{ color: "#94A3B8", fontSize: 20 }} aria-hidden />
          </InputAdornment>
        ),
      }}
    />
  );
}

SearchBar.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
  placeholder: PropTypes.string,
  fullWidth: PropTypes.bool,
  size: PropTypes.string,
  onSubmit: PropTypes.func,
  ariaLabel: PropTypes.string,
};
