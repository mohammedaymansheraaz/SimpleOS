import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { 
  OSWindow, 
  VFSNode, 
  AppManifest, 
  SystemSettings, 
  OSNotification, 
  ContextMenuState, 
  ContextMenuItem, 
  WindowPosition, 
  WindowSize, 
  WindowSnapState, 
  FileType, 
  OSTheme, 
  AppCategory,
  UserProfile,
} from '../types/os';
import { vfs, DESKTOP_DIR_ID, TRASH_DIR_ID } from '../services/vfs';
import { appRegistry, BUILTIN_APPS, APP_STORE_CATALOG } from '../services/appsRegistry';
import { environmentRegistry } from '../services/environmentRegistry';
import { sound } from '../services/audio';
import confetti from 'canvas-confetti';

interface DesktopIconPosition {
  id: string;
  x: number;
  y: number;
}

interface OSContextValue {
  // Windows
  windows: OSWindow[];
  activeWindowId: string | null;
  openApp: (appId: string, params?: Record<string, any>) => string;
  openFile: (fileNode: VFSNode) => void;
  closeWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  maximizeWindow: (id: string) => void;
  restoreWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  updateWindowPosition: (id: string, pos: WindowPosition) => void;
  updateWindowSize: (id: string, size: WindowSize) => void;
  snapWindow: (id: string, snapState: WindowSnapState) => void;
  togglePinWindow: (id: string) => void;
  minimizeAll: () => void;
  tileWindows: () => void;

  // File System
  nodes: VFSNode[];
  isLoadingFs: boolean;
  getNode: (id: string) => VFSNode | undefined;
  getChildren: (parentId: string | null) => VFSNode[];
  createFile: (name: string, parentId: string | null, content?: string, type?: FileType) => Promise<VFSNode>;
  createFolder: (name: string, parentId: string | null) => Promise<VFSNode>;
  saveFileContent: (id: string, content: string) => Promise<void>;
  deleteNode: (id: string) => Promise<void>;
  renameNode: (id: string, newName: string) => Promise<void>;
  moveNode: (id: string, newParentId: string | null) => Promise<void>;
  emptyTrash: () => Promise<void>;
  importExternalFile: (file: File, targetParentId?: string) => Promise<VFSNode>;
  exportBackup: () => string;
  importBackup: (json: string) => Promise<boolean>;
  resetSystem: () => Promise<void>;

  // Apps
  installedApps: AppManifest[];
  installApp: (manifest: AppManifest) => void;
  installCustomWebApp: (url: string, name: string, icon?: string, category?: AppCategory) => AppManifest;
  uninstallApp: (id: string) => boolean;
  getApp: (id: string) => AppManifest | undefined;

  // Desktop Icons
  desktopIconPositions: Record<string, DesktopIconPosition>;
  setDesktopIconPosition: (id: string, x: number, y: number) => void;
  autoArrangeIcons: () => void;

  // Settings & Theme
  settings: SystemSettings;
  updateSettings: (partial: Partial<SystemSettings>) => void;
  setWallpaper: (wallpaper: string, type?: 'preset' | 'gradient' | 'custom') => void;
  setTheme: (theme: OSTheme) => void;

  // Authentication & Lock Screen
  isLocked: boolean;
  lockScreen: () => void;
  unlockScreen: (passwordAttempt?: string) => { success: boolean; error?: string };
  setUserPassword: (newPassword: string, oldPassword?: string) => { success: boolean; error?: string };
  removeUserPassword: (currentPassword: string) => { success: boolean; error?: string };
  updateUserProfile: (partial: Partial<UserProfile>) => void;

  // Environment & Registry
  envVars: Record<string, string>;
  setEnvVar: (key: string, value: string) => void;
  deleteEnvVar: (key: string) => void;
  registry: Record<string, any>;
  setRegistryKey: (key: string, value: any) => void;

  // Notifications
  notifications: OSNotification[];
  addNotification: (notif: Omit<OSNotification, 'id' | 'timestamp' | 'read'>) => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;

  // Global File & App Search Overlay
  isSearchOpen: boolean;
  openSearch: () => void;
  closeSearch: () => void;
  toggleSearch: () => void;

  // Context Menu
  contextMenu: ContextMenuState;
  openContextMenu: (x: number, y: number, items: ContextMenuItem[]) => void;
  closeContextMenu: () => void;
}

const DEFAULT_USER_PROFILE: UserProfile = {
  username: 'simple',
  displayName: 'SimpleOS User',
  avatar: 'User',
  avatarType: 'icon',
  hasPassword: false,
  passwordHash: '',
  autoLockMinutes: 0,
  lockWallpaperBlur: 'medium',
  requirePasswordOnUnlock: false,
};

const DEFAULT_SETTINGS: SystemSettings = {
  wallpaper: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop',
  wallpaperType: 'preset',
  theme: 'dark',
  accentColor: '#6366f1', // Indigo
  dockPosition: 'bottom',
  soundEnabled: true,
  volume: 80,
  brightness: 100,
  snapAssistEnabled: true,
  windowAnimations: true,
  desktopGridSnap: true,
  iconSize: 'medium',
  wifiConnected: true,
  bluetoothConnected: true,
  airplaneMode: false,
  doNotDisturb: false,
  userProfile: DEFAULT_USER_PROFILE,
  terminalTheme: 'stone',
  terminalFontSize: 13,
};

const OSContext = createContext<OSContextValue | null>(null);

export const OSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Window State
  const [windows, setWindows] = useState<OSWindow[]>([]);
  const [activeWindowId, setActiveWindowId] = useState<string | null>(null);
  const [highestZ, setHighestZ] = useState<number>(100);

  // VFS State
  const [nodes, setNodes] = useState<VFSNode[]>([]);
  const [isLoadingFs, setIsLoadingFs] = useState<boolean>(true);

  // Apps State
  const [installedApps, setInstalledApps] = useState<AppManifest[]>([]);

  // Desktop Icons Layout
  const [desktopIconPositions, setDesktopIconPositions] = useState<Record<string, DesktopIconPosition>>(() => {
    try {
      const raw = localStorage.getItem('simpleos_desktop_icons') || localStorage.getItem('aether_desktop_icons');
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });

  // Settings State
  const [settings, setSettings] = useState<SystemSettings>(() => {
    try {
      const raw = localStorage.getItem('simpleos_settings') || localStorage.getItem('aether_settings');
      if (raw) {
        const parsed = JSON.parse(raw);
        // Sanitize legacy profile names
        if (parsed.userProfile) {
          if (parsed.userProfile.username === 'aether' || !parsed.userProfile.username) {
            parsed.userProfile.username = 'simple';
          }
          if (
            parsed.userProfile.displayName === 'Aether Administrator' ||
            parsed.userProfile.displayName === 'Ether Administrator' ||
            parsed.userProfile.displayName === 'Root User' ||
            !parsed.userProfile.displayName
          ) {
            parsed.userProfile.displayName = 'SimpleOS User';
          }
        }
        return { ...DEFAULT_SETTINGS, ...parsed };
      }
      return DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  // Global Search Overlay State
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const openSearch = useCallback(() => setIsSearchOpen(true), []);
  const closeSearch = useCallback(() => setIsSearchOpen(false), []);
  const toggleSearch = useCallback(() => setIsSearchOpen(prev => !prev), []);

  // Notifications State
  const [notifications, setNotifications] = useState<OSNotification[]>([]);

  // Context Menu State
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    isOpen: false,
    x: 0,
    y: 0,
    items: [],
  });

  // Initialize VFS and Apps
  useEffect(() => {
    async function initializeSystem() {
      setIsLoadingFs(true);
      const fsMap = await vfs.init();
      setNodes(Array.from(fsMap.values()));
      setInstalledApps(appRegistry.getAllApps());
      setIsLoadingFs(false);

      // Welcome Notification
      setTimeout(() => {
        addNotification({
          title: 'Welcome to SimpleOS',
          message: 'System online. Press ⌘K or Ctrl+K to open global file and app search.',
          type: 'info',
          icon: 'Sparkles',
        });
      }, 800);
    }
    initializeSystem();
  }, []);

  // Sync settings sound toggle with audio service
  useEffect(() => {
    sound.setEnabled(settings.soundEnabled);
    try {
      localStorage.setItem('aether_settings', JSON.stringify(settings));
    } catch {}
  }, [settings]);

  // Sync desktop icon positions
  useEffect(() => {
    try {
      localStorage.setItem('aether_desktop_icons', JSON.stringify(desktopIconPositions));
    } catch {}
  }, [desktopIconPositions]);

  // Close context menu on outside click or escape
  useEffect(() => {
    const handleGlobalClick = () => {
      if (contextMenu.isOpen) {
        setContextMenu(prev => ({ ...prev, isOpen: false }));
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setContextMenu(prev => ({ ...prev, isOpen: false }));
      }
    };
    window.addEventListener('click', handleGlobalClick);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('click', handleGlobalClick);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [contextMenu.isOpen]);

  // Notifications handler
  const addNotification = useCallback((notif: Omit<OSNotification, 'id' | 'timestamp' | 'read'>) => {
    if (settings.doNotDisturb && notif.type !== 'error') return;
    
    sound.playNotification();
    const id = 'notif_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now();
    const newNotif: OSNotification = {
      ...notif,
      id,
      timestamp: Date.now(),
      read: false,
    };
    setNotifications(prev => [newNotif, ...prev.slice(0, 19)]); // Keep last 20
  }, [settings.doNotDisturb]);

  const markNotificationRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Context Menu Helpers
  const openContextMenu = useCallback((x: number, y: number, items: ContextMenuItem[]) => {
    sound.playClick();
    // Clamp to viewport
    const menuWidth = 220;
    const menuHeight = items.length * 36 + 20;
    const safeX = Math.min(x, window.innerWidth - menuWidth - 10);
    const safeY = Math.min(y, window.innerHeight - menuHeight - 50);

    setContextMenu({
      isOpen: true,
      x: Math.max(10, safeX),
      y: Math.max(10, safeY),
      items,
    });
  }, []);

  const closeContextMenu = useCallback(() => {
    setContextMenu(prev => ({ ...prev, isOpen: false }));
  }, []);

  // Window Management Actions
  const focusWindow = useCallback((id: string) => {
    setHighestZ(prev => {
      const nextZ = prev + 1;
      setWindows(wins => wins.map(w => w.id === id ? { ...w, zIndex: nextZ, isMinimized: false } : w));
      return nextZ;
    });
    setActiveWindowId(id);
  }, []);

  const openApp = useCallback((appId: string, params: Record<string, any> = {}): string => {
    const manifest = appRegistry.getApp(appId);
    if (!manifest) {
      addNotification({
        title: 'Application Not Found',
        message: `App with ID "${appId}" could not be launched.`,
        type: 'error',
      });
      return '';
    }

    const canonicalId = manifest.id;
    sound.playWindowOpen();

    // Check single instance
    if (manifest.singleInstance) {
      const existing = windows.find(w => w.appId === canonicalId || w.appId === appId);
      if (existing) {
        if (existing.isMinimized) {
          setWindows(wins => wins.map(w => w.id === existing.id ? { ...w, isMinimized: false, params: { ...w.params, ...params } } : w));
        }
        focusWindow(existing.id);
        return existing.id;
      }
    }

    const windowId = 'win_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now();
    const nextZ = highestZ + 1;
    setHighestZ(nextZ);

    // Stagger window position
    const offset = (windows.length % 8) * 28;
    const defaultX = Math.max(40, Math.min(window.innerWidth - manifest.defaultWidth - 40, 100 + offset));
    const defaultY = Math.max(40, Math.min(window.innerHeight - manifest.defaultHeight - 90, 60 + offset));

    const newWindow: OSWindow = {
      id: windowId,
      appId: canonicalId,
      title: params.title || manifest.name,
      icon: manifest.icon,
      isMinimized: false,
      isMaximized: false,
      zIndex: nextZ,
      position: { x: defaultX, y: defaultY },
      size: { width: manifest.defaultWidth, height: manifest.defaultHeight },
      minWidth: manifest.minWidth || 360,
      minHeight: manifest.minHeight || 280,
      params,
    };

    setWindows(prev => [...prev, newWindow]);
    setActiveWindowId(windowId);
    return windowId;
  }, [windows, highestZ, focusWindow, addNotification]);

  const openFile = useCallback((fileNode: VFSNode) => {
    if (fileNode.type === 'folder') {
      openApp('file-explorer', { currentFolderId: fileNode.id, title: `Files - ${fileNode.name}` });
    } else if (fileNode.type === 'text' || fileNode.type === 'markdown' || fileNode.type === 'code') {
      openApp('text-editor', { fileId: fileNode.id, filePath: fileNode.name, title: fileNode.name });
    } else if (fileNode.type === 'image') {
      openApp('paint', { fileId: fileNode.id, imageContent: fileNode.content, title: `Paint - ${fileNode.name}` });
    } else if (fileNode.type === 'audio') {
      openApp('media-player', { fileId: fileNode.id, audioUrl: fileNode.content, title: `Music - ${fileNode.name}` });
    } else if (fileNode.type === 'app' && fileNode.appId) {
      openApp(fileNode.appId);
    } else if (fileNode.type === 'url' && fileNode.url) {
      openApp('web-browser', { initialUrl: fileNode.url, title: `Browser - ${fileNode.name}` });
    } else {
      // Default to CodePad
      openApp('text-editor', { fileId: fileNode.id, filePath: fileNode.name, title: fileNode.name });
    }
  }, [openApp]);

  const closeWindow = useCallback((id: string) => {
    sound.playWindowClose();
    setWindows(prev => {
      const filtered = prev.filter(w => w.id !== id);
      if (activeWindowId === id) {
        const remaining = filtered.filter(w => !w.isMinimized);
        if (remaining.length > 0) {
          const topWindow = remaining.reduce((prevMax, curr) => curr.zIndex > prevMax.zIndex ? curr : prevMax, remaining[0]);
          setActiveWindowId(topWindow.id);
        } else {
          setActiveWindowId(null);
        }
      }
      return filtered;
    });
  }, [activeWindowId]);

  const minimizeWindow = useCallback((id: string) => {
    sound.playWindowClose();
    setWindows(prev => prev.map(w => w.id === id ? { ...w, isMinimized: true } : w));
    if (activeWindowId === id) {
      setActiveWindowId(null);
    }
  }, [activeWindowId]);

  const maximizeWindow = useCallback((id: string) => {
    sound.playClick();
    setWindows(prev => prev.map(w => {
      if (w.id !== id) return w;
      if (w.isMaximized) {
        // Restore
        return {
          ...w,
          isMaximized: false,
          position: w.prevPosition || { x: 100, y: 100 },
          size: w.prevSize || { width: 800, height: 500 },
          snapState: 'none',
        };
      } else {
        // Maximize
        return {
          ...w,
          isMaximized: true,
          prevPosition: w.position,
          prevSize: w.size,
          snapState: 'maximize',
        };
      }
    }));
    focusWindow(id);
  }, [focusWindow]);

  const restoreWindow = useCallback((id: string) => {
    sound.playClick();
    setWindows(prev => prev.map(w => {
      if (w.id !== id) return w;
      return {
        ...w,
        isMinimized: false,
        isMaximized: false,
        snapState: 'none',
        position: w.prevPosition || w.position,
        size: w.prevSize || w.size,
      };
    }));
    focusWindow(id);
  }, [focusWindow]);

  const updateWindowPosition = useCallback((id: string, pos: WindowPosition) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, position: pos, isMaximized: false, snapState: 'none' } : w));
  }, []);

  const updateWindowSize = useCallback((id: string, size: WindowSize) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, size, isMaximized: false, snapState: 'none' } : w));
  }, []);

  const snapWindow = useCallback((id: string, snapState: WindowSnapState) => {
    sound.playClick();
    const taskbarHeight = settings.dockPosition === 'bottom' || settings.dockPosition === 'top' ? 48 : 0;
    const taskbarLeft = settings.dockPosition === 'left' ? 64 : 0;
    const screenWidth = window.innerWidth - taskbarLeft;
    const screenHeight = window.innerHeight - (settings.dockPosition === 'bottom' || settings.dockPosition === 'top' ? taskbarHeight : 0);
    const startY = settings.dockPosition === 'top' ? 48 : 0;

    setWindows(prev => prev.map(w => {
      if (w.id !== id) return w;

      const prevPos = w.prevPosition || w.position;
      const prevSz = w.prevSize || w.size;

      if (snapState === 'left') {
        return {
          ...w,
          snapState: 'left',
          isMaximized: false,
          position: { x: taskbarLeft, y: startY },
          size: { width: Math.floor(screenWidth / 2), height: screenHeight },
          prevPosition: prevPos,
          prevSize: prevSz,
        };
      } else if (snapState === 'right') {
        return {
          ...w,
          snapState: 'right',
          isMaximized: false,
          position: { x: taskbarLeft + Math.floor(screenWidth / 2), y: startY },
          size: { width: Math.floor(screenWidth / 2), height: screenHeight },
          prevPosition: prevPos,
          prevSize: prevSz,
        };
      } else if (snapState === 'maximize') {
        return {
          ...w,
          snapState: 'maximize',
          isMaximized: true,
          position: { x: taskbarLeft, y: startY },
          size: { width: screenWidth, height: screenHeight },
          prevPosition: prevPos,
          prevSize: prevSz,
        };
      } else {
        return {
          ...w,
          snapState: 'none',
          isMaximized: false,
          position: prevPos,
          size: prevSz,
        };
      }
    }));
    focusWindow(id);
  }, [settings.dockPosition, focusWindow]);

  const togglePinWindow = useCallback((id: string) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, isPinned: !w.isPinned } : w));
  }, []);

  const minimizeAll = useCallback(() => {
    sound.playClick();
    setWindows(prev => prev.map(w => ({ ...w, isMinimized: true })));
    setActiveWindowId(null);
  }, []);

  const tileWindows = useCallback(() => {
    sound.playClick();
    const visibleWins = windows.filter(w => !w.isMinimized);
    if (visibleWins.length === 0) return;

    const taskbarHeight = 48;
    const availableWidth = window.innerWidth;
    const availableHeight = window.innerHeight - taskbarHeight;

    const count = visibleWins.length;
    const cols = count > 4 ? 3 : count > 1 ? 2 : 1;
    const rows = Math.ceil(count / cols);

    const cellWidth = Math.floor(availableWidth / cols);
    const cellHeight = Math.floor(availableHeight / rows);

    setWindows(prev => prev.map(w => {
      const idx = visibleWins.findIndex(vw => vw.id === w.id);
      if (idx === -1) return w;

      const col = idx % cols;
      const row = Math.floor(idx / cols);

      return {
        ...w,
        isMaximized: false,
        snapState: 'none',
        position: { x: col * cellWidth, y: row * cellHeight },
        size: { width: cellWidth, height: cellHeight },
      };
    }));
  }, [windows]);

  // VFS Operations
  const getNode = useCallback((id: string) => {
    return vfs.getNode(id);
  }, [nodes]);

  const getChildren = useCallback((parentId: string | null) => {
    return nodes.filter(n => n.parentId === parentId);
  }, [nodes]);

  const createFile = useCallback(async (name: string, parentId: string | null, content: string = '', type: FileType = 'text'): Promise<VFSNode> => {
    const node = await vfs.createNode(name, parentId, type, content);
    setNodes(vfs.getAllNodes());
    sound.playClick();
    addNotification({
      title: 'File Created',
      message: `"${name}" was created successfully.`,
      type: 'success',
      icon: 'FilePlus',
    });
    return node;
  }, [addNotification]);

  const createFolder = useCallback(async (name: string, parentId: string | null): Promise<VFSNode> => {
    const node = await vfs.createNode(name, parentId, 'folder');
    setNodes(vfs.getAllNodes());
    sound.playClick();
    addNotification({
      title: 'Folder Created',
      message: `"${name}" folder created.`,
      type: 'success',
      icon: 'FolderPlus',
    });
    return node;
  }, [addNotification]);

  const saveFileContent = useCallback(async (id: string, content: string) => {
    const node = vfs.getNode(id);
    if (!node) return;
    node.content = content;
    node.size = content.length;
    node.updatedAt = Date.now();
    await vfs.setNode(node);
    setNodes(vfs.getAllNodes());
    sound.playClick();
  }, []);

  const deleteNode = useCallback(async (id: string) => {
    const node = vfs.getNode(id);
    if (!node || node.isSystem) return;

    if (node.parentId === TRASH_DIR_ID) {
      await vfs.deleteNode(id);
      sound.playTrash();
      addNotification({
        title: 'Deleted Permanently',
        message: `"${node.name}" removed from disk.`,
        type: 'info',
      });
    } else {
      await vfs.moveToTrash(id);
      sound.playTrash();
      addNotification({
        title: 'Moved to Trash',
        message: `"${node.name}" moved to Trash.`,
        type: 'info',
        icon: 'Trash2',
      });
    }
    setNodes(vfs.getAllNodes());
  }, [addNotification]);

  const renameNode = useCallback(async (id: string, newName: string) => {
    const node = vfs.getNode(id);
    if (!node || node.isSystem) return;
    node.name = newName;
    if (newName.includes('.')) {
      node.extension = newName.split('.').pop();
    }
    node.updatedAt = Date.now();
    await vfs.setNode(node);
    setNodes(vfs.getAllNodes());
    sound.playClick();
  }, []);

  const moveNode = useCallback(async (id: string, newParentId: string | null) => {
    const node = vfs.getNode(id);
    if (!node) return;
    node.parentId = newParentId;
    node.updatedAt = Date.now();
    await vfs.setNode(node);
    setNodes(vfs.getAllNodes());
    sound.playClick();
  }, []);

  const emptyTrash = useCallback(async () => {
    sound.playTrash();
    await vfs.emptyTrash();
    setNodes(vfs.getAllNodes());
    addNotification({
      title: 'Trash Emptied',
      message: 'All recycled items permanently deleted.',
      type: 'info',
    });
  }, [addNotification]);

  // Host OS Drag-and-Drop file import
  const importExternalFile = useCallback(async (file: File, targetParentId: string = DESKTOP_DIR_ID): Promise<VFSNode> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      const isImage = file.type.startsWith('image/');
      const isAudio = file.type.startsWith('audio/');
      
      let inferredType: FileType = 'text';
      if (isImage) inferredType = 'image';
      else if (isAudio) inferredType = 'audio';
      else if (file.name.endsWith('.md')) inferredType = 'markdown';
      else if (file.name.endsWith('.js') || file.name.endsWith('.ts') || file.name.endsWith('.html') || file.name.endsWith('.css') || file.name.endsWith('.json')) inferredType = 'code';

      if (isImage || isAudio) {
        reader.readAsDataURL(file);
      } else {
        reader.readAsText(file);
      }

      reader.onload = async () => {
        const content = (reader.result as string) || '';
        const createdNode = await vfs.createNode(file.name, targetParentId, inferredType, content);
        setNodes(vfs.getAllNodes());
        sound.playSuccessChime();
        try {
          confetti({
            particleCount: 30,
            spread: 50,
            origin: { y: 0.8 },
          });
        } catch {}
        addNotification({
          title: 'File Imported from Host OS',
          message: `"${file.name}" saved to ${targetParentId === DESKTOP_DIR_ID ? 'Desktop' : 'Folder'}.`,
          type: 'success',
          icon: 'FileCheck',
        });
        resolve(createdNode);
      };

      reader.onerror = (err) => {
        addNotification({
          title: 'Import Failed',
          message: `Failed to import ${file.name}.`,
          type: 'error',
        });
        reject(err);
      };
    });
  }, [addNotification]);

  const exportBackup = useCallback(() => {
    return vfs.exportBackup();
  }, []);

  const importBackup = useCallback(async (json: string) => {
    const success = await vfs.importBackup(json);
    if (success) {
      setNodes(vfs.getAllNodes());
      sound.playSuccessChime();
      addNotification({
        title: 'System Restored',
        message: 'Virtual file system restored from backup.',
        type: 'success',
      });
    }
    return success;
  }, [addNotification]);

  const resetSystem = useCallback(async () => {
    await vfs.resetFileSystem();
    setNodes(vfs.getAllNodes());
    setDesktopIconPositions({});
    localStorage.removeItem('aether_desktop_icons');
    localStorage.removeItem('aether_installed_apps');
    setInstalledApps(appRegistry.getAllApps());
    sound.playTrash();
    addNotification({
      title: 'OS Storage Reset',
      message: 'Virtual filesystem and settings reset to factory state.',
      type: 'info',
    });
  }, [addNotification]);

  // App Installation
  const installApp = useCallback((manifest: AppManifest) => {
    appRegistry.installApp(manifest);
    setInstalledApps(appRegistry.getAllApps());
    sound.playSuccessChime();
    try {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {}
    addNotification({
      title: 'App Installed!',
      message: `"${manifest.name}" is now ready to use.`,
      type: 'success',
      icon: 'DownloadCloud',
    });
  }, [addNotification]);

  const installCustomWebApp = useCallback((url: string, name: string, icon: string = 'Globe', category: AppCategory = 'webapps'): AppManifest => {
    let cleanUrl = url.trim();
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      cleanUrl = 'https://' + cleanUrl;
    }

    const id = 'webapp_' + Math.random().toString(36).substring(2, 9);
    const manifest: AppManifest = {
      id,
      name: name || new URL(cleanUrl).hostname,
      icon,
      category,
      type: 'web-url',
      url: cleanUrl,
      description: `Installed Web App: ${cleanUrl}`,
      defaultWidth: 960,
      defaultHeight: 640,
      minWidth: 500,
      minHeight: 400,
      badge: 'Custom PWA',
    };

    installApp(manifest);
    return manifest;
  }, [installApp]);

  const uninstallApp = useCallback((id: string) => {
    const app = appRegistry.getApp(id);
    const success = appRegistry.uninstallApp(id);
    if (success) {
      setInstalledApps(appRegistry.getAllApps());
      sound.playTrash();
      addNotification({
        title: 'App Uninstalled',
        message: `"${app?.name || id}" has been removed.`,
        type: 'info',
      });
    }
    return success;
  }, [addNotification]);

  const getApp = useCallback((id: string) => {
    return appRegistry.getApp(id);
  }, []);

  // Desktop Icons Positioning
  const setDesktopIconPosition = useCallback((id: string, x: number, y: number) => {
    setDesktopIconPositions(prev => ({
      ...prev,
      [id]: { id, x, y },
    }));
  }, []);

  const autoArrangeIcons = useCallback(() => {
    sound.playClick();
    setDesktopIconPositions({});
    localStorage.removeItem('aether_desktop_icons');
    addNotification({
      title: 'Icons Arranged',
      message: 'Desktop icons reset to auto-grid alignment.',
      type: 'info',
    });
  }, [addNotification]);

  // Settings & Theme
  const updateSettings = useCallback((partial: Partial<SystemSettings>) => {
    setSettings(prev => ({ ...prev, ...partial }));
  }, []);

  const setWallpaper = useCallback((wallpaper: string, type: 'preset' | 'gradient' | 'custom' = 'preset') => {
    updateSettings({ wallpaper, wallpaperType: type });
    sound.playClick();
    addNotification({
      title: 'Wallpaper Updated',
      message: 'Desktop background theme updated.',
      type: 'success',
    });
  }, [updateSettings, addNotification]);

  const setTheme = useCallback((theme: OSTheme) => {
    updateSettings({ theme });
    sound.playClick();
  }, [updateSettings]);

  // Authentication & Lock Screen
  const [isLocked, setIsLocked] = useState<boolean>(true);

  // Environment & Registry state
  const [envVars, setEnvVarsState] = useState<Record<string, string>>(() => environmentRegistry.getAllEnv());
  const [registry, setRegistryState] = useState<Record<string, any>>(() => environmentRegistry.getAllRegistry());

  const setEnvVar = useCallback((key: string, value: string) => {
    environmentRegistry.setEnv(key, value);
    setEnvVarsState(environmentRegistry.getAllEnv());
  }, []);

  const deleteEnvVar = useCallback((key: string) => {
    environmentRegistry.deleteEnv(key);
    setEnvVarsState(environmentRegistry.getAllEnv());
  }, []);

  const setRegistryKey = useCallback((key: string, value: any) => {
    environmentRegistry.setRegistryValue(key, value);
    setRegistryState(environmentRegistry.getAllRegistry());
  }, []);

  // Lock Screen Actions
  const lockScreen = useCallback(() => {
    setIsLocked(true);
    sound.playClick();
  }, []);

  const unlockScreen = useCallback((passwordAttempt?: string): { success: boolean; error?: string } => {
    const profile = settings.userProfile || DEFAULT_USER_PROFILE;
    if (profile.hasPassword && profile.passwordHash) {
      if (!passwordAttempt || passwordAttempt !== profile.passwordHash) {
        sound.playError();
        return { success: false, error: 'Incorrect password. Please try again.' };
      }
    }
    setIsLocked(false);
    sound.playSuccessChime();
    return { success: true };
  }, [settings.userProfile]);

  const setUserPassword = useCallback((newPassword: string, oldPassword?: string): { success: boolean; error?: string } => {
    const profile = settings.userProfile || DEFAULT_USER_PROFILE;
    if (profile.hasPassword && profile.passwordHash) {
      if (oldPassword !== profile.passwordHash) {
        return { success: false, error: 'Current password does not match.' };
      }
    }
    if (!newPassword || newPassword.trim().length === 0) {
      return { success: false, error: 'Password cannot be empty.' };
    }

    const updatedProfile: UserProfile = {
      ...profile,
      passwordHash: newPassword,
      hasPassword: true,
      requirePasswordOnUnlock: true,
    };
    updateSettings({ userProfile: updatedProfile });
    sound.playSuccessChime();
    addNotification({
      title: 'Security Updated',
      message: 'Lock screen password has been configured.',
      type: 'success',
      icon: 'ShieldCheck',
    });
    return { success: true };
  }, [settings.userProfile, updateSettings, addNotification]);

  const removeUserPassword = useCallback((currentPassword: string): { success: boolean; error?: string } => {
    const profile = settings.userProfile || DEFAULT_USER_PROFILE;
    if (profile.hasPassword && profile.passwordHash) {
      if (currentPassword !== profile.passwordHash) {
        return { success: false, error: 'Current password does not match.' };
      }
    }
    const updatedProfile: UserProfile = {
      ...profile,
      passwordHash: '',
      hasPassword: false,
      requirePasswordOnUnlock: false,
    };
    updateSettings({ userProfile: updatedProfile });
    sound.playSuccessChime();
    addNotification({
      title: 'Password Removed',
      message: 'Instant unlock without password is now enabled.',
      type: 'info',
      icon: 'Unlock',
    });
    return { success: true };
  }, [settings.userProfile, updateSettings, addNotification]);

  const updateUserProfile = useCallback((partial: Partial<UserProfile>) => {
    const current = settings.userProfile || DEFAULT_USER_PROFILE;
    updateSettings({ userProfile: { ...current, ...partial } });
  }, [settings.userProfile, updateSettings]);

  // Auto-lock timer on user inactivity
  useEffect(() => {
    const autoLockMinutes = settings.userProfile?.autoLockMinutes || 0;
    if (autoLockMinutes <= 0 || isLocked) return;

    const timeoutMs = autoLockMinutes * 60 * 1000;
    let timer: any = null;

    const resetTimer = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        setIsLocked(true);
      }, timeoutMs);
    };

    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];
    events.forEach(ev => window.addEventListener(ev, resetTimer));
    resetTimer();

    return () => {
      if (timer) clearTimeout(timer);
      events.forEach(ev => window.removeEventListener(ev, resetTimer));
    };
  }, [settings.userProfile?.autoLockMinutes, isLocked]);

  // Global hotkeys (Super+K for Search, Super+L for lock, Super+T for terminal, Super+E for files)
  useEffect(() => {
    const handleGlobalHotkeys = (e: KeyboardEvent) => {
      const isMeta = e.metaKey || e.ctrlKey;
      if (isMeta && (e.key === 'k' || e.key === 'K')) {
        if (!isLocked) {
          e.preventDefault();
          toggleSearch();
        }
      } else if (isMeta && (e.key === 'l' || e.key === 'L')) {
        e.preventDefault();
        setIsLocked(true);
      } else if (isMeta && (e.key === 't' || e.key === 'T')) {
        if (!isLocked) {
          e.preventDefault();
          openApp('terminal');
        }
      } else if (isMeta && (e.key === 'e' || e.key === 'E')) {
        if (!isLocked) {
          e.preventDefault();
          openApp('files');
        }
      }
    };
    window.addEventListener('keydown', handleGlobalHotkeys);
    return () => window.removeEventListener('keydown', handleGlobalHotkeys);
  }, [isLocked, openApp, toggleSearch]);

  const contextValue: OSContextValue = useMemo(() => ({
    windows,
    activeWindowId,
    openApp,
    openFile,
    closeWindow,
    minimizeWindow,
    maximizeWindow,
    restoreWindow,
    focusWindow,
    updateWindowPosition,
    updateWindowSize,
    snapWindow,
    togglePinWindow,
    minimizeAll,
    tileWindows,

    nodes,
    isLoadingFs,
    getNode,
    getChildren,
    createFile,
    createFolder,
    saveFileContent,
    deleteNode,
    renameNode,
    moveNode,
    emptyTrash,
    importExternalFile,
    exportBackup,
    importBackup,
    resetSystem,

    installedApps,
    installApp,
    installCustomWebApp,
    uninstallApp,
    getApp,

    desktopIconPositions,
    setDesktopIconPosition,
    autoArrangeIcons,

    settings,
    updateSettings,
    setWallpaper,
    setTheme,

    isLocked,
    lockScreen,
    unlockScreen,
    setUserPassword,
    removeUserPassword,
    updateUserProfile,

    envVars,
    setEnvVar,
    deleteEnvVar,
    registry,
    setRegistryKey,

    notifications,
    addNotification,
    markNotificationRead,
    clearNotifications,

    isSearchOpen,
    openSearch,
    closeSearch,
    toggleSearch,

    contextMenu,
    openContextMenu,
    closeContextMenu,
  }), [
    windows,
    activeWindowId,
    openApp,
    openFile,
    closeWindow,
    minimizeWindow,
    maximizeWindow,
    restoreWindow,
    focusWindow,
    updateWindowPosition,
    updateWindowSize,
    snapWindow,
    togglePinWindow,
    minimizeAll,
    tileWindows,

    nodes,
    isLoadingFs,
    getNode,
    getChildren,
    createFile,
    createFolder,
    saveFileContent,
    deleteNode,
    renameNode,
    moveNode,
    emptyTrash,
    importExternalFile,
    exportBackup,
    importBackup,
    resetSystem,

    installedApps,
    installApp,
    installCustomWebApp,
    uninstallApp,
    getApp,

    desktopIconPositions,
    setDesktopIconPosition,
    autoArrangeIcons,

    settings,
    updateSettings,
    setWallpaper,
    setTheme,

    isLocked,
    lockScreen,
    unlockScreen,
    setUserPassword,
    removeUserPassword,
    updateUserProfile,

    envVars,
    setEnvVar,
    deleteEnvVar,
    registry,
    setRegistryKey,

    notifications,
    addNotification,
    markNotificationRead,
    clearNotifications,

    isSearchOpen,
    openSearch,
    closeSearch,
    toggleSearch,

    contextMenu,
    openContextMenu,
    closeContextMenu,
  ]);

  return <OSContext.Provider value={contextValue}>{children}</OSContext.Provider>;
};

export const useOS = () => {
  const context = useContext(OSContext);
  if (!context) {
    throw new Error('useOS must be used within an OSProvider');
  }
  return context;
};
