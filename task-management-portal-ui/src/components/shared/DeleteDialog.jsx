import PropTypes from "prop-types";
import ConfirmDialog from "./ConfirmDialog";

export default function DeleteDialog({ open, itemName, onClose, onConfirm }) {
  return (
    <ConfirmDialog
      open={open}
      title="Delete Item"
      message={itemName ? `Are you sure you want to delete "${itemName}"? This action cannot be undone.` : "Are you sure you want to delete this item? This action cannot be undone."}
      confirmLabel="Delete"
      confirmColor="#DC2626"
      onClose={onClose}
      onConfirm={onConfirm}
    />
  );
}

DeleteDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  itemName: PropTypes.string,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
};
