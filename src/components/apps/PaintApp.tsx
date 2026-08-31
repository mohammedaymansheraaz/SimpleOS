import React, { useRef, useState, useEffect } from 'react';
import { useOS } from '../../context/OSContext';
import {
  Paintbrush,
  Eraser,
  Square,
  Circle,
  Slash,
  RotateCcw,
  Download,
  Save,
  Trash2,
  Sparkles,
} from 'lucide-react';
import { PICTURES_DIR_ID } from '../../services/vfs';

const COLOR_PALETTE = [
  '#ffffff', '#000000', '#6366f1', '#ec4899', '#f43f5e',
  '#f59e0b', '#10b981', '#06b6d4', '#8b5cf6', '#3b82f6',
];

interface PaintAppProps {
  imageContent?: string;
}

export const PaintApp: React.FC<PaintAppProps> = ({ imageContent }) => {
  const { createFile, addNotification } = useOS();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tool, setTool] = useState<'brush' | 'eraser' | 'rect' | 'circle' | 'line'>('brush');
  const [color, setColor] = useState<string>('#6366f1');
  const [brushSize, setBrushSize] = useState<number>(4);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [startPos, setStartPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [history, setHistory] = useState<ImageData[]>([]);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    // Set canvas internal resolution
    canvas.width = 800;
    canvas.height = 540;

    if (imageContent) {
      const img = new window.Image();
      img.src = imageContent;
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        saveState();
      };
    } else {
      ctx.fillStyle = '#0f172a'; // Dark slate canvas background
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      saveState();
    }
  }, [imageContent]);

  const saveState = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;
    setHistory(prev => [...prev.slice(-10), ctx.getImageData(0, 0, canvas.width, canvas.height)]);
  };

  const handleUndo = () => {
    if (history.length <= 1) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const prevHistory = [...history];
    prevHistory.pop(); // Remove current
    const targetState = prevHistory[prevHistory.length - 1];
    ctx.putImageData(targetState, 0, 0);
    setHistory(prevHistory);
  };

  const getCanvasCoordinates = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const startDraw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const coords = getCanvasCoordinates(e);
    setIsDrawing(true);
    setStartPos(coords);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const coords = getCanvasCoordinates(e);

    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (tool === 'brush') {
      ctx.strokeStyle = color;
      ctx.lineTo(coords.x, coords.y);
      ctx.stroke();
    } else if (tool === 'eraser') {
      ctx.strokeStyle = '#0f172a';
      ctx.lineTo(coords.x, coords.y);
      ctx.stroke();
    }
  };

  const stopDraw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    setIsDrawing(false);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const coords = getCanvasCoordinates(e);

    if (tool === 'rect') {
      ctx.strokeStyle = color;
      ctx.lineWidth = brushSize;
      const w = coords.x - startPos.x;
      const h = coords.y - startPos.y;
      ctx.strokeRect(startPos.x, startPos.y, w, h);
    } else if (tool === 'circle') {
      ctx.strokeStyle = color;
      ctx.lineWidth = brushSize;
      const radius = Math.sqrt(Math.pow(coords.x - startPos.x, 2) + Math.pow(coords.y - startPos.y, 2));
      ctx.beginPath();
      ctx.arc(startPos.x, startPos.y, radius, 0, Math.PI * 2);
      ctx.stroke();
    } else if (tool === 'line') {
      ctx.strokeStyle = color;
      ctx.lineWidth = brushSize;
      ctx.beginPath();
      ctx.moveTo(startPos.x, startPos.y);
      ctx.lineTo(coords.x, coords.y);
      ctx.stroke();
    }

    ctx.closePath();
    saveState();
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveState();
  };

  const handleSaveToVFS = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    const name = `Artwork_${new Date().toISOString().slice(0, 10)}_${Date.now().toString().slice(-4)}.png`;
    await createFile(name, PICTURES_DIR_ID, dataUrl, 'image');
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `SimpleOS_Drawing_${Date.now()}.png`;
    a.click();
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 text-slate-100 select-none overflow-hidden">
      {/* Top Toolbar */}
      <div className="h-12 px-3 bg-slate-900 border-b border-white/10 flex items-center justify-between gap-3 shrink-0">
        {/* Tools selection */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-white/10">
          <button
            onClick={() => setTool('brush')}
            className={`p-1.5 rounded-lg transition-colors ${
              tool === 'brush' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
            title="Brush"
          >
            <Paintbrush className="w-4 h-4" />
          </button>
          <button
            onClick={() => setTool('eraser')}
            className={`p-1.5 rounded-lg transition-colors ${
              tool === 'eraser' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
            title="Eraser"
          >
            <Eraser className="w-4 h-4" />
          </button>
          <button
            onClick={() => setTool('line')}
            className={`p-1.5 rounded-lg transition-colors ${
              tool === 'line' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
            title="Line"
          >
            <Slash className="w-4 h-4" />
          </button>
          <button
            onClick={() => setTool('rect')}
            className={`p-1.5 rounded-lg transition-colors ${
              tool === 'rect' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
            title="Rectangle"
          >
            <Square className="w-4 h-4" />
          </button>
          <button
            onClick={() => setTool('circle')}
            className={`p-1.5 rounded-lg transition-colors ${
              tool === 'circle' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
            title="Circle"
          >
            <Circle className="w-4 h-4" />
          </button>
        </div>

        {/* Color Palette */}
        <div className="flex items-center gap-1.5">
          {COLOR_PALETTE.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className={`w-5 h-5 rounded-full border border-white/20 transition-transform ${
                color === c ? 'scale-125 ring-2 ring-white shadow-md' : 'hover:scale-110'
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-6 h-6 rounded-md bg-transparent border border-white/20 cursor-pointer"
          />
        </div>

        {/* Brush Size Slider */}
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span>Size</span>
          <input
            type="range"
            min="1"
            max="32"
            value={brushSize}
            onChange={(e) => setBrushSize(Number(e.target.value))}
            className="w-20 accent-indigo-500 cursor-pointer"
          />
          <span className="font-mono text-white text-[11px] w-4">{brushSize}</span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleUndo}
            disabled={history.length <= 1}
            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white disabled:opacity-30 transition-colors"
            title="Undo"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={clearCanvas}
            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-rose-400 transition-colors"
            title="Clear canvas"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleSaveToVFS}
            className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white flex items-center gap-1.5 transition-colors shadow"
          >
            <Save className="w-3.5 h-3.5" /> Save to Pictures
          </button>
          <button
            onClick={handleDownload}
            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
            title="Download PNG to Host"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Canvas Workspace */}
      <div className="flex-1 flex items-center justify-center p-4 bg-slate-900/40 overflow-hidden">
        <canvas
          ref={canvasRef}
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={stopDraw}
          onMouseLeave={stopDraw}
          className="rounded-xl shadow-2xl border border-white/15 cursor-crosshair max-w-full max-h-full object-contain"
        />
      </div>
    </div>
  );
};
