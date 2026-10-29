import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { SocialButtons } from '../../components/SocialButtons';
import { Logo } from '../../components/Logo';
import { useTranslation } from '../../hooks/useTranslation';

export const LoginPhone = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleLogin = (e) => {
    e.preventDefault();
    navigate('/verify-otp');
  };

  return (
    <div className="w-full flex flex-col items-center">
      <Logo className="mb-3" />
      
      <div className="text-center mb-4">
        <h1 className="text-xl font-bold tracking-tight text-white mb-0.5">{t('common.welcome', 'Welcome Back!')}</h1>
        <p className="text-[#8a8a8a] text-xs">{t('auth.login_with_phone', 'Login with Phone Number')}</p>
      </div>
      
      <form onSubmit={handleLogin} className="space-y-3 w-full flex flex-col">
        <Input 
          type="tel" 
          placeholder={t('auth.phone', 'Enter Phone Number')} 
          required 
          className="h-10 text-xs"
          leftIcon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          }
        />

        <Button 
          type="submit" 
          variant="gradient"
          className="w-full h-10 rounded-xl font-semibold text-sm mt-1 cursor-pointer shadow-lg shadow-[#1C68FD]/25 hover:shadow-[#DA29F4]/35 transition-all duration-300"
        >
          {t('auth.send_otp', 'Send OTP')}
        </Button>
        
        <SocialButtons />
        
        <div className="text-center pt-2 flex items-center justify-center gap-1.5 text-xs text-[#8a8a8a]">
          <span>{t('auth.dont_have_account', "Don't have an account?")}</span>
          <Link to="/signup" className="text-blue-500 hover:text-blue-400 font-medium text-xs transition-colors">
            {t('auth.create_account', 'Create Account')}
          </Link>
        </div>

        <div className="text-center pt-1">
          <Link to="/login" className="text-[11px] text-zinc-400 hover:text-white transition-colors">
            ← {t('auth.login_with_email', 'Login with Email Address')}
          </Link>
        </div>
      </form>
    </div>
  );
};
