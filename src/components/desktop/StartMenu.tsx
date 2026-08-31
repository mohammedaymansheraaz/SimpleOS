import React, { useState, useMemo } from 'react';
import { useOS } from '../../context/OSContext';
import { OSIcon } from '../common/OSIcon';
import {
  Search,
  Settings,
  Power,
  Sparkles,
  Grid,
  List,
  Clock,
  ExternalLink,
  ShoppingBag,
  Folder,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AppManifest } from '../../types/os';

interface StartMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StartMenu: React.FC<StartMenuProps> = ({ isOpen, onClose }) => {
  const {
    installedApps,
    openApp,
    nodes,
    openFile,
    settings,
    resetSystem,
    lockScreen,
  } = useOS();

  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'pinned' | 'all'>('pinned');

  // Filter apps and files by search query
  const filteredApps = useMemo(() => {
    if (!searchQuery.trim()) return installedApps;
    const q = searchQuery.toLowerCase();
    return installedApps.filter(
      (a) => a.name.toLowerCase().includes(q) || a.description?.toLowerCase().includes(q) || a.category?.toLowerCase().includes(q)
    );
  }, [installedApps, searchQuery]);

  const filteredFiles = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return nodes
      .filter((n) => n.name.toLowerCase().includes(q) && n.type !== 'folder')
      .slice(0, 5);
  }, [nodes, searchQuery]);

  // Recent files
  const recentFiles = useMemo(() => {
    return [...nodes]
      .filter((n) => n.type !== 'folder')
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .slice(0, 4);
  }, [nodes]);

  if (!isOpen) return null;

  const handleLaunchApp = (manifest: AppManifest) => {
    openApp(manifest.id);
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 15, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 15, scale: 0.97 }}
        transition={{ duration: 0.16 }}
        className="fixed bottom-20 left-1/2 -translate-x-1/2 md:left-8 md:translate-x-0 w-96 max-h-[580px] bg-[#0c0c0c]/95 backdrop-blur-3xl border border-white/15 rounded-3xl p-5 shadow-[0_30px_70px_rgba(0,0,0,0.9)] z-50 text-stone-200 font-sans select-none flex flex-col gap-4 overflow-hidden"
      >
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search applications, registry, documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-black/60 border border-white/10 text-xs text-stone-100 placeholder:text-stone-600 focus:outline-none focus:border-white/30 transition-colors select-text"
          />
        </div>

        {/* View mode toggle */}
        {!searchQuery && (
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] uppercase tracking-widest font-bold text-stone-400">
              {viewMode === 'pinned' ? 'Pinned Applications' : 'All Installed Apps'}
            </span>
            <button
              onClick={() => setViewMode(viewMode === 'pinned' ? 'all' : 'pinned')}
              className="text-[11px] font-semibold text-stone-400 hover:text-white transition-colors"
            >
              {viewMode === 'pinned' ? 'All Apps →' : '← Pinned'}
            </button>
          </div>
        )}

        {/* Search Results or App Grid */}
        <div className="flex-1 overflow-y-auto min-h-0 pr-1 flex flex-col gap-4">
          {searchQuery ? (
            /* Search results */
            <div className="flex flex-col gap-3">
              <div>
                <div className="text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-2">Apps</div>
                {filteredApps.length === 0 ? (
                  <div className="text-xs text-stone-600 italic">No apps matching "{searchQuery}"</div>
                ) : (
                  <div className="flex flex-col gap-1">
                    {filteredApps.map((app) => (
                      <div
                        key={app.id}
                        onClick={() => handleLaunchApp(app)}
                        className="p-2 rounded-xl hover:bg-white/5 cursor-pointer flex items-center gap-3 transition-colors border border-transparent hover:border-white/5"
                      >
                        <div className="p-2 rounded-xl bg-stone-900 border border-white/10">
                          <OSIcon name={app.icon} className="w-4 h-4 text-stone-300" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-semibold text-stone-100 truncate">{app.name}</div>
                          <div className="text-[10px] text-stone-500 truncate">{app.description}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {filteredFiles.length > 0 && (
                <div>
                  <div className="text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-2">Files & Documents</div>
                  <div className="flex flex-col gap-1">
                    {filteredFiles.map((f) => (
                      <div
                        key={f.id}
                        onClick={() => {
                          openFile(f);
                          onClose();
                        }}
                        className="p-2 rounded-xl hover:bg-white/5 cursor-pointer flex items-center gap-3 transition-colors"
                      >
                        <Folder className="w-4 h-4 text-stone-400 shrink-0" />
                        <span className="text-xs text-stone-300 truncate">{f.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : viewMode === 'pinned' ? (
            /* Pinned grid */
            <div className="grid grid-cols-4 gap-2">
              {installedApps.slice(0, 12).map((app) => (
                <button
                  key={app.id}
                  onClick={() => handleLaunchApp(app)}
                  className="group flex flex-col items-center justify-center p-2.5 rounded-2xl hover:bg-white/5 active:scale-95 transition-all text-center"
                >
                  <div className="w-11 h-11 rounded-2xl bg-stone-900 border border-white/10 group-hover:border-white/20 group-hover:bg-stone-800 flex items-center justify-center shadow-lg transition-all mb-1.5">
                    <OSIcon name={app.icon} className="w-5 h-5 text-stone-300 group-hover:text-white transition-colors" />
                  </div>
                  <span className="text-[10px] font-medium text-stone-400 group-hover:text-stone-200 truncate w-full">
                    {app.name}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            /* All apps list */
            <div className="flex flex-col gap-1">
              {installedApps.map((app) => (
                <button
                  key={app.id}
                  onClick={() => handleLaunchApp(app)}
                  className="p-2 rounded-xl hover:bg-white/5 flex items-center gap-3 text-left transition-colors w-full"
                >
                  <div className="p-2 rounded-xl bg-stone-900 border border-white/10 shrink-0">
                    <OSIcon name={app.icon} className="w-4 h-4 text-stone-300" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-semibold text-stone-200 truncate">{app.name}</div>
                    <div className="text-[10px] text-stone-500 truncate">{app.category || 'App'}</div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Recent files shelf */}
          {!searchQuery && viewMode === 'pinned' && recentFiles.length > 0 && (
            <div className="pt-3 border-t border-white/10">
              <div className="text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <Clock className="w-3 h-3" /> Recent Storage
              </div>
              <div className="grid grid-cols-2 gap-2">
                {recentFiles.map((file) => (
                  <div
                    key={file.id}
                    onClick={() => {
                      openFile(file);
                      onClose();
                    }}
                    className="p-2 rounded-xl bg-stone-900/60 hover:bg-white/5 border border-white/5 cursor-pointer flex items-center gap-2 transition-colors min-w-0"
                  >
                    <Folder className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                    <span className="text-xs text-stone-300 truncate font-mono text-[11px]">{file.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer User Profile & Power bar */}
        <div className="pt-3 border-t border-white/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center font-bold text-black text-xs shadow-md">
              {settings.userProfile?.displayName ? settings.userProfile.displayName.charAt(0).toUpperCase() : 'S'}
            </div>
            <div>
              <div className="text-xs font-semibold text-stone-200 leading-tight">
                {settings.userProfile?.displayName || 'SimpleOS User'}
              </div>
              <div className="text-[10px] font-mono text-stone-400">
                @{settings.userProfile?.username || 'simple'} • {settings.userProfile?.hasPassword ? 'SECURE' : 'UNLOCKED'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                lockScreen();
                onClose();
              }}
              className="p-2 rounded-xl hover:bg-white/10 text-stone-400 hover:text-amber-300 transition-colors"
              title="Lock Workstation (Super+L)"
            >
              <Power className="w-4 h-4 text-amber-400" />
            </button>
            <button
              onClick={() => {
                openApp('settings');
                onClose();
              }}
              className="p-2 rounded-xl hover:bg-white/10 text-stone-400 hover:text-white transition-colors"
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
