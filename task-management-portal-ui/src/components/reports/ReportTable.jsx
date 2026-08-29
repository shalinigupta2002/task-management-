import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress } from "@mui/material";

const card = { borderRadius: 3, bgcolor: "#FFFFFF", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" };

export default function ReportTable({ data, columns, isLoading }) {
  if (isLoading) {
    return (
      <Box sx={{ ...card, display: "flex", justifyContent: "center", py: 6 }}>
        <CircularProgress size={28} sx={{ color: "#2563EB" }} />
      </Box>
    );
  }

  if (!data?.length) {
    return (
      <Box sx={{ ...card, p: 4, textAlign: "center" }}>
        <Typography sx={{ color: "#94A3B8" }}>No data found for this report.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={card}>
      <Typography sx={{ fontWeight: 700, color: "#0F172A", fontSize: "1.05rem", p: 2.5, pb: 0 }}>Report Data</Typography>
      <TableContainer sx={{ p: 2.5, pt: 1.5 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              {columns.map((col, i) => (
                <TableCell key={i} sx={{ fontWeight: 600, color: "#64748B", fontSize: "0.8rem", borderBottom: "1px solid #F1F5F9" }}>{col.header}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row, ri) => (
              <TableRow key={ri} sx={{ "&:hover": { bgcolor: "#F8FAFC" }, "& td": { borderBottom: "1px solid #F1F5F9", py: 1.5 } }}>
                {columns.map((col, ci) => (
                  <TableCell key={ci} sx={{ color: "#334155", fontSize: "0.875rem", fontWeight: 500 }}>
                    {col.accessor ? row[col.accessor] : col.render ? col.render(row) : "-"}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
