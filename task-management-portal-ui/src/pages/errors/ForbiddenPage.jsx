import { useNavigate } from "react-router-dom";
import ErrorState from "../../components/shared/ErrorState";

export default function ForbiddenPage() {
  const navigate = useNavigate();
  return <ErrorState type="403" actionLabel="Back to Dashboard" onAction={() => navigate("/dashboard")} />;
}
