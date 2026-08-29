import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Typography, Button, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  IconButton, InputAdornment, Menu, MenuItem, Avatar, Pagination, CircularProgress
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import LockResetIcon from "@mui/icons-material/LockReset";
import PersonOffIcon from "@mui/icons-material/PersonOff";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import Layout from "../../components/layouts/Layout";
import { PageHeader, StatusBadge, ConfirmDialog, card, tableHeadCell, fieldSx } from "../../components/main-admin/shared";
import employeeService from "../../services/employeeService";

export default function AdminList() {
  const navigate = useNavigate();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selected, setSelected] = useState(null);
  const [confirm, setConfirm] = useState(null);

  const loadSubAdmins = async () => {
    try {
      setLoading(true);
      const res = await employeeService.getUsers({ roleName: "SUB_ADMIN" });
      setAdmins(res.items || res || []);
    } catch (err) {
      console.error("Failed to load subadmins:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubAdmins();
  }, []);

  const subAdmins = useMemo(() => {
    return admins.map((a) => ({
      id: a.id,
      fullName: `${a.firstName || ""} ${a.lastName || ""}`,
      email: a.email,
      department: a.department?.departmentName || a.department || "No Department",
      roleName: "Sub Admin",
      status: a.status === "ACTIVE" ? "Active" : "Inactive",
      lastLogin: "Never logged in",
    }));
  }, [admins]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return subAdmins.filter((a) => !q || a.fullName.toLowerCase().includes(q) || a.email.toLowerCase().includes(q) || a.department.toLowerCase().includes(q));
  }, [subAdmins, search]);

  const paged = filtered.slice((page - 1) * 8, page * 8);

  const handleMenu = (e, admin) => { setMenuAnchor(e.currentTarget); setSelected(admin); };
  const closeMenu = () => { setMenuAnchor(null); setSelected(null); };

  const toggleStatus = async () => {
    if (!selected) return;
    try {
      const status = selected.status === "Active" ? "INACTIVE" : "ACTIVE";
      await employeeService.update(selected.id, { status });
      await loadSubAdmins();
    } catch (err) {
      console.error("Failed to toggle subadmin status:", err);
    }
    closeMenu();
  };

  const handleDelete = async () => {
    if (confirm) {
      try {
        await employeeService.delete(confirm.id);
        await loadSubAdmins();
      } catch (err) {
        console.error("Failed to delete subadmin:", err);
      }
      setConfirm(null);
    }
  };

  return (
    <Layout>
      <Box sx={{ pb: 3 }}>
        <PageHeader title="Sub Admin Management" crumbs={[{ label: "Sub Admin Management" }]} />
        <Box sx={{ ...card, mb: 2, display: "flex", flexWrap: "wrap", gap: 2, justifyContent: "space-between", alignItems: "center" }}>
          <TextField size="small" placeholder="Search sub admins..." value={search} onChange={(e) => setSearch(e.target.value)} sx={{ minWidth: 260, ...fieldSx }}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: "#94A3B8", fontSize: 20 }} /></InputAdornment> }} />
          <Button variant="contained" onClick={() => navigate("/dashboard/admins/add")}
            sx={{ textTransform: "none", bgcolor: "#2563EB", borderRadius: 2 }}>+ Add Sub Admin</Button>
        </Box>

        <Box sx={{ ...card, p: 0, overflow: "hidden" }}>
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
              <CircularProgress size={30} />
            </Box>
          ) : (
            <>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: "#F8FAFC" }}>
                      {["Sub Admin", "Email", "Department", "Role", "Status", "Last Login", "Actions"].map((h) => (
                        <TableCell key={h} sx={tableHeadCell}>{h}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paged.map((a) => (
                      <TableRow key={a.id} hover sx={{ "& td": { borderBottom: "1px solid #F1F5F9", py: 1.5 } }}>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={1.5}>
                            <Avatar sx={{ width: 36, height: 36, bgcolor: "#2563EB", fontSize: "0.8rem" }}>{a.fullName.split(" ").map((w) => w[0]).join("").slice(0, 2)}</Avatar>
                            <Typography sx={{ fontWeight: 600, color: "#0F172A", fontSize: "0.875rem" }}>{a.fullName}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ color: "#64748B", fontSize: "0.85rem" }}>{a.email}</TableCell>
                        <TableCell sx={{ color: "#334155", fontSize: "0.85rem" }}>{a.department}</TableCell>
                        <TableCell sx={{ color: "#334155", fontSize: "0.85rem" }}>{a.roleName}</TableCell>
                        <TableCell><StatusBadge status={a.status} /></TableCell>
                        <TableCell sx={{ color: "#64748B", fontSize: "0.82rem" }}>{a.lastLogin}</TableCell>
                        <TableCell>
                          <IconButton size="small" onClick={() => navigate(`/dashboard/admins/${a.id}`)} sx={{ color: "#2563EB" }}><VisibilityOutlinedIcon fontSize="small" /></IconButton>
                          <IconButton size="small" onClick={() => navigate(`/dashboard/admins/${a.id}/edit`)} sx={{ color: "#64748B" }}><EditOutlinedIcon fontSize="small" /></IconButton>
                          <IconButton size="small" onClick={(e) => handleMenu(e, a)}><MoreVertIcon fontSize="small" /></IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <Box display="flex" justifyContent="center" py={2}>
                <Pagination count={Math.ceil(filtered.length / 8) || 1} page={page} onChange={(_, v) => setPage(v)} size="small" />
              </Box>
            </>
          )}
        </Box>

        <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={closeMenu}>
          <MenuItem onClick={() => { closeMenu(); setConfirm({ id: selected.id, type: "reset", name: selected.fullName }); }}>
            <LockResetIcon sx={{ mr: 1, fontSize: 18 }} /> Reset Password
          </MenuItem>
          <MenuItem onClick={toggleStatus}>
            <PersonOffIcon sx={{ mr: 1, fontSize: 18 }} /> {selected?.status === "Active" ? "Deactivate" : "Activate"}
          </MenuItem>
          <MenuItem onClick={() => { setConfirm({ id: selected.id, type: "delete", name: selected.fullName }); closeMenu(); }} sx={{ color: "#DC2626" }}>
            <DeleteOutlineIcon sx={{ mr: 1, fontSize: 18 }} /> Delete
          </MenuItem>
        </Menu>

        <ConfirmDialog
          open={Boolean(confirm)}
          title={confirm?.type === "delete" ? "Delete Sub Admin" : "Reset Password"}
          message={confirm?.type === "delete" ? `Are you sure you want to delete ${confirm?.name}?` : `Send password reset link to ${confirm?.name}?`}
          confirmLabel={confirm?.type === "delete" ? "Delete" : "Send Reset"}
          confirmColor={confirm?.type === "delete" ? "#DC2626" : "#2563EB"}
          onClose={() => setConfirm(null)}
          onConfirm={confirm?.type === "delete" ? handleDelete : () => setConfirm(null)}
        />
      </Box>
    </Layout>
  );
}
