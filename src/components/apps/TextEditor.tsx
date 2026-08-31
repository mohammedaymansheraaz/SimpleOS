import React, { useState, useEffect } from 'react';
import { useOS } from '../../context/OSContext';
import {
  Save,
  FilePlus,
  FolderOpen,
  Eye,
  Edit3,
  Download,
  Copy,
  Check,
  Code,
  FileText,
  Sparkles,
} from 'lucide-react';
import { DESKTOP_DIR_ID, DOCUMENTS_DIR_ID } from '../../services/vfs';

interface TextEditorProps {
  fileId?: string;
  filePath?: string;
}

export const TextEditor: React.FC<TextEditorProps> = ({ fileId, filePath }) => {
  const { getNode, saveFileContent, createFile, nodes, addNotification } = useOS();

  const [currentFileId, setCurrentFileId] = useState<string | undefined>(fileId);
  const [filename, setFilename] = useState<string>(filePath || 'Untitled.txt');
  const [content, setContent] = useState<string>('');
  const [isSaved, setIsSaved] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<'edit' | 'preview' | 'split'>('edit');
  const [copied, setCopied] = useState<boolean>(false);

  // Load file content if fileId is provided
  useEffect(() => {
    if (fileId) {
      const node = getNode(fileId);
      if (node) {
        setCurrentFileId(node.id);
        setFilename(node.name);
        setContent(node.content || '');
        setIsSaved(true);
        if (node.type === 'markdown' || node.name.endsWith('.md')) {
          setViewMode('split');
        }
      }
    }
  }, [fileId, getNode]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    setIsSaved(false);
  };

  const handleSave = async () => {
    if (currentFileId) {
      await saveFileContent(currentFileId, content);
      setIsSaved(true);
      addNotification({
        title: 'File Saved',
        message: `Saved changes to "${filename}".`,
        type: 'success',
      });
    } else {
      // Create new file in Documents
      let type: any = 'text';
      if (filename.endsWith('.md')) type = 'markdown';
      if (filename.endsWith('.js') || filename.endsWith('.json') || filename.endsWith('.html') || filename.endsWith('.ts')) type = 'code';

      const newNode = await createFile(filename, DOCUMENTS_DIR_ID, content, type);
      setCurrentFileId(newNode.id);
      setIsSaved(true);
    }
  };

  const handleNewFile = () => {
    setCurrentFileId(undefined);
    setFilename('Untitled.txt');
    setContent('');
    setIsSaved(true);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleDownload = () => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Simple Markdown renderer helper
  const renderMarkdown = (md: string) => {
    const lines = md.split('\n');
    return lines.map((line, idx) => {
      if (line.startsWith('# ')) {
        return <h1 key={idx} className="text-xl font-bold text-white mt-4 mb-2 pb-1 border-b border-white/10">{line.replace('# ', '')}</h1>;
      }
      if (line.startsWith('## ')) {
        return <h2 key={idx} className="text-lg font-bold text-indigo-300 mt-3 mb-1.5">{line.replace('## ', '')}</h2>;
      }
      if (line.startsWith('### ')) {
        return <h3 key={idx} className="text-sm font-semibold text-indigo-400 mt-2 mb-1">{line.replace('### ', '')}</h3>;
      }
      if (line.startsWith('- ')) {
        return <li key={idx} className="text-xs text-slate-300 ml-4 list-disc my-0.5">{line.replace('- ', '')}</li>;
      }
      if (line.startsWith('```')) {
        return <div key={idx} className="text-xs font-mono text-cyan-300 bg-slate-900 px-2 py-1 rounded my-1 border border-white/5">{line}</div>;
      }
      if (!line.trim()) {
        return <div key={idx} className="h-2" />;
      }
      return <p key={idx} className="text-xs text-slate-300 my-1 leading-relaxed">{line}</p>;
    });
  };

  // Word count & stats
  const lineCount = content.split('\n').length;
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const charCount = content.length;

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 text-slate-100 select-none overflow-hidden font-sans">
      {/* Top Toolbar */}
      <div className="h-11 px-3 border-b border-white/10 flex items-center justify-between bg-slate-900/80 shrink-0">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={filename}
            onChange={(e) => {
              setFilename(e.target.value);
              setIsSaved(false);
            }}
            className="px-2.5 py-1 rounded-md bg-slate-950 border border-white/15 text-xs text-white font-medium focus:outline-none focus:border-indigo-500 w-44 select-text"
          />
          {!isSaved && (
            <span className="w-2 h-2 rounded-full bg-amber-400" title="Unsaved changes" />
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handleNewFile}
            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
            title="New File"
          >
            <FilePlus className="w-4 h-4" />
          </button>

          <button
            onClick={handleSave}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              isSaved
                ? 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow'
            }`}
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save</span>
          </button>

          <div className="h-4 w-px bg-white/10 mx-1" />

          {/* View Mode Switches */}
          <div className="flex items-center bg-slate-950 rounded-lg p-0.5 border border-white/10">
            <button
              onClick={() => setViewMode('edit')}
              className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                viewMode === 'edit' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Editor View"
            >
              Edit
            </button>
            <button
              onClick={() => setViewMode('split')}
              className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                viewMode === 'split' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Split View"
            >
              Split
            </button>
            <button
              onClick={() => setViewMode('preview')}
              className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                viewMode === 'preview' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Markdown Preview"
            >
              Preview
            </button>
          </div>

          <div className="h-4 w-px bg-white/10 mx-1" />

          <button
            onClick={handleCopy}
            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
            title="Copy all"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>

          <button
            onClick={handleDownload}
            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
            title="Download to Host OS"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Editor Main Canvas */}
      <div className="flex-1 flex min-h-0 divide-x divide-white/10">
        {/* Editor Area */}
        {(viewMode === 'edit' || viewMode === 'split') && (
          <div className="flex-1 flex relative bg-slate-950 overflow-hidden">
            {/* Line numbers column */}
            <div className="w-10 bg-slate-900/40 p-3 select-none text-right font-mono text-[11px] text-slate-400 shrink-0 overflow-hidden">
              {Array.from({ length: Math.max(lineCount, 15) }).map((_, i) => (
                <div key={i} className="leading-6">{i + 1}</div>
              ))}
            </div>

            {/* Textarea code/text canvas */}
            <textarea
              value={content}
              onChange={handleTextChange}
              placeholder="Type your markdown, notes, or code here..."
              className="flex-1 h-full p-3 bg-transparent text-slate-200 font-mono text-xs leading-6 resize-none focus:outline-none select-text border-none"
              spellCheck={false}
            />
          </div>
        )}

        {/* Markdown Live Preview */}
        {(viewMode === 'preview' || viewMode === 'split') && (
          <div className="flex-1 p-5 overflow-y-auto bg-slate-900/40">
            <div className="max-w-2xl mx-auto">
              <div className="text-[11px] font-semibold text-indigo-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3" /> Live Markdown Render
              </div>
              {content.trim() ? (
                renderMarkdown(content)
              ) : (
                <div className="text-xs text-slate-400 italic">No content to preview</div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Status Bar */}
      <div className="h-7 px-3 bg-slate-900/90 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400 font-mono shrink-0">
        <div className="flex items-center gap-3">
          <span>{lineCount} lines</span>
          <span>{wordCount} words</span>
          <span>{charCount} chars</span>
        </div>
        <div className="flex items-center gap-2">
          <span>UTF-8</span>
          <span>{filename.includes('.') ? filename.split('.').pop()?.toUpperCase() : 'TXT'}</span>
        </div>
      </div>
    </div>
  );
};
