import { useMemo, useState, useCallback } from "react";
import PropTypes from "prop-types";
import {
  Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TableSortLabel, Pagination,
} from "@mui/material";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import { card, tableHeadCell, stickyTableHead } from "./styles";
import SearchBar from "./SearchBar";
import EmptyState from "./EmptyState";

function getNestedValue(row, key) {
  return key.split(".").reduce((acc, k) => acc?.[k], row);
}

export default function DataTable({
  columns,
  rows,
  searchable = true,
  searchPlaceholder = "Search...",
  searchKeys,
  stickyHeader = true,
  pageSize = 10,
  emptyType = "generic",
  emptyTitle,
  toolbar,
  filters,
  onRowClick,
  getRowId = (row) => row.id,
  ariaLabel = "Data table",
}) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState({ key: null, direction: "asc" });

  const keys = searchKeys || columns.filter((c) => c.searchable !== false && c.field).map((c) => c.field);

  const filtered = useMemo(() => {
    let data = [...rows];
    const q = search.trim().toLowerCase();
    if (q) {
      data = data.filter((row) =>
        keys.some((k) => String(getNestedValue(row, k) ?? "").toLowerCase().includes(q))
      );
    }
    if (sort.key) {
      const col = columns.find((c) => c.field === sort.key);
      data.sort((a, b) => {
        const av = col?.sortValue ? col.sortValue(a) : getNestedValue(a, sort.key);
        const bv = col?.sortValue ? col.sortValue(b) : getNestedValue(b, sort.key);
        if (av == null) return 1;
        if (bv == null) return -1;
        const cmp = String(av).localeCompare(String(bv), undefined, { numeric: true });
        return sort.direction === "asc" ? cmp : -cmp;
      });
    }
    return data;
  }, [rows, search, sort, keys, columns]);

  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));

  const handleSort = useCallback((field) => {
    if (!field) return;
    setSort((prev) => ({
      key: field,
      direction: prev.key === field && prev.direction === "asc" ? "desc" : "asc",
    }));
  }, []);

  if (rows.length === 0) {
    return <EmptyState type={emptyType} title={emptyTitle} />;
  }

  return (
    <Box>
      {(searchable || toolbar || filters) && (
        <Box sx={{ ...card, mb: 2, display: "flex", flexWrap: "wrap", gap: 2, alignItems: "center" }}>
          {searchable && (
            <Box sx={{ flex: 1, minWidth: 220 }}>
              <SearchBar value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder={searchPlaceholder} />
            </Box>
          )}
          {filters}
          {toolbar}
        </Box>
      )}

      {filtered.length === 0 ? (
        <EmptyState type={emptyType} title="No results found" description="Try adjusting your search or filters." />
      ) : (
        <Box sx={{ ...card, p: 0, overflow: "hidden" }}>
          <TableContainer sx={{ maxHeight: 560, overflowX: "auto" }}>
            <Table stickyHeader={stickyHeader} aria-label={ariaLabel} size="medium">
              <TableHead>
                <TableRow sx={stickyHeader ? stickyTableHead : { bgcolor: "#F8FAFC" }}>
                  {columns.map((col) => (
                    <TableCell key={col.field || col.header} sx={tableHeadCell} align={col.align || "left"} sortDirection={sort.key === col.field ? sort.direction : false}>
                      {col.sortable !== false && col.field ? (
                        <TableSortLabel
                          active={sort.key === col.field}
                          direction={sort.key === col.field ? sort.direction : "asc"}
                          onClick={() => handleSort(col.field)}
                          IconComponent={() => (
                            sort.key === col.field
                              ? (sort.direction === "asc" ? <ArrowUpwardIcon sx={{ fontSize: 14, ml: 0.5 }} /> : <ArrowDownwardIcon sx={{ fontSize: 14, ml: 0.5 }} />)
                              : null
                          )}
                        >
                          {col.header}
                        </TableSortLabel>
                      ) : col.header}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {paged.map((row) => (
                  <TableRow
                    key={getRowId(row)}
                    hover
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                    sx={{
                      cursor: onRowClick ? "pointer" : "default",
                      "& td": { borderBottom: "1px solid #F1F5F9", py: 1.5 },
                    }}
                  >
                    {columns.map((col) => (
                      <TableCell key={col.field || col.header} align={col.align || "left"} sx={{ fontSize: "0.875rem", color: "#334155" }}>
                        {col.render ? col.render(row) : getNestedValue(row, col.field)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          {pageCount > 1 && (
            <Box display="flex" justifyContent="center" py={2}>
              <Pagination count={pageCount} page={page} onChange={(_, v) => setPage(v)} size="small" color="primary" />
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
}

DataTable.propTypes = {
  columns: PropTypes.arrayOf(PropTypes.shape({
    header: PropTypes.string.isRequired,
    field: PropTypes.string,
    render: PropTypes.func,
    sortable: PropTypes.bool,
    align: PropTypes.string,
    sortValue: PropTypes.func,
    searchable: PropTypes.bool,
  })).isRequired,
  rows: PropTypes.array.isRequired,
  searchable: PropTypes.bool,
  searchPlaceholder: PropTypes.string,
  searchKeys: PropTypes.arrayOf(PropTypes.string),
  stickyHeader: PropTypes.bool,
  pageSize: PropTypes.number,
  emptyType: PropTypes.string,
  emptyTitle: PropTypes.string,
  toolbar: PropTypes.node,
  filters: PropTypes.node,
  onRowClick: PropTypes.func,
  getRowId: PropTypes.func,
  ariaLabel: PropTypes.string,
};
