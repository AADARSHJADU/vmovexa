import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { SocialButtons } from '../../components/SocialButtons';
import { Checkbox } from '../../components/Checkbox';
import { Logo } from '../../components/Logo';
import { useAuth } from '../../hooks/useAuth';
import { useTranslation } from '../../hooks/useTranslation';
import { homeForRole } from '../../constants/roles';

export const LoginEmail = () => {
  const navigate = useNavigate();
  const { login, isLoading, error, clearError } = useAuth();
  const { t } = useTranslation();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    clearError();
    try {
      const cleanEmail = (email || '').trim();
      const cleanPassword = (password || '').trim();
      const result = await login(cleanEmail, cleanPassword);
      if (result && result.mfaRequired) {
        navigate('/verify-otp', {
          state: {
            identifier: result.identifier,
            email: result.identifier,
            purpose: 'login',
            devCode: result.devCode,
          },
        });
        return;
      }
      const roleCode =
        (typeof result?.user?.role === 'object' ? result?.user?.role?.code : result?.user?.role) ||
        result?.user?.roleCode ||
        result?.roleCode;
      navigate(homeForRole(roleCode, result?.user), { replace: true });
    } catch {
      // error is surfaced from the store below
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      <Logo className="mb-3" />

      <div className="text-center mb-4">
        <h1 className="text-xl font-bold tracking-tight text-white mb-0.5">{t('common.welcome', 'Welcome Back!')}</h1>
        <p className="text-[#8a8a8a] text-xs">{t('auth.sign_in', 'Login to Continue to your account!')}</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-3 w-full flex flex-col">
        {error && (
          <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2 space-y-1">
            <div>{error.message || t('auth.invalid_credentials', 'Login failed. Check your credentials.')}</div>
            {(error.message?.toLowerCase().includes('reject') || error.message?.toLowerCase().includes('unapproved')) && (
              <div className="pt-1 border-t border-red-500/20">
                <Link
                  to={`/signup?mode=resubmit&email=${encodeURIComponent(email)}`}
                  className="font-bold text-amber-300 hover:underline inline-flex items-center gap-1"
                >
                  ⚡ Application rejected? Click here to update & resubmit
                </Link>
              </div>
            )}
          </div>
        )}

        <Input
          type="email"
          placeholder={t('auth.email', 'Enter your email address')}
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-11 text-xs"
          leftIcon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          }
        />

        <Input
          type={showPassword ? 'text' : 'password'}
          placeholder={t('auth.password', 'Enter your password')}
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="h-11 text-xs"
          leftIcon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          }
          rightIcon={
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="focus:outline-none">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </button>
          }
        />

        <div className="flex items-center justify-between text-xs py-0.5">
          <Checkbox label={<span className="text-xs text-[#8a8a8a]">{t('auth.remember_me', 'Remember Me')}</span>} />
          <Link to="/forgot-password" className="text-blue-500 hover:text-blue-400 font-medium transition-colors text-xs">
            {t('auth.forgot_password', 'Forgot Password?')}
          </Link>
        </div>

        <Button
          type="submit"
          variant="gradient"
          disabled={isLoading}
          className="w-full h-10 rounded-xl font-semibold text-sm cursor-pointer shadow-lg shadow-[#1C68FD]/25 hover:shadow-[#DA29F4]/35 transition-all duration-300 disabled:opacity-60"
        >
          {isLoading ? t('common.loading', 'Signing in…') : t('auth.sign_in', 'Login')}
        </Button>
      </form>
      <SocialButtons />

      <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-[#8a8a8a]">
        <span>{t('auth.dont_have_account', "Don't have an account?")}</span>
        <Link to="/signup" className="text-blue-500 hover:text-blue-400 font-semibold transition-colors">
          {t('auth.create_account', 'Create Account')}
        </Link>
      </div>
    </div>
  );
};
