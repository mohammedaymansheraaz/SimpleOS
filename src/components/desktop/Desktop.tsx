import React, { useState, useRef } from 'react';
import { useOS } from '../../context/OSContext';
import { OSIcon } from '../common/OSIcon';
import { DESKTOP_DIR_ID } from '../../services/vfs';
import { VFSNode } from '../../types/os';
import {
  Folder,
  FileText,
  Code,
  Image,
  Sparkles,
  Upload,
  Plus,
} from 'lucide-react';

export const Desktop: React.FC = () => {
  const {
    settings,
    getChildren,
    openFile,
    openApp,
    installedApps,
    getApp,
    createFile,
    createFolder,
    deleteNode,
    setContextMenu,
    addNotification,
    openSearch,
  } = useOS();

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const desktopRef = useRef<HTMLDivElement>(null);

  const desktopFiles = getChildren(DESKTOP_DIR_ID);

  // Desktop shortcuts to prominent apps
  const desktopAppShortcuts = [
    'file-explorer',
    'web-browser',
    'text-editor',
    'app-store',
    'calculator',
    'terminal',
    'paint',
    'clock',
    'weather',
    'media-player',
  ];

  // Right-click desktop canvas
  const handleDesktopContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      items: [
        {
          label: 'Global Search',
          icon: 'Search',
          shortcut: '⌘K',
          action: () => openSearch(),
        },
        {
          label: 'New Text File',
          icon: 'FileText',
          action: async () => {
            await createFile('New Note.txt', DESKTOP_DIR_ID, 'Hello from SimpleOS!');
          },
        },
        {
          label: 'New Folder',
          icon: 'Folder',
          action: async () => {
            await createFolder('New Folder', DESKTOP_DIR_ID);
          },
        },
        {
          label: 'Open Terminal',
          icon: 'Terminal',
          action: () => openApp('terminal'),
          divider: true,
        },
        {
          label: 'App Store Catalog',
          icon: 'ShoppingBag',
          action: () => openApp('appstore'),
        },
        {
          label: 'Change Wallpaper',
          icon: 'Image',
          action: () => openApp('settings'),
          divider: true,
        },
        {
          label: 'System Settings',
          icon: 'Settings',
          action: () => openApp('settings'),
        },
      ],
    });
  };

  // Right-click item context menu
  const handleItemContextMenu = (e: React.MouseEvent, node: VFSNode) => {
    e.stopPropagation();
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      items: [
        {
          label: 'Open',
          icon: 'FolderOpen',
          action: () => openFile(node),
        },
        {
          label: 'Download to Host',
          icon: 'Download',
          action: () => {
            const blob = new Blob([node.content || ''], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = node.name;
            a.click();
            URL.revokeObjectURL(url);
          },
          divider: true,
        },
        {
          label: 'Delete',
          icon: 'Trash2',
          danger: true,
          action: async () => {
            await deleteNode(node.id);
          },
        },
      ],
    });
  };

  // Drag and drop files from Host OS onto desktop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files: File[] = Array.from(e.dataTransfer.files);
      for (const file of files) {
        const reader = new FileReader();
        if (file.type.startsWith('image/')) {
          reader.onload = async () => {
            await createFile(file.name, DESKTOP_DIR_ID, reader.result as string, 'image');
          };
          reader.readAsDataURL(file);
        } else {
          reader.onload = async () => {
            await createFile(file.name, DESKTOP_DIR_ID, reader.result as string, 'text');
          };
          reader.readAsText(file);
        }
      }
      addNotification({
        title: 'Files Imported',
        message: `Imported ${files.length} file(s) directly to Desktop.`,
        type: 'success',
      });
    }
  };

  const getNodeIcon = (node: VFSNode) => {
    if (node.type === 'folder') return <Folder className="w-6 h-6 text-stone-300 drop-shadow-md" />;
    if (node.type === 'image') return <Image className="w-6 h-6 text-stone-300 drop-shadow-md" />;
    if (node.type === 'code') return <Code className="w-6 h-6 text-stone-300 drop-shadow-md" />;
    return <FileText className="w-6 h-6 text-stone-300 drop-shadow-md" />;
  };

  return (
    <div
      ref={desktopRef}
      onContextMenu={handleDesktopContextMenu}
      onClick={() => setSelectedNodeId(null)}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="absolute inset-0 select-none overflow-hidden pt-10 pb-20 os-bg-radial"
      style={
        settings.wallpaper && settings.wallpaper !== 'preset'
          ? {
              backgroundImage: `radial-gradient(circle at 50% -20%, rgba(26,26,26,0.85) 0%, rgba(5,5,5,0.95) 80%), url(${settings.wallpaper})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }
          : undefined
      }
    >
      {/* Drag & Drop Host OS dropzone visual guide */}
      {isDragOver && (
        <div className="absolute inset-8 border-2 border-dashed border-white/20 bg-black/80 rounded-3xl z-30 flex flex-col items-center justify-center pointer-events-none backdrop-blur-md animate-pulse">
          <Upload className="w-10 h-10 text-stone-200 mb-3" />
          <div className="text-xs uppercase tracking-[0.2em] font-bold text-stone-100">Drop files to save to Desktop</div>
          <div className="text-[10px] uppercase tracking-widest text-stone-500 mt-1 font-mono">Accepts text, markdown, code, images, audio</div>
        </div>
      )}

      {/* Desktop Grid Layout */}
      <div className="relative z-10 p-8 flex flex-col flex-wrap items-start gap-6 content-start max-h-full">
        {/* App Shortcuts */}
        {desktopAppShortcuts.map((appId) => {
          const app = getApp(appId) || installedApps.find((a) => a.id === appId);
          if (!app) return null;
          const isSelected = selectedNodeId === `app_${app.id}`;

          return (
            <div
              key={`app_${app.id}`}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedNodeId(`app_${app.id}`);
              }}
              onDoubleClick={(e) => {
                e.stopPropagation();
                openApp(app.id);
              }}
              className={`group w-24 p-2 rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all ${
                isSelected
                  ? 'bg-white/10 border border-white/20 shadow-2xl'
                  : 'hover:bg-white/5'
              }`}
            >
              <div className="w-14 h-14 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 group-hover:bg-white/10 group-hover:border-white/20 group-hover:scale-105 shadow-lg flex items-center justify-center transition-all mb-2">
                <OSIcon name={app.icon} className="w-6 h-6 text-stone-200 group-hover:text-white transition-colors" />
              </div>
              <span className="text-[10px] uppercase tracking-widest font-semibold text-stone-300 opacity-75 group-hover:opacity-100 text-center leading-tight truncate w-full px-1">
                {app.name}
              </span>
            </div>
          );
        })}

        {/* Desktop Files & Folders */}
        {desktopFiles.map((node) => {
          const isSelected = selectedNodeId === node.id;

          return (
            <div
              key={node.id}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedNodeId(node.id);
              }}
              onDoubleClick={(e) => {
                e.stopPropagation();
                openFile(node);
              }}
              onContextMenu={(e) => handleItemContextMenu(e, node)}
              className={`group w-24 p-2 rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all ${
                isSelected
                  ? 'bg-white/10 border border-white/20 shadow-2xl'
                  : 'hover:bg-white/5'
              }`}
            >
              <div className="w-14 h-14 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 group-hover:bg-white/10 group-hover:scale-105 shadow-lg flex items-center justify-center transition-all mb-2">
                {getNodeIcon(node)}
              </div>
              <span className="text-[10px] uppercase tracking-widest font-semibold text-stone-300 opacity-75 group-hover:opacity-100 text-center leading-tight truncate w-full px-1">
                {node.name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
