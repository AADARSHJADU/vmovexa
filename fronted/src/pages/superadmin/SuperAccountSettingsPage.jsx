import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import { FleetIcons } from '../../components/FleetIcons';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';

export const SuperAccountSettingsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, updateProfile, fetchMe } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    timezone: user?.timezone || 'Asia/Kolkata',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        timezone: user.timezone || 'Asia/Kolkata',
      });
    }
  }, [user]);

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
          loading: t('common.saving', 'Saving changes…'),
          success: t('common.success', 'Profile updated successfully!'),
          error: (err) => err?.message || 'Update failed.',
        }
      );
      if (fetchMe) fetchMe();
      navigate('/superadmin/profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200">
      {/* Standard Reusable Breadcrumb */}
      <Breadcrumb
        items={[
          { label: t('common.super_admin', 'Super Admin'), path: '/superadmin/dashboard' },
          { label: t('nav.profile', 'Super Admin Profile'), path: '/superadmin/profile' },
          { label: t('superadmin.profile.account_settings', 'Account Settings') },
        ]}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {t('settings.account_title', 'Super Admin Account Settings')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-medium mt-0.5">
            {t('settings.account_sub', 'Update global root identification, emergency contact, and timezone preferences')}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="border-b border-slate-100 dark:border-zinc-800 pb-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              {t('settings.sovereign_identity', 'Personal & Sovereign Identification')}
            </h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
              {t('settings.sovereign_identity_sub', 'Root administrative identity in database')}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                {t('common.name', 'Full Legal Name')} *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                {t('common.email', 'Master Super Admin Email (Fixed)')}
              </label>
              <input
                type="email"
                readOnly
                value={formData.email}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs font-mono font-bold text-slate-500 dark:text-zinc-400 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                {t('common.phone', 'Emergency Phone')} *
              </label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                {t('settings.timezone_label', 'Platform Time Zone')}
              </label>
              <select
                value={formData.timezone}
                onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              >
                <option value="Asia/Kolkata">{t('tz.kolkata', 'Asia/Kolkata (IST - UTC+05:30)')}</option>
                <option value="UTC">{t('tz.utc', 'UTC (Coordinated Universal Time)')}</option>
                <option value="America/New_York">{t('tz.new_york', 'America/New_York (EST)')}</option>
                <option value="Europe/London">{t('tz.london', 'Europe/London (GMT/BST)')}</option>
                <option value="Asia/Dubai">{t('tz.dubai', 'Asia/Dubai (GST - UTC+04:00)')}</option>
                <option value="Asia/Singapore">{t('tz.singapore', 'Asia/Singapore (SGT - UTC+08:00)')}</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <Link
            to="/superadmin/profile"
            className="px-4 py-2.5 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-xs font-bold rounded-xl transition-colors text-center"
          >
            {t('common.cancel', 'Cancel')}
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
          >
            <FleetIcons.Check className="w-4 h-4" />
            <span>{saving ? t('common.saving', 'Saving…') : t('common.save', 'Save Settings')}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default SuperAccountSettingsPage;
