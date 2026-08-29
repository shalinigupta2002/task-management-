import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  Box, Typography, Grid, Button, TextField, MenuItem, Select, FormControl,
  InputLabel, Tabs, Tab, Avatar, Chip, Paper, CircularProgress, FormHelperText
} from "@mui/material";
import Layout from "../layouts/Layout";
import SubAdminLayout from "../layouts/SubAdminLayout";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { ArrowBack, Save } from "@mui/icons-material";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import SendIcon from "@mui/icons-material/Send";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ExternalLinkAttachment, { AttachmentLinkList } from "../shared/ExternalLinkAttachment";
import ConfirmDialog from "../shared/ConfirmDialog";
import TaskStatusBadge from "./TaskStatusBadge";
import { card, SAMPLE_TASK, TASK_LIST, PRIORITY_DOT } from "./taskShared";
import taskCategoryService from "../../services/taskCategoryService";
import taskFrequencyService from "../../services/taskFrequencyService";
import taskService from "../../services/taskService";
import departmentService from "../../services/departmentService";
import employeeService from "../../services/employeeService";
import { toast } from "../../utils/toast";
import { getCompanyId, getErrorMessage, getDepartmentId, getAuthUser, isSubAdminUser } from "../../utils/session";
import { applyFrequencyToTaskForm } from "../../utils/frequencySchedule";
import { formatDaysInterval } from "../../utils/session";

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 2,
    bgcolor: "#F8FAFC",
    "& fieldset": { borderColor: "#E2E8F0" },
    "&:hover fieldset": { borderColor: "#2563EB" },
    "&.Mui-focused fieldset": { borderColor: "#2563EB", borderWidth: "2px" },
  },
  "& .MuiInputLabel-root.Mui-focused": { color: "#2563EB" },
};

const PRIORITY_TO_API = { High: "HIGH", Medium: "MEDIUM", Low: "LOW" };
const PRIORITY_FROM_API = { HIGH: "High", MEDIUM: "Medium", LOW: "Low", CRITICAL: "High" };

function TabPanel({ children, value, index }) {
  return value === index ? <Box sx={{ pt: 2.5 }}>{children}</Box> : null;
}

function formatDateInput(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

/** Convert YYYY-MM-DD (or Date-parsable) form values to ISO-8601, or null if empty/invalid. */
function toIsoDateOrNull(value) {
  if (value == null) return null;
  const raw = String(value).trim();
  if (!raw || raw === "Invalid Date" || raw === "undefined" || raw === "null") return null;
  // Prefer stable UTC midnight for date-only inputs (YYYY-MM-DD)
  const d = /^\d{4}-\d{2}-\d{2}$/.test(raw)
    ? new Date(`${raw}T00:00:00.000Z`)
    : new Date(raw);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

function addDaysToDateString(dateStr, days) {
  if (!dateStr || !days) return "";
  const d = /^\d{4}-\d{2}-\d{2}$/.test(dateStr)
    ? new Date(`${dateStr}T00:00:00.000Z`)
    : new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "";
  d.setUTCDate(d.getUTCDate() + Number(days) - 1);
  return d.toISOString().slice(0, 10);
}

/**
 * Build a backend-compatible task payload.
 * Omits empty optional UUID/date strings so Zod does not receive "" → Invalid date/UUID.
 */
function buildTaskApiPayload(formState, { includeCompanyId = false, status } = {}) {
  const startDate = toIsoDateOrNull(formState.startDate);
  const dueDate = toIsoDateOrNull(formState.dueDate);
  const endDate = toIsoDateOrNull(formState.endDate);

  const payload = {
    title: String(formState.title || "").trim(),
    description: formState.description?.trim() ? formState.description.trim() : null,
    priority: PRIORITY_TO_API[formState.priority] || "MEDIUM",
    assignedToIds: Array.isArray(formState.assignedToIds)
      ? formState.assignedToIds.filter(Boolean)
      : [],
    recurrenceType: formState.recurrenceType || "ONE_TIME",
  };

  if (includeCompanyId) {
    const companyId = getCompanyId();
    if (companyId) payload.companyId = companyId;
  }

  if (status) payload.status = status;
  else if (formState.status) payload.status = formState.status;

  if (formState.frequencyId) payload.frequencyId = formState.frequencyId;
  if (formState.categoryId) payload.categoryId = formState.categoryId;
  if (formState.departmentId) payload.departmentId = formState.departmentId;
  if (formState.approverId) payload.approverId = formState.approverId;

  if (formState.estimatedHours !== "" && formState.estimatedHours != null) {
    const hours = Number(formState.estimatedHours);
    if (!Number.isNaN(hours)) payload.estimatedHours = hours;
  }

  if (formState.durationDays !== "" && formState.durationDays != null) {
    const days = Number(formState.durationDays);
    if (!Number.isNaN(days) && days > 0) payload.durationDays = days;
  }

  if (startDate) payload.startDate = startDate;
  if (dueDate) payload.dueDate = dueDate;
  if (endDate) payload.endDate = endDate;

  return payload;
}

function getEmployeeLabel(emp) {
  if (!emp) return "Unknown";
  if (emp.fullName) return emp.fullName;
  return [emp.firstName, emp.lastName].filter(Boolean).join(" ") || emp.email || "Unknown";
}

function getAssigneeLabel(emp) {
  return getEmployeeLabel(emp);
}

function mapTaskToForm(task) {
  const assigneeIds = (task.assignments || [])
    .filter((a) => a.status !== "CANCELLED")
    .map((a) => a.assignedToId || a.assignedTo?.id)
    .filter(Boolean);

  return {
    title: task.title || "",
    description: task.description || "",
    categoryId: task.categoryId || task.category?.id || "",
    frequencyId: task.frequencyId || task.frequency?.id || "",
    departmentId: task.departmentId || task.department?.id || "",
    assignedToIds: assigneeIds,
    approverId: task.approverId || task.approver?.id || "",
    recurrenceType: task.recurrenceType || "ONE_TIME",
    durationDays: task.durationDays ?? "",
    endDate: formatDateInput(task.endDate),
    priority: PRIORITY_FROM_API[task.priority] || task.priority || "Medium",
    startDate: formatDateInput(task.startDate),
    dueDate: formatDateInput(task.dueDate),
    estimatedHours: task.estimatedHours ?? "",
    status: task.status || "OPEN",
    createdById: task.createdById || task.createdBy?.id || "",
  };
}

export default function TaskForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();

  const isEdit = Boolean(id);
  const isCreate = !isEdit;

  const [tab, setTab] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(isEdit);
  const [loadingChoices, setLoadingChoices] = useState(true);

  const [form, setForm] = useState({
    title: "",
    description: "",
    categoryId: "",
    frequencyId: "",
    departmentId: "",
    assignedToIds: [],
    approverId: "",
    recurrenceType: "DAILY",
    durationDays: "",
    endDate: "",
    priority: "Medium",
    startDate: "",
    dueDate: "",
    estimatedHours: "",
    status: "OPEN",
    createdById: "",
  });

  const [errors, setErrors] = useState({});
  const [attachmentLinks, setAttachmentLinks] = useState([]);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [frequencyOptions, setFrequencyOptions] = useState([]);
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [employeeOptions, setEmployeeOptions] = useState([]);
  const [assigneeOptions, setAssigneeOptions] = useState([]);

  const tabLabels = ["General Info", "Recurrence Info", "Attachments"];
  const tasksBase = location.pathname.startsWith("/sub-admin") ? "/sub-admin/tasks" : "/dashboard/tasks";
  const PageLayout = location.pathname.startsWith("/sub-admin") ? SubAdminLayout : Layout;
  const isSubAdminContext = location.pathname.startsWith("/sub-admin") || isSubAdminUser();
  const authUser = getAuthUser();
  const lockedDepartmentId = isSubAdminContext ? (getDepartmentId() || authUser?.departmentId) : "";

  const isReadOnly = useMemo(() => {
    if (!isEdit) return false;
    
    const isStatusEditable = form.status === "DRAFT" || form.status === "OPEN" || form.status === "Draft" || form.status === "Open";
    if (!isStatusEditable) return true;

    if (isSubAdminContext) {
      const userDeptId = getDepartmentId() || authUser?.departmentId;
      const isDeptMatch = form.departmentId && form.departmentId === userDeptId;
      const isCreatorMatch = form.createdById && form.createdById === authUser?.id;
      if (!isDeptMatch && !isCreatorMatch) return true;
    }
    
    return false;
  }, [isEdit, form.status, form.departmentId, form.createdById, authUser, isSubAdminContext]);

  // Load dropdown options
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoadingChoices(true);
        const companyId = getCompanyId();
        const categoryParams = { limit: 100, ...(companyId ? { companyId } : {}) };
        const deptParams = { limit: 100, ...(companyId ? { companyId } : {}) };
        const assigneeParams = {
          limit: 100,
          roleName: "EMPLOYEE",
          status: "ACTIVE",
          ...(companyId ? { companyId } : {}),
          ...(isSubAdminContext && lockedDepartmentId ? { departmentId: lockedDepartmentId } : {}),
        };
        const approverParams = { limit: 100, status: "ACTIVE", ...(companyId ? { companyId } : {}) };

        const [categoryResult, frequencyResult, departmentResult, assigneeResult, approverResult] = await Promise.all([
          taskCategoryService.getAll(categoryParams).catch(() => ({ items: [] })),
          taskFrequencyService.getAll({ limit: 100 }).catch(() => ({ items: [] })),
          departmentService.getAll(deptParams).catch(() => ({ items: [] })),
          employeeService.getAll(assigneeParams).catch(() => ({ items: [] })),
          employeeService.getUsers(approverParams).catch(() => ({ items: [] })),
        ]);

        if (!active) return;

        let departments = departmentResult.items || [];
        if (isSubAdminContext && lockedDepartmentId) {
          departments = departments.filter((d) => d.id === lockedDepartmentId);
        }
        const approvers = (approverResult.items || []).filter((u) => {
          const role = u.role?.name || u.roleName || u.role;
          return role === "MAIN_ADMIN" || role === "SUB_ADMIN" || role === "ADMIN" || role === "EMPLOYEE";
        });

        setCategoryOptions(categoryResult.items || []);
        setFrequencyOptions(frequencyResult.items || []);
        setDepartmentOptions(departments);
        setEmployeeOptions(approvers);
        setAssigneeOptions(assigneeResult.items || []);
      } catch (err) {
        console.error("Failed to load dropdown choices:", err);
      } finally {
        if (active) setLoadingChoices(false);
      }
    })();
    return () => { active = false; };
  }, [isSubAdminContext, lockedDepartmentId]);

  // Load task for Edit Mode
  useEffect(() => {
    if (!isEdit) return;
    let active = true;
    (async () => {
      try {
        setLoading(true);
        let task;
        // Mock fallback to prevent blank pages during local testing
        if (id === "1" || id === "2" || id === "3" || id === "4" || id === "5" || id === "6") {
          const mockItem = TASK_LIST.find((t) => t.id === id);
          task = {
            ...SAMPLE_TASK,
            ...mockItem,
            assignments: SAMPLE_TASK.assignedTo.map((a, idx) => ({
              id: `mock-assign-${idx}`,
              assignedToId: `mock-emp-${idx}`,
              assignedTo: { id: `mock-emp-${idx}`, firstName: a.name.split(" ")[0], lastName: a.name.split(" ")[1] || "", email: "mock@employee.com" }
            }))
          };
        } else {
          task = await taskService.getById(id);
        }

        if (active) {
          setForm(mapTaskToForm(task));
          if (task.attachments) {
            setAttachmentLinks(task.attachments.map((f) => ({ id: f.name, name: f.name, url: f.url || "" })));
          }
        }
      } catch (error) {
        toast.error(getErrorMessage(error, "Failed to load task"));
        navigate(tasksBase);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [id, isEdit, navigate, tasksBase]);

  const selectedAssignees = useMemo(
    () => assigneeOptions.filter((e) => form.assignedToIds.includes(e.id)),
    [assigneeOptions, form.assignedToIds]
  );

  const selectedFrequency = useMemo(
    () => frequencyOptions.find((f) => f.id === form.frequencyId) || null,
    [frequencyOptions, form.frequencyId]
  );

  const filteredApproverOptions = useMemo(() => {
    let candidates = employeeOptions;

    let targetDeptId = form.departmentId;
    if (!targetDeptId && form.assignedToIds && form.assignedToIds.length > 0) {
      const firstAssignee = assigneeOptions.find(e => e.id === form.assignedToIds[0]);
      if (firstAssignee) {
        targetDeptId = firstAssignee.departmentId || firstAssignee.department?.id;
      }
    }

    if (targetDeptId) {
      candidates = candidates.filter((u) => {
        const uDeptId = u.departmentId || u.department?.id;
        const role = u.role?.name || u.roleName || u.role;
        return uDeptId === targetDeptId || role === "MAIN_ADMIN";
      });
    }

    return candidates;
  }, [employeeOptions, form.departmentId, form.assignedToIds, assigneeOptions]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      let next = { ...prev, [name]: value };
      if (name === "frequencyId") {
        const frequency = frequencyOptions.find((f) => f.id === value);
        next = applyFrequencyToTaskForm(frequency || null, { ...prev, frequencyId: value });
      }
      if (name === "assignedToIds" && Array.isArray(value) && value.length > 0 && !prev.departmentId) {
        const selectedEmp = assigneeOptions.find((emp) => emp.id === value[0]);
        const empDeptId = selectedEmp?.departmentId || selectedEmp?.department?.id;
        if (empDeptId) {
          next.departmentId = empDeptId;
        }
      }
      if (name === "startDate" || name === "durationDays" || name === "frequencyId") {
        // Recalculate end/due from duration when start date or interval changes
        if (next.startDate && next.durationDays) {
          const computedEnd = addDaysToDateString(next.startDate, next.durationDays);
          if (computedEnd) {
            if (name === "startDate" || name === "durationDays" || !next.endDate) {
              next.endDate = computedEnd;
            }
            if (name === "startDate" || name === "durationDays" || !next.dueDate) {
              next.dueDate = computedEnd;
            }
          }
        }
      }
      return next;
    });
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const next = {};
    if (!form.title || !form.title.trim()) {
      next.title = "Task title is required";
    } else if (form.title.trim().length < 3) {
      next.title = "Task title must be at least 3 characters";
    }
    if (!form.frequencyId) {
      next.frequencyId = "Frequency is required";
    }
    if (!form.assignedToIds || form.assignedToIds.length === 0) {
      next.assignedToIds = "Please assign at least one employee";
    }
    if (!form.approverId) {
      next.approverId = "Please select an approver";
    }

    const startIso = toIsoDateOrNull(form.startDate);
    const dueIso = toIsoDateOrNull(form.dueDate);
    const endIso = toIsoDateOrNull(form.endDate);

    // Backend schedule generation requires a start date
    if (!form.startDate?.trim()) {
      next.startDate = "Start date is required";
    } else if (!startIso) {
      next.startDate = "Start date is invalid";
    }

    if (form.dueDate?.trim() && !dueIso) {
      next.dueDate = "Due date is invalid";
    } else if (startIso && dueIso && new Date(dueIso) < new Date(startIso)) {
      next.dueDate = "Due date cannot be before start date";
    }

    if (form.endDate?.trim() && !endIso) {
      next.endDate = "End date is invalid";
    } else if (startIso && endIso && new Date(endIso) < new Date(startIso)) {
      next.endDate = "End date cannot be before start date";
    } else if (dueIso && endIso && new Date(endIso) < new Date(dueIso)) {
      next.endDate = "End date cannot be before due date";
    }

    const freq = frequencyOptions.find((f) => f.id === form.frequencyId);
    const isOneTime = form.recurrenceType === "ONE_TIME" || freq?.frequencyName === "Once";
    if (!isOneTime && !form.endDate?.trim() && !form.durationDays) {
      next.endDate = "End date is required for recurring tasks (or set a duration)";
    }

    if (freq && freq.frequencyName === "Custom" && !form.durationDays) {
      next.durationDays = "Repeat interval is required for custom frequency";
    }

    setErrors(next);
    if (Object.keys(next).length > 0) {
      const dateError = next.startDate || next.dueDate || next.endDate || next.durationDays;
      if (dateError) setTab(1);
    }
    return Object.keys(next).length === 0;
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      setSubmitting(true);
      const payload = buildTaskApiPayload(form, { includeCompanyId: true });

      if (isSubAdminContext && lockedDepartmentId) {
        payload.departmentId = lockedDepartmentId;
      }

      console.log("CREATE TASK PAYLOAD:", payload);
      await taskService.create(payload);
      toast.success("Task created successfully!");
      navigate(tasksBase);
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to create task"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSave = async () => {
    if (!validateForm()) return;
    try {
      setSubmitting(true);

      if (id === "1" || id === "2" || id === "3" || id === "4" || id === "5" || id === "6") {
        toast.success("Task updated successfully! (Mock)");
        navigate(tasksBase);
        return;
      }

      const payload = buildTaskApiPayload(form);
      console.log("UPDATE TASK PAYLOAD:", payload);
      await taskService.update(id, payload);
      toast.success("Task updated successfully!");
      navigate(tasksBase);
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to update task"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitForApproval = async () => {
    if (!validateForm()) return;
    try {
      setSubmitting(true);

      if (id === "1" || id === "2" || id === "3" || id === "4" || id === "5" || id === "6") {
        toast.success("Task submitted for approval! (Mock)");
        navigate(tasksBase);
        return;
      }

      const payload = buildTaskApiPayload(form, { status: "PENDING_APPROVAL" });
      console.log("SUBMIT TASK PAYLOAD:", payload);
      await taskService.update(id, payload);
      toast.success("Task submitted for approval successfully!");
      navigate(tasksBase);
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to submit task"));
    } finally {
      setSubmitting(false);
    }
  };

  const canShowDelete = isEdit && !isCreate && (
    !isSubAdminContext
    || form.departmentId === lockedDepartmentId
    || form.createdById === authUser?.id
  );

  const handleDeleteConfirm = async () => {
    if (!id || deleting) return;
    try {
      setDeleting(true);
      await taskService.delete(id);
      toast.success("Task deleted successfully.");
      setConfirmDelete(false);
      navigate(tasksBase);
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to delete task"));
    } finally {
      setDeleting(false);
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

  try {
    if (isCreate) {
      return (
        <PageLayout>
          <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: "#f8fafc", minHeight: "100%" }}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 3, gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={<ArrowBack />}
                onClick={() => navigate(tasksBase)}
                sx={{ textTransform: "none", borderColor: "#cbd5e1", color: "#475569" }}
              >
                Back
              </Button>
              <Box>
                <Typography variant="h5" fontWeight={700} color="#0f172a">
                  Create Task
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Fill in the details below to create a new task.
                </Typography>
              </Box>
            </Box>

            <Paper sx={{ p: { xs: 2.5, md: 4 }, borderRadius: 3, ...card }}>
              <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
                <Tabs value={tab} onChange={(e, v) => setTab(v)} aria-label="create task tabs">
                  {tabLabels.map((lbl, idx) => (
                    <Tab key={lbl} label={lbl} sx={{ textTransform: "none", fontWeight: 600 }} />
                  ))}
                </Tabs>
              </Box>

              <Grid container spacing={3} component="form" onSubmit={handleCreateSubmit} noValidate>
                <Grid item xs={12}>
                  <TabPanel value={tab} index={0}>
                    <Grid container spacing={2.5}>
                      <Grid item xs={12} md={6}>
                        <TextField fullWidth label="Task Name" name="title" value={form.title} onChange={handleChange}
                          error={Boolean(errors.title)} helperText={errors.title}
                          sx={{ mb: 2, ...fieldSx }} />
                        <FormControl fullWidth sx={{ mb: 2 }}>
                          <InputLabel id="create-category-label">Category</InputLabel>
                          <Select labelId="create-category-label" name="categoryId" value={form.categoryId} label="Category" onChange={handleChange} sx={{ borderRadius: 2 }}>
                            {categoryOptions.length === 0 ? (
                              <MenuItem value="" disabled sx={{ color: "#EF4444" }}>
                                No categories available.
                              </MenuItem>
                            ) : (
                              categoryOptions.map((c) => (
                                <MenuItem key={c.id} value={c.id}>{c.categoryName}</MenuItem>
                              ))
                            )}
                          </Select>
                        </FormControl>
                        <FormControl fullWidth error={Boolean(errors.frequencyId)} sx={{ mb: 2 }}>
                          <InputLabel id="create-frequency-label">Frequency *</InputLabel>
                          <Select labelId="create-frequency-label" name="frequencyId" value={form.frequencyId} label="Frequency *" onChange={handleChange} sx={{ borderRadius: 2 }}>
                            {frequencyOptions.length === 0 ? (
                              <MenuItem value="" disabled sx={{ color: "#EF4444" }}>
                                No frequencies available.
                              </MenuItem>
                            ) : (
                              frequencyOptions.map((f) => (
                                <MenuItem key={f.id} value={f.id}>{f.frequencyName}</MenuItem>
                              ))
                            )}
                          </Select>
                          {errors.frequencyId && <FormHelperText>{errors.frequencyId}</FormHelperText>}
                        </FormControl>
                        <FormControl fullWidth sx={{ mb: 2 }}>
                          <InputLabel id="create-department-label">Department</InputLabel>
                          <Select labelId="create-department-label" name="departmentId" value={form.departmentId} label="Department" onChange={handleChange} sx={{ borderRadius: 2 }} disabled={isSubAdminContext && !!lockedDepartmentId}>
                            {departmentOptions.map((d) => (
                              <MenuItem key={d.id} value={d.id}>{d.departmentName}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <FormControl fullWidth error={Boolean(errors.assignedToIds)} sx={{ mb: 2 }}>
                          <InputLabel id="create-assignee-label">Assign To *</InputLabel>
                          <Select labelId="create-assignee-label" multiple name="assignedToIds" value={form.assignedToIds} onChange={handleChange} label="Assign To *" sx={{ borderRadius: 2 }}>
                            {assigneeOptions.map((e) => (
                              <MenuItem key={e.id} value={e.id}>{getAssigneeLabel(e)}</MenuItem>
                            ))}
                          </Select>
                          {errors.assignedToIds && <FormHelperText>{errors.assignedToIds}</FormHelperText>}
                        </FormControl>
                        <FormControl fullWidth error={Boolean(errors.approverId)} sx={{ mb: 2 }}>
                          <InputLabel id="create-approver-label">Select Approver *</InputLabel>
                          <Select
                            labelId="create-approver-label"
                            name="approverId"
                            value={form.approverId}
                            onChange={handleChange}
                            label="Select Approver *"
                            sx={{ borderRadius: 2 }}
                            renderValue={(selectedId) => {
                              const selectedUser = employeeOptions.find(u => u.id === selectedId);
                              return selectedUser ? getEmployeeLabel(selectedUser) : "";
                            }}
                          >
                            {loadingChoices ? (
                              <MenuItem value="" disabled>
                                Loading approvers...
                              </MenuItem>
                            ) : filteredApproverOptions.length === 0 ? (
                              <MenuItem value="" disabled sx={{ color: "#EF4444" }}>
                                No eligible approvers found.
                              </MenuItem>
                            ) : (
                              filteredApproverOptions.map((e) => {
                                const roleName = e.role?.name || e.roleName || e.role;
                                let roleLabel = "";
                                if (roleName === "MAIN_ADMIN") roleLabel = "Main Admin";
                                else if (roleName === "SUB_ADMIN") roleLabel = "Sub Admin";
                                else if (roleName === "EMPLOYEE") roleLabel = "Employee";
                                else roleLabel = roleName || "User";

                                const deptName = e.department?.departmentName || e.department?.name || "";
                                const subtitle = [roleLabel, deptName].filter(Boolean).join(" • ");

                                return (
                                  <MenuItem key={e.id} value={e.id}>
                                    <Box display="flex" flexDirection="column">
                                      <Typography variant="body2" sx={{ fontWeight: 600, color: "#1E293B" }}>
                                        {[e.firstName, e.lastName].filter(Boolean).join(" ") || e.email}
                                      </Typography>
                                      {subtitle && (
                                        <Typography variant="caption" sx={{ color: "#64748B" }}>
                                          {subtitle}
                                        </Typography>
                                      )}
                                    </Box>
                                  </MenuItem>
                                );
                              })
                            )}
                          </Select>
                          {errors.approverId && <FormHelperText>{errors.approverId}</FormHelperText>}
                        </FormControl>
                        <TextField fullWidth type="number" label="Estimated Hours" name="estimatedHours" value={form.estimatedHours} onChange={handleChange}
                          sx={{ mb: 2, ...fieldSx }} />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField fullWidth multiline rows={4} label="Task Description" name="description" value={form.description} onChange={handleChange}
                          sx={{ ...fieldSx }} />
                      </Grid>
                    </Grid>
                  </TabPanel>

                  <TabPanel value={tab} index={1}>
                    <Grid container spacing={2.5}>
                      <Grid item xs={12} md={6}>
                        <TextField fullWidth type="date" label="Start Date" name="startDate" value={form.startDate} onChange={handleChange} slotProps={{ inputLabel: { shrink: true } }}
                          error={Boolean(errors.startDate)} helperText={errors.startDate} sx={{ mb: 2.5, ...fieldSx }} />
                        <TextField fullWidth type="date" label="Due Date" name="dueDate" value={form.dueDate} onChange={handleChange} slotProps={{ inputLabel: { shrink: true } }}
                          error={Boolean(errors.dueDate)} helperText={errors.dueDate} sx={{ mb: 2.5, ...fieldSx }} />
                        <FormControl fullWidth sx={{ mb: 2.5 }}>
                          <InputLabel id="create-priority-label">Priority</InputLabel>
                          <Select labelId="create-priority-label" name="priority" value={form.priority} label="Priority" onChange={handleChange} sx={{ borderRadius: 2 }}>
                            <MenuItem value="High">High</MenuItem>
                            <MenuItem value="Medium">Medium</MenuItem>
                            <MenuItem value="Low">Low</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        {selectedFrequency && selectedFrequency.frequencyName !== "Once" && (
                          <Box sx={{ p: 2.5, bgcolor: "#f8fafc", borderRadius: 2.5, border: "1px solid #e2e8f0" }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#1e293b", mb: 1.5 }}>
                              Recurrence Settings ({selectedFrequency.frequencyName})
                            </Typography>
                            {selectedFrequency.frequencyName === "Custom" ? (
                              <TextField fullWidth type="number" label="Repeat Interval (Days)" name="durationDays" value={form.durationDays} onChange={handleChange}
                                error={Boolean(errors.durationDays)} helperText={errors.durationDays} sx={{ mb: 2, ...fieldSx }} />
                            ) : (
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                Interval: <strong>{formatDaysInterval(selectedFrequency.daysInterval)}</strong>
                              </Typography>
                            )}
                            <TextField fullWidth type="date" label="End Date" name="endDate" value={form.endDate} onChange={handleChange} slotProps={{ inputLabel: { shrink: true } }}
                              error={Boolean(errors.endDate)} helperText={errors.endDate} sx={{ ...fieldSx }} />
                          </Box>
                        )}
                      </Grid>
                    </Grid>
                  </TabPanel>

                  <TabPanel value={tab} index={2}>
                    <ExternalLinkAttachment onAddLink={(link) => setAttachmentLinks((p) => [...p, link])} />
                    <Box sx={{ mt: 3 }}>
                      <AttachmentLinkList items={attachmentLinks} onRemove={(id) => setAttachmentLinks((p) => p.filter((x) => x.id !== id))} />
                    </Box>
                  </TabPanel>
                </Grid>

                <Grid item xs={12} sx={{ display: "flex", justifyContent: "flex-end", gap: 1.5, mt: 3 }}>
                  <Button variant="outlined" onClick={() => navigate(tasksBase)} sx={{ textTransform: "none", borderColor: "#cbd5e1", color: "#475569", px: 3 }}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="contained" disabled={submitting} startIcon={submitting ? <CircularProgress size={18} color="inherit" /> : <Save />}
                    sx={{ bgcolor: "#2563eb", textTransform: "none", px: 3, borderRadius: 2 }}>
                    Create Task
                  </Button>
                </Grid>
              </Grid>
            </Paper>
          </Box>
        </PageLayout>
      );
    }

    return (
      <PageLayout>
        <Box sx={{ pb: 3 }}>
          <Box display="flex" flexWrap="wrap" gap={2} alignItems="center" justifyContent="space-between" mb={2}>
            <Box display="flex" alignItems="center" gap={1.5}>
              <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate(tasksBase)}
                sx={{ textTransform: "none", borderColor: "#E2E8F0", color: "#64748B", borderRadius: 2 }}>Back</Button>
              <Typography variant="h5" sx={{ fontWeight: 800, color: "#0F172A" }}>Task Details</Typography>
              <TaskStatusBadge status={form.status} />
            </Box>
            <Box display="flex" gap={1.5}>
              {canShowDelete && (
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteOutlineIcon />}
                  onClick={() => setConfirmDelete(true)}
                  sx={{ textTransform: "none", borderRadius: 2 }}
                >
                  Delete Task
                </Button>
              )}
              <Button variant="outlined" sx={{ textTransform: "none", borderColor: "#E2E8F0", color: "#64748B", borderRadius: 2 }} onClick={() => setTab(0)}>Details</Button>
              <Button variant="outlined" sx={{ textTransform: "none", borderColor: "#E2E8F0", color: "#64748B", borderRadius: 2 }} onClick={() => setTab(2)}>Attachments</Button>
            </Box>
          </Box>

          <Paper sx={{ p: { xs: 2.5, md: 4 }, borderRadius: 3, ...card }}>
            <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
              <Tabs value={tab} onChange={(e, v) => setTab(v)} aria-label="task form tabs">
                {tabLabels.map((lbl, idx) => (
                  <Tab key={lbl} label={lbl} sx={{ textTransform: "none", fontWeight: 600 }} />
                ))}
              </Tabs>
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TabPanel value={tab} index={0}>
                  <Grid container spacing={2.5}>
                    <Grid item xs={12} md={6}>
                      <TextField fullWidth label="Task Name" name="title" value={form.title} onChange={handleChange}
                        error={Boolean(errors.title)} helperText={errors.title} disabled={isReadOnly}
                        sx={{ mb: 2, ...fieldSx }} />
                      <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel id="edit-category-label">Category</InputLabel>
                        <Select labelId="edit-category-label" name="categoryId" value={form.categoryId} label="Category" onChange={handleChange} sx={{ borderRadius: 2 }} disabled={isReadOnly}>
                          {categoryOptions.length === 0 ? (
                            <MenuItem value="" disabled sx={{ color: "#EF4444" }}>
                              No categories available.
                            </MenuItem>
                          ) : (
                            categoryOptions.map((c) => (
                              <MenuItem key={c.id} value={c.id}>{c.categoryName}</MenuItem>
                            ))
                          )}
                        </Select>
                      </FormControl>
                      <FormControl fullWidth error={Boolean(errors.frequencyId)} sx={{ mb: 2 }}>
                        <InputLabel id="edit-frequency-label">Frequency *</InputLabel>
                        <Select labelId="edit-frequency-label" name="frequencyId" value={form.frequencyId} label="Frequency *" onChange={handleChange} sx={{ borderRadius: 2 }} disabled={isReadOnly}>
                          {frequencyOptions.length === 0 ? (
                            <MenuItem value="" disabled sx={{ color: "#EF4444" }}>
                              No frequencies available.
                            </MenuItem>
                          ) : (
                            frequencyOptions.map((f) => (
                              <MenuItem key={f.id} value={f.id}>{f.frequencyName}</MenuItem>
                            ))
                          )}
                        </Select>
                        {errors.frequencyId && <FormHelperText>{errors.frequencyId}</FormHelperText>}
                      </FormControl>
                      <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel id="edit-department-label">Department</InputLabel>
                        <Select labelId="edit-department-label" name="departmentId" value={form.departmentId} label="Department" onChange={handleChange} sx={{ borderRadius: 2 }} disabled={isReadOnly}>
                          {departmentOptions.map((d) => (
                            <MenuItem key={d.id} value={d.id}>{d.departmentName}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth error={Boolean(errors.assignedToIds)} sx={{ mb: 2 }}>
                        <InputLabel id="edit-assignee-label">Assign To *</InputLabel>
                        <Select labelId="edit-assignee-label" multiple name="assignedToIds" value={form.assignedToIds} onChange={handleChange} label="Assign To *" sx={{ borderRadius: 2 }} disabled={isReadOnly}>
                          {assigneeOptions.map((e) => (
                            <MenuItem key={e.id} value={e.id}>{getAssigneeLabel(e)}</MenuItem>
                          ))}
                        </Select>
                        {errors.assignedToIds && <FormHelperText>{errors.assignedToIds}</FormHelperText>}
                      </FormControl>
                      <FormControl fullWidth error={Boolean(errors.approverId)} sx={{ mb: 2 }}>
                        <InputLabel id="edit-approver-label">Select Approver *</InputLabel>
                        <Select
                          labelId="edit-approver-label"
                          name="approverId"
                          value={form.approverId}
                          onChange={handleChange}
                          label="Select Approver *"
                          sx={{ borderRadius: 2 }}
                          disabled={isReadOnly}
                          renderValue={(selectedId) => {
                            const selectedUser = employeeOptions.find(u => u.id === selectedId);
                            return selectedUser ? getEmployeeLabel(selectedUser) : "";
                          }}
                        >
                          {loadingChoices ? (
                            <MenuItem value="" disabled>
                              Loading approvers...
                            </MenuItem>
                          ) : filteredApproverOptions.length === 0 ? (
                            <MenuItem value="" disabled sx={{ color: "#EF4444" }}>
                              No eligible approvers found.
                            </MenuItem>
                          ) : (
                            filteredApproverOptions.map((e) => {
                              const roleName = e.role?.name || e.roleName || e.role;
                              let roleLabel = "";
                              if (roleName === "MAIN_ADMIN") roleLabel = "Main Admin";
                              else if (roleName === "SUB_ADMIN") roleLabel = "Sub Admin";
                              else if (roleName === "EMPLOYEE") roleLabel = "Employee";
                              else roleLabel = roleName || "User";

                              const deptName = e.department?.departmentName || e.department?.name || "";
                              const subtitle = [roleLabel, deptName].filter(Boolean).join(" • ");

                              return (
                                <MenuItem key={e.id} value={e.id}>
                                  <Box display="flex" flexDirection="column">
                                    <Typography variant="body2" sx={{ fontWeight: 600, color: "#1E293B" }}>
                                      {[e.firstName, e.lastName].filter(Boolean).join(" ") || e.email}
                                    </Typography>
                                    {subtitle && (
                                      <Typography variant="caption" sx={{ color: "#64748B" }}>
                                        {subtitle}
                                      </Typography>
                                    )}
                                  </Box>
                                </MenuItem>
                              );
                            })
                          )}
                        </Select>
                        {errors.approverId && <FormHelperText>{errors.approverId}</FormHelperText>}
                      </FormControl>
                      <TextField fullWidth type="number" label="Estimated Hours" name="estimatedHours" value={form.estimatedHours} onChange={handleChange} disabled={isReadOnly}
                        sx={{ mb: 2, ...fieldSx }} />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField fullWidth multiline rows={4} label="Task Description" name="description" value={form.description} onChange={handleChange} disabled={isReadOnly}
                        sx={{ ...fieldSx }} />
                    </Grid>
                  </Grid>
                </TabPanel>

                <TabPanel value={tab} index={1}>
                  <Grid container spacing={2.5}>
                    <Grid item xs={12} md={6}>
                      <TextField fullWidth type="date" label="Start Date" name="startDate" value={form.startDate} onChange={handleChange} slotProps={{ inputLabel: { shrink: true } }} disabled={isReadOnly}
                        error={Boolean(errors.startDate)} helperText={errors.startDate} sx={{ mb: 2.5, ...fieldSx }} />
                      <TextField fullWidth type="date" label="Due Date" name="dueDate" value={form.dueDate} onChange={handleChange} slotProps={{ inputLabel: { shrink: true } }} disabled={isReadOnly}
                        error={Boolean(errors.dueDate)} helperText={errors.dueDate} sx={{ mb: 2.5, ...fieldSx }} />
                      <FormControl fullWidth sx={{ mb: 2.5 }}>
                        <InputLabel id="edit-priority-label">Priority</InputLabel>
                        <Select labelId="edit-priority-label" name="priority" value={form.priority} label="Priority" onChange={handleChange} sx={{ borderRadius: 2 }} disabled={isReadOnly}>
                          <MenuItem value="High">High</MenuItem>
                          <MenuItem value="Medium">Medium</MenuItem>
                          <MenuItem value="Low">Low</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      {selectedFrequency && selectedFrequency.frequencyName !== "Once" && (
                        <Box sx={{ p: 2.5, bgcolor: "#f8fafc", borderRadius: 2.5, border: "1px solid #e2e8f0" }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#1e293b", mb: 1.5 }}>
                            Recurrence Settings ({selectedFrequency.frequencyName})
                          </Typography>
                          {selectedFrequency.frequencyName === "Custom" ? (
                            <TextField fullWidth type="number" label="Repeat Interval (Days)" name="durationDays" value={form.durationDays} onChange={handleChange} disabled={isReadOnly}
                              error={Boolean(errors.durationDays)} helperText={errors.durationDays} sx={{ mb: 2, ...fieldSx }} />
                          ) : (
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                              Interval: <strong>{formatDaysInterval(selectedFrequency.daysInterval)}</strong>
                            </Typography>
                          )}
                          <TextField fullWidth type="date" label="End Date" name="endDate" value={form.endDate} onChange={handleChange} slotProps={{ inputLabel: { shrink: true } }} disabled={isReadOnly}
                            error={Boolean(errors.endDate)} helperText={errors.endDate} sx={{ ...fieldSx }} />
                        </Box>
                      )}
                    </Grid>
                  </Grid>
                </TabPanel>

                <TabPanel value={tab} index={2}>
                  {!isReadOnly && <ExternalLinkAttachment onAddLink={(link) => setAttachmentLinks((p) => [...p, link])} />}
                  <Box sx={{ mt: 3 }}>
                    <AttachmentLinkList
                      items={attachmentLinks.length ? attachmentLinks : SAMPLE_TASK.attachments.map((f) => ({
                        id: f.name,
                        name: f.name,
                        url: f.url || "",
                      }))}
                      readOnly={!attachmentLinks.length || isReadOnly}
                      onRemove={attachmentLinks.length && !isReadOnly ? (id) => setAttachmentLinks((prev) => prev.filter((item) => item.id !== id)) : undefined}
                    />
                  </Box>
                </TabPanel>
              </Grid>

              <Grid item xs={12}>
                <Typography sx={{ fontWeight: 700, color: "#0F172A", fontSize: "0.95rem", mb: 1.5, mt: 1 }}>Assignees</Typography>
                <Box display="flex" flexWrap="wrap" gap={2} mb={3}>
                  {selectedAssignees.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">No assignees selected.</Typography>
                  ) : (
                    selectedAssignees.map((u) => (
                      <Box key={u.id} display="flex" alignItems="center" gap={1} sx={{ ...card, p: 1.5, minWidth: 180 }}>
                        <Avatar sx={{ width: 36, height: 36, bgcolor: "#2563EB", fontSize: "0.8rem" }}>
                          {getEmployeeLabel(u).split(" ").map((w) => w[0]).join("").slice(0, 2)}
                        </Avatar>
                        <Box>
                          <Typography sx={{ fontWeight: 600, fontSize: "0.85rem", color: "#0F172A" }}>{getEmployeeLabel(u)}</Typography>
                          <Typography sx={{ fontSize: "0.75rem", color: "#64748B" }}>Employee</Typography>
                        </Box>
                      </Box>
                    ))
                  )}
                </Box>

                <Typography sx={{ fontWeight: 700, color: "#0F172A", fontSize: "0.95rem", mb: 1.5 }}>Approvers</Typography>
                <Box display="flex" flexWrap="wrap" gap={1} alignItems="center">
                  {SAMPLE_TASK.approvers.map((name, i) => (
                    <Chip key={name} avatar={<Avatar sx={{ bgcolor: "#F1F5F9", color: "#475569" }}>{name[0]}</Avatar>} label={name}
                      sx={{ bgcolor: "#F8FAFC", border: "1px solid #E2E8F0", fontWeight: 500 }} />
                  ))}
                </Box>
              </Grid>
            </Grid>

            <Box display="flex" justifyContent="flex-end" gap={1.5} mt={2}>
              <Button variant="outlined" onClick={() => navigate(tasksBase)} sx={{ textTransform: "none", borderColor: "#E2E8F0", color: "#64748B", borderRadius: 2, px: 3 }}>
                {isReadOnly ? "Back to Task List" : "Cancel"}
              </Button>
              {!isReadOnly && (
                <>
                  <Button variant="outlined" startIcon={<SaveOutlinedIcon />} disabled={submitting} onClick={handleEditSave}
                    sx={{ textTransform: "none", borderColor: "#2563EB", color: "#2563EB", borderRadius: 2, px: 3 }}>Save Changes</Button>
                  <Button variant="contained" startIcon={<SendIcon />} disabled={submitting} onClick={handleSubmitForApproval}
                    sx={{ textTransform: "none", bgcolor: "#2563EB", borderRadius: 2, px: 3, "&:hover": { bgcolor: "#1D4ED8" } }}>Submit for Approval</Button>
                </>
              )}
            </Box>
          </Paper>
        </Box>

        <ConfirmDialog
          open={confirmDelete}
          title="Delete Task?"
          message="Are you sure you want to delete this task? This action cannot be undone."
          confirmLabel="Delete Task"
          confirmColor="#DC2626"
          loading={deleting}
          onClose={() => { if (!deleting) setConfirmDelete(false); }}
          onConfirm={handleDeleteConfirm}
        />
      </PageLayout>
    );
  } catch (err) {
    return (
      <Box sx={{ p: 4, color: "#991B1B", bgcolor: "#FEF2F2", border: "1px solid #FCA5A5", borderRadius: 3, m: 3 }}>
        <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>TaskForm Render Crash Detected</Typography>
        <pre style={{ overflowX: "auto", whiteSpace: "pre-wrap", fontFamily: "monospace", fontSize: "0.85rem" }}>{err.stack || err.message}</pre>
      </Box>
    );
  }
}