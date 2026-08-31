import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useOS } from '../../context/OSContext';
import { VFSNode, AppManifest } from '../../types/os';
import { OSIcon } from '../common/OSIcon';
import { sound } from '../../services/audio';
import {
  Search,
  FileText,
  Folder,
  Image as ImageIcon,
  Music,
  Code,
  Sparkles,
  Command,
  ArrowRight,
  Clock,
  Layers,
  Lock,
  Settings,
  Trash2,
  Terminal,
  Plus,
  Compass,
  X,
  ExternalLink,
  ChevronRight,
  HardDrive
} from 'lucide-react';

interface SearchResultItem {
  id: string;
  type: 'app' | 'file' | 'action';
  title: string;
  subtitle: string;
  icon: string;
  category: string;
  score: number;
  badge?: string;
  appManifest?: AppManifest;
  fileNode?: VFSNode;
  actionHandler?: () => void;
  previewDetails?: {
    path?: string;
    size?: string;
    type?: string;
    modified?: string;
    snippet?: string;
  };
}

interface GlobalSearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalSearchOverlay: React.FC<GlobalSearchOverlayProps> = ({ isOpen, onClose }) => {
  const {
    nodes,
    installedApps,
    openApp,
    openFile,
    lockScreen,
    emptyTrash,
    createFile,
    setTheme,
    settings,
  } = useOS();

  const [query, setQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<'all' | 'apps' | 'files' | 'actions'>('all');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Focus search input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setFilterCategory('all');
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // System Actions
  const systemActions = useMemo<SearchResultItem[]>(() => [
    {
      id: 'action-lock',
      type: 'action',
      title: 'Lock System',
      subtitle: 'Lock session and return to lock screen',
      icon: 'Lock',
      category: 'System Action',
      score: 0,
      badge: 'Super+L',
      actionHandler: () => {
        lockScreen();
        onClose();
      },
      previewDetails: {
        path: 'System / Security',
        type: 'Security Action',
        snippet: 'Immediately locks the workstation display and secures session data.',
      },
    },
    {
      id: 'action-settings',
      type: 'action',
      title: 'Open Settings',
      subtitle: 'Configure wallpapers, themes, and sound',
      icon: 'Settings',
      category: 'System Action',
      score: 0,
      badge: 'Config',
      actionHandler: () => {
        openApp('settings');
        onClose();
      },
      previewDetails: {
        path: 'System / Configuration',
        type: 'System Utility',
        snippet: 'Manage desktop appearance, visual accents, system sounds, and storage.',
      },
    },
    {
      id: 'action-new-note',
      type: 'action',
      title: 'Create New Document',
      subtitle: 'Open text editor with a fresh file',
      icon: 'FileText',
      category: 'Productivity',
      score: 0,
      badge: 'New',
      actionHandler: () => {
        openApp('editor');
        onClose();
      },
      previewDetails: {
        path: 'SimpleOS / CodePad',
        type: 'Editor Launcher',
        snippet: 'Quickly draft thoughts, code snippets, or markdown notes.',
      },
    },
    {
      id: 'action-terminal',
      type: 'action',
      title: 'Launch Terminal Shell',
      subtitle: 'Open Unix command prompt',
      icon: 'Terminal',
      category: 'Development',
      score: 0,
      badge: 'Super+T',
      actionHandler: () => {
        openApp('terminal');
        onClose();
      },
      previewDetails: {
        path: 'System / CLI',
        type: 'Terminal Shell',
        snippet: 'Direct Bash/Unix command line environment with 30+ tools and pipelines.',
      },
    },
    {
      id: 'action-empty-trash',
      type: 'action',
      title: 'Empty Trash Bin',
      subtitle: 'Permanently purge deleted files',
      icon: 'Trash2',
      category: 'Storage',
      score: 0,
      badge: 'Cleanup',
      actionHandler: async () => {
        await emptyTrash();
        onClose();
      },
      previewDetails: {
        path: 'VFS / Trash',
        type: 'Storage Maintenance',
        snippet: 'Permanently frees virtual storage quota by wiping recycled nodes.',
      },
    },
    {
      id: 'action-calc',
      type: 'action',
      title: 'Quick Calculator',
      subtitle: 'Perform standard and scientific calculations',
      icon: 'Calculator',
      category: 'Utility',
      score: 0,
      badge: 'Math',
      actionHandler: () => {
        openApp('calculator');
        onClose();
      },
      previewDetails: {
        path: 'SimpleOS / Utilities',
        type: 'Calculator',
        snippet: 'High-precision math engine with standard and scientific functions.',
      },
    },
  ], [lockScreen, openApp, emptyTrash, onClose]);

  // Build searchable index
  const allSearchableItems = useMemo<SearchResultItem[]>(() => {
    const list: SearchResultItem[] = [];

    // 1. Installed Apps
    installedApps.forEach((app) => {
      list.push({
        id: `app-${app.id}`,
        type: 'app',
        title: app.name,
        subtitle: app.description,
        icon: app.icon,
        category: 'Application',
        score: 0,
        badge: app.badge || app.category,
        appManifest: app,
        actionHandler: () => {
          openApp(app.id);
          onClose();
        },
        previewDetails: {
          path: `SimpleOS Applications / ${app.name}`,
          type: `${app.category.toUpperCase()} App`,
          snippet: app.description,
        },
      });
    });

    // 2. VFS Files & Folders
    nodes.forEach((node) => {
      if (node.id === 'root') return;
      const isFolder = node.type === 'folder';
      let icon = 'FileText';
      if (isFolder) icon = 'Folder';
      else if (node.type === 'image') icon = 'Image';
      else if (node.type === 'audio') icon = 'Music';
      else if (node.type === 'code') icon = 'Code';
      else if (node.type === 'app') icon = 'Sparkles';

      // Format size
      const sizeBytes = node.size || (node.content ? new Blob([node.content]).size : 0);
      const formattedSize = sizeBytes > 1024 ? `${(sizeBytes / 1024).toFixed(1)} KB` : `${sizeBytes} B`;

      list.push({
        id: `file-${node.id}`,
        type: 'file',
        title: node.name,
        subtitle: isFolder ? 'Folder Directory' : `${node.type.toUpperCase()} • ${formattedSize}`,
        icon,
        category: isFolder ? 'Directory' : 'File Document',
        score: 0,
        badge: isFolder ? 'Folder' : node.extension || node.type,
        fileNode: node,
        actionHandler: () => {
          openFile(node);
          onClose();
        },
        previewDetails: {
          path: `VFS Storage / ${node.name}`,
          size: formattedSize,
          type: node.type,
          modified: new Date(node.updatedAt || node.createdAt).toLocaleDateString(),
          snippet: node.content ? node.content.slice(0, 300) : (isFolder ? 'Folder container for organizing system files.' : 'Binary / Media file'),
        },
      });
    });

    // 3. System Actions
    systemActions.forEach((act) => list.push(act));

    return list;
  }, [installedApps, nodes, systemActions, openApp, openFile, onClose]);

  // Fuzzy search and filter ranking
  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();

    let pool = allSearchableItems;
    if (filterCategory === 'apps') {
      pool = pool.filter((i) => i.type === 'app');
    } else if (filterCategory === 'files') {
      pool = pool.filter((i) => i.type === 'file');
    } else if (filterCategory === 'actions') {
      pool = pool.filter((i) => i.type === 'action');
    }

    if (!q) {
      // Return curated top recommendations
      return pool.slice(0, 18);
    }

    // Score based on match precision
    return pool
      .map((item) => {
        const titleLower = item.title.toLowerCase();
        const subLower = item.subtitle.toLowerCase();
        const snippetLower = item.previewDetails?.snippet?.toLowerCase() || '';

        let score = 0;
        if (titleLower === q) score += 100;
        else if (titleLower.startsWith(q)) score += 60;
        else if (titleLower.includes(q)) score += 40;

        if (subLower.includes(q)) score += 20;
        if (snippetLower.includes(q)) score += 10;

        // Character subsequence fuzzy score
        let qIndex = 0;
        for (let i = 0; i < titleLower.length && qIndex < q.length; i++) {
          if (titleLower[i] === q[qIndex]) {
            qIndex++;
            score += 2;
          }
        }

        return { ...item, score };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 20);
  }, [allSearchableItems, query, filterCategory]);

  // Keyboard navigation inside search palette
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1 < searchResults.length ? prev + 1 : 0));
        sound.playClick();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 >= 0 ? prev - 1 : searchResults.length - 1));
        sound.playClick();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const selected = searchResults[selectedIndex];
        if (selected && selected.actionHandler) {
          selected.actionHandler();
          sound.playClick();
        }
      } else if (e.key === 'Tab') {
        e.preventDefault();
        // Cycle categories
        const categories: Array<'all' | 'apps' | 'files' | 'actions'> = ['all', 'apps', 'files', 'actions'];
        const nextIdx = (categories.indexOf(filterCategory) + 1) % categories.length;
        setFilterCategory(categories[nextIdx]);
        sound.playClick();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, searchResults, selectedIndex, filterCategory, onClose]);

  if (!isOpen) return null;

  const currentItem = searchResults[selectedIndex] || searchResults[0];

  return (
    <div 
      className="fixed inset-0 z-[10000] flex items-start justify-center pt-20 px-4 bg-black/60 backdrop-blur-md select-none animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-3xl bg-[#0e0e11] border border-white/15 rounded-3xl shadow-[0_30px_90px_rgba(0,0,0,0.85)] flex flex-col overflow-hidden text-stone-200 font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header Bar */}
        <div className="flex items-center px-6 py-4 border-b border-white/10 gap-3 bg-[#0a0a0c]">
          <Search className="w-5 h-5 text-stone-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Type a command, file name, or app to launch..."
            className="flex-1 bg-transparent border-none outline-none text-stone-100 placeholder-stone-500 text-base font-normal"
          />

          {query && (
            <button
              onClick={() => {
                setQuery('');
                setSelectedIndex(0);
                inputRef.current?.focus();
              }}
              className="p-1 rounded-lg hover:bg-white/10 text-stone-400 hover:text-stone-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <div className="flex items-center gap-1.5 pl-2 border-l border-white/10">
            <kbd className="px-2 py-0.5 rounded-md bg-white/10 text-[10px] font-mono text-stone-400">ESC</kbd>
          </div>
        </div>

        {/* Filter Category Chips */}
        <div className="flex items-center justify-between px-6 py-2.5 bg-black/40 border-b border-white/5 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            {(['all', 'apps', 'files', 'actions'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setFilterCategory(cat);
                  setSelectedIndex(0);
                  sound.playClick();
                }}
                className={`px-3 py-1 rounded-lg capitalize transition-colors ${
                  filterCategory === cat
                    ? 'bg-stone-200 text-stone-950 font-bold'
                    : 'text-stone-400 hover:text-stone-200 hover:bg-white/5'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="text-[11px] text-stone-500 font-sans hidden sm:block">
            Use <kbd className="px-1 bg-white/10 rounded font-mono text-[10px]">↑</kbd> <kbd className="px-1 bg-white/10 rounded font-mono text-[10px]">↓</kbd> to navigate, <kbd className="px-1.5 bg-white/10 rounded font-mono text-[10px]">↵ Enter</kbd> to launch
          </div>
        </div>

        {/* Results Body: List on Left, Preview Pane on Right */}
        <div className="grid grid-cols-12 min-h-[380px] max-h-[460px] overflow-hidden">
          {/* Left Results List */}
          <div 
            ref={listRef} 
            className="col-span-7 border-r border-white/10 overflow-y-auto p-3 flex flex-col gap-1 divide-y divide-transparent"
          >
            {searchResults.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-16 text-center text-stone-500">
                <Search className="w-8 h-8 mb-2 stroke-1 text-stone-600" />
                <p className="text-sm font-medium text-stone-400">No matching files or apps found</p>
                <p className="text-xs text-stone-600 mt-1">Try another keyword or filter tag</p>
              </div>
            ) : (
              searchResults.map((item, index) => {
                const isSelected = index === selectedIndex;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (item.actionHandler) {
                        item.actionHandler();
                        sound.playClick();
                      }
                    }}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`w-full text-left p-3 rounded-2xl flex items-center justify-between transition-all group ${
                      isSelected
                        ? 'bg-stone-200 text-stone-950 shadow-md font-medium'
                        : 'hover:bg-white/5 text-stone-300'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 pr-2">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                          isSelected
                            ? 'bg-stone-950 text-stone-100 border-black'
                            : 'bg-stone-900/80 text-stone-300 border-white/10'
                        }`}
                      >
                        <OSIcon name={item.icon} className="w-4 h-4" />
                      </div>

                      <div className="min-w-0">
                        <div className={`text-sm truncate font-medium ${isSelected ? 'text-stone-950' : 'text-stone-100'}`}>
                          {item.title}
                        </div>
                        <div className={`text-xs truncate ${isSelected ? 'text-stone-700' : 'text-stone-400'}`}>
                          {item.subtitle}
                        </div>
                      </div>
                    </div>

                    {item.badge && (
                      <span
                        className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-md shrink-0 ${
                          isSelected
                            ? 'bg-black/15 text-stone-950 font-bold'
                            : 'bg-white/5 text-stone-400 border border-white/10'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>

          {/* Right Live Preview Pane */}
          <div className="col-span-5 bg-[#0a0a0d] p-6 flex flex-col justify-between overflow-y-auto">
            {currentItem ? (
              <div className="flex flex-col gap-4">
                {/* Header Preview */}
                <div className="flex items-center gap-3.5 pb-4 border-b border-white/10">
                  <div className="w-12 h-12 rounded-2xl bg-stone-900 border border-white/15 flex items-center justify-center shadow-lg shrink-0">
                    <OSIcon name={currentItem.icon} className="w-6 h-6 text-stone-200" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-medium text-stone-100 text-sm truncate">{currentItem.title}</h3>
                    <span className="text-[11px] font-mono text-stone-400 uppercase tracking-wide">
                      {currentItem.category}
                    </span>
                  </div>
                </div>

                {/* Metadata Details */}
                <div className="flex flex-col gap-2 text-xs font-mono">
                  {currentItem.previewDetails?.path && (
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] text-stone-500 uppercase tracking-wider">Location / Path</span>
                      <span className="text-stone-300 font-sans text-xs break-all bg-white/[0.03] p-2 rounded-lg border border-white/5">
                        {currentItem.previewDetails.path}
                      </span>
                    </div>
                  )}

                  {currentItem.previewDetails?.size && (
                    <div className="flex items-center justify-between py-1 border-b border-white/5">
                      <span className="text-stone-500">File Size</span>
                      <span className="text-stone-200">{currentItem.previewDetails.size}</span>
                    </div>
                  )}

                  {currentItem.previewDetails?.modified && (
                    <div className="flex items-center justify-between py-1 border-b border-white/5">
                      <span className="text-stone-500">Last Modified</span>
                      <span className="text-stone-200">{currentItem.previewDetails.modified}</span>
                    </div>
                  )}
                </div>

                {/* Content Snippet / Description */}
                {currentItem.previewDetails?.snippet && (
                  <div className="flex flex-col gap-1.5 mt-1">
                    <span className="text-[10px] font-mono text-stone-500 uppercase tracking-wider">Preview</span>
                    <div className="p-3 rounded-xl bg-black/40 border border-white/5 font-mono text-xs text-stone-300 leading-relaxed max-h-36 overflow-y-auto whitespace-pre-wrap">
                      {currentItem.previewDetails.snippet}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-stone-500 text-xs italic">
                Select an item to view preview
              </div>
            )}

            {/* Launch Button */}
            {currentItem && (
              <div className="pt-4 mt-auto border-t border-white/10">
                <button
                  onClick={() => {
                    if (currentItem.actionHandler) {
                      currentItem.actionHandler();
                      sound.playClick();
                    }
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-stone-100 hover:bg-white text-stone-950 font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-lg"
                >
                  <span>Open / Execute</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
