import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FleetIcons } from '../../components/FleetIcons';
import { apiClient } from '../../api/client';
import toast from 'react-hot-toast';

export const AcceptInvite = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await apiClient.post('/auth/accept-invite', { token, password });
      toast.success('Account activated! You can now log in.');
      navigate('/login');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to activate invitation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-6 bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-sm space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Accept Invitation</h2>
        <p className="text-xs text-slate-500 font-medium">Set your password to activate your VMOVEXA account</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">New Password</label>
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-none"
            placeholder="Minimum 8 characters"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">Confirm Password</label>
          <input
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-none"
            placeholder="Confirm new password"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <FleetIcons.Check className="w-4 h-4" />
          <span>{loading ? 'Activating Account...' : 'Activate Account & Set Password'}</span>
        </button>
      </form>
    </div>
  );
};

export default AcceptInvite;
