import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FleetIcons } from '../../components/FleetIcons';
import { useAuth } from '../../hooks/useAuth';
import Breadcrumb from '../../components/ui/Breadcrumb';
import { useTranslation } from '../../hooks/useTranslation';

export const AdminChangePasswordPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { changePassword } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const hasMinLength = newPassword.length >= 8;
  const hasUpperCase = /[A-Z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    if (!hasMinLength || !hasUpperCase || !hasNumber || !hasSpecial) {
      setError('Password does not meet security requirements');
      return;
    }

    setLoading(true);
    try {
      await toast.promise(
        changePassword({ currentPassword, newPassword }),
        {
          loading: 'Updating password...',
          success: 'Password updated successfully!',
          error: (err) => err?.message || 'Failed to update password',
        }
      );
      navigate('/admin/settings/security/success');
    } catch (err) {
      setError(err?.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-4">
        <div>
          <Breadcrumb
            items={[
              { label: t('nav.admin') || 'Dashboard', path: '/admin/dashboard' },
              { label: t('admin.profile.title') || 'Admin Profile', path: '/admin/profile' },
              { label: t('admin.password.title') }
            ]}
            className="mb-2"
          />
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-zinc-100 tracking-tight">{t('admin.password.title')}</h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-medium mt-0.5">
            {t('admin.password.desc')}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-5">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-bold text-red-700">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">{t('admin.password.curr_pass')}</label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-none"
              placeholder={t('admin.password.curr_pass_ph')}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">{t('admin.password.new_pass')}</label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-none"
              placeholder={t('admin.password.new_pass_ph')}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">{t('admin.password.confirm_pass')}</label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-none"
              placeholder={t('admin.password.confirm_pass_ph')}
            />
          </div>
        </div>

        {/* Security Requirements */}
        <div className="p-4 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-100 dark:border-zinc-800 space-y-2 text-xs">
          <span className="font-bold text-slate-700 text-[11px] uppercase tracking-wider">{t('admin.password.req_title')}</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className={`flex items-center gap-2 ${hasMinLength ? 'text-emerald-700 font-bold' : 'text-slate-400'}`}>
              {hasMinLength ? <FleetIcons.Check className="w-3.5 h-3.5 text-emerald-600 inline" /> : <span className="w-3.5 h-3.5 rounded-full border border-slate-300 dark:border-zinc-600 inline-block" />}
              <span>{t('admin.password.req_min8')}</span>
            </div>
            <div className={`flex items-center gap-2 ${hasUpperCase ? 'text-emerald-700 font-bold' : 'text-slate-400'}`}>
              {hasUpperCase ? <FleetIcons.Check className="w-3.5 h-3.5 text-emerald-600 inline" /> : <span className="w-3.5 h-3.5 rounded-full border border-slate-300 dark:border-zinc-600 inline-block" />}
              <span>{t('admin.password.req_upper')}</span>
            </div>
            <div className={`flex items-center gap-2 ${hasNumber ? 'text-emerald-700 font-bold' : 'text-slate-400'}`}>
              {hasNumber ? <FleetIcons.Check className="w-3.5 h-3.5 text-emerald-600 inline" /> : <span className="w-3.5 h-3.5 rounded-full border border-slate-300 dark:border-zinc-600 inline-block" />}
              <span>{t('admin.password.req_num')}</span>
            </div>
            <div className={`flex items-center gap-2 ${hasSpecial ? 'text-emerald-700 font-bold' : 'text-slate-400'}`}>
              {hasSpecial ? <FleetIcons.Check className="w-3.5 h-3.5 text-emerald-600 inline" /> : <span className="w-3.5 h-3.5 rounded-full border border-slate-300 dark:border-zinc-600 inline-block" />}
              <span>{t('admin.password.req_special')}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <Link
            to="/admin/profile"
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors text-center"
          >
            {t('common.cancel')}
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
          >
            <FleetIcons.Key className="w-4 h-4" />
            <span>{loading ? t('common.saving') : t('admin.password.update_btn')}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
