import React from 'react';
import { useOS } from '../../context/OSContext';
import {
  Volume2,
  VolumeX,
  Sun,
  Moon,
  Wifi,
  Bluetooth,
  BatteryCharging,
  Maximize2,
  Minimize2,
  Sparkles,
  Settings,
  HardDrive,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface QuickSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QuickSettings: React.FC<QuickSettingsProps> = ({ isOpen, onClose }) => {
  const { settings, updateSettings, setTheme, openApp } = useOS();

  if (!isOpen) return null;

  const toggleTheme = () => {
    setTheme(settings.theme === 'dark' ? 'light' : 'dark');
  };

  const toggleSound = () => {
    updateSettings({ soundEnabled: !settings.soundEnabled });
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 15, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 15, scale: 0.95 }}
        transition={{ duration: 0.15 }}
        className="fixed top-10 right-4 w-84 bg-[#0c0c0c]/95 backdrop-blur-2xl border border-white/15 rounded-3xl p-4 shadow-[0_30px_70px_rgba(0,0,0,0.9)] z-50 text-stone-200 font-sans select-none flex flex-col gap-4"
      >
        {/* Quick Toggles Grid */}
        <div className="grid grid-cols-3 gap-2">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition-all ${
              settings.theme === 'dark'
                ? 'bg-white/10 border-white/20 text-stone-100'
                : 'bg-white/5 border-white/10 text-stone-400'
            }`}
          >
            {settings.theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            <span className="text-[10px] uppercase tracking-wider font-semibold capitalize">{settings.theme}</span>
          </button>

          {/* Sound toggle */}
          <button
            onClick={toggleSound}
            className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition-all ${
              settings.soundEnabled
                ? 'bg-white/10 border-white/20 text-stone-100'
                : 'bg-white/5 border-white/10 text-stone-500'
            }`}
          >
            {settings.soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            <span className="text-[10px] uppercase tracking-wider font-semibold">{settings.soundEnabled ? 'Audio On' : 'Muted'}</span>
          </button>

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            className="p-3 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 flex flex-col items-center justify-center gap-1.5 transition-all text-stone-300 hover:text-white"
          >
            <Maximize2 className="w-5 h-5" />
            <span className="text-[10px] uppercase tracking-wider font-semibold">Display</span>
          </button>
        </div>

        {/* Sliders */}
        <div className="flex flex-col gap-3 bg-black/60 p-3.5 rounded-2xl border border-white/10">
          {/* Volume Slider */}
          <div className="flex items-center gap-3">
            <Volume2 className="w-4 h-4 text-stone-400 shrink-0" />
            <input
              type="range"
              min="0"
              max="100"
              value={settings.volume}
              onChange={(e) => updateSettings({ volume: Number(e.target.value) })}
              className="flex-1 h-1.5 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-stone-200"
            />
            <span className="text-[11px] font-mono text-stone-400 w-7 text-right">{settings.volume}%</span>
          </div>
        </div>

        {/* Battery & Network Status */}
        <div className="flex items-center justify-between px-2 text-xs text-stone-400">
          <div className="flex items-center gap-2 font-mono text-[11px]">
            <Wifi className="w-3.5 h-3.5 text-stone-300" />
            <span>CONNECTED</span>
          </div>
          <div className="flex items-center gap-1.5 text-stone-300 font-mono text-[11px]">
            <BatteryCharging className="w-3.5 h-3.5 text-stone-300" />
            <span>100% PWR</span>
          </div>
        </div>

        {/* Footer Quick Links */}
        <div className="pt-2 border-t border-white/10 flex items-center justify-between">
          <button
            onClick={() => {
              openApp('settings');
              onClose();
            }}
            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold text-stone-100 flex items-center gap-1.5 transition-colors"
          >
            <Settings className="w-3.5 h-3.5" /> Preferences
          </button>
          <span className="text-[10px] text-stone-600 font-mono">SIMPLEOS_V2</span>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
