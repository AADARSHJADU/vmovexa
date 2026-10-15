import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { OtpInput } from '../../components/OtpInput';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';

export const ForgotPassword = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { forgotPassword, resetPassword } = useAuth();

  // Multi-step: 1 = Request OTP, 2 = Verify OTP & Set Password, 3 = Success
  const [step, setStep] = useState(1);

  // Form State
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword1, setShowPassword1] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);

  // Status & Timers
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [devCode, setDevCode] = useState(null);

  // Resend Countdown Timer
  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Password validation helpers
  const hasMinLength = newPassword.length >= 8;
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSpecial = /[^A-Za-z0-9]/.test(newPassword);
  const isPasswordValid = hasMinLength && hasUppercase && hasNumber && hasSpecial;
  const doPasswordsMatch = confirmPassword.length > 0 && newPassword === confirmPassword;

  // Auto-redirect to login after successful password reset
  useEffect(() => {
    let timer;
    if (step === 3) {
      timer = setTimeout(() => {
        navigate('/login', { replace: true });
      }, 4000);
    }
    return () => clearTimeout(timer);
  }, [step, navigate]);

  // STEP 1: Send OTP to Email
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      toast.error('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    try {
      const res = await forgotPassword(cleanEmail);
      if (res?.data?.devCode) {
        setDevCode(res.data.devCode);
      }
      toast.success(res?.message || 'Verification OTP code sent to your email!');
      setResendCooldown(60);
      setStep(2);
    } catch (err) {
      toast.error(err?.message || 'No account found with this email address.');
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: Resend OTP
  const handleResendOtp = async () => {
    if (resendCooldown > 0 || resending) return;
    setResending(true);
    try {
      const res = await forgotPassword(email.trim().toLowerCase());
      if (res?.data?.devCode) {
        setDevCode(res.data.devCode);
      }
      toast.success(res?.message || 'A fresh 6-digit verification code has been sent!');
      setResendCooldown(60);
    } catch (err) {
      toast.error(err?.message || 'Failed to resend OTP.');
    } finally {
      setResending(false);
    }
  };

  // STEP 2: Verify OTP & Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();

    const cleanOtp = String(otpCode || '').trim();
    if (!cleanOtp || cleanOtp.length !== 6) {
      toast.error('Please enter the complete 6-digit OTP code.');
      return;
    }
    if (!hasMinLength) {
      toast.error('Password must be at least 8 characters long.');
      return;
    }
    if (!hasUppercase) {
      toast.error('Password must contain at least one uppercase letter.');
      return;
    }
    if (!hasNumber) {
      toast.error('Password must contain at least one number.');
      return;
    }
    if (!hasSpecial) {
      toast.error('Password must contain at least one special character.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await resetPassword({
        email: email.trim().toLowerCase(),
        code: cleanOtp,
        newPassword,
      });
      toast.success(res?.message || 'Password changed successfully! You can now log in.', { duration: 4000 });
      setStep(3);
    } catch (err) {
      toast.error(err?.message || 'Invalid or expired OTP code.');
    } finally {
      setLoading(false);
    }
  };

  // Check Item Component
  const CheckItem = ({ satisfied, text }) => (
    <div className={`flex items-center gap-1 text-[11px] font-medium transition-colors ${satisfied ? 'text-emerald-400' : 'text-slate-500'}`}>
      <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20">
        {satisfied ? (
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        ) : (
          <circle cx="10" cy="10" r="4" />
        )}
      </svg>
      <span>{text}</span>
    </div>
  );

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-md relative animate-in fade-in duration-200">
      {/* Back to Login Arrow */}
      {step !== 3 && (
        <Link
          to="/login"
          className="absolute -top-2 left-0 p-1.5 hover:bg-[#1a1a1a] rounded-full transition-colors text-slate-400 hover:text-white"
          title="Back to login"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
      )}

      {/* Header Icon */}
      <div className="w-16 h-16 mb-4 relative flex items-center justify-center">
        {step === 3 ? (
          <div className="w-14 h-14 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center text-emerald-400">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        ) : (
          <>
            <div className="absolute inset-0 border-2 border-purple-500 rounded-full animate-[spin_10s_linear_infinite]"></div>
            <div className="absolute inset-1.5 border border-blue-500 rounded-full animate-[spin_15s_linear_infinite_reverse]"></div>
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/20 to-blue-500/20 blur-xl rounded-full"></div>
          </>
        )}
      </div>

      {/* STEP 1: Enter Registered Email */}
      {step === 1 && (
        <>
          <div className="text-center mb-5">
            <h1 className="text-xl font-bold tracking-tight text-white mb-1">
              {t('auth.forgot_password', 'Forgot Password?')}
            </h1>
            <p className="text-[#8a8a8a] text-xs px-2">
              {t('auth.forgot_sub_otp', 'Enter your registered email address and we will send a 6-digit OTP code to reset your password.')}
            </p>
          </div>

          <form onSubmit={handleRequestOtp} className="w-full space-y-4">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('auth.email', 'Enter your registered email address')}
              required
              autoFocus
              className="h-11 text-xs"
              leftIcon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              }
            />

            <div className="pt-1 flex flex-col gap-2.5">
              <Button
                type="submit"
                variant="gradient"
                disabled={loading}
                className="w-full h-11 rounded-xl font-bold text-xs cursor-pointer shadow-lg shadow-[#1C68FD]/25 hover:shadow-[#DA29F4]/35 transition-all duration-300 flex items-center justify-center gap-2"
              >
                {loading && <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
                <span>{loading ? 'Sending OTP Code…' : 'Send Reset OTP Code'}</span>
              </Button>

              <Link
                to="/login"
                className="text-center text-blue-500 hover:text-blue-400 font-medium text-xs transition-colors py-1"
              >
                {t('auth.back_to_login', 'Back to Login')}
              </Link>
            </div>
          </form>
        </>
      )}

      {/* STEP 2: Enter OTP & New Password */}
      {step === 2 && (
        <>
          <div className="text-center mb-4">
            <h1 className="text-xl font-bold tracking-tight text-white mb-1">
              {t('auth.reset_password', 'Reset Your Password')}
            </h1>
            <p className="text-[#8a8a8a] text-xs">
              Enter the 6-digit code sent to <strong className="text-slate-200">{email}</strong>
              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setOtpCode('');
                  setDevCode(null);
                }}
                className="ml-2 text-blue-400 hover:text-blue-300 underline font-semibold text-xs cursor-pointer"
              >
                Edit
              </button>
            </p>

            {/* Dev helper banner */}
            {devCode && (
              <div className="mt-2.5 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 font-mono text-xs">
                <span>Dev Testing OTP:</span>
                <button
                  type="button"
                  onClick={() => setOtpCode(devCode)}
                  className="font-black text-amber-300 tracking-widest hover:underline cursor-pointer"
                  title="Click to auto-fill"
                >
                  {devCode} (click to fill)
                </button>
              </div>
            )}
          </div>

          <form onSubmit={handleResetPassword} className="w-full space-y-4">
            {/* 6-Digit OTP Box */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block text-center">
                6-Digit Verification Code *
              </label>
              <OtpInput
                length={6}
                value={otpCode}
                onChange={setOtpCode}
                onComplete={(code) => setOtpCode(code)}
              />
              <div className="flex items-center justify-between pt-1 px-1 text-xs">
                <span className="text-[#8a8a8a] text-[11px]">Didn't receive code?</span>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendCooldown > 0 || resending}
                  className="text-blue-400 hover:text-blue-300 font-semibold text-[11px] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {resending
                    ? 'Resending…'
                    : resendCooldown > 0
                    ? `Resend in ${resendCooldown}s`
                    : 'Resend OTP Code'}
                </button>
              </div>
            </div>

            {/* New Password Input */}
            <div className="space-y-1">
              <Input
                type={showPassword1 ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder={t('auth.new_password', 'New Password')}
                required
                className="h-10 text-xs"
                leftIcon={
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                }
                rightIcon={
                  <button type="button" onClick={() => setShowPassword1(!showPassword1)} className="focus:outline-none cursor-pointer">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      {showPassword1 ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      )}
                    </svg>
                  </button>
                }
              />

              {/* Password Strength Checklist */}
              <div className="grid grid-cols-2 gap-1.5 py-1 px-1 bg-[#1a1a1a]/40 rounded-lg p-2 border border-[#2a2a2a]/60">
                <CheckItem satisfied={hasMinLength} text="8+ characters" />
                <CheckItem satisfied={hasUppercase} text="1 uppercase letter" />
                <CheckItem satisfied={hasNumber} text="1 number" />
                <CheckItem satisfied={hasSpecial} text="1 special character" />
              </div>
            </div>

            {/* Confirm Password Input */}
            <div className="space-y-1">
              <Input
                type={showPassword2 ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={t('auth.confirm_password', 'Confirm New Password')}
                required
                className="h-10 text-xs"
                leftIcon={
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                }
                rightIcon={
                  <button type="button" onClick={() => setShowPassword2(!showPassword2)} className="focus:outline-none cursor-pointer">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      {showPassword2 ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      )}
                    </svg>
                  </button>
                }
              />
              {confirmPassword && (
                <div className="px-1 text-[11px]">
                  {doPasswordsMatch ? (
                    <span className="text-emerald-400 font-medium flex items-center gap-1">
                      <span>✓</span> Passwords match
                    </span>
                  ) : (
                    <span className="text-rose-400 font-medium flex items-center gap-1">
                      <span>✕</span> Passwords do not match
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-2 flex flex-col gap-2">
              <Button
                type="submit"
                variant="gradient"
                disabled={loading || !isPasswordValid || !doPasswordsMatch || otpCode.length !== 6}
                className="w-full h-11 rounded-xl font-bold text-xs cursor-pointer shadow-lg shadow-[#1C68FD]/25 hover:shadow-[#DA29F4]/35 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading && <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
                <span>{loading ? 'Verifying & Resetting…' : 'Reset Password'}</span>
              </Button>
            </div>
          </form>
        </>
      )}

      {/* STEP 3: Success Confirmation */}
      {step === 3 && (
        <div className="w-full text-center space-y-4 animate-in fade-in zoom-in-95 duration-200">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white mb-1">
              Password Reset Complete!
            </h1>
            <p className="text-[#8a8a8a] text-xs">
              Your password has been successfully updated. All previous sessions have been logged out for security.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-800/40 text-emerald-300 text-xs text-left space-y-1">
            <p className="font-bold flex items-center gap-1.5 text-emerald-400">
              <span>🛡️</span> Security Confirmation
            </p>
            <p className="text-[11px] text-emerald-300/80">
              You can now log in securely to VMOVEXA ONE with your new password.
            </p>
          </div>

          <div className="pt-2">
            <Button
              type="button"
              variant="gradient"
              onClick={() => navigate('/login', { replace: true })}
              className="w-full h-11 rounded-xl font-bold text-xs cursor-pointer shadow-lg shadow-[#1C68FD]/25 hover:shadow-[#DA29F4]/35 transition-all duration-300"
            >
              Back to Login
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ForgotPassword;
