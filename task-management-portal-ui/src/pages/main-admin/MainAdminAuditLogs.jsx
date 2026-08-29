import { useState, useMemo, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, InputAdornment, Chip, CircularProgress
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import Layout from "../../components/layouts/Layout";
import SubAdminLayout from "../../components/layouts/SubAdminLayout";
import { PageHeader, card, tableHeadCell, fieldSx } from "../../components/main-admin/shared";
import auditLogService from "../../services/auditLogService";

export default function MainAdminAuditLogs() {
  const location = useLocation();
  const isSubAdmin = location.pathname.startsWith("/sub-admin");
  const PageLayout = isSubAdmin ? SubAdminLayout : Layout;

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
      const user = `${l.user?.firstName || ""} ${l.user?.lastName || ""}`.toLowerCase();
      const target = (l.entity || "").toLowerCase();
      return !q || action.includes(q) || user.includes(q) || target.includes(q);
    });
  }, [logs, search]);

  return (
    <PageLayout>
      <Box sx={{ pb: 3 }}>
        <PageHeader title="Audit Logs" crumbs={[{ label: "Audit Logs" }]} />
        <Box sx={{ ...card, mb: 2 }}>
          <TextField size="small" placeholder="Search audit logs..." value={search} onChange={(e) => setSearch(e.target.value)} sx={{ minWidth: 280, ...fieldSx }}
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
                    {["Action", "User", "Target", "Timestamp", "IP Address"].map((h) => (
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
                        <TableCell><Chip label={l.action} size="small" sx={{ bgcolor: "#EFF6FF", color: "#2563EB", fontWeight: 600, fontSize: "0.72rem" }} /></TableCell>
                        <TableCell sx={{ color: "#334155", fontSize: "0.85rem", fontWeight: 500 }}>{user}</TableCell>
                        <TableCell sx={{ color: "#64748B", fontSize: "0.85rem" }}>{l.entity || "N/A"}</TableCell>
                        <TableCell sx={{ color: "#64748B", fontSize: "0.82rem" }}>{timestamp}</TableCell>
                        <TableCell sx={{ color: "#94A3B8", fontSize: "0.82rem", fontFamily: "monospace" }}>{l.ip || "127.0.0.1"}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      </Box>
    </PageLayout>
  );
}
