import React, { useState, useRef, useEffect, useCallback } from 'react';
import { OSWindow, WindowPosition, WindowSize, WindowSnapState } from '../../types/os';
import { useOS } from '../../context/OSContext';
import { OSIcon } from '../common/OSIcon';
import { Minus, Square, Copy, X, Pin, PinOff } from 'lucide-react';

interface WindowFrameProps {
  window: OSWindow;
  children: React.ReactNode;
}

export const WindowFrame: React.FC<WindowFrameProps> = ({ window: win, children }) => {
  const {
    activeWindowId,
    focusWindow,
    closeWindow,
    minimizeWindow,
    maximizeWindow,
    updateWindowPosition,
    updateWindowSize,
    snapWindow,
    togglePinWindow,
    settings,
  } = useOS();

  const isFocused = activeWindowId === win.id;
  const frameRef = useRef<HTMLDivElement>(null);

  // Dragging state
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ mouseX: number; mouseY: number; winX: number; winY: number }>({
    mouseX: 0,
    mouseY: 0,
    winX: 0,
    winY: 0,
  });

  // Resizing state
  const [isResizing, setIsResizing] = useState(false);
  const resizeDirectionRef = useRef<string>('');
  const resizeStartRef = useRef<{
    mouseX: number;
    mouseY: number;
    winX: number;
    winY: number;
    winWidth: number;
    winHeight: number;
  }>({
    mouseX: 0,
    mouseY: 0,
    winX: 0,
    winY: 0,
    winWidth: 0,
    winHeight: 0,
  });

  // Snap preview threshold state
  const [snapCandidate, setSnapCandidate] = useState<WindowSnapState>('none');

  // Dragging logic
  const handleTitleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Left click only
    // Don't drag if clicking buttons
    if ((e.target as HTMLElement).closest('button')) return;

    focusWindow(win.id);

    // If maximized, we restore on drag start centered on cursor
    if (win.isMaximized) {
      const restoredWidth = win.prevSize?.width || 800;
      const newX = Math.max(10, e.clientX - restoredWidth / 2);
      const newY = Math.max(10, e.clientY - 20);
      maximizeWindow(win.id); // Toggle off maximize
      updateWindowPosition(win.id, { x: newX, y: newY });
      dragStartRef.current = {
        mouseX: e.clientX,
        mouseY: e.clientY,
        winX: newX,
        winY: newY,
      };
    } else {
      dragStartRef.current = {
        mouseX: e.clientX,
        mouseY: e.clientY,
        winX: win.position.x,
        winY: win.position.y,
      };
    }

    setIsDragging(true);
    e.preventDefault();
  };

  // Resize handler
  const handleResizeMouseDown = (e: React.MouseEvent, direction: string) => {
    if (e.button !== 0) return;
    if (win.isMaximized) return;

    focusWindow(win.id);
    resizeDirectionRef.current = direction;
    resizeStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      winX: win.position.x,
      winY: win.position.y,
      winWidth: win.size.width,
      winHeight: win.size.height,
    };
    setIsResizing(true);
    e.preventDefault();
    e.stopPropagation();
  };

  // Global mousemove and mouseup listeners
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const deltaX = e.clientX - dragStartRef.current.mouseX;
        const deltaY = e.clientY - dragStartRef.current.mouseY;

        let nextX = dragStartRef.current.winX + deltaX;
        let nextY = dragStartRef.current.winY + deltaY;

        // Keep inside top threshold
        nextY = Math.max(0, nextY);

        updateWindowPosition(win.id, { x: nextX, y: nextY });

        // Edge snap detection
        if (settings.snapAssistEnabled) {
          const snapThreshold = 18;
          if (e.clientX <= snapThreshold) {
            setSnapCandidate('left');
          } else if (e.clientX >= window.innerWidth - snapThreshold) {
            setSnapCandidate('right');
          } else if (e.clientY <= snapThreshold) {
            setSnapCandidate('maximize');
          } else {
            setSnapCandidate('none');
          }
        }
      } else if (isResizing) {
        const deltaX = e.clientX - resizeStartRef.current.mouseX;
        const deltaY = e.clientY - resizeStartRef.current.mouseY;
        const dir = resizeDirectionRef.current;
        const minW = win.minWidth || 360;
        const minH = win.minHeight || 260;

        let newW = resizeStartRef.current.winWidth;
        let newH = resizeStartRef.current.winHeight;
        let newX = resizeStartRef.current.winX;
        let newY = resizeStartRef.current.winY;

        if (dir.includes('e')) {
          newW = Math.max(minW, resizeStartRef.current.winWidth + deltaX);
        }
        if (dir.includes('s')) {
          newH = Math.max(minH, resizeStartRef.current.winHeight + deltaY);
        }
        if (dir.includes('w')) {
          const possibleW = resizeStartRef.current.winWidth - deltaX;
          if (possibleW >= minW) {
            newW = possibleW;
            newX = resizeStartRef.current.winX + deltaX;
          }
        }
        if (dir.includes('n')) {
          const possibleH = resizeStartRef.current.winHeight - deltaY;
          if (possibleH >= minH) {
            newH = possibleH;
            newY = resizeStartRef.current.winY + deltaY;
          }
        }

        updateWindowPosition(win.id, { x: newX, y: newY });
        updateWindowSize(win.id, { width: newW, height: newH });
      }
    };

    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
        if (snapCandidate !== 'none') {
          snapWindow(win.id, snapCandidate);
          setSnapCandidate('none');
        }
      }
      if (isResizing) {
        setIsResizing(false);
      }
    };

    if (isDragging || isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [
    isDragging,
    isResizing,
    snapCandidate,
    win.id,
    win.minWidth,
    win.minHeight,
    settings.snapAssistEnabled,
    updateWindowPosition,
    updateWindowSize,
    snapWindow,
  ]);

  if (win.isMinimized) {
    return null;
  }

  // Calculate coordinates
  const frameStyle: React.CSSProperties = {
    position: 'absolute',
    left: `${win.position.x}px`,
    top: `${win.position.y}px`,
    width: `${win.size.width}px`,
    height: `${win.size.height}px`,
    zIndex: win.isPinned ? 9000 : win.zIndex,
    transform: 'none',
  };

  return (
    <>
      {/* Edge Snap Overlay Preview */}
      {isDragging && snapCandidate !== 'none' && (
        <div
          className={`fixed pointer-events-none z-[8999] border-2 border-indigo-400/80 bg-indigo-500/20 backdrop-blur-sm rounded-2xl transition-all duration-150 animate-pulse-subtle ${
            snapCandidate === 'left'
              ? 'left-2 top-2 bottom-14 w-[calc(50vw-12px)]'
              : snapCandidate === 'right'
              ? 'right-2 top-2 bottom-14 w-[calc(50vw-12px)]'
              : 'left-2 top-2 right-2 bottom-14'
          }`}
        />
      )}

      <div
        ref={frameRef}
        id={`window-frame-${win.id}`}
        style={frameStyle}
        onMouseDown={() => focusWindow(win.id)}
        className={`flex flex-col overflow-hidden select-none transition-shadow duration-150 ${
          win.isMaximized ? 'rounded-none !border-none' : 'rounded-xl border border-white/15'
        } ${
          isFocused ? 'os-window-shadow-active ring-1 ring-white/20' : 'os-window-shadow opacity-95'
        } bg-[#0c0c0c] text-stone-200`}
      >
        {/* Titlebar */}
        <div
          id={`window-titlebar-${win.id}`}
          onMouseDown={handleTitleMouseDown}
          onDoubleClick={() => maximizeWindow(win.id)}
          className={`h-11 px-4 flex items-center justify-between cursor-move shrink-0 border-b border-white/5 ${
            isFocused ? 'bg-white/[0.03] text-stone-200' : 'bg-transparent text-stone-500'
          } backdrop-blur-md transition-colors duration-150`}
        >
          {/* Traffic Light Controls on Left */}
          <div className="flex items-center gap-2" onMouseDown={(e) => e.stopPropagation()}>
            {/* Close */}
            <button
              id={`window-close-${win.id}`}
              onClick={() => closeWindow(win.id)}
              title="Close"
              className="w-3 h-3 rounded-full border border-red-500/50 bg-red-500/20 hover:bg-red-500 transition-colors flex items-center justify-center group"
            >
              <X className="w-2 h-2 text-red-200 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>

            {/* Minimize */}
            <button
              id={`window-minimize-${win.id}`}
              onClick={() => minimizeWindow(win.id)}
              title="Minimize"
              className="w-3 h-3 rounded-full border border-yellow-500/50 bg-yellow-500/20 hover:bg-yellow-500 transition-colors flex items-center justify-center group"
            >
              <Minus className="w-2 h-2 text-yellow-200 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>

            {/* Maximize / Restore */}
            <button
              id={`window-maximize-${win.id}`}
              onClick={() => maximizeWindow(win.id)}
              title={win.isMaximized ? 'Restore Down' : 'Maximize'}
              className="w-3 h-3 rounded-full border border-green-500/50 bg-green-500/20 hover:bg-green-500 transition-colors flex items-center justify-center group"
            >
              <Square className="w-1.5 h-1.5 text-green-200 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>

            {/* Pin / Always on top toggle */}
            <button
              id={`window-pin-${win.id}`}
              onClick={() => togglePinWindow(win.id)}
              title={win.isPinned ? 'Unpin from top' : 'Pin window on top'}
              className={`ml-1.5 p-1 rounded-md text-[10px] transition-colors ${
                win.isPinned
                  ? 'bg-white/20 text-stone-100'
                  : 'hover:bg-white/10 text-stone-500 hover:text-stone-300'
              }`}
            >
              {win.isPinned ? <PinOff className="w-3 h-3" /> : <Pin className="w-3 h-3" />}
            </button>
          </div>

          {/* Window Title & Icon */}
          <div className="flex items-center gap-2 min-w-0 px-2 pointer-events-none">
            <OSIcon name={win.icon} className="w-3.5 h-3.5 shrink-0 text-stone-400" />
            <span className="font-serif italic text-xs tracking-wide text-stone-400 truncate max-w-[340px]">
              {win.title}
            </span>
          </div>

          {/* Right Spacer / Badge */}
          <div className="flex items-center gap-1.5 text-[9px] uppercase tracking-widest font-mono text-stone-600">
            <span>SIMPLEOS</span>
          </div>
        </div>

        {/* Window Content Container */}
        <div className="flex-1 min-h-0 relative bg-[#090909] overflow-hidden flex flex-col">
          {children}
        </div>

        {/* 8 Resizing Handles (Hidden when maximized) */}
        {!win.isMaximized && (
          <>
            {/* Cardinal edges */}
            <div
              onMouseDown={(e) => handleResizeMouseDown(e, 'n')}
              className="absolute top-0 left-2 right-2 h-1 cursor-ns-resize z-20"
            />
            <div
              onMouseDown={(e) => handleResizeMouseDown(e, 's')}
              className="absolute bottom-0 left-2 right-2 h-1.5 cursor-ns-resize z-20"
            />
            <div
              onMouseDown={(e) => handleResizeMouseDown(e, 'w')}
              className="absolute left-0 top-2 bottom-2 w-1.5 cursor-ew-resize z-20"
            />
            <div
              onMouseDown={(e) => handleResizeMouseDown(e, 'e')}
              className="absolute right-0 top-2 bottom-2 w-1.5 cursor-ew-resize z-20"
            />

            {/* Diagonal corners */}
            <div
              onMouseDown={(e) => handleResizeMouseDown(e, 'nw')}
              className="absolute top-0 left-0 w-3 h-3 cursor-nwse-resize z-30"
            />
            <div
              onMouseDown={(e) => handleResizeMouseDown(e, 'ne')}
              className="absolute top-0 right-0 w-3 h-3 cursor-nesw-resize z-30"
            />
            <div
              onMouseDown={(e) => handleResizeMouseDown(e, 'sw')}
              className="absolute bottom-0 left-0 w-3 h-3 cursor-nesw-resize z-30"
            />
            <div
              onMouseDown={(e) => handleResizeMouseDown(e, 'se')}
              className="absolute bottom-0 right-0 w-3 h-3 cursor-nwse-resize z-30"
            />
          </>
        )}
      </div>
    </>
  );
};
