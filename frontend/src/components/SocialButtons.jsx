import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../api/services/auth.service';
import { signInWithGooglePopup, signInWithApplePopup } from '../config/firebase';
import { homeForRole } from '../constants/roles';

export const SocialButtons = ({ mode = 'login', onGoogleClick = null }) => {
  const navigate = useNavigate();
  const { loginWithGoogle, registerWithGoogle, loginWithZoho, loginWithApple, loginWithFirebaseApple, registerWithApple } = useAuth();
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [loadingZoho, setLoadingZoho] = useState(false);
  const [loadingApple, setLoadingApple] = useState(false);
  const [showAppleSetupModal, setShowAppleSetupModal] = useState(false);
  const [appleSetupDetails, setAppleSetupDetails] = useState('');

  const handleGoogleAuth = async () => {
    if (loadingGoogle) return;
    setLoadingGoogle(true);
    try {
      const googleAuth = await signInWithGooglePopup();
      if (onGoogleClick) {
        await onGoogleClick(googleAuth);
      } else if (mode === 'signup') {
        const tid = toast.loading('Creating account with Google...');
        const result = await registerWithGoogle({ idToken: googleAuth.idToken });
        toast.dismiss(tid);
        const user = result?.data?.user || result?.user;
        const msg = result?.data?.alreadyRegistered
          ? 'Welcome back! Logged in with Google.'
          : 'Account created with Google! Welcome to VMOVEXA.';
        toast.success(msg);
        const roleCode =
          (typeof user?.role === 'object' ? user?.role?.code : user?.role) ||
          user?.roleCode ||
          'ROLE-TENANT-ADMIN';
        navigate(homeForRole(roleCode, user), { replace: true });
      } else {
        const tid = toast.loading('Authenticating with Google...');
        const result = await loginWithGoogle(googleAuth.idToken);
        toast.dismiss(tid);
        toast.success('Logged in with Google!');
        const roleCode =
          (typeof result?.user?.role === 'object' ? result?.user?.role?.code : result?.user?.role) ||
          result?.user?.roleCode ||
          result?.roleCode;
        navigate(homeForRole(roleCode, result?.user), { replace: true });
      }
    } catch (err) {
      toast.dismiss();
      if (err.code === 'auth/popup-closed-by-user') {
        toast.error('Google sign-in popup was closed.');
      } else if (
        err.code === 'AUTH_SOCIAL_NOT_PROVISIONED' ||
        err.message?.includes('No VMOVEXA user account found')
      ) {
        toast(
          (t) => (
            <div className="text-xs space-y-2 text-left">
              <div className="font-bold text-amber-300 flex items-center gap-1.5">
                <span>🏢</span>
                <span>No Organization Found</span>
              </div>
              <div className="text-slate-200 text-[11px] leading-relaxed">
                No active VMOVEXA user account is registered for this Google email. Would you like to register your fleet organization?
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => {
                    toast.dismiss(t.id);
                    navigate('/signup');
                  }}
                  className="flex-1 py-1.5 px-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] transition-all shadow"
                >
                  ⚡ Register Organization
                </button>
                <button
                  onClick={() => toast.dismiss(t.id)}
                  className="py-1.5 px-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-slate-300 font-bold text-[11px] transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          ),
          { duration: 10000, style: { background: '#18181b', border: '1px solid #3f3f46', color: '#fff' } }
        );
      } else if (
        err.code === 'auth/api-key-not-valid' ||
        err.message?.includes('api-key-not-valid') ||
        err.message?.includes('API Key is missing')
      ) {
        toast.error(
          <div className="text-xs">
            <div className="font-bold">Firebase Web API Key Required</div>
            <div className="text-[11px] mt-1 text-slate-200">
              Please add your Firebase Web API Key to <span className="font-mono bg-black/40 px-1 rounded">frontend/.env</span>:
            </div>
            <div className="font-mono text-[10px] bg-black/50 p-1 rounded mt-1 text-amber-300">
              VITE_FIREBASE_API_KEY=AIzaSy...
            </div>
          </div>,
          { duration: 10000 }
        );
      } else {
        toast.error(err.message || 'Google authentication failed.');
      }
    } finally {
      setLoadingGoogle(false);
    }
  };

  const handleZohoAuth = async () => {
    if (loadingZoho) return;
    setLoadingZoho(true);
    try {
      sessionStorage.setItem('zoho_auth_mode', mode);
      const redirectUri = window.location.origin + '/auth/zoho/callback';

      // 1. Get Zoho OAuth URL
      const res = await authService.getZohoAuthUrl(redirectUri);
      const authUrl = res?.data?.authUrl || res?.authUrl;
      if (!authUrl) throw new Error('Could not generate Zoho authentication URL.');

      // 2. Open popup
      const width = 520;
      const height = 650;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;
      const popup = window.open(
        authUrl,
        'zoho_oauth_popup',
        `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,status=1`
      );

      if (!popup || popup.closed || typeof popup.closed === 'undefined') {
        window.location.assign(authUrl);
        return;
      }

      // 3. Listen for message from popup
      const codePromise = new Promise((resolve, reject) => {
        let timer = null;
        const messageHandler = (event) => {
          if (event.origin !== window.location.origin) return;
          if (event.data?.type === 'ZOHO_AUTH_SUCCESS') {
            cleanup();
            resolve(event.data.code);
          } else if (event.data?.type === 'ZOHO_AUTH_ERROR') {
            cleanup();
            reject(new Error(event.data.error || 'Zoho authorization failed.'));
          }
        };

        const cleanup = () => {
          window.removeEventListener('message', messageHandler);
          if (timer) clearInterval(timer);
        };

        window.addEventListener('message', messageHandler);

        timer = setInterval(() => {
          if (popup.closed) {
            cleanup();
            reject(new Error('Zoho login popup was closed.'));
          }
        }, 800);
      });

      const tid = toast.loading('Waiting for Zoho authorization...');
      const code = await codePromise;
      toast.dismiss(tid);

      // 4. Exchange code & authenticate
      const loginTid = toast.loading(mode === 'signup' ? 'Creating account with Zoho...' : 'Authenticating with Zoho...');
      const result = await loginWithZoho({ code, redirectUri, mode });
      toast.dismiss(loginTid);

      const user = result?.user || result?.data?.user;
      const msg = result?.alreadyRegistered || mode === 'login'
        ? 'Logged in with Zoho!'
        : 'Account created with Zoho! Welcome to VMOVEXA.';
      toast.success(msg);

      const roleCode =
        (typeof user?.role === 'object' ? user?.role?.code : user?.role) ||
        user?.roleCode ||
        'ROLE-TENANT-ADMIN';
      navigate(homeForRole(roleCode, user), { replace: true });
    } catch (err) {
      toast.dismiss();
      if (
        err.code === 'AUTH_SOCIAL_NOT_PROVISIONED' ||
        err.message?.includes('No VMOVEXA user account found')
      ) {
        toast(
          (t) => (
            <div className="text-xs space-y-2 text-left">
              <div className="font-bold text-amber-300 flex items-center gap-1.5">
                <span>🏢</span>
                <span>No Organization Found</span>
              </div>
              <div className="text-slate-200 text-[11px] leading-relaxed">
                No active VMOVEXA user account is registered for this Zoho email. Would you like to register your fleet organization?
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => {
                    toast.dismiss(t.id);
                    navigate('/signup');
                  }}
                  className="flex-1 py-1.5 px-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] transition-all shadow"
                >
                  ⚡ Register Organization
                </button>
                <button
                  onClick={() => toast.dismiss(t.id)}
                  className="py-1.5 px-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-slate-300 font-bold text-[11px] transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          ),
          { duration: 10000, style: { background: '#18181b', border: '1px solid #3f3f46', color: '#fff' } }
        );
      } else {
        toast.error(err.message || 'Zoho authentication failed.');
      }
    } finally {
      setLoadingZoho(false);
    }
  };

  const handleAppleAuth = async () => {
    if (loadingApple) return;
    setLoadingApple(true);
    try {
      // 1. Direct Apple authentication via Firebase (already configured in Firebase console)
      const appleAuth = await signInWithApplePopup();
      if (!appleAuth || !appleAuth.idToken) {
        throw new Error('Failed to retrieve Apple authentication credentials.');
      }

      // 2. Handle signup vs login
      if (mode === 'signup') {
        const tid = toast.loading('Creating account with Apple...');
        const result = await registerWithApple({ idToken: appleAuth.idToken });
        toast.dismiss(tid);
        const user = result?.data?.user || result?.user;
        const msg = result?.data?.alreadyRegistered
          ? 'Welcome back! Logged in with Apple.'
          : 'Account created with Apple! Welcome to VMOVEXA.';
        toast.success(msg);
        const roleCode =
          (typeof user?.role === 'object' ? user?.role?.code : user?.role) ||
          user?.roleCode ||
          'ROLE-TENANT-ADMIN';
        navigate(homeForRole(roleCode, user), { replace: true });
      } else {
        const tid = toast.loading('Authenticating with Apple...');
        const result = await loginWithFirebaseApple(appleAuth.idToken);
        toast.dismiss(tid);
        toast.success('Logged in with Apple!');
        const roleCode =
          (typeof result?.user?.role === 'object' ? result?.user?.role?.code : result?.user?.role) ||
          result?.user?.roleCode ||
          result?.roleCode;
        navigate(homeForRole(roleCode, result?.user), { replace: true });
      }
    } catch (err) {
      toast.dismiss();
      if (
        err.code === 'auth/popup-closed-by-user' ||
        err.code === 'auth/cancelled-popup-request' ||
        err.message?.includes('popup-closed-by-user')
      ) {
        toast.error('Apple sign-in popup was closed.');
      } else if (
        err.code === 'AUTH_SOCIAL_NOT_PROVISIONED' ||
        err.message?.includes('No VMOVEXA user account found')
      ) {
        toast(
          (t) => (
            <div className="text-xs space-y-2 text-left">
              <div className="font-bold text-amber-300 flex items-center gap-1.5">
                <span>🏢</span>
                <span>No Organization Found</span>
              </div>
              <div className="text-slate-200 text-[11px] leading-relaxed">
                No active VMOVEXA user account is registered for this Apple email. Would you like to register your fleet organization?
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => {
                    toast.dismiss(t.id);
                    navigate('/signup');
                  }}
                  className="flex-1 py-1.5 px-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] transition-all shadow"
                >
                  ⚡ Register Organization
                </button>
                <button
                  onClick={() => toast.dismiss(t.id)}
                  className="py-1.5 px-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-slate-300 font-bold text-[11px] transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          ),
          { duration: 10000, style: { background: '#18181b', border: '1px solid #3f3f46', color: '#fff' } }
        );
      } else if (
        err.code === 'auth/operation-not-allowed' ||
        err.code === 'auth/configuration-not-found'
      ) {
        setAppleSetupDetails(
          'Apple Sign-In provider is not enabled in Firebase Console. Please verify it is toggled ON under Authentication -> Sign-in method -> Apple.'
        );
        setShowAppleSetupModal(true);
      } else {
        toast.error(err.message || 'Apple authentication failed.');
      }
    } finally {
      setLoadingApple(false);
    }
  };

  return (
    <div className="w-full">
      <div className="relative flex items-center py-2.5">
        <div className="flex-grow border-t border-[#2a2a2a]"></div>
        <span className="flex-shrink-0 mx-3 text-[#6a6a6a] text-xs font-medium">Or Continue With</span>
        <div className="flex-grow border-t border-[#2a2a2a]"></div>
      </div>
      
      <div className="flex justify-between gap-3">
        {/* Google Button */}
        <button
          type="button"
          onClick={handleGoogleAuth}
          disabled={loadingGoogle || loadingZoho || loadingApple}
          className="flex-1 h-10 bg-[#121212] border border-[#2a2a2a] hover:border-blue-500/50 rounded-xl flex items-center justify-center gap-2 hover:bg-[#1a1a1a] transition-all cursor-pointer disabled:opacity-50"
          title="Continue with Google"
          aria-label="Continue with Google"
        >
          {loadingGoogle ? (
            <svg className="w-4 h-4 animate-spin text-blue-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          ) : (
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
          )}
          <span className="text-xs font-semibold text-slate-200">Google</span>
        </button>
        
        {/* Apple Button */}
        <button
          type="button"
          onClick={handleAppleAuth}
          disabled={loadingGoogle || loadingZoho || loadingApple}
          className="flex-1 h-10 bg-[#121212] border border-[#2a2a2a] hover:border-slate-500 rounded-xl flex items-center justify-center gap-2 hover:bg-[#1a1a1a] transition-all cursor-pointer disabled:opacity-50"
          title="Continue with Apple"
          aria-label="Continue with Apple"
        >
          {loadingApple ? (
            <svg className="w-4 h-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          ) : (
            <svg className="w-4 h-4 text-white mb-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.86c.66-.8 1.11-1.92.99-3.04-.96.04-2.12.64-2.81 1.44-.61.71-1.15 1.85-1.01 2.95 1.08.08 2.17-.55 2.83-1.35z" />
            </svg>
          )}
          <span className="text-xs font-semibold text-slate-200">Apple</span>
        </button>

        {/* Zoho Button */}
        <button
          type="button"
          onClick={handleZohoAuth}
          disabled={loadingGoogle || loadingZoho || loadingApple}
          className="flex-1 h-10 bg-[#121212] border border-[#2a2a2a] hover:border-amber-500/50 rounded-xl flex items-center justify-center gap-2 hover:bg-[#1a1a1a] transition-all cursor-pointer disabled:opacity-50"
          title="Continue with Zoho"
          aria-label="Continue with Zoho"
        >
          {loadingZoho ? (
            <svg className="w-4 h-4 animate-spin text-amber-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          ) : (
            <svg className="w-5 h-4" viewBox="0 0 36 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="0" y="2" width="14" height="14" rx="3" stroke="#E42527" strokeWidth="2.2" fill="none"/>
              <rect x="7.5" y="2" width="14" height="14" rx="3" stroke="#00A650" strokeWidth="2.2" fill="none"/>
              <rect x="15" y="2" width="14" height="14" rx="3" stroke="#0066CC" strokeWidth="2.2" fill="none"/>
              <rect x="22.5" y="2" width="13" height="14" rx="3" stroke="#F4A623" strokeWidth="2.2" fill="none"/>
            </svg>
          )}
          <span className="text-xs font-semibold text-slate-300">Zoho</span>
        </button>
      </div>

      {/* Apple Developer Setup Guidance Modal */}
      {showAppleSetupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-[#18181b] border border-zinc-700/80 rounded-2xl max-w-lg w-full p-6 text-left shadow-2xl relative">
            <button
              onClick={() => setShowAppleSetupModal(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800 transition"
              aria-label="Close"
            >
              ✕
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center border border-zinc-700">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.86c.66-.8 1.11-1.92.99-3.04-.96.04-2.12.64-2.81 1.44-.61.71-1.15 1.85-1.01 2.95 1.08.08 2.17-.55 2.83-1.35z" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Apple Sign-In Setup Required</h3>
                <p className="text-xs text-zinc-400">Complete Apple Developer OAuth configuration</p>
              </div>
            </div>

            {appleSetupDetails && (
              <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 text-xs leading-relaxed">
                ⚠️ {appleSetupDetails}
              </div>
            )}

            <div className="space-y-3 text-xs text-zinc-300 leading-relaxed max-h-[60vh] overflow-y-auto pr-1">
              <p>
                To enable live <strong>Sign in with Apple</strong>, add your Apple Developer credentials to <code className="bg-black/50 px-1.5 py-0.5 rounded text-amber-300">backend/.env</code>:
              </p>

              <div className="bg-black/60 p-3 rounded-xl border border-zinc-800 font-mono text-[11px] text-emerald-400 space-y-1 select-all">
                <div>OAUTH_APPLE_CLIENT_ID=com.vmovexa.web</div>
                <div>OAUTH_APPLE_TEAM_ID=XXXXXXXXXX</div>
                <div>OAUTH_APPLE_KEY_ID=YYYYYYYYYY</div>
                <div>OAUTH_APPLE_PRIVATE_KEY_PATH=./keys/AuthKey_YYYYYYYYYY.p8</div>
                <div>OAUTH_APPLE_REDIRECT_URI={window.location.origin}/auth/apple/callback</div>
              </div>

              <div className="space-y-1.5 pt-2">
                <div className="font-semibold text-white">Required from Apple Developer Portal:</div>
                <ol className="list-decimal pl-4 space-y-1 text-zinc-400 text-[11px]">
                  <li>
                    <strong>Services ID (Client ID):</strong> e.g. <span className="font-mono text-zinc-200">com.vmovexa.web</span> (registered under Identifiers &rarr; Services IDs).
                  </li>
                  <li>
                    <strong>Team ID:</strong> 10-character code shown under your name in Apple Developer Account.
                  </li>
                  <li>
                    <strong>Key ID &amp; .p8 File:</strong> Created under Certificates, Identifiers &amp; Profiles &rarr; Keys. Download <span className="font-mono text-zinc-200">AuthKey_XXXXXXXXXX.p8</span> and save it to <span className="font-mono text-zinc-200">backend/keys/</span>.
                  </li>
                  <li>
                    <strong>Return URL:</strong> In Apple Developer Services ID config, add Return URL: <span className="font-mono text-amber-300">{window.location.origin}/auth/apple/callback</span>.
                  </li>
                </ol>
              </div>
            </div>

            <div className="flex gap-2 pt-5 border-t border-zinc-800 mt-4">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(
                    `OAUTH_APPLE_CLIENT_ID=com.vmovexa.web\nOAUTH_APPLE_TEAM_ID=\nOAUTH_APPLE_KEY_ID=\nOAUTH_APPLE_PRIVATE_KEY_PATH=./keys/\nOAUTH_APPLE_REDIRECT_URI=${window.location.origin}/auth/apple/callback`
                  );
                  toast.success('Apple env template copied to clipboard!');
                }}
                className="flex-1 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition shadow cursor-pointer"
              >
                📋 Copy .env Template
              </button>
              <button
                type="button"
                onClick={() => setShowAppleSetupModal(false)}
                className="py-2 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold text-xs transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SocialButtons;
