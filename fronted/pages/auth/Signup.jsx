import { useTranslation } from '../../hooks/useTranslation';
import { FleetIcons } from '../../components/FleetIcons';
import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { Checkbox } from '../../components/Checkbox';
import { Logo } from '../../components/Logo';
import { SocialButtons } from '../../components/SocialButtons';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';

export const Signup = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialEmail = searchParams.get('email') || '';

  const { requestSignupOtp, isLoading, error, clearError } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(true);
  const [form, setForm] = useState({
    name: '',
    email: initialEmail,
    password: '',
  });

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSignup = async (e) => {
    e.preventDefault();
    clearError();
    if (!agreed) return;

    if (!form.name.trim()) {
      toast.error('Please enter your full name.');
      return;
    }
    if (!form.email.trim()) {
      toast.error('Please enter a valid email address.');
      return;
    }
    if (!form.password || form.password.length < 8) {
      toast.error('Password must be at least 8 characters long.');
      return;
    }

    try {
      const tid = toast.loading('Sending verification OTP code to your email...');
      const res = await requestSignupOtp({ name: form.name.trim(), email: form.email.trim().toLowerCase() });
      toast.dismiss(tid);

      const devCodeMsg = res?.data?.devCode ? ` (Dev OTP: ${res.data.devCode})` : '';
      toast.success(`Verification OTP sent to ${form.email}${devCodeMsg}`, { duration: 6000 });

      // Redirect to OTP verification screen with form context
      navigate('/verify-otp', {
        state: {
          name: form.name.trim(),
          email: form.email.trim().toLowerCase(),
          password: form.password,
          purpose: 'registration',
          devCode: res?.data?.devCode,
        },
      });
    } catch (err) {
      toast.error(err?.message || 'Failed to send verification OTP.');
    }
  };

  return (
    <div className="w-full flex flex-col items-center max-w-md">
      <Logo className="mb-2" />

      <div className="text-center mb-3">
        <h1 className="text-xl font-bold tracking-tight text-white">
          {t('auth.register_title')}
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          {t('auth.register_sub')}
        </p>
      </div>

      <form onSubmit={handleSignup} className="space-y-3 w-full flex flex-col">
        {error && (
          <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2 space-y-1 text-left">
            <div className="font-bold">{error.message || 'Registration failed.'}</div>
            {Array.isArray(error.details) && error.details.length > 0 && (
              <ul className="list-disc list-inside space-y-0.5 text-[11px] text-red-300">
                {error.details.map((d, i) => (
                  <li key={i}>{d.message}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        <div className="space-y-2.5">
          {/* Full Name */}
          <Input
            placeholder={`${t('auth.full_name')} *`}
            required
            value={form.name}
            onChange={set('name')}
            className="h-10 text-xs"
            leftIcon={
              <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            }
          />

          {/* Email Address */}
          <Input
            type="email"
            placeholder={`${t('auth.email')} *`}
            required
            value={form.email}
            onChange={set('email')}
            className="h-10 text-xs"
            leftIcon={
              <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            }
          />

          {/* Password */}
          <Input
            type={showPassword ? 'text' : 'password'}
            placeholder={`${t('auth.password')} (${t('auth.min_chars_ph')}) *`}
            required
            value={form.password}
            onChange={set('password')}
            className="h-10 text-xs"
            leftIcon={
              <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 00-2 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            }
            rightIcon={
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="focus:outline-none">
                <svg className="w-4 h-4 text-slate-400 hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </button>
            }
          />
        </div>

        <div className="py-1">
          <Checkbox
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            label={
              <span className="text-[#8a8a8a] font-normal text-[11px]">
                {t('auth.terms_agreement_part1')} <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-white font-medium hover:underline">{t('auth.terms_agreement_part2')}</a> & <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-white font-medium hover:underline">{t('auth.terms_agreement_part3')}</a>
              </span>
            }
          />
        </div>

        <Button
          type="submit"
          variant="gradient"
          disabled={isLoading || !agreed}
          className="w-full h-10 rounded-xl font-semibold text-xs cursor-pointer shadow-lg shadow-[#1C68FD]/25 hover:shadow-[#DA29F4]/35 transition-all duration-300 disabled:opacity-60"
        >
          {isLoading ? t('auth.sending_otp') : <span className="flex items-center justify-center gap-1.5"><span>{t('auth.verify_email_send_otp')}</span><FleetIcons.ArrowRight className="w-3.5 h-3.5" /></span>}
        </Button>

        <SocialButtons mode="signup" />

        <div className="text-center pt-2">
          <span className="text-[#8a8a8a] text-xs">{t('auth.already_have_account')} </span>
          <Link to="/login" className="text-blue-500 hover:text-blue-400 font-semibold text-xs transition-colors">{t('auth.login_to_portal')}</Link>
        </div>
      </form>
    </div>
  );
};

export default Signup;
