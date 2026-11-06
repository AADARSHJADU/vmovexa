import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useTranslation } from '../../hooks/useTranslation';
import { useAuth } from '../../hooks/useAuth';

export const AppleCallback = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loginWithApple } = useAuth();
  const [status, setStatus] = useState('Completing Apple sign-in…');

  useEffect(() => {
    const completeDirectAuth = async () => {
      const code = searchParams.get('code');
      const idToken = searchParams.get('id_token') || searchParams.get('idToken');
      const userParam = searchParams.get('user');

      if (!code && !idToken) {
        toast.error('Missing Apple authorization parameters.');
        navigate('/login', { replace: true });
        return;
      }

      try {
        setStatus('Verifying Apple identity with VMOVEXA…');
        let parsedUser;
        if (userParam) {
          try {
            parsedUser = typeof userParam === 'string' ? JSON.parse(userParam) : userParam;
          } catch {
            parsedUser = undefined;
          }
        }

        const user = await loginWithApple({
          code,
          idToken,
          user: parsedUser,
        });

        toast.success('Apple authentication successful!');
        const roleCode = user?.role?.code || user?.role || 'driver';
        const homeForRole = (r, u) => {
          if (r === 'super_admin' || r === 'superadmin') return '/superadmin/dashboard';
          if (r === 'admin') return u?.has_completed_onboarding === false ? '/tenant/onboarding' : '/admin/dashboard';
          if (r === 'finance') return '/finance/dashboard';
          if (r === 'government') return '/government/dashboard';
          if (r === 'technician') return '/technician/dashboard';
          if (r === 'advertiser') return '/advertiser/dashboard';
          if (r === 'fleet_manager') return '/fleet-manager/dashboard';
          return '/driver/dashboard';
        };

        navigate(homeForRole(roleCode, user), { replace: true });
      } catch (err) {
        toast.error(err?.message || 'Apple authentication failed.');
        navigate('/login', { replace: true });
      }
    };

    completeDirectAuth();
  }, [searchParams, navigate, loginWithApple]);

  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-4 text-center px-4">
      <div className="w-12 h-12 border-3 border-slate-500/30 border-t-white rounded-full animate-spin" />
      <div className="text-white font-semibold text-sm">{status}</div>
      <p className="text-xs text-slate-400">{t('auth.apple_callback_connecting')}</p>
    </div>
  );
};

export default AppleCallback;
