import React, { useState, useEffect } from 'react';
import { useOS } from '../../context/OSContext';
import { OSIcon } from '../common/OSIcon';
import { Activity, Cpu, HardDrive, Zap, Trash2, XCircle, RefreshCw } from 'lucide-react';

export const TaskManager: React.FC = () => {
  const { windows, closeWindow, nodes, installedApps } = useOS();

  const [cpuUsage, setCpuUsage] = useState<number>(14);
  const [ramUsage, setRamUsage] = useState<number>(38);
  const [cpuHistory, setCpuHistory] = useState<number[]>([12, 15, 18, 14, 16, 22, 19, 14]);

  // Simulate dynamic CPU variations
  useEffect(() => {
    const interval = setInterval(() => {
      const activeFactor = Math.min(windows.length * 4, 30);
      const nextCpu = Math.floor(Math.random() * 12) + 8 + activeFactor;
      const nextRam = Math.min(85, 30 + windows.length * 6);

      setCpuUsage(nextCpu);
      setRamUsage(nextRam);
      setCpuHistory(prev => [...prev.slice(-15), nextCpu]);
    }, 1500);

    return () => clearInterval(interval);
  }, [windows.length]);

  const totalFiles = nodes.filter(n => n.type !== 'folder').length;
  const totalFolders = nodes.filter(n => n.type === 'folder').length;
  const totalStorageBytes = nodes.reduce((acc, n) => acc + (n.size || (n.content ? n.content.length : 0)), 0);

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 text-slate-100 select-none overflow-hidden font-sans">
      {/* Top Performance Metrics Banner */}
      <div className="grid grid-cols-3 gap-3 p-4 bg-slate-900/60 border-b border-white/10 shrink-0">
        {/* CPU Box */}
        <div className="p-3 rounded-xl bg-slate-950 border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5 font-semibold text-indigo-400">
              <Cpu className="w-4 h-4" /> CPU Load
            </span>
            <span className="font-mono text-white font-bold">{cpuUsage}%</span>
          </div>
          {/* Mini chart bar */}
          <div className="h-10 flex items-end gap-1 mt-2">
            {cpuHistory.map((val, idx) => (
              <div
                key={idx}
                className="flex-1 bg-indigo-500 rounded-t transition-all"
                style={{ height: `${Math.max(10, val * 1.5)}%` }}
              />
            ))}
          </div>
        </div>

        {/* RAM Box */}
        <div className="p-3 rounded-xl bg-slate-950 border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5 font-semibold text-emerald-400">
              <Zap className="w-4 h-4" /> Memory
            </span>
            <span className="font-mono text-white font-bold">{ramUsage}%</span>
          </div>
          <div className="mt-2">
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full rounded-full transition-all" style={{ width: `${ramUsage}%` }} />
            </div>
            <div className="text-[10px] text-slate-400 mt-1 flex justify-between font-mono">
              <span>{Math.round((ramUsage / 100) * 1024)} MB</span>
              <span>1024 MB</span>
            </div>
          </div>
        </div>

        {/* Storage Box */}
        <div className="p-3 rounded-xl bg-slate-950 border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5 font-semibold text-purple-400">
              <HardDrive className="w-4 h-4" /> VFS Storage
            </span>
            <span className="font-mono text-white font-bold">{totalFiles} Files</span>
          </div>
          <div className="mt-2">
            <div className="text-xs text-slate-300 font-medium">
              {(totalStorageBytes / 1024).toFixed(1)} KB persistent disk
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              {totalFolders} directories • {installedApps.length} apps installed
            </div>
          </div>
        </div>
      </div>

      {/* Active Tasks & Windows List */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
          <span>Active Processes ({windows.length})</span>
          <span className="text-[10px] text-slate-400 normal-case">Right-click or click End Task to terminate</span>
        </div>

        {windows.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs italic">
            No running window processes.
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-white/10 rounded-xl bg-slate-900/60 border border-white/10 overflow-hidden">
            <div className="grid grid-cols-12 py-2 px-3 text-[11px] font-semibold text-slate-400 bg-slate-900/90 uppercase tracking-wider">
              <span className="col-span-5">Application / Process</span>
              <span className="col-span-3">PID / State</span>
              <span className="col-span-2">Memory</span>
              <span className="col-span-2 text-right">Action</span>
            </div>

            {windows.map((w) => (
              <div key={w.id} className="grid grid-cols-12 items-center py-2.5 px-3 text-xs hover:bg-white/5 transition-colors">
                <div className="col-span-5 flex items-center gap-2.5 truncate">
                  <OSIcon name={w.icon} className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span className="truncate font-medium text-white">{w.title}</span>
                </div>

                <div className="col-span-3 text-slate-400 text-[11px] font-mono flex items-center gap-2">
                  <span>{w.id.slice(-6)}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] ${w.isMinimized ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'}`}>
                    {w.isMinimized ? 'Suspended' : 'Running'}
                  </span>
                </div>

                <div className="col-span-2 text-slate-300 font-mono text-[11px]">
                  ~{Math.floor(Math.random() * 8) + 16} MB
                </div>

                <div className="col-span-2 text-right">
                  <button
                    onClick={() => closeWindow(w.id)}
                    className="px-2 py-1 rounded-md bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white text-[11px] font-medium transition-colors"
                  >
                    End Task
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
