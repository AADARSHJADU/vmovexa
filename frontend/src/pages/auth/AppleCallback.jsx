import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import { homeForRole } from '../../constants/roles';

export const AppleCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loginWithApple } = useAuth();
  const [status, setStatus] = useState('Processing Apple Authentication…');

  useEffect(() => {
    const code = searchParams.get('code');
    const idToken = searchParams.get('id_token') || searchParams.get('idToken');
    const userStr = searchParams.get('user');
    const error = searchParams.get('error');

    if (error) {
      if (window.opener) {
        window.opener.postMessage({ type: 'APPLE_AUTH_ERROR', error }, window.location.origin);
        window.close();
        return;
      }
      toast.error(`Apple sign-in failed: ${error}`);
      navigate('/login', { replace: true });
      return;
    }

    if (!code && !idToken) {
      if (window.opener) {
        window.opener.postMessage(
          { type: 'APPLE_AUTH_ERROR', error: 'No authorization credentials received from Apple' },
          window.location.origin
        );
        window.close();
        return;
      }
      toast.error('No authorization code or token received from Apple.');
      navigate('/login', { replace: true });
      return;
    }

    // If opened in popup, post message back to main window
    if (window.opener) {
      window.opener.postMessage(
        {
          type: 'APPLE_AUTH_SUCCESS',
          code,
          idToken,
          user: userStr,
        },
        window.location.origin
      );
      setTimeout(() => window.close(), 100);
      return;
    }

    // Direct redirect flow fallback
    const completeDirectAuth = async () => {
      try {
        setStatus('Logging you in with Apple…');
        const redirectUri = window.location.origin + '/auth/apple/callback';
        const savedMode = sessionStorage.getItem('apple_auth_mode') || 'login';
        sessionStorage.removeItem('apple_auth_mode');

        const result = await loginWithApple({
          code,
          idToken,
          user: userStr,
          redirectUri,
          mode: savedMode,
        });

        const user = result?.user || result?.data?.user;
        const msg = result?.alreadyRegistered
          ? 'Welcome back! Logged in with Apple.'
          : 'Account connected with Apple!';
        toast.success(msg);

        const roleCode =
          (typeof user?.role === 'object' ? user?.role?.code : user?.role) ||
          user?.roleCode ||
          'ROLE-TENANT-ADMIN';
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
      <p className="text-xs text-slate-400">Please wait while we securely connect your Apple account.</p>
    </div>
  );
};

export default AppleCallback;
