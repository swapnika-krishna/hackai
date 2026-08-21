import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  Building, 
  Calendar, 
  Lock, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Percent, 
  Save, 
  LogOut, 
  Bell, 
  Sparkles,
  ShieldCheck,
  Award
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { StudentStats } from '../types';

interface ProfilePageProps {
  setCurrentView: (view: string) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ setCurrentView }) => {
  const { user, token, logout, updateUser, refreshProfile } = useAuth();

  const [activeTab, setActiveTab] = useState<'stats' | 'edit' | 'password' | 'notifications'>('stats');
  const [stats, setStats] = useState<StudentStats>({
    totalSubmitted: 0,
    resolved: 0,
    pending: 0,
    inProgress: 0,
    resolutionRate: 0,
  });
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  // Edit Profile Form
  const [editForm, setEditForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    department: user?.department || 'Computer Science (CSE)',
    year: String(user?.year || '3'),
  });
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState<string | null>(null);
  const [profileErrorMsg, setProfileErrorMsg] = useState<string | null>(null);

  // Change Password Form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isChangingPass, setIsChangingPass] = useState(false);
  const [passSuccessMsg, setPassSuccessMsg] = useState<string | null>(null);
  const [passErrorMsg, setPassErrorMsg] = useState<string | null>(null);

  // Notification Preferences
  const [notifications, setNotifications] = useState({
    emailAlerts: user?.notificationPreferences?.emailAlerts ?? true,
    smsAlerts: user?.notificationPreferences?.smsAlerts ?? true,
    statusChangeAlerts: user?.notificationPreferences?.statusChangeAlerts ?? true,
  });
  const [notifSuccessMsg, setNotifSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchStudentStats();
  }, [token]);

  useEffect(() => {
    if (user) {
      setEditForm({
        name: user.name,
        phone: user.phone,
        department: user.department,
        year: String(user.year || '3'),
      });
      if (user.notificationPreferences) {
        setNotifications(user.notificationPreferences as any);
      }
    }
  }, [user]);

  const fetchStudentStats = async () => {
    if (!token) return;
    setIsLoadingStats(true);
    try {
      const res = await fetch('/api/stats/student', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
      }
    } catch (err) {
      console.error('Error loading stats:', err);
    } finally {
      setIsLoadingStats(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSuccessMsg(null);
    setProfileErrorMsg(null);
    setIsUpdatingProfile(true);

    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editForm),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update profile');
      }

      updateUser(data.user);
      setProfileSuccessMsg('Profile details successfully updated!');
    } catch (err: any) {
      setProfileErrorMsg(err.message);
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassSuccessMsg(null);
    setPassErrorMsg(null);

    if (passwordForm.newPassword.length < 6) {
      setPassErrorMsg('New password must be at least 6 characters');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPassErrorMsg('New passwords do not match');
      return;
    }

    setIsChangingPass(true);

    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to change password');
      }

      setPassSuccessMsg('Password successfully changed!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      setPassErrorMsg(err.message);
    } finally {
      setIsChangingPass(false);
    }
  };

  const handleSaveNotifications = async () => {
    setNotifSuccessMsg(null);
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          notificationPreferences: notifications,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        updateUser(data.user);
        setNotifSuccessMsg('Notification preferences saved!');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Profile Header */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-xl mb-8 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-cyan-400 p-[2px] shadow-lg shadow-emerald-500/20">
              <div className="w-full h-full bg-zinc-950 rounded-[14px] flex items-center justify-center text-emerald-400 font-bold text-2xl">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  {user?.name}
                </h1>
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {user?.role === 'admin' ? 'Campus Admin' : 'Verified Student'}
                </span>
              </div>
              
              <p className="text-xs text-zinc-400 mt-1 font-mono">
                {user?.studentId ? `Student ID: ${user.studentId}` : `Email: ${user?.email}`} • {user?.department}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              logout();
              setCurrentView('launch');
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-800 hover:bg-rose-500/20 text-zinc-300 hover:text-rose-300 border border-zinc-700 hover:border-rose-500/40 text-xs font-semibold transition-all self-start sm:self-auto"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>

        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-zinc-800 mb-8">
        <button
          onClick={() => setActiveTab('stats')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'stats'
              ? 'bg-emerald-500 text-zinc-950 font-bold shadow-md shadow-emerald-500/20'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Overview & Statistics</span>
        </button>

        <button
          onClick={() => setActiveTab('edit')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'edit'
              ? 'bg-emerald-500 text-zinc-950 font-bold shadow-md shadow-emerald-500/20'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Edit Profile</span>
        </button>

        <button
          onClick={() => setActiveTab('password')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'password'
              ? 'bg-emerald-500 text-zinc-950 font-bold shadow-md shadow-emerald-500/20'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>Change Password</span>
        </button>

        <button
          onClick={() => setActiveTab('notifications')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'notifications'
              ? 'bg-emerald-500 text-zinc-950 font-bold shadow-md shadow-emerald-500/20'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Notification Alerts</span>
        </button>
      </div>

      {/* TAB 1: OVERVIEW & STATS */}
      {activeTab === 'stats' && (
        <div className="space-y-8 animate-in fade-in duration-150">
          
          {/* Section: Personal Info Cards */}
          <div>
            <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-4">
              Personal Information
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800">
                <span className="text-zinc-500 text-[11px] block uppercase">Full Name</span>
                <span className="text-sm font-semibold text-zinc-100 mt-0.5 block">{user?.name}</span>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800">
                <span className="text-zinc-500 text-[11px] block uppercase">Student ID / Roll No</span>
                <span className="text-sm font-mono font-semibold text-emerald-400 mt-0.5 block">{user?.studentId || 'Admin Account'}</span>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800">
                <span className="text-zinc-500 text-[11px] block uppercase">Registered Email</span>
                <span className="text-sm font-semibold text-zinc-100 mt-0.5 block truncate">{user?.email}</span>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800">
                <span className="text-zinc-500 text-[11px] block uppercase">Phone Number</span>
                <span className="text-sm font-semibold text-zinc-100 mt-0.5 block">{user?.phone || 'Not Provided'}</span>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800">
                <span className="text-zinc-500 text-[11px] block uppercase">Department</span>
                <span className="text-sm font-semibold text-zinc-100 mt-0.5 block">{user?.department}</span>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800">
                <span className="text-zinc-500 text-[11px] block uppercase">Academic Year</span>
                <span className="text-sm font-semibold text-zinc-100 mt-0.5 block">{user?.year ? `Year ${user.year}` : 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Section: Dynamic Complaint Statistics (MANDATORY REQUIREMENT) */}
          <div>
            <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-4">
              Calculated Complaint Statistics
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              
              <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800">
                <span className="text-zinc-500 text-[10px] uppercase font-semibold block">Submitted</span>
                <span className="text-3xl font-extrabold text-white mt-1 block">
                  {isLoadingStats ? '...' : stats.totalSubmitted}
                </span>
                <span className="text-[10px] text-zinc-400 mt-1 block">Total grievances</span>
              </div>

              <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800">
                <span className="text-zinc-500 text-[10px] uppercase font-semibold block">Resolved</span>
                <span className="text-3xl font-extrabold text-emerald-400 mt-1 block">
                  {isLoadingStats ? '...' : stats.resolved}
                </span>
                <span className="text-[10px] text-zinc-400 mt-1 block">Completed issues</span>
              </div>

              <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800">
                <span className="text-zinc-500 text-[10px] uppercase font-semibold block">Pending Review</span>
                <span className="text-3xl font-extrabold text-amber-400 mt-1 block">
                  {isLoadingStats ? '...' : stats.pending}
                </span>
                <span className="text-[10px] text-zinc-400 mt-1 block">Awaiting triage</span>
              </div>

              <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800">
                <span className="text-zinc-500 text-[10px] uppercase font-semibold block">In Progress</span>
                <span className="text-3xl font-extrabold text-cyan-400 mt-1 block">
                  {isLoadingStats ? '...' : stats.inProgress}
                </span>
                <span className="text-[10px] text-zinc-400 mt-1 block">Technician assigned</span>
              </div>

              <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 col-span-2 sm:col-span-1">
                <span className="text-zinc-500 text-[10px] uppercase font-semibold block">Resolution Rate</span>
                <span className="text-3xl font-extrabold text-emerald-300 mt-1 block">
                  {isLoadingStats ? '...' : `${stats.resolutionRate}%`}
                </span>
                <span className="text-[10px] text-zinc-400 mt-1 block">Verified success %</span>
              </div>

            </div>
          </div>

        </div>
      )}

      {/* TAB 2: EDIT PROFILE */}
      {activeTab === 'edit' && (
        <div className="max-w-2xl bg-zinc-900/90 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-xl animate-in fade-in duration-150">
          <h3 className="text-lg font-bold text-white mb-1">
            Edit Profile Information
          </h3>
          <p className="text-xs text-zinc-400 mb-6">
            Keep your contact details up to date so campus response teams can contact you.
          </p>

          {profileSuccessMsg && (
            <div className="mb-5 p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{profileSuccessMsg}</span>
            </div>
          )}

          {profileErrorMsg && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{profileErrorMsg}</span>
            </div>
          )}

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">Full Name</label>
              <input
                type="text"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">Phone Number</label>
              <input
                type="tel"
                value={editForm.phone}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">Department</label>
                <select
                  value={editForm.department}
                  onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                  className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                >
                  <option value="Computer Science (CSE)">Computer Science (CSE)</option>
                  <option value="Information Technology (IT)">Information Technology (IT)</option>
                  <option value="Electronics & Comm (ECE)">Electronics & Comm (ECE)</option>
                  <option value="Mechanical Engineering">Mechanical Engineering</option>
                  <option value="Civil Engineering">Civil Engineering</option>
                  <option value="Biotechnology">Biotechnology</option>
                  <option value="Electrical Engineering (EEE)">Electrical Engineering (EEE)</option>
                  <option value="Campus Administration">Campus Administration</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">Year</label>
                <select
                  value={editForm.year}
                  onChange={(e) => setEditForm({ ...editForm, year: e.target.value })}
                  className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                >
                  <option value="1">1st Year</option>
                  <option value="2">2nd Year</option>
                  <option value="3">3rd Year</option>
                  <option value="4">4th Year</option>
                  <option value="PG">Postgraduate</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={isUpdatingProfile}
              className="mt-4 px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs shadow-md transition-all flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{isUpdatingProfile ? 'Saving Changes...' : 'Save Profile Details'}</span>
            </button>
          </form>
        </div>
      )}

      {/* TAB 3: CHANGE PASSWORD */}
      {activeTab === 'password' && (
        <div className="max-w-2xl bg-zinc-900/90 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-xl animate-in fade-in duration-150">
          <h3 className="text-lg font-bold text-white mb-1">
            Update Security Password
          </h3>
          <p className="text-xs text-zinc-400 mb-6">
            Ensure your account is protected with a strong, distinct password.
          </p>

          {passSuccessMsg && (
            <div className="mb-5 p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{passSuccessMsg}</span>
            </div>
          )}

          {passErrorMsg && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{passErrorMsg}</span>
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">Current Password</label>
              <input
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">New Password</label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  placeholder="Min 6 characters"
                  className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">Confirm New Password</label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  placeholder="Repeat new password"
                  className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isChangingPass}
              className="mt-4 px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs shadow-md transition-all flex items-center gap-2"
            >
              <Lock className="w-4 h-4" />
              <span>{isChangingPass ? 'Updating...' : 'Update Password'}</span>
            </button>
          </form>
        </div>
      )}

      {/* TAB 4: NOTIFICATIONS */}
      {activeTab === 'notifications' && (
        <div className="max-w-2xl bg-zinc-900/90 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-xl animate-in fade-in duration-150">
          <h3 className="text-lg font-bold text-white mb-1">
            Notification Alert Channels
          </h3>
          <p className="text-xs text-zinc-400 mb-6">
            Configure how you wish to receive updates regarding your ticket milestones.
          </p>

          {notifSuccessMsg && (
            <div className="mb-5 p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{notifSuccessMsg}</span>
            </div>
          )}

          <div className="space-y-4">
            <label className="flex items-center justify-between p-4 rounded-2xl bg-zinc-950 border border-zinc-800 cursor-pointer">
              <div>
                <span className="text-sm font-semibold text-zinc-100 block">Status Change Notifications</span>
                <span className="text-xs text-zinc-400">Receive alerts whenever an admin advances your ticket stage</span>
              </div>
              <input
                type="checkbox"
                checked={notifications.statusChangeAlerts}
                onChange={(e) => setNotifications({ ...notifications, statusChangeAlerts: e.target.checked })}
                className="w-5 h-5 accent-emerald-500 rounded"
              />
            </label>

            <label className="flex items-center justify-between p-4 rounded-2xl bg-zinc-950 border border-zinc-800 cursor-pointer">
              <div>
                <span className="text-sm font-semibold text-zinc-100 block">Email Digest & Audit Trail</span>
                <span className="text-xs text-zinc-400">Receive formal email copy upon complaint resolution</span>
              </div>
              <input
                type="checkbox"
                checked={notifications.emailAlerts}
                onChange={(e) => setNotifications({ ...notifications, emailAlerts: e.target.checked })}
                className="w-5 h-5 accent-emerald-500 rounded"
              />
            </label>

            <label className="flex items-center justify-between p-4 rounded-2xl bg-zinc-950 border border-zinc-800 cursor-pointer">
              <div>
                <span className="text-sm font-semibold text-zinc-100 block">SMS Urgent Alerts</span>
                <span className="text-xs text-zinc-400">Receive SMS notification for P1 Critical complaints</span>
              </div>
              <input
                type="checkbox"
                checked={notifications.smsAlerts}
                onChange={(e) => setNotifications({ ...notifications, smsAlerts: e.target.checked })}
                className="w-5 h-5 accent-emerald-500 rounded"
              />
            </label>

            <button
              onClick={handleSaveNotifications}
              className="mt-4 px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs shadow-md transition-all flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Save Preferences</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
