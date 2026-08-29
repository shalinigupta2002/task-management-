import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LoginLayout from "../components/login/LoginLayout";
import LoginForm from "../components/login/LoginForm";

/**
 * Login Page Container
 */
export default function Login() {
  const navigate = useNavigate();

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
    const role = localStorage.getItem("userRole");
    if (isAuthenticated) {
      if (role === "SUPER_ADMIN") navigate("/super-admin/dashboard", { replace: true });
      else if (role === "SUB_ADMIN") navigate("/sub-admin/dashboard", { replace: true });
      else if (role === "EMPLOYEE") navigate("/employee/dashboard", { replace: true });
      else navigate("/dashboard", { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    const prevHtmlOverflow = document.documentElement.style.overflow;
    const prevBodyOverflow = document.body.style.overflow;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = prevHtmlOverflow;
      document.body.style.overflow = prevBodyOverflow;
    };
  }, []);

  return (
    <LoginLayout>
      <LoginForm />
    </LoginLayout>
  );
}