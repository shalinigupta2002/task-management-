export const card = {
  borderRadius: 3,
  bgcolor: "#FFFFFF",
  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
  border: "1px solid #E8EDF5",
  p: 2,
};

export const fieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 2,
    bgcolor: "#F8FAFC",
    "& fieldset": { borderColor: "#E2E8F0" },
    "&:hover fieldset": { borderColor: "#2563EB" },
    "&.Mui-focused fieldset": { borderColor: "#2563EB", borderWidth: "2px" },
  },
  "& .MuiInputLabel-root.Mui-focused": { color: "#2563EB" },
};

export const tableHeadCell = {
  fontWeight: 700,
  color: "#64748B",
  fontSize: "0.78rem",
  textTransform: "uppercase",
  borderBottom: "1px solid #E8EDF5",
  py: 1.5,
  whiteSpace: "nowrap",
};

export const stickyTableHead = {
  position: "sticky",
  top: 0,
  zIndex: 2,
  bgcolor: "#F8FAFC",
};
