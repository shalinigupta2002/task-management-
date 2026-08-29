import React, { useState } from 'react';
import Card from '../components/ui/Card';
import Table from '../components/ui/Table';
import Button from '../components/ui/Button';

const Approvals = () => {
  const [approvals, setApprovals] = useState([
    { id: 1, employee: 'John Doe', type: 'Annual Leave', dates: '2026-08-10 to 2026-08-15' },
    { id: 2, employee: 'Jane Smith', type: 'Sick Leave', dates: '2026-08-02 to 2026-08-03' },
  ]);

  const handleAction = (id, status) => {
    setApprovals(approvals.filter(item => item.id !== id));
  };

  const columns = [
    { header: 'Employee', accessor: 'employee' },
    { header: 'Request Type', accessor: 'type' },
    { header: 'Duration', accessor: 'dates' },
    {
      header: 'Actions',
      render: (row) => (
        <div className="space-x-2">
          <Button size="sm" variant="success" onClick={() => handleAction(row.id, 'Approved')}>Approve</Button>
          <Button size="sm" variant="danger" onClick={() => handleAction(row.id, 'Rejected')}>Reject</Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Pending Approvals</h1>
      <Card title="Requests Awaiting Review">
        <Table columns={columns} data={approvals} />
      </Card>
    </div>
  );
};

export default Approvals;