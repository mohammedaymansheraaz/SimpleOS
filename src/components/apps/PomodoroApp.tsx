import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Coffee, Sparkles, CheckCircle2 } from 'lucide-react';
import { sound } from '../../services/audio';

export const PomodoroApp: React.FC = () => {
  const [mode, setMode] = useState<'work' | 'shortBreak' | 'longBreak'>('work');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(0);

  const DURATION_MAP = {
    work: 25 * 60,
    shortBreak: 5 * 60,
    longBreak: 15 * 60,
  };

  const switchMode = (newMode: 'work' | 'shortBreak' | 'longBreak') => {
    setMode(newMode);
    setIsRunning(false);
    setTimeLeft(DURATION_MAP[newMode]);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(DURATION_MAP[mode]);
  };

  useEffect(() => {
    let interval: any;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(t => t - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      sound.playSuccessChime();
      setIsRunning(false);
      if (mode === 'work') {
        setCompletedSessions(c => c + 1);
        switchMode('shortBreak');
      } else {
        switchMode('work');
      }
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft, mode]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progressPercent = ((DURATION_MAP[mode] - timeLeft) / DURATION_MAP[mode]) * 100;

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 text-slate-100 select-none items-center justify-between p-6 font-sans">
      {/* Mode Selectors */}
      <div className="flex bg-slate-900 p-1 rounded-xl border border-white/10 text-xs">
        <button
          onClick={() => switchMode('work')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
            mode === 'work' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          Pomodoro (25m)
        </button>
        <button
          onClick={() => switchMode('shortBreak')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
            mode === 'shortBreak' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          Short Break (5m)
        </button>
        <button
          onClick={() => switchMode('longBreak')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
            mode === 'longBreak' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          Long Break (15m)
        </button>
      </div>

      {/* Circular Progress Display */}
      <div className="relative flex items-center justify-center my-4">
        <svg className="w-52 h-52 transform -rotate-90">
          <circle
            cx="104"
            cy="104"
            r="92"
            stroke="currentColor"
            strokeWidth="8"
            className="text-slate-900"
            fill="transparent"
          />
          <circle
            cx="104"
            cy="104"
            r="92"
            stroke="currentColor"
            strokeWidth="8"
            className={mode === 'work' ? 'text-indigo-500' : mode === 'shortBreak' ? 'text-emerald-500' : 'text-purple-500'}
            strokeDasharray={2 * Math.PI * 92}
            strokeDashoffset={2 * Math.PI * 92 * (1 - progressPercent / 100)}
            strokeLinecap="round"
            fill="transparent"
            style={{ transition: 'stroke-dashoffset 0.5s ease-in-out' }}
          />
        </svg>

        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className="text-4xl font-bold font-mono text-white tracking-tight">
            {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
          </span>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 mt-1">
            {mode === 'work' ? 'Deep Focus' : 'Rest & Relax'}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        <button
          onClick={resetTimer}
          className="p-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-white/10 transition-colors"
          title="Reset timer"
        >
          <RotateCcw className="w-5 h-5" />
        </button>

        <button
          onClick={() => setIsRunning(!isRunning)}
          className={`px-8 py-3.5 rounded-2xl text-sm font-bold text-white shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2 ${
            mode === 'work'
              ? 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30'
              : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30'
          }`}
        >
          {isRunning ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
          <span>{isRunning ? 'Pause' : 'Start Focus'}</span>
        </button>
      </div>

      {/* Stats footer */}
      <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
        <span>{completedSessions} Pomodoros completed today</span>
      </div>
    </div>
  );
};
