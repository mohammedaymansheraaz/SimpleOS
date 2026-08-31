import React, { useState, useEffect, useRef } from 'react';
import { useOS } from '../../context/OSContext';
import { 
  Lock, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  Wifi, 
  Battery, 
  ShieldAlert, 
  User 
} from 'lucide-react';
import { OSIcon } from '../common/OSIcon';
import { sound } from '../../services/audio';

export const LockScreen: React.FC = () => {
  const { isLocked, unlockScreen, settings } = useOS();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isShaking, setIsShaking] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const inputRef = useRef<HTMLInputElement>(null);

  const profile = settings.userProfile || {
    username: 'simple',
    displayName: 'SimpleOS User',
    avatar: 'User',
    hasPassword: false,
    lockWallpaperBlur: 'medium',
  };

  // Live Clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Reset & focus
  useEffect(() => {
    if (isLocked) {
      setPassword('');
      setErrorMsg(null);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isLocked]);

  const handleUnlock = () => {
    if (profile.hasPassword) {
      const res = unlockScreen(password);
      if (!res.success) {
        setErrorMsg(res.error || 'Incorrect password');
        setIsShaking(true);
        sound.playErrorBeep();
        setTimeout(() => setIsShaking(false), 500);
        setPassword('');
        inputRef.current?.focus();
      } else {
        setErrorMsg(null);
        setPassword('');
        sound.playSuccessChime();
      }
    } else {
      unlockScreen();
      sound.playSuccessChime();
    }
  };

  // Keyboard Enter handler
  useEffect(() => {
    if (!isLocked) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleUnlock();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLocked, password, profile.hasPassword]);

  if (!isLocked) return null;

  const hours = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  const dateStr = currentTime.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div 
      className="fixed inset-0 z-[9999] flex flex-col justify-between items-center py-12 px-6 select-none overflow-hidden bg-black text-stone-100 font-sans animate-fade-in"
      onClick={() => {
        if (!profile.hasPassword) {
          handleUnlock();
        }
      }}
    >
      {/* Blurred Wallpaper */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-all duration-1000 transform scale-105 filter blur-xl opacity-40"
        style={{ backgroundImage: `url(${settings.wallpaper})` }}
      />
      <div className="absolute inset-0 bg-black/50" />

      {/* Top Simple Bar */}
      <div className="relative z-10 w-full max-w-4xl flex items-center justify-between text-xs font-mono text-stone-400 px-2">
        <div className="flex items-center gap-2">
          <Lock className="w-3.5 h-3.5 text-stone-400" />
          <span className="font-semibold text-stone-300">SimpleOS</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <Wifi className="w-3.5 h-3.5 text-stone-300" />
            <span className="text-[11px]">Connected</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Battery className="w-4 h-4 text-stone-300" />
            <span className="text-[11px]">100%</span>
          </div>
        </div>
      </div>

      {/* Center Minimal Clock & User */}
      <div className="relative z-10 flex flex-col items-center justify-center my-auto text-center max-w-sm w-full">
        {/* Minimalist Clock */}
        <div className="mb-12">
          <h1 className="text-7xl sm:text-8xl font-light font-sans tracking-tight text-white/95 drop-shadow-lg">
            {hours}
          </h1>
          <p className="text-sm font-light text-stone-300 mt-2 tracking-wide">
            {dateStr}
          </p>
        </div>

        {/* Minimalist User Profile */}
        <div 
          className={`flex flex-col items-center w-full transition-transform duration-300 ${
            isShaking ? 'animate-bounce' : ''
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="w-16 h-16 rounded-full bg-white/10 border border-white/20 flex items-center justify-center mb-3 shadow-md overflow-hidden">
            {profile.avatar && (profile.avatar.startsWith('http') || profile.avatar.startsWith('data:')) ? (
              <img src={profile.avatar} alt="User" className="w-full h-full object-cover" />
            ) : (
              <OSIcon name={profile.avatar || 'User'} className="w-8 h-8 text-stone-200" />
            )}
          </div>

          <h2 className="text-base font-medium text-stone-100 tracking-normal mb-4">
            {profile.displayName || 'SimpleOS User'}
          </h2>

          {/* Password Input or Click to Unlock */}
          {profile.hasPassword ? (
            <div className="w-full flex flex-col items-center gap-2">
              <div className="relative w-full">
                <input
                  ref={inputRef}
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMsg) setErrorMsg(null);
                  }}
                  placeholder="Password"
                  className="w-full bg-white/10 hover:bg-white/15 focus:bg-white/20 border border-white/20 focus:border-white/40 rounded-full px-5 py-2.5 text-stone-100 placeholder-stone-400 text-sm font-sans outline-none text-center transition-all pr-12 shadow-inner"
                  autoFocus
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-1.5 text-stone-400 hover:text-stone-200 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    type="button"
                    onClick={handleUnlock}
                    className="p-1.5 rounded-full bg-stone-200 hover:bg-white text-stone-950 transition-transform active:scale-90 shadow"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {errorMsg && (
                <div className="text-rose-400 text-xs font-mono flex items-center gap-1 mt-1">
                  <ShieldAlert className="w-3 h-3" />
                  <span>{errorMsg}</span>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={handleUnlock}
              className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-stone-200 hover:text-white text-xs font-medium tracking-wide transition-all shadow-sm group"
            >
              <span>Click or Press Enter to Unlock</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
            </button>
          )}
        </div>
      </div>

      {/* Bottom Hint */}
      <div className="relative z-10 text-[11px] text-stone-400 font-sans tracking-wide">
        SimpleOS • Minimalist Web Operating System
      </div>
    </div>
  );
};
