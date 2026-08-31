import React, { useState } from 'react';
import { useOS } from '../../context/OSContext';
import { 
  Cpu, 
  Terminal, 
  Key, 
  Plus, 
  Trash2, 
  Search, 
  Code, 
  Check, 
  Sparkles,
  BookOpen,
  Layers,
  Settings
} from 'lucide-react';
import { CLI_COMMANDS_REGISTRY } from '../../services/environmentRegistry';

export const SystemRegistryApp: React.FC = () => {
  const { envVars, setEnvVar, deleteEnvVar, registry, setRegistryKey, openApp } = useOS();
  const [activeTab, setActiveTab] = useState<'env' | 'registry' | 'binaries'>('env');
  const [searchQuery, setSearchQuery] = useState('');

  // New Env var form
  const [newKey, setNewKey] = useState('');
  const [newVal, setNewVal] = useState('');

  // Registry editing state
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  const filteredEnv = Object.entries(envVars).filter(([k, v]) => 
    k.toLowerCase().includes(searchQuery.toLowerCase()) || String(v).toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredRegistry = Object.entries(registry).filter(([k, v]) => 
    k.toLowerCase().includes(searchQuery.toLowerCase()) || String(v).toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredBinaries = CLI_COMMANDS_REGISTRY.filter(b => 
    b.command.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0a0a0c] text-stone-200 font-sans select-none overflow-hidden">
      {/* Top Header & Navigation Tabs */}
      <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-[#0e0e11]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-stone-800 border border-white/15 flex items-center justify-center shadow-lg">
            <Cpu className="w-5 h-5 text-stone-200" />
          </div>
          <div>
            <h2 className="text-sm font-serif italic font-bold text-stone-100">Environment & System Registry</h2>
            <p className="text-xs text-stone-400 font-mono">Unix Shell Environment, Registry Keys & CLI Binaries</p>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/10 text-xs">
          <button
            onClick={() => setActiveTab('env')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === 'env' ? 'bg-stone-200 text-stone-950 font-semibold shadow' : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            Unix Environment ($ENV)
          </button>
          <button
            onClick={() => setActiveTab('registry')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === 'registry' ? 'bg-stone-200 text-stone-950 font-semibold shadow' : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            System Registry
          </button>
          <button
            onClick={() => setActiveTab('binaries')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === 'binaries' ? 'bg-stone-200 text-stone-950 font-semibold shadow' : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            CLI Binaries ({CLI_COMMANDS_REGISTRY.length})
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="px-6 py-3 border-b border-white/5 bg-black/20 flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={`Search ${activeTab === 'env' ? 'environment variables...' : activeTab === 'registry' ? 'registry keys...' : 'Linux command binaries...'}`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-black/50 border border-white/10 text-xs text-stone-100 placeholder-stone-600 outline-none focus:border-stone-400"
          />
        </div>

        {activeTab === 'env' && (
          <button
            onClick={() => openApp('terminal')}
            className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-stone-200 text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Open in Terminal</span>
          </button>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-6 overflow-y-auto">
        {/* TAB 1: UNIX ENVIRONMENT VARIABLES */}
        {activeTab === 'env' && (
          <div className="flex flex-col gap-5 max-w-4xl">
            {/* Add New Variable Box */}
            <div className="p-4 rounded-2xl bg-[#0e0e11] border border-white/10 flex flex-col gap-3">
              <h4 className="text-xs font-semibold text-stone-200 flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-400" />
                <span>Export New Unix Environment Variable</span>
              </h4>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="VARIABLE_NAME (e.g. NODE_ENV)"
                  value={newKey}
                  onChange={(e) => setNewKey(e.target.value.toUpperCase().replace(/\s+/g, '_'))}
                  className="w-1/3 px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-xs font-mono text-stone-100 outline-none focus:border-stone-400"
                />
                <input
                  type="text"
                  placeholder="Value (e.g. production)"
                  value={newVal}
                  onChange={(e) => setNewVal(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-xs font-mono text-stone-100 outline-none focus:border-stone-400"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (newKey.trim()) {
                      setEnvVar(newKey.trim(), newVal);
                      setNewKey('');
                      setNewVal('');
                    }
                  }}
                  className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-white text-stone-950 text-xs font-semibold shadow transition-colors"
                >
                  Export $VAR
                </button>
              </div>
            </div>

            {/* Table of Env Vars */}
            <div className="rounded-2xl bg-[#0e0e11] border border-white/10 overflow-hidden">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-black/50 border-b border-white/10 text-[11px] text-stone-400 uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Variable Name</th>
                    <th className="py-3 px-4">Value</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredEnv.map(([k, v]) => (
                    <tr key={k} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="py-3 px-4 font-bold text-emerald-400 flex items-center gap-2">
                        <span className="text-stone-600 font-normal">$</span>
                        {k}
                      </td>
                      <td className="py-3 px-4 text-stone-300 break-all select-text font-normal">
                        {v}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => deleteEnvVar(k)}
                          className="text-stone-500 hover:text-rose-400 p-1 rounded hover:bg-white/5 transition-colors"
                          title={`Unset $${k}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: SYSTEM REGISTRY */}
        {activeTab === 'registry' && (
          <div className="flex flex-col gap-4 max-w-4xl">
            <div className="p-4 rounded-2xl bg-[#0e0e11] border border-white/10">
              <h4 className="text-xs font-semibold text-stone-200 mb-1">System Configuration Registry Keys</h4>
              <p className="text-xs text-stone-400">
                Hierarchical key-value tree controlling window behavior, audio preferences, and compositor parameters.
              </p>
            </div>

            <div className="rounded-2xl bg-[#0e0e11] border border-white/10 overflow-hidden font-mono text-xs">
              <div className="divide-y divide-white/5">
                {filteredRegistry.map(([k, v]) => {
                  const isEditing = editingKey === k;
                  return (
                    <div key={k} className="p-3.5 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-semibold text-sky-400">{k}</span>
                        <span className="text-[11px] text-stone-500 font-sans">
                          Type: {typeof v}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        {isEditing ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              className="px-2 py-1 bg-black/80 border border-white/20 rounded text-stone-100 outline-none text-xs"
                              autoFocus
                            />
                            <button
                              onClick={() => {
                                let parsed: any = editValue;
                                if (editValue === 'true') parsed = true;
                                else if (editValue === 'false') parsed = false;
                                else if (!isNaN(Number(editValue))) parsed = Number(editValue);

                                setRegistryKey(k, parsed);
                                setEditingKey(null);
                              }}
                              className="p-1 text-emerald-400 hover:text-emerald-300"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-3">
                            <span className="text-stone-300 bg-black/40 px-2.5 py-1 rounded border border-white/5">
                              {String(v)}
                            </span>
                            <button
                              onClick={() => {
                                setEditingKey(k);
                                setEditValue(String(v));
                              }}
                              className="text-stone-500 hover:text-stone-300 text-[11px] font-sans underline"
                            >
                              Edit
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: CLI BINARIES REGISTRY */}
        {activeTab === 'binaries' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-5xl">
            {filteredBinaries.map((b) => (
              <div key={b.command} className="p-4 rounded-2xl bg-[#0e0e11] border border-white/10 flex flex-col justify-between gap-3 hover:border-white/20 transition-all">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-emerald-400 text-sm">{b.command}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-stone-400 uppercase tracking-wider font-mono">
                        {b.category}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-stone-500">{b.path}</span>
                  </div>

                  <p className="text-xs text-stone-300 font-sans leading-relaxed">
                    {b.description}
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-black/60 border border-white/5 font-mono text-[11px] text-stone-400 flex flex-col gap-1">
                  <div className="text-[10px] text-stone-500 uppercase tracking-widest font-sans">Syntax & Example:</div>
                  <div className="text-stone-300">{b.syntax}</div>
                  <div className="text-emerald-400/80">$ {b.example}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
