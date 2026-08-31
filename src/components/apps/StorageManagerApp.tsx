import React, { useState } from 'react';
import { useOS } from '../../context/OSContext';
import { 
  HardDrive, 
  Trash2, 
  FileText, 
  Image as ImageIcon, 
  Code, 
  Music, 
  Database, 
  Sparkles, 
  RotateCcw, 
  CheckCircle2, 
  AlertCircle,
  Download,
  Upload
} from 'lucide-react';
import { sound } from '../../services/audio';

export const StorageManagerApp: React.FC = () => {
  const { nodes, emptyTrash, exportBackup, importBackup, resetSystem, addNotification } = useOS();
  const [isCleaning, setIsCleaning] = useState(false);
  const [cleanedResult, setCleanedResult] = useState<string | null>(null);

  // Compute node breakdown
  const files = nodes.filter(n => n.type !== 'folder');
  const totalNodes = nodes.length;

  let docsBytes = 0;
  let codeBytes = 0;
  let imageBytes = 0;
  let audioBytes = 0;
  let trashBytes = 0;
  let otherBytes = 0;

  files.forEach(f => {
    const size = f.size || (f.content ? f.content.length : 1024);
    if (f.parentId === 'trash') {
      trashBytes += size;
    } else if (f.type === 'image') {
      imageBytes += size;
    } else if (f.type === 'code') {
      codeBytes += size;
    } else if (f.type === 'audio') {
      audioBytes += size;
    } else if (f.type === 'text' || f.type === 'markdown') {
      docsBytes += size;
    } else {
      otherBytes += size;
    }
  });

  const totalBytesUsed = docsBytes + codeBytes + imageBytes + audioBytes + trashBytes + otherBytes + 32768; // Base system overhead
  const quotaBytes = 512 * 1024 * 1024; // 512MB virtual partition
  const usedMB = (totalBytesUsed / (1024 * 1024)).toFixed(2);
  const freeMB = ((quotaBytes - totalBytesUsed) / (1024 * 1024)).toFixed(2);
  const usedPercent = Math.min(100, Math.max(1, (totalBytesUsed / quotaBytes) * 100));

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const handleDeepClean = async () => {
    setIsCleaning(true);
    sound.playClick();
    await new Promise(r => setTimeout(r, 600));
    await emptyTrash();
    setIsCleaning(false);
    setCleanedResult('Cleaned temp cache, purged trash, and optimized IndexedDB partition indices.');
    addNotification({
      title: 'Storage Optimized',
      message: 'System cache cleaned and virtual volume defragmented.',
      type: 'success',
    });
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0a0a0c] text-stone-200 p-6 overflow-y-auto font-sans select-none">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-stone-800 border border-white/15 flex items-center justify-center shadow-lg">
            <HardDrive className="w-5 h-5 text-stone-200" />
          </div>
          <div>
            <h2 className="text-sm font-serif italic font-bold text-stone-100">Virtual Partition & Quota Manager</h2>
            <p className="text-xs text-stone-400 font-mono">/dev/indexeddb0 (Mount: /home/simple)</p>
          </div>
        </div>

        <button
          onClick={handleDeepClean}
          disabled={isCleaning}
          className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-white text-stone-950 text-xs font-semibold flex items-center gap-2 shadow-lg transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{isCleaning ? 'Optimizing...' : 'Run Storage Cleanup'}</span>
        </button>
      </div>

      {cleanedResult && (
        <div className="mt-4 p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/40 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{cleanedResult}</span>
        </div>
      )}

      {/* Main Quota Gauge */}
      <div className="mt-6 p-5 rounded-2xl bg-[#0e0e11] border border-white/10 flex flex-col gap-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-stone-200">Disk Quota Allocation</span>
          <span className="font-mono text-stone-400">{usedMB} MB used of 512 MB ({usedPercent.toFixed(1)}%)</span>
        </div>

        {/* Stacked Progress Bar */}
        <div className="w-full h-3 rounded-full bg-black/60 overflow-hidden flex border border-white/10">
          <div style={{ width: `${(docsBytes / totalBytesUsed) * usedPercent}%` }} className="bg-sky-400 h-full" title="Documents" />
          <div style={{ width: `${(codeBytes / totalBytesUsed) * usedPercent}%` }} className="bg-indigo-400 h-full" title="Source Code" />
          <div style={{ width: `${(imageBytes / totalBytesUsed) * usedPercent}%` }} className="bg-amber-400 h-full" title="Images" />
          <div style={{ width: `${(trashBytes / totalBytesUsed) * usedPercent}%` }} className="bg-rose-400 h-full" title="Trash" />
          <div style={{ width: `${(32768 / totalBytesUsed) * usedPercent}%` }} className="bg-stone-500 h-full" title="System" />
        </div>

        <div className="flex items-center justify-between text-[11px] text-stone-500 font-mono pt-1">
          <span>Filesystem: EXT4-WASM VFS</span>
          <span>Free Space: {freeMB} MB Available</span>
        </div>
      </div>

      {/* Category Breakdown Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
        <div className="p-3.5 rounded-xl bg-[#0e0e11] border border-white/10 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] text-stone-400">Documents</div>
            <div className="text-xs font-mono font-bold text-stone-100">{formatSize(docsBytes)}</div>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-[#0e0e11] border border-white/10 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
            <Code className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] text-stone-400">Source Code</div>
            <div className="text-xs font-mono font-bold text-stone-100">{formatSize(codeBytes)}</div>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-[#0e0e11] border border-white/10 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
            <ImageIcon className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] text-stone-400">Images & Media</div>
            <div className="text-xs font-mono font-bold text-stone-100">{formatSize(imageBytes)}</div>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-[#0e0e11] border border-white/10 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400">
            <Trash2 className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] text-stone-400">Trash Bin</div>
            <div className="text-xs font-mono font-bold text-stone-100">{formatSize(trashBytes)}</div>
          </div>
        </div>
      </div>

      {/* Storage Utilities */}
      <div className="mt-6 flex flex-col gap-3">
        <h3 className="text-xs font-semibold text-stone-200">Partition Maintenance</h3>

        <div className="p-4 rounded-xl bg-[#0e0e11] border border-white/10 flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-stone-200">Empty Trash Bin</div>
            <div className="text-[11px] text-stone-500">Permanently remove deleted files and reclaim storage space</div>
          </div>
          <button
            onClick={() => {
              emptyTrash();
              sound.playSuccessChime();
            }}
            className="px-3.5 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white text-xs font-semibold transition-colors"
          >
            Empty Now
          </button>
        </div>

        <div className="p-4 rounded-xl bg-[#0e0e11] border border-white/10 flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-stone-200">Export Virtual Filesystem Snapshot</div>
            <div className="text-[11px] text-stone-500">Download complete JSON image of your files, settings, and apps</div>
          </div>
          <button
            onClick={() => {
              const json = exportBackup();
              const blob = new Blob([json], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `SimpleOS_VFS_${Date.now()}.json`;
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-stone-200 text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Snapshot</span>
          </button>
        </div>
      </div>
    </div>
  );
};
