import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useTranslation } from '../../hooks/useTranslation';
import { useAuth } from '../../hooks/useAuth';

export const ZohoCallback = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loginWithZoho } = useAuth();
  const [status, setStatus] = useState('Completing Zoho sign-in…');

  useEffect(() => {
    const completeDirectAuth = async () => {
      const code = searchParams.get('code');
      const location = searchParams.get('location');

      if (!code) {
        toast.error('Missing Zoho authorization code.');
        navigate('/login', { replace: true });
        return;
      }

      try {
        setStatus('Verifying Zoho identity with VMOVEXA…');
        const user = await loginWithZoho({ code, location });

        toast.success('Zoho authentication successful!');
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
        toast.error(err?.message || 'Zoho authentication failed.');
        navigate('/login', { replace: true });
      }
    };

    completeDirectAuth();
  }, [searchParams, navigate, loginWithZoho]);

  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-4 text-center px-4">
      <div className="w-12 h-12 border-3 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
      <div className="text-white font-semibold text-sm">{status}</div>
      <p className="text-xs text-slate-400">{t('auth.zoho_callback_connecting')}</p>
    </div>
  );
};

export default ZohoCallback;
