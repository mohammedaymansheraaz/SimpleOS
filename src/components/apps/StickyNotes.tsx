import React, { useState, useEffect } from 'react';
import { useOS } from '../../context/OSContext';
import { Plus, Trash2, Palette } from 'lucide-react';
import { DESKTOP_DIR_ID } from '../../services/vfs';

const NOTE_COLORS = [
  { bg: 'bg-amber-400/90 text-amber-950', border: 'border-amber-500' },
  { bg: 'bg-emerald-400/90 text-emerald-950', border: 'border-emerald-500' },
  { bg: 'bg-cyan-400/90 text-cyan-950', border: 'border-cyan-500' },
  { bg: 'bg-pink-400/90 text-pink-950', border: 'border-pink-500' },
  { bg: 'bg-purple-400/90 text-purple-950', border: 'border-purple-500' },
];

export const StickyNotes: React.FC = () => {
  const { createFile, saveFileContent, nodes } = useOS();
  const [noteText, setNoteText] = useState(() => {
    return localStorage.getItem('simpleos_sticky_note') || localStorage.getItem('aether_sticky_note') || '💡 Quick Note:\n- Try dragging files from host OS!\n- Snap windows by dragging to edges\n- Install web apps from the App Store';
  });
  const [colorIndex, setColorIndex] = useState(0);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setNoteText(val);
    localStorage.setItem('simpleos_sticky_note', val);
  };

  const currentColor = NOTE_COLORS[colorIndex];

  return (
    <div className={`flex-1 flex flex-col h-full ${currentColor.bg} p-4 font-sans select-none overflow-hidden transition-colors duration-200`}>
      {/* Top note header */}
      <div className="flex items-center justify-between pb-2 border-b border-black/10 shrink-0">
        <div className="flex items-center gap-1.5">
          {NOTE_COLORS.map((c, i) => (
            <button
              key={i}
              onClick={() => setColorIndex(i)}
              className={`w-3.5 h-3.5 rounded-full border border-black/20 ${c.bg} ${
                colorIndex === i ? 'ring-2 ring-black' : ''
              }`}
            />
          ))}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setNoteText('')}
            className="p-1 rounded hover:bg-black/10 text-current transition-colors"
            title="Clear note"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Note Area */}
      <textarea
        value={noteText}
        onChange={handleTextChange}
        placeholder="Write a quick sticky note..."
        className="flex-1 w-full bg-transparent resize-none p-2 text-sm leading-relaxed focus:outline-none placeholder:text-black/40 font-medium select-text"
      />
    </div>
  );
};
