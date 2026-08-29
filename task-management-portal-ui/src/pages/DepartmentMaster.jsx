import React, { useState } from 'react';
import Card from '../components/ui/Card';
import Table from '../components/ui/Table';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';

const DepartmentMaster = () => {
  const [departments, setDepartments] = useState([
    { id: 1, name: 'Engineering', code: 'ENG', head: 'Alice Johnson' },
    { id: 2, name: 'Human Resources', code: 'HR', head: 'Bob Smith' },
  ]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', code: '', head: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    setDepartments([...departments, { id: Date.now(), ...formData }]);
    setIsModalOpen(false);
    setFormData({ name: '', code: '', head: '' });
  };

  const columns = [
    { header: 'Department Name', accessor: 'name' },
    { header: 'Code', accessor: 'code' },
    { header: 'Department Head', accessor: 'head' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Department Master</h1>
        <Button variant="primary" onClick={() => setIsModalOpen(true)}>Add Department</Button>
      </div>

      <Card title="Departments List">
        <Table columns={columns} data={departments} />
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Department">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Department Name"
            name="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <Input
            label="Code"
            name="code"
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
            required
          />
          <Input
            label="Department Head"
            name="head"
            value={formData.head}
            onChange={(e) => setFormData({ ...formData, head: e.target.value })}
          />
          <div className="flex justify-end space-x-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Save</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default DepartmentMaster;