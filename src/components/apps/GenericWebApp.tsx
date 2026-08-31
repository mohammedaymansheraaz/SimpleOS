import React, { useState } from 'react';
import { AppManifest } from '../../types/os';
import { Globe, RotateCw, ExternalLink, ShieldCheck, AlertCircle } from 'lucide-react';

interface GenericWebAppProps {
  manifest: AppManifest;
  urlOverride?: string;
}

export const GenericWebApp: React.FC<GenericWebAppProps> = ({ manifest, urlOverride }) => {
  const targetUrl = urlOverride || manifest.url || 'https://en.m.wikipedia.org';
  const [iframeKey, setIframeKey] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const handleRefresh = () => {
    setIsLoading(true);
    setIframeKey(k => k + 1);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 text-slate-100 select-none overflow-hidden font-sans">
      {/* Top Embedded App Bar */}
      <div className="h-9 px-3 bg-slate-900/90 border-b border-white/10 flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <Globe className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
          <span className="text-xs text-slate-300 font-mono truncate">{targetUrl}</span>
          <span className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] bg-emerald-500/20 text-emerald-300 font-mono">
            <ShieldCheck className="w-3 h-3" /> Sandboxed
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={handleRefresh}
            className="p-1 rounded-md hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            title="Reload App"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => window.open(targetUrl, '_blank')}
            className="p-1 rounded-md hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            title="Open in external browser window"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Iframe Body */}
      <div className="flex-1 relative bg-white min-h-0">
        <iframe
          key={iframeKey}
          src={targetUrl}
          onLoad={() => setIsLoading(false)}
          className="w-full h-full border-none"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
          title={manifest.name}
        />
      </div>
    </div>
  );
};
