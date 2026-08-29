import React from 'react';
import Button from '../components/ui/Button';
import { useNavigate } from 'react-router-dom';

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-5xl font-bold text-red-600 mb-4">Access Denied</h1>
      <p className="text-lg text-gray-600 mb-6">You do not have the required permissions to view this page.</p>
      <Button variant="primary" onClick={() => navigate('/dashboard')}>
        Back to Dashboard
      </Button>
    </div>
  );
};

export default Unauthorized;