import { useState, useCallback, useMemo } from "react";

export default function useTableSort(initialKey = null, initialDirection = "asc") {
  const [sort, setSort] = useState({ key: initialKey, direction: initialDirection });

  const toggleSort = useCallback((key) => {
    setSort((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  }, []);

  const sortRows = useCallback((rows, accessor) => {
    if (!sort.key) return rows;
    return [...rows].sort((a, b) => {
      const av = accessor(a, sort.key);
      const bv = accessor(b, sort.key);
      const cmp = String(av ?? "").localeCompare(String(bv ?? ""), undefined, { numeric: true });
      return sort.direction === "asc" ? cmp : -cmp;
    });
  }, [sort]);

  return useMemo(() => ({ sort, toggleSort, sortRows }), [sort, toggleSort, sortRows]);
}
