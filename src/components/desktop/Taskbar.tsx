import React, { useState, useEffect } from 'react';
import { useOS } from '../../context/OSContext';
import { OSIcon } from '../common/OSIcon';
import {
  Volume2,
  VolumeX,
  Wifi,
  Search,
  Sliders,
  Sparkles,
} from 'lucide-react';
import { StartMenu } from './StartMenu';
import { QuickSettings } from './QuickSettings';
import { VolumeControlPopover } from './VolumeControlPopover';

export const Taskbar: React.FC = () => {
  const {
    windows,
    focusWindow,
    minimizeWindow,
    openApp,
    installedApps,
    settings,
    activeWindowId,
    notifications,
    openSearch,
  } = useOS();

  const [isStartOpen, setIsStartOpen] = useState(false);
  const [isQuickSettingsOpen, setIsQuickSettingsOpen] = useState(false);
  const [isVolumePopoverOpen, setIsVolumePopoverOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Clock ticker
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedDateTime = currentTime
    .toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    })
    .toUpperCase() +
    ', ' +
    currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).toUpperCase();

  // Pinned Dock apps representing core and basic apps
  const pinnedAppIds = [
    'files',
    'browser',
    'editor',
    'calc',
    'appstore',
    'clock',
    'calendar',
    'weather',
    'camera',
    'paint',
    'terminal',
    'media',
    'settings',
  ];

  const handleAppIconClick不易 = (appId: string) => {
    const matchingWindows = windows.filter(
      (w) =>
        w.appId === appId ||
        (w.appId === 'calculator' && appId === 'calc') ||
        (w.appId === 'text-editor' && appId === 'editor') ||
        (w.appId === 'file-explorer' && appId === 'files') ||
        (w.appId === 'app-store' && appId === 'appstore') ||
        (w.appId === 'web-browser' && appId === 'browser') ||
        (w.appId === 'media-player' && appId === 'media')
    );
    if (matchingWindows.length === 0) {
      openApp(appId);
    } else {
      const activeWindow = matchingWindows.find((w) => w.id === activeWindowId);
      if (activeWindow) {
        minimizeWindow(activeWindow.id);
      } else {
        focusWindow(matchingWindows[0].id);
      }
    }
  };

  const handleWindowTabClick = (windowId: string, isMinimized: boolean) => {
    if (isMinimized || activeWindowId !== windowId) {
      focusWindow(windowId);
    } else {
      minimizeWindow(windowId);
    }
  };

  return (
    <>
      {/* Top Minimalist System Bar */}
      <nav className="fixed top-0 inset-x-0 h-8 bg-black/80 backdrop-blur-md flex justify-between items-center px-4 border-b border-white/10 z-50 select-none text-stone-300">
        <div className="flex items-center gap-5">
          <button
            onClick={() => {
              setIsStartOpen(!isStartOpen);
              if (isQuickSettingsOpen) setIsQuickSettingsOpen(false);
              if (isVolumePopoverOpen) setIsVolumePopoverOpen(false);
            }}
            className="flex items-center gap-1.5 text-stone-100 hover:text-white transition-colors"
          >
            <span className="font-semibold tracking-tight text-xs text-stone-100">
              SimpleOS
            </span>
          </button>

          <div className="hidden sm:flex gap-4 text-[11px] font-medium text-stone-400">
            <button
              onClick={() => openApp('file-explorer')}
              className="hover:text-stone-100 transition-colors"
            >
              Files
            </button>
            <button
              onClick={() => openApp('web-browser')}
              className="hover:text-stone-100 transition-colors"
            >
              Browser
            </button>
            <button
              onClick={() => openApp('text-editor')}
              className="hover:text-stone-100 transition-colors"
            >
              Editor
            </button>
            <button
              onClick={() => openApp('calculator')}
              className="hover:text-stone-100 transition-colors"
            >
              Calculator
            </button>
            <button
              onClick={() => openApp('app-store')}
              className="hover:text-stone-100 transition-colors"
            >
              App Store
            </button>
            <button
              onClick={() => openApp('terminal')}
              className="hover:text-stone-100 transition-colors"
            >
              Terminal
            </button>
          </div>
        </div>

        {/* Center Global Search Trigger */}
        <button
          onClick={openSearch}
          className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-stone-400 hover:text-stone-200 transition-all text-xs"
          title="Search files, apps and system actions (⌘K / Ctrl+K)"
        >
          <Search className="w-3 h-3 text-stone-400" />
          <span className="text-[11px]">Search SimpleOS</span>
          <kbd className="text-[9px] px-1.5 py-0.5 rounded bg-white/10 border border-white/10 font-mono text-stone-400">⌘K</kbd>
        </button>

        <div className="flex items-center gap-4 text-[11px] font-medium">
          {/* Mobile search trigger */}
          <button
            onClick={openSearch}
            className="md:hidden text-stone-400 hover:text-stone-200 transition-colors"
            title="Search (⌘K)"
          >
            <Search className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => {
              setIsQuickSettingsOpen(!isQuickSettingsOpen);
              if (isStartOpen) setIsStartOpen(false);
              if (isVolumePopoverOpen) setIsVolumePopoverOpen(false);
            }}
            className="flex items-center gap-1.5 text-stone-400 hover:text-stone-200 transition-colors"
          >
            <Wifi className="w-3 h-3 text-stone-300" />
            <span className="font-mono text-[10px] hidden sm:inline">Online</span>
          </button>

          <div className="h-3 w-px bg-white/10" />

          {/* Dedicated Volume Control System Tray Trigger */}
          <button
            onClick={() => {
              setIsVolumePopoverOpen(!isVolumePopoverOpen);
              if (isQuickSettingsOpen) setIsQuickSettingsOpen(false);
              if (isStartOpen) setIsStartOpen(false);
            }}
            className={`p-1 rounded transition-colors ${
              isVolumePopoverOpen ? 'text-white bg-white/15' : 'text-stone-400 hover:text-stone-200'
            }`}
            title="Volume Control Slider"
          >
            {settings.soundEnabled && settings.volume > 0 ? (
              <div className="flex items-center gap-1">
                <Volume2 className="w-3.5 h-3.5" />
                <span className="font-mono text-[9px] hidden sm:inline">{settings.volume}%</span>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <VolumeX className="w-3.5 h-3.5 text-rose-400" />
                <span className="font-mono text-[9px] text-rose-400 hidden sm:inline">OFF</span>
              </div>
            )}
          </button>

          {/* Clock */}
          <button
            onClick={() => {
              setIsQuickSettingsOpen(!isQuickSettingsOpen);
              if (isVolumePopoverOpen) setIsVolumePopoverOpen(false);
            }}
            className="text-stone-200 hover:text-white font-mono text-[10px] tracking-wider uppercase transition-colors"
          >
            {formattedDateTime}
          </button>
        </div>
      </nav>

      {/* Start Menu, Volume Popover & Quick Settings Panels */}
      <StartMenu isOpen={isStartOpen} onClose={() => setIsStartOpen(false)} />
      <QuickSettings isOpen={isQuickSettingsOpen} onClose={() => setIsQuickSettingsOpen(false)} />
      <VolumeControlPopover isOpen={isVolumePopoverOpen} onClose={() => setIsVolumePopoverOpen(false)} />

      {/* Global System Dock (Bottom Floating Minimalist Dock) */}
      <div className="fixed bottom-0 inset-x-0 h-24 flex justify-center items-end pb-3 pointer-events-none z-40">
        <div
          id="simpleos-dock"
          className="pointer-events-auto bg-black/60 backdrop-blur-2xl border border-white/15 rounded-2xl h-14 flex items-center px-3 gap-2 shadow-2xl select-none max-w-[96vw] overflow-x-auto"
        >
          {/* Launcher Button */}
          <button
            onClick={() => {
              setIsStartOpen(!isStartOpen);
              if (isQuickSettingsOpen) setIsQuickSettingsOpen(false);
            }}
            className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm transition-all ${
              isStartOpen
                ? 'bg-white text-black shadow-md scale-105'
                : 'bg-stone-200 text-black hover:bg-white hover:scale-105 active:scale-95'
            }`}
            title="SimpleOS Menu"
          >
            S
          </button>

          {/* Quick Search in dock */}
          <button
            onClick={openSearch}
            className="w-9 h-9 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center hover:bg-white/15 transition-all text-stone-300 hover:text-white"
            title="Global Search (⌘K)"
          >
            <Search className="w-4 h-4" />
          </button>

          <div className="w-[1px] h-6 bg-white/10 mx-0.5" />

          {/* Dock App Icons */}
          <div className="flex items-center gap-1.5">
            {pinnedAppIds.map((appId) => {
              const appManifest = installedApps.find(a => a.id === appId || (a.id === 'calculator' && appId === 'calc') || (a.id === 'text-editor' && appId === 'editor') || (a.id === 'file-explorer' && appId === 'files') || (a.id === 'app-store' && appId === 'appstore'));
              if (!appManifest) return null;
              const runningWindows拼 = windows.filter(w => w.appId === appId || w.appId === appManifest.id);
              const isRunning = runningWindows拼.length > 0;
              const isFocused = runningWindows拼.some(w => w.id === activeWindowId && !w.isMinimized);

              return (
                <button
                  key={appId}
                  onClick={() => handleAppIconClick不易(appId)}
                  className={`group relative w-9 h-9 rounded-xl border transition-all flex items-center justify-center ${
                    isFocused
                      ? 'bg-stone-800 border-white/40 text-white shadow-md scale-105'
                      : 'bg-white/5 border-white/10 hover:bg-white/15 text-stone-300 hover:text-white hover:scale-105'
                  }`}
                  title={appManifest.name}
                >
                  <OSIcon name={appManifest.icon} className="w-4 h-4 transition-transform group-hover:scale-110" />

                  {/* Running Indicator Dot */}
                  {isRunning && (
                    <div
                      className={`absolute bottom-0.5 w-1 h-1 rounded-full transition-all ${
                        isFocused ? 'bg-white w-2.5' : 'bg-stone-400'
                      }`}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Running Windows area if multiple open */}
          {windows.length > 0 && (
            <>
              <div className="w-[1px] h-6 bg-white/10 mx-0.5" />
              <div className="flex items-center gap-1 max-w-[240px] overflow-x-auto">
                {windows.map((w) => {
                  const isActive = activeWindowId === w.id && !w.isMinimized;
                  return (
                    <button
                      key={w.id}
                      onClick={() => handleWindowTabClick(w.id, w.isMinimized)}
                      className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-[11px] max-w-[120px] truncate border transition-all ${
                        isActive
                          ? 'bg-white/20 border-white/30 text-stone-100 font-medium'
                          : w.isMinimized
                          ? 'bg-stone-950/50 border-transparent text-stone-500 hover:text-stone-300'
                          : 'bg-stone-900/80 border-white/10 text-stone-300 hover:bg-white/10'
                      }`}
                    >
                      <OSIcon name={w.icon} className="w-3 h-3 shrink-0 text-stone-400" />
                      <span className="truncate">{w.title}</span>
                    </button>
                  );
                })}
              </div>
            </>
          )}

          <div className="w-[1px] h-6 bg-white/10 mx-0.5" />

          {/* Quick Settings Action in Dock */}
          <button
            onClick={() => {
              setIsQuickSettingsOpen(!isQuickSettingsOpen);
              if (isStartOpen) setIsStartOpen(false);
            }}
            className="w-9 h-9 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center hover:bg-white/15 transition-all text-stone-400 hover:text-stone-200"
            title="System Settings & Quick Toggles"
          >
            <Sliders className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </>
  );
};
