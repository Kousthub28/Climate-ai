import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Switch } from '../ui/switch';
import { Sun, Moon } from 'lucide-react';
import { authAPI } from '../../services/api';

const Settings = () => {
  // Change Password State
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Dark Mode State
  const [darkMode, setDarkMode] = useState(() =>
    typeof window !== 'undefined' ? document.documentElement.classList.contains('dark') : false
  );

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordLoading(true);
    setPasswordSuccess('');
    setPasswordError('');
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match.');
      setPasswordLoading(false);
      return;
    }
    try {
      await authAPI.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      setPasswordSuccess('Password changed successfully!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Failed to change password.');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleDarkModeToggle = () => {
    setDarkMode((prev) => {
      if (!prev) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return !prev;
    });
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Settings</h1>
      {/* Dark Mode Toggle */}
      <div className="flex items-center justify-between mb-8 p-4 rounded-lg bg-gray-100 dark:bg-gray-800 transition-colors duration-500">
        <span className="flex items-center text-gray-700 dark:text-gray-200">
          <Sun className="h-5 w-5 mr-2" /> Light
        </span>
        <Switch checked={darkMode} onCheckedChange={handleDarkModeToggle} />
        <span className="flex items-center text-gray-700 dark:text-gray-200">
          <Moon className="h-5 w-5 mr-2" /> Dark
        </span>
      </div>
      {/* Change Password Form */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-2">Change Password</h2>
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <Input
            name="currentPassword"
            value={passwordData.currentPassword}
            onChange={handlePasswordChange}
            type="password"
            placeholder="Current Password"
            required
          />
          <Input
            name="newPassword"
            value={passwordData.newPassword}
            onChange={handlePasswordChange}
            type="password"
            placeholder="New Password"
            required
          />
          <Input
            name="confirmPassword"
            value={passwordData.confirmPassword}
            onChange={handlePasswordChange}
            type="password"
            placeholder="Confirm New Password"
            required
          />
          {passwordError && <div className="text-red-600 text-sm">{passwordError}</div>}
          {passwordSuccess && <div className="text-green-600 text-sm">{passwordSuccess}</div>}
          <Button type="submit" disabled={passwordLoading} className="w-full">
            {passwordLoading ? 'Changing...' : 'Change Password'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Settings; 