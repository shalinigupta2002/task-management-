import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

export default function useGlobalSearch() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const openSearch = useCallback(() => setOpen(true), []);
  const closeSearch = useCallback(() => setOpen(false), []);

  const handleNavigate = useCallback((result) => {
    if (result?.path) navigate(result.path);
  }, [navigate]);

  return { open, openSearch, closeSearch, handleNavigate };
}
