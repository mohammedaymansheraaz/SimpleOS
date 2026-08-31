import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useOS } from '../../context/OSContext';
import { DESKTOP_DIR_ID, DOCUMENTS_DIR_ID, PICTURES_DIR_ID, DOWNLOADS_DIR_ID, TRASH_DIR_ID } from '../../services/vfs';
import { APP_STORE_CATALOG } from '../../services/appsRegistry';
import { CLI_COMMANDS_REGISTRY, environmentRegistry } from '../../services/environmentRegistry';
import { VFSNode, FileType } from '../../types/os';
import { 
  Terminal as TermIcon, 
  Plus, 
  X, 
  Sliders, 
  Maximize2, 
  Minimize2, 
  Sparkles, 
  HelpCircle, 
  RotateCcw,
  Palette,
  Type
} from 'lucide-react';

interface TerminalLine {
  id: string;
  type: 'input' | 'output' | 'error' | 'success' | 'banner' | 'system';
  content: string;
  isHtml?: boolean;
}

interface TerminalTab {
  id: string;
  title: string;
  currentPath: string; // e.g. "/home/aether/Desktop"
  lines: TerminalLine[];
  history: string[];
  historyIndex: number;
}

type TerminalThemeKey = 'stone' | 'matrix' | 'dracula' | 'nord' | 'monokai' | 'solarized';

interface ThemeConfig {
  name: string;
  bg: string;
  text: string;
  promptUser: string;
  promptPath: string;
  output: string;
  error: string;
  success: string;
  banner: string;
  border: string;
  cursor: string;
}

const TERMINAL_THEMES: Record<TerminalThemeKey, ThemeConfig> = {
  stone: {
    name: 'Obsidian Stone',
    bg: 'bg-[#0a0a0c]',
    text: 'text-stone-200',
    promptUser: 'text-stone-300 font-semibold',
    promptPath: 'text-stone-400 font-medium',
    output: 'text-stone-300',
    error: 'text-rose-400',
    success: 'text-emerald-400',
    banner: 'text-stone-100',
    border: 'border-white/10',
    cursor: 'caret-stone-200',
  },
  matrix: {
    name: 'Matrix Green',
    bg: 'bg-[#020d04]',
    text: 'text-green-400',
    promptUser: 'text-green-300 font-bold',
    promptPath: 'text-green-500 font-medium',
    output: 'text-green-400',
    error: 'text-rose-500',
    success: 'text-emerald-300',
    banner: 'text-green-200',
    border: 'border-green-900/40',
    cursor: 'caret-green-400',
  },
  dracula: {
    name: 'Dracula',
    bg: 'bg-[#282a36]',
    text: 'text-[#f8f8f2]',
    promptUser: 'text-[#50fa7b] font-semibold',
    promptPath: 'text-[#8be9fd] font-medium',
    output: 'text-[#f8f8f2]',
    error: 'text-[#ff5555]',
    success: 'text-[#50fa7b]',
    banner: 'text-[#bd93f9]',
    border: 'border-purple-900/30',
    cursor: 'caret-[#f8f8f2]',
  },
  nord: {
    name: 'Nord Frost',
    bg: 'bg-[#2e3440]',
    text: 'text-[#d8dee9]',
    promptUser: 'text-[#88c0d0] font-semibold',
    promptPath: 'text-[#81a1c1] font-medium',
    output: 'text-[#e5e9f0]',
    error: 'text-[#bf616a]',
    success: 'text-[#a3be8c]',
    banner: 'text-[#8fbcbb]',
    border: 'border-sky-900/30',
    cursor: 'caret-[#d8dee9]',
  },
  monokai: {
    name: 'Monokai Pro',
    bg: 'bg-[#272822]',
    text: 'text-[#f8f8f2]',
    promptUser: 'text-[#a6e22e] font-semibold',
    promptPath: 'text-[#66d9ef] font-medium',
    output: 'text-[#f8f8f2]',
    error: 'text-[#f92672]',
    success: 'text-[#a6e22e]',
    banner: 'text-[#fd971f]',
    border: 'border-yellow-900/20',
    cursor: 'caret-[#f8f8f2]',
  },
  solarized: {
    name: 'Solarized Dark',
    bg: 'bg-[#002b36]',
    text: 'text-[#839496]',
    promptUser: 'text-[#859900] font-semibold',
    promptPath: 'text-[#268bd2] font-medium',
    output: 'text-[#93a1a1]',
    error: 'text-[#dc322f]',
    success: 'text-[#2aa198]',
    banner: 'text-[#b58900]',
    border: 'border-cyan-900/30',
    cursor: 'caret-[#839496]',
  },
};

const SYSTEM_VIRTUAL_FILES: Record<string, string> = {
  '/etc/os-release': `NAME="SimpleOS"\nVERSION="2.4.0 (VFS x86_64)"\nID=simpleos\nID_LIKE=debian\nPRETTY_NAME="SimpleOS Linux 2.4.0 (Browser-WASM)"\nVERSION_ID="2.4.0"\nHOME_URL="https://simpleos.internal"\nSUPPORT_URL="https://simpleos.internal/support"`,
  '/etc/hostname': `simpleos-workstation`,
  '/etc/shells': `/bin/sh\n/bin/bash\n/bin/zsh\n/bin/ash\n/usr/bin/zsh`,
  '/etc/passwd': `root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\nsimple:x:1000:1000:SimpleOS User:/home/simple:/bin/bash`,
  '/etc/environment': `PATH="/bin:/usr/bin:/usr/local/bin:/home/simple/.local/bin"\nLANG="en_US.UTF-8"`,
  '/var/log/syslog': `Aug 31 09:00:01 simpleos-workstation systemd[1]: Reached target Graphical Interface.\nAug 31 09:00:02 simpleos-workstation kernel: [    0.000000] Virtual DOM Microkernel v2.4 initialized\nAug 31 09:00:03 simpleos-workstation vfs-daemon[42]: IndexedDB mount /dev/vfs0 mapped to /home/simple\nAug 31 09:00:04 simpleos-workstation simple-wm[120]: Window compositor ready at 60fps`,
  '/proc/version': `Linux version 6.8.0-simple-generic (gcc version 13.2.0) #42-SimpleOS SMP PREEMPT_DYNAMIC`,
  '/proc/cpuinfo': `processor\t: 0\nmodel name\t: WebAssembly Virtual x86_64 Processor @ 3.40GHz\ncpu MHz\t\t: 3400.000\ncache size\t: 16384 KB\ncpu cores\t: 8`,
  '/proc/meminfo': `MemTotal:\t 8388608 kB\nMemFree:\t 4194304 kB\nMemAvailable:\t 6291456 kB\nBuffers:\t  262144 kB\nCached:\t\t 1835008 kB\nSwapTotal:\t 2097152 kB\nSwapFree:\t 2097152 kB`,
};

export const TerminalApp: React.FC = () => {
  const {
    nodes,
    getNode,
    getChildren,
    createFile,
    createFolder,
    deleteNode,
    installApp,
    installedApps,
    openApp,
    openFile,
    windows,
    settings,
    closeWindow,
    lockScreen,
    setUserPassword,
    envVars,
    setEnvVar,
    deleteEnvVar,
  } = useOS();

  // Active Terminal Tabs
  const [tabs, setTabs] = useState<TerminalTab[]>([
    {
      id: 'tab-1',
      title: 'bash #1',
      currentPath: '/home/simple/Desktop',
      history: [],
      historyIndex: -1,
      lines: [
        {
          id: 'init-1',
          type: 'banner',
          content: `SimpleOS Linux Subsystem v2.4.0 (x86_64-wasm-vfs)
Type 'help' for built-in commands or 'neofetch' for system metrics.
Supports Linux pipes (|), redirection (> and >>), tab-completion, and $ENV vars.
`,
        },
      ],
    },
  ]);

  const [activeTabId, setActiveTabId] = useState<string>('tab-1');
  const [inputValue, setInputValue] = useState<string>('');
  const [themeKey, setThemeKey] = useState<TerminalThemeKey>('stone');
  const [fontSize, setFontSize] = useState<number>(13);
  const [isMatrixRunning, setIsMatrixRunning] = useState<boolean>(false);
  const [previousPath, setPreviousPath] = useState<string>('/home/simple');

  const activeTab = tabs.find(t => t.id === activeTabId) || tabs[0];
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const matrixIntervalRef = useRef<any>(null);

  const theme = TERMINAL_THEMES[themeKey] || TERMINAL_THEMES.stone;

  // Auto scroll to bottom on new output
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeTab?.lines]);

  // Focus input on tab change
  useEffect(() => {
    inputRef.current?.focus();
  }, [activeTabId]);

  // Clean matrix loop on unmount
  useEffect(() => {
    return () => {
      if (matrixIntervalRef.current) clearInterval(matrixIntervalRef.current);
    };
  }, []);

  // Path resolution helpers
  const resolveVfsFolder = (pathStr: string): { folderId: string | null; virtualPath: string } | null => {
    let normalized = pathStr.trim();
    if (normalized === '~' || normalized === '') {
      normalized = '/home/simple';
    } else if (normalized.startsWith('~/')) {
      normalized = '/home/simple' + normalized.slice(1);
    } else if (!normalized.startsWith('/')) {
      // Relative path
      const base = activeTab.currentPath === '/' ? '' : activeTab.currentPath;
      normalized = `${base}/${normalized}`;
    }

    // Clean multiple slashes and trailing slash
    const parts = normalized.split('/').filter(Boolean);
    const resolvedParts: string[] = [];

    for (const part of parts) {
      if (part === '.') continue;
      if (part === '..') {
        resolvedParts.pop();
      } else {
        resolvedParts.push(part);
      }
    }

    const canonicalPath = '/' + resolvedParts.join('/');

    // Map canonical path to VFS Folder IDs
    if (canonicalPath === '/home/simple/Desktop' || canonicalPath === '/home/simple/desktop' || canonicalPath === '/home/aether/Desktop') {
      return { folderId: DESKTOP_DIR_ID, virtualPath: '/home/simple/Desktop' };
    }
    if (canonicalPath === '/home/simple/Documents' || canonicalPath === '/home/simple/documents' || canonicalPath === '/home/aether/Documents') {
      return { folderId: DOCUMENTS_DIR_ID, virtualPath: '/home/simple/Documents' };
    }
    if (canonicalPath === '/home/simple/Pictures' || canonicalPath === '/home/simple/pictures' || canonicalPath === '/home/aether/Pictures') {
      return { folderId: PICTURES_DIR_ID, virtualPath: '/home/simple/Pictures' };
    }
    if (canonicalPath === '/home/simple/Downloads' || canonicalPath === '/home/simple/downloads' || canonicalPath === '/home/aether/Downloads') {
      return { folderId: DOWNLOADS_DIR_ID, virtualPath: '/home/simple/Downloads' };
    }
    if (canonicalPath === '/home/simple' || canonicalPath === '/home/aether' || canonicalPath === '/home') {
      return { folderId: DESKTOP_DIR_ID, virtualPath: canonicalPath };
    }
    if (canonicalPath === '/' || canonicalPath === '/etc' || canonicalPath === '/bin' || canonicalPath === '/var' || canonicalPath === '/var/log' || canonicalPath === '/proc' || canonicalPath === '/tmp' || canonicalPath === '/Applications') {
      return { folderId: null, virtualPath: canonicalPath };
    }

    // Check custom folders in VFS
    const allFolders = nodes.filter(n => n.type === 'folder');
    const folderName = resolvedParts[resolvedParts.length - 1];
    const match = allFolders.find(f => f.name.toLowerCase() === folderName?.toLowerCase());
    if (match) {
      return { folderId: match.id, virtualPath: canonicalPath };
    }

    return null;
  };

  const getVfsItemsInPath = (pathStr: string) => {
    const resolved = resolveVfsFolder(pathStr);
    if (!resolved) return [];

    if (resolved.virtualPath === '/') {
      return [
        { name: 'bin', type: 'folder', size: 4096, isSystem: true },
        { name: 'etc', type: 'folder', size: 4096, isSystem: true },
        { name: 'home', type: 'folder', size: 4096, isSystem: true },
        { name: 'var', type: 'folder', size: 4096, isSystem: true },
        { name: 'proc', type: 'folder', size: 0, isSystem: true },
        { name: 'tmp', type: 'folder', size: 1024, isSystem: true },
        { name: 'Applications', type: 'folder', size: 4096, isSystem: true },
      ];
    }

    if (resolved.virtualPath === '/home') {
      return [{ name: 'simple', type: 'folder', size: 4096, isSystem: true }];
    }

    if (resolved.virtualPath === '/home/simple' || resolved.virtualPath === '/home/aether') {
      return [
        { name: 'Desktop', type: 'folder', size: 4096, isSystem: true },
        { name: 'Documents', type: 'folder', size: 4096, isSystem: true },
        { name: 'Pictures', type: 'folder', size: 4096, isSystem: true },
        { name: 'Downloads', type: 'folder', size: 4096, isSystem: true },
        { name: '.bashrc', type: 'text', size: 512, content: '# ~/.bashrc\nexport PS1="\\u@\\h:\\w\\$ "\nalias ll="ls -la"\nalias cls="clear"\n' },
        { name: '.profile', type: 'text', size: 256, content: '# ~/.profile\nexport PATH=$PATH:/home/simple/.local/bin\n' },
      ];
    }

    if (resolved.virtualPath === '/bin') {
      return CLI_COMMANDS_REGISTRY.map(c => ({
        name: c.command,
        type: 'binary',
        size: 32768,
        isExecutable: true,
      }));
    }

    if (resolved.virtualPath === '/etc') {
      return Object.keys(SYSTEM_VIRTUAL_FILES)
        .filter(k => k.startsWith('/etc/'))
        .map(k => ({
          name: k.replace('/etc/', ''),
          type: 'text',
          size: SYSTEM_VIRTUAL_FILES[k].length,
          content: SYSTEM_VIRTUAL_FILES[k],
        }));
    }

    if (resolved.virtualPath === '/var' || resolved.virtualPath === '/var/log') {
      return [
        { name: 'syslog', type: 'text', size: 2048, content: SYSTEM_VIRTUAL_FILES['/var/log/syslog'] },
        { name: 'auth.log', type: 'text', size: 1024, content: 'Aug 31 09:00:00 session opened for user simple' },
      ];
    }

    if (resolved.virtualPath === '/proc') {
      return [
        { name: 'cpuinfo', type: 'text', size: 512, content: SYSTEM_VIRTUAL_FILES['/proc/cpuinfo'] },
        { name: 'meminfo', type: 'text', size: 512, content: SYSTEM_VIRTUAL_FILES['/proc/meminfo'] },
        { name: 'version', type: 'text', size: 128, content: SYSTEM_VIRTUAL_FILES['/proc/version'] },
      ];
    }

    if (resolved.virtualPath === '/Applications') {
      return installedApps.map(a => ({
        name: `${a.name}.app`,
        type: 'app',
        size: 65536,
        appId: a.id,
      }));
    }

    // Default: VFS children of folderId
    if (resolved.folderId) {
      return getChildren(resolved.folderId);
    }

    return [];
  };

  // Environment Variable Interpolation
  const expandEnvVars = (str: string): string => {
    return str.replace(/\$([a-zA-Z0-9_]+)|\$\{([a-zA-Z0-9_]+)\}/g, (_, g1, g2) => {
      const key = g1 || g2;
      if (key === 'PWD') return activeTab.currentPath;
      if (key === 'OLDPWD') return previousPath;
      return envVars[key] || environmentRegistry.getEnv(key) || '';
    });
  };

  // Execute a single command and return its stdout string + lines
  const runSingleCommand = async (rawCmd: string, stdinText?: string): Promise<{ stdout: string; type: 'output' | 'error' | 'success' | 'banner' }> => {
    // Expand alias if applicable
    let expanded = rawCmd.trim();
    const firstWord = expanded.split(' ')[0];
    const aliasMatch = environmentRegistry.getAlias(firstWord);
    if (aliasMatch) {
      expanded = aliasMatch + expanded.slice(firstWord.length);
    }

    // Expand environment variables
    expanded = expandEnvVars(expanded);

    const parts = expanded.match(/(?:[^\s"']+|"[^"]*"|'[^']*')+/g) || [];
    if (parts.length === 0) return { stdout: '', type: 'output' };

    const command = parts[0].toLowerCase();
    const args = parts.slice(1).map(a => a.replace(/^["']|["']$/g, ''));

    switch (command) {
      case 'clear':
      case 'cls':
        return { stdout: '__CLEAR__', type: 'output' };

      case 'help':
        return {
          type: 'banner',
          stdout: `SIMPLEOS LINUX TERMINAL COMMAND REFERENCE:
  File Operations:
    ls [-l] [-a] [-la] [-lh] [path]  List directory contents with permissions
    cd [dir]                         Change directory ('cd ~', 'cd ..', 'cd -')
    pwd                              Print canonical working directory
    cat [-n] <file ...>              Display and concatenate files
    touch <file ...>                 Create empty file(s) or update timestamp
    mkdir [-p] <dir ...>             Create directory / nested paths
    rm [-r] [-rf] <target ...>       Remove files or directories
    cp [-r] <src> <dest>             Copy file or folder
    mv <src> <dest>                  Move or rename file/folder
    tree [path]                      Visual ASCII directory hierarchy
    find [path] -name <pattern>      Search for files matching name

  Text & Filtering:
    grep [-i] [-n] [-v] <pat> [file] Search pattern in file or stream pipe
    head [-n count] <file>           Display first lines of file/stream
    tail [-n count] <file>           Display last lines of file/stream
    wc [-l] [-w] [-c] <file>         Count lines, words, bytes
    echo [-e] [-n] [text]            Print text, expand $VARS, or > / >> redirect

  System, Performance & Admin:
    neofetch                         Display OS specs and ASCII badge
    uname [-a]                       Print system architecture & kernel info
    whoami / hostname / id           Print user credentials and host
    df [-h] / free [-m]              Disk storage and memory usage reports
    ps [aux] / kill <pid>            Inspect active processes & kill tasks
    uptime / date                    System runtime clock and timestamp
    history                          List executed command history
    export VAR=val / env / printenv  Manage environment variables
    alias [name='cmd']               Define or list command shortcuts
    chmod <perms> <file>             Simulate Linux file permissions
    which <command>                  Find executable binary path
    passwd                           Change user lock screen password
    lock                             Instantly lock workstation screen

  Utilities & Network:
    curl <url> / wget <url>          Fetch URL contents or download payload
    ping <host>                      Simulate ICMP round-trip packets
    calc <math expression>           Evaluate arithmetic math expressions
    matrix                           Stream falling Matrix digital rain
    man <cmd>                        Display comprehensive manual page
    open <file/app>                  Launch GUI window application
    apt / pkg <install|list|search>  Manage OS applications and packages`,
        };

      case 'neofetch':
      case 'fastfetch': {
        const upSec = Math.floor(performance.now() / 1000);
        const mins = Math.floor(upSec / 60);
        const secs = upSec % 60;
        return {
          type: 'banner',
          stdout: `
       /\\         ${settings.userProfile?.username || 'simple'}@simpleos-workstation
      /  \\        ---------------------------------------
     / /\\ \\       OS: SimpleOS 2.4.0 (x86_64-wasm-vfs)
    / /  \\ \\      Host: SimpleOS Container Workstation
   / / /\\ \\ \\     Kernel: 6.8.0-simple-generic
  / / /  \\ \\ \\    Uptime: ${mins} mins, ${secs} secs
 /_/_/    \\_\\_\\   Shell: /bin/bash (simple-sh 2.4)
                  Resolution: ${window.innerWidth}x${window.innerHeight}
                  Theme: ${theme.name}
                  Terminal Font: ${fontSize}px JetBrains Mono
                  VFS Engine: IndexedDB High-Speed Quota
                  Active Windows: ${windows.length} Processes
                  Memory: 4194MB / 8192MB Virtual RAM
                  Disk Free: 482MB / 512MB VFS Partition
                  Palette: ● ● ● ● ● ● ● ●`,
        };
      }

      case 'pwd':
        return { stdout: activeTab.currentPath, type: 'output' };

      case 'ls': {
        const isLong = args.some(a => a.includes('l'));
        const isAll = args.some(a => a.includes('a'));
        const isHuman = args.some(a => a.includes('h'));
        const pathArg = args.find(a => !a.startsWith('-')) || activeTab.currentPath;

        const items = getVfsItemsInPath(pathArg);
        if (items.length === 0) {
          return { stdout: '(empty directory)', type: 'output' };
        }

        const filtered = isAll ? items : items.filter((i: any) => !i.name.startsWith('.'));

        if (isLong) {
          const header = `total ${filtered.length * 4}K`;
          const lines = filtered.map((item: any) => {
            const isFolder = item.type === 'folder';
            const perms = isFolder ? 'drwxr-xr-x' : item.isExecutable ? '-rwxr-xr-x' : '-rw-r--r--';
            const owner = 'simple';
            const group = 'users';
            const sizeStr = (item.size || 4096).toString().padStart(6);
            const dateStr = 'Aug 31 09:20';
            const name = isFolder ? `${item.name}/` : item.name;
            return `${perms}  1 ${owner} ${group} ${sizeStr} ${dateStr} ${name}`;
          });
          return { stdout: [header, ...lines].join('\n'), type: 'output' };
        }

        const formatted = filtered.map((i: any) => i.type === 'folder' ? `${i.name}/` : i.name).join('   ');
        return { stdout: formatted, type: 'output' };
      }

      case 'cd': {
        const target = args[0] || '~';
        if (target === '-') {
          // Switch to previous path
          const prev = previousPath;
          setPreviousPath(activeTab.currentPath);
          setTabs(prevTabs => prevTabs.map(t => t.id === activeTab.id ? { ...t, currentPath: prev } : t));
          return { stdout: prev, type: 'output' };
        }

        const resolved = resolveVfsFolder(target);
        if (resolved) {
          setPreviousPath(activeTab.currentPath);
          setTabs(prevTabs => prevTabs.map(t => t.id === activeTab.id ? { ...t, currentPath: resolved.virtualPath } : t));
          return { stdout: '', type: 'output' };
        } else {
          return { stdout: `cd: no such file or directory: ${target}`, type: 'error' };
        }
      }

      case 'cat': {
        let showLineNums = false;
        let fileArgs = args.filter(a => {
          if (a === '-n') {
            showLineNums = true;
            return false;
          }
          return true;
        });

        // If piped stdin exists and no files provided
        if (fileArgs.length === 0 && stdinText !== undefined) {
          if (showLineNums) {
            const lines = stdinText.split('\n').map((l, i) => `${(i + 1).toString().padStart(6)}  ${l}`);
            return { stdout: lines.join('\n'), type: 'output' };
          }
          return { stdout: stdinText, type: 'output' };
        }

        if (fileArgs.length === 0) {
          return { stdout: 'cat: missing file operand. Usage: cat [-n] <filename>', type: 'error' };
        }

        let combined = '';
        for (const fileName of fileArgs) {
          // Check system virtual files
          let fullPath = fileName.startsWith('/') ? fileName : `${activeTab.currentPath}/${fileName}`;
          fullPath = fullPath.replace('//', '/');
          
          if (SYSTEM_VIRTUAL_FILES[fullPath]) {
            combined += SYSTEM_VIRTUAL_FILES[fullPath] + '\n';
            continue;
          }

          // Check VFS
          const resolved = resolveVfsFolder(activeTab.currentPath);
          if (resolved?.folderId) {
            const children = getChildren(resolved.folderId);
            const found = children.find(c => c.name.toLowerCase() === fileName.toLowerCase());
            if (found) {
              combined += (found.content || '(empty file)') + '\n';
              continue;
            }
          }

          return { stdout: `cat: ${fileName}: No such file or directory`, type: 'error' };
        }

        if (showLineNums) {
          const lines = combined.trimEnd().split('\n').map((l, i) => `${(i + 1).toString().padStart(6)}  ${l}`);
          return { stdout: lines.join('\n'), type: 'output' };
        }

        return { stdout: combined.trimEnd(), type: 'output' };
      }

      case 'touch': {
        if (args.length === 0) return { stdout: 'Usage: touch <filename ...>', type: 'error' };
        const resolved = resolveVfsFolder(activeTab.currentPath);
        if (!resolved?.folderId) {
          return { stdout: `touch: cannot touch in read-only system directory ${activeTab.currentPath}`, type: 'error' };
        }

        for (const f of args) {
          await createFile(f, resolved.folderId, '');
        }
        return { stdout: `Created: ${args.join(', ')}`, type: 'success' };
      }

      case 'mkdir': {
        const isParent = args.includes('-p');
        const folders = args.filter(a => a !== '-p');
        if (folders.length === 0) return { stdout: 'Usage: mkdir [-p] <directory ...>', type: 'error' };

        const resolved = resolveVfsFolder(activeTab.currentPath);
        if (!resolved?.folderId) {
          return { stdout: `mkdir: cannot create directory in ${activeTab.currentPath}: Read-only file system`, type: 'error' };
        }

        for (const f of folders) {
          await createFolder(f, resolved.folderId);
        }
        return { stdout: `Created directory: ${folders.join(', ')}`, type: 'success' };
      }

      case 'rm': {
        const isRecursive = args.includes('-r') || args.includes('-rf') || args.includes('-fr');
        const targets = args.filter(a => !a.startsWith('-'));
        if (targets.length === 0) return { stdout: 'Usage: rm [-r] <file/folder ...>', type: 'error' };

        const resolved = resolveVfsFolder(activeTab.currentPath);
        if (!resolved?.folderId) {
          return { stdout: 'rm: cannot remove system files from root', type: 'error' };
        }

        const children = getChildren(resolved.folderId);
        let count = 0;
        for (const t of targets) {
          const found = children.find(c => c.name.toLowerCase() === t.toLowerCase());
          if (found) {
            await deleteNode(found.id);
            count++;
          }
        }

        if (count === 0) {
          return { stdout: `rm: cannot remove '${targets[0]}': No such file or directory`, type: 'error' };
        }
        return { stdout: `Removed ${count} item(s)`, type: 'success' };
      }

      case 'echo': {
        const isNoNewline = args.includes('-n');
        const cleanArgs = args.filter(a => a !== '-n' && a !== '-e');
        return { stdout: cleanArgs.join(' '), type: 'output' };
      }

      case 'grep': {
        const isCaseInsensitive = args.includes('-i');
        const isLineNumber = args.includes('-n');
        const isInvert = args.includes('-v');
        const cleanArgs = args.filter(a => !a.startsWith('-'));

        const pattern = cleanArgs[0];
        const fileTarget = cleanArgs[1];

        if (!pattern) return { stdout: 'Usage: grep [-i] [-n] [-v] <pattern> [file]', type: 'error' };

        let textToSearch = stdinText || '';

        if (fileTarget) {
          const res = await runSingleCommand(`cat ${fileTarget}`);
          if (res.type === 'error') return res;
          textToSearch = res.stdout;
        }

        if (!textToSearch) return { stdout: '', type: 'output' };

        const regex = new RegExp(pattern, isCaseInsensitive ? 'i' : '');
        const lines = textToSearch.split('\n');
        const matches: string[] = [];

        lines.forEach((line, index) => {
          const isMatch = regex.test(line);
          const shouldInclude = isInvert ? !isMatch : isMatch;
          if (shouldInclude) {
            matches.push(isLineNumber ? `${index + 1}:${line}` : line);
          }
        });

        return { stdout: matches.join('\n') || '', type: 'output' };
      }

      case 'find': {
        const nameIdx = args.indexOf('-name');
        const pattern = nameIdx !== -1 ? args[nameIdx + 1]?.replace(/[*"']/g, '') : null;
        const targetPath = args[0] && !args[0].startsWith('-') ? args[0] : activeTab.currentPath;

        const resolved = resolveVfsFolder(targetPath);
        const results: string[] = [];

        if (resolved?.folderId) {
          const items = getChildren(resolved.folderId);
          items.forEach(item => {
            if (!pattern || item.name.toLowerCase().includes(pattern.toLowerCase())) {
              results.push(`${resolved.virtualPath}/${item.name}`);
            }
          });
        }

        return { stdout: results.join('\n') || '(no matches found)', type: 'output' };
      }

      case 'head': {
        const nIdx = args.indexOf('-n');
        const count = nIdx !== -1 ? parseInt(args[nIdx + 1], 10) || 10 : 10;
        const fileArg = args.find(a => !a.startsWith('-') && a !== args[nIdx + 1]);

        let source = stdinText || '';
        if (fileArg) {
          const res = await runSingleCommand(`cat ${fileArg}`);
          if (res.type === 'error') return res;
          source = res.stdout;
        }

        const lines = source.split('\n').slice(0, count);
        return { stdout: lines.join('\n'), type: 'output' };
      }

      case 'tail': {
        const nIdx = args.indexOf('-n');
        const count = nIdx !== -1 ? parseInt(args[nIdx + 1], 10) || 10 : 10;
        const fileArg = args.find(a => !a.startsWith('-') && a !== args[nIdx + 1]);

        let source = stdinText || '';
        if (fileArg) {
          const res = await runSingleCommand(`cat ${fileArg}`);
          if (res.type === 'error') return res;
          source = res.stdout;
        }

        const lines = source.split('\n').slice(-count);
        return { stdout: lines.join('\n'), type: 'output' };
      }

      case 'wc': {
        const isLines = args.includes('-l');
        const isWords = args.includes('-w');
        const isChars = args.includes('-c');
        const fileArg = args.find(a => !a.startsWith('-'));

        let source = stdinText || '';
        if (fileArg) {
          const res = await runSingleCommand(`cat ${fileArg}`);
          if (res.type === 'error') return res;
          source = res.stdout;
        }

        const lineCount = source ? source.split('\n').length : 0;
        const wordCount = source ? source.trim().split(/\s+/).filter(Boolean).length : 0;
        const byteCount = source.length;

        if (isLines) return { stdout: `${lineCount} ${fileArg || ''}`.trim(), type: 'output' };
        if (isWords) return { stdout: `${wordCount} ${fileArg || ''}`.trim(), type: 'output' };
        if (isChars) return { stdout: `${byteCount} ${fileArg || ''}`.trim(), type: 'output' };

        return { stdout: `${lineCount.toString().padStart(6)} ${wordCount.toString().padStart(6)} ${byteCount.toString().padStart(6)} ${fileArg || ''}`.trim(), type: 'output' };
      }

      case 'tree': {
        const items = getVfsItemsInPath(activeTab.currentPath);
        if (items.length === 0) return { stdout: '.\n└── (empty)', type: 'output' };

        const lines = items.map((item: any, idx: number) => {
          const isLast = idx === items.length - 1;
          const branch = isLast ? '└── ' : '├── ';
          return `${branch}${item.name}${item.type === 'folder' ? '/' : ''}`;
        });

        return { stdout: `.\n${lines.join('\n')}\n\n${items.filter((i: any) => i.type === 'folder').length} directories, ${items.filter((i: any) => i.type !== 'folder').length} files`, type: 'output' };
      }

      case 'uname': {
        if (args.includes('-a') || args.length === 0) {
          return { stdout: 'Linux simpleos-workstation 6.8.0-simple #42-SimpleOS SMP PREEMPT_DYNAMIC x86_64 GNU/Linux', type: 'output' };
        }
        if (args.includes('-s')) return { stdout: 'Linux', type: 'output' };
        if (args.includes('-r')) return { stdout: '6.8.0-simple', type: 'output' };
        if (args.includes('-m')) return { stdout: 'x86_64', type: 'output' };
        return { stdout: 'Linux simpleos-workstation', type: 'output' };
      }

      case 'whoami':
        return { stdout: settings.userProfile?.username || 'simple', type: 'output' };

      case 'hostname':
        return { stdout: 'simpleos-workstation', type: 'output' };

      case 'id': {
        const user = settings.userProfile?.username || 'simple';
        return { stdout: `uid=1000(${user}) gid=1000(${user}) groups=1000(${user}),27(sudo),100(users),998(docker)`, type: 'output' };
      }

      case 'df':
        return {
          stdout: `Filesystem     1K-blocks      Used Available Use% Mounted on
/dev/sda1        8388608   4194304   4194304  50% /
tmpfs             524288      1024    523264   1% /tmp
udev             4194304         0   4194304   0% /dev
vfs-indexeddb     524288     32768    491520   7% /home/simple`,
          type: 'output',
        };

      case 'free':
        return {
          stdout: `               total        used        free      shared  buff/cache   available
Mem:            8192        4096        4096         256        1835        6291
Swap:           2048           0        2048`,
          type: 'output',
        };

      case 'ps': {
        const psList = windows.map((w, i) => {
          const pid = 1000 + i * 4;
          return `${settings.userProfile?.username || 'simple'}   ${pid}  0.4  1.2  65536  12288 pts/0    Sl   09:20   0:01 ${w.title} (${w.appId})`;
        });
        return {
          stdout: `USER         PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND
root           1  0.0  0.2  16384  2048 ?        Ss   09:00   0:00 /sbin/init
root          42  0.0  0.4  32768  4096 ?        S    09:00   0:00 /usr/sbin/vfs-daemon
${settings.userProfile?.username || 'simple'}   500  0.1  0.8  45056  8192 pts/0    Ss   09:00   0:00 /bin/bash
${psList.join('\n')}`,
          type: 'output',
        };
      }

      case 'kill': {
        const pidStr = args[0];
        if (!pidStr) return { stdout: 'Usage: kill <pid>', type: 'error' };
        return { stdout: `[+] Sent SIGTERM to PID ${pidStr}`, type: 'success' };
      }

      case 'uptime': {
        const upSec = Math.floor(performance.now() / 1000);
        return { stdout: ` 09:21:42 up ${Math.floor(upSec / 60)} min,  1 user,  load average: 0.12, 0.08, 0.04`, type: 'output' };
      }

      case 'date':
        return { stdout: new Date().toString(), type: 'output' };

      case 'history':
        return {
          stdout: activeTab.history.map((h, i) => `${(i + 1).toString().padStart(5)}  ${h}`).join('\n') || '(no history)',
          type: 'output',
        };

      case 'export': {
        if (args.length === 0) {
          const all = Object.entries(envVars).map(([k, v]) => `declare -x ${k}="${v}"`).join('\n');
          return { stdout: all, type: 'output' };
        }
        const expr = args.join(' ');
        const eqIdx = expr.indexOf('=');
        if (eqIdx !== -1) {
          const k = expr.slice(0, eqIdx).trim();
          const v = expr.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
          setEnvVar(k, v);
          return { stdout: `[+] Exported ${k}=${v}`, type: 'success' };
        }
        return { stdout: 'Usage: export KEY=VALUE', type: 'error' };
      }

      case 'env':
      case 'printenv': {
        if (args[0]) {
          return { stdout: envVars[args[0]] || '', type: 'output' };
        }
        const lines = Object.entries(envVars).map(([k, v]) => `${k}=${v}`).join('\n');
        return { stdout: lines, type: 'output' };
      }

      case 'alias': {
        if (args.length === 0) {
          const all = Object.entries(environmentRegistry.getAllAliases()).map(([k, v]) => `alias ${k}='${v}'`).join('\n');
          return { stdout: all, type: 'output' };
        }
        const expr = args.join(' ');
        const eqIdx = expr.indexOf('=');
        if (eqIdx !== -1) {
          const k = expr.slice(0, eqIdx).trim();
          const v = expr.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
          environmentRegistry.setAlias(k, v);
          return { stdout: `[+] Alias created: ${k} -> ${v}`, type: 'success' };
        }
        return { stdout: 'Usage: alias name="command"', type: 'error' };
      }

      case 'chmod':
        return { stdout: `[+] chmod: permissions updated on ${args[1] || args[0]}`, type: 'success' };

      case 'which': {
        const cmdName = args[0];
        const match = CLI_COMMANDS_REGISTRY.find(c => c.command === cmdName);
        if (match) return { stdout: match.path, type: 'output' };
        return { stdout: `${cmdName} not found in $PATH`, type: 'error' };
      }

      case 'curl': {
        const url = args[0];
        if (!url) return { stdout: 'Usage: curl <url>', type: 'error' };
        try {
          const resp = await fetch(url);
          const txt = await resp.text();
          return { stdout: txt.slice(0, 1000) + (txt.length > 1000 ? '\n...[truncated]' : ''), type: 'output' };
        } catch {
          return { stdout: `curl: Connected to ${url} (200 OK - Simulating HTTP response payload)`, type: 'output' };
        }
      }

      case 'wget': {
        const url = args[0];
        if (!url) return { stdout: 'Usage: wget <url>', type: 'error' };
        return { stdout: `--2026-08-31 09:22:00--  ${url}\nResolving host... connected.\nHTTP request sent, awaiting response... 200 OK\nLength: 14208 (14K) [application/json]\nSaving to: 'index.html'\n\n100%[===================>] 14,208      --.-K/s   in 0.002s\n\n2026-08-31 09:22:00 (6.8 MB/s) - 'index.html' saved`, type: 'success' };
      }

      case 'ping': {
        const host = args[0] || 'simpleos.org';
        return {
          stdout: `PING ${host} (192.168.1.100) 56(84) bytes of data.
64 bytes from 192.168.1.100: icmp_seq=1 ttl=64 time=0.042 ms
64 bytes from 192.168.1.100: icmp_seq=2 ttl=64 time=0.038 ms
64 bytes from 192.168.1.100: icmp_seq=3 ttl=64 time=0.041 ms
--- ${host} ping statistics ---
3 packets transmitted, 3 received, 0% packet loss, time 2004ms
rtt min/avg/max/mdev = 0.038/0.040/0.042/0.002 ms`,
          type: 'output',
        };
      }

      case 'man': {
        const targetCmd = args[0];
        const match = CLI_COMMANDS_REGISTRY.find(c => c.command === targetCmd);
        if (match) {
          return {
            type: 'banner',
            stdout: `NAME
       ${match.command} - ${match.description}

SYNOPSIS
       ${match.syntax}

DESCRIPTION
       ${match.description}. Executable is mapped at ${match.path}.

EXAMPLES
       $ ${match.example}

SEE ALSO
       help, info, simpleos(1)`,
          };
        }
        return { stdout: `No manual entry for ${targetCmd}`, type: 'error' };
      }

      case 'nano':
      case 'vim':
      case 'edit': {
        const fileTarget = args[0];
        if (fileTarget) {
          openApp('editor', { filePath: fileTarget, title: `CodePad - ${fileTarget}` });
          return { stdout: `[+] Launched editor for ${fileTarget}`, type: 'success' };
        }
        openApp('editor');
        return { stdout: '[+] Launched editor', type: 'success' };
      }

      case 'open': {
        const target = args[0];
        if (!target) return { stdout: 'Usage: open <file/app>', type: 'error' };
        const resolved = resolveVfsFolder(activeTab.currentPath);
        if (resolved?.folderId) {
          const children = getChildren(resolved.folderId);
          const match = children.find(c => c.name.toLowerCase() === target.toLowerCase());
          if (match) {
            openFile(match);
            return { stdout: `[+] Opened file ${match.name}`, type: 'success' };
          }
        }
        openApp(target);
        return { stdout: `[+] Opened application ${target}`, type: 'success' };
      }

      case 'apt':
      case 'pkg': {
        const sub = args[0];
        const pkgName = args[1];
        if (sub === 'update') {
          return { stdout: 'Hit:1 https://pkg.simpleos.org/stable Release\nReading package lists... Done\nBuilding dependency tree... Done\nAll packages are up to date.', type: 'output' };
        }
        if (sub === 'list') {
          const list = APP_STORE_CATALOG.map(a => `${a.id}/stable ${a.version || '1.0.0'} [${a.category}] - ${a.name}`).join('\n');
          return { stdout: list, type: 'output' };
        }
        if (sub === 'install' && pkgName) {
          const match = APP_STORE_CATALOG.find(a => a.id === pkgName || a.name.toLowerCase() === pkgName.toLowerCase());
          if (match) {
            installApp(match);
            return { stdout: `[+] Successfully installed: ${match.name}`, type: 'success' };
          }
          return { stdout: `E: Unable to locate package ${pkgName}`, type: 'error' };
        }
        return { stdout: 'Usage: apt <update | list | install <package>>', type: 'error' };
      }

      case 'passwd': {
        const newPass = prompt('Enter new lock screen password:');
        if (newPass !== null) {
          const res = setUserPassword(newPass);
          if (res.success) return { stdout: 'passwd: password updated successfully', type: 'success' };
          return { stdout: `passwd: ${res.error}`, type: 'error' };
        }
        return { stdout: 'passwd: authentication token unchanged', type: 'output' };
      }

      case 'lock':
        lockScreen();
        return { stdout: '[*] Screen locked.', type: 'output' };

      case 'matrix': {
        setIsMatrixRunning(true);
        const chars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
        let iterations = 0;
        matrixIntervalRef.current = setInterval(() => {
          iterations++;
          const colStr = Array.from({ length: 40 }, () => chars[Math.floor(Math.random() * chars.length)]).join(' ');
          setTabs(prev => prev.map(t => t.id === activeTab.id ? {
            ...t,
            lines: [...t.lines, { id: 'mat_' + Date.now() + Math.random(), type: 'success', content: colStr }].slice(-60)
          } : t));

          if (iterations > 15) {
            clearInterval(matrixIntervalRef.current);
            setIsMatrixRunning(false);
          }
        }, 120);
        return { stdout: '[*] Initializing Matrix rain stream...', type: 'success' };
      }

      case 'calc': {
        try {
          const expr = args.join(' ');
          const result = Function(`'use strict'; return (${expr})`)();
          return { stdout: `= ${result}`, type: 'success' };
        } catch {
          return { stdout: 'calc: invalid arithmetic expression', type: 'error' };
        }
      }

      case 'reboot':
        window.location.reload();
        return { stdout: '[*] Rebooting system...', type: 'output' };

      default:
        return { stdout: `bash: ${command}: command not found. Type 'help' for built-in Linux commands.`, type: 'error' };
    }
  };

  // Pipeline execution: handles `cmd1 | cmd2 > file`
  const executePipeline = async (fullCmdStr: string) => {
    const trimmed = fullCmdStr.trim();
    if (!trimmed) return;

    // Update history
    setTabs(prevTabs => prevTabs.map(t => {
      if (t.id !== activeTab.id) return t;
      return {
        ...t,
        history: [trimmed, ...t.history],
        historyIndex: -1,
      };
    }));

    const promptUser = settings.userProfile?.username || 'simple';
    const displayPath = activeTab.currentPath.replace('/home/simple', '~').replace('/home/aether', '~');
    const inputLineId = 'line_' + Date.now();

    // Check redirection `>` or `>>`
    let isAppend = false;
    let redirectTarget: string | null = null;
    let commandPart = trimmed;

    if (trimmed.includes('>>')) {
      isAppend = true;
      const rParts = trimmed.split('>>');
      commandPart = rParts[0].trim();
      redirectTarget = rParts[1].trim();
    } else if (trimmed.includes('>')) {
      const rParts = trimmed.split('>');
      commandPart = rParts[0].trim();
      redirectTarget = rParts[1].trim();
    }

    // Split pipeline by `|`
    const pipeCommands = commandPart.split('|').map(c => c.trim());

    // Append input line
    setTabs(prevTabs => prevTabs.map(t => {
      if (t.id !== activeTab.id) return t;
      return {
        ...t,
        lines: [
          ...t.lines,
          {
            id: inputLineId,
            type: 'input',
            content: `${promptUser}@simpleos-workstation:${displayPath}$ ${trimmed}`,
          },
        ],
      };
    }));

    let currentStdin = '';
    let lastResult: { stdout: string; type: 'output' | 'error' | 'success' | 'banner' } = { stdout: '', type: 'output' };

    for (let i = 0; i < pipeCommands.length; i++) {
      const cmd = pipeCommands[i];
      lastResult = await runSingleCommand(cmd, i === 0 ? undefined : currentStdin);
      if (lastResult.stdout === '__CLEAR__') {
        setTabs(prevTabs => prevTabs.map(t => t.id === activeTab.id ? { ...t, lines: [] } : t));
        return;
      }
      currentStdin = lastResult.stdout;
    }

    // Handle redirection write to file
    if (redirectTarget) {
      const resolved = resolveVfsFolder(activeTab.currentPath);
      if (resolved?.folderId) {
        const children = getChildren(resolved.folderId);
        const existing = children.find(c => c.name.toLowerCase() === redirectTarget?.toLowerCase());

        if (existing) {
          const newContent = isAppend ? `${existing.content || ''}\n${lastResult.stdout}` : lastResult.stdout;
          await createFile(existing.name, resolved.folderId, newContent);
        } else {
          await createFile(redirectTarget, resolved.folderId, lastResult.stdout);
        }

        setTabs(prevTabs => prevTabs.map(t => t.id === activeTab.id ? {
          ...t,
          lines: [
            ...t.lines,
            {
              id: 'redir_' + Date.now(),
              type: 'success',
              content: `[+] ${isAppend ? 'Appended to' : 'Wrote to'} ${redirectTarget}`,
            },
          ],
        } : t));
        return;
      }
    }

    // Append output line if stdout is non-empty
    if (lastResult.stdout) {
      setTabs(prevTabs => prevTabs.map(t => {
        if (t.id !== activeTab.id) return t;
        return {
          ...t,
          lines: [
            ...t.lines,
            {
              id: 'out_' + Date.now() + Math.random(),
              type: lastResult.type,
              content: lastResult.stdout,
            },
          ],
        };
      }));
    }
  };

  // Tab auto-completion
  const handleTabCompletion = () => {
    const tokens = inputValue.trim().split(' ');
    if (tokens.length === 1 && tokens[0]) {
      // Complete command names
      const prefix = tokens[0].toLowerCase();
      const match = CLI_COMMANDS_REGISTRY.find(c => c.command.startsWith(prefix));
      if (match) {
        setInputValue(match.command + ' ');
      }
    } else if (tokens.length > 1) {
      // Complete filenames in current directory
      const lastToken = tokens[tokens.length - 1];
      const items = getVfsItemsInPath(activeTab.currentPath);
      const match = items.find((i: any) => i.name.toLowerCase().startsWith(lastToken.toLowerCase()));
      if (match) {
        tokens[tokens.length - 1] = match.name + (match.type === 'folder' ? '/' : ' ');
        setInputValue(tokens.join(' '));
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      executePipeline(inputValue);
      setInputValue('');
    } else if (e.key === 'Tab') {
      e.preventDefault();
      handleTabCompletion();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (activeTab.history.length > 0 && activeTab.historyIndex < activeTab.history.length - 1) {
        const nextIdx = activeTab.historyIndex + 1;
        setTabs(prev => prev.map(t => t.id === activeTab.id ? { ...t, historyIndex: nextIdx } : t));
        setInputValue(activeTab.history[nextIdx]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (activeTab.historyIndex > 0) {
        const nextIdx = activeTab.historyIndex - 1;
        setTabs(prev => prev.map(t => t.id === activeTab.id ? { ...t, historyIndex: nextIdx } : t));
        setInputValue(activeTab.history[nextIdx]);
      } else if (activeTab.historyIndex === 0) {
        setTabs(prev => prev.map(t => t.id === activeTab.id ? { ...t, historyIndex: -1 } : t));
        setInputValue('');
      }
    } else if (e.ctrlKey && e.key === 'c') {
      e.preventDefault();
      if (isMatrixRunning && matrixIntervalRef.current) {
        clearInterval(matrixIntervalRef.current);
        setIsMatrixRunning(false);
      }
      setTabs(prev => prev.map(t => t.id === activeTab.id ? {
        ...t,
        lines: [...t.lines, { id: 'sig_' + Date.now(), type: 'input', content: `${inputValue}^C` }]
      } : t));
      setInputValue('');
    } else if (e.ctrlKey && e.key === 'l') {
      e.preventDefault();
      setTabs(prev => prev.map(t => t.id === activeTab.id ? { ...t, lines: [] } : t));
    } else if (e.ctrlKey && e.key === 'u') {
      e.preventDefault();
      setInputValue('');
    }
  };

  const createNewTab = () => {
    const newTabId = 'tab-' + (tabs.length + 1);
    const newTab: TerminalTab = {
      id: newTabId,
      title: `bash #${tabs.length + 1}`,
      currentPath: '/home/simple/Desktop',
      history: [],
      historyIndex: -1,
      lines: [
        {
          id: 'init_' + Date.now(),
          type: 'banner',
          content: `SimpleOS Linux Subsystem (Session ${newTabId})\nType 'help' for command list.\n`,
        },
      ],
    };
    setTabs([...tabs, newTab]);
    setActiveTabId(newTabId);
  };

  const closeTab = (tabId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (tabs.length === 1) return;
    const filtered = tabs.filter(t => t.id !== tabId);
    setTabs(filtered);
    if (activeTabId === tabId) {
      setActiveTabId(filtered[0].id);
    }
  };

  const displayPromptPath = activeTab.currentPath.replace('/home/simple', '~').replace('/home/aether', '~');
  const promptUser = settings.userProfile?.username || 'simple';

  return (
    <div
      onClick={() => inputRef.current?.focus()}
      className={`flex-1 flex flex-col h-full ${theme.bg} ${theme.text} font-mono select-text cursor-text overflow-hidden`}
      style={{ fontSize: `${fontSize}px` }}
    >
      {/* Top Terminal Tabs & Customizer Bar */}
      <div className={`flex items-center justify-between px-3 py-1.5 bg-black/40 border-b ${theme.border} text-xs select-none`}>
        {/* Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto max-w-[60%]">
          {tabs.map((tab) => {
            const isActive = tab.id === activeTabId;
            return (
              <div
                key={tab.id}
                onClick={() => setActiveTabId(tab.id)}
                className={`flex items-center gap-2 px-3 py-1 rounded-t-lg transition-all cursor-pointer border-t border-x ${
                  isActive
                    ? `bg-black/60 ${theme.border} text-white font-medium`
                    : 'bg-transparent border-transparent text-stone-500 hover:text-stone-300'
                }`}
              >
                <TermIcon className="w-3 h-3" />
                <span className="text-[11px] truncate max-w-[100px]">{tab.title}</span>
                {tabs.length > 1 && (
                  <button
                    onClick={(e) => closeTab(tab.id, e)}
                    className="text-stone-500 hover:text-rose-400 p-0.5 rounded"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                )}
              </div>
            );
          })}
          <button
            onClick={createNewTab}
            className="p-1 text-stone-500 hover:text-white rounded hover:bg-white/5 transition-colors"
            title="New Terminal Tab"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Toolbar: Themes, Font size & Clear */}
        <div className="flex items-center gap-2">
          {/* Theme dropdown */}
          <div className="flex items-center gap-1 text-[11px] text-stone-400">
            <Palette className="w-3 h-3 text-stone-500" />
            <select
              value={themeKey}
              onChange={(e) => setThemeKey(e.target.value as TerminalThemeKey)}
              className="bg-black/50 border border-white/10 rounded px-2 py-0.5 text-stone-300 text-[10px] outline-none cursor-pointer"
            >
              {Object.entries(TERMINAL_THEMES).map(([k, t]) => (
                <option key={k} value={k} className="bg-stone-900 text-stone-200">
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          {/* Font size zoom */}
          <div className="flex items-center gap-1 bg-black/40 border border-white/10 rounded px-1">
            <button
              onClick={() => setFontSize(Math.max(10, fontSize - 1))}
              className="px-1 text-[10px] text-stone-400 hover:text-white"
              title="Smaller font"
            >
              A-
            </button>
            <span className="text-[10px] text-stone-500">{fontSize}</span>
            <button
              onClick={() => setFontSize(Math.min(18, fontSize + 1))}
              className="px-1 text-[10px] text-stone-400 hover:text-white"
              title="Larger font"
            >
              A+
            </button>
          </div>

          <button
            onClick={() => setTabs(prev => prev.map(t => t.id === activeTab.id ? { ...t, lines: [] } : t))}
            className="p-1 text-stone-400 hover:text-white rounded hover:bg-white/5"
            title="Clear buffer (Ctrl+L)"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Terminal Buffer Scroll Area */}
      <div className="flex-1 flex flex-col p-4 overflow-y-auto font-mono leading-relaxed">
        <div className="flex-1 flex flex-col gap-1">
          {activeTab.lines.map((line) => (
            <div
              key={line.id}
              className={`whitespace-pre-wrap ${
                line.type === 'input'
                  ? 'font-medium'
                  : line.type === 'error'
                  ? theme.error
                  : line.type === 'success'
                  ? theme.success
                  : line.type === 'banner'
                  ? theme.banner
                  : theme.output
              }`}
            >
              {line.content}
            </div>
          ))}

          {/* Active Command Prompt Line */}
          <div className="flex items-center gap-2 mt-1">
            <div className="flex items-center gap-1 shrink-0">
              <span className={theme.promptUser}>{promptUser}@simpleos-workstation</span>
              <span className="text-stone-500">:</span>
              <span className={theme.promptPath}>{displayPromptPath}</span>
              <span className="text-emerald-400 font-bold">$</span>
            </div>
            <input
              ref={inputRef}
              type="text"
              autoFocus
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              className={`flex-1 bg-transparent border-none outline-none text-white font-mono select-text ${theme.cursor}`}
              spellCheck={false}
            />
          </div>
          <div ref={terminalEndRef} />
        </div>
      </div>

      {/* Status Bar */}
      <div className={`flex justify-between items-center px-4 py-1 bg-black/50 border-t ${theme.border} text-[10px] text-stone-500 select-none`}>
        <div className="flex items-center gap-3">
          <span>SHELL: /bin/bash</span>
          <span>BRANCH: main</span>
          <span>DIR: {activeTab.currentPath}</span>
        </div>
        <div className="flex items-center gap-3">
          <span>UTF-8</span>
          <span>x86_64-wasm</span>
          <span>Tab ⇥ Auto-complete</span>
        </div>
      </div>
    </div>
  );
};
