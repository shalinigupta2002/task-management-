import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Alert, CircularProgress } from "@mui/material";
import Layout from "../components/layouts/Layout";
import { PageHeader, card } from "../components/main-admin/shared";
import EmployeeAccountDetailsForm from "../components/employees/EmployeeAccountDetailsForm";
import employeeService from "../services/employeeService";
import departmentService from "../services/departmentService";
import { toast } from "../utils/toast";
import { getErrorMessage } from "../utils/session";

/**
 * Main Admin — Add Employee (single Account Details page).
 * Replaces the old multi-step registration wizard.
 */
export default function Register() {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const [previewCode, setPreviewCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        const [depts, preview] = await Promise.all([
          departmentService.getAll({ limit: 100 }),
          employeeService.previewEmployeeCode("EMPLOYEE").catch(() => null),
        ]);
        if (!active) return;
        setDepartments(depts.items || depts || []);
        setPreviewCode(preview?.employeeId || "");
      } catch (err) {
        if (active) setError(getErrorMessage(err, "Failed to load form data"));
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const handleSubmit = async (payload) => {
    try {
      setSubmitting(true);
      setError("");
      const { _meta, confirmPassword, employeeId: _ignoredCode, ...apiPayload } = payload;
      void _meta;
      void confirmPassword;
      void _ignoredCode;
      const created = await employeeService.create(apiPayload);
      toast.success(`Employee created (${created?.employeeId || "code assigned"})`);
      navigate("/dashboard/employees");
    } catch (err) {
      const msg = getErrorMessage(err, "Failed to create employee");
      setError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <Box sx={{ pb: 3, maxWidth: 900 }}>
        <PageHeader
          title="Add Employee"
          crumbs={[{ label: "Employees", to: "/dashboard/employees" }, { label: "Add Employee" }]}
        />

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>
        )}

        {loading ? (
          <Box display="flex" justifyContent="center" py={6}><CircularProgress /></Box>
        ) : (
          <Box sx={{ ...card, p: { xs: 2, md: 3 } }}>
            <EmployeeAccountDetailsForm
              mode="create"
              departments={departments}
              previewEmployeeCode={previewCode}
              submitting={submitting}
              onCancel={() => navigate("/dashboard/employees")}
              onSubmit={handleSubmit}
            />
          </Box>
        )}
      </Box>
    </Layout>
  );
}
