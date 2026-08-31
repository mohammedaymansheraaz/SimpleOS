import React, { useState, useEffect } from 'react';
import { RotateCcw, Trophy, Award } from 'lucide-react';

export const Game2048: React.FC = () => {
  const [board, setBoard] = useState<number[][]>(() => initBoard());
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(() => {
    return parseInt(localStorage.getItem('simpleos_2048_best') || localStorage.getItem('aether_2048_best') || '0', 10);
  });
  const [gameOver, setGameOver] = useState(false);

  function initBoard(): number[][] {
    const b = Array(4).fill(0).map(() => Array(4).fill(0));
    addRandom(b);
    addRandom(b);
    return b;
  }

  function addRandom(b: number[][]) {
    const empty: { r: number; c: number }[] = [];
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (b[r][c] === 0) empty.push({ r, c });
      }
    }
    if (empty.length === 0) return;
    const { r, c } = empty[Math.floor(Math.random() * empty.length)];
    b[r][c] = Math.random() < 0.9 ? 2 : 4;
  }

  const restart = () => {
    const b = initBoard();
    setBoard(b);
    setScore(0);
    setGameOver(false);
  };

  const slide = (row: number[]): { newRow: number[]; addedScore: number } => {
    let arr = row.filter(val => val !== 0);
    let added = 0;
    for (let i = 0; i < arr.length - 1; i++) {
      if (arr[i] === arr[i + 1]) {
        arr[i] *= 2;
        added += arr[i];
        arr[i + 1] = 0;
      }
    }
    arr = arr.filter(val => val !== 0);
    while (arr.length < 4) arr.push(0);
    return { newRow: arr, addedScore: added };
  };

  const moveLeft = () => {
    let changed = false;
    let gained = 0;
    const nextBoard = board.map(row => {
      const { newRow, addedScore } = slide(row);
      gained += addedScore;
      if (newRow.some((val, i) => val !== row[i])) changed = true;
      return newRow;
    });

    if (changed) {
      addRandom(nextBoard);
      updateGameState(nextBoard, score + gained);
    }
  };

  const moveRight = () => {
    let changed = false;
    let gained = 0;
    const nextBoard = board.map(row => {
      const reversed = [...row].reverse();
      const { newRow, addedScore } = slide(reversed);
      gained += addedScore;
      const unreversed = newRow.reverse();
      if (unreversed.some((val, i) => val !== row[i])) changed = true;
      return unreversed;
    });

    if (changed) {
      addRandom(nextBoard);
      updateGameState(nextBoard, score + gained);
    }
  };

  const moveUp = () => {
    let changed = false;
    let gained = 0;
    const nextBoard = Array(4).fill(0).map(() => Array(4).fill(0));

    for (let c = 0; c < 4; c++) {
      const col = [board[0][c], board[1][c], board[2][c], board[3][c]];
      const { newRow, addedScore } = slide(col);
      gained += addedScore;
      for (let r = 0; r < 4; r++) {
        nextBoard[r][c] = newRow[r];
        if (newRow[r] !== board[r][c]) changed = true;
      }
    }

    if (changed) {
      addRandom(nextBoard);
      updateGameState(nextBoard, score + gained);
    }
  };

  const moveDown = () => {
    let changed = false;
    let gained = 0;
    const nextBoard = Array(4).fill(0).map(() => Array(4).fill(0));

    for (let c = 0; c < 4; c++) {
      const col = [board[3][c], board[2][c], board[1][c], board[0][c]];
      const { newRow, addedScore } = slide(col);
      gained += addedScore;
      const unreversed = newRow.reverse();
      for (let r = 0; r < 4; r++) {
        nextBoard[r][c] = unreversed[r];
        if (unreversed[r] !== board[r][c]) changed = true;
      }
    }

    if (changed) {
      addRandom(nextBoard);
      updateGameState(nextBoard, score + gained);
    }
  };

  const updateGameState = (newBoard: number[][], newScore: number) => {
    setBoard(newBoard);
    setScore(newScore);
    if (newScore > bestScore) {
      setBestScore(newScore);
      localStorage.setItem('simpleos_2048_best', newScore.toString());
    }
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') moveLeft();
      if (e.key === 'ArrowRight') moveRight();
      if (e.key === 'ArrowUp') moveUp();
      if (e.key === 'ArrowDown') moveDown();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  });

  const getTileColor = (val: number) => {
    switch (val) {
      case 2: return 'bg-slate-800 text-slate-200';
      case 4: return 'bg-slate-700 text-white';
      case 8: return 'bg-indigo-600 text-white';
      case 16: return 'bg-indigo-500 text-white';
      case 32: return 'bg-purple-600 text-white';
      case 64: return 'bg-purple-500 text-white';
      case 128: return 'bg-pink-600 text-white font-bold';
      case 256: return 'bg-pink-500 text-white font-bold';
      case 512: return 'bg-amber-600 text-white font-bold';
      case 1024: return 'bg-amber-500 text-white font-bold';
      case 2048: return 'bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-500/50';
      default: return 'bg-slate-900/60 text-transparent';
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 text-slate-100 select-none items-center justify-between p-4 font-sans">
      <div className="w-full flex items-center justify-between max-w-[320px]">
        <div>
          <h2 className="text-xl font-black text-white tracking-tight">2048</h2>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-2.5 py-1 rounded-xl bg-slate-900 border border-white/10 text-center">
            <div className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Score</div>
            <div className="text-xs font-mono font-bold text-white">{score}</div>
          </div>
          <div className="px-2.5 py-1 rounded-xl bg-slate-900 border border-white/10 text-center">
            <div className="text-[9px] uppercase tracking-wider text-amber-400 font-bold">Best</div>
            <div className="text-xs font-mono font-bold text-white">{bestScore}</div>
          </div>
          <button
            onClick={restart}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/10 text-slate-300 hover:text-white transition-colors"
            title="Restart"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 4x4 Board Grid */}
      <div className="p-3 rounded-2xl bg-slate-900/80 border border-white/15 grid grid-cols-4 gap-2.5 w-[320px] h-[320px]">
        {board.map((row, r) =>
          row.map((val, c) => (
            <div
              key={`${r}-${c}`}
              className={`rounded-xl flex items-center justify-center font-mono text-base font-bold transition-all ${getTileColor(
                val
              )}`}
            >
              {val > 0 ? val : ''}
            </div>
          ))
        )}
      </div>

      <div className="text-[11px] text-slate-500">
        Use Arrow keys to join matching tiles to reach 2048!
      </div>
    </div>
  );
};
