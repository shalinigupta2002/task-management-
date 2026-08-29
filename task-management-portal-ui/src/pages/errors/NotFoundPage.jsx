import { useNavigate } from "react-router-dom";
import ErrorState from "../../components/shared/ErrorState";

export default function NotFoundPage() {
  const navigate = useNavigate();
  return <ErrorState type="404" actionLabel="Go Home" onAction={() => navigate("/")} />;
}
