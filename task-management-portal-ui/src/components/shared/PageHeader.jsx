import PropTypes from "prop-types";
import { Link as RouterLink } from "react-router-dom";
import { Box, Typography, Breadcrumbs, Link } from "@mui/material";

export default function PageHeader({ title, crumbs = [], homePath = "/dashboard" }) {
  return (
    <Box mb={2}>
      <Typography component="h1" sx={{ fontWeight: 800, color: "#0F172A", fontSize: "1.5rem" }}>{title}</Typography>
      {crumbs.length > 0 && (
        <Breadcrumbs aria-label="breadcrumb" sx={{ mt: 0.5, fontSize: "0.8rem", "& .MuiBreadcrumbs-separator": { mx: 0.5 } }}>
          <Link component={RouterLink} to={homePath} underline="hover" color="#94A3B8" sx={{ fontSize: "0.8rem" }}>Home</Link>
          {crumbs.map((c, i) => (
            c.to ? (
              <Link key={c.label} component={RouterLink} to={c.to} underline="hover" color={i === crumbs.length - 1 ? "#2563EB" : "#64748B"} sx={{ fontSize: "0.8rem", fontWeight: i === crumbs.length - 1 ? 600 : 400 }}>{c.label}</Link>
            ) : (
              <Typography key={c.label} color={i === crumbs.length - 1 ? "#2563EB" : "#64748B"} sx={{ fontSize: "0.8rem", fontWeight: i === crumbs.length - 1 ? 600 : 400 }}>{c.label}</Typography>
            )
          ))}
        </Breadcrumbs>
      )}
    </Box>
  );
}

PageHeader.propTypes = {
  title: PropTypes.string.isRequired,
  crumbs: PropTypes.arrayOf(PropTypes.shape({ label: PropTypes.string, to: PropTypes.string })),
  homePath: PropTypes.string,
};

export function PageTitle({ title, subtitle }) {
  return (
    <Box mb={2}>
      <Typography component="h1" sx={{ fontWeight: 800, color: "#0F172A", fontSize: "1.5rem" }}>{title}</Typography>
      {subtitle && <Typography sx={{ color: "#64748B", fontSize: "0.9rem", mt: 0.5 }}>{subtitle}</Typography>}
    </Box>
  );
}

PageTitle.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
};

export function Breadcrumb({ items, homePath = "/dashboard" }) {
  return (
    <Breadcrumbs aria-label="breadcrumb" sx={{ fontSize: "0.8rem" }}>
      <Link component={RouterLink} to={homePath} underline="hover" color="#94A3B8" sx={{ fontSize: "0.8rem" }}>Home</Link>
      {items.map((item, i) => (
        item.to ? (
          <Link key={item.label} component={RouterLink} to={item.to} underline="hover" color={i === items.length - 1 ? "#2563EB" : "#64748B"} sx={{ fontSize: "0.8rem" }}>{item.label}</Link>
        ) : (
          <Typography key={item.label} color="#2563EB" sx={{ fontSize: "0.8rem", fontWeight: 600 }}>{item.label}</Typography>
        )
      ))}
    </Breadcrumbs>
  );
}

Breadcrumb.propTypes = {
  items: PropTypes.arrayOf(PropTypes.shape({ label: PropTypes.string, to: PropTypes.string })).isRequired,
  homePath: PropTypes.string,
};
