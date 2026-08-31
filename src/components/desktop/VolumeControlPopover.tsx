import React, { useRef, useEffect } from 'react';
import { useOS } from '../../context/OSContext';
import { sound } from '../../services/audio';
import {
  Volume2,
  VolumeX,
  Volume1,
  Sparkles,
  Sliders,
  Check,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface VolumeControlPopoverProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VolumeControlPopover: React.FC<VolumeControlPopoverProps> = ({
  isOpen,
  onClose,
}) => {
  const { settings, updateSettings } = useOS();
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close when clicked outside
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const currentVolume = settings.soundEnabled ? settings.volume : 0;

  const handleVolumeChange = (newVal: number) => {
    const val = Math.max(0, Math.min(100, newVal));
    updateSettings({
      volume: val,
      soundEnabled: val > 0 ? true : settings.soundEnabled,
    });
    // Test audio feedback
    if (val > 0) {
      sound.playClick();
    }
  };

  const toggleMute = () => {
    if (settings.soundEnabled && settings.volume > 0) {
      updateSettings({ soundEnabled: false });
    } else {
      updateSettings({
        soundEnabled: true,
        volume: settings.volume === 0 ? 75 : settings.volume,
      });
      sound.playSuccessChime();
    }
  };

  const setPresetVolume = (lvl: number) => {
    if (lvl === 0) {
      updateSettings({ soundEnabled: false, volume: 0 });
    } else {
      updateSettings({ soundEnabled: true, volume: lvl });
      sound.playClick();
    }
  };

  const getVolumeIcon = () => {
    if (!settings.soundEnabled || settings.volume === 0) {
      return <VolumeX className="w-5 h-5 text-rose-400" />;
    }
    if (settings.volume < 40) {
      return <Volume1 className="w-5 h-5 text-stone-300" />;
    }
    return <Volume2 className="w-5 h-5 text-stone-100" />;
  };

  return (
    <AnimatePresence>
      <motion.div
        ref={popoverRef}
        initial={{ opacity: 0, y: -8, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -8, scale: 0.96 }}
        transition={{ duration: 0.12 }}
        className="fixed top-9 right-16 w-80 bg-[#0c0c0c]/95 backdrop-blur-2xl border border-white/20 rounded-2xl p-4 shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-50 text-stone-200 select-none flex flex-col gap-4 font-sans"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-stone-400" />
            <span className="text-xs font-semibold tracking-tight text-stone-100">
              System Audio Control
            </span>
          </div>
          <div className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-stone-300">
            {settings.soundEnabled ? `${settings.volume}%` : 'MUTED'}
          </div>
        </div>

        {/* Volume Slider Section */}
        <div className="flex flex-col gap-2.5 bg-black/50 p-3 rounded-xl border border-white/10">
          <div className="flex items-center justify-between text-xs text-stone-400">
            <span>Master Volume</span>
            <button
              onClick={toggleMute}
              className="text-[11px] hover:text-stone-100 underline decoration-dotted transition-colors"
            >
              {settings.soundEnabled ? 'Mute Audio' : 'Unmute'}
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleMute}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 transition-all text-stone-300 hover:text-white"
              title={settings.soundEnabled ? 'Click to Mute' : 'Click to Unmute'}
            >
              {getVolumeIcon()}
            </button>

            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={currentVolume}
              onChange={(e) => handleVolumeChange(Number(e.target.value))}
              className="flex-1 h-2 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-stone-100"
            />

            <span className="text-xs font-mono font-bold text-stone-200 w-9 text-right">
              {currentVolume}%
            </span>
          </div>
        </div>

        {/* Quick Level Presets */}
        <div className="flex flex-col gap-1.5">
          <div className="text-[10px] uppercase font-mono tracking-wider text-stone-400">
            Level Presets
          </div>
          <div className="grid grid-cols-5 gap-1.5">
            {[
              { label: '0%', val: 0 },
              { label: '25%', val: 25 },
              { label: '50%', val: 50 },
              { label: '75%', val: 75 },
              { label: '100%', val: 100 },
            ].map((preset) => {
              const isActive =
                (preset.val === 0 && (!settings.soundEnabled || settings.volume === 0)) ||
                (settings.soundEnabled && settings.volume === preset.val);

              return (
                <button
                  key={preset.label}
                  onClick={() => setPresetVolume(preset.val)}
                  className={`py-1.5 rounded-lg text-xs font-mono font-medium border transition-all ${
                    isActive
                      ? 'bg-stone-200 text-black border-stone-200 shadow-md font-bold'
                      : 'bg-white/5 border-white/10 text-stone-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Audio Output device info */}
        <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-stone-400">
          <div className="flex items-center gap-1.5 truncate">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="truncate">Built-in Speakers (Synthesizer Ready)</span>
          </div>
          <button
            onClick={() => sound.playSuccessChime()}
            className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-stone-200 transition-colors"
            title="Play chime to test volume"
          >
            Test Sound
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
