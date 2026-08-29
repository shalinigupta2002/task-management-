import React from 'react';
import PropTypes from 'prop-types';

const Input = ({
  label,
  name,
  type,
  value,
  onChange,
  placeholder,
  error,
  required,
  disabled,
  icon,
  className,
}) => {
  return (
    <div className={`form-control w-full ${className || ''}`}>
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative rounded-md shadow-sm">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {icon}
          </div>
        )}
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={`block w-full rounded-md border ${
            error ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
          } ${icon ? 'pl-10' : 'pl-3'} pr-3 py-2 text-sm bg-transparent placeholder-gray-400 focus:outline-none disabled:bg-gray-50 disabled:text-gray-500`}
        />
      </div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
};

Input.propTypes = {
  label: PropTypes.string,
  name: PropTypes.string.isRequired,
  type: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  error: PropTypes.string,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  icon: PropTypes.node,
  className: PropTypes.string,
};

Input.defaultProps = {
  label: '',
  type: 'text',
  placeholder: '',
  error: '',
  required: false,
  disabled: false,
  icon: null,
  className: '',
};

export default Input;