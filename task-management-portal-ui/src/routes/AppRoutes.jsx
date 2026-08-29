import React, { Suspense, lazy } from "react";
import PropTypes from "prop-types";
import { Routes, Route, Navigate } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";

// Public Auth Pages (Direct imports since they are needed immediately)
import Login from "../pages/Login";
import Register from "../pages/Register";

/**
 * Robust Lazy Loader
 * Prevents "resolves to: undefined" errors by inspecting exports
 */
const safeLazy = (importFn) =>
  lazy(() =>
    importFn().then((module) => {
      if (module && module.default) {
        return { default: module.default };
      }

      const exportedComponent = Object.values(module || {}).find(
        (exp) => typeof exp === "function" || (typeof exp === "object" && exp !== null)
      );

      if (!exportedComponent) {
        throw new Error(
          "Lazy element error: Loaded module does not contain any valid React export."
        );
      }

      return { default: exportedComponent };
    })
  );

// Lazy-Loaded Pages
const Home = safeLazy(() => import("../pages/Home"));
const Features = safeLazy(() => import("../pages/Features"));
const Benefits = safeLazy(() => import("../pages/Benefits"));
const Pricing = safeLazy(() => import("../pages/Pricing"));
const CheckoutPage = safeLazy(() => import("../pages/CheckoutPage"));
const PaymentSuccessPage = safeLazy(() => import("../pages/PaymentSuccessPage"));
const CompanyOnboardingPage = safeLazy(() => import("../pages/CompanyOnboardingPage"));
const OnboardingSuccessPage = safeLazy(() => import("../pages/OnboardingSuccessPage"));
const HowItWorks = safeLazy(() => import("../pages/HowItWorks"));
const Dashboard = safeLazy(() => import("../pages/Dashboard"));
const Profile = safeLazy(() => import("../pages/Profile"));
const Absence = safeLazy(() => import("../pages/Absence"));
const Calendar = safeLazy(() => import("../pages/Calendar"));
const Reports = safeLazy(() => import("../pages/Reports"));
const Settings = safeLazy(() => import("../pages/Settings"));
const Approvals = safeLazy(() => import("../pages/Approvals"));

// Management Pages & Tables
const Departments = safeLazy(() => import("../components/department/DepartmentTable"));
const DepartmentForm = safeLazy(() => import("../components/department/DepartmentForm"));
const Employees = safeLazy(() => import("../pages/UserManagement"));
const TaskCategoryMaster = safeLazy(() => import("../pages/TaskCategoryMaster"));
const CategoryForm = safeLazy(() => import("../pages/CategoryForm"));
const FrequencyMaster = safeLazy(() => import("../pages/FrequencyMaster"));
const FrequencyFormPage = safeLazy(() => import("../pages/FrequencyFormPage"));
const CompleteTask = safeLazy(() => import("../pages/CompleteTask"));

// Task Components (Added for Task UI fix)
const TaskList = safeLazy(() => import("../components/tasks/TaskList"));
const TaskForm = safeLazy(() => import("../components/tasks/TaskForm"));
const TaskWorkflow = safeLazy(() => import("../components/tasks/TaskWorkflow"));

// Super Admin Pages
const SuperAdminDashboard = safeLazy(() => import("../pages/super-admin/SuperAdminDashboard"));
const CompanyList = safeLazy(() => import("../pages/super-admin/CompanyList"));
const CompanyForm = safeLazy(() => import("../pages/super-admin/CompanyForm"));
const CompanyDetails = safeLazy(() => import("../pages/super-admin/CompanyDetails"));
const PlanList = safeLazy(() => import("../pages/super-admin/PlanList"));
const PlanForm = safeLazy(() => import("../pages/super-admin/PlanForm"));
const SuperAdminReports = safeLazy(() => import("../pages/super-admin/SuperAdminReports"));
const SuperAdminNotifications = safeLazy(() => import("../pages/super-admin/SuperAdminNotifications"));
const SuperAdminMessages = safeLazy(() => import("../pages/super-admin/SuperAdminMessages"));
const AuditLogs = safeLazy(() => import("../pages/super-admin/AuditLogs"));
const GlobalSettings = safeLazy(() => import("../pages/super-admin/GlobalSettings"));

// Error pages (standalone routes — existing routes unchanged)
const NotFoundPage = safeLazy(() => import("../pages/errors/NotFoundPage"));
const ForbiddenPage = safeLazy(() => import("../pages/errors/ForbiddenPage"));
const ServerErrorPage = safeLazy(() => import("../pages/errors/ServerErrorPage"));
const NetworkErrorPage = safeLazy(() => import("../pages/errors/NetworkErrorPage"));

// Main Admin Pages
const AdminList = safeLazy(() => import("../pages/main-admin/AdminList"));
const AdminForm = safeLazy(() => import("../pages/main-admin/AdminForm"));
const AdminDetails = safeLazy(() => import("../pages/main-admin/AdminDetails"));
const RoleManagement = safeLazy(() => import("../pages/main-admin/RoleManagement"));
const MainAdminNotifications = safeLazy(() => import("../pages/main-admin/MainAdminNotifications"));
const MainAdminMessages = safeLazy(() => import("../pages/main-admin/MainAdminMessages"));
const NotificationSettings = safeLazy(() => import("../pages/main-admin/NotificationSettings"));
const MainAdminAuditLogs = safeLazy(() => import("../pages/main-admin/MainAdminAuditLogs"));
const CompanySettings = safeLazy(() => import("../pages/main-admin/CompanySettings"));

// Sub Admin Pages
const SubAdminDashboard = safeLazy(() => import("../pages/sub-admin/SubAdminDashboard"));
const SubAdminEmployees = safeLazy(() => import("../pages/sub-admin/SubAdminEmployees"));
const SubAdminTasks = safeLazy(() => import("../pages/sub-admin/SubAdminTasks"));
const SubAdminCalendar = safeLazy(() => import("../pages/sub-admin/SubAdminCalendar"));
const SubAdminReports = safeLazy(() => import("../pages/sub-admin/SubAdminReports"));
const SubAdminMessages = safeLazy(() => import("../pages/sub-admin/SubAdminMessages"));
const SubAdminNotifications = safeLazy(() => import("../pages/sub-admin/SubAdminNotifications"));
const SubAdminProfile = safeLazy(() => import("../pages/sub-admin/SubAdminProfile"));

// Employee Portal Pages
const EmployeePortalDashboard = safeLazy(() => import("../pages/employee/EmployeePortalDashboard"));
const EmployeeTaskList = safeLazy(() => import("../pages/employee/EmployeeTaskList"));
const EmployeeTaskDetails = safeLazy(() => import("../pages/employee/EmployeeTaskDetails"));
const EmployeeCalendarPage = safeLazy(() => import("../pages/employee/EmployeeCalendarPage"));
const EmployeeNotificationsPage = safeLazy(() => import("../pages/employee/EmployeeNotificationsPage"));
const EmployeeMessagesPage = safeLazy(() => import("../pages/employee/EmployeeMessagesPage"));
const EmployeeActivityPage = safeLazy(() => import("../pages/employee/EmployeeActivityPage"));
const EmployeeProfilePage = safeLazy(() => import("../pages/employee/EmployeeProfilePage"));

/**
 * Route Guard
 */
function ProtectedRoute({ children }) {
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

function SuperAdminRoute({ children }) {
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
  const role = localStorage.getItem("userRole");
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (role !== "SUPER_ADMIN") return <Navigate to="/dashboard" replace />;
  return children;
}

SuperAdminRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

function SubAdminRoute({ children }) {
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
  const role = localStorage.getItem("userRole");
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (role !== "SUB_ADMIN") return <Navigate to="/dashboard" replace />;
  return children;
}

SubAdminRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

function AdminRoute({ children }) {
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
  const role = localStorage.getItem("userRole");
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (role === "SUB_ADMIN") return <Navigate to="/sub-admin/dashboard" replace />;
  if (role === "SUPER_ADMIN") return <Navigate to="/super-admin/dashboard" replace />;
  if (role === "EMPLOYEE") return <Navigate to="/employee/dashboard" replace />;
  return children;
}

AdminRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

function EmployeeRoute({ children }) {
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
  const role = localStorage.getItem("userRole");
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (role !== "EMPLOYEE") {
    if (role === "SUPER_ADMIN") return <Navigate to="/super-admin/dashboard" replace />;
    if (role === "SUB_ADMIN") return <Navigate to="/sub-admin/dashboard" replace />;
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

EmployeeRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

/**
 * Suspense Loader Spinner
 */
function PageLoader() {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        bgcolor: "#0b0f19",
      }}
    >
      <CircularProgress color="primary" />
    </Box>
  );
}

export default function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Default Landing */}
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/features" element={<Features />} />
        <Route path="/benefits" element={<Benefits />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/payment/success" element={<PaymentSuccessPage />} />
        <Route path="/company/onboarding" element={<CompanyOnboardingPage />} />
        <Route path="/company/onboarding/success" element={<OnboardingSuccessPage />} />
        <Route path="/how-it-works" element={<HowItWorks />} />

        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<AdminRoute><Register /></AdminRoute>} />
        <Route path="/dashboard/employees/add" element={<AdminRoute><Register /></AdminRoute>} />

        {/* Protected Dashboard & Profile Routes */}
        <Route path="/dashboard" element={<AdminRoute><Dashboard /></AdminRoute>} />
        <Route path="/dashboard/profile" element={<AdminRoute><Profile /></AdminRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

        {/* Main Admin Module Routes */}
        <Route path="/dashboard/admins" element={<AdminRoute><AdminList /></AdminRoute>} />
        <Route path="/dashboard/admins/add" element={<AdminRoute><AdminForm /></AdminRoute>} />
        <Route path="/dashboard/admins/:id/edit" element={<AdminRoute><AdminForm /></AdminRoute>} />
        <Route path="/dashboard/admins/:id" element={<AdminRoute><AdminDetails /></AdminRoute>} />
        <Route path="/dashboard/roles" element={<AdminRoute><RoleManagement /></AdminRoute>} />
        <Route path="/dashboard/notifications" element={<AdminRoute><MainAdminNotifications /></AdminRoute>} />
        <Route path="/dashboard/messages" element={<AdminRoute><MainAdminMessages /></AdminRoute>} />
        <Route path="/dashboard/notification-settings" element={<AdminRoute><NotificationSettings /></AdminRoute>} />
        <Route path="/dashboard/audit-logs" element={<AdminRoute><MainAdminAuditLogs /></AdminRoute>} />
        <Route path="/dashboard/company-settings" element={<AdminRoute><CompanySettings /></AdminRoute>} />

        {/* Sub Admin Portal Routes */}
        <Route path="/sub-admin/dashboard" element={<SubAdminRoute><SubAdminDashboard /></SubAdminRoute>} />
        <Route path="/sub-admin/employees" element={<SubAdminRoute><SubAdminEmployees /></SubAdminRoute>} />
        <Route path="/sub-admin/departments" element={<SubAdminRoute><Departments /></SubAdminRoute>} />
        <Route path="/sub-admin/departments/view/:id" element={<SubAdminRoute><DepartmentForm /></SubAdminRoute>} />
        <Route path="/sub-admin/categories" element={<SubAdminRoute><TaskCategoryMaster /></SubAdminRoute>} />
        <Route path="/sub-admin/frequencies/add" element={<SubAdminRoute><FrequencyFormPage /></SubAdminRoute>} />
        <Route path="/sub-admin/frequencies/edit/:id" element={<SubAdminRoute><FrequencyFormPage /></SubAdminRoute>} />
        <Route path="/sub-admin/frequencies" element={<SubAdminRoute><FrequencyMaster /></SubAdminRoute>} />
        <Route path="/sub-admin/tasks" element={<SubAdminRoute><SubAdminTasks /></SubAdminRoute>} />
        <Route path="/sub-admin/tasks/assigned" element={<SubAdminRoute><SubAdminTasks /></SubAdminRoute>} />
        <Route path="/sub-admin/tasks/add" element={<SubAdminRoute><TaskForm /></SubAdminRoute>} />
        <Route path="/sub-admin/tasks/edit/:id" element={<SubAdminRoute><TaskForm /></SubAdminRoute>} />
        <Route path="/sub-admin/calendar" element={<SubAdminRoute><SubAdminCalendar /></SubAdminRoute>} />
        <Route path="/sub-admin/calendar/monthly" element={<SubAdminRoute><SubAdminCalendar /></SubAdminRoute>} />
        <Route path="/sub-admin/calendar/yearly" element={<SubAdminRoute><SubAdminCalendar /></SubAdminRoute>} />
        <Route path="/sub-admin/reports" element={<SubAdminRoute><SubAdminReports /></SubAdminRoute>} />
        <Route path="/sub-admin/messages" element={<SubAdminRoute><SubAdminMessages /></SubAdminRoute>} />
        <Route path="/sub-admin/notifications" element={<SubAdminRoute><SubAdminNotifications /></SubAdminRoute>} />
        <Route path="/sub-admin/audit-logs" element={<SubAdminRoute><MainAdminAuditLogs /></SubAdminRoute>} />
        <Route path="/sub-admin/notification-settings" element={<SubAdminRoute><NotificationSettings /></SubAdminRoute>} />
        <Route path="/sub-admin/profile" element={<SubAdminRoute><SubAdminProfile /></SubAdminRoute>} />

        {/* Employee Portal Routes */}
        <Route path="/employee/dashboard" element={<EmployeeRoute><EmployeePortalDashboard /></EmployeeRoute>} />
        <Route path="/employee/tasks" element={<EmployeeRoute><EmployeeTaskList /></EmployeeRoute>} />
        <Route path="/employee/tasks/:id" element={<EmployeeRoute><EmployeeTaskDetails /></EmployeeRoute>} />
        <Route path="/employee/tasks/complete/:id" element={<EmployeeRoute><CompleteTask /></EmployeeRoute>} />
        <Route path="/employee/calendar" element={<EmployeeRoute><EmployeeCalendarPage /></EmployeeRoute>} />
        <Route path="/employee/notifications" element={<EmployeeRoute><EmployeeNotificationsPage /></EmployeeRoute>} />
        <Route path="/employee/messages" element={<EmployeeRoute><EmployeeMessagesPage /></EmployeeRoute>} />
        <Route path="/employee/activity" element={<EmployeeRoute><EmployeeActivityPage /></EmployeeRoute>} />
        <Route path="/employee/profile" element={<EmployeeRoute><EmployeeProfilePage /></EmployeeRoute>} />
        <Route path="/employee/assigned" element={<EmployeeRoute><EmployeeTaskList /></EmployeeRoute>} />
        <Route path="/employee/categories" element={<EmployeeRoute><TaskCategoryMaster /></EmployeeRoute>} />
        <Route path="/employee/reports" element={<EmployeeRoute><Reports /></EmployeeRoute>} />
        <Route path="/employee/approvals" element={<EmployeeRoute><Approvals /></EmployeeRoute>} />

        {/* Feature & Management Routes */}
        <Route path="/departments" element={<AdminRoute><Departments /></AdminRoute>} />
        <Route path="/dashboard/departments" element={<AdminRoute><Departments /></AdminRoute>} />
        <Route path="/departments/add" element={<AdminRoute><DepartmentForm /></AdminRoute>} />
        <Route path="/dashboard/departments/add" element={<AdminRoute><DepartmentForm /></AdminRoute>} />
        <Route path="/departments/edit/:id" element={<AdminRoute><DepartmentForm /></AdminRoute>} />
        <Route path="/dashboard/departments/edit/:id" element={<AdminRoute><DepartmentForm /></AdminRoute>} />
        <Route path="/departments/view/:id" element={<AdminRoute><DepartmentForm /></AdminRoute>} />
        <Route path="/dashboard/departments/view/:id" element={<AdminRoute><DepartmentForm /></AdminRoute>} />
        
        {/* Task Category Routes */}
        <Route path="/categories" element={<AdminRoute><TaskCategoryMaster /></AdminRoute>} />
        <Route path="/dashboard/categories" element={<AdminRoute><TaskCategoryMaster /></AdminRoute>} />
        <Route path="/dashboard/categories/add" element={<AdminRoute><CategoryForm /></AdminRoute>} />
        <Route path="/dashboard/categories/edit/:id" element={<AdminRoute><CategoryForm /></AdminRoute>} />

        {/* Frequency Routes */}
        <Route path="/frequencies" element={<AdminRoute><FrequencyMaster /></AdminRoute>} />
        <Route path="/dashboard/frequencies" element={<AdminRoute><FrequencyMaster /></AdminRoute>} />
        <Route path="/dashboard/frequencies/add" element={<AdminRoute><FrequencyFormPage /></AdminRoute>} />
        <Route path="/dashboard/frequencies/edit/:id" element={<AdminRoute><FrequencyFormPage /></AdminRoute>} />

        {/* Task Management Routes */}
        <Route path="/tasks" element={<AdminRoute><TaskList /></AdminRoute>} />
        <Route path="/dashboard/tasks" element={<AdminRoute><TaskList /></AdminRoute>} />
        <Route path="/tasks/add" element={<AdminRoute><TaskForm /></AdminRoute>} />
        <Route path="/dashboard/tasks/add" element={<AdminRoute><TaskForm /></AdminRoute>} />
        <Route path="/dashboard/tasks/edit/:id" element={<AdminRoute><TaskForm /></AdminRoute>} />
        <Route path="/dashboard/tasks/:id/approve" element={<AdminRoute><TaskWorkflow /></AdminRoute>} />
        <Route path="/dashboard/tasks/:id/review" element={<AdminRoute><TaskWorkflow /></AdminRoute>} />
        <Route path="/dashboard/tasks/:id/send-back" element={<AdminRoute><TaskWorkflow /></AdminRoute>} />
        <Route path="/dashboard/tasks/:id/close" element={<AdminRoute><TaskWorkflow /></AdminRoute>} />
        <Route path="/tasks/details" element={<AdminRoute><TaskWorkflow /></AdminRoute>} />
        <Route path="/dashboard/tasks/details" element={<AdminRoute><TaskWorkflow /></AdminRoute>} />

        <Route path="/dashboard/tasks/assigned" element={<AdminRoute><TaskList /></AdminRoute>} />

        <Route path="/employees" element={<AdminRoute><Employees /></AdminRoute>} />
        <Route path="/dashboard/employees" element={<AdminRoute><Employees /></AdminRoute>} />
        <Route path="/dashboard/users" element={<AdminRoute><Employees /></AdminRoute>} />
        
        <Route path="/calendar" element={<AdminRoute><Calendar /></AdminRoute>} />
        <Route path="/dashboard/calendar" element={<AdminRoute><Calendar /></AdminRoute>} />
        <Route path="/dashboard/calendar/monthly" element={<AdminRoute><Calendar /></AdminRoute>} />
        <Route path="/dashboard/calendar/yearly" element={<AdminRoute><Calendar /></AdminRoute>} />
        
        <Route path="/reports" element={<AdminRoute><Reports /></AdminRoute>} />
        <Route path="/dashboard/reports" element={<AdminRoute><Reports /></AdminRoute>} />
        
        <Route path="/absence" element={<AdminRoute><Absence /></AdminRoute>} />
        <Route path="/settings" element={<AdminRoute><Settings /></AdminRoute>} />
        <Route path="/approvals" element={<AdminRoute><Approvals /></AdminRoute>} />

        {/* Super Admin Portal */}
        <Route path="/super-admin/dashboard" element={<SuperAdminRoute><SuperAdminDashboard /></SuperAdminRoute>} />
        <Route path="/super-admin/companies" element={<SuperAdminRoute><CompanyList /></SuperAdminRoute>} />
        <Route path="/super-admin/companies/add" element={<SuperAdminRoute><CompanyForm /></SuperAdminRoute>} />
        <Route path="/super-admin/companies/:id/edit" element={<SuperAdminRoute><CompanyForm /></SuperAdminRoute>} />
        <Route path="/super-admin/companies/:id" element={<SuperAdminRoute><CompanyDetails /></SuperAdminRoute>} />
        <Route path="/super-admin/plans" element={<SuperAdminRoute><PlanList /></SuperAdminRoute>} />
        <Route path="/super-admin/plans/add" element={<SuperAdminRoute><PlanForm /></SuperAdminRoute>} />
        <Route path="/super-admin/plans/:id/edit" element={<SuperAdminRoute><PlanForm /></SuperAdminRoute>} />
        <Route path="/super-admin/reports" element={<SuperAdminRoute><SuperAdminReports /></SuperAdminRoute>} />
        <Route path="/super-admin/notifications" element={<SuperAdminRoute><SuperAdminNotifications /></SuperAdminRoute>} />
        <Route path="/super-admin/messages" element={<SuperAdminRoute><SuperAdminMessages /></SuperAdminRoute>} />
        <Route path="/super-admin/audit-logs" element={<SuperAdminRoute><AuditLogs /></SuperAdminRoute>} />
        <Route path="/super-admin/settings" element={<SuperAdminRoute><GlobalSettings /></SuperAdminRoute>} />

        {/* Error pages */}
        <Route path="/error/404" element={<NotFoundPage />} />
        <Route path="/error/403" element={<ForbiddenPage />} />
        <Route path="/error/500" element={<ServerErrorPage />} />
        <Route path="/error/network" element={<NetworkErrorPage />} />

        {/* Fallback Catch-All Route */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Suspense>
  );
}