import { Button, Box } from "@mui/material";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";

export default function ExportButtons({ onExportCSV, onExportPDF, isLoading }) {
  return (
    <Box display="flex" gap={1}>
      {onExportCSV && (
        <Button variant="outlined" size="small" startIcon={<FileDownloadIcon />} onClick={onExportCSV} disabled={isLoading}
          sx={{ textTransform: "none", borderColor: "#E2E8F0", color: "#334155", borderRadius: 2, fontWeight: 600, "&:hover": { borderColor: "#2563EB", bgcolor: "#EFF6FF" } }}>
          Export CSV
        </Button>
      )}
      {onExportPDF && (
        <Button variant="outlined" size="small" startIcon={<PictureAsPdfIcon />} onClick={onExportPDF} disabled={isLoading}
          sx={{ textTransform: "none", borderColor: "#E2E8F0", color: "#334155", borderRadius: 2, fontWeight: 600, "&:hover": { borderColor: "#2563EB", bgcolor: "#EFF6FF" } }}>
          Export PDF
        </Button>
      )}
    </Box>
  );
}
