import ErrorState from "../../components/shared/ErrorState";

export default function NetworkErrorPage() {
  return <ErrorState type="network" actionLabel="Retry" onAction={() => window.location.reload()} />;
}
