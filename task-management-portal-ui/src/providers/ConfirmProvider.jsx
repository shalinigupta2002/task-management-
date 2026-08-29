import { createContext, useCallback, useContext, useMemo, useState } from "react";
import PropTypes from "prop-types";
import ConfirmDialog from "../components/shared/ConfirmDialog";

const ConfirmContext = createContext(null);

const PRESETS = {
  delete: { title: "Delete Item", message: "Are you sure you want to delete this item? This action cannot be undone.", confirmLabel: "Delete", confirmColor: "#DC2626" },
  suspend: { title: "Suspend Account", message: "Are you sure you want to suspend this account?", confirmLabel: "Suspend", confirmColor: "#EA580C" },
  logout: { title: "Logout", message: "Are you sure you want to logout?", confirmLabel: "Logout", confirmColor: "#2563EB" },
  resetPassword: { title: "Reset Password", message: "Send a password reset link to this user?", confirmLabel: "Send Reset", confirmColor: "#2563EB" },
  deactivate: { title: "Deactivate", message: "Are you sure you want to deactivate this account?", confirmLabel: "Deactivate", confirmColor: "#EA580C" },
  removeEmployee: { title: "Remove Employee", message: "Are you sure you want to remove this employee from the system?", confirmLabel: "Remove", confirmColor: "#DC2626" },
};

export function ConfirmProvider({ children }) {
  const [state, setState] = useState({ open: false, options: null, resolve: null });

  const close = useCallback(() => setState({ open: false, options: null, resolve: null }), []);

  const confirm = useCallback((options) => {
    const preset = typeof options === "string" ? PRESETS[options] : null;
    const merged = { ...preset, ...(typeof options === "object" ? options : {}) };
    return new Promise((resolve) => {
      setState({ open: true, options: merged, resolve });
    });
  }, []);

  const handleConfirm = useCallback(() => {
    state.resolve?.(true);
    state.options?.onConfirm?.();
    close();
  }, [state, close]);

  const handleCancel = useCallback(() => {
    state.resolve?.(false);
    state.options?.onCancel?.();
    close();
  }, [state, close]);

  const value = useMemo(() => ({ confirm }), [confirm]);

  return (
    <ConfirmContext.Provider value={value}>
      {children}
      <ConfirmDialog
        open={state.open}
        title={state.options?.title || "Confirm"}
        message={state.options?.message}
        confirmLabel={state.options?.confirmLabel}
        confirmColor={state.options?.confirmColor}
        onClose={handleCancel}
        onConfirm={handleConfirm}
      />
    </ConfirmContext.Provider>
  );
}

ConfirmProvider.propTypes = { children: PropTypes.node.isRequired };

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error("useConfirm must be used within ConfirmProvider");
  return ctx;
}
