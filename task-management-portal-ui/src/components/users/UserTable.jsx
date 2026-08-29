import React from 'react';
import PropTypes from 'prop-types';
import Button from '../ui/Button';

const UserTable = ({ users, onEdit, onDelete, onView, isLoading }) => {
  if (isLoading) {
    return <div className="text-center py-6 text-gray-500">Loading user list...</div>;
  }

  if (!users || users.length === 0) {
    return <div className="text-center py-6 text-gray-500">No users found.</div>;
  }

  return (
    <div className="overflow-x-auto shadow-sm rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
        <thead className="bg-gray-50 uppercase font-semibold text-xs text-gray-600">
          <tr>
            <th className="px-6 py-3">Name</th>
            <th className="px-6 py-3">Email</th>
            <th className="px-6 py-3">Role</th>
            <th className="px-6 py-3">Department</th>
            <th className="px-6 py-3">Status</th>
            <th className="px-6 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 font-medium text-gray-900">{user.name}</td>
              <td className="px-6 py-4 text-gray-600">{user.email}</td>
              <td className="px-6 py-4">
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  user.role === 'Admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {user.role}
                </span>
              </td>
              <td className="px-6 py-4 text-gray-600">{user.department || '-'}</td>
              <td className="px-6 py-4">
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  user.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {user.status}
                </span>
              </td>
              <td className="px-6 py-4 text-right space-x-2">
                {onView && (
                  <Button size="sm" variant="ghost" onClick={() => onView(user)}>
                    View
                  </Button>
                )}
                {onEdit && (
                  <Button size="sm" variant="outline" onClick={() => onEdit(user)}>
                    Edit
                  </Button>
                )}
                {onDelete && (
                  <Button size="sm" variant="danger" onClick={() => onDelete(user.id)}>
                    Delete
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

UserTable.propTypes = {
  users: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      name: PropTypes.string.isRequired,
      email: PropTypes.string.isRequired,
      role: PropTypes.string.isRequired,
      department: PropTypes.string,
      status: PropTypes.string.isRequired,
    })
  ).isRequired,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  onView: PropTypes.func,
  isLoading: PropTypes.bool,
};

UserTable.defaultProps = {
  onEdit: null,
  onDelete: null,
  onView: null,
  isLoading: false,
};

export default UserTable;