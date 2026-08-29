import React from 'react';
import PropTypes from 'prop-types';
import Button from '../ui/Button';

const FrequencyTable = ({ data, onEdit, onDelete, isLoading }) => {
  if (isLoading) {
    return <div className="text-center py-6 text-gray-500">Loading frequencies...</div>;
  }

  if (!data || data.length === 0) {
    return <div className="text-center py-6 text-gray-500">No frequency records found.</div>;
  }

  return (
    <div className="overflow-x-auto shadow-sm rounded-lg border">
      <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
        <thead className="bg-gray-50 uppercase font-semibold text-xs text-gray-600">
          <tr>
            <th className="px-6 py-3">Name</th>
            <th className="px-6 py-3">Description</th>
            <th className="px-6 py-3">No. of Days</th>
            <th className="px-6 py-3">Interval</th>
            <th className="px-6 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {data.map((item) => (
            <tr key={item.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 font-medium text-gray-900">{item.name}</td>
              <td className="px-6 py-4 text-gray-500 truncate max-w-xs">{item.description || '-'}</td>
              <td className="px-6 py-4 text-gray-600">{item.numberOfDays}</td>
              <td className="px-6 py-4 text-gray-600">{item.intervalDays} days</td>
              <td className="px-6 py-4 text-right space-x-2">
                {onEdit && (
                  <Button size="sm" variant="outline" onClick={() => onEdit(item)}>
                    Edit
                  </Button>
                )}
                {onDelete && (
                  <Button size="sm" variant="danger" onClick={() => onDelete(item.id)}>
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

FrequencyTable.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      name: PropTypes.string.isRequired,
      numberOfDays: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      intervalDays: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      description: PropTypes.string,
    })
  ).isRequired,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  isLoading: PropTypes.bool,
};

FrequencyTable.defaultProps = {
  onEdit: null,
  onDelete: null,
  isLoading: false,
};

export default FrequencyTable;
