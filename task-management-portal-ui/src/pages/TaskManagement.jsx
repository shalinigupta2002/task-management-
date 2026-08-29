import React, { useState } from 'react';
import Card from '../components/ui/Card';
import Table from '../components/ui/Table';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';

const TaskManagement = () => {
  const [tasks, setTasks] = useState([
    { id: 1, title: 'Fix Navigation Bug', assignee: 'John Doe', status: 'In Progress' },
    { id: 2, title: 'Update Documentation', assignee: 'Jane Smith', status: 'Pending' },
  ]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ title: '', assignee: '', status: 'Pending' });

  const columns = [
    { header: 'Task Title', accessor: 'title' },
    { header: 'Assignee', accessor: 'assignee' },
    {
      header: 'Status',
      render: (row) => (
        <span className="px-2 py-1 rounded text-xs font-semibold bg-blue-100 text-blue-800">
          {row.status}
        </span>
      ),
    },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    setTasks([...tasks, { id: Date.now(), ...formData }]);
    setIsModalOpen(false);
    setFormData({ title: '', assignee: '', status: 'Pending' });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Task Management</h1>
        <Button variant="primary" onClick={() => setIsModalOpen(true)}>Create Task</Button>
      </div>

      <Card title="Active Tasks">
        <Table columns={columns} data={tasks} />
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="New Task">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Task Title"
            name="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
          <Input
            label="Assignee"
            name="assignee"
            value={formData.assignee}
            onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
            required
          />
          <div className="flex justify-end space-x-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Save Task</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default TaskManagement;