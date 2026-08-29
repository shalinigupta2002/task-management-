import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { validateRequired, validateEmail } from '../../utils/validators';

const UserForm = ({ initialData, onSubmit, onCancel, isLoading }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'Employee',
    department: '',
    status: 'Active',
    ...initialData,
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        email: initialData.email || '',
        role: initialData.role || 'Employee',
        department: initialData.department || '',
        status: initialData.status || 'Active',
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!validateRequired(formData.name)) {
      newErrors.name = 'Full name is required';
    }
    if (!validateEmail(formData.email)) {
      newErrors.email = 'Valid email address is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="user-form space-y-4">
      <Input
        label="Full Name"
        name="name"
        value={formData.name}
        onChange={handleChange}
        error={errors.name}
        placeholder="John Doe"
        required
      />

      <Input
        label="Email Address"
        name="email"
        type="email"
        value={formData.email}
        onChange={handleChange}
        error={errors.email}
        placeholder="john.doe@company.com"
        required
      />

      <div className="form-group">
        <label className="block text-sm font-medium mb-1">Role</label>
        <select
          name="role"
          value={formData.role}
          onChange={handleChange}
          className="w-full p-2 border rounded-md bg-transparent text-sm"
        >
          <option value="Employee">Employee</option>
          <option value="Admin">Admin</option>
          <option value="Manager">Manager</option>
        </select>
      </div>

      <Input
        label="Department"
        name="department"
        value={formData.department}
        onChange={handleChange}
        placeholder="e.g., Engineering, HR"
      />

      <div className="form-group">
        <label className="block text-sm font-medium mb-1">Status</label>
        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
          className="w-full p-2 border rounded-md bg-transparent text-sm"
        >
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" isLoading={isLoading}>
          {initialData?.id ? 'Update User' : 'Save User'}
        </Button>
      </div>
    </form>
  );
};

UserForm.propTypes = {
  initialData: PropTypes.object,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
};

UserForm.defaultProps = {
  initialData: null,
  isLoading: false,
};

export default UserForm;