import React, { useState, useMemo } from 'react';
import { useOS } from '../../context/OSContext';
import { VFSNode, FileType } from '../../types/os';
import { OSIcon } from '../common/OSIcon';
import {
  Folder,
  FileText,
  Image,
  Music,
  Code,
  Globe,
  Trash2,
  Monitor,
  Download,
  Grid,
  List,
  Search,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Plus,
  FolderPlus,
  FilePlus,
  Upload,
  RefreshCw,
  MoreVertical,
  ExternalLink,
} from 'lucide-react';
import { DESKTOP_DIR_ID, DOCUMENTS_DIR_ID, PICTURES_DIR_ID, DOWNLOADS_DIR_ID, TRASH_DIR_ID } from '../../services/vfs';

interface FileExplorerProps {
  initialFolderId?: string;
}

export const FileExplorer: React.FC<FileExplorerProps> = ({ initialFolderId = DESKTOP_DIR_ID }) => {
  const {
    nodes,
    getNode,
    getChildren,
    createFile,
    createFolder,
    deleteNode,
    renameNode,
    moveNode,
    emptyTrash,
    openFile,
    importExternalFile,
    openContextMenu,
  } = useOS();

  const [currentFolderId, setCurrentFolderId] = useState<string>(initialFolderId);
  const [history, setHistory] = useState<string[]>([initialFolderId]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedNodeIds, setSelectedNodeIds] = useState<string[]>([]);
  const [isDragOverZone, setIsDragOverZone] = useState<boolean>(false);

  // New item modal / prompt state
  const [isCreatingFile, setIsCreatingFile] = useState(false);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newItemName, setNewItemName] = useState('');

  // Current folder
  const currentFolder = getNode(currentFolderId) || getNode(DESKTOP_DIR_ID);

  // Navigation handlers
  const navigateTo = (folderId: string) => {
    if (folderId === currentFolderId) return;
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(folderId);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setCurrentFolderId(folderId);
    setSelectedNodeIds([]);
  };

  const handleBack = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setCurrentFolderId(history[historyIndex - 1]);
      setSelectedNodeIds([]);
    }
  };

  const handleForward = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setCurrentFolderId(history[historyIndex + 1]);
      setSelectedNodeIds([]);
    }
  };

  const handleUp = () => {
    if (currentFolder?.parentId) {
      navigateTo(currentFolder.parentId);
    } else if (currentFolderId !== DESKTOP_DIR_ID) {
      navigateTo(DESKTOP_DIR_ID);
    }
  };

  // Get items in current view
  const currentItems = useMemo(() => {
    let items = getChildren(currentFolderId);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = nodes.filter(n => n.name.toLowerCase().includes(q));
    }
    // Sort folders first, then alphabetically
    return items.sort((a, b) => {
      if (a.type === 'folder' && b.type !== 'folder') return -1;
      if (a.type !== 'folder' && b.type === 'folder') return 1;
      return a.name.localeCompare(b.name);
    });
  }, [getChildren, currentFolderId, searchQuery, nodes]);

  // Sidebar items
  const quickAccessFolders = [
    { id: DESKTOP_DIR_ID, name: 'Desktop', icon: 'Monitor' },
    { id: DOCUMENTS_DIR_ID, name: 'Documents', icon: 'Folder' },
    { id: PICTURES_DIR_ID, name: 'Pictures', icon: 'Image' },
    { id: DOWNLOADS_DIR_ID, name: 'Downloads', icon: 'Download' },
    { id: TRASH_DIR_ID, name: 'Trash', icon: 'Trash2' },
  ];

  // Drag and drop within explorer & external host OS files
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOverZone(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOverZone(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOverZone(false);

    // Check if host OS files were dropped
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      for (const file of files) {
        await importExternalFile(file, currentFolderId);
      }
      return;
    }

    // Check internal VFS drag
    const vfsNodeId = e.dataTransfer.getData('text/vfs-node-id');
    if (vfsNodeId) {
      await moveNode(vfsNodeId, currentFolderId);
    }
  };

  const handleItemDragStart = (e: React.DragEvent, item: VFSNode) => {
    e.dataTransfer.setData('text/vfs-node-id', item.id);
    e.dataTransfer.setData('text/plain', item.name);
  };

  // Right-click on Explorer Canvas
  const handleCanvasContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    openContextMenu(e.clientX, e.clientY, [
      {
        id: 'new-file',
        label: 'New Text File',
        icon: 'FilePlus',
        action: () => {
          setNewItemName('New_Document.txt');
          setIsCreatingFile(true);
        },
      },
      {
        id: 'new-folder',
        label: 'New Folder',
        icon: 'FolderPlus',
        action: () => {
          setNewItemName('New_Folder');
          setIsCreatingFolder(true);
        },
      },
      { id: 'div-1', label: '', divider: true },
      {
        id: 'upload-host',
        label: 'Import File from Host OS...',
        icon: 'Upload',
        action: () => {
          const input = document.createElement('input');
          input.type = 'file';
          input.multiple = true;
          input.onchange = (ev) => {
            const files = (ev.target as HTMLInputElement).files;
            if (files) {
              Array.from(files).forEach(f => importExternalFile(f, currentFolderId));
            }
          };
          input.click();
        },
      },
      ...(currentFolderId === TRASH_DIR_ID
        ? [
            { id: 'div-trash', label: '', divider: true },
            {
              id: 'empty-trash',
              label: 'Empty Trash',
              icon: 'Trash2',
              danger: true,
              action: emptyTrash,
            },
          ]
        : []),
    ]);
  };

  // Right-click on individual Item
  const handleItemContextMenu = (e: React.MouseEvent, item: VFSNode) => {
    e.preventDefault();
    e.stopPropagation();

    openContextMenu(e.clientX, e.clientY, [
      {
        id: 'open',
        label: item.type === 'folder' ? 'Open Folder' : 'Open',
        icon: 'ExternalLink',
        action: () => {
          if (item.type === 'folder') {
            navigateTo(item.id);
          } else {
            openFile(item);
          }
        },
      },
      {
        id: 'rename',
        label: 'Rename...',
        icon: 'Edit3',
        action: () => {
          const newName = prompt('Enter new name:', item.name);
          if (newName && newName.trim()) {
            renameNode(item.id, newName.trim());
          }
        },
      },
      { id: 'div-1', label: '', divider: true },
      {
        id: 'download-item',
        label: 'Download to Host OS',
        icon: 'Download',
        disabled: item.type === 'folder',
        action: () => {
          const blob = new Blob([item.content || ''], { type: 'text/plain;charset=utf-8' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = item.name;
          a.click();
          URL.revokeObjectURL(url);
        },
      },
      {
        id: 'delete',
        label: currentFolderId === TRASH_DIR_ID ? 'Delete Permanently' : 'Move to Trash',
        icon: 'Trash2',
        danger: true,
        action: () => deleteNode(item.id),
      },
    ]);
  };

  // Handle new item submissions
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    if (isCreatingFile) {
      let ext = newItemName.includes('.') ? newItemName.split('.').pop() : 'txt';
      let type: FileType = 'text';
      if (ext === 'md') type = 'markdown';
      if (ext === 'js' || ext === 'ts' || ext === 'html' || ext === 'css' || ext === 'json') type = 'code';

      await createFile(newItemName.trim(), currentFolderId, '', type);
      setIsCreatingFile(false);
    } else if (isCreatingFolder) {
      await createFolder(newItemName.trim(), currentFolderId);
      setIsCreatingFolder(false);
    }
    setNewItemName('');
  };

  // Icon mapping helper
  const getItemIcon = (item: VFSNode) => {
    if (item.type === 'folder') return <Folder className="w-8 h-8 text-stone-300 fill-stone-700/30 shrink-0" />;
    if (item.type === 'image') return <Image className="w-8 h-8 text-stone-400 shrink-0" />;
    if (item.type === 'audio') return <Music className="w-8 h-8 text-stone-400 shrink-0" />;
    if (item.type === 'code') return <Code className="w-8 h-8 text-stone-300 shrink-0" />;
    if (item.type === 'markdown') return <FileText className="w-8 h-8 text-stone-300 shrink-0" />;
    if (item.type === 'url') return <Globe className="w-8 h-8 text-stone-400 shrink-0" />;
    if (item.icon) return <OSIcon name={item.icon} className="w-8 h-8 text-stone-300 shrink-0" />;
    return <FileText className="w-8 h-8 text-stone-400 shrink-0" />;
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#090909] text-stone-200 select-none overflow-hidden font-sans">
      {/* Top Action & Navigation Bar */}
      <div className="h-12 px-3 border-b border-white/5 flex items-center justify-between gap-2 bg-[#0c0c0c]/80 shrink-0">
        {/* History Nav */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleBack}
            disabled={historyIndex === 0}
            className="p-1.5 rounded-lg hover:bg-white/10 text-stone-400 hover:text-white disabled:opacity-20 disabled:hover:bg-transparent transition-colors"
            title="Back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleForward}
            disabled={historyIndex >= history.length - 1}
            className="p-1.5 rounded-lg hover:bg-white/10 text-stone-400 hover:text-white disabled:opacity-20 disabled:hover:bg-transparent transition-colors"
            title="Forward"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={handleUp}
            className="p-1.5 rounded-lg hover:bg-white/10 text-stone-400 hover:text-white transition-colors"
            title="Up one folder"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        </div>

        {/* Breadcrumb Path Display */}
        <div className="flex-1 max-w-md h-8 px-3 rounded-lg bg-black/60 border border-white/10 flex items-center gap-1.5 text-xs text-stone-300 font-mono overflow-hidden">
          <Folder className="w-3.5 h-3.5 text-stone-400 shrink-0" />
          <span className="truncate">/{currentFolder?.name || 'Root'}</span>
        </div>

        {/* Search */}
        <div className="relative w-44">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-stone-500" />
          <input
            type="text"
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-8 pl-8 pr-2.5 rounded-lg bg-black/60 border border-white/10 text-xs text-stone-200 placeholder:text-stone-600 focus:outline-none focus:border-white/30"
          />
        </div>

        {/* Actions (New, Upload, View Mode) */}
        <div className="flex items-center gap-1 border-l border-white/10 pl-2">
          <button
            onClick={() => {
              setNewItemName('New_Document.txt');
              setIsCreatingFile(true);
            }}
            title="New File"
            className="p-1.5 rounded-lg hover:bg-white/10 text-stone-300 hover:text-white transition-colors flex items-center gap-1 text-xs"
          >
            <FilePlus className="w-4 h-4 text-stone-300" />
          </button>
          <button
            onClick={() => {
              setNewItemName('New_Folder');
              setIsCreatingFolder(true);
            }}
            title="New Folder"
            className="p-1.5 rounded-lg hover:bg-white/10 text-stone-300 hover:text-white transition-colors flex items-center gap-1 text-xs"
          >
            <FolderPlus className="w-4 h-4 text-stone-300" />
          </button>
          <button
            onClick={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.multiple = true;
              input.onchange = (ev) => {
                const files = (ev.target as HTMLInputElement).files;
                if (files) {
                  Array.from(files).forEach(f => importExternalFile(f, currentFolderId));
                }
              };
              input.click();
            }}
            title="Import files from Host OS"
            className="p-1.5 rounded-lg hover:bg-white/10 text-stone-300 hover:text-white transition-colors flex items-center gap-1 text-xs"
          >
            <Upload className="w-4 h-4 text-stone-300" />
          </button>

          <div className="h-4 w-px bg-white/10 mx-1" />

          <button
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            title="Toggle View Mode"
            className="p-1.5 rounded-lg hover:bg-white/10 text-stone-400 hover:text-white transition-colors"
          >
            {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main File Explorer Body (Sidebar + Content Canvas) */}
      <div className="flex-1 flex min-h-0">
        {/* Sidebar Drive Navigation */}
        <div className="w-48 border-r border-white/5 bg-[#0a0a0a] p-2 flex flex-col gap-1 shrink-0 overflow-y-auto">
          <div className="text-[10px] font-bold text-stone-500 px-2 py-1 uppercase tracking-widest">
            Locations
          </div>
          {quickAccessFolders.map((loc) => {
            const isActive = currentFolderId === loc.id;
            return (
              <button
                key={loc.id}
                onClick={() => navigateTo(loc.id)}
                className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium transition-colors text-left ${
                  isActive
                    ? 'bg-white/10 text-stone-100 border border-white/10'
                    : 'text-stone-400 hover:bg-white/5 hover:text-stone-200'
                }`}
              >
                <OSIcon name={loc.icon} className={`w-4 h-4 ${isActive ? 'text-stone-200' : 'text-stone-500'}`} />
                <span className="truncate">{loc.name}</span>
              </button>
            );
          })}

          <div className="mt-4 text-[10px] font-bold text-stone-500 px-2 py-1 uppercase tracking-widest">
            Storage Engine
          </div>
          <div className="px-2.5 text-[11px] text-stone-500 leading-relaxed bg-white/[0.02] p-2 rounded-xl border border-white/5">
            IndexedDB virtual file system with dropzone host import.
          </div>
        </div>

        {/* Content Canvas */}
        <div
          onContextMenu={handleCanvasContextMenu}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`flex-1 p-4 overflow-y-auto relative transition-colors ${
            isDragOverZone ? 'bg-white/[0.04] ring-2 ring-stone-400 ring-inset' : 'bg-[#090909]'
          }`}
        >
          {/* Drop indicator banner */}
          {isDragOverZone && (
            <div className="absolute inset-4 rounded-xl border-2 border-dashed border-stone-400/80 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center pointer-events-none z-30">
              <Upload className="w-10 h-10 text-stone-200 animate-bounce" />
              <div className="text-sm font-semibold text-stone-100 mt-2 font-serif italic">Drop files to import into {currentFolder?.name}</div>
            </div>
          )}

          {/* New Item Modal prompt overlay */}
          {(isCreatingFile || isCreatingFolder) && (
            <form
              onSubmit={handleCreateSubmit}
              className="mb-4 p-3 rounded-xl bg-stone-900 border border-white/20 shadow-xl flex items-center gap-2"
            >
              {isCreatingFile ? <FilePlus className="w-5 h-5 text-stone-300" /> : <FolderPlus className="w-5 h-5 text-stone-300" />}
              <input
                type="text"
                autoFocus
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder={isCreatingFile ? 'filename.txt' : 'Folder name'}
                className="flex-1 px-3 py-1.5 rounded-lg bg-black border border-white/15 text-xs text-white focus:outline-none focus:border-stone-400"
              />
              <button
                type="submit"
                className="px-3 py-1.5 rounded-lg bg-stone-200 hover:bg-white text-xs font-bold text-black transition-colors"
              >
                Create
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsCreatingFile(false);
                  setIsCreatingFolder(false);
                }}
                className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-xs font-medium text-stone-300 transition-colors"
              >
                Cancel
              </button>
            </form>
          )}

          {/* Empty Folder state */}
          {currentItems.length === 0 && !isCreatingFile && !isCreatingFolder && (
            <div className="h-full flex flex-col items-center justify-center text-center p-8">
              <Folder className="w-12 h-12 text-stone-700 stroke-1 mb-2" />
              <p className="text-sm font-serif italic text-stone-400">This directory is empty</p>
              <p className="text-xs text-stone-600 mt-1 max-w-xs">
                Right-click to create files or drag & drop files from your system.
              </p>
            </div>
          )}

          {/* Grid View */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] gap-3">
              {currentItems.map((item) => {
                const isSelected = selectedNodeIds.includes(item.id);
                return (
                  <div
                    key={item.id}
                    id={`vfs-item-${item.id}`}
                    draggable
                    onDragStart={(e) => handleItemDragStart(e, item)}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (e.ctrlKey || e.metaKey) {
                        setSelectedNodeIds(prev => prev.includes(item.id) ? prev.filter(i => i !== item.id) : [...prev, item.id]);
                      } else {
                        setSelectedNodeIds([item.id]);
                      }
                    }}
                    onDoubleClick={() => {
                      if (item.type === 'folder') {
                        navigateTo(item.id);
                      } else {
                        openFile(item);
                      }
                    }}
                    onContextMenu={(e) => handleItemContextMenu(e, item)}
                    className={`group flex flex-col items-center justify-center p-3 rounded-2xl cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-white/15 ring-1 ring-white/30 shadow-lg'
                        : 'hover:bg-white/5'
                    }`}
                  >
                    <div className="mb-2 transition-transform group-hover:scale-105">
                      {getItemIcon(item)}
                    </div>
                    <span className="text-xs text-stone-300 text-center font-medium line-clamp-2 break-all group-hover:text-white">
                      {item.name}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {/* List View */}
          {viewMode === 'list' && (
            <div className="flex flex-col divide-y divide-white/5">
              <div className="grid grid-cols-12 text-[10px] font-bold text-stone-500 pb-2 px-2 uppercase tracking-widest">
                <span className="col-span-6">Name</span>
                <span className="col-span-3">Type</span>
                <span className="col-span-3 text-right">Modified</span>
              </div>
              {currentItems.map((item) => {
                const isSelected = selectedNodeIds.includes(item.id);
                return (
                  <div
                    key={item.id}
                    id={`vfs-item-list-${item.id}`}
                    draggable
                    onDragStart={(e) => handleItemDragStart(e, item)}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedNodeIds([item.id]);
                    }}
                    onDoubleClick={() => {
                      if (item.type === 'folder') {
                        navigateTo(item.id);
                      } else {
                        openFile(item);
                      }
                    }}
                    onContextMenu={(e) => handleItemContextMenu(e, item)}
                    className={`grid grid-cols-12 items-center py-2 px-2 text-xs rounded-xl cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-white/15 text-white'
                        : 'hover:bg-white/5 text-stone-300'
                    }`}
                  >
                    <div className="col-span-6 flex items-center gap-2.5 truncate">
                      <div className="scale-75 origin-left">{getItemIcon(item)}</div>
                      <span className="truncate font-medium">{item.name}</span>
                    </div>
                    <span className="col-span-3 text-stone-500 text-[10px] uppercase tracking-wider font-mono">
                      {item.type}
                    </span>
                    <span className="col-span-3 text-right text-stone-500 text-[10px] font-mono">
                      {new Date(item.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Status Bar */}
      <div className="h-7 px-3 border-t border-white/5 bg-[#0a0a0a] flex items-center justify-between text-[11px] text-stone-500 shrink-0 font-mono">
        <div>
          {currentItems.length} {currentItems.length === 1 ? 'item' : 'items'}
          {selectedNodeIds.length > 0 && ` • ${selectedNodeIds.length} selected`}
        </div>
        <div className="flex items-center gap-2">
          <span>VFS_INDEXED_DB</span>
          <span className="w-1.5 h-1.5 rounded-full bg-stone-400" />
        </div>
      </div>
    </div>
  );
};
