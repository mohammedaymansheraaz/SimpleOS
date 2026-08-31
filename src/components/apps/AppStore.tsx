import React, { useState } from 'react';
import { useOS } from '../../context/OSContext';
import { AppManifest, AppCategory } from '../../types/os';
import { APP_STORE_CATALOG } from '../../services/appsRegistry';
import { OSIcon } from '../common/OSIcon';
import {
  ShoppingBag,
  DownloadCloud,
  Check,
  PlusCircle,
  Search,
  ExternalLink,
  Trash2,
  Globe,
  Sparkles,
  LayoutGrid,
  Play,
  Layers,
} from 'lucide-react';

export const AppStore: React.FC = () => {
  const {
    installedApps,
    installApp,
    installCustomWebApp,
    uninstallApp,
    openApp,
    createFile,
  } = useOS();

  const [activeTab, setActiveTab] = useState<'store' | 'installed' | 'custom'>('store');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Custom App Form State
  const [customName, setCustomName] = useState('');
  const [customUrl, setCustomUrl] = useState('');
  const [customIcon, setCustomIcon] = useState('Globe');
  const [customCategory, setCustomCategory] = useState<AppCategory>('webapps');
  const [testPreviewUrl, setTestPreviewUrl] = useState('');

  const installedAppIds = new Set(installedApps.map(a => a.id));

  // Available icon choices for custom installer
  const availableIcons = [
    'Globe', 'Sparkles', 'Code', 'FileText', 'BookOpen', 'Layout', 'Gamepad2',
    'Tv', 'Radio', 'Music', 'Calculator', 'Activity', 'Layers', 'Compass',
    'Terminal', 'Camera', 'Palette', 'Cpu', 'Database', 'Shield'
  ];

  // Filter store catalog
  const filteredStoreApps = APP_STORE_CATALOG.filter(app => {
    const matchesCategory = selectedCategory === 'all' || app.category === selectedCategory;
    const matchesSearch = app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          app.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleInstallFromCatalog = async (app: AppManifest) => {
    installApp(app);
    // Also create shortcut file on Desktop
    await createFile(
      `${app.name}.app`,
      'desktop-dir',
      JSON.stringify({ appId: app.id, type: app.type, url: app.url }),
      'app'
    );
  };

  const handleInstallCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUrl.trim() || !customName.trim()) return;

    const manifest = installCustomWebApp(customUrl.trim(), customName.trim(), customIcon, customCategory);
    
    // Also add to desktop
    await createFile(
      `${manifest.name}.app`,
      'desktop-dir',
      JSON.stringify({ appId: manifest.id, type: manifest.type, url: manifest.url }),
      'app'
    );

    setCustomName('');
    setCustomUrl('');
    setTestPreviewUrl('');
    setActiveTab('installed');
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#090909] text-stone-200 select-none overflow-hidden font-sans">
      {/* Header Bar */}
      <div className="h-14 px-6 border-b border-white/5 flex items-center justify-between bg-[#0c0c0c] shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-stone-900 border border-white/15 shadow-md">
            <ShoppingBag className="w-5 h-5 text-stone-200" />
          </div>
          <div>
            <div className="font-serif italic font-bold text-sm text-stone-100 tracking-wide">SimpleOS App Registry</div>
            <div className="text-[10px] text-stone-500 font-mono">REPOSITORY_ONLINE</div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 bg-black/60 p-1 rounded-2xl border border-white/10">
          <button
            onClick={() => setActiveTab('store')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'store'
                ? 'bg-stone-200 text-black font-semibold shadow-sm'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            Catalog
          </button>
          <button
            onClick={() => setActiveTab('installed')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'installed'
                ? 'bg-stone-200 text-black font-semibold shadow-sm'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <span>Installed</span>
            <span className="px-1.5 py-0.5 rounded-full bg-black/20 text-[10px]">{installedApps.length}</span>
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'custom'
                ? 'bg-stone-200 text-black font-semibold shadow-sm'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Install URL / PWA</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* TAB 1: DISCOVER STORE */}
        {activeTab === 'store' && (
          <div className="flex flex-col gap-6 max-w-6xl mx-auto">
            {/* Hero Featured App Spotlight */}
            <div className="relative rounded-2xl p-6 bg-[#0c0c0c] border border-white/15 overflow-hidden shadow-2xl">
              <div className="max-w-xl relative z-10">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/10 text-stone-300 text-[10px] font-mono tracking-wider uppercase border border-white/10">
                  <Sparkles className="w-3 h-3" /> FEATURED APPLICATION
                </span>
                <h2 className="text-xl font-serif italic font-bold text-stone-100 mt-2">Excalidraw Diagramming Canvas</h2>
                <p className="text-xs text-stone-400 mt-1 leading-relaxed">
                  Sketch diagrams, architecture schematics, and collaborate freely with a responsive hand-drawn visual aesthetic.
                </p>
                <div className="mt-4 flex items-center gap-3">
                  {installedAppIds.has('app-excalidraw') ? (
                    <button
                      onClick={() => openApp('app-excalidraw')}
                      className="px-4 py-2 rounded-xl bg-stone-200 hover:bg-white text-xs font-bold text-black flex items-center gap-1.5 shadow-lg transition-colors"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" /> Launch App
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        const target = APP_STORE_CATALOG.find(a => a.id === 'app-excalidraw');
                        if (target) handleInstallFromCatalog(target);
                      }}
                      className="px-4 py-2 rounded-xl bg-stone-200 hover:bg-white text-xs font-bold text-black flex items-center gap-1.5 shadow-lg transition-colors"
                    >
                      <DownloadCloud className="w-4 h-4" /> Install Application
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Search & Categories */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              {/* Category pills */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {['all', 'productivity', 'games', 'webapps', 'development'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium capitalize transition-colors ${
                      selectedCategory === cat
                        ? 'bg-stone-200 text-black font-semibold'
                        : 'bg-stone-900 border border-white/10 text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Search */}
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-stone-500" />
                <input
                  type="text"
                  placeholder="Search catalog..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-9 pl-9 pr-3 rounded-xl bg-black/60 border border-white/10 text-xs text-stone-100 placeholder:text-stone-600 focus:outline-none focus:border-white/30"
                />
              </div>
            </div>

            {/* Catalog Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredStoreApps.map((app) => {
                const isInstalled = installedAppIds.has(app.id);
                return (
                  <div
                    key={app.id}
                    className="p-4 rounded-2xl bg-[#0c0c0c] border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between group shadow-lg"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div className="p-3 rounded-xl bg-stone-900 border border-white/10 group-hover:scale-105 transition-transform">
                          <OSIcon name={app.icon} className="w-6 h-6 text-stone-300" />
                        </div>
                        {app.badge && (
                          <span className="px-2 py-0.5 rounded-full bg-white/10 text-stone-300 text-[10px] font-mono border border-white/10">
                            {app.badge}
                          </span>
                        )}
                      </div>

                      <div className="mt-3 font-semibold text-sm text-stone-100">{app.name}</div>
                      <p className="text-xs text-stone-400 mt-1 leading-relaxed line-clamp-2">
                        {app.description}
                      </p>
                      {app.author && (
                        <div className="text-[10px] text-stone-600 mt-2 font-mono">BY {app.author.toUpperCase()}</div>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                      <span className="text-[10px] font-mono text-stone-500 uppercase tracking-widest">
                        {app.category}
                      </span>
                      {isInstalled ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openApp(app.id)}
                            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-stone-200 flex items-center gap-1 transition-colors"
                          >
                            <Play className="w-3 h-3 fill-current" /> Open
                          </button>
                          <span className="p-1.5 text-stone-400" title="Installed">
                            <Check className="w-4 h-4" />
                          </span>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleInstallFromCatalog(app)}
                          className="px-3 py-1.5 rounded-xl bg-stone-200 hover:bg-white text-xs font-bold text-black flex items-center gap-1.5 shadow transition-all"
                        >
                          <DownloadCloud className="w-3.5 h-3.5" /> Install
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: INSTALLED APPS */}
        {activeTab === 'installed' && (
          <div className="max-w-4xl mx-auto flex flex-col gap-4">
            <div className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">
              Installed Applications ({installedApps.length})
            </div>

            <div className="flex flex-col divide-y divide-white/5 rounded-2xl bg-[#0c0c0c] border border-white/10 overflow-hidden shadow-xl">
              {installedApps.map((app) => (
                <div
                  key={app.id}
                  className="p-4 flex items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="p-2.5 rounded-xl bg-stone-900 border border-white/10 shrink-0">
                      <OSIcon name={app.icon} className="w-5 h-5 text-stone-300" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-sm text-stone-100 truncate flex items-center gap-2">
                        <span>{app.name}</span>
                        {app.isSystem && (
                          <span className="px-2 py-0.5 rounded-md bg-stone-900 text-stone-500 text-[10px] font-mono border border-white/5">
                            SYSTEM
                          </span>
                        )}
                        {app.type === 'web-url' && (
                          <span className="px-2 py-0.5 rounded-md bg-white/10 text-stone-300 text-[10px] font-mono border border-white/10">
                            PWA / WEB
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-stone-500 truncate mt-0.5">
                        {app.description || app.url || 'Native OS Application'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => openApp(app.id)}
                      className="px-3.5 py-1.5 rounded-xl bg-stone-200 hover:bg-white text-xs font-bold text-black flex items-center gap-1.5 transition-colors"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" /> Launch
                    </button>
                    {!app.isSystem && (
                      <button
                        onClick={() => uninstallApp(app.id)}
                        className="p-2 rounded-xl hover:bg-rose-500/20 text-stone-500 hover:text-rose-400 transition-colors"
                        title="Uninstall App"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: INSTALL CUSTOM WEB APP WIZARD */}
        {activeTab === 'custom' && (
          <div className="max-w-2xl mx-auto">
            <div className="p-6 rounded-2xl bg-[#0c0c0c] border border-white/15 shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 rounded-xl bg-stone-900 text-stone-300 border border-white/15">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-serif italic font-bold text-stone-100">Install Any Web App / URL</h3>
                  <p className="text-xs text-stone-400">
                    Turn any web address into a standalone desktop application window in SimpleOS.
                  </p>
                </div>
              </div>

              <form onSubmit={handleInstallCustomSubmit} className="flex flex-col gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-400 mb-1.5">
                    Web URL (HTTPS)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      placeholder="e.g. https://excalidraw.com or wikipedia.org"
                      value={customUrl}
                      onChange={(e) => setCustomUrl(e.target.value)}
                      className="flex-1 px-3.5 py-2 rounded-xl bg-black/60 border border-white/15 text-xs text-stone-100 focus:outline-none focus:border-stone-400 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setTestPreviewUrl(customUrl)}
                      className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-medium text-stone-200 transition-colors"
                    >
                      Test Embed
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-400 mb-1.5">
                    App Display Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. My Workspace Tool"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-black/60 border border-white/15 text-xs text-stone-100 focus:outline-none focus:border-stone-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-400 mb-1.5">
                      Category
                    </label>
                    <select
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value as AppCategory)}
                      className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/15 text-xs text-stone-200 focus:outline-none focus:border-stone-400"
                    >
                      <option value="webapps">Web Apps</option>
                      <option value="productivity">Productivity</option>
                      <option value="utilities">Utilities</option>
                      <option value="games">Games</option>
                      <option value="development">Development</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-400 mb-1.5">
                      Selected Icon
                    </label>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/60 border border-white/15">
                      <OSIcon name={customIcon} className="w-5 h-5 text-stone-300" />
                      <span className="text-xs text-stone-400 font-mono">{customIcon}</span>
                    </div>
                  </div>
                </div>

                {/* Icon Picker Grid */}
                <div>
                  <label className="block text-xs font-semibold text-stone-400 mb-1.5">
                    Pick an Icon
                  </label>
                  <div className="grid grid-cols-10 gap-2 p-2 rounded-xl bg-black/60 border border-white/10">
                    {availableIcons.map((ic) => (
                      <button
                        key={ic}
                        type="button"
                        onClick={() => setCustomIcon(ic)}
                        className={`p-2 rounded-lg flex items-center justify-center transition-colors ${
                          customIcon === ic
                            ? 'bg-stone-200 text-black'
                            : 'hover:bg-white/10 text-stone-400 hover:text-stone-200'
                        }`}
                      >
                        <OSIcon name={ic} className="w-4 h-4" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Live Preview Box */}
                {testPreviewUrl && (
                  <div className="mt-2 p-3 rounded-xl bg-black/60 border border-white/10">
                    <div className="text-[11px] font-semibold text-stone-400 mb-2 flex items-center gap-1.5">
                      <ExternalLink className="w-3.5 h-3.5" />
                      Live Iframe Test:
                    </div>
                    <div className="w-full h-44 rounded-xl overflow-hidden border border-white/10 bg-white">
                      <iframe
                        src={testPreviewUrl.startsWith('http') ? testPreviewUrl : `https://${testPreviewUrl}`}
                        className="w-full h-full border-none"
                        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                        title="App Preview"
                      />
                    </div>
                  </div>
                )}

                <div className="mt-4 flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-stone-200 hover:bg-white text-xs font-bold text-black shadow-lg flex items-center gap-2 transition-all"
                  >
                    <DownloadCloud className="w-4 h-4" /> Install to SimpleOS
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
