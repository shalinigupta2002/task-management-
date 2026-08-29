import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Grid,
  Paper,
  Avatar,
  Typography,
  Chip,
  Button,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
} from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import AssessmentOutlinedIcon from "@mui/icons-material/AssessmentOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import SecurityIcon from "@mui/icons-material/Security";
import ExternalLinkAttachment, { AttachmentLinkList } from "../components/shared/ExternalLinkAttachment";
import { isValidExternalUrl } from "../utils/urlValidation";

export default function Profile() {
  const [profileData, setProfileData] = useState({
    firstName: "Sambhavi",
    lastName: "Shubhi",
    email: "shubhisingh791@gmail.com",
    mobile: "+91 6202593257",
    address: "Patna, Bihar, India",
    employeeCode: "EMP-183",
    designation: "software engineer",
    department: "IT",
    companyName: "Bold and wise ventures pvt ltd",
    companyAddress: "Bangalore, Karnataka, India",
    role: "Employee",
    status: "Approved",
  });

  const [openEditModal, setOpenEditModal] = useState(false);
  const [editForm, setEditForm] = useState(profileData);
  const [idDocumentUrl, setIdDocumentUrl] = useState("");
  const [profileAvatarUrl, setProfileAvatarUrl] = useState("");
  const [legacyIdPreviewUrl, setLegacyIdPreviewUrl] = useState(null);
  const [uploadTimestamp, setUploadTimestamp] = useState(null);

  useEffect(() => {
    const savedData =
      localStorage.getItem("employeeProfile") ||
      localStorage.getItem("registeredUser");
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setProfileData((prev) => ({ ...prev, ...parsed }));
        setEditForm((prev) => ({ ...prev, ...parsed }));
        if (parsed.idDocumentUrl) setIdDocumentUrl(parsed.idDocumentUrl);
        if (parsed.profileImageUrl || parsed.photo) setProfileAvatarUrl(parsed.profileImageUrl || parsed.photo);
      } catch (e) {
        console.error("Error parsing profile data:", e);
      }
    }
    const storedImage = sessionStorage.getItem("uploadedIdPreview");
    if (storedImage) setLegacyIdPreviewUrl(storedImage);

    const storedAvatar = sessionStorage.getItem("uploadedAvatar");
    if (storedAvatar && storedAvatar.startsWith("http")) setProfileAvatarUrl(storedAvatar);

    const storedTime = sessionStorage.getItem("uploadTimestamp");
    if (storedTime) setUploadTimestamp(storedTime);
  }, []);

  const handleOpenEdit = () => {
    setEditForm(profileData);
    setOpenEditModal(true);
  };

  const handleCloseEdit = () => setOpenEditModal(false);

  const handleChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleSaveProfile = () => {
    setProfileData(editForm);
    localStorage.setItem("employeeProfile", JSON.stringify(editForm));
    setOpenEditModal(false);
  };

  const persistDocumentUrl = (url) => {
    setIdDocumentUrl(url);
    const next = { ...profileData, idDocumentUrl: url };
    setProfileData(next);
    localStorage.setItem("employeeProfile", JSON.stringify(next));
    setUploadTimestamp(new Date().toLocaleString());
  };

  const persistAvatarUrl = (url) => {
    setProfileAvatarUrl(url);
    const next = { ...profileData, profileImageUrl: url };
    setProfileData(next);
    localStorage.setItem("employeeProfile", JSON.stringify(next));
  };

  const handleDownloadId = () => {
    const target = idDocumentUrl || legacyIdPreviewUrl;
    if (target) {
      window.open(target, "_blank", "noopener,noreferrer");
    } else {
      alert("No ID document link saved yet.");
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f8fafc", py: 4, px: { xs: 2, md: 4 } }}>
      <Container maxWidth="lg">
        {/* Top Header Card */}
        <Paper
          elevation={0}
          sx={{
            p: 3.5,
            borderRadius: 3,
            bgcolor: "#ffffff",
            border: "1px solid #e2e8f0",
            mb: 3,
            boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.05)",
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              alignItems: "center",
              justifyContent: "space-between",
              gap: 3,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2.5 }}>
              <Avatar
                src={profileAvatarUrl || ""}
                sx={{
                  width: 80,
                  height: 80,
                  bgcolor: "#2563eb",
                  fontSize: "1.8rem",
                  fontWeight: 700,
                  border: "2px solid #2563eb",
                }}
              >
                {!profileAvatarUrl && (profileData.firstName ? profileData.firstName[0] : "S")}
              </Avatar>
              <TextField
                size="small"
                label="Profile Image URL / Drive Link"
                value={profileAvatarUrl}
                onChange={(e) => setProfileAvatarUrl(e.target.value)}
                onBlur={() => {
                  if (profileAvatarUrl && isValidExternalUrl(profileAvatarUrl)) persistAvatarUrl(profileAvatarUrl);
                }}
                placeholder="https://..."
                sx={{ minWidth: 260, "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
              />
              <Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
                  <Typography variant="h5" fontWeight={700} color="#0f172a">
                    {profileData.firstName} {profileData.lastName}
                  </Typography>
                  <Chip
                    icon={
                      <span
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          backgroundColor: "#16a34a",
                          display: "inline-block",
                          marginLeft: 6,
                        }}
                      />
                    }
                    label="Active"
                    size="small"
                    sx={{ bgcolor: "#dcfce7", color: "#15803d", fontWeight: 600, height: 24 }}
                  />
                </Box>
                <Typography variant="body2" color="#64748b" sx={{ mt: 0.75 }}>
                  {profileData.designation} • <strong>{profileData.employeeCode}</strong> • {profileData.department} Department
                </Typography>
              </Box>
            </Box>

            {/* Actions */}
            <Stack direction="row" spacing={1.5} flexWrap="wrap" alignItems="center">
              <Button
                variant="outlined"
                size="small"
                startIcon={<EditOutlinedIcon />}
                onClick={handleOpenEdit}
                sx={{ textTransform: "none", borderColor: "#cbd5e1", color: "#334155", fontWeight: 600, borderRadius: 2 }}
              >
                Edit Profile
              </Button>
              <Button
                variant="outlined"
                size="small"
                startIcon={<DownloadOutlinedIcon />}
                onClick={handleDownloadId}
                sx={{ textTransform: "none", borderColor: "#cbd5e1", color: "#334155", fontWeight: 600, borderRadius: 2 }}
              >
                Download ID
              </Button>
              <Button
                variant="outlined"
                size="small"
                startIcon={<AssessmentOutlinedIcon />}
                onClick={() => alert("Navigating to Reports...")}
                sx={{ textTransform: "none", borderColor: "#cbd5e1", color: "#334155", fontWeight: 600, borderRadius: 2 }}
              >
                Reports
              </Button>
            </Stack>
          </Box>
        </Paper>

        {/* Full Width Stacked Cards Layout */}
        <Stack spacing={3}>
          {/* Personal Information Card - Full Width */}
          <Paper elevation={0} sx={{ p: 3.5, width: "100%", borderRadius: 3, border: "1px solid #e2e8f0", bgcolor: "#ffffff" }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2.5 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <PersonOutlineIcon sx={{ color: "#2563eb", fontSize: "1.5rem" }} />
                <Typography variant="h6" fontWeight={700} color="#0f172a">
                  Personal Information
                </Typography>
              </Box>
              <Chip icon={<SecurityIcon sx={{ fontSize: "14px !important" }} />} label="Secure" size="small" sx={{ bgcolor: "#f1f5f9", color: "#475569", fontSize: "0.7rem" }} />
            </Box>
            <Divider sx={{ mb: 3 }} />
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={2.4}>
                <FieldBox label="First Name" value={profileData.firstName} />
              </Grid>
              <Grid item xs={12} sm={6} md={2.4}>
                <FieldBox label="Last Name" value={profileData.lastName} />
              </Grid>
              <Grid item xs={12} sm={6} md={2.4}>
                <FieldBox label="Email Address" value={profileData.email} />
              </Grid>
              <Grid item xs={12} sm={6} md={2.4}>
                <FieldBox label="Phone Number" value={profileData.mobile} />
              </Grid>
              <Grid item xs={12} sm={6} md={2.4}>
                <FieldBox label="Address" value={profileData.address} />
              </Grid>
            </Grid>
          </Paper>

          {/* Employment Details Card - Full Width */}
          <Paper elevation={0} sx={{ p: 3.5, width: "100%", borderRadius: 3, border: "1px solid #e2e8f0", bgcolor: "#ffffff" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2.5 }}>
              <BusinessOutlinedIcon sx={{ color: "#2563eb", fontSize: "1.5rem" }} />
              <Typography variant="h6" fontWeight={700} color="#0f172a">
                Employment Details
              </Typography>
            </Box>
            <Divider sx={{ mb: 3 }} />
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <FieldBox label="Department" value={profileData.department} />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FieldBox label="Designation" value={profileData.designation} />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FieldBox label="Company Name" value={profileData.companyName} />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FieldBox label="Company Address" value={profileData.companyAddress} />
              </Grid>
            </Grid>
          </Paper>

          {/* Identity & Documents Card - Full Width */}
          <Paper elevation={0} sx={{ p: 3.5, width: "100%", borderRadius: 3, border: "1px solid #e2e8f0", bgcolor: "#ffffff" }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2.5 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <BadgeOutlinedIcon sx={{ color: "#2563eb", fontSize: "1.5rem" }} />
                <Typography variant="h6" fontWeight={700} color="#0f172a">
                  Identity & Documents
                </Typography>
              </Box>
              <Button
                variant="outlined"
                size="small"
                startIcon={<DownloadOutlinedIcon />}
                onClick={handleDownloadId}
                sx={{ textTransform: "none", borderRadius: 2, px: 2, py: 0.75 }}
              >
                Open ID Link
              </Button>
            </Box>
            <Divider sx={{ mb: 3 }} />

            <ExternalLinkAttachment
              label="Document / Drive Link"
              value={idDocumentUrl ? [{ id: "id-doc", url: idDocumentUrl, name: "Identity Document" }] : []}
              onChange={(links) => persistDocumentUrl(links[0]?.url || "")}
              multiple={false}
              maxLinks={1}
            />

            {(idDocumentUrl || legacyIdPreviewUrl) ? (
              <Box sx={{ mt: 2 }}>
                <AttachmentLinkList
                  items={idDocumentUrl
                    ? [{ id: "id-doc", url: idDocumentUrl, name: "Identity Document" }]
                    : [{ id: "legacy-id", name: "Legacy uploaded document", url: legacyIdPreviewUrl }]}
                  readOnly
                />
              </Box>
            ) : (
              <Box sx={{ textAlign: "center", py: 4, border: "2px dashed #cbd5e1", borderRadius: 2, bgcolor: "#f8fafc", mt: 2 }}>
                <Typography variant="body1" color="#64748b" fontWeight={500}>
                  No ID document link saved yet.
                </Typography>
                <Typography variant="caption" color="#94a3b8">
                  Paste a Google Drive or external document link above.
                </Typography>
              </Box>
            )}
          </Paper>
        </Stack>
      </Container>

      {/* Edit Profile Modal */}
      <Dialog open={openEditModal} onClose={handleCloseEdit} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3, p: 1 } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>Edit Profile Information</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={6}>
              <TextField fullWidth label="First Name" name="firstName" value={editForm.firstName || ""} onChange={handleChange} size="small" />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth label="Last Name" name="lastName" value={editForm.lastName || ""} onChange={handleChange} size="small" />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth label="Email" name="email" value={editForm.email || ""} onChange={handleChange} size="small" />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth label="Phone" name="mobile" value={editForm.mobile || ""} onChange={handleChange} size="small" />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Address" name="address" value={editForm.address || ""} onChange={handleChange} size="small" />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth label="Department" name="department" value={editForm.department || ""} onChange={handleChange} size="small" />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth label="Designation" name="designation" value={editForm.designation || ""} onChange={handleChange} size="small" />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth label="Company Name" name="companyName" value={editForm.companyName || ""} onChange={handleChange} size="small" />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth label="Company Address" name="companyAddress" value={editForm.companyAddress || ""} onChange={handleChange} size="small" />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseEdit} color="inherit" sx={{ textTransform: "none", fontWeight: 600 }}>Cancel</Button>
          <Button onClick={handleSaveProfile} variant="contained" sx={{ bgcolor: "#2563eb", textTransform: "none", fontWeight: 600, px: 3, borderRadius: 2 }}>Save Changes</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

function FieldBox({ label, value }) {
  return (
    <Box sx={{ bgcolor: "#f8fafc", p: 2, borderRadius: 2, border: "1px solid #f1f5f9", height: "100%" }}>
      <Typography variant="caption" color="#64748b" fontWeight={600} display="block" sx={{ textTransform: "uppercase", letterSpacing: "0.5px" }}>
        {label}
      </Typography>
      <Typography variant="body1" fontWeight={600} color="#0f172a" sx={{ mt: 0.5, wordBreak: "break-word" }}>
        {value || "—"}
      </Typography>
    </Box>
  );
}