import { useEffect } from "react";

/** Attach Ctrl+K / Cmd+K global search shortcut (does not modify existing navbars). */
export default function useGlobalSearchShortcut(onOpen) {
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onOpen?.();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onOpen]);
}
