import React from 'react';
import PropTypes from 'prop-types';

const Card = ({ children, title, footer, className }) => {
  return (
    <div className={`bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden ${className || ''}`}>
      {title && (
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-base font-semibold text-gray-900">{title}</h3>
        </div>
      )}
      <div className="p-6">{children}</div>
      {footer && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-2">
          {footer}
        </div>
      )}
    </div>
  );
};

Card.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.string,
  footer: PropTypes.node,
  className: PropTypes.string,
};

Card.defaultProps = {
  title: undefined,
  footer: undefined,
  className: '',
};

export default Card;