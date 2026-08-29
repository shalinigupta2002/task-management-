import React from 'react';
import PropTypes from 'prop-types';
import Button from '../ui/Button';

const ApprovalTable = ({ data, onApprove, onReject, onView, onDelete, isLoading }) => {
  if (isLoading) {
    return <div className="text-center py-6 text-gray-500">Loading approvals...</div>;
  }

  if (!data || data.length === 0) {
    return <div className="text-center py-6 text-gray-500">No approval requests found.</div>;
  }

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Approved</span>;
      case 'rejected':
        return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">Rejected</span>;
      default:
        return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">Pending</span>;
    }
  };

  return (
    <div className="overflow-x-auto shadow-sm rounded-lg border">
      <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
        <thead className="bg-gray-50 uppercase font-semibold text-xs text-gray-600">
          <tr>
            <th className="px-6 py-3">Title</th>
            <th className="px-6 py-3">Department</th>
            <th className="px-6 py-3">Priority</th>
            <th className="px-6 py-3">Status</th>
            <th className="px-6 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {data.map((item) => (
            <tr key={item.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 font-medium text-gray-900">{item.title}</td>
              <td className="px-6 py-4 text-gray-600">{item.department}</td>
              <td className="px-6 py-4 text-gray-600">{item.priority}</td>
              <td className="px-6 py-4">{getStatusBadge(item.status)}</td>
              <td className="px-6 py-4 text-right space-x-2">
                {onView && (
                  <Button size="sm" variant="ghost" onClick={() => onView(item)}>
                    View
                  </Button>
                )}
                {item.status === 'Pending' && onApprove && (
                  <Button size="sm" variant="success" onClick={() => onApprove(item.id)}>
                    Approve
                  </Button>
                )}
                {item.status === 'Pending' && onReject && (
                  <Button size="sm" variant="danger" onClick={() => onReject(item.id)}>
                    Reject
                  </Button>
                )}
                {onDelete && (
                  <Button size="sm" variant="outline" onClick={() => onDelete(item.id)}>
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

ApprovalTable.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      title: PropTypes.string.isRequired,
      department: PropTypes.string.isRequired,
      priority: PropTypes.string,
      status: PropTypes.string.isRequired,
    })
  ).isRequired,
  onApprove: PropTypes.func,
  onReject: PropTypes.func,
  onView: PropTypes.func,
  onDelete: PropTypes.func,
  isLoading: PropTypes.bool,
};

ApprovalTable.defaultProps = {
  onApprove: null,
  onReject: null,
  onView: null,
  onDelete: null,
  isLoading: false,
};

export default ApprovalTable;