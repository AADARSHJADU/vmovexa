import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../../components/Button';
import { OtpInput } from '../../components/OtpInput';
import { useAuth } from '../../hooks/useAuth';
import { homeForRole } from '../../constants/roles';
import toast from 'react-hot-toast';

export const OtpVerification = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { verifySignupOtp, verifyLoginOtp, requestSignupOtp } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [otpCode, setOtpCode] = useState('');

  // Extract navigation context from location.state
  const { name = '', email = '', identifier = '', password = '', purpose = 'registration', devCode: initialDevCode = null } = location.state || {};
  const targetEmail = (email || identifier || '').trim();
  const [devCode, setDevCode] = useState(initialDevCode);

  const handleVerify = async (codeToVerify = otpCode) => {
    const code = codeToVerify || otpCode;
    if (!code || code.length < 6) {
      toast.error('Please enter the complete 6-digit verification code.');
      return;
    }

    setLoading(true);
    try {
      if (purpose === 'login') {
        const tid = toast.loading('Verifying code & logging in...');
        const result = await verifyLoginOtp({
          identifier: targetEmail.toLowerCase(),
          code,
        });
        toast.dismiss(tid);
        toast.success('Login verified successfully!');
        const roleCode =
          (typeof result?.user?.role === 'object' ? result?.user?.role?.code : result?.user?.role) ||
          result?.user?.roleCode ||
          result?.roleCode;
        navigate(homeForRole(roleCode, result?.user), { replace: true });
        return;
      }

      if (purpose === 'registration') {
        const tid = toast.loading('Verifying code & creating account...');
        await verifySignupOtp({
          name: name || 'Tenant Admin',
          email: targetEmail.toLowerCase(),
          password,
          code,
        });
        toast.dismiss(tid);
        toast.success('Email verified successfully! Welcome to VMOVEXA.');
        navigate('/admin/dashboard', { replace: true });
      } else {
        toast.success('OTP verified successfully!');
        navigate('/admin/dashboard', { replace: true });
      }
    } catch (err) {
      toast.error(err?.message || 'Invalid or expired OTP code.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!targetEmail) {
      toast.error('Email address missing. Please return to login/signup.');
      return;
    }
    setResending(true);
    try {
      const res = await requestSignupOtp({ name: name || 'Tenant Admin', email: targetEmail });
      if (res?.data?.devCode) setDevCode(res.data.devCode);
      const devMsg = res?.data?.devCode ? ` (Dev OTP: ${res.data.devCode})` : '';
      toast.success(`Fresh OTP code sent to ${targetEmail}${devMsg}`);
    } catch (err) {
      toast.error(err?.message || 'Failed to resend OTP code.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-md relative">
      <Link to="/signup" className="absolute top-0 left-0 p-1.5 hover:bg-[#1a1a1a] rounded-full transition-colors text-slate-400 hover:text-white">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </Link>
      
      <div className="w-16 h-16 mb-4 relative flex items-center justify-center">
        <svg viewBox="0 0 100 100" className="w-full h-full text-blue-500" fill="none">
          <path d="M50 5 L90 25 L90 75 L50 95 L10 75 L10 25 Z" stroke="currentColor" strokeWidth="3" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} stroke="white" d="M50 35v5m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H44a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V33a4 4 0 00-8 0v4h8z" />
        </svg>
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/20 to-purple-500/20 blur-xl rounded-full"></div>
      </div>

      <div className="text-center mb-5">
        <h1 className="text-xl font-bold tracking-tight text-white mb-1">
          {purpose === 'login' ? 'Two-Factor Authentication' : 'Verify Your Email'}
        </h1>
        <p className="text-[#8a8a8a] text-xs">
          Enter the 6-digit code sent to <strong className="text-slate-200">{targetEmail || 'your email'}</strong>
        </p>

        {devCode && (
          <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 font-mono text-xs font-bold">
            <span>Dev Testing Code:</span>
            <span className="text-amber-300 font-black tracking-widest">{devCode}</span>
          </div>
        )}
      </div>

      <div className="w-full space-y-4">
        <OtpInput
          length={6}
          onChange={(val) => setOtpCode(val)}
          onComplete={(code) => {
            setOtpCode(code);
            handleVerify(code);
          }}
        />

        <div className="text-center pt-1">
          <button
            type="button"
            onClick={handleResend}
            disabled={resending}
            className="text-xs font-semibold text-blue-400 hover:text-blue-300 disabled:opacity-50 transition-colors"
          >
            {resending ? 'Resending Code…' : 'Didn’t receive code? Resend OTP'}
          </button>
        </div>

        <Button 
          onClick={() => handleVerify()} 
          disabled={loading || otpCode.length < 6}
          variant="gradient"
          className="w-full h-10 rounded-xl font-semibold text-xs cursor-pointer shadow-lg shadow-[#1C68FD]/25 hover:shadow-[#DA29F4]/35 transition-all duration-300 disabled:opacity-50"
        >
          {loading ? 'Verifying OTP Code…' : 'Verify & Continue →'}
        </Button>
      </div>
    </div>
  );
};

export default OtpVerification;
