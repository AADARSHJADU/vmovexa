import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import { homeForRole } from '../../constants/roles';

export const ZohoCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loginWithZoho } = useAuth();
  const [status, setStatus] = useState('Processing Zoho Authentication…');

  useEffect(() => {
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      if (window.opener) {
        window.opener.postMessage({ type: 'ZOHO_AUTH_ERROR', error }, window.location.origin);
        window.close();
        return;
      }
      toast.error(`Zoho sign-in failed: ${error}`);
      navigate('/login', { replace: true });
      return;
    }

    if (!code) {
      if (window.opener) {
        window.opener.postMessage({ type: 'ZOHO_AUTH_ERROR', error: 'No authorization code received' }, window.location.origin);
        window.close();
        return;
      }
      toast.error('No authorization code received from Zoho.');
      navigate('/login', { replace: true });
      return;
    }

    // If opened in popup, post message back to main window
    if (window.opener) {
      window.opener.postMessage({ type: 'ZOHO_AUTH_SUCCESS', code }, window.location.origin);
      setTimeout(() => window.close(), 100);
      return;
    }

    // Direct redirect flow fallback
    const completeDirectAuth = async () => {
      try {
        setStatus('Logging you in with Zoho…');
        const redirectUri = window.location.origin + '/auth/zoho/callback';
        const savedMode = sessionStorage.getItem('zoho_auth_mode') || 'login';
        sessionStorage.removeItem('zoho_auth_mode');

        const result = await loginWithZoho({ code, redirectUri, mode: savedMode });
        const user = result?.user || result?.data?.user;
        const msg = result?.alreadyRegistered
          ? 'Welcome back! Logged in with Zoho.'
          : 'Account connected with Zoho!';
        toast.success(msg);
        const roleCode =
          (typeof user?.role === 'object' ? user?.role?.code : user?.role) ||
          user?.roleCode ||
          'ROLE-TENANT-ADMIN';
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
      <p className="text-xs text-slate-400">Please wait while we securely connect your Zoho account.</p>
    </div>
  );
};

export default ZohoCallback;
