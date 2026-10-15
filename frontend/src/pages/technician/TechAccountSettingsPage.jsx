import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import { resolveFileUrl, uploadFile } from '../../api/services/upload.service';
import Breadcrumb from '../../components/ui/Breadcrumb';
import { FleetIcons } from '../../components/FleetIcons';

export const TechAccountSettingsPage = () => {
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
    language: 'English (India)',
    timeZone: 'Asia/Kolkata (IST +05:30)',
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
        empId: user.badgeId || user.enrollment_no || user.code || `TECH-${user.id || '987654'}`,
        role: user.role?.name || user.role || 'Hardware Technician',
        companyName: user.depot || user.organization?.name || 'Central Transit Maintenance Depot',
        branch: user.branch || user.division || 'Electronics & IoT Engineering Wing',
        address: user.organization?.office_address || user.address || 'Bay 4, Central Depot Workshop, Mumbai, Maharashtra 400001',
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
      setTimeout(() => navigate('/technician/profile'), 1000);
    } catch {
      /* toast handles error */
    }
  };

  const currentAvatarSrc = avatarUrl
    ? resolveFileUrl(avatarUrl)
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.fullName || 'Technician')}&background=0f172a&color=ffffff`;

  return (
    <div className="w-full space-y-6 pb-20">
      {/* 1. Breadcrumb Header */}
      <div className="w-full flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm">
        <div>
          <Breadcrumb
            items={[
              { label: 'Technician', path: '/technician/dashboard' },
              { label: 'Profile', path: '/technician/profile' },
              { label: 'Account Settings' },
            ]}
            className="mb-2"
          />

          <div className="flex items-center gap-3 mt-2">
            <button 
              type="button"
              onClick={() => navigate('/technician/profile')} 
              className="p-2 rounded-xl border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
              title="Back to Profile"
            >
              <FleetIcons.ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Account Settings</h1>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">Manage technician credentials, contact info, station depot, and field workstation preferences.</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/technician/profile')}
            className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-bold transition-all"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20 cursor-pointer"
          >
            <FleetIcons.Check className="w-4 h-4" />
            {saved ? 'Saved!' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* 2. Photo Upload Section */}
      <div className="p-6 md:p-8 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img
            src={currentAvatarSrc}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.fullName || 'Technician')}&background=0f172a&color=ffffff`;
            }}
            alt={formData.fullName || 'Technician'}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-200 dark:border-zinc-700 shadow-md bg-slate-100 dark:bg-zinc-800"
          />
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Profile Avatar Photo</h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">PNG or JPG up to 2MB. Displayed across field tickets and workstation logs.</p>
          </div>
        </div>

        <label className="px-4 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
            disabled={uploadingPhoto}
          />
          <FleetIcons.Camera className="w-4 h-4 text-slate-600 dark:text-zinc-300" />
          <span>{uploadingPhoto ? 'Uploading...' : 'Change Photo'}</span>
        </label>
      </div>

      {/* 3. Form Containers */}
      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Section 1: Personal Information */}
        <div className="p-6 md:p-8 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-5">
          <div className="pb-4 border-b border-slate-100 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                1. Personal Information
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">Full Name</label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">Email Address</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">Mobile Number</label>
              <input
                type="text"
                value={formData.mobile}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">Technician Badge ID</label>
              <input
                type="text"
                disabled
                value={formData.empId}
                className="w-full h-11 px-3.5 rounded-xl bg-slate-100 dark:bg-zinc-800/40 border border-slate-200 dark:border-zinc-700 text-xs text-slate-500 dark:text-zinc-400 font-mono font-bold"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Depot & Station Assignment */}
        <div className="p-6 md:p-8 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-5">
          <div className="pb-4 border-b border-slate-100 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-600"></span>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                2. Depot & Station Assignment
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">Assigned Depot / Station</label>
              <input
                type="text"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">Division / Department</label>
              <input
                type="text"
                value={formData.branch}
                onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">Workshop & Bay Address</label>
              <textarea
                rows={2}
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Preferences */}
        <div className="p-6 md:p-8 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-5">
          <div className="pb-4 border-b border-slate-100 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                3. Regional Preferences & Security
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">Language</label>
              <select
                value={formData.language}
                onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="en" className="dark:bg-zinc-900">English (India)</option>
                <option value="hi" className="dark:bg-zinc-900">Hindi (हिंदी)</option>
                <option value="kn" className="dark:bg-zinc-900">Kannada (ಕನ್ನಡ)</option>
                <option value="mr" className="dark:bg-zinc-900">Marathi (मराठी)</option>
                <option value="te" className="dark:bg-zinc-900">Telugu (తెలుగు)</option>
                <option value="ta" className="dark:bg-zinc-900">Tamil (தமிழ்)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">Time Zone</label>
              <select
                value={formData.timeZone}
                onChange={(e) => setFormData({ ...formData, timeZone: e.target.value })}
                className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Asia/Kolkata" className="dark:bg-zinc-900">Asia/Kolkata (IST +05:30)</option>
                <option value="UTC" className="dark:bg-zinc-900">UTC (GMT +00:00)</option>
                <option value="America/New_York" className="dark:bg-zinc-900">America/New_York (EST -05:00)</option>
                <option value="Europe/London" className="dark:bg-zinc-900">Europe/London (BST +01:00)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Bottom Save Bar */}
        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => navigate('/technician/profile')}
            className="px-6 py-3 rounded-xl border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-bold transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20"
          >
            <FleetIcons.Check className="w-4 h-4" />
            {saved ? 'Saved!' : 'Save Account Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};
export default TechAccountSettingsPage;
