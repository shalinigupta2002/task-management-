import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  Box,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Breadcrumbs,
  Link,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { ArrowBack } from "@mui/icons-material";
import Layout from "../components/layouts/Layout";
import SubAdminLayout from "../components/layouts/SubAdminLayout";
import FrequencyForm from "../components/frequency/FrequencyForm";
import {
  FREQUENCY_NAME_OPTIONS,
  FREQUENCY_DEFAULTS,
} from "../constants/frequencyOptions";
import taskFrequencyService from "../services/taskFrequencyService";
import { toast } from "../utils/toast";
import { getErrorMessage, toApiStatus, toDisplayStatus } from "../utils/session";
import { validateRequired } from "../utils/validators";

function validatePositiveInteger(value, fieldLabel) {
  if (!validateRequired(value)) return `${fieldLabel} is required`;
  const num = Number(value);
  if (!Number.isInteger(num) || num <= 0) {
    return `${fieldLabel} must be a positive whole number`;
  }
  return "";
}

function toApiPayload(formData) {
  return {
    frequencyName: formData.name.trim(),
    daysInterval: Number(formData.daysInterval),
    numberOfDays: Number(formData.numberOfDays),
    description: formData.description?.trim() || null,
    status: toApiStatus(formData.status),
  };
}

function mapToFormData(record) {
  return {
    name: record.frequencyName || "",
    numberOfDays: record.numberOfDays ?? "",
    daysInterval: record.daysInterval ?? "",
    description: record.description || "",
    status: toDisplayStatus(record.status || "ACTIVE"),
  };
}

export default function FrequencyFormPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const isSubAdmin = location.pathname.startsWith("/sub-admin");
  const PageLayout = isSubAdmin ? SubAdminLayout : Layout;
  const listPath = isSubAdmin ? "/sub-admin/frequencies" : "/dashboard/frequencies";

  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    numberOfDays: "",
    daysInterval: "",
    description: "",
    status: "Active",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!isEdit) return;
    let active = true;
    (async () => {
      try {
        setLoading(true);
        setLoadError("");
        const record = await taskFrequencyService.getById(id);
        if (!active) return;
        setFormData(mapToFormData(record));
      } catch (error) {
        if (!active) return;
        setLoadError(getErrorMessage(error, "Failed to load frequency"));
        toast.error(getErrorMessage(error, "Failed to load frequency"));
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [id, isEdit]);

  const applyNameDefaults = (name, prev) => {
    const defaults = FREQUENCY_DEFAULTS[name];
    if (!defaults) return { ...prev, name };
    return {
      ...prev,
      name,
      daysInterval: defaults.daysInterval === "" ? prev.daysInterval : defaults.daysInterval,
      numberOfDays: defaults.numberOfDays === "" ? prev.numberOfDays : defaults.numberOfDays,
      description: prev.description?.trim()
        ? prev.description
        : (defaults.description || ""),
    };
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      if (name === "name" && !isEdit) {
        return applyNameDefaults(value, prev);
      }
      return { ...prev, [name]: value };
    });
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const next = {};
    if (!validateRequired(formData.name)) {
      next.name = "Frequency name is required";
    } else if (!FREQUENCY_NAME_OPTIONS.includes(formData.name.trim())) {
      next.name = `Frequency name must be one of: ${FREQUENCY_NAME_OPTIONS.join(", ")}`;
    }

    const numberOfDaysError = validatePositiveInteger(formData.numberOfDays, "Number of days");
    if (numberOfDaysError) next.numberOfDays = numberOfDaysError;

    const daysIntervalError = validatePositiveInteger(formData.daysInterval, "Interval");
    if (daysIntervalError) next.daysInterval = daysIntervalError;

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    if (!validate()) return;

    const payload = toApiPayload(formData);

    try {
      setSubmitting(true);
      if (isEdit) {
        await taskFrequencyService.update(id, payload);
        toast.success("Frequency updated successfully.");
      } else {
        await taskFrequencyService.create(payload);
        toast.success("Frequency created successfully.");
      }
      navigate(listPath);
    } catch (error) {
      const status = error?.response?.status;
      const message = getErrorMessage(error, isEdit ? "Failed to update frequency" : "Failed to create frequency");
      if (status === 409 || /already exists/i.test(message)) {
        toast.error("This frequency already exists.");
        setErrors((prev) => ({ ...prev, name: "This frequency already exists." }));
      } else {
        toast.error(message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <PageLayout>
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 320 }}>
          <CircularProgress />
        </Box>
      </PageLayout>
    );
  }

  if (loadError) {
    return (
      <PageLayout>
        <Box sx={{ p: { xs: 2, md: 3 } }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={() => navigate(listPath)}
            sx={{ textTransform: "none", borderColor: "#cbd5e1", color: "#475569", mb: 2 }}
          >
            Back
          </Button>
          <Paper sx={{ p: 4, borderRadius: 3, maxWidth: 640, textAlign: "center" }}>
            <Typography variant="h6" fontWeight={700} color="#0f172a" gutterBottom>
              Unable to load frequency
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{loadError}</Typography>
            <Button variant="contained" onClick={() => navigate(listPath)} sx={{ textTransform: "none", bgcolor: "#2563eb" }}>
              Back to Frequency List
            </Button>
          </Paper>
        </Box>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <Box sx={{ pb: 3 }}>
        <Box display="flex" flexWrap="wrap" alignItems="flex-start" justifyContent="space-between" gap={2} mb={2.5}>
          <Box>
            <Typography sx={{ fontWeight: 800, color: "#0F172A", fontSize: "1.5rem" }}>Frequencies</Typography>
            <Breadcrumbs sx={{ mt: 0.5, fontSize: "0.8rem" }}>
              <Link
                component={RouterLink}
                to={isSubAdmin ? "/sub-admin/dashboard" : "/dashboard"}
                underline="hover"
                color="#94A3B8"
                sx={{ fontSize: "0.8rem" }}
              >
                Home
              </Link>
              <Link component={RouterLink} to={listPath} underline="hover" color="#94A3B8" sx={{ fontSize: "0.8rem" }}>
                Frequencies
              </Link>
              <Typography color="#2563EB" sx={{ fontSize: "0.8rem", fontWeight: 600 }}>
                {isEdit ? "Edit Frequency" : "Add New Frequency"}
              </Typography>
            </Breadcrumbs>
            <Typography sx={{ color: "#64748B", fontSize: "0.9rem", mt: 1.25, maxWidth: 520 }}>
              {isEdit
                ? "Update this reusable frequency used when assigning schedules to tasks."
                : "Create a reusable frequency that can be assigned to tasks."}
            </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={() => navigate(listPath)}
            sx={{ textTransform: "none", borderColor: "#cbd5e1", color: "#475569", borderRadius: 2 }}
          >
            Back
          </Button>
        </Box>

        <Typography sx={{ fontWeight: 700, color: "#0F172A", fontSize: "1.15rem", mb: 1.5 }}>
          {isEdit ? "Edit Frequency" : "Add New Frequency"}
        </Typography>

        <Paper
          component="form"
          onSubmit={handleSubmit}
          sx={{
            p: { xs: 2.5, md: 4 },
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            border: "1px solid #E8EDF5",
            borderRadius: 3,
            maxWidth: 760,
            bgcolor: "#FFFFFF",
          }}
        >
          <FrequencyForm
            formData={formData}
            errors={errors}
            onChange={handleChange}
            onCancel={() => navigate(listPath)}
            submitting={submitting}
            isEdit={isEdit}
            submitLabel={isEdit ? "Update Frequency" : "Save Frequency"}
          />
        </Paper>
      </Box>
    </PageLayout>
  );
}
