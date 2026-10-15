import { Outlet } from 'react-router-dom';
import { LanguageSwitcher } from '../components/LanguageSwitcher';

export const AuthLayout = () => {
  return (
    <div className="h-screen w-screen bg-black text-white flex overflow-hidden select-none relative">
      {/* Top Floating Language Switcher */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-50">
        <LanguageSwitcher />
      </div>

      {/* Left side: Auth Forms (Spacious & Clean with smooth entrance) */}
      <div className="w-full lg:w-1/2 h-full flex flex-col justify-center items-center px-4 py-4 md:px-8 lg:px-12 bg-black overflow-y-auto relative z-10 custom-scrollbar">
        <div className="w-full max-w-[480px] my-auto flex flex-col justify-center animate-form-in p-6 sm:p-7 rounded-2xl border border-zinc-800/60 bg-zinc-950/30 shadow-2xl">
          <Outlet />
        </div>
      </div>

      {/* Right side: Premium Dashboard/Hero Image */}
      <div className="hidden lg:flex lg:w-1/2 h-full relative bg-black items-center overflow-hidden select-none pl-6">
        {/* Ambient atmospheric backdrop lighting glow */}
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px] pointer-events-none animate-glow"></div>
        <div className="absolute bottom-1/3 right-10 w-80 h-80 bg-purple-600/20 rounded-full blur-[100px] pointer-events-none animate-glow" style={{ animationDelay: '2s' }}></div>

        {/* Dark gradient overlays for seamless fade */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent z-10 pointer-events-none"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-transparent z-10 pointer-events-none"></div>

        {/* Crisp Smart Bus Image - Drives smoothly in from the right with gentle luxury idle float */}
        <div className="absolute inset-0 w-full h-full animate-bus-in pointer-events-none">
          <img
            src="/bus.jpeg"
            alt="VMOVEXA Smart Bus"
            className="w-full h-full object-cover object-center animate-bus-float pointer-events-none opacity-90"
            onError={(e) => {
              e.target.src = "/image 19.png";
            }}
          />
        </div>

        {/* Overlay Text Content with Staggered Slide-in from Right */}
        <div className="absolute bottom-10 left-10 right-10 z-20 pointer-events-none space-y-2.5">
          <div className="animate-text-in-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 mb-1 rounded-full border border-blue-500/30 bg-blue-500/10 backdrop-blur-md">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping"></span>
              <span className="text-blue-400 font-bold text-xs tracking-wider uppercase">VMOVEXA PRIVATE LIMITED</span>
            </div>
          </div>

          <h2 className="animate-text-in-2 text-3xl xl:text-4xl font-bold tracking-tight leading-tight text-white drop-shadow-lg">
            Intelligent Mobility.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1C68FD] via-[#9e46f6] to-[#DA29F4]">
              Connected Future.
            </span>
          </h2>

          <p className="animate-text-in-3 text-sm text-gray-300 max-w-md drop-shadow-md leading-relaxed">
            Manage your entire fleet ecosystem from a single, powerful platform designed for scale, efficiency, and smart city integration.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
