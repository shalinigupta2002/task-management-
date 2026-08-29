import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useAuth } from '../hooks/useAuth';

const RoleRoute = ({ allowedRoles, children }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg font-medium text-gray-600">Verifying permissions...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const userRole = user?.role;
  const hasAccess = allowedRoles ? allowedRoles.includes(userRole) : true;

  if (!hasAccess) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children ? children : <Outlet />;
};

RoleRoute.propTypes = {
  allowedRoles: PropTypes.arrayOf(PropTypes.string).isRequired,
  children: PropTypes.node,
};

RoleRoute.defaultProps = {
  children: null,
};

export default RoleRoute;