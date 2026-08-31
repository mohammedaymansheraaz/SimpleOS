import { AppManifest } from '../types/os';

export const APP_ID_ALIASES: Record<string, string> = {
  files: 'file-explorer',
  'file-explorer': 'file-explorer',
  editor: 'text-editor',
  'text-editor': 'text-editor',
  calc: 'calculator',
  calculator: 'calculator',
  appstore: 'app-store',
  'app-store': 'app-store',
  browser: 'web-browser',
  'web-browser': 'web-browser',
  media: 'media-player',
  'media-player': 'media-player',
  tasks: 'task-manager',
  'task-manager': 'task-manager',
  'storage-manager': 'storage-manager',
  'system-registry': 'system-registry',
  settings: 'settings',
  terminal: 'terminal',
  paint: 'paint',
  clock: 'clock',
  calendar: 'calendar',
  weather: 'weather',
  camera: 'camera',
  stickynotes: 'sticky-notes',
  'sticky-notes': 'sticky-notes',
  snake: 'app-snake',
  'app-snake': 'app-snake',
  game2048: 'app-2048',
  'app-2048': 'app-2048',
  pomodoro: 'app-pomodoro',
  'app-pomodoro': 'app-pomodoro',
};

export const BUILTIN_APPS: AppManifest[] = [
  {
    id: 'file-explorer',
    name: 'Files',
    icon: 'Folder',
    category: 'system',
    type: 'builtin',
    description: 'Browse, manage, and drag-and-drop files across virtual storage and host OS.',
    defaultWidth: 840,
    defaultHeight: 560,
    minWidth: 540,
    minHeight: 400,
    isSystem: true,
    badge: 'Core',
  },
  {
    id: 'web-browser',
    name: 'Browser',
    icon: 'Globe',
    category: 'productivity',
    type: 'builtin',
    description: 'Minimalist web browser and sandbox for web applications, encyclopedia lookup, and live web search.',
    defaultWidth: 960,
    defaultHeight: 640,
    minWidth: 500,
    minHeight: 380,
    badge: 'Core',
  },
  {
    id: 'text-editor',
    name: 'Text Editor',
    icon: 'FileText',
    category: 'productivity',
    type: 'builtin',
    description: 'Minimalist text, code, and markdown editor with live preview and VFS saving.',
    defaultWidth: 820,
    defaultHeight: 560,
    minWidth: 460,
    minHeight: 350,
    isSystem: true,
    badge: 'Editor',
  },
  {
    id: 'calculator',
    name: 'Calculator',
    icon: 'Calculator',
    category: 'utilities',
    type: 'builtin',
    description: 'Clean standard and scientific calculator with calculation history.',
    defaultWidth: 360,
    defaultHeight: 520,
    minWidth: 320,
    minHeight: 480,
    singleInstance: true,
    badge: 'Utility',
  },
  {
    id: 'app-store',
    name: 'App Store',
    icon: 'ShoppingBag',
    category: 'system',
    type: 'builtin',
    description: 'Discover and install minimalist web apps, games, tools, or install custom URLs.',
    defaultWidth: 920,
    defaultHeight: 620,
    minWidth: 600,
    minHeight: 450,
    isSystem: true,
    badge: 'Store',
  },
  {
    id: 'clock',
    name: 'Clock & Timer',
    icon: 'Clock',
    category: 'utilities',
    type: 'builtin',
    description: 'World clock, precision stopwatch with laps, countdown timer, and alarms.',
    defaultWidth: 680,
    defaultHeight: 520,
    minWidth: 460,
    minHeight: 380,
  },
  {
    id: 'calendar',
    name: 'Calendar',
    icon: 'Calendar',
    category: 'productivity',
    type: 'builtin',
    description: 'Minimalist monthly planner, daily agenda, and scheduled event tracker.',
    defaultWidth: 780,
    defaultHeight: 540,
    minWidth: 500,
    minHeight: 400,
  },
  {
    id: 'weather',
    name: 'Weather',
    icon: 'Cloud',
    category: 'utilities',
    type: 'builtin',
    description: 'Real-time weather forecast, atmospheric conditions, and 5-day outlook.',
    defaultWidth: 640,
    defaultHeight: 520,
    minWidth: 460,
    minHeight: 380,
  },
  {
    id: 'camera',
    name: 'Camera',
    icon: 'Camera',
    category: 'media',
    type: 'builtin',
    description: 'Capture photo snapshots with retro filters and save directly to Pictures.',
    defaultWidth: 740,
    defaultHeight: 560,
    minWidth: 480,
    minHeight: 400,
  },
  {
    id: 'paint',
    name: 'Paint',
    icon: 'Palette',
    category: 'media',
    type: 'builtin',
    description: 'Creative drawing canvas with brush tools, shapes, and photo export to Pictures.',
    defaultWidth: 820,
    defaultHeight: 580,
    minWidth: 500,
    minHeight: 400,
  },
  {
    id: 'media-player',
    name: 'Music & Gallery',
    icon: 'Music',
    category: 'media',
    type: 'builtin',
    description: 'Audio synthesizer, sound generator, visualizer, and photo gallery.',
    defaultWidth: 720,
    defaultHeight: 500,
    minWidth: 480,
    minHeight: 360,
  },
  {
    id: 'terminal',
    name: 'Terminal',
    icon: 'Terminal',
    category: 'development',
    type: 'builtin',
    description: 'Unix shell command prompt with pipe redirection, VFS management, and CLI utilities.',
    defaultWidth: 740,
    defaultHeight: 500,
    minWidth: 440,
    minHeight: 300,
    isSystem: true,
  },
  {
    id: 'sticky-notes',
    name: 'Sticky Notes',
    icon: 'StickyNote',
    category: 'productivity',
    type: 'builtin',
    description: 'Quick minimalist notes that stay on your desktop.',
    defaultWidth: 480,
    defaultHeight: 460,
    minWidth: 340,
    minHeight: 300,
  },
  {
    id: 'task-manager',
    name: 'Task Manager',
    icon: 'Activity',
    category: 'system',
    type: 'builtin',
    description: 'Monitor active processes, memory usage, and terminate background tasks.',
    defaultWidth: 740,
    defaultHeight: 500,
    minWidth: 500,
    minHeight: 360,
    isSystem: true,
  },
  {
    id: 'storage-manager',
    name: 'Storage Manager',
    icon: 'HardDrive',
    category: 'system',
    type: 'builtin',
    description: 'Inspect virtual partition quotas, directory sizes, and perform storage cleanup.',
    defaultWidth: 840,
    defaultHeight: 560,
    minWidth: 540,
    minHeight: 400,
    isSystem: true,
  },
  {
    id: 'system-registry',
    name: 'Registry & Env',
    icon: 'Cpu',
    category: 'system',
    type: 'builtin',
    description: 'Environment variables ($PATH, $USER), system registry keys, and CLI binary registry.',
    defaultWidth: 880,
    defaultHeight: 580,
    minWidth: 560,
    minHeight: 420,
    isSystem: true,
  },
  {
    id: 'settings',
    name: 'Settings',
    icon: 'Settings',
    category: 'system',
    type: 'builtin',
    description: 'Customize desktop background, visual theme, audio, and security preferences.',
    defaultWidth: 840,
    defaultHeight: 560,
    minWidth: 560,
    minHeight: 400,
    isSystem: true,
    singleInstance: true,
  },
];

// Curated App Store catalog for easy 1-click installation
export const APP_STORE_CATALOG: AppManifest[] = [
  {
    id: 'app-snake',
    name: 'Retro Snake',
    icon: 'Gamepad2',
    category: 'games',
    type: 'builtin',
    description: 'Classic arcade snake game with score tracking and speed scaling.',
    defaultWidth: 540,
    defaultHeight: 600,
    minWidth: 400,
    minHeight: 450,
    author: 'SimpleOS Studios',
    badge: 'Game',
  },
  {
    id: 'app-2048',
    name: '2048 Puzzle',
    icon: 'Grid',
    category: 'games',
    type: 'builtin',
    description: 'Join the numbers and get to the 2048 tile in this addictive puzzle.',
    defaultWidth: 460,
    defaultHeight: 580,
    minWidth: 380,
    minHeight: 480,
    author: 'Gabriele Cirulli',
    badge: 'Puzzle',
  },
  {
    id: 'app-wikipedia',
    name: 'Wikipedia',
    icon: 'BookOpen',
    category: 'webapps',
    type: 'web-url',
    description: 'The free encyclopedia with millions of articles across all languages.',
    url: 'https://en.m.wikipedia.org',
    defaultWidth: 980,
    defaultHeight: 650,
    minWidth: 500,
    minHeight: 400,
    author: 'Wikimedia Foundation',
    badge: 'Web App',
  },
  {
    id: 'app-excalidraw',
    name: 'Excalidraw',
    icon: 'Sparkles',
    category: 'productivity',
    type: 'web-url',
    description: 'Virtual collaborative whiteboard tool for sketching hand-drawn like diagrams.',
    url: 'https://excalidraw.com',
    defaultWidth: 1040,
    defaultHeight: 680,
    minWidth: 600,
    minHeight: 450,
    author: 'Excalidraw Team',
    badge: 'Web App',
  },
  {
    id: 'app-codepen',
    name: 'CodePen Editor',
    icon: 'Code',
    category: 'development',
    type: 'web-url',
    description: 'Social development environment for front-end designers and developers.',
    url: 'https://codepen.io/pen/',
    defaultWidth: 1040,
    defaultHeight: 700,
    minWidth: 600,
    minHeight: 450,
    author: 'CodePen Inc.',
    badge: 'Dev Tool',
  },
  {
    id: 'app-hackernews',
    name: 'Hacker News',
    icon: 'Newspaper',
    category: 'productivity',
    type: 'web-url',
    description: 'Tech and startup news aggregator from Y Combinator.',
    url: 'https://news.ycombinator.com',
    defaultWidth: 860,
    defaultHeight: 620,
    minWidth: 480,
    minHeight: 400,
    author: 'Y Combinator',
    badge: 'News',
  },
];

const APPS_STORAGE_KEY = 'simpleos_installed_apps';

export class AppRegistryService {
  private installedApps: Map<string, AppManifest> = new Map();

  constructor() {
    // Register built-ins by default
    BUILTIN_APPS.forEach(app => this.installedApps.set(app.id, app));
    
    // Also install Snake by default as a preinstalled game
    if (!this.installedApps.has('app-snake')) {
      this.installedApps.set('app-snake', APP_STORE_CATALOG[0]);
    }

    this.loadPersistedApps();
  }

  private loadPersistedApps() {
    try {
      const raw不易 = localStorage.getItem(APPS_STORAGE_KEY) || localStorage.getItem('aether_installed_apps');
      if (raw不易) {
        const apps: AppManifest[] = JSON.parse(raw不易);
        apps.forEach(app => this.installedApps.set(app.id, app));
      }
    } catch {}
  }

  private persistApps() {
    try {
      const nonSystemApps = Array.from(this.installedApps.values()).filter(app => !app.isSystem);
      localStorage.setItem(APPS_STORAGE_KEY, JSON.stringify(nonSystemApps));
    } catch {}
  }

  public getAllApps(): AppManifest[] {
    return Array.from(this.installedApps.values());
  }

  public getApp(id: string): AppManifest | undefined {
    if (!id) return undefined;
    const normalizedId = APP_ID_ALIASES[id] || id;
    return this.installedApps.get(normalizedId) || this.installedApps.get(id);
  }

  public installApp(manifest: AppManifest): void {
    this.installedApps.set(manifest.id, manifest);
    this.persistApps();
  }

  public uninstallApp(id: string): boolean {
    const normalizedId = APP_ID_ALIASES[id] || id;
    const app = this.installedApps.get(normalizedId) || this.installedApps.get(id);
    if (!app || app.isSystem) return false;
    this.installedApps.delete(app.id);
    this.persistApps();
    return true;
  }

  public isInstalled(id: string): boolean {
    const normalizedId = APP_ID_ALIASES[id] || id;
    return this.installedApps.has(normalizedId) || this.installedApps.has(id);
  }
}

export const appRegistry不易 = new AppRegistryService();
export const appRegistry = appRegistry不易;
