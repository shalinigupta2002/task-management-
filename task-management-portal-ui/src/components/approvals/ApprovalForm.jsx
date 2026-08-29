import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { validateRequired } from '../../utils/validators';

const ApprovalForm = ({ initialData, onSubmit, onCancel, isLoading }) => {
  const [formData, setFormData] = useState({
    title: '',
    department: '',
    priority: 'Medium',
    description: '',
    ...initialData,
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        department: initialData.department || '',
        priority: initialData.priority || 'Medium',
        description: initialData.description || '',
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
    if (!validateRequired(formData.title)) {
      newErrors.title = 'Title is required';
    }
    if (!validateRequired(formData.department)) {
      newErrors.department = 'Department is required';
    }
    if (!validateRequired(formData.description)) {
      newErrors.description = 'Description is required';
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
    <form onSubmit={handleSubmit} className="approval-form space-y-4">
      <Input
        label="Approval Title"
        name="title"
        value={formData.title}
        onChange={handleChange}
        error={errors.title}
        placeholder="Enter approval subject or title"
        required
      />

      <div className="form-group">
        <label className="block text-sm font-medium mb-1">Department</label>
        <select
          name="department"
          value={formData.department}
          onChange={handleChange}
          className="w-full p-2 border rounded-md bg-transparent"
        >
          <option value="">Select Department</option>
          <option value="Engineering">Engineering</option>
          <option value="HR">HR</option>
          <option value="Finance">Finance</option>
          <option value="Operations">Operations</option>
        </select>
        {errors.department && (
          <span className="text-red-500 text-xs mt-1">{errors.department}</span>
        )}
      </div>

      <div className="form-group">
        <label className="block text-sm font-medium mb-1">Priority</label>
        <select
          name="priority"
          value={formData.priority}
          onChange={handleChange}
          className="w-full p-2 border rounded-md bg-transparent"
        >
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
      </div>

      <div className="form-group">
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows="4"
          className="w-full p-2 border rounded-md bg-transparent"
          placeholder="Provide details regarding the request..."
        />
        {errors.description && (
          <span className="text-red-500 text-xs mt-1">{errors.description}</span>
        )}
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button type="submit" variant="primary" isLoading={isLoading}>
          {initialData?.id ? 'Update Request' : 'Submit Request'}
        </Button>
      </div>
    </form>
  );
};

ApprovalForm.propTypes = {
  initialData: PropTypes.object,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
};

ApprovalForm.defaultProps = {
  initialData: null,
  isLoading: false,
};

export default ApprovalForm;