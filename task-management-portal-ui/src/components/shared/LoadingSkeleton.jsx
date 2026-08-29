import PropTypes from "prop-types";
import { Box, Skeleton } from "@mui/material";
import { card } from "./styles";

export function SkeletonCard({ lines = 2 }) {
  return (
    <Box sx={card} aria-busy="true" aria-label="Loading">
      <Skeleton variant="rounded" width={44} height={44} sx={{ borderRadius: 2.5, mb: 1.5 }} />
      <Skeleton variant="text" width="40%" height={36} />
      <Skeleton variant="text" width="60%" height={20} />
      {lines > 2 && <Skeleton variant="text" width="50%" height={16} sx={{ mt: 0.5 }} />}
    </Box>
  );
}

SkeletonCard.propTypes = { lines: PropTypes.number };

export function SkeletonCards({ count = 6, columns = 3 }) {
  return (
    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: `repeat(${columns}, 1fr)` }, gap: 2 }}>
      {Array.from({ length: count }).map((_, i) => <SkeletonCard key={i} />)}
    </Box>
  );
}

SkeletonCards.propTypes = { count: PropTypes.number, columns: PropTypes.number };

export function SkeletonTable({ rows = 6, cols = 5 }) {
  return (
    <Box sx={{ ...card, p: 0, overflow: "hidden" }} aria-busy="true" aria-label="Loading table">
      <Box sx={{ p: 2, borderBottom: "1px solid #E8EDF5" }}>
        <Skeleton variant="rounded" height={36} width="100%" sx={{ maxWidth: 320, borderRadius: 2 }} />
      </Box>
      {Array.from({ length: rows }).map((_, r) => (
        <Box key={r} display="flex" gap={2} px={2} py={1.5} sx={{ borderBottom: "1px solid #F1F5F9" }}>
          {Array.from({ length: cols }).map((__, c) => (
            <Skeleton key={c} variant="text" sx={{ flex: c === 0 ? 2 : 1 }} height={24} />
          ))}
        </Box>
      ))}
    </Box>
  );
}

SkeletonTable.propTypes = { rows: PropTypes.number, cols: PropTypes.number };

export function SkeletonDashboard() {
  return (
    <Box aria-busy="true" aria-label="Loading dashboard">
      <Skeleton variant="text" width={240} height={40} sx={{ mb: 2 }} />
      <SkeletonCards count={6} columns={3} />
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "2fr 1fr" }, gap: 2, mt: 2.5 }}>
        <Box sx={card}><Skeleton variant="rounded" height={280} /></Box>
        <Box sx={card}><Skeleton variant="rounded" height={280} /></Box>
      </Box>
    </Box>
  );
}

export function SkeletonProfile() {
  return (
    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1fr 2fr" }, gap: 2 }} aria-busy="true">
      <Box sx={{ ...card, textAlign: "center" }}>
        <Skeleton variant="circular" width={96} height={96} sx={{ mx: "auto", mb: 2 }} />
        <Skeleton variant="text" width="60%" sx={{ mx: "auto" }} />
        <Skeleton variant="text" width="40%" sx={{ mx: "auto" }} />
      </Box>
      <Box sx={card}>
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} variant="rounded" height={48} sx={{ mb: 2, borderRadius: 2 }} />
        ))}
      </Box>
    </Box>
  );
}

export function SkeletonChat() {
  return (
    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 2fr" }, gap: 2 }} aria-busy="true">
      <Box sx={card}>
        <Skeleton variant="rounded" height={40} sx={{ mb: 2, borderRadius: 2 }} />
        {Array.from({ length: 4 }).map((_, i) => (
          <Box key={i} display="flex" gap={1.5} mb={1.5}>
            <Skeleton variant="circular" width={36} height={36} />
            <Box flex={1}><Skeleton variant="text" /><Skeleton variant="text" width="60%" /></Box>
          </Box>
        ))}
      </Box>
      <Box sx={card}><Skeleton variant="rounded" height={400} /></Box>
    </Box>
  );
}

export function SkeletonReports() {
  return (
    <Box aria-busy="true">
      <SkeletonCards count={4} columns={4} />
      <Box sx={{ ...card, mt: 2 }}><Skeleton variant="rounded" height={320} /></Box>
    </Box>
  );
}

export default function LoadingSkeleton({ variant = "table", ...props }) {
  const map = {
    card: SkeletonCard,
    cards: SkeletonCards,
    table: SkeletonTable,
    dashboard: SkeletonDashboard,
    profile: SkeletonProfile,
    chat: SkeletonChat,
    reports: SkeletonReports,
  };
  const Component = map[variant] || SkeletonTable;
  return <Component {...props} />;
}

LoadingSkeleton.propTypes = {
  variant: PropTypes.oneOf(["card", "cards", "table", "dashboard", "profile", "chat", "reports"]),
};
