import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FleetIcons } from '../../components/FleetIcons';
import { useAuth } from '../../hooks/useAuth';
import { uploadFile, resolveFileUrl } from '../../api/services/upload.service';
import Breadcrumb from '../../components/ui/Breadcrumb';

export const AdminAccountSettingsPage = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const { user, updateProfile, fetchMe } = useAuth();
  const orgName = user?.organization?.name || user?.org?.name || '';
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    timezone: user?.timezone || 'Asia/Kolkata',
    language_id: user?.language_id || 1,
  });

  useEffect(() => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      timezone: user?.timezone || 'Asia/Kolkata',
      language_id: user?.language_id || 1,
    });
  }, [user]);

  const rawAvatarUrl = user?.avatar_url || user?.avatarUrl || user?.avatar;
  const avatarSrc = rawAvatarUrl
    ? resolveFileUrl(rawAvatarUrl)
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Admin')}&background=0f172a&color=ffffff`;

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
    const toastId = toast.loading('Uploading profile photo...');

    try {
      const uploadRes = await uploadFile(file, 'profile_avatar');
      const avatarUrl = uploadRes?.url || uploadRes?.fileUrl || uploadRes?.path || uploadRes;

      if (!avatarUrl) {
        throw new Error('Upload succeeded but no image URL returned.');
      }

      await updateProfile({
        avatar_url: avatarUrl,
        avatarUrl: avatarUrl,
      });

      if (fetchMe) await fetchMe();
      toast.success('Profile picture updated!', { id: toastId });
    } catch (err) {
      toast.error(err?.message || 'Failed to upload photo', { id: toastId });
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveAvatar = async () => {
    setUploadingAvatar(true);
    const toastId = toast.loading('Removing photo...');
    try {
      await updateProfile({ avatar_url: null, avatarUrl: null });
      if (fetchMe) await fetchMe();
      toast.success('Profile picture removed!', { id: toastId });
    } catch (err) {
      toast.error(err?.message || 'Failed to remove picture', { id: toastId });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await toast.promise(
        updateProfile({
          name: formData.name,
          phone: formData.phone,
          timezone: formData.timezone,
        }),
        {
          loading: 'Saving profile settings...',
          success: 'Account settings saved successfully!',
          error: (err) => err?.message || 'Failed to save settings',
        }
      );
      if (fetchMe) await fetchMe();
      navigate('/admin/profile');
    } catch {
      /* handled by toast */
    } finally {
      setSaving(false);
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
              { label: 'Admin Profile', to: '/admin/profile' },
              { label: 'Account Settings' }
            ]}
            className="mb-2"
          />
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-zinc-100 tracking-tight">Tenant Account Settings</h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-medium mt-0.5">
            Update organization contact info, administrator profile, avatar picture, and system preferences
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Avatar & Photo Section */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">Administrator Avatar</h2>
            <p className="text-xs text-slate-500 font-medium">Display picture shown across organization dispatch logs</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-5">
            <div className="relative group shrink-0">
              <img
                src={avatarSrc}
                alt={formData.name}
                className="w-24 h-24 rounded-2xl object-cover border-2 border-slate-200 shadow-md"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="absolute inset-0 bg-slate-900/60 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1 backdrop-blur-xs disabled:opacity-50"
              >
                <span>📷 Change</span>
              </button>
            </div>

            <div className="space-y-2 text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
                >
                  {uploadingAvatar ? 'Uploading...' : '📷 Upload New Avatar'}
                </button>

                {rawAvatarUrl && (
                  <button
                    type="button"
                    onClick={handleRemoveAvatar}
                    disabled={uploadingAvatar}
                    className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold rounded-xl transition-colors"
                  >
                    Remove Photo
                  </button>
                )}
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                Supports JPG, PNG or WEBP up to 5MB.
              </p>
            </div>
          </div>
        </div>

        {/* Organization Identity */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">Organization Identity & Administrator</h2>
            <p className="text-xs text-slate-500 font-medium">Official tenant corporate details and contact info</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Organization / Tenant</label>
              <input
                type="text"
                readOnly
                value={orgName || 'VMOVEXA Organization'}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Administrator Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-slate-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Admin Login Email (Username)</label>
              <input
                type="email"
                readOnly
                value={formData.email}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-600 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Official Phone Number</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-slate-400"
                placeholder="+91 98765 43210"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">System Timezone</label>
              <select
                value={formData.timezone}
                onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-slate-400"
              >
                <option value="Asia/Kolkata">Asia/Kolkata (IST - UTC+05:30)</option>
                <option value="UTC">UTC (Coordinated Universal Time)</option>
                <option value="America/New_York">America/New_York (EST - UTC-05:00)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Primary Language</label>
              <select
                value={formData.language_id}
                onChange={(e) => setFormData({ ...formData, language_id: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-slate-400"
              >
                <option value={1}>English (en)</option>
                <option value={2}>Hindi (hi)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <Link
            to="/admin/profile"
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors text-center"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving || uploadingAvatar}
            className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
          >
            <FleetIcons.Check className="w-4 h-4" />
            <span>{saving ? 'Saving Settings...' : 'Save Tenant Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

