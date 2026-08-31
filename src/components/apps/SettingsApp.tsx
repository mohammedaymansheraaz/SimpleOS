import React, { useState } from 'react';
import { useOS } from '../../context/OSContext';
import { OSTheme } from '../../types/os';
import {
  Image,
  Palette,
  Volume2,
  HardDrive,
  Info,
  RotateCcw,
  Download,
  Upload,
  Sparkles,
  Layout,
  Check,
  Shield,
  KeyRound,
  Terminal,
  Cpu,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  User,
  Trash2,
  Plus
} from 'lucide-react';
import { OSIcon } from '../common/OSIcon';

const WALLPAPERS = [
  { id: 'neon-abstract', name: 'Simple Wave', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop' },
  { id: 'cyberpunk-city', name: 'Cyber City', url: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?q=80&w=2564&auto=format&fit=crop' },
  { id: 'mountain-aurora', name: 'Alpine Aurora', url: 'https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?q=80&w=2564&auto=format&fit=crop' },
  { id: 'minimal-dark', name: 'Obsidian Flow', url: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2564&auto=format&fit=crop' },
  { id: 'sunset-coast', name: 'Pacific Twilight', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2564&auto=format&fit=crop' },
  { id: 'tokyo-neon', name: 'Night Shibuya', url: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?q=80&w=2564&auto=format&fit=crop' },
];

const THEMES: { id: OSTheme; name: string; bg: string }[] = [
  { id: 'dark', name: 'Obsidian Dark', bg: 'bg-stone-950 text-stone-100' },
  { id: 'light', name: 'Simple Light', bg: 'bg-stone-100 text-stone-900' },
  { id: 'cyberpunk', name: 'Cyberpunk 2077', bg: 'bg-purple-950 text-yellow-300' },
  { id: 'nord', name: 'Nordic Frost', bg: 'bg-slate-900 text-cyan-200' },
  { id: 'emerald', name: 'Emerald Forest', bg: 'bg-emerald-950 text-emerald-100' },
  { id: 'sunset', name: 'Sunset Amber', bg: 'bg-stone-950 text-amber-100' },
];

const ACCENT_COLORS = ['#6366f1', '#ec4899', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#e11d48'];

export const SettingsApp: React.FC = () => {
  const {
    settings,
    updateSettings,
    setWallpaper,
    setTheme,
    exportBackup,
    importBackup,
    resetSystem,
    nodes,
    installedApps,
    setUserPassword,
    removeUserPassword,
    updateUserProfile,
    lockScreen,
    envVars,
    setEnvVar,
    deleteEnvVar,
    registry,
    setRegistryKey,
  } = useOS();

  const [activeSection, setActiveSection] = useState<'security' | 'appearance' | 'dock' | 'sound' | 'terminal' | 'storage' | 'env' | 'about'>('security');
  const [customWallpaperUrl, setCustomWallpaperUrl] = useState('');

  // Password setting states
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswordInputs, setShowPasswordInputs] = useState(false);
  const [passwordStatusMsg, setPasswordStatusMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // New Env var form state
  const [newEnvKey, setNewEnvKey] = useState('');
  const [newEnvVal, setNewEnvVal] = useState('');

  const profile = settings.userProfile || {
    username: 'simple',
    displayName: 'SimpleOS User',
    avatar: 'User',
    hasPassword: false,
    autoLockMinutes: 0,
    lockWallpaperBlur: 'medium',
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword.trim()) {
      setPasswordStatusMsg({ text: 'New password cannot be empty.', type: 'error' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordStatusMsg({ text: 'New passwords do not match.', type: 'error' });
      return;
    }

    const res = setUserPassword(newPassword, profile.hasPassword ? oldPassword : undefined);
    if (res.success) {
      setPasswordStatusMsg({ text: 'Password saved successfully! You can test by locking the screen.', type: 'success' });
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setPasswordStatusMsg({ text: res.error || 'Failed to update password.', type: 'error' });
    }
  };

  const handleRemovePassword = () => {
    const current = prompt('Enter your current password to disable lock protection:');
    if (current !== null) {
      const res = removeUserPassword(current);
      if (res.success) {
        setPasswordStatusMsg({ text: 'Password protection removed. Instant unlock is active.', type: 'success' });
      } else {
        setPasswordStatusMsg({ text: res.error || 'Incorrect current password.', type: 'error' });
      }
    }
  };

  const handleCustomWallpaperSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customWallpaperUrl.trim()) {
      setWallpaper(customWallpaperUrl.trim(), 'custom');
      setCustomWallpaperUrl('');
    }
  };

  const handleExportBackup = () => {
    const json = exportBackup();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SimpleOS_Backup_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const content = reader.result as string;
      await importBackup(content);
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex-1 flex h-full bg-[#09090b] text-stone-200 select-none overflow-hidden font-sans">
      {/* Sidebar Navigation */}
      <div className="w-56 border-r border-white/5 bg-[#0a0a0c] p-3 flex flex-col gap-1 shrink-0 overflow-y-auto">
        <div className="text-xs font-serif italic font-bold text-stone-100 px-2 py-1 mb-2 tracking-wide flex items-center gap-2">
          <Palette className="w-4 h-4 text-stone-300" />
          System Settings
        </div>

        <button
          onClick={() => setActiveSection('security')}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors text-left ${
            activeSection === 'security' ? 'bg-stone-200 text-black font-semibold' : 'text-stone-400 hover:bg-white/5 hover:text-stone-200'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Security & Password</span>
        </button>

        <button
          onClick={() => setActiveSection('appearance')}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors text-left ${
            activeSection === 'appearance' ? 'bg-stone-200 text-black font-semibold' : 'text-stone-400 hover:bg-white/5 hover:text-stone-200'
          }`}
        >
          <Image className="w-4 h-4" />
          <span>Appearance & Themes</span>
        </button>

        <button
          onClick={() => setActiveSection('terminal')}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors text-left ${
            activeSection === 'terminal' ? 'bg-stone-200 text-black font-semibold' : 'text-stone-400 hover:bg-white/5 hover:text-stone-200'
          }`}
        >
          <Terminal className="w-4 h-4" />
          <span>Terminal & Shell</span>
        </button>

        <button
          onClick={() => setActiveSection('dock')}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors text-left ${
            activeSection === 'dock' ? 'bg-stone-200 text-black font-semibold' : 'text-stone-400 hover:bg-white/5 hover:text-stone-200'
          }`}
        >
          <Layout className="w-4 h-4" />
          <span>Dock & Window Snap</span>
        </button>

        <button
          onClick={() => setActiveSection('sound')}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors text-left ${
            activeSection === 'sound' ? 'bg-stone-200 text-black font-semibold' : 'text-stone-400 hover:bg-white/5 hover:text-stone-200'
          }`}
        >
          <Volume2 className="w-4 h-4" />
          <span>Audio Engine</span>
        </button>

        <button
          onClick={() => setActiveSection('storage')}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors text-left ${
            activeSection === 'storage' ? 'bg-stone-200 text-black font-semibold' : 'text-stone-400 hover:bg-white/5 hover:text-stone-200'
          }`}
        >
          <HardDrive className="w-4 h-4" />
          <span>Storage & Backup</span>
        </button>

        <button
          onClick={() => setActiveSection('env')}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors text-left ${
            activeSection === 'env' ? 'bg-stone-200 text-black font-semibold' : 'text-stone-400 hover:bg-white/5 hover:text-stone-200'
          }`}
        >
          <Cpu className="w-4 h-4" />
          <span>Environment & Registry</span>
        </button>

        <button
          onClick={() => setActiveSection('about')}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors text-left ${
            activeSection === 'about' ? 'bg-stone-200 text-black font-semibold' : 'text-stone-400 hover:bg-white/5 hover:text-stone-200'
          }`}
        >
          <Info className="w-4 h-4" />
          <span>System Information</span>
        </button>
      </div>

      {/* Settings Content Pane */}
      <div className="flex-1 p-6 overflow-y-auto">
        {/* SECURITY & PASSWORD SECTION */}
        {activeSection === 'security' && (
          <div className="max-w-2xl flex flex-col gap-6">
            <div>
              <h3 className="text-sm font-serif italic font-bold text-stone-100 mb-1">User Account & Lock Screen Security</h3>
              <p className="text-xs text-stone-400">
                Configure your administrator login credentials, lock screen password, and auto-lock timeouts.
              </p>
            </div>

            {/* Profile Overview Card */}
            <div className="p-4 rounded-2xl bg-[#0c0c0e] border border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="w-14 h-14 rounded-full bg-stone-800 border-2 border-white/10 flex items-center justify-center overflow-hidden">
                  {profile.avatar && (profile.avatar.startsWith('http') || profile.avatar.startsWith('data:')) ? (
                    <img src={profile.avatar} alt="User avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <OSIcon name={profile.avatar || 'User'} className="w-7 h-7 text-stone-200" />
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-medium text-stone-100">{profile.displayName}</h4>
                  <p className="text-xs font-mono text-stone-400">@{profile.username} (UID: 1000)</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className={`inline-block w-2 h-2 rounded-full ${profile.hasPassword ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                    <span className="text-[11px] font-sans text-stone-300">
                      {profile.hasPassword ? 'Password Protected' : 'No Password (Instant Unlock)'}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={lockScreen}
                className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-stone-200 text-xs font-medium flex items-center gap-1.5 transition-colors"
                title="Lock workstation immediately (Super+L)"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Lock Now</span>
              </button>
            </div>

            {/* User Profile Details Form */}
            <div className="p-4 rounded-2xl bg-[#0c0c0e] border border-white/10 flex flex-col gap-3">
              <h4 className="text-xs font-semibold text-stone-200">User Identity</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-stone-400 block mb-1">Display Name</label>
                  <input
                    type="text"
                    value={profile.displayName}
                    onChange={(e) => updateUserProfile({ displayName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-xs text-stone-100 outline-none focus:border-stone-400"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-stone-400 block mb-1">Username (Shell @user)</label>
                  <input
                    type="text"
                    value={profile.username}
                    onChange={(e) => updateUserProfile({ username: e.target.value.toLowerCase().replace(/\s+/g, '') })}
                    className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-xs text-stone-100 font-mono outline-none focus:border-stone-400"
                  />
                </div>
              </div>
            </div>

            {/* Password Configuration Form */}
            <div className="p-4 rounded-2xl bg-[#0c0c0e] border border-white/10 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-semibold text-stone-200">
                    {profile.hasPassword ? 'Change Lock Password' : 'Set Lock Password'}
                  </h4>
                  <p className="text-[11px] text-stone-500">
                    When set, pressing Enter on the Lock screen requires this password to open the OS.
                  </p>
                </div>

                {profile.hasPassword && (
                  <button
                    type="button"
                    onClick={handleRemovePassword}
                    className="text-xs text-rose-400 hover:text-rose-300 font-medium transition-colors"
                  >
                    Remove Password
                  </button>
                )}
              </div>

              <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-3">
                {profile.hasPassword && (
                  <div>
                    <label className="text-[11px] text-stone-400 block mb-1">Current Password</label>
                    <input
                      type={showPasswordInputs ? 'text' : 'password'}
                      placeholder="Enter current password..."
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-xs text-stone-100 outline-none focus:border-stone-400"
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-stone-400 block mb-1">New Password</label>
                    <input
                      type={showPasswordInputs ? 'text' : 'password'}
                      placeholder="Enter new password..."
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-xs text-stone-100 outline-none focus:border-stone-400"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-stone-400 block mb-1">Confirm New Password</label>
                    <input
                      type={showPasswordInputs ? 'text' : 'password'}
                      placeholder="Confirm new password..."
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-xs text-stone-100 outline-none focus:border-stone-400"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 text-xs text-stone-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showPasswordInputs}
                      onChange={(e) => setShowPasswordInputs(e.target.checked)}
                      className="accent-stone-200"
                    />
                    <span>Show password characters</span>
                  </label>

                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-stone-200 hover:bg-white text-stone-950 text-xs font-semibold shadow transition-all hover:scale-105"
                  >
                    {profile.hasPassword ? 'Update Password' : 'Save Password'}
                  </button>
                </div>

                {passwordStatusMsg && (
                  <div
                    className={`p-2.5 rounded-xl text-xs font-medium mt-1 ${
                      passwordStatusMsg.type === 'success' ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/40' : 'bg-rose-950/60 text-rose-300 border border-rose-800/40'
                    }`}
                  >
                    {passwordStatusMsg.text}
                  </div>
                )}
              </form>
            </div>

            {/* Lock Screen Settings */}
            <div className="p-4 rounded-2xl bg-[#0c0c0e] border border-white/10 flex flex-col gap-3">
              <h4 className="text-xs font-semibold text-stone-200">Lock Screen Atmosphere</h4>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-stone-400 block mb-1">Auto-Lock Inactivity Timeout</label>
                  <select
                    value={profile.autoLockMinutes || 0}
                    onChange={(e) => updateUserProfile({ autoLockMinutes: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-xs text-stone-100 outline-none cursor-pointer"
                  >
                    <option value={0}>Never (Manual Lock Only)</option>
                    <option value={1}>1 Minute</option>
                    <option value={5}>5 Minutes</option>
                    <option value={15}>15 Minutes</option>
                    <option value={30}>30 Minutes</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-stone-400 block mb-1">Lock Wallpaper Backdrop Blur</label>
                  <select
                    value={profile.lockWallpaperBlur || 'medium'}
                    onChange={(e) => updateUserProfile({ lockWallpaperBlur: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-xs text-stone-100 outline-none cursor-pointer"
                  >
                    <option value="none">No Blur (Crisp)</option>
                    <option value="low">Subtle Blur</option>
                    <option value="medium">Medium Glass Blur (Recommended)</option>
                    <option value="high">Deep Frosted Glass</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* APPEARANCE SECTION */}
        {activeSection === 'appearance' && (
          <div className="max-w-3xl flex flex-col gap-6">
            <div>
              <h3 className="text-sm font-serif italic font-bold text-stone-100 mb-1">Desktop Atmosphere</h3>
              <p className="text-xs text-stone-400 mb-3">Choose an atmosphere wallpaper or provide a custom image URL.</p>

              {/* Wallpaper Grid */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                {WALLPAPERS.map((wp) => (
                  <div
                    key={wp.id}
                    onClick={() => setWallpaper(wp.url, 'preset')}
                    className={`group relative rounded-xl overflow-hidden aspect-video cursor-pointer border-2 transition-all ${
                      settings.wallpaper === wp.url ? 'border-stone-200 ring-2 ring-white/20' : 'border-transparent hover:border-white/20'
                    }`}
                  >
                    <img src={wp.url} alt={wp.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/90 to-transparent text-[11px] text-stone-200 font-medium flex items-center justify-between">
                      <span>{wp.name}</span>
                      {settings.wallpaper === wp.url && <Check className="w-3.5 h-3.5 text-stone-100" />}
                    </div>
                  </div>
                ))}
              </div>

              {/* Custom Wallpaper Input */}
              <form onSubmit={handleCustomWallpaperSubmit} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Paste custom wallpaper image URL..."
                  value={customWallpaperUrl}
                  onChange={(e) => setCustomWallpaperUrl(e.target.value)}
                  className="flex-1 px-3.5 py-2 rounded-xl bg-black/60 border border-white/10 text-xs text-stone-100 placeholder:text-stone-600 focus:outline-none focus:border-stone-400"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-stone-200 hover:bg-white text-xs font-bold text-black transition-colors"
                >
                  Apply
                </button>
              </form>
            </div>

            <div className="pt-4 border-t border-white/5">
              <h3 className="text-sm font-serif italic font-bold text-stone-100 mb-1">Color Aesthetics</h3>
              <p className="text-xs text-stone-400 mb-3">Adjust OS color harmonies.</p>
              <div className="grid grid-cols-3 gap-2.5">
                {THEMES.map((th) => (
                  <button
                    key={th.id}
                    onClick={() => setTheme(th.id)}
                    className={`p-3 rounded-xl border text-xs font-medium flex items-center justify-between transition-all ${
                      settings.theme === th.id
                        ? 'border-white/30 bg-white/15 text-stone-100'
                        : 'border-white/5 bg-[#0c0c0c] text-stone-400 hover:bg-white/5'
                    }`}
                  >
                    <span>{th.name}</span>
                    {settings.theme === th.id && <Check className="w-4 h-4 text-stone-200" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-white/5">
              <h3 className="text-sm font-serif italic font-bold text-stone-100 mb-1">Accent Tones</h3>
              <div className="flex items-center gap-2 mt-2">
                {ACCENT_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => updateSettings({ accentColor: c })}
                    className={`w-7 h-7 rounded-full transition-transform ${
                      settings.accentColor === c ? 'scale-125 ring-2 ring-white shadow-lg' : 'hover:scale-110'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TERMINAL & SHELL SECTION */}
        {activeSection === 'terminal' && (
          <div className="max-w-2xl flex flex-col gap-5">
            <div>
              <h3 className="text-sm font-serif italic font-bold text-stone-100 mb-1">Linux Terminal Configuration</h3>
              <p className="text-xs text-stone-400">
                Personalize shell environment defaults, font sizing, and prompt color schemes.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#0c0c0e] border border-white/10 flex flex-col gap-3">
              <h4 className="text-xs font-semibold text-stone-200">Terminal Aesthetics</h4>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-stone-400 block mb-1">Default Terminal Theme</label>
                  <select
                    value={settings.terminalTheme || 'stone'}
                    onChange={(e) => updateSettings({ terminalTheme: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-xs text-stone-100 outline-none"
                  >
                    <option value="stone">Obsidian Stone (Default)</option>
                    <option value="matrix">Matrix Green</option>
                    <option value="dracula">Dracula Purple</option>
                    <option value="nord">Nord Arctic</option>
                    <option value="monokai">Monokai Pro</option>
                    <option value="solarized">Solarized Dark</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-stone-400 block mb-1">Font Size (px)</label>
                  <input
                    type="number"
                    min="10"
                    max="20"
                    value={settings.terminalFontSize || 13}
                    onChange={(e) => updateSettings({ terminalFontSize: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-xs text-stone-100 outline-none font-mono"
                  />
                </div>
              </div>

              <div className="mt-2 p-3 rounded-xl bg-black/80 border border-white/10 font-mono text-xs">
                <span className="text-stone-400">{profile.username}@simpleos-workstation:~$ </span>
                <span className="text-emerald-400">neofetch</span>
                <div className="text-stone-500 text-[11px] mt-1">
                  Shell: /bin/bash (simple-sh 2.4.0) | Terminal: xterm-256color
                </div>
              </div>
            </div>
          </div>
        )}

        {/* DOCK & WINDOW SNAP */}
        {activeSection === 'dock' && (
          <div className="max-w-2xl flex flex-col gap-6">
            <div>
              <h3 className="text-sm font-serif italic font-bold text-stone-100 mb-1">Dock Placement</h3>
              <p className="text-xs text-stone-400 mb-3">Configure dock location.</p>
              <div className="grid grid-cols-3 gap-3">
                {['bottom', 'top', 'left'].map((pos) => (
                  <button
                    key={pos}
                    onClick={() => updateSettings({ dockPosition: pos as any })}
                    className={`p-3 rounded-xl border text-xs font-semibold capitalize flex items-center justify-between transition-all ${
                      settings.dockPosition === pos
                        ? 'border-white/30 bg-white/15 text-stone-100'
                        : 'border-white/10 bg-[#0c0c0c] text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    <span>{pos} Screen Edge</span>
                    {settings.dockPosition === pos && <Check className="w-4 h-4 text-stone-200" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-white/5 flex flex-col gap-3">
              <h3 className="text-sm font-serif italic font-bold text-stone-100 mb-1">Window Mechanics</h3>

              <label className="flex items-center justify-between p-3 rounded-xl bg-[#0c0c0c] border border-white/10 cursor-pointer">
                <div>
                  <div className="text-xs font-semibold text-stone-200">Snap Assist (Edge Snapping)</div>
                  <div className="text-[11px] text-stone-500">Drag window to screen edges to snap into half or full screen</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.snapAssistEnabled}
                  onChange={(e) => updateSettings({ snapAssistEnabled: e.target.checked })}
                  className="w-4 h-4 accent-stone-200"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-[#0c0c0c] border border-white/10 cursor-pointer">
                <div>
                  <div className="text-xs font-semibold text-stone-200">Desktop Icon Grid Snap</div>
                  <div className="text-[11px] text-stone-500">Automatically align desktop icons to tidy grid columns</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.desktopGridSnap}
                  onChange={(e) => updateSettings({ desktopGridSnap: e.target.checked })}
                  className="w-4 h-4 accent-stone-200"
                />
              </label>
            </div>
          </div>
        )}

        {/* AUDIO & EFFECTS */}
        {activeSection === 'sound' && (
          <div className="max-w-2xl flex flex-col gap-4">
            <h3 className="text-sm font-serif italic font-bold text-stone-100 mb-1">Synthesized System Acoustics</h3>
            <p className="text-xs text-stone-400 mb-2">Web Audio synthesized clicks, chimes, and window effects.</p>

            <label className="flex items-center justify-between p-3 rounded-xl bg-[#0c0c0c] border border-white/10 cursor-pointer">
              <div>
                <div className="text-xs font-semibold text-stone-200">Enable OS Sound Effects</div>
                <div className="text-[11px] text-stone-500">Play audio on window opens, file deletion, app install</div>
              </div>
              <input
                type="checkbox"
                checked={settings.soundEnabled}
                onChange={(e) => updateSettings({ soundEnabled: e.target.checked })}
                className="w-4 h-4 accent-stone-200"
              />
            </label>

            <div className="p-3 rounded-xl bg-[#0c0c0c] border border-white/10 flex flex-col gap-2">
              <div className="flex justify-between text-xs font-semibold text-stone-200">
                <span>Master Volume</span>
                <span className="font-mono text-stone-400">{settings.volume}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={settings.volume}
                onChange={(e) => updateSettings({ volume: Number(e.target.value) })}
                className="w-full accent-stone-200 cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* STORAGE & BACKUP */}
        {activeSection === 'storage' && (
          <div className="max-w-2xl flex flex-col gap-5">
            <div>
              <h3 className="text-sm font-serif italic font-bold text-stone-100 mb-1">Persistent Virtual File System</h3>
              <p className="text-xs text-stone-400">
                All your documents, files, drawings, installed web apps, and configurations are saved locally via IndexedDB.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-xl bg-[#0c0c0c] border border-white/10">
                <div className="text-[10px] font-mono text-stone-500 uppercase tracking-widest">Total VFS Nodes</div>
                <div className="text-xl font-mono font-bold text-stone-100 mt-1">{nodes.length} Items</div>
              </div>
              <div className="p-4 rounded-xl bg-[#0c0c0c] border border-white/10">
                <div className="text-[10px] font-mono text-stone-500 uppercase tracking-widest">Installed Apps</div>
                <div className="text-xl font-mono font-bold text-stone-100 mt-1">{installedApps.length} Apps</div>
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-3 border-t border-white/5">
              <h4 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Backup & Restore</h4>
              <div className="flex gap-2">
                <button
                  onClick={handleExportBackup}
                  className="px-4 py-2.5 rounded-xl bg-stone-200 hover:bg-white text-xs font-bold text-black flex items-center gap-1.5 transition-colors shadow"
                >
                  <Download className="w-4 h-4" /> Export State Backup (.json)
                </button>

                <label className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold text-stone-200 flex items-center gap-1.5 transition-colors cursor-pointer">
                  <Upload className="w-4 h-4" /> Restore Backup
                  <input type="file" accept=".json" onChange={handleImportBackup} className="hidden" />
                </label>
              </div>
            </div>

            <div className="pt-4 border-t border-white/5">
              <h4 className="text-[10px] font-bold text-rose-400 uppercase tracking-widest mb-1">Danger Zone</h4>
              <p className="text-xs text-stone-500 mb-3">Reset the entire virtual file system and settings back to factory state.</p>
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to reset SimpleOS to factory defaults? All files and custom apps will be cleared.')) {
                    resetSystem();
                  }
                }}
                className="px-4 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white text-xs font-semibold transition-colors flex items-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" /> Factory Reset OS
              </button>
            </div>
          </div>
        )}

        {/* ENVIRONMENT & REGISTRY SECTION */}
        {activeSection === 'env' && (
          <div className="max-w-2xl flex flex-col gap-5">
            <div>
              <h3 className="text-sm font-serif italic font-bold text-stone-100 mb-1">Unix Environment & System Registry</h3>
              <p className="text-xs text-stone-400">
                Manage exported environment variables ($PATH, $USER, $SHELL) and system configuration keys.
              </p>
            </div>

            {/* Add new variable */}
            <div className="p-4 rounded-2xl bg-[#0c0c0e] border border-white/10 flex flex-col gap-3">
              <h4 className="text-xs font-semibold text-stone-200">Export New Environment Variable</h4>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="KEY (e.g. API_ENDPOINT)"
                  value={newEnvKey}
                  onChange={(e) => setNewEnvKey(e.target.value.toUpperCase())}
                  className="w-1/3 px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-xs font-mono text-stone-100 outline-none"
                />
                <input
                  type="text"
                  placeholder="VALUE"
                  value={newEnvVal}
                  onChange={(e) => setNewEnvVal(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-xs font-mono text-stone-100 outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (newEnvKey.trim()) {
                      setEnvVar(newEnvKey.trim(), newEnvVal);
                      setNewEnvKey('');
                      setNewEnvVal('');
                    }
                  }}
                  className="px-3 py-2 rounded-xl bg-stone-200 text-stone-950 text-xs font-semibold hover:bg-white transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* List of active env variables */}
            <div className="p-4 rounded-2xl bg-[#0c0c0e] border border-white/10 flex flex-col gap-2">
              <h4 className="text-xs font-semibold text-stone-200 mb-1">Active Environment Variables ({Object.keys(envVars).length})</h4>
              <div className="flex flex-col gap-1 max-h-60 overflow-y-auto font-mono text-xs">
                {Object.entries(envVars).map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between p-2 rounded-lg bg-black/40 hover:bg-white/5 border border-white/5">
                    <span className="text-emerald-400 font-semibold">{k}</span>
                    <span className="text-stone-400 truncate max-w-xs">{v}</span>
                    <button
                      onClick={() => deleteEnvVar(k)}
                      className="text-stone-500 hover:text-rose-400 p-1"
                      title={`Remove $${k}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ABOUT SECTION */}
        {activeSection === 'about' && (
          <div className="max-w-2xl flex flex-col gap-4">
            <div className="p-6 rounded-2xl bg-[#0c0c0c] border border-white/15 shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-stone-200 text-black flex items-center justify-center shadow-xl font-black text-xl">
                    S
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-stone-100">SimpleOS</h3>
                    <p className="text-xs text-stone-400 font-mono">v2.4.0 Minimalist Edition</p>
                  </div>
                </div>

                <div className="px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-stone-200 text-xs font-mono">
                  Designed & Developed by <span className="font-bold text-white">Mohammad Aiman</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-white/10 text-xs text-stone-300 leading-relaxed space-y-3">
                <p className="text-sm font-medium text-stone-200">
                  SimpleOS is a privacy-focused, fast, and simple operating system designed for modern desktop web experiences.
                </p>
                <p className="text-stone-400">
                  Engineered with an isolated local Virtual File System, instant global search (⌘K / Ctrl+K), rich multitasking window compositor, Unix terminal environment, and zero data telemetry.
                </p>

                <div className="p-3 rounded-xl bg-black/60 border border-white/10 flex items-center justify-between mt-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-stone-400" />
                    <span className="text-xs text-stone-300 font-semibold">Founder & Developer</span>
                  </div>
                  <span className="text-xs font-bold text-stone-100 tracking-wide">Mohammad Aiman</span>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-4 font-mono text-[10px] text-stone-500">
                  <div>AUTHOR: Mohammad Aiman</div>
                  <div>PLATFORM: WebOS Desktop</div>
                  <div>STORAGE: Isolated IndexedDB VFS</div>
                  <div>PRIVACY: 100% Local / Zero Tracking</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
