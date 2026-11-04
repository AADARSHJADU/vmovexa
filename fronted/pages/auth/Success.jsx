import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import { Button } from '../../components/Button';
import { FleetIcons } from '../../components/FleetIcons';

export const Success = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center w-full relative">
      <Link to="/login" className="absolute top-0 left-0 p-1.5 hover:bg-[#1a1a1a] rounded-full transition-colors">
        <FleetIcons.ArrowLeft className="w-5 h-5 text-white" />
      </Link>

      <div className="w-20 h-20 mb-4 relative flex items-center justify-center">
        {/* Animated Checkmark and rings */}
        <div className="absolute inset-0 border-[2px] border-purple-500 rounded-full animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
        <div className="absolute inset-1.5 border-[3px] border-blue-500 rounded-full bg-black flex items-center justify-center z-10 shadow-[0_0_20px_rgba(0,100,255,0.4)]">
          <FleetIcons.Check className="w-8 h-8 text-blue-400 drop-shadow-[0_0_10px_rgba(0,100,255,0.8)]" />
        </div>
        
        {/* Confetti specs */}
        <div className="absolute top-0 left-0 w-1.5 h-1.5 bg-yellow-400 rotate-45 animate-bounce"></div>
        <div className="absolute top-2 right-1 w-1.5 h-1.5 bg-pink-400 rotate-12 animate-pulse"></div>
        <div className="absolute bottom-2 right-4 w-1.5 h-1.5 bg-green-400 rotate-45"></div>
        <div className="absolute bottom-0 left-2 w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"></div>
      </div>

      <div className="text-center mb-6">
        <h1 className="text-xl font-bold tracking-tight text-white mb-1">{t('auth.password_updated_title')}</h1>
        <p className="text-[#8a8a8a] text-xs px-2">{t('auth.password_updated_sub')}</p>
      </div>

      <div className="w-full">
        <Button 
          onClick={() => navigate('/login')}
          variant="gradient"
          className="w-full h-10 rounded-xl font-semibold text-xs cursor-pointer shadow-lg shadow-[#1C68FD]/25 hover:shadow-[#DA29F4]/35 transition-all duration-300"
        >
          {t('auth.go_to_login')}
        </Button>
      </div>
    </div>
  );
};

export default Success;
