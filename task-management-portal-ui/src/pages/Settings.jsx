import React from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useTheme } from '../context/ThemeContext';

const Settings = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900">Application Settings</h1>

      <Card title="Preferences">
        <div className="flex items-center justify-between py-2">
          <div>
            <h4 className="text-sm font-medium text-gray-900">Interface Theme</h4>
            <p className="text-xs text-gray-500">Switch between light and dark mode</p>
          </div>
          <Button variant="outline" size="sm" onClick={toggleTheme}>
            Current: {theme.toUpperCase()}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Settings;