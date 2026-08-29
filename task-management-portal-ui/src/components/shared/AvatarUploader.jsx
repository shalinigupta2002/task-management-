import { useState } from "react";
import PropTypes from "prop-types";
import { Box, Avatar, TextField, Button } from "@mui/material";
import LinkIcon from "@mui/icons-material/Link";
import { isValidExternalUrl, normalizeExternalUrl } from "../../utils/urlValidation";
import toast from "../../utils/toast";

export default function AvatarUploader({ value, onChange, size = 96, initials = "U" }) {
  const [urlInput, setUrlInput] = useState(value || "");
  const [error, setError] = useState("");

  const preview = value || urlInput;

  const applyUrl = () => {
    const url = normalizeExternalUrl(urlInput);
    if (!isValidExternalUrl(url)) {
      setError("Please enter a valid URL.");
      return;
    }
    setError("");
    onChange?.(url);
    toast.success("Profile photo link updated");
  };

  return (
    <Box display="flex" flexDirection="column" alignItems="center" gap={1.5}>
      <Avatar src={preview || undefined} sx={{ width: size, height: size, bgcolor: "#2563EB", fontSize: size * 0.35 }}>
        {!preview && initials}
      </Avatar>
      <TextField
        size="small"
        placeholder="Image URL / Drive link"
        value={urlInput}
        onChange={(e) => {
          setUrlInput(e.target.value);
          if (error) setError("");
        }}
        error={Boolean(error)}
        helperText={error || "Paste an external image link"}
        InputProps={{ startAdornment: <LinkIcon sx={{ color: "#94A3B8", fontSize: 18, mr: 1 }} /> }}
        sx={{ width: "100%", maxWidth: 280, "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
      />
      <Button variant="outlined" size="small" onClick={applyUrl} sx={{ textTransform: "none", borderRadius: 2 }}>
        Apply Photo Link
      </Button>
    </Box>
  );
}

AvatarUploader.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
  size: PropTypes.number,
  initials: PropTypes.string,
};
