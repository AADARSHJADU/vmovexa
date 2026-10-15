import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import { resolveFileUrl, uploadFile } from '../../api/services/upload.service';
import Breadcrumb from '../../components/ui/Breadcrumb';

export const AdvertiserSettingsPage = () => {
  const navigate = useNavigate();
  const { user, updateProfile } = useAuth();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    mobile: '',
    empId: '',
    role: '',
    companyName: '',
    branch: '',
    address: '',
    language: 'en',
    timeZone: 'Asia/Kolkata',
  });

  const [avatarUrl, setAvatarUrl] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (user) {
      const userLangCode = user.language?.code || (user.language_id === 2 ? 'hi' : user.language_id === 4 ? 'kn' : user.language_id === 3 ? 'mr' : 'en');
      setFormData({
        fullName: user.name || user.fullName || '',
        email: user.email || '',
        mobile: user.phone || user.mobile || '',
        empId: user.advertiser?.code || user.enrollment_no || user.code || (user.id ? `ADV-${user.id}` : 'ADV-001'),
        role: user.role?.name || user.role || 'Media Advertiser',
        companyName: user.advertiser?.company_name || user.advertiser?.name || user.organization?.name || user.company_name || user.companyName || '',
        branch: user.branch || user.city || 'Regional Advertising Desk',
        address: user.advertiser?.address || user.organization?.office_address || user.address || '',
        language: userLangCode,
        timeZone: user.timezone || 'Asia/Kolkata',
      });
      setAvatarUrl(user.avatar_url || user.avatarUrl || '');
    }
  }, [user]);

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingPhoto(true);
      const uploaded = await uploadFile(file, 'avatar');
      const url = uploaded?.url || uploaded?.file_url || (typeof uploaded === 'string' ? uploaded : null);
      if (url) {
        setAvatarUrl(url);
        toast.success('Photo uploaded! Click "Save Changes" to save profile.');
      }
    } catch {
      toast.error('Failed to upload photo');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSave = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    try {
      await toast.promise(
        updateProfile({
          name: formData.fullName,
          email: formData.email,
          phone: formData.mobile,
          avatar_url: avatarUrl,
          companyName: formData.companyName,
          branch: formData.branch,
          address: formData.address,
          language: formData.language,
          timeZone: formData.timeZone,
        }),
        {
          loading: 'Saving profile changes...',
          success: 'Profile updated successfully!',
          error: (err) => err?.message || 'Failed to update profile',
        }
      );
      setSaved(true);
      setTimeout(() => navigate('/advertiser/profile'), 1000);
    } catch {
      /* toast handles error */
    }
  };

  const currentAvatarSrc = avatarUrl
    ? resolveFileUrl(avatarUrl)
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.fullName || 'Advertiser')}&background=0f172a&color=ffffff`;

  return (
    <div className="w-full space-y-6 pb-20">
      {/* 1. Header Banner */}
      <div className="w-full flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 sm:p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm">
        <div>
          <Breadcrumb
            items={[
              { label: 'Dashboard', to: '/advertiser/dashboard' },
              { label: 'Profile', to: '/advertiser/profile' },
              { label: 'Account Settings' }
            ]}
            className="mb-2"
          />
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-zinc-100 tracking-tight">Account Settings</h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">Manage advertiser credentials, contact info, brand billing address, and preferences.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/advertiser/profile')}
            className="px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20 cursor-pointer"
          >
            {saved ? '✓ Saved!' : '💾 Save Changes'}
          </button>
        </div>
      </div>

      {/* 2. Photo Upload Section matching Fleet Manager */}
      <div className="p-6 md:p-8 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img
            src={currentAvatarSrc}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.fullName || 'Advertiser')}&background=0f172a&color=ffffff`;
            }}
            alt={formData.fullName || 'User'}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-200 shadow-md bg-slate-100"
          />
          <div>
            <h3 className="text-sm font-bold text-slate-900">Brand Representative Avatar</h3>
            <p className="text-xs text-slate-500 mt-0.5">PNG or JPG up to 2MB. Displayed across campaign approvals and invoices.</p>
          </div>
        </div>

        <label className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
            disabled={uploadingPhoto}
          />
          <span>📷</span>
          <span>{uploadingPhoto ? 'Uploading...' : 'Change Photo'}</span>
        </label>
      </div>

      {/* 3. Form Containers matching Fleet Manager */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Personal Information */}
        <div className="p-6 md:p-8 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-5">
          <div className="pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                1. Personal Information
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Full Name</label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Email Address</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Mobile Number</label>
              <input
                type="text"
                value={formData.mobile}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                className="w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Advertiser Account Code</label>
              <input
                type="text"
                disabled
                value={formData.empId}
                className="w-full h-11 px-3.5 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-500 font-mono font-bold"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Organization Information */}
        <div className="p-6 md:p-8 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-5">
          <div className="pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-600"></span>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                2. Brand / Agency Information
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Company Legal Name</label>
              <input
                type="text"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                className="w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Branch / Media Division</label>
              <input
                type="text"
                value={formData.branch}
                onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                className="w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-medium"
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold text-slate-700">Office Billing Address</label>
              <textarea
                rows={2}
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-medium"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Preferences */}
        <div className="p-6 md:p-8 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-5">
          <div className="pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                3. Regional Preferences & Analytics Timezone
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Language</label>
              <select
                value={formData.language}
                onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                className="w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-medium"
              >
                <option value="en">English (India)</option>
                <option value="hi">Hindi (हिंदी)</option>
                <option value="kn">Kannada (ಕನ್ನಡ)</option>
                <option value="mr">Marathi (मराठी)</option>
                <option value="te">Telugu (తెలుగు)</option>
                <option value="ta">Tamil (தமிழ்)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Time Zone</label>
              <select
                value={formData.timeZone}
                onChange={(e) => setFormData({ ...formData, timeZone: e.target.value })}
                className="w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-medium"
              >
                <option value="Asia/Kolkata">Asia/Kolkata (IST +05:30)</option>
                <option value="UTC">UTC (GMT +00:00)</option>
                <option value="America/New_York">America/New_York (EST -05:00)</option>
                <option value="Europe/London">Europe/London (BST +01:00)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Bottom Save Bar */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => navigate('/advertiser/profile')}
            className="px-6 py-3 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20"
          >
            {saved ? '✓ Saved!' : '💾 Save Account Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdvertiserSettingsPage;
