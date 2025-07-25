import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { useNavigate } from 'react-router-dom';
import { Sun, Moon, User, Settings, LogOut, Edit } from 'lucide-react';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle as DialogTitleUI,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { authAPI } from '../../services/api';

function setDarkMode(enabled) {
  if (enabled) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

const Profile = () => {
  const { user, logout, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [darkMode, setDarkModeState] = useState(() =>
    typeof window !== 'undefined' ? document.documentElement.classList.contains('dark') : false
  );

  // Edit Profile State
  const [editOpen, setEditOpen] = useState(false);
  const [editData, setEditData] = useState({
    firstName: user?.profile?.firstName || '',
    lastName: user?.profile?.lastName || '',
    avatarUrl: user?.profile?.avatarUrl || '',
  });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');
  const [editSuccess, setEditSuccess] = useState('');

  // Settings State
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsError, setSettingsError] = useState('');
  const [settingsSuccess, setSettingsSuccess] = useState('');

  const handleDarkModeToggle = () => {
    setDarkModeState((prev) => {
      setDarkMode(!prev);
      return !prev;
    });
  };

  // Edit Profile Handlers
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    setEditError('');
    setEditSuccess('');
    try {
      const result = await updateProfile(editData);
      if (result.success) {
        setEditSuccess('Profile updated successfully!');
      } else {
        setEditError(result.error || 'Failed to update profile.');
      }
    } catch (err) {
      setEditError('Failed to update profile.');
    } finally {
      setEditLoading(false);
    }
  };

  // Settings Handlers
  const handleSettingsChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };
  const handleSettingsSubmit = async (e) => {
    e.preventDefault();
    setSettingsLoading(true);
    setSettingsError('');
    setSettingsSuccess('');
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setSettingsError('New passwords do not match.');
      setSettingsLoading(false);
      return;
    }
    try {
      await authAPI.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      setSettingsSuccess('Password changed successfully!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setSettingsError(err.response?.data?.message || 'Failed to change password.');
    } finally {
      setSettingsLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white dark:bg-gray-900 rounded-lg shadow-md transition-colors duration-500">
      <div className="flex flex-col items-center space-y-4">
        <Avatar className="size-20">
          {user?.profile?.avatarUrl ? (
            <AvatarImage src={user.profile.avatarUrl} alt={user.profile.firstName || user.username} />
          ) : (
            <AvatarFallback>{(user?.profile?.firstName || user?.username || '?')[0]}</AvatarFallback>
          )}
        </Avatar>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{user?.profile?.firstName || user?.username}</h2>
          <p className="text-gray-500 dark:text-gray-300">{user?.email}</p>
        </div>
        <div className="flex flex-col w-full mt-6 space-y-2">
          <Dialog open={editOpen} onOpenChange={setEditOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full flex items-center justify-start" onClick={() => setEditOpen(true)}>
                <Edit className="mr-2 h-4 w-4" /> Edit Profile
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitleUI>Edit Profile</DialogTitleUI>
                <DialogDescription>Update your profile information below.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <Input
                  name="firstName"
                  value={editData.firstName}
                  onChange={handleEditChange}
                  placeholder="First Name"
                  required
                />
                <Input
                  name="lastName"
                  value={editData.lastName}
                  onChange={handleEditChange}
                  placeholder="Last Name"
                />
                <Input
                  name="avatarUrl"
                  value={editData.avatarUrl}
                  onChange={handleEditChange}
                  placeholder="Avatar URL (optional)"
                />
                {editError && (
                  <Alert variant="destructive"><AlertTitle>Error</AlertTitle><AlertDescription>{editError}</AlertDescription></Alert>
                )}
                {editSuccess && (
                  <Alert variant="default"><AlertTitle>Success</AlertTitle><AlertDescription>{editSuccess}</AlertDescription></Alert>
                )}
                <DialogFooter>
                  <Button type="submit" disabled={editLoading}>{editLoading ? 'Saving...' : 'Save Changes'}</Button>
                  <DialogClose asChild>
                    <Button type="button" variant="outline">Cancel</Button>
                  </DialogClose>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full flex items-center justify-start" onClick={() => setSettingsOpen(true)}>
                <Settings className="mr-2 h-4 w-4" /> Settings
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitleUI>Settings</DialogTitleUI>
                <DialogDescription>Change your password below.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSettingsSubmit} className="space-y-4">
                <Input
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handleSettingsChange}
                  type="password"
                  placeholder="Current Password"
                  required
                />
                <Input
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handleSettingsChange}
                  type="password"
                  placeholder="New Password"
                  required
                />
                <Input
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handleSettingsChange}
                  type="password"
                  placeholder="Confirm New Password"
                  required
                />
                {settingsError && (
                  <Alert variant="destructive"><AlertTitle>Error</AlertTitle><AlertDescription>{settingsError}</AlertDescription></Alert>
                )}
                {settingsSuccess && (
                  <Alert variant="default"><AlertTitle>Success</AlertTitle><AlertDescription>{settingsSuccess}</AlertDescription></Alert>
                )}
                <DialogFooter>
                  <Button type="submit" disabled={settingsLoading}>{settingsLoading ? 'Saving...' : 'Change Password'}</Button>
                  <DialogClose asChild>
                    <Button type="button" variant="outline">Cancel</Button>
                  </DialogClose>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          <Button variant="destructive" className="w-full flex items-center justify-start" onClick={logout}>
            <LogOut className="mr-2 h-4 w-4" /> Logout
          </Button>
        </div>
        <div className="flex items-center justify-between w-full mt-8 p-4 rounded-lg bg-gray-100 dark:bg-gray-800 transition-colors duration-500">
          <span className="flex items-center text-gray-700 dark:text-gray-200">
            <Sun className="h-5 w-5 mr-2" /> Light
          </span>
          <Switch checked={darkMode} onCheckedChange={handleDarkModeToggle} />
          <span className="flex items-center text-gray-700 dark:text-gray-200">
            <Moon className="h-5 w-5 mr-2" /> Dark
          </span>
        </div>
      </div>
    </div>
  );
};

export default Profile; 