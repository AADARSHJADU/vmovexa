export const Logo = ({ className = '', height = 'h-16 sm:h-20', src = '/logo/logo_clinet.png', alt = 'VMOVEXA PRIVATE LIMITED' }) => (
  <div className={`flex flex-col items-center justify-center ${className}`}>
    <img 
      src={src} 
      alt={alt} 
      className={`${height} w-auto max-w-full object-contain select-none filter drop-shadow-[0_6px_28px_rgba(28,104,253,0.35)] transition-all duration-300 hover:scale-[1.03]`}
    />
  </div>
);

export default Logo;
