import React from 'react';
import PropTypes from 'prop-types';
import Card from '../ui/Card';
import Button from '../ui/Button';

const UserProfile = ({ user, onEditProfile }) => {
  if (!user) return <div className="text-center py-6 text-gray-500">No profile data available.</div>;

  return (
    <Card title="My Profile" className="max-w-xl mx-auto">
      <div className="flex items-center space-x-4 mb-6 pb-6 border-b border-gray-200">
        <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold">
          {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
        </div>
        <div>
          <h4 className="text-lg font-semibold text-gray-900">{user.name}</h4>
          <p className="text-sm text-gray-500">{user.email}</p>
          <span className="inline-block mt-1 px-2 py-0.5 rounded text-xs font-semibold bg-gray-100 text-gray-700">
            {user.role}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <span className="text-xs font-semibold text-gray-400 uppercase">Department</span>
          <p className="text-sm font-medium text-gray-800">{user.department || 'Not Assigned'}</p>
        </div>
        <div>
          <span className="text-xs font-semibold text-gray-400 uppercase">Status</span>
          <p className="text-sm font-medium text-green-600">{user.status}</p>
        </div>
      </div>

      {onEditProfile && (
        <div className="mt-6 pt-4 border-t border-gray-200 flex justify-end">
          <Button variant="primary" size="sm" onClick={onEditProfile}>
            Edit Profile
          </Button>
        </div>
      )}
    </Card>
  );
};

UserProfile.propTypes = {
  user: PropTypes.shape({
    name: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    role: PropTypes.string.isRequired,
    department: PropTypes.string,
    status: PropTypes.string.isRequired,
  }),
  onEditProfile: PropTypes.func,
};

UserProfile.defaultProps = {
  user: null,
  onEditProfile: null,
};

export default UserProfile;