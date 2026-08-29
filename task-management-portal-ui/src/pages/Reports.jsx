import { useState } from "react";
import { Box, Typography, Grid, Chip } from "@mui/material";
import AssessmentIcon from "@mui/icons-material/Assessment";
import Layout from "../components/layouts/Layout";
import ReportFilter from "../components/reports/ReportFilter";
import Charts from "../components/reports/Charts";
import ExportButtons from "../components/reports/ExportButtons";
import ReportTable from "../components/reports/ReportTable";

const SUMMARY = [
  { label: "Total Departments", value: "4", color: "#2563EB", bg: "#EFF6FF" },
  { label: "Total Headcount", value: "110", color: "#16A34A", bg: "#F0FDF4" },
  { label: "Avg. per Dept", value: "27.5", color: "#F97316", bg: "#FFF7ED" },
  { label: "Report Period", value: "Q2 2026", color: "#7C3AED", bg: "#F5F3FF" },
];

export default function Reports() {
  const [reportData] = useState([
    { label: "Engineering", value: 45 },
    { label: "HR", value: 15 },
    { label: "Finance", value: 20 },
    { label: "Operations", value: 30 },
  ]);

  const columns = [
    { header: "Department", accessor: "label" },
    { header: "Headcount / Metric", accessor: "value" },
  ];

  return (
    <Layout>
      <Box sx={{ pb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} flexDirection={{ xs: "column", sm: "row" }} gap={2} mb={3}>
          <Box>
            <Box display="flex" alignItems="center" gap={1} mb={0.5}>
              <Chip label="Analytics" size="small" sx={{ bgcolor: "#EFF6FF", color: "#2563EB", fontWeight: 600, fontSize: "0.7rem" }} />
              <Chip label="Live Data" size="small" sx={{ bgcolor: "#F0FDF4", color: "#16A34A", fontWeight: 600, fontSize: "0.7rem" }} />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: "#0F172A" }}>Analytics & Reports</Typography>
            <Typography sx={{ color: "#64748B", fontSize: "0.875rem", mt: 0.3 }}>Department metrics and performance overview</Typography>
          </Box>
          <ExportButtons onExportCSV={() => alert("Exporting CSV...")} onExportPDF={() => alert("Exporting PDF...")} />
        </Box>

        <Grid container spacing={2} sx={{ mb: 2.5 }}>
          {SUMMARY.map((s) => (
            <Grid item xs={6} md={3} key={s.label}>
              <Box sx={{ borderRadius: 3, bgcolor: "#FFFFFF", boxShadow: "0 4px 12px rgba(0,0,0,0.05)", p: 2, display: "flex", alignItems: "center", gap: 1.5 }}>
                <Box sx={{ width: 44, height: 44, borderRadius: 2.5, bgcolor: s.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <AssessmentIcon sx={{ color: s.color, fontSize: 22 }} />
                </Box>
                <Box>
                  <Typography sx={{ fontWeight: 700, color: "#0F172A", fontSize: "1.25rem", lineHeight: 1.2 }}>{s.value}</Typography>
                  <Typography sx={{ color: "#64748B", fontSize: "0.75rem", fontWeight: 500 }}>{s.label}</Typography>
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ mb: 2.5 }}>
          <ReportFilter onFilterChange={() => {}} />
        </Box>

        <Grid container spacing={2.5}>
          <Grid item xs={12} lg={6}>
            <Charts data={reportData} type="Departmental Metrics" />
          </Grid>
          <Grid item xs={12} lg={6}>
            <ReportTable data={reportData} columns={columns} />
          </Grid>
        </Grid>
      </Box>
    </Layout>
  );
}
