import React from 'react';
import PropTypes from 'prop-types';
import Card from '../ui/Card';
import Button from '../ui/Button';

const UserDetails = ({ user, onEdit, onClose }) => {
  if (!user) return null;

  return (
    <Card title="User Details" className="max-w-md mx-auto">
      <div className="space-y-4">
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase">Full Name</label>
          <p className="text-sm font-medium text-gray-900">{user.name}</p>
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase">Email Address</label>
          <p className="text-sm text-gray-700">{user.email}</p>
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase">Role</label>
          <p className="text-sm">
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
              user.role === 'Admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
            }`}>
              {user.role}
            </span>
          </p>
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase">Department</label>
          <p className="text-sm text-gray-700">{user.department || '-'}</p>
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase">Status</label>
          <p className="text-sm">
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
              user.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {user.status}
            </span>
          </p>
        </div>
      </div>
      <div className="flex justify-end space-x-2 mt-6 pt-4 border-t border-gray-200">
        {onEdit && (
          <Button variant="outline" size="sm" onClick={() => onEdit(user)}>
            Edit User
          </Button>
        )}
        {onClose && (
          <Button variant="secondary" size="sm" onClick={onClose}>
            Close
          </Button>
        )}
      </div>
    </Card>
  );
};

UserDetails.propTypes = {
  user: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    role: PropTypes.string.isRequired,
    department: PropTypes.string,
    status: PropTypes.string.isRequired,
  }),
  onEdit: PropTypes.func,
  onClose: PropTypes.func,
};

UserDetails.defaultProps = {
  user: null,
  onEdit: null,
  onClose: null,
};

export default UserDetails;