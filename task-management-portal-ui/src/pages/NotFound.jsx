import React from 'react';
import Button from '../components/ui/Button';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
      <p className="text-xl font-medium text-gray-600 mb-6">Page Not Found</p>
      <Button variant="primary" onClick={() => navigate('/')}>
        Go Back Home
      </Button>
    </div>
  );
};

export default NotFound;