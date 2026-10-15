import React, { useRef, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FleetIcons } from '../../components/FleetIcons';
import { useAuth } from '../../hooks/useAuth';
import { useAdminDashboard } from '../../hooks/admin/useAdminDashboard';
import { uploadFile, resolveFileUrl } from '../../api/services/upload.service';
import Breadcrumb from '../../components/ui/Breadcrumb';

export const AdminProfilePage = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const { user, updateProfile, fetchMe, logout } = useAuth();
  const { kpis, loadKpis } = useAdminDashboard();
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    loadKpis().catch(() => {});
  }, [loadKpis]);

  const orgName = user?.organization?.name || user?.org?.name || '';
  const rawAvatarUrl = user?.avatar_url || user?.avatarUrl || user?.avatar;
  const avatarSrc = rawAvatarUrl
    ? resolveFileUrl(rawAvatarUrl)
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Admin')}&background=0f172a&color=ffffff`;

  const handleLogout = async () => {
    try { await logout(); } catch { /* ignore */ }
    navigate('/login');
  };

  const handleAvatarFileChange = async (e) => {
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

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200">
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleAvatarFileChange}
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-4">
        <div>
          <Breadcrumb
            items={[
              { label: 'Dashboard', to: '/admin/dashboard' },
              { label: 'Admin Profile' }
            ]}
            className="mb-2"
          />
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-zinc-100 tracking-tight">Organization Admin Profile</h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-medium mt-1">
            Tenant partition identity, corporate registrations, and administrative credentials
          </p>
        </div>

        <Link
          to="/admin/settings"
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all self-start sm:self-auto flex items-center gap-1.5"
        >
          <FleetIcons.Settings className="w-4 h-4" />
          <span>Edit Profile</span>
        </Link>
      </div>

      {/* Hero Profile Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-5">
        <div className="relative group shrink-0">
          <img
            src={avatarSrc}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Admin')}&background=0f172a&color=ffffff`;
            }}
            alt={user?.name ?? ''}
            className="w-20 h-20 rounded-2xl object-cover border-2 border-slate-200 shadow-md bg-slate-100"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingAvatar}
            className="absolute inset-0 bg-slate-900/60 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[11px] font-bold gap-1 backdrop-blur-xs disabled:opacity-50"
            title="Change Photo"
          >
            <span>📷</span>
          </button>
        </div>

        <div className="flex-1 space-y-2 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-lg font-black text-slate-900">{user?.name ?? ''}</h2>
            <span className="text-[11px] font-bold px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
              {user?.status ?? 'Active'}
            </span>
          </div>

          <p className="text-xs font-medium text-slate-600">
            {orgName || '—'}
          </p>

          <div className="flex items-center gap-4 text-xs text-slate-500 font-medium flex-wrap pt-1">
            <span>Admin Email: <strong className="font-mono text-slate-800">{user?.email ?? ''}</strong></span>
            <span>·</span>
            <span>Mobile: <strong className="text-slate-800">{user?.phone ?? '—'}</strong></span>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingAvatar}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1"
            >
              <span>📷 {rawAvatarUrl ? 'Change Profile Picture' : 'Upload Profile Picture'}</span>
            </button>

            {rawAvatarUrl && (
              <button
                onClick={handleRemoveAvatar}
                disabled={uploadingAvatar}
                className="text-xs font-bold text-red-600 hover:text-red-700 hover:underline"
              >
                Remove Picture
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 4 Stat Strip — Dynamic from Real KPI Endpoint */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Fleet</span>
          <div className="text-xl font-black text-slate-900 mt-1">
            {kpis?.totalBuses !== undefined ? `${kpis.totalBuses} Buses` : '—'}
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">Active Displays</span>
          <div className="text-xl font-black text-blue-700 mt-1">
            {kpis?.activeDisplays !== undefined ? `${kpis.activeDisplays} Screens` : '—'}
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">Ad Revenue Split</span>
          <div className="text-xl font-black text-emerald-700 mt-1">
            {kpis?.tenantMonthlyRevenueShare !== undefined
              ? `₹ ${Number(kpis.tenantMonthlyRevenueShare || 0).toLocaleString('en-IN')}`
              : '35% Cut'}
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600">Licensed Drivers</span>
          <div className="text-xl font-black text-purple-700 mt-1">
            {kpis?.totalDrivers !== undefined ? `${kpis.totalDrivers} Drivers` : '—'}
          </div>
        </div>
      </div>

      {/* Navigation Hub */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">Organization Profile</h3>
          <div className="space-y-2.5 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center">
              <span className="text-slate-400">Organization:</span>
              <span className="font-bold text-slate-800 text-right">{orgName || '—'}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center">
              <span className="text-slate-400">Admin Name:</span>
              <span className="font-medium text-slate-800 text-right">{user?.name ?? '—'}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center">
              <span className="text-slate-400">Email:</span>
              <span className="font-mono font-bold text-slate-800">{user?.email ?? '—'}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center">
              <span className="text-slate-400">Role:</span>
              <span className="font-bold text-slate-800">{typeof user?.role === 'object' ? (user?.role?.name ?? '—') : (user?.role ?? '—')}</span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">Account & Security Hub</h3>
          {[
            { label: 'Tenant Profile & Contact Settings', path: '/admin/settings', icon: <FleetIcons.Settings className="w-4 h-4" /> },
            { label: 'Admin Security Password & 2FA', path: '/admin/settings/security', icon: <FleetIcons.Key className="w-4 h-4" /> },
            { label: 'Operational Alert Preferences', path: '/admin/settings/notifications', icon: <FleetIcons.Bell className="w-4 h-4" /> },
            { label: 'Tenant Manuals & Dispatch Guide', path: '/admin/help', icon: <FleetIcons.Help className="w-4 h-4" /> },
            { label: 'Central Support Ticket History', path: '/admin/help/history', icon: <FleetIcons.Ticket className="w-4 h-4" /> },
            { label: 'Tenant Privacy & Partition Policy', path: '/admin/privacy', icon: <FleetIcons.Shield className="w-4 h-4" /> },
            { label: 'Enterprise Operating Terms', path: '/admin/terms', icon: <FleetIcons.Document className="w-4 h-4" /> },
          ].map((item, idx) => (
            <Link
              key={idx}
              to={item.path}
              className="p-3 rounded-xl hover:bg-slate-50 flex items-center justify-between text-xs font-bold text-slate-800 group transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <span className="text-slate-400 group-hover:text-blue-600 transition-colors">{item.icon}</span>
                <span>{item.label}</span>
              </div>
              <span className="text-slate-400 group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Logout Row */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <span className="text-xs text-slate-500 font-medium text-center sm:text-left">
          Organization session active on this console
        </span>
        <button
          onClick={handleLogout}
          className="px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold rounded-xl transition-colors text-center"
        >
          Logout Admin Session
        </button>
      </div>
    </div>
  );
};
