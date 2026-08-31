import React, { useState, useEffect, useRef } from 'react';
import { Play, RotateCcw, Trophy, Gamepad2 } from 'lucide-react';

const GRID_SIZE = 20;

export const SnakeGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [snake, setSnake] = useState<{ x: number; y: number }[]>([
    { x: 10, y: 10 },
    { x: 10, y: 11 },
    { x: 10, y: 12 },
  ]);
  const [food, setFood] = useState<{ x: number; y: number }>({ x: 5, y: 5 });
  const [dir, setDir] = useState<{ x: number; y: number }>({ x: 0, y: -1 });
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('simpleos_snake_highscore') || localStorage.getItem('aether_snake_highscore') || '0', 10);
  });
  const [gameOver, setGameOver] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const generateFood = (currentSnake: { x: number; y: number }[]) => {
    let newFood: { x: number; y: number };
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      if (!currentSnake.some(s => s.x === newFood.x && s.y === newFood.y)) {
        break;
      }
    }
    return newFood;
  };

  const restartGame = () => {
    const initialSnake = [
      { x: 10, y: 10 },
      { x: 10, y: 11 },
      { x: 10, y: 12 },
    ];
    setSnake(initialSnake);
    setFood(generateFood(initialSnake));
    setDir({ x: 0, y: -1 });
    setScore(0);
    setGameOver(false);
    setIsPlaying(true);
  };

  // Keyboard controls
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!isPlaying || gameOver) return;
      if (e.key === 'ArrowUp' && dir.y === 0) setDir({ x: 0, y: -1 });
      if (e.key === 'ArrowDown' && dir.y === 0) setDir({ x: 0, y: 1 });
      if (e.key === 'ArrowLeft' && dir.x === 0) setDir({ x: -1, y: 0 });
      if (e.key === 'ArrowRight' && dir.x === 0) setDir({ x: 1, y: 0 });
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [dir, isPlaying, gameOver]);

  // Game loop tick
  useEffect(() => {
    if (!isPlaying || gameOver) return;

    const tick = setInterval(() => {
      setSnake(prevSnake => {
        const head = { x: prevSnake[0].x + dir.x, y: prevSnake[0].y + dir.y };

        // Wall collision
        if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
          setGameOver(true);
          return prevSnake;
        }

        // Self collision
        if (prevSnake.some(seg => seg.x === head.x && seg.y === head.y)) {
          setGameOver(true);
          return prevSnake;
        }

        const newSnake = [head, ...prevSnake];

        // Food collision
        if (head.x === food.x && head.y === food.y) {
          setScore(s => {
            const nextScore = s + 10;
            if (nextScore > highScore) {
              setHighScore(nextScore);
              localStorage.setItem('simpleos_snake_highscore', nextScore.toString());
            }
            return nextScore;
          });
          setFood(generateFood(newSnake));
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    }, 110);

    return () => clearInterval(tick);
  }, [isPlaying, gameOver, dir, food, highScore]);

  // Canvas render
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = canvas.width;
    const cell = size / GRID_SIZE;

    // Draw background
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, size, size);

    // Draw grid lines
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= GRID_SIZE; i++) {
      ctx.beginPath();
      ctx.moveTo(i * cell, 0);
      ctx.lineTo(i * cell, size);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, i * cell);
      ctx.lineTo(size, i * cell);
      ctx.stroke();
    }

    // Draw food
    ctx.fillStyle = '#f43f5e';
    ctx.beginPath();
    ctx.arc(food.x * cell + cell / 2, food.y * cell + cell / 2, cell / 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Draw snake
    snake.forEach((seg, idx) => {
      ctx.fillStyle = idx === 0 ? '#818cf8' : '#6366f1';
      ctx.beginPath();
      ctx.roundRect(seg.x * cell + 1, seg.y * cell + 1, cell - 2, cell - 2, 4);
      ctx.fill();
    });
  }, [snake, food]);

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 text-slate-100 select-none items-center justify-between p-4 font-sans">
      <div className="w-full flex items-center justify-between max-w-xs text-xs font-semibold">
        <span className="flex items-center gap-1.5 text-indigo-400">
          <Gamepad2 className="w-4 h-4" /> Score: {score}
        </span>
        <span className="flex items-center gap-1.5 text-amber-400">
          <Trophy className="w-4 h-4" /> Best: {highScore}
        </span>
      </div>

      {/* Canvas container */}
      <div className="relative my-2">
        <canvas ref={canvasRef} width={340} height={340} className="rounded-2xl shadow-2xl border border-white/10" />

        {(!isPlaying || gameOver) && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center p-4 text-center">
            {gameOver ? (
              <>
                <div className="text-xl font-bold text-rose-400 mb-1">Game Over!</div>
                <div className="text-xs text-slate-300 mb-4">Final Score: {score}</div>
                <button
                  onClick={restartGame}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white flex items-center gap-1.5 shadow-lg"
                >
                  <RotateCcw className="w-4 h-4" /> Play Again
                </button>
              </>
            ) : (
              <>
                <div className="text-xl font-bold text-white mb-1">Retro Snake</div>
                <div className="text-xs text-slate-400 mb-4">Use Arrow Keys on your keyboard to steer</div>
                <button
                  onClick={restartGame}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white flex items-center gap-1.5 shadow-lg"
                >
                  <Play className="w-4 h-4 fill-current" /> Start Game
                </button>
              </>
            )}
          </div>
        )}
      </div>

      <div className="text-[11px] text-slate-500">
        Controls: ↑ ↓ ← → Arrow Keys
      </div>
    </div>
  );
};
