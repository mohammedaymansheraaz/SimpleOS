export type FileType = 'text' | 'markdown' | 'image' | 'audio' | 'code' | 'app' | 'folder' | 'url' | 'binary';

export interface VFSNode {
  id: string;
  name: string;
  parentId: string | null; // null for root items
  type: FileType;
  content?: string; // Text content, base64 data URL, or app metadata
  size?: number; // Size in bytes
  createdAt: number;
  updatedAt: number;
  icon?: string;
  extension?: string;
  isSystem?: boolean;
  appId?: string; // If this is an app shortcut
  url?: string; // If this is a web bookmark or web app
}

export type WindowSnapState = 'none' | 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'maximize';

export interface WindowPosition {
  x: number;
  y: number;
}

export interface WindowSize {
  width: number;
  height: number;
}

export interface OSWindow {
  id: string;
  appId: string;
  title: string;
  icon: string;
  isMinimized: boolean;
  isMaximized: boolean;
  isPinned?: boolean;
  zIndex: number;
  position: WindowPosition;
  size: WindowSize;
  minWidth?: number;
  minHeight?: number;
  prevPosition?: WindowPosition;
  prevSize?: WindowSize;
  snapState?: WindowSnapState;
  extraProps?: Record<string, any>;
  params?: {
    filePath?: string;
    fileId?: string;
    url?: string;
    [key: string]: any;
  };
}

export type WindowState = OSWindow;

export type AppCategory = 'system' | 'productivity' | 'utilities' | 'games' | 'media' | 'webapps' | 'development';

export type AppType = 'builtin' | 'web-url' | 'iframe-html' | 'pwa';

export interface AppManifest {
  id: string;
  name: string;
  icon: string; // Lucide icon name or image URL
  category: AppCategory;
  type: AppType;
  description: string;
  version?: string;
  author?: string;
  url?: string; // For web-url apps
  customHtml?: string; // For iframe-html apps
  defaultWidth: number;
  defaultHeight: number;
  minWidth?: number;
  minHeight?: number;
  singleInstance?: boolean;
  isSystem?: boolean;
  badge?: string;
}

export interface DesktopGridPosition {
  col: number;
  row: number;
}

export type OSTheme = 'dark' | 'light' | 'cyberpunk' | 'nord' | 'emerald' | 'sunset';

export interface UserProfile {
  username: string;
  displayName: string;
  avatar: string;
  avatarType?: 'preset' | 'icon' | 'custom';
  passwordHash?: string;
  hasPassword: boolean;
  autoLockMinutes: number; // 0 for off, 1, 5, 15, 30
  lockWallpaperBlur: 'none' | 'low' | 'medium' | 'high';
  requirePasswordOnUnlock: boolean;
}

export interface RegistryItem {
  key: string;
  category: 'system' | 'desktop' | 'window' | 'terminal' | 'audio' | 'security';
  value: any;
  defaultValue: any;
  type: 'string' | 'number' | 'boolean' | 'json';
  description: string;
}

export interface SystemSettings {
  wallpaper: string;
  wallpaperType: 'preset' | 'gradient' | 'custom';
  theme: OSTheme;
  accentColor: string;
  dockPosition: 'bottom' | 'top' | 'left';
  soundEnabled: boolean;
  volume: number;
  brightness: number;
  snapAssistEnabled: boolean;
  windowAnimations: boolean;
  desktopGridSnap: boolean;
  iconSize: 'small' | 'medium' | 'large';
  wifiConnected: boolean;
  bluetoothConnected: boolean;
  airplaneMode: boolean;
  doNotDisturb: boolean;
  userProfile: UserProfile;
  terminalTheme?: 'stone' | 'matrix' | 'dracula' | 'nord' | 'monokai' | 'solarized';
  terminalFontSize?: number;
}

export interface OSNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: number;
  read: boolean;
  appId?: string;
  icon?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export interface ContextMenuItem {
  id: string;
  label: string;
  icon?: string;
  shortcut?: string;
  danger?: boolean;
  divider?: boolean;
  disabled?: boolean;
  action?: () => void;
}

export interface ContextMenuState {
  isOpen: boolean;
  x: number;
  y: number;
  items: ContextMenuItem[];
}
