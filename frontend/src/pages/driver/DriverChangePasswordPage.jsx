import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FleetIcons } from '../../components/FleetIcons';
import Breadcrumb from '../../components/ui/Breadcrumb';

export const DriverChangePasswordPage = () => {
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [error, setError] = useState('');

  const hasMinLength = newPassword.length >= 8;
  const hasUpperCase = /[A-Z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSpecial = /[^A-Za-z0-9]/.test(newPassword);
  const isMatch = newPassword.length > 0 && newPassword === confirmPassword;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!hasMinLength || !hasUpperCase || !hasNumber || !hasSpecial) {
      setError('Please ensure your new password meets all security criteria.');
      return;
    }
    if (!isMatch) {
      setError('Passwords do not match. Please verify your confirmation password.');
      return;
    }
    navigate('/driver/settings/security/success');
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <Breadcrumb
          items={[
            { label: 'Driver', path: '/driver/dashboard' },
            { label: 'Profile', path: '/driver/profile' },
            { label: 'Change Password' },
          ]}
          className="mb-2"
        />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <Link
              to="/driver/profile"
              className="p-2 rounded-xl border border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-300 transition-colors"
              title="Back to Profile"
            >
              <FleetIcons.ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">Change Password</h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-medium mt-1">
                Update your driver tablet login password and authentication PIN
              </p>
            </div>
          </div>

          <Link
            to="/driver/profile"
            className="px-4 py-2 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-xs font-bold rounded-xl transition-colors self-start sm:self-auto"
          >
            Back to Profile
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-2xl flex items-center gap-3 text-red-900 dark:text-red-300 text-xs font-bold animate-in fade-in">
          <FleetIcons.Alert className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-5">
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">Current Password *</label>
          <div className="relative">
            <input
              type={showCurrent ? 'text' : 'password'}
              required
              value={currentPassword}
              onChange={(e) => {
                setCurrentPassword(e.target.value);
                setError('');
              }}
              className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-slate-300 dark:focus:ring-zinc-600 focus:outline-none pr-10"
              placeholder="Enter your current password"
            />
            <button
              type="button"
              onClick={() => setShowCurrent(!showCurrent)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 transition-colors p-1"
            >
              {showCurrent ? <FleetIcons.EyeOff className="w-4 h-4" /> : <FleetIcons.Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">New Password *</label>
          <div className="relative">
            <input
              type={showNew ? 'text' : 'password'}
              required
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                setError('');
              }}
              className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-slate-300 dark:focus:ring-zinc-600 focus:outline-none pr-10"
              placeholder="Enter minimum 8 character password"
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 transition-colors p-1"
            >
              {showNew ? <FleetIcons.EyeOff className="w-4 h-4" /> : <FleetIcons.Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">Confirm New Password *</label>
          <input
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              setError('');
            }}
            className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-slate-300 dark:focus:ring-zinc-600 focus:outline-none"
            placeholder="Confirm new password"
          />
        </div>

        {/* Requirements */}
        <div className="p-4 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-100 dark:border-zinc-800 space-y-2 text-xs">
          <span className="font-bold text-slate-700 dark:text-zinc-300 text-[11px] uppercase tracking-wider">Security Requirements:</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className={`flex items-center gap-2 ${hasMinLength ? 'text-emerald-700 dark:text-emerald-400 font-bold' : 'text-slate-400 dark:text-zinc-500'}`}>
              {hasMinLength ? <FleetIcons.Check className="w-3.5 h-3.5" /> : <span className="w-3.5 h-3.5 rounded-full border border-slate-400 dark:border-zinc-600 inline-block shrink-0"></span>}
              <span>Minimum 8 characters</span>
            </div>
            <div className={`flex items-center gap-2 ${hasUpperCase ? 'text-emerald-700 dark:text-emerald-400 font-bold' : 'text-slate-400 dark:text-zinc-500'}`}>
              {hasUpperCase ? <FleetIcons.Check className="w-3.5 h-3.5" /> : <span className="w-3.5 h-3.5 rounded-full border border-slate-400 dark:border-zinc-600 inline-block shrink-0"></span>}
              <span>At least 1 uppercase letter</span>
            </div>
            <div className={`flex items-center gap-2 ${hasNumber ? 'text-emerald-700 dark:text-emerald-400 font-bold' : 'text-slate-400 dark:text-zinc-500'}`}>
              {hasNumber ? <FleetIcons.Check className="w-3.5 h-3.5" /> : <span className="w-3.5 h-3.5 rounded-full border border-slate-400 dark:border-zinc-600 inline-block shrink-0"></span>}
              <span>At least 1 number (0-9)</span>
            </div>
            <div className={`flex items-center gap-2 ${hasSpecial ? 'text-emerald-700 dark:text-emerald-400 font-bold' : 'text-slate-400 dark:text-zinc-500'}`}>
              {hasSpecial ? <FleetIcons.Check className="w-3.5 h-3.5" /> : <span className="w-3.5 h-3.5 rounded-full border border-slate-400 dark:border-zinc-600 inline-block shrink-0"></span>}
              <span>At least 1 special character (!@#$)</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-zinc-800">
          <Link
            to="/driver/profile"
            className="px-4 py-2.5 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 text-xs font-bold rounded-xl transition-colors text-center"
          >
            Cancel
          </Link>
          <button
            type="submit"
            className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <FleetIcons.Key className="w-4 h-4" />
            <span>Update Password</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default DriverChangePasswordPage;
