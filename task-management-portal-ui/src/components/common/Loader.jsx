import React from 'react';
import PropTypes from 'prop-types';

const Loader = ({ size, fullScreen }) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  const spinner = (
    <div
      className={`inline-block border-blue-600 border-t-transparent rounded-full animate-spin ${sizeClasses[size]}`}
      role="status"
    />
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-75">
        {spinner}
      </div>
    );
  }

  return <div className="flex justify-center items-center p-4">{spinner}</div>;
};

Loader.propTypes = {
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  fullScreen: PropTypes.bool,
};

Loader.defaultProps = {
  size: 'md',
  fullScreen: false,
};

export default Loader;