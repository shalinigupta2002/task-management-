import PropTypes from "prop-types";
import { Box } from "@mui/material";

export default function ImagePreview({ src, alt = "Preview", width = 120, height = 120, onClick }) {
  return (
    <Box
      component="img"
      src={src}
      alt={alt}
      onClick={onClick}
      sx={{
        width, height, objectFit: "cover", borderRadius: 2, border: "1px solid #E8EDF5",
        cursor: onClick ? "pointer" : "default",
      }}
    />
  );
}

ImagePreview.propTypes = {
  src: PropTypes.string.isRequired,
  alt: PropTypes.string,
  width: PropTypes.number,
  height: PropTypes.number,
  onClick: PropTypes.func,
};

export function VideoPreview({ src, width = "100%", maxHeight = 240 }) {
  return (
    <Box component="video" controls src={src} sx={{ width, maxHeight, borderRadius: 2, border: "1px solid #E8EDF5" }} />
  );
}

VideoPreview.propTypes = { src: PropTypes.string.isRequired, width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]), maxHeight: PropTypes.number };

export function PDFPreview({ filename }) {
  return (
    <Box sx={{ p: 2, bgcolor: "#FEF2F2", borderRadius: 2, border: "1px solid #FECACA", textAlign: "center" }}>
      <Box sx={{ fontWeight: 600, color: "#DC2626", fontSize: "0.85rem" }}>PDF Preview</Box>
      <Box sx={{ color: "#64748B", fontSize: "0.78rem", mt: 0.5 }}>{filename}</Box>
    </Box>
  );
}

PDFPreview.propTypes = { filename: PropTypes.string.isRequired };

export function ExcelPreview({ filename }) {
  return (
    <Box sx={{ p: 2, bgcolor: "#F0FDF4", borderRadius: 2, border: "1px solid #BBF7D0", textAlign: "center" }}>
      <Box sx={{ fontWeight: 600, color: "#16A34A", fontSize: "0.85rem" }}>Excel Preview</Box>
      <Box sx={{ color: "#64748B", fontSize: "0.78rem", mt: 0.5 }}>{filename}</Box>
    </Box>
  );
}

ExcelPreview.propTypes = { filename: PropTypes.string.isRequired };
