import React from 'react';
import PropTypes from 'prop-types';
import Button from '../ui/Button';

const ConfirmDialog = ({ isOpen, title, message, onConfirm, onCancel, isLoading, confirmText, cancelText }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 mx-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-600 mb-6">{message}</p>
        <div className="flex justify-end space-x-3">
          <Button variant="secondary" onClick={onCancel} disabled={isLoading}>
            {cancelText}
          </Button>
          <Button variant="danger" onClick={onConfirm} isLoading={isLoading}>
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
};

ConfirmDialog.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  title: PropTypes.string,
  message: PropTypes.string.isRequired,
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
  confirmText: PropTypes.string,
  cancelText: PropTypes.string,
};

ConfirmDialog.defaultProps = {
  title: 'Are you sure?',
  isLoading: false,
  confirmText: 'Confirm',
  cancelText: 'Cancel',
};

export default ConfirmDialog;