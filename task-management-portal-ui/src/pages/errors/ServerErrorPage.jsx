import ErrorState from "../../components/shared/ErrorState";

export default function ServerErrorPage() {
  return <ErrorState type="500" actionLabel="Try Again" onAction={() => window.location.reload()} />;
}
