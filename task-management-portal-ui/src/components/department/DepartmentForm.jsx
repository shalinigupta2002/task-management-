import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  MenuItem,
  FormControl,
  Select,
  CircularProgress,
  Divider,
} from "@mui/material";
import { Save, ArrowBack, EditOutlined, AutoFixHigh } from "@mui/icons-material";
import Layout from "../layouts/Layout";
import SubAdminLayout from "../layouts/SubAdminLayout";
import departmentService from "../../services/departmentService";
import { toast } from "../../utils/toast";
import { USE_MOCK_API } from "../../constants/config";
import {
  getAuthUser,
  getCompanyId,
  getErrorMessage,
  toApiStatus,
  toDisplayStatus,
} from "../../utils/session";
import { getDepartmentHead, getDepartmentUserCount } from "../../utils/departmentDisplay";

function generateDepartmentCode(deptName, companyCode) {
  if (!deptName) return "";
  
  const prefix = (companyCode || "ABC").trim().toUpperCase();
  const cleaned = deptName.trim().toUpperCase();
  
  const lowerCleaned = cleaned.toLowerCase();
  if (lowerCleaned.includes("human resource") || lowerCleaned === "hr") {
    return `${prefix}-HR`;
  }
  if (lowerCleaned.includes("information technology") || lowerCleaned === "it") {
    return `${prefix}-IT`;
  }
  if (lowerCleaned.includes("finance") || lowerCleaned.includes("accounting") || lowerCleaned.includes("billing")) {
    return `${prefix}-FIN`;
  }
  if (lowerCleaned.includes("operation") || lowerCleaned === "ops") {
    return `${prefix}-OPS`;
  }
  if (lowerCleaned.includes("marketing") || lowerCleaned === "mkt") {
    return `${prefix}-MKT`;
  }
  if (lowerCleaned.includes("sales") || lowerCleaned === "sal") {
    return `${prefix}-SAL`;
  }
  if (lowerCleaned.includes("engineering") || lowerCleaned === "eng") {
    return `${prefix}-ENG`;
  }
  if (lowerCleaned.includes("development") || lowerCleaned === "dev") {
    return `${prefix}-DEV`;
  }
  if (lowerCleaned.includes("administration") || lowerCleaned === "admin") {
    return `${prefix}-ADMIN`;
  }
  if (lowerCleaned.includes("support") || lowerCleaned.includes("customer service") || lowerCleaned.includes("helpdesk")) {
    return `${prefix}-SUPP`;
  }
  if (lowerCleaned.includes("quality assurance") || lowerCleaned === "qa") {
    return `${prefix}-QA`;
  }
  if (lowerCleaned.includes("legal") || lowerCleaned === "leg") {
    return `${prefix}-LEG`;
  }
  if (lowerCleaned.includes("compliance") || lowerCleaned === "comp") {
    return `${prefix}-COMP`;
  }

  const words = cleaned
    .split(/[\s&-_]+/)
    .filter(w => w && !["AND", "OR", "OF", "THE", "FOR", "IN", "TO", "A", "AN"].includes(w));
  
  if (words.length > 1) {
    const letters = words.map(w => w[0]).join("");
    return `${prefix}-${letters.substring(0, 4)}`;
  }

  const singleWord = words[0] || cleaned;
  const consonants = singleWord.replace(/[AEIOU]/g, "");
  if (consonants.length >= 3) {
    return `${prefix}-${consonants.substring(0, 3)}`;
  }
  
  return `${prefix}-${singleWord.substring(0, 3)}`;
}

export default function DepartmentForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const isView = location.pathname.includes("/view/");
  const isEdit = Boolean(id) && !isView;
  const isSubAdminPath = location.pathname.startsWith("/sub-admin");
  const PageLayout = isSubAdminPath ? SubAdminLayout : Layout;

  const listPath = isSubAdminPath
    ? "/sub-admin/departments"
    : location.pathname.startsWith("/dashboard")
      ? "/dashboard/departments"
      : "/departments";

  const [loading, setLoading] = useState(isEdit || isView);
  const [submitting, setSubmitting] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [headName, setHeadName] = useState("—");
  const [totalUsers, setTotalUsers] = useState(0);
  const [formData, setFormData] = useState({
    departmentName: "",
    departmentCode: "",
    description: "",
    status: "Active",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!id) return;
    let active = true;
    (async () => {
      try {
        setLoading(true);
        setLoadError(null);
        const dept = await departmentService.getById(id);
        if (!active) return;
        setFormData({
          departmentName: dept.departmentName || "",
          departmentCode: dept.departmentCode || "",
          description: dept.description || "",
          status: toDisplayStatus(dept.status),
        });
        setHeadName(getDepartmentHead(dept));
        setTotalUsers(getDepartmentUserCount(dept));
      } catch (error) {
        if (!active) return;
        const status = error?.response?.status;
        const message = getErrorMessage(error, "Failed to load department");
        const notFound =
          status === 404 || /not found/i.test(message || "");
        setLoadError({
          type: notFound ? "not_found" : "error",
          message: notFound ? "Department not found" : message,
        });
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [id]);

  const handleChange = (e) => {
    let { name, value } = e.target;
    if (name === "departmentCode") {
      value = value.toUpperCase().replace(/\s+/g, "");
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleGenerateCode = () => {
    const name = formData.departmentName.trim();
    if (!name) {
      setErrors((prev) => ({
        ...prev,
        departmentName: "Department name is required to generate a code",
      }));
      toast.error("Please enter a department name first");
      return;
    }
    const user = getAuthUser();
    const companyCode = user?.company?.companyCode || "ABC";
    const generated = generateDepartmentCode(name, companyCode);
    setFormData((prev) => ({ ...prev, departmentCode: generated }));
    setErrors((prev) => ({ ...prev, departmentCode: "" }));
  };

  const validate = () => {
    const next = {};
    const name = formData.departmentName.trim();
    const code = formData.departmentCode.trim();
    const desc = (formData.description || "").trim();

    if (!name) {
      next.departmentName = "Department name is required";
    } else if (name.length < 2) {
      next.departmentName = "Department name must be at least 2 characters";
    } else if (name.length > 150) {
      next.departmentName = "Department name cannot exceed 150 characters";
    }

    if (!code) {
      next.departmentCode = "Department code is required";
    } else if (code.length < 2) {
      next.departmentCode = "Department code must be at least 2 characters";
    } else if (code.length > 50) {
      next.departmentCode = "Department code cannot exceed 50 characters";
    } else if (!/^[A-Z0-9_-]+$/i.test(code)) {
      next.departmentCode = "Code may only contain letters, numbers, hyphens and underscores";
    }

    if (desc.length > 1000) {
      next.description = "Description cannot exceed 1000 characters";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isView) return;
    if (!validate()) return;

    const companyId = getCompanyId();
    if (!isEdit && !companyId && !USE_MOCK_API) {
      toast.error("Company context is missing. Please sign in again.");
      return;
    }

    const payload = {
      departmentName: formData.departmentName.trim(),
      departmentCode: formData.departmentCode.trim().toUpperCase(),
      description: formData.description ? formData.description.trim() : null,
      status: toApiStatus(formData.status),
    };

    try {
      setSubmitting(true);
      if (isEdit) {
        await departmentService.update(id, payload);
        toast.success("Department updated successfully");
      } else {
        await departmentService.create({ ...payload, companyId: companyId || "mock-company" });
        toast.success("Department created successfully");
      }
      navigate(listPath);
    } catch (error) {
      const msg = getErrorMessage(error);
      if (msg && (msg.includes("already exists") || error?.response?.status === 409)) {
        setErrors((prev) => ({
          ...prev,
          departmentCode: "Department code already exists. Please use a different code.",
        }));
        toast.error("Department code already exists. Please use a different code.");
      } else {
        toast.error(getErrorMessage(error, isEdit ? "Failed to update department" : "Failed to create department"));
      }
    } finally {
      setSubmitting(false);
    }
  };

  const pageTitle = isView ? "View Department" : isEdit ? "Edit Department" : "Create New Department";
  const pageSubtitle = isView
    ? "Department details (read-only)."
    : isEdit
      ? "Update the department details below."
      : "Add a department and configure its basic information.";

  if (loading) {
    return (
      <PageLayout>
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      </PageLayout>
    );
  }

  if (loadError) {
    return (
      <PageLayout>
        <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: "#f8fafc", minHeight: "100%" }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={() => navigate(listPath)}
            sx={{ textTransform: "none", borderColor: "#cbd5e1", color: "#475569", mb: 3 }}
          >
            Back
          </Button>
          <Paper sx={{ p: 4, borderRadius: 3, maxWidth: 640, textAlign: "center" }}>
            <Typography variant="h6" fontWeight={700} color="#0f172a" gutterBottom>
              {loadError.type === "not_found" ? "Department not found" : "Unable to load department"}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {loadError.message}
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate(listPath)}
              sx={{ textTransform: "none", bgcolor: "#2563eb", borderRadius: 2 }}
            >
              Back to Departments
            </Button>
          </Paper>
        </Box>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, bgcolor: "#f8fafc", minHeight: "calc(100vh - 64px)", display: "flex", justifyContent: "center" }}>
        <Box sx={{ width: "100%", maxWidth: 800 }}>
          <Box sx={{ mb: 4 }}>
            <Typography
              onClick={() => navigate(listPath)}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                color: "#64748B",
                fontSize: "0.875rem",
                fontWeight: 500,
                mb: 1.5,
                cursor: "pointer",
                userSelect: "none",
                transition: "color 0.2s",
                "&:hover": { color: "#2563EB" },
              }}
            >
              <ArrowBack sx={{ fontSize: 16 }} /> Back to Departments
            </Typography>
            <Box display="flex" justifyContent="space-between" alignItems="flex-start" gap={2}>
              <Box>
                <Typography variant="h5" fontWeight={800} color="#0f172a" sx={{ fontSize: { xs: "1.25rem", md: "1.5rem" } }}>
                  {pageTitle}
                </Typography>
                <Typography variant="body2" color="#64748B" sx={{ mt: 0.5 }}>
                  {pageSubtitle}
                </Typography>
              </Box>
              {isView && !isSubAdminPath && (
                <Button
                  variant="contained"
                  startIcon={<EditOutlined />}
                  onClick={() => navigate(`${listPath}/edit/${id}`)}
                  sx={{
                    textTransform: "none",
                    bgcolor: "#2563eb",
                    borderRadius: 2,
                    fontWeight: 600,
                    "&:hover": { bgcolor: "#1d4ed8" },
                  }}
                >
                  Edit
                </Button>
              )}
            </Box>
          </Box>

          <Paper
            component="form"
            onSubmit={handleSubmit}
            sx={{
              p: { xs: 3, md: 4 },
              boxShadow: "0px 1px 3px rgba(15, 23, 42, 0.08), 0px 1px 2px rgba(15, 23, 42, 0.04)",
              border: "1px solid #e2e8f0",
              borderRadius: 3,
              bgcolor: "#ffffff",
            }}
          >
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" fontWeight={700} color="#0f172a">
                Department Information
              </Typography>
              {!isView && !isEdit && (
                <Typography variant="body2" color="#64748B" sx={{ mt: 0.5 }}>
                  Provide the basic details required to create this department.
                </Typography>
              )}
            </Box>
            <Divider sx={{ mb: 3, borderColor: "#e2e8f0" }} />

            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Box display="flex" flexDirection="column" gap={1}>
                  <Typography variant="body2" fontWeight={600} color="#334155" display="flex" alignItems="center" gap={0.5}>
                    Department Name <span style={{ color: "#ef4444" }}>*</span>
                  </Typography>
                  <TextField
                    fullWidth
                    name="departmentName"
                    value={formData.departmentName}
                    onChange={handleChange}
                    required
                    disabled={isView}
                    error={Boolean(errors.departmentName)}
                    helperText={errors.departmentName}
                    placeholder="e.g. Human Resources"
                    variant="outlined"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                      }
                    }}
                  />
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box display="flex" flexDirection="column" gap={1}>
                  <Typography variant="body2" fontWeight={600} color="#334155" display="flex" alignItems="center" gap={0.5}>
                    Department Code <span style={{ color: "#ef4444" }}>*</span>
                  </Typography>
                  <Box display="flex" gap={1.5} alignItems="flex-start">
                    <TextField
                      fullWidth
                      name="departmentCode"
                      value={formData.departmentCode}
                      onChange={handleChange}
                      required
                      disabled={isView}
                      error={Boolean(errors.departmentCode)}
                      helperText={errors.departmentCode}
                      placeholder="e.g. ABC-HR"
                      variant="outlined"
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                        }
                      }}
                    />
                    {!isView && (
                      <Button
                        variant="outlined"
                        onClick={handleGenerateCode}
                        startIcon={<AutoFixHigh />}
                        sx={{
                          height: 56,
                          whiteSpace: "nowrap",
                          textTransform: "none",
                          borderColor: "#cbd5e1",
                          color: "#475569",
                          borderRadius: 2,
                          fontWeight: 600,
                          px: 2.5,
                          "&:hover": { borderColor: "#94a3b8", bgcolor: "#f1f5f9" }
                        }}
                      >
                        Generate Code
                      </Button>
                    )}
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Box display="flex" flexDirection="column" gap={1}>
                  <Typography variant="body2" fontWeight={600} color="#334155">
                    Description
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    name="description"
                    value={formData.description || ""}
                    onChange={handleChange}
                    disabled={isView}
                    placeholder="Describe the purpose and responsibilities of this department..."
                    variant="outlined"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                      }
                    }}
                  />
                </Box>
              </Grid>

              {(isEdit || isView) && (
                <Grid item xs={12} sm={6}>
                  <Box display="flex" flexDirection="column" gap={1}>
                    <Typography variant="body2" fontWeight={600} color="#64748b">
                      Head of Department
                    </Typography>
                    <TextField
                      fullWidth
                      value={headName}
                      disabled
                      variant="outlined"
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                          bgcolor: "#f8fafc",
                        }
                      }}
                    />
                  </Box>
                </Grid>
              )}

              {(isEdit || isView) && (
                <Grid item xs={12} sm={6}>
                  <Box display="flex" flexDirection="column" gap={1}>
                    <Typography variant="body2" fontWeight={600} color="#64748b">
                      Total Users
                    </Typography>
                    <TextField
                      fullWidth
                      value={String(totalUsers)}
                      disabled
                      variant="outlined"
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                          bgcolor: "#f8fafc",
                        }
                      }}
                    />
                  </Box>
                </Grid>
              )}

              <Grid item xs={12} sm={6}>
                <Box display="flex" flexDirection="column" gap={1}>
                  <Typography variant="body2" fontWeight={600} color="#334155">
                    Status
                  </Typography>
                  <FormControl fullWidth variant="outlined">
                    <Select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      disabled={isView}
                      sx={{
                        borderRadius: 2,
                      }}
                    >
                      <MenuItem value="Active">Active</MenuItem>
                      <MenuItem value="Inactive">Inactive</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </Grid>

              {!isView && (
                <Grid item xs={12} sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 3 }}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate(listPath)}
                    sx={{
                      textTransform: "none",
                      borderColor: "#cbd5e1",
                      color: "#475569",
                      px: 3,
                      borderRadius: 2,
                      fontWeight: 600,
                      "&:hover": { borderColor: "#94a3b8", bgcolor: "#f1f5f9" }
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={submitting}
                    sx={{
                      bgcolor: "#2563eb",
                      textTransform: "none",
                      px: 3,
                      borderRadius: 2,
                      fontWeight: 600,
                      "&:hover": { bgcolor: "#1d4ed8" }
                    }}
                  >
                    {submitting ? (isEdit ? "Saving..." : "Creating...") : (isEdit ? "Save Changes" : "Create Department")}
                  </Button>
                </Grid>
              )}
            </Grid>
          </Paper>
        </Box>
      </Box>
    </PageLayout>
  );
}
