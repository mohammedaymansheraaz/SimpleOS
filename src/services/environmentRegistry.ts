export interface EnvVarItem {
  key: string;
  value: string;
  description?: string;
  isReadonly?: boolean;
}

export interface CliCommandMeta {
  command: string;
  category: 'core' | 'file' | 'system' | 'network' | 'utility' | 'package';
  syntax: string;
  description: string;
  example: string;
  path: string;
}

export const DEFAULT_ENV_VARS: Record<string, string> = {
  USER: 'simple',
  LOGNAME: 'simple',
  HOME: '/home/simple',
  SHELL: '/bin/bash',
  PATH: '/bin:/usr/bin:/usr/local/bin:/home/simple/.local/bin',
  TERM: 'xterm-256color',
  EDITOR: 'nano',
  LANG: 'en_US.UTF-8',
  LC_ALL: 'en_US.UTF-8',
  PAGER: 'less',
  HOSTNAME: 'simpleos-workstation',
  OSTYPE: 'linux-gnu',
  MACHTYPE: 'x86_64-pc-linux-gnu',
  XDG_CURRENT_DESKTOP: 'SimpleOS:Minimal',
  XDG_CONFIG_HOME: '/home/simple/.config',
  XDG_DATA_HOME: '/home/simple/.local/share',
  PS1: '\\[\\033[01;32m\\]\\u@\\h\\[\\033[00m\\]:\\[\\033[01;34m\\]\\w\\[\\033[00m\\]\\$ ',
  SIMPLEOS_VERSION: '2.4.0',
  SIMPLEOS_ARCH: 'x86_64-wasm',
};

export const CLI_COMMANDS_REGISTRY: CliCommandMeta[] = [
  { command: 'ls', category: 'file', syntax: 'ls [-l] [-a] [-la] [-lh] [dir]', description: 'List directory contents with detailed permissions and coloring', example: 'ls -la /home/simple/Documents', path: '/bin/ls' },
  { command: 'cd', category: 'file', syntax: 'cd [dir]', description: 'Change the current working directory', example: 'cd ~/Desktop', path: '/bin/cd' },
  { command: 'pwd', category: 'file', syntax: 'pwd', description: 'Print the current absolute working directory', example: 'pwd', path: '/bin/pwd' },
  { command: 'cat', category: 'file', syntax: 'cat [-n] <file ...>', description: 'Concatenate and display file content with optional line numbering', example: 'cat -n Welcome.md', path: '/bin/cat' },
  { command: 'touch', category: 'file', syntax: 'touch <file ...>', description: 'Create new empty file(s) or update file modification time', example: 'touch notes.txt script.sh', path: '/bin/touch' },
  { command: 'mkdir', category: 'file', syntax: 'mkdir [-p] <directory ...>', description: 'Create new directory or nested directory hierarchies', example: 'mkdir -p src/components/ui', path: '/bin/mkdir' },
  { command: 'rm', category: 'file', syntax: 'rm [-r] [-rf] [-f] <target ...>', description: 'Remove files or recursively delete directories', example: 'rm -rf old_build/', path: '/bin/rm' },
  { command: 'cp', category: 'file', syntax: 'cp [-r] <source> <destination>', description: 'Copy files or directories recursively', example: 'cp -r docs/ backup_docs/', path: '/bin/cp' },
  { command: 'mv', category: 'file', syntax: 'mv <source> <destination>', description: 'Move or rename files and folders', example: 'mv draft.md published.md', path: '/bin/mv' },
  { command: 'grep', category: 'utility', syntax: 'grep [-i] [-n] [-v] <pattern> [file]', description: 'Search for text patterns in files or standard input stream', example: 'cat config.txt | grep -i port', path: '/bin/grep' },
  { command: 'find', category: 'utility', syntax: 'find [path] [-name pattern]', description: 'Search for files in directory hierarchy matching query pattern', example: 'find . -name "*.js"', path: '/bin/find' },
  { command: 'head', category: 'file', syntax: 'head [-n count] <file>', description: 'Output the first lines of a file or stream', example: 'head -n 5 /etc/os-release', path: '/bin/head' },
  { command: 'tail', category: 'file', syntax: 'tail [-n count] <file>', description: 'Output the trailing lines of a file or stream', example: 'tail -n 10 /var/log/syslog', path: '/bin/tail' },
  { command: 'wc', category: 'utility', syntax: 'wc [-l] [-w] [-c] <file>', description: 'Print newline, word, and byte counts for files', example: 'wc -l doc.txt', path: '/bin/wc' },
  { command: 'echo', category: 'core', syntax: 'echo [-e] [-n] [args ...]', description: 'Display a line of text, expand $ENV vars, or redirect with > and >>', example: 'echo "DEBUG=1" >> ~/.bashrc', path: '/bin/echo' },
  { command: 'tree', category: 'file', syntax: 'tree [dir]', description: 'Display a tree-view hierarchy of directories and files', example: 'tree /home/simple', path: '/usr/bin/tree' },
  { command: 'neofetch', category: 'system', syntax: 'neofetch', description: 'Showcase system architecture, OS info, kernel and ASCII logo', example: 'neofetch', path: '/usr/bin/neofetch' },
  { command: 'uname', category: 'system', syntax: 'uname [-a] [-r] [-m] [-s]', description: 'Print operating system name and kernel architecture', example: 'uname -a', path: '/bin/uname' },
  { command: 'whoami', category: 'system', syntax: 'whoami', description: 'Print the current logged-in username', example: 'whoami', path: '/usr/bin/whoami' },
  { command: 'hostname', category: 'system', syntax: 'hostname', description: 'Show the system network hostname', example: 'hostname', path: '/bin/hostname' },
  { command: 'id', category: 'system', syntax: 'id', description: 'Print user and group IDs and memberships', example: 'id', path: '/usr/bin/id' },
  { command: 'df', category: 'system', syntax: 'df [-h]', description: 'Report file system virtual disk space usage', example: 'df -h', path: '/bin/df' },
  { command: 'free', category: 'system', syntax: 'free [-m] [-h]', description: 'Display amount of free and used virtual memory in system', example: 'free -m', path: '/usr/bin/free' },
  { command: 'ps', category: 'system', syntax: 'ps [aux] [-ef]', description: 'Report snapshot of active window tasks and system processes', example: 'ps aux', path: '/bin/ps' },
  { command: 'kill', category: 'system', syntax: 'kill <pid>', description: 'Terminate active window or process by PID', example: 'kill 1042', path: '/bin/kill' },
  { command: 'uptime', category: 'system', syntax: 'uptime', description: 'Display how long the system has been running', example: 'uptime', path: '/usr/bin/uptime' },
  { command: 'date', category: 'system', syntax: 'date', description: 'Display or format the current system date and time', example: 'date', path: '/bin/date' },
  { command: 'history', category: 'core', syntax: 'history [-c]', description: 'Display command execution history with indices', example: 'history', path: '/bin/history' },
  { command: 'clear', category: 'core', syntax: 'clear', description: 'Clear the terminal screen buffer', example: 'clear', path: '/usr/bin/clear' },
  { command: 'export', category: 'core', syntax: 'export VAR=value', description: 'Set and export environment variables', example: 'export THEME="dark"', path: '/bin/export' },
  { command: 'env', category: 'system', syntax: 'env', description: 'Print all active exported environment variables', example: 'env', path: '/usr/bin/env' },
  { command: 'printenv', category: 'system', syntax: 'printenv [VAR]', description: 'Print specific or all environment variables', example: 'printenv PATH', path: '/usr/bin/printenv' },
  { command: 'alias', category: 'core', syntax: 'alias [name=command]', description: 'Define or display command shortcuts and aliases', example: 'alias ll="ls -la"', path: '/bin/alias' },
  { command: 'chmod', category: 'file', syntax: 'chmod <permissions> <file>', description: 'Change virtual file access permissions (simulated)', example: 'chmod +x matrix.js', path: '/bin/chmod' },
  { command: 'which', category: 'utility', syntax: 'which <command>', description: 'Locate the executable path for a command', example: 'which grep', path: '/usr/bin/which' },
  { command: 'curl', category: 'network', syntax: 'curl <url>', description: 'Fetch URL payload or test HTTP endpoints', example: 'curl https://api.github.com', path: '/usr/bin/curl' },
  { command: 'wget', category: 'network', syntax: 'wget <url>', description: 'Download file payload into current directory', example: 'wget https://example.com/data.json', path: '/usr/bin/wget' },
  { command: 'ping', category: 'network', syntax: 'ping [-c count] <host>', description: 'Send simulated ICMP ECHO_REQUEST packets to network hosts', example: 'ping google.com', path: '/bin/ping' },
  { command: 'man', category: 'utility', syntax: 'man <command>', description: 'Display system reference manual for a command', example: 'man ls', path: '/usr/bin/man' },
  { command: 'help', category: 'utility', syntax: 'help [command]', description: 'Display quick summaries of available built-in commands', example: 'help', path: '/bin/help' },
  { command: 'nano', category: 'utility', syntax: 'nano <file>', description: 'Simple terminal text editor or opens CodePad editor', example: 'nano script.js', path: '/usr/bin/nano' },
  { command: 'vim', category: 'utility', syntax: 'vim <file>', description: 'Visual editor interface for files', example: 'vim config.txt', path: '/usr/bin/vim' },
  { command: 'open', category: 'core', syntax: 'open <file/app>', description: 'Launch GUI application or open file in viewer', example: 'open files', path: '/usr/bin/open' },
  { command: 'apt', category: 'package', syntax: 'apt <update|list|install|remove> [pkg]', description: 'Advanced package tool for managing installable applications', example: 'apt install app-snake', path: '/usr/bin/apt' },
  { command: 'pkg', category: 'package', syntax: 'pkg <install|search> <name>', description: 'Package installer for web applications and utilities', example: 'pkg search puzzle', path: '/usr/bin/pkg' },
  { command: 'passwd', category: 'system', syntax: 'passwd', description: 'Change the user lock screen password interactively', example: 'passwd', path: '/usr/bin/passwd' },
  { command: 'lock', category: 'system', syntax: 'lock', description: 'Lock the workstation screen immediately', example: 'lock', path: '/usr/bin/lock' },
  { command: 'matrix', category: 'utility', syntax: 'matrix', description: 'Stream animated falling Matrix digital rain in terminal', example: 'matrix', path: '/usr/bin/matrix' },
  { command: 'calc', category: 'utility', syntax: 'calc <expression>', description: 'Evaluate mathematical arithmetic expression', example: 'calc (144 * 2) / 12', path: '/usr/bin/calc' },
  { command: 'reboot', category: 'system', syntax: 'reboot', description: 'Reboot the SimpleOS session', example: 'reboot', path: '/sbin/reboot' },
];

export const DEFAULT_REGISTRY: Record<string, any> = {
  'system.os.name': 'SimpleOS',
  'system.os.version': '2.4.0',
  'system.os.architecture': 'x86_64-wasm',
  'system.desktop.theme': 'dark',
  'system.desktop.accent': '#6366f1',
  'system.desktop.grid_snap': true,
  'system.desktop.icon_size': 'medium',
  'system.window.snap_assist': true,
  'system.window.animations': true,
  'system.window.focus_follows_mouse': false,
  'system.audio.effects_enabled': true,
  'system.audio.master_volume': 80,
  'system.terminal.font_size': 13,
  'system.terminal.theme': 'stone',
  'system.terminal.default_shell': '/bin/bash',
  'system.terminal.cursor_blink': true,
  'system.security.auto_lock_minutes': 0,
  'system.security.require_password': false,
  'system.network.hostname': 'simpleos-workstation',
  'system.network.wifi_ssid': 'SIMPLEOS_WIFI_5G',
};

const ENV_STORAGE_KEY = 'simpleos_env_vars';
const REG_STORAGE_KEY = 'simpleos_sys_registry';

class EnvironmentRegistryService {
  private envVars: Map<string, string> = new Map();
  private registry: Map<string, any> = new Map();
  private aliases: Map<string, string> = new Map();

  constructor() {
    this.init();
  }

  private init() {
    // Load Env Vars
    try {
      const raw = localStorage.getItem(ENV_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        Object.entries(parsed).forEach(([k, v]) => this.envVars.set(k, String(v)));
      } else {
        Object.entries(DEFAULT_ENV_VARS).forEach(([k, v]) => this.envVars.set(k, v));
      }
    } catch {
      Object.entries(DEFAULT_ENV_VARS).forEach(([k, v]) => this.envVars.set(k, v));
    }

    // Load Registry
    try {
      const rawReg = localStorage.getItem(REG_STORAGE_KEY);
      if (rawReg) {
        const parsedReg = JSON.parse(rawReg);
        Object.entries(parsedReg).forEach(([k, v]) => this.registry.set(k, v));
      } else {
        Object.entries(DEFAULT_REGISTRY).forEach(([k, v]) => this.registry.set(k, v));
      }
    } catch {
      Object.entries(DEFAULT_REGISTRY).forEach(([k, v]) => this.registry.set(k, v));
    }

    // Default aliases
    this.aliases.set('ll', 'ls -la');
    this.aliases.set('la', 'ls -a');
    this.aliases.set('l', 'ls -lh');
    this.aliases.set('cls', 'clear');
    this.aliases.set('c', 'clear');
    this.aliases.set('md', 'mkdir');
    this.aliases.set('..', 'cd ..');
    this.aliases.set('...', 'cd ../..');
  }

  public getEnv(key: string): string | undefined {
    return this.envVars.get(key);
  }

  public getAllEnv(): Record<string, string> {
    const res: Record<string, string> = {};
    this.envVars.forEach((v, k) => { res[k] = v; });
    return res;
  }

  public setEnv(key: string, value: string): void {
    this.envVars.set(key, value);
    this.saveEnv();
  }

  public deleteEnv(key: string): boolean {
    const deleted = this.envVars.delete(key);
    this.saveEnv();
    return deleted;
  }

  public resetEnv(): void {
    this.envVars.clear();
    Object.entries(DEFAULT_ENV_VARS).forEach(([k, v]) => this.envVars.set(k, v));
    this.saveEnv();
  }

  private saveEnv() {
    try {
      const obj = this.getAllEnv();
      localStorage.setItem(ENV_STORAGE_KEY, JSON.stringify(obj));
    } catch {}
  }

  // Registry methods
  public getRegistryValue(key: string): any {
    return this.registry.get(key) ?? DEFAULT_REGISTRY[key];
  }

  public getAllRegistry(): Record<string, any> {
    const res: Record<string, any> = {};
    this.registry.forEach((v, k) => { res[k] = v; });
    return res;
  }

  public setRegistryValue(key: string, value: any): void {
    this.registry.set(key, value);
    this.saveRegistry();
  }

  public resetRegistry(): void {
    this.registry.clear();
    Object.entries(DEFAULT_REGISTRY).forEach(([k, v]) => this.registry.set(k, v));
    this.saveRegistry();
  }

  private saveRegistry() {
    try {
      const obj = this.getAllRegistry();
      localStorage.setItem(REG_STORAGE_KEY, JSON.stringify(obj));
    } catch {}
  }

  // Aliases
  public getAlias(name: string): string | undefined {
    return this.aliases.get(name);
  }

  public getAllAliases(): Record<string, string> {
    const res: Record<string, string> = {};
    this.aliases.forEach((v, k) => { res[k] = v; });
    return res;
  }

  public setAlias(name: string, command: string): void {
    this.aliases.set(name, command);
  }

  public deleteAlias(name: string): boolean {
    return this.aliases.delete(name);
  }
}

export const environmentRegistry = new EnvironmentRegistryService();
