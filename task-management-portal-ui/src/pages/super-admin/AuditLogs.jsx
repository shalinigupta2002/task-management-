import { useState, useEffect, useMemo } from "react";
import {
  Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, InputAdornment, CircularProgress
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import SuperAdminLayout from "../../components/layouts/SuperAdminLayout";
import { PageHeader, card, tableHeadCell } from "../../components/super-admin/shared";
import auditLogService from "../../services/auditLogService";

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function loadLogs() {
      try {
        setLoading(true);
        const data = await auditLogService.getAll();
        setLogs(data.items || data || []);
      } catch (err) {
        console.error("Failed to load audit logs:", err);
      } finally {
        setLoading(false);
      }
    }
    loadLogs();
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return logs.filter((l) => {
      const action = (l.action || "").toLowerCase();
      const entity = (l.entity || "").toLowerCase();
      const user = l.user ? `${l.user.firstName} ${l.user.lastName}`.toLowerCase() : "system";
      return !q || action.includes(q) || entity.includes(q) || user.includes(q);
    });
  }, [logs, search]);

  return (
    <SuperAdminLayout>
      <Box sx={{ pb: 3 }}>
        <PageHeader title="Audit Logs" crumbs={[{ label: "Audit Logs" }]} />
        <Box sx={{ ...card, mb: 2 }}>
          <TextField fullWidth size="small" placeholder="Search audit logs..." value={search} onChange={(e) => setSearch(e.target.value)}
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, bgcolor: "#F8FAFC" } }}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: "#94A3B8", fontSize: 20 }} /></InputAdornment> }} />
        </Box>
        <Box sx={{ ...card, p: 0, overflow: "hidden" }}>
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
              <CircularProgress size={30} />
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: "#F8FAFC" }}>
                    {["Action", "Entity", "User", "Date", "IP Address"].map((h) => (
                      <TableCell key={h} sx={tableHeadCell}>{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filtered.map((l) => {
                    const user = l.user ? `${l.user.firstName} ${l.user.lastName}` : "System";
                    const timestamp = new Date(l.timestamp || l.createdAt).toLocaleString();
                    return (
                      <TableRow key={l.id} hover sx={{ "& td": { borderBottom: "1px solid #F1F5F9", py: 1.5 } }}>
                        <TableCell sx={{ fontWeight: 600, color: "#0F172A", fontSize: "0.875rem" }}>{l.action}</TableCell>
                        <TableCell sx={{ color: "#64748B", fontSize: "0.85rem" }}>{l.entity || "N/A"}</TableCell>
                        <TableCell sx={{ color: "#334155", fontSize: "0.85rem" }}>{user}</TableCell>
                        <TableCell sx={{ color: "#64748B", fontSize: "0.82rem" }}>{timestamp}</TableCell>
                        <TableCell sx={{ color: "#64748B", fontSize: "0.82rem" }}>{l.ip || "127.0.0.1"}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      </Box>
    </SuperAdminLayout>
  );
}
