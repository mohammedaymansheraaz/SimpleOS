import { VFSNode, FileType } from '../types/os';

const DB_NAME = 'aether_os_db';
const DB_VERSION = 1;
const STORE_NAME = 'vfs_nodes';
const STORAGE_KEY = 'aether_os_vfs_fallback';

export const SYSTEM_ROOT_ID = 'root';
export const DESKTOP_DIR_ID = 'desktop-dir';
export const DOCUMENTS_DIR_ID = 'documents-dir';
export const PICTURES_DIR_ID = 'pictures-dir';
export const DOWNLOADS_DIR_ID = 'downloads-dir';
export const APPLICATIONS_DIR_ID = 'applications-dir';
export const TRASH_DIR_ID = 'trash-dir';

const INITIAL_NODES: VFSNode[] = [
  // Root directories
  {
    id: DESKTOP_DIR_ID,
    name: 'Desktop',
    parentId: null,
    type: 'folder',
    createdAt: Date.now() - 100000,
    updatedAt: Date.now() - 100000,
    isSystem: true,
    icon: 'Monitor',
  },
  {
    id: DOCUMENTS_DIR_ID,
    name: 'Documents',
    parentId: null,
    type: 'folder',
    createdAt: Date.now() - 90000,
    updatedAt: Date.now() - 90000,
    isSystem: true,
    icon: 'Folder',
  },
  {
    id: PICTURES_DIR_ID,
    name: 'Pictures',
    parentId: null,
    type: 'folder',
    createdAt: Date.now() - 80000,
    updatedAt: Date.now() - 80000,
    isSystem: true,
    icon: 'Image',
  },
  {
    id: DOWNLOADS_DIR_ID,
    name: 'Downloads',
    parentId: null,
    type: 'folder',
    createdAt: Date.now() - 70000,
    updatedAt: Date.now() - 70000,
    isSystem: true,
    icon: 'Download',
  },
  {
    id: APPLICATIONS_DIR_ID,
    name: 'Applications',
    parentId: null,
    type: 'folder',
    createdAt: Date.now() - 60000,
    updatedAt: Date.now() - 60000,
    isSystem: true,
    icon: 'Grid',
  },
  {
    id: TRASH_DIR_ID,
    name: 'Trash',
    parentId: null,
    type: 'folder',
    createdAt: Date.now() - 50000,
    updatedAt: Date.now() - 50000,
    isSystem: true,
    icon: 'Trash2',
  },

  // Desktop items
  {
    id: 'doc-welcome',
    name: 'Welcome to SimpleOS.md',
    parentId: DESKTOP_DIR_ID,
    type: 'markdown',
    extension: 'md',
    createdAt: Date.now() - 40000,
    updatedAt: Date.now() - 40000,
    content: `# Welcome to SimpleOS 🚀\n\n**SimpleOS is a privacy-focused, fast, and simple operating system** crafted by **Mohammad Aiman**.\n\n### 🌟 Key Highlights:\n- **Privacy & Speed**: 100% local client-side persistence, zero bloat, and instantaneous response times.\n- **Desktop Windowing**: Drag, resize, minimize, maximize, and snap windows with active focus layering.\n- **Virtual Persistent File System**: Full directory hierarchy backed by IndexedDB storage. Drag and drop files between folders or upload real files from your computer!\n- **Installable Web Apps**: Discover web apps in the App Store, or install ANY custom web URL / PWA with one click.\n- **Built-in Power Suite**:\n  - 📁 **File Explorer**: Browse and manage your local storage.\n  - 🛍️ **App Store**: Install games, productivity tools, and widgets.\n  - 🌐 **Web Browser**: Browse the web with multi-tab support.\n  - 📝 **Code & Markdown Editor**: Write notes, scripts, and docs.\n  - 🎨 **Paint Canvas**: Sketch, draw, and save directly to /Pictures.\n  - 💻 **Terminal**: Interactive shell with Unix-like commands.\n  - 🧮 **Calculator**: Standard and scientific operations.\n  - 🎵 **Media Player**: Relaxing tunes and ambient audio.\n  - ⚙️ **System Settings**: Customize wallpaper, themes, and sound effects.\n\nCrafted with precision by **Mohammad Aiman**.`,
  },
  {
    id: 'doc-guide',
    name: 'Shortcuts & Tips.txt',
    parentId: DOCUMENTS_DIR_ID,
    type: 'text',
    extension: 'txt',
    createdAt: Date.now() - 30000,
    updatedAt: Date.now() - 30000,
    content: `SIMPLEOS TIPS & SHORTCUTS:\n\n1. Dragging Windows:\n   - Drag any title bar to move.\n   - Drag title bar to left/right edge of screen to snap into half-screen view!\n   - Drag to top edge to maximize.\n\n2. Drag & Drop Files:\n   - Drag files from your computer's Desktop/Finder directly onto the SimpleOS desktop or File Explorer to import them instantly!\n   - Drag items between folders or onto the Trash to recycle.\n   - Drag desktop icons anywhere to organize your workspace.\n\n3. Install Any App:\n   - Open App Store -> "Install Custom App" -> enter any URL (e.g. https://wikipedia.org, https://excalidraw.com, https://codepen.io).\n\n4. Right Click:\n   - Right-click anywhere on the desktop or on files for context menus.\n\nCrafted by Mohammad Aiman.`,
  },
  {
    id: 'doc-code-sample',
    name: 'matrix_simulation.js',
    parentId: DOCUMENTS_DIR_ID,
    type: 'code',
    extension: 'js',
    createdAt: Date.now() - 20000,
    updatedAt: Date.now() - 20000,
    content: `// Matrix Rain Simulation for SimpleOS\nfunction startMatrixStream(columns = 40) {\n  const chars = '01アイウエオカキクケコサシスセソタチツテト';\n  console.log('[System] Initializing Matrix visualization...');\n  for (let i = 0; i < columns; i++) {\n    const char = chars[Math.floor(Math.random() * chars.length)];\n    console.log(\`Column \${i}: \${char}\`);\n  }\n  return 'Stream Active';\n}\n\nstartMatrixStream(20);`,
  },
];

// Open IndexedDB
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB not supported'));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export class VirtualFileSystem {
  private cache: Map<string, VFSNode> = new Map();
  private initialized: boolean = false;

  public async init(): Promise<Map<string, VFSNode>> {
    if (this.initialized) return this.cache;

    try {
      const db = await openDB();
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.getAll();

      const savedNodes: VFSNode[] = await new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
      });

      if (savedNodes && savedNodes.length > 0) {
        this.cache.clear();
        savedNodes.forEach(node => this.cache.set(node.id, node));
      } else {
        // Seed initial nodes
        this.cache.clear();
        INITIAL_NODES.forEach(node => this.cache.set(node.id, node));
        await this.persistAll();
      }
    } catch {
      // Fallback to localStorage
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          this.cache.clear();
          parsed.forEach((node: VFSNode) => this.cache.set(node.id, node));
        } else {
          this.cache.clear();
          INITIAL_NODES.forEach(node => this.cache.set(node.id, node));
          localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_NODES));
        }
      } catch {
        this.cache.clear();
        INITIAL_NODES.forEach(node => this.cache.set(node.id, node));
      }
    }

    this.initialized = true;
    return this.cache;
  }

  public getAllNodes(): VFSNode[] {
    return Array.from(this.cache.values());
  }

  public getNode(id: string): VFSNode | undefined {
    return this.cache.get(id);
  }

  public getChildren(parentId: string | null): VFSNode[] {
    return Array.from(this.cache.values()).filter(n => n.parentId === parentId);
  }

  public async setNode(node: VFSNode): Promise<void> {
    this.cache.set(node.id, node);
    await this.persistNode(node);
  }

  public async deleteNode(id: string): Promise<void> {
    const node = this.cache.get(id);
    if (!node || node.isSystem) return;

    // Delete children recursively
    const children = this.getChildren(id);
    for (const child of children) {
      await this.deleteNode(child.id);
    }

    this.cache.delete(id);
    await this.removePersistedNode(id);
  }

  public async moveToTrash(id: string): Promise<void> {
    const node = this.cache.get(id);
    if (!node || node.isSystem) return;
    node.parentId = TRASH_DIR_ID;
    node.updatedAt = Date.now();
    await this.setNode(node);
  }

  public async emptyTrash(): Promise<void> {
    const trashItems = this.getChildren(TRASH_DIR_ID);
    for (const item of trashItems) {
      await this.deleteNode(item.id);
    }
  }

  public async restoreFromTrash(id: string, targetParentId: string = DESKTOP_DIR_ID): Promise<void> {
    const node = this.cache.get(id);
    if (!node) return;
    node.parentId = targetParentId;
    node.updatedAt = Date.now();
    await this.setNode(node);
  }

  public async createNode(
    name: string,
    parentId: string | null,
    type: FileType,
    content: string = '',
    url?: string,
    appId?: string
  ): Promise<VFSNode> {
    const id = 'node_' + Math.random().toString(36).substring(2, 10) + '_' + Date.now();
    const ext = name.includes('.') ? name.split('.').pop() : undefined;
    
    const newNode: VFSNode = {
      id,
      name,
      parentId,
      type,
      content,
      size: content ? content.length : 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      extension: ext,
      url,
      appId,
    };

    await this.setNode(newNode);
    return newNode;
  }

  public async resetFileSystem(): Promise<void> {
    this.cache.clear();
    INITIAL_NODES.forEach(n => this.cache.set(n.id, n));
    await this.persistAll();
  }

  public exportBackup(): string {
    return JSON.stringify(Array.from(this.cache.values()), null, 2);
  }

  public async importBackup(jsonString: string): Promise<boolean> {
    try {
      const parsed: VFSNode[] = JSON.parse(jsonString);
      if (Array.isArray(parsed) && parsed.length > 0) {
        this.cache.clear();
        parsed.forEach(n => this.cache.set(n.id, n));
        await this.persistAll();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  private async persistNode(node: VFSNode): Promise<void> {
    try {
      const db = await openDB();
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.put(node);
    } catch {
      this.syncLocalStorage();
    }
  }

  private async removePersistedNode(id: string): Promise<void> {
    try {
      const db = await openDB();
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.delete(id);
    } catch {
      this.syncLocalStorage();
    }
  }

  private async persistAll(): Promise<void> {
    const nodes = Array.from(this.cache.values());
    try {
      const db = await openDB();
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.clear();
      nodes.forEach(node => store.put(node));
    } catch {
      this.syncLocalStorage();
    }
  }

  private syncLocalStorage(): void {
    try {
      const nodes = Array.from(this.cache.values());
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nodes));
    } catch {}
  }
}

export const vfs = new VirtualFileSystem();
