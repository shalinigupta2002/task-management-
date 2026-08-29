import React from 'react';
import PropTypes from 'prop-types';

const Table = ({ columns, data, isLoading, onRowClick }) => {
  if (isLoading) {
    return <div className="text-center py-6 text-gray-500">Loading table data...</div>;
  }

  if (!data || data.length === 0) {
    return <div className="text-center py-6 text-gray-500">No records found.</div>;
  }

  return (
    <div className="overflow-x-auto shadow-sm rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
        <thead className="bg-gray-50 uppercase font-semibold text-xs text-gray-600">
          <tr>
            {columns.map((col, index) => (
              <th key={index} className="px-6 py-3">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {data.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              onClick={() => onRowClick && onRowClick(row)}
              className={`transition-colors ${onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''}`}
            >
              {columns.map((col, colIndex) => (
                <td key={colIndex} className="px-6 py-4 text-gray-700">
                  {col.accessor ? row[col.accessor] : col.render ? col.render(row) : '-'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

Table.propTypes = {
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      header: PropTypes.string.isRequired,
      accessor: PropTypes.string,
      render: PropTypes.func,
    })
  ).isRequired,
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  isLoading: PropTypes.bool,
  onRowClick: PropTypes.func,
};

Table.defaultProps = {
  isLoading: false,
  onRowClick: undefined,
};

export default Table;