import React, { useEffect, useRef } from 'react';
import { useOS } from '../../context/OSContext';
import { OSIcon } from '../common/OSIcon';

export const ContextMenu: React.FC = () => {
  const { contextMenu, closeContextMenu } = useOS();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        closeContextMenu();
      }
    };
    if (contextMenu.isOpen) {
      document.addEventListener('mousedown', handleOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutside);
    };
  }, [contextMenu.isOpen, closeContextMenu]);

  if (!contextMenu.isOpen || contextMenu.items.length === 0) {
    return null;
  }

  return (
    <div
      ref={menuRef}
      id="os-context-menu"
      className="fixed z-[99999] min-w-[210px] py-1.5 px-1 rounded-2xl bg-[#0c0c0c]/95 shadow-[0_25px_60px_rgba(0,0,0,0.9)] border border-white/15 backdrop-blur-2xl text-stone-200"
      style={{ left: contextMenu.x, top: contextMenu.y }}
      onClick={(e) => e.stopPropagation()}
      onContextMenu={(e) => e.preventDefault()}
    >
      {contextMenu.items.map((item, idx) => {
        if (item.divider) {
          return <div key={`divider-${idx}`} className="my-1 border-t border-white/10" />;
        }

        return (
          <button
            key={item.id || `item-${idx}`}
            id={`context-item-${item.id}`}
            disabled={item.disabled}
            onClick={() => {
              if (!item.disabled && item.action) {
                item.action();
                closeContextMenu();
              }
            }}
            className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-medium transition-colors text-left ${
              item.disabled
                ? 'opacity-30 cursor-not-allowed text-stone-500'
                : item.danger
                ? 'text-rose-400 hover:bg-rose-500/20 hover:text-rose-300'
                : 'text-stone-300 hover:bg-white/10 hover:text-stone-100'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {item.icon && <OSIcon name={item.icon} className="w-3.5 h-3.5 shrink-0 text-stone-400" />}
              <span className="text-xs">{item.label}</span>
            </div>
            {item.shortcut && (
              <span className="text-[10px] text-stone-500 font-mono tracking-wider ml-4">
                {item.shortcut}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
