import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import { FleetIcons } from '../../components/FleetIcons';
import { RefreshButton } from '../../components/ui/RefreshButton';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { useAuth } from '../../hooks/useAuth';
import { authService } from '../../api/services/auth.service';
import { superDashboardService } from '../../api/services/superadmin/dashboard.service';
import { uploadFile, resolveFileUrl } from '../../api/services/upload.service';
import toast from 'react-hot-toast';

export const SuperProfilePage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, role, permissions: authPermissions, updateProfile, fetchMe, logout } = useAuth();
  const fileInputRef = useRef(null);

  const [activeTab, setActiveTab] = useState('overview');
  const [kpis, setKpis] = useState(null);
  const [kpisLoading, setKpisLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Edit form state
  const [editForm, setEditForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    timezone: user?.timezone || 'Asia/Kolkata',
  });
  const [editSaving, setEditSaving] = useState(false);

  // Security / Password form state
  const [pwForm, setPwForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);
  const [pwError, setPwError] = useState('');

  // Search filter for permissions tab
  const [permSearch, setPermSearch] = useState('');

  // Sync edit form when user updates
  useEffect(() => {
    if (user) {
      setEditForm({
        name: user.name || '',
        phone: user.phone || '',
        timezone: user.timezone || 'Asia/Kolkata',
      });
    }
  }, [user]);

  // Load fresh session and real DB KPIs on mount
  const refreshData = useCallback(async () => {
    try {
      if (fetchMe) fetchMe();
    } catch (_) {}

    try {
      setKpisLoading(true);
      const res = await superDashboardService.getSuperAdminKpis();
      if (res) setKpis(res);
    } catch (_) {
      // Non-blocking fallback
    } finally {
      setKpisLoading(false);
    }
  }, [fetchMe]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Profile Picture Upload Handler
  const handleAvatarFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file (JPG, PNG, WEBP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be under 5MB.');
      return;
    }

    setUploadingAvatar(true);
    const toastId = toast.loading('Uploading profile picture...');

    try {
      const uploadRes = await uploadFile(file, 'profile_avatar');
      const avatarUrl = uploadRes?.url || uploadRes?.fileUrl || uploadRes?.path || uploadRes;

      if (!avatarUrl) {
        throw new Error('Upload succeeded but no image URL was returned.');
      }

      await updateProfile({
        avatar_url: avatarUrl,
        avatarUrl: avatarUrl,
      });

      if (fetchMe) await fetchMe();
      toast.success('Profile picture updated successfully!', { id: toastId });
    } catch (err) {
      toast.error(err?.message || 'Failed to upload profile picture.', { id: toastId });
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Remove Profile Picture Handler
  const handleRemoveAvatar = async () => {
    setUploadingAvatar(true);
    const toastId = toast.loading('Removing profile picture...');
    try {
      await updateProfile({
        avatar_url: null,
        avatarUrl: null,
      });
      if (fetchMe) await fetchMe();
      toast.success('Profile picture removed!', { id: toastId });
    } catch (err) {
      toast.error(err?.message || 'Failed to remove picture.', { id: toastId });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditSaving(true);
    try {
      await toast.promise(
        updateProfile({
          name: editForm.name,
          phone: editForm.phone,
          timezone: editForm.timezone,
        }),
        {
          loading: 'Updating profile details...',
          success: 'Profile updated successfully!',
          error: (err) => err?.message || 'Failed to update profile.',
        }
      );
      if (fetchMe) fetchMe();
      setActiveTab('overview');
    } catch (_) {
    } finally {
      setEditSaving(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPwError('');

    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwError('New passwords do not match');
      return;
    }
    if (pwForm.newPassword.length < 8) {
      setPwError('Password must be at least 8 characters long');
      return;
    }

    setPwSaving(true);
    try {
      await toast.promise(
        authService.changePassword({
          currentPassword: pwForm.currentPassword,
          newPassword: pwForm.newPassword,
        }),
        {
          loading: 'Updating password...',
          success: 'Password updated successfully!',
          error: (err) => err?.message || 'Failed to change password.',
        }
      );
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setActiveTab('overview');
    } catch (err) {
      setPwError(err?.message || 'Password update failed.');
    } finally {
      setPwSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (_) {
      // Clear anyway
    }
    navigate('/login', { replace: true });
  };

  const userName = user?.name || 'Super Admin';
  const userEmail = user?.email || 'admin@vmovexa.com';
  const userPhone = user?.phone || '—';
  const userCode = user?.enrollment_no || user?.code || 'VMX-SA-001';
  const roleName = user?.role?.name || (typeof role === 'string' ? role : 'Super Admin');
  const timezone = user?.timezone || 'Asia/Kolkata';
  const status = user?.status || 'active';
  const isActive = status.toLowerCase() === 'active';
  const avatarUrl = user?.avatar_url || user?.avatarUrl;

  // Extract all permissions from DB
  const rawPerms = (user?.permissions && user.permissions.length > 0)
    ? user.permissions
    : (authPermissions || []);

  const permissionsList = rawPerms.map((p) => {
    if (typeof p === 'string') return { key: p, label: p.replace(/_/g, ' ').toUpperCase() };
    return { key: p.key || p.name, label: p.label || p.name || p.key };
  });

  const filteredPermissions = permissionsList.filter((p) =>
    p.key.toLowerCase().includes(permSearch.toLowerCase()) ||
    p.label.toLowerCase().includes(permSearch.toLowerCase())
  );

  // Real KPI stats from MySQL
  const totalTenants = kpis?.totalTenants ?? kpis?.tenants?.total ?? 0;
  const activeTenants = kpis?.activeTenants ?? kpis?.tenants?.active ?? 0;
  const centralTechs = kpis?.centralTechniciansCount ?? 0;
  const totalUsers = kpis?.totalUsers ?? kpis?.users?.total ?? 0;

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200">
      {/* Hidden File Input for Avatar */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleAvatarFileSelect}
        accept="image/png, image/jpeg, image/webp"
        className="hidden"
      />

      {/* Standard Reusable Breadcrumb */}
      <Breadcrumb
        items={[
          { label: 'SuperAdmin', to: '/superadmin/dashboard' },
          { label: 'Super Admin Profile' },
        ]}
      />

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Super Admin Profile
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-900/50">
              Root Access
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-1">
            Manage your account settings, personal profile picture, security, and view platform metrics.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <RefreshButton
            onClick={refreshData}
            loading={kpisLoading}
            label="Refresh Data"
            title="Refresh profile and metrics"
          />
          <button
            onClick={() => setActiveTab('edit')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <FleetIcons.Settings className="w-4 h-4" />
            <span>Edit Profile</span>
          </button>
        </div>
      </div>

      {/* User Card Banner */}
      <div className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center gap-5">
        {/* Profile Avatar Frame with Interactive Camera Badge */}
        <div className="relative group shrink-0">
          <div className="w-20 h-20 rounded-2xl overflow-hidden bg-blue-600 text-white shadow-md flex items-center justify-center text-3xl font-bold border-2 border-slate-200 dark:border-zinc-700">
            {avatarUrl ? (
              <img
                src={resolveFileUrl(avatarUrl)}
                alt={userName}
                className="w-full h-full object-cover"
              />
            ) : (
              <span>{userName.charAt(0).toUpperCase()}</span>
            )}
          </div>

          {/* Camera Upload Overlay Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingAvatar}
            className="absolute -bottom-1.5 -right-1.5 p-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-zinc-900 shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer border border-white dark:border-zinc-900"
            title="Upload new profile picture"
          >
            {uploadingAvatar ? (
              <span className="w-3.5 h-3.5 border-2 border-white dark:border-zinc-900 border-t-transparent rounded-full animate-spin block" />
            ) : (
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            )}
          </button>
        </div>

        <div className="flex-1 space-y-1 min-w-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">{userName}</h2>
            <span className="text-xs font-mono font-medium px-2 py-0.5 bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 rounded-md border border-slate-200 dark:border-zinc-700">
              {userCode}
            </span>
            <span
              className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                isActive
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50'
                  : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-900/50'
              }`}
            >
              {status.toUpperCase()}
            </span>
          </div>

          <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
            {roleName} · VMOVEXA Platform Administrator
          </p>

          <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-zinc-400 font-medium flex-wrap pt-1">
            <span>Email: <strong className="font-mono text-slate-900 dark:text-zinc-200">{userEmail}</strong></span>
            <span>·</span>
            <span>Phone: <strong className="text-slate-900 dark:text-zinc-200">{userPhone}</strong></span>
            <span>·</span>
            <span>Timezone: <strong className="text-slate-900 dark:text-zinc-200">{timezone}</strong></span>
          </div>

          {/* Quick Avatar Action Buttons */}
          <div className="pt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingAvatar}
              className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              📷 {avatarUrl ? 'Change Photo' : 'Upload Photo'}
            </button>
            {avatarUrl && (
              <>
                <span className="text-slate-300 dark:text-zinc-700">·</span>
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  disabled={uploadingAvatar}
                  className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
                >
                  🗑️ Remove Photo
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-zinc-400">
            Total Organizations
          </span>
          <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">
            {kpisLoading ? '…' : totalTenants}
          </div>
        </div>
        <div className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
            Active Organizations
          </span>
          <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            {kpisLoading ? '…' : activeTenants}
          </div>
        </div>
        <div className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
            Central Technicians
          </span>
          <div className="text-xl font-bold text-blue-600 dark:text-blue-400 mt-1">
            {kpisLoading ? '…' : centralTechs}
          </div>
        </div>
        <div className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-purple-600 dark:text-purple-400">
            Total Platform Users
          </span>
          <div className="text-xl font-bold text-purple-600 dark:text-purple-400 mt-1">
            {kpisLoading ? '…' : totalUsers}
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-zinc-800 pb-2 overflow-x-auto no-scrollbar">
        {[
          { key: 'overview', label: 'Overview' },
          { key: 'edit', label: 'Edit Profile' },
          { key: 'permissions', label: `Permissions (${permissionsList.length})` },
          { key: 'security', label: 'Password & Security' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === tab.key
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Account Details Card */}
            <div className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white border-b border-slate-100 dark:border-zinc-800 pb-2.5 flex items-center gap-2">
                <span>👤</span> Account Details
              </h3>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-50 dark:border-zinc-800/50">
                  <span className="text-slate-500 dark:text-zinc-400 font-medium">Full Name</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{userName}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50 dark:border-zinc-800/50">
                  <span className="text-slate-500 dark:text-zinc-400 font-medium">Email Address</span>
                  <span className="font-mono font-medium text-slate-900 dark:text-white">{userEmail}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50 dark:border-zinc-800/50">
                  <span className="text-slate-500 dark:text-zinc-400 font-medium">Phone Number</span>
                  <span className="font-medium text-slate-900 dark:text-white">{userPhone}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50 dark:border-zinc-800/50">
                  <span className="text-slate-500 dark:text-zinc-400 font-medium">User Code</span>
                  <span className="font-mono font-semibold text-blue-600 dark:text-blue-400">{userCode}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50 dark:border-zinc-800/50">
                  <span className="text-slate-500 dark:text-zinc-400 font-medium">Timezone</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{timezone}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500 dark:text-zinc-400 font-medium">System Language</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{user?.language?.name || 'English'}</span>
                </div>
              </div>
            </div>

            {/* Security Overview Card */}
            <div className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white border-b border-slate-100 dark:border-zinc-800 pb-2.5 flex items-center gap-2">
                <span>🛡️</span> Security & Standing
              </h3>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-50 dark:border-zinc-800/50">
                  <span className="text-slate-500 dark:text-zinc-400 font-medium">Assigned Role</span>
                  <span className="font-semibold text-blue-600 dark:text-blue-400">{roleName}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50 dark:border-zinc-800/50">
                  <span className="text-slate-500 dark:text-zinc-400 font-medium">Account Status</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">Active</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50 dark:border-zinc-800/50">
                  <span className="text-slate-500 dark:text-zinc-400 font-medium">Last Login</span>
                  <span className="font-mono text-slate-800 dark:text-zinc-200">
                    {user?.last_login_at ? new Date(user.last_login_at).toLocaleString() : 'Current Session'}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50 dark:border-zinc-800/50">
                  <span className="text-slate-500 dark:text-zinc-400 font-medium">IP Address</span>
                  <span className="font-mono text-slate-700 dark:text-zinc-300">{user?.last_login_ip || '127.0.0.1'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50 dark:border-zinc-800/50">
                  <span className="text-slate-500 dark:text-zinc-400 font-medium">MFA Status</span>
                  <span className="font-semibold text-slate-800 dark:text-zinc-200">
                    {user?.mfa_enabled ? 'Enabled' : 'Disabled (Password Only)'}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500 dark:text-zinc-400 font-medium">Permissions Granted</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">
                    {permissionsList.length} Active
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Hub Links (Vibrant Cards with White High-Contrast Text) */}
          <div className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Platform Configuration Hub
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <Link
                to="/superadmin/settings"
                className="p-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all flex items-center justify-between group cursor-pointer border border-blue-500/30"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-white/20 text-white backdrop-blur-sm border border-white/30 shrink-0">
                    <FleetIcons.Settings className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-bold text-white text-xs tracking-wide">Account Settings</span>
                </div>
                <span className="text-white/80 group-hover:text-white group-hover:translate-x-1 font-bold text-sm transition-all">→</span>
              </Link>

              <Link
                to="/superadmin/settings/security"
                className="p-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md hover:shadow-lg transition-all flex items-center justify-between group cursor-pointer border border-indigo-500/30"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-white/20 text-white backdrop-blur-sm border border-white/30 shrink-0">
                    <FleetIcons.Key className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-bold text-white text-xs tracking-wide">Key & Password</span>
                </div>
                <span className="text-white/80 group-hover:text-white group-hover:translate-x-1 font-bold text-sm transition-all">→</span>
              </Link>

              <Link
                to="/superadmin/roles"
                className="p-4 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-md hover:shadow-lg transition-all flex items-center justify-between group cursor-pointer border border-purple-500/30"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-white/20 text-white backdrop-blur-sm border border-white/30 shrink-0">
                    <FleetIcons.Shield className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-bold text-white text-xs tracking-wide">RBAC & Roles</span>
                </div>
                <span className="text-white/80 group-hover:text-white group-hover:translate-x-1 font-bold text-sm transition-all">→</span>
              </Link>

              <Link
                to="/superadmin/activity"
                className="p-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:opacity-95 text-white shadow-md hover:shadow-lg transition-all flex items-center justify-between group cursor-pointer border border-blue-500/30"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-white/20 text-white backdrop-blur-sm border border-white/30 shrink-0">
                    <FleetIcons.Document className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-bold text-white text-xs tracking-wide">Audit Logs</span>
                </div>
                <span className="text-white/80 group-hover:text-white group-hover:translate-x-1 font-bold text-sm transition-all">→</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Edit Profile Form */}
      {activeTab === 'edit' && (
        <form onSubmit={handleEditSubmit} className="space-y-6">
          <div className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs space-y-5">
            <div className="border-b border-slate-100 dark:border-zinc-800 pb-3">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Personal Information & Avatar
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                Update your display picture, full name, phone number, and timezone.
              </p>
            </div>

            {/* Profile Picture Upload Box */}
            <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-zinc-900/60 rounded-xl border border-slate-200/80 dark:border-zinc-800">
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-blue-600 text-white shadow-sm shrink-0 flex items-center justify-center text-2xl font-bold border border-slate-300 dark:border-zinc-700">
                {avatarUrl ? (
                  <img
                    src={resolveFileUrl(avatarUrl)}
                    alt={userName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{userName.charAt(0).toUpperCase()}</span>
                )}
              </div>

              <div className="space-y-1 text-xs">
                <span className="font-bold text-slate-900 dark:text-white block">Profile Avatar Image</span>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                  Recommended resolution 300x300px. JPG, PNG or WEBP up to 5MB.
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingAvatar}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-all cursor-pointer inline-flex items-center gap-1.5 disabled:opacity-60"
                  >
                    <span>📷 {avatarUrl ? 'Change Image' : 'Upload Image'}</span>
                  </button>
                  {avatarUrl && (
                    <button
                      type="button"
                      onClick={handleRemoveAvatar}
                      disabled={uploadingAvatar}
                      className="px-3 py-1.5 bg-slate-100 dark:bg-zinc-800 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 text-slate-700 dark:text-zinc-300 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                  Email Address (Fixed)
                </label>
                <input
                  type="email"
                  readOnly
                  value={userEmail}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs font-mono font-medium text-slate-500 dark:text-zinc-400 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                  Timezone
                </label>
                <select
                  value={editForm.timezone}
                  onChange={(e) => setEditForm({ ...editForm, timezone: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="Asia/Kolkata">Asia/Kolkata (IST - UTC+05:30)</option>
                  <option value="UTC">UTC (Coordinated Universal Time)</option>
                  <option value="America/New_York">America/New_York (EST)</option>
                  <option value="Europe/London">Europe/London (GMT/BST)</option>
                  <option value="Asia/Dubai">Asia/Dubai (GST - UTC+04:00)</option>
                  <option value="Asia/Singapore">Asia/Singapore (SGT - UTC+08:00)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setActiveTab('overview')}
              className="px-4 py-2.5 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={editSaving}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-all flex items-center gap-2 disabled:opacity-60 cursor-pointer"
            >
              <FleetIcons.Check className="w-4 h-4" />
              <span>{editSaving ? 'Saving Changes...' : 'Save Profile'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Tab 3: Permissions Matrix */}
      {activeTab === 'permissions' && (
        <div className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-zinc-800 pb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Role Permissions</h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">Permissions assigned to your Super Admin role</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={permSearch}
                onChange={(e) => setPermSearch(e.target.value)}
                placeholder="Search permissions..."
                className="px-3 py-1.5 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
              <span className="px-2.5 py-1 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 text-xs font-semibold border border-blue-200 dark:border-blue-900/50 whitespace-nowrap">
                {filteredPermissions.length} Active
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
            {filteredPermissions.map((perm, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl border border-slate-200 dark:border-zinc-800/80 bg-slate-50/60 dark:bg-zinc-900/40 flex items-start gap-2.5"
              >
                <span className="text-emerald-600 dark:text-emerald-400 font-bold text-sm shrink-0">✓</span>
                <div className="min-w-0">
                  <div className="font-semibold text-xs text-slate-900 dark:text-white truncate">
                    {perm.label}
                  </div>
                  <div className="font-mono text-[10px] text-slate-400 dark:text-zinc-500 truncate">
                    {perm.key}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Security & Password */}
      {activeTab === 'security' && (
        <div className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs space-y-5">
          <div className="border-b border-slate-100 dark:border-zinc-800 pb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Change Password</h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">Ensure your account uses a strong, unique password.</p>
          </div>

          {pwError && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs font-semibold text-rose-700 dark:text-rose-300 rounded-xl">
              {pwError}
            </div>
          )}

          <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-xl">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                Current Password *
              </label>
              <div className="relative">
                <input
                  type={showCurrent ? 'text' : 'password'}
                  required
                  value={pwForm.currentPassword}
                  onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })}
                  placeholder="Enter current password"
                  className="w-full pl-3.5 pr-10 py-2.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 text-xs font-medium cursor-pointer"
                >
                  {showCurrent ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                New Password *
              </label>
              <div className="relative">
                <input
                  type={showNew ? 'text' : 'password'}
                  required
                  value={pwForm.newPassword}
                  onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })}
                  placeholder="Minimum 8 characters"
                  className="w-full pl-3.5 pr-10 py-2.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 text-xs font-medium cursor-pointer"
                >
                  {showNew ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                Confirm New Password *
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  required
                  value={pwForm.confirmPassword}
                  onChange={(e) => setPwForm({ ...pwForm, confirmPassword: e.target.value })}
                  placeholder="Re-enter new password"
                  className="w-full pl-3.5 pr-10 py-2.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 text-xs font-medium cursor-pointer"
                >
                  {showConfirm ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <button
                type="submit"
                disabled={pwSaving}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-all flex items-center gap-2 disabled:opacity-60 cursor-pointer"
              >
                <FleetIcons.Key className="w-4 h-4" />
                <span>{pwSaving ? 'Updating Password...' : 'Update Password'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Logout Row */}
      <div className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <span className="text-xs text-slate-500 dark:text-zinc-400 font-medium text-center sm:text-left">
          Logged in as <strong className="text-slate-800 dark:text-zinc-200 font-mono">{userEmail}</strong>
        </span>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50 text-xs font-semibold rounded-xl transition-colors text-center cursor-pointer"
        >
          Logout Session
        </button>
      </div>
    </div>
  );
};

export default SuperProfilePage;
