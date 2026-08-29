import PropTypes from "prop-types";
import { Button, ButtonGroup } from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import toast from "../../utils/toast";

export default function ExportButtons({ formats = ["Excel", "PDF", "CSV"], size = "small", filename = "export" }) {
  const handleExport = (format) => {
    toast.info(`Preparing ${format} export for "${filename}"... (UI only)`);
    setTimeout(() => toast.success(`${format} export ready for download`), 800);
  };

  return (
    <ButtonGroup size={size} aria-label="Export options">
      {formats.map((format) => (
        <Button
          key={format}
          startIcon={<DownloadIcon sx={{ fontSize: "16px !important" }} />}
          onClick={() => handleExport(format)}
          sx={{ textTransform: "none", borderRadius: 2, borderColor: "#E2E8F0", color: "#64748B", "&:hover": { bgcolor: "#F8FAFC" } }}
          variant="outlined"
        >
          {format}
        </Button>
      ))}
    </ButtonGroup>
  );
}

ExportButtons.propTypes = {
  formats: PropTypes.arrayOf(PropTypes.string),
  size: PropTypes.string,
  filename: PropTypes.string,
};
