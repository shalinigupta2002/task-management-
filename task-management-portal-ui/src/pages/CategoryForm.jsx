import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  CircularProgress,
} from "@mui/material";
import { Save, ArrowBack, AutoFixHigh } from "@mui/icons-material";
import Layout from "../components/layouts/Layout";
import taskCategoryService from "../services/taskCategoryService";
import departmentService from "../services/departmentService";
import { toast } from "../utils/toast";
import { USE_MOCK_API } from "../constants/config";
import {
  generateCategoryCodeFromName,
  resolveUniqueCategoryCode,
  CATEGORY_CODE_PATTERN,
  normalizeCategoryCode,
} from "../utils/categoryCode";
import {
  getCompanyId,
  getErrorMessage,
  toApiStatus,
  toDisplayStatus,
} from "../utils/session";

export default function CategoryForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [generatingCode, setGeneratingCode] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [formData, setFormData] = useState({
    categoryName: "",
    categoryCode: "",
    description: "",
    departmentId: "",
    status: "Active",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const companyId = getCompanyId();
    let active = true;
    (async () => {
      try {
        const params = companyId ? { companyId, limit: 100 } : { limit: 100 };
        const result = await departmentService.getAll(params);
        if (!active) return;
        setDepartments(result.items || []);
      } catch {
        if (active) setDepartments([]);
      }
    })();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    let active = true;
    (async () => {
      try {
        setLoading(true);
        const category = await taskCategoryService.getById(id);
        if (!active) return;
        setFormData({
          categoryName: category.categoryName || "",
          categoryCode: category.categoryCode || "",
          description: category.description || "",
          departmentId: category.departmentId || category.department?.id || "",
          status: toDisplayStatus(category.status),
        });
      } catch (error) {
        toast.error(getErrorMessage(error, "Failed to load category"));
        navigate("/dashboard/categories");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [id, isEdit, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleCategoryCodeChange = (e) => {
    const value = normalizeCategoryCode(e.target.value);
    setFormData((prev) => ({ ...prev, categoryCode: value }));
    if (errors.categoryCode) setErrors((prev) => ({ ...prev, categoryCode: "" }));
  };

  const validate = () => {
    const next = {};
    const name = formData.categoryName.trim();
    const code = normalizeCategoryCode(formData.categoryCode);

    if (!name) {
      next.categoryName = "Category name is required";
    } else if (name.length < 2) {
      next.categoryName = "Category name must be at least 2 characters";
    }

    if (!code) {
      next.categoryCode = "Category code is required";
    } else if (code.length < 2) {
      next.categoryCode = "Category code must be at least 2 characters";
    } else if (!CATEGORY_CODE_PATTERN.test(code)) {
      next.categoryCode = "Category code may only contain letters, numbers, and hyphens";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleGenerateCode = async () => {
    const name = formData.categoryName.trim();
    if (!name) {
      toast.error("Enter a category name before generating a code.");
      return;
    }

    const baseCode = generateCategoryCodeFromName(name);
    if (!baseCode || baseCode.length < 2) {
      toast.error("Could not generate a code from this category name. Please enter one manually.");
      return;
    }

    try {
      setGeneratingCode(true);
      const companyId = getCompanyId();
      const params = { limit: 100, ...(companyId ? { companyId } : {}) };
      const result = await taskCategoryService.getAll(params);
      const existingCodes = (result.items || [])
        .filter((category) => !isEdit || category.id !== id)
        .map((category) => category.categoryCode)
        .filter(Boolean);

      const uniqueCode = resolveUniqueCategoryCode(
        baseCode,
        existingCodes,
        isEdit ? formData.categoryCode : null
      );

      if (!uniqueCode) {
        toast.error("Could not generate a unique code. Please enter one manually.");
        return;
      }

      setFormData((prev) => ({ ...prev, categoryCode: uniqueCode }));
      setErrors((prev) => ({ ...prev, categoryCode: "" }));

      if (uniqueCode !== baseCode) {
        toast.info(`"${baseCode}" is already in use. Generated "${uniqueCode}" instead.`);
      }
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to generate category code"));
    } finally {
      setGeneratingCode(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const companyId = getCompanyId();
    if (!isEdit && !companyId && !USE_MOCK_API) {
      toast.error("Company context is missing. Please sign in again.");
      return;
    }

    const payload = {
      categoryName: formData.categoryName.trim(),
      categoryCode: normalizeCategoryCode(formData.categoryCode),
      description: formData.description.trim() || null,
      departmentId: formData.departmentId || null,
      status: toApiStatus(formData.status),
    };

    try {
      setSubmitting(true);
      if (isEdit) {
        await taskCategoryService.update(id, payload);
        toast.success("Category updated successfully");
      } else {
        await taskCategoryService.create({ ...payload, companyId: companyId || undefined });
        toast.success("Category created successfully");
      }
      navigate("/dashboard/categories");
    } catch (error) {
      const message = getErrorMessage(error, isEdit ? "Failed to update category" : "Failed to create category");
      if (/category code already exists/i.test(message)) {
        setErrors((prev) => ({ ...prev, categoryCode: "Category code already exists" }));
      }
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 320 }}>
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  return (
    <Layout>
      <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: "#f8fafc", minHeight: "100%" }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 3, gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={() => navigate("/dashboard/categories")}
            sx={{ textTransform: "none", borderColor: "#cbd5e1", color: "#475569" }}
          >
            Back
          </Button>
          <Box>
            <Typography variant="h5" fontWeight={700} color="#0f172a">
              {isEdit ? "Edit Category" : "Add Category"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {isEdit ? "Update the category details below." : "Fill in the details below to create a new task category."}
            </Typography>
          </Box>
        </Box>

        <Paper
          component="form"
          onSubmit={handleSubmit}
          sx={{ p: 4, boxShadow: "0px 4px 20px rgba(0,0,0,0.03)", borderRadius: 3, maxWidth: 800 }}
        >
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Category Name"
                name="categoryName"
                value={formData.categoryName}
                onChange={handleChange}
                required
                error={Boolean(errors.categoryName)}
                helperText={errors.categoryName}
                placeholder="e.g. Compliance"
                variant="outlined"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Box display="flex" gap={1} alignItems="flex-start">
                <TextField
                  fullWidth
                  label="Category Code"
                  name="categoryCode"
                  value={formData.categoryCode}
                  onChange={handleCategoryCodeChange}
                  required
                  error={Boolean(errors.categoryCode)}
                  helperText={errors.categoryCode || "Category code must be unique. Enter manually or click Generate Code."}
                  placeholder="Enter category code (e.g. HR, COMP, FIN)"
                  variant="outlined"
                  inputProps={{ style: { textTransform: "uppercase" } }}
                />
                <Button
                  type="button"
                  variant="outlined"
                  onClick={handleGenerateCode}
                  disabled={generatingCode || !formData.categoryName.trim()}
                  startIcon={generatingCode ? <CircularProgress size={16} /> : <AutoFixHigh />}
                  sx={{
                    mt: 1,
                    minWidth: 148,
                    height: 56,
                    textTransform: "none",
                    borderColor: "#cbd5e1",
                    color: "#2563eb",
                    whiteSpace: "nowrap",
                  }}
                >
                  Generate Code
                </Button>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                multiline
                rows={3}
                placeholder="Optional description for this category"
                variant="outlined"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth variant="outlined">
                <InputLabel id="category-department-label">Department</InputLabel>
                <Select
                  labelId="category-department-label"
                  name="departmentId"
                  value={formData.departmentId}
                  onChange={handleChange}
                  label="Department"
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  {departments.map((dept) => (
                    <MenuItem key={dept.id} value={dept.id}>
                      {dept.departmentName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth variant="outlined">
                <InputLabel id="category-status-label">Status</InputLabel>
                <Select
                  labelId="category-status-label"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  label="Status"
                >
                  <MenuItem value="Active">Active</MenuItem>
                  <MenuItem value="Inactive">Inactive</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 2 }}>
              <Button
                variant="outlined"
                onClick={() => navigate("/dashboard/categories")}
                sx={{ textTransform: "none", borderColor: "#cbd5e1", color: "#475569", px: 3 }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={submitting}
                startIcon={submitting ? <CircularProgress size={18} color="inherit" /> : <Save />}
                sx={{ bgcolor: "#2563eb", textTransform: "none", px: 3, borderRadius: 2 }}
              >
                {isEdit ? "Update Category" : "Save Category"}
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Box>
    </Layout>
  );
}
