import React, { useState, useEffect } from 'react';
import { 
  Clock as ClockIcon, 
  Timer as TimerIcon, 
  Watch, 
  Bell, 
  Play, 
  Pause, 
  RotateCcw, 
  Plus, 
  Trash2, 
  Check 
} from 'lucide-react';
import { sound } from '../../services/audio';

interface WorldCity {
  city: string;
  country: string;
  timezone: string;
}

const WORLD_CITIES: WorldCity[] = [
  { city: 'London', country: 'United Kingdom', timezone: 'Europe/London' },
  { city: 'New York', country: 'United States', timezone: 'America/New_York' },
  { city: 'San Francisco', country: 'United States', timezone: 'America/Los_Angeles' },
  { city: 'Tokyo', country: 'Japan', timezone: 'Asia/Tokyo' },
  { city: 'Paris', country: 'France', timezone: 'Europe/Paris' },
  { city: 'Sydney', country: 'Australia', timezone: 'Australia/Sydney' },
];

export const ClockApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'world' | 'stopwatch' | 'timer' | 'alarms'>('world');
  const [now, setNow] = useState(new Date());

  // Stopwatch state
  const [swRunning, setSwRunning] = useState(false);
  const [swTime, setSwTime] = useState(0); // in ms
  const [laps, setLaps] = useState<number[]>([]);

  // Timer state
  const [timerMinutes, setTimerMinutes] = useState(5);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerRemaining, setTimerRemaining] = useState(300); // in seconds
  const [timerRunning, setTimerRunning] = useState(false);

  // Alarms
  const [alarms, setAlarms] = useState<Array<{ id: string; time: string; label: string; enabled: boolean }>>([
    { id: '1', time: '07:30', label: 'Morning Wakeup', enabled: true },
    { id: '2', time: '13:00', label: 'Lunch Break', enabled: false },
  ]);
  const [newAlarmTime, setNewAlarmTime] = useState('08:00');
  const [newAlarmLabel, setNewAlarmLabel] = useState('New Alarm');

  // Clock tick
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Stopwatch interval
  useEffect(() => {
    let interval: any = null;
    if (swRunning) {
      const start = Date.now() - swTime;
      interval = setInterval(() => {
        setSwTime(Date.now() - start);
      }, 10);
    }
    return () => clearInterval(interval);
  }, [swRunning]);

  // Timer countdown
  useEffect(() => {
    let interval: any = null;
    if (timerRunning && timerRemaining > 0) {
      interval = setInterval(() => {
        setTimerRemaining(prev => {
          if (prev <= 1) {
            setTimerRunning(false);
            sound.playSuccessChime();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerRunning, timerRemaining]);

  const formatSw = (ms: number) => {
    const min = Math.floor(ms / 60000);
    const sec = Math.floor((ms % 60000) / 1000);
    const centis = Math.floor((ms % 1000) / 10);
    return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}.${String(centis).padStart(2, '0')}`;
  };

  const formatTimer = (totalSec: number) => {
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handleStartTimer = () => {
    if (!timerRunning && timerRemaining === 0) {
      setTimerRemaining(timerMinutes * 60 + timerSeconds);
    }
    setTimerRunning(!timerRunning);
    sound.playClick();
  };

  const handleResetTimer = () => {
    setTimerRunning(false);
    setTimerRemaining(timerMinutes * 60 + timerSeconds);
    sound.playClick();
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0c0c0e] text-stone-200 font-sans select-none overflow-hidden">
      {/* Header Tabs */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-white/10 bg-[#09090b]">
        <div className="flex items-center gap-2">
          <ClockIcon className="w-4 h-4 text-stone-300" />
          <span className="font-serif italic font-bold text-stone-100 text-sm">Clock & Timer</span>
        </div>

        <div className="flex bg-black/40 p-1 rounded-xl border border-white/10 text-xs">
          <button
            onClick={() => setActiveTab('world')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'world' ? 'bg-stone-200 text-stone-950 font-semibold' : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            World Clock
          </button>
          <button
            onClick={() => setActiveTab('stopwatch')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'stopwatch' ? 'bg-stone-200 text-stone-950 font-semibold' : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            Stopwatch
          </button>
          <button
            onClick={() => setActiveTab('timer')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'timer' ? 'bg-stone-200 text-stone-950 font-semibold' : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            Timer
          </button>
          <button
            onClick={() => setActiveTab('alarms')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'alarms' ? 'bg-stone-200 text-stone-950 font-semibold' : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            Alarms
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 p-6 overflow-y-auto">
        {/* WORLD CLOCK */}
        {activeTab === 'world' && (
          <div className="flex flex-col gap-6 max-w-2xl mx-auto">
            {/* Local time card */}
            <div className="p-6 rounded-2xl bg-black/40 border border-white/10 text-center">
              <div className="text-xs font-mono uppercase tracking-widest text-stone-400 mb-1">Local Workstation Time</div>
              <div className="text-5xl font-mono font-light text-stone-100 tracking-tight">
                {now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
              </div>
              <div className="text-xs text-stone-400 mt-2 font-sans">
                {now.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </div>
            </div>

            {/* Global cities grid */}
            <div className="grid grid-cols-2 gap-3">
              {WORLD_CITIES.map((c) => {
                const timeInCity = new Intl.DateTimeFormat('en-US', {
                  timeZone: c.timezone,
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: false,
                }).format(now);

                const dateInCity = new Intl.DateTimeFormat('en-US', {
                  timeZone: c.timezone,
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                }).format(now);

                return (
                  <div key={c.city} className="p-4 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-stone-200 text-sm">{c.city}</div>
                      <div className="text-[11px] text-stone-500">{dateInCity}</div>
                    </div>
                    <div className="font-mono text-lg font-medium text-stone-100">{timeInCity}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STOPWATCH */}
        {activeTab === 'stopwatch' && (
          <div className="flex flex-col items-center justify-center gap-6 max-w-md mx-auto h-full">
            <div className="text-6xl font-mono font-light text-stone-100 tracking-tight my-4">
              {formatSw(swTime)}
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setSwRunning(!swRunning);
                  sound.playClick();
                }}
                className={`px-6 py-2.5 rounded-xl font-medium text-sm transition-all flex items-center gap-2 ${
                  swRunning ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-stone-200 text-stone-950 hover:bg-white'
                }`}
              >
                {swRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{swRunning ? 'Pause' : 'Start'}</span>
              </button>

              {swRunning && (
                <button
                  onClick={() => {
                    setLaps([swTime, ...laps]);
                    sound.playClick();
                  }}
                  className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-stone-200 text-sm font-medium transition-colors"
                >
                  Lap
                </button>
              )}

              <button
                onClick={() => {
                  setSwRunning(false);
                  setSwTime(0);
                  setLaps([]);
                  sound.playClick();
                }}
                className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-stone-400 hover:text-stone-200 transition-colors"
                title="Reset Stopwatch"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {laps.length > 0 && (
              <div className="w-full max-h-48 overflow-y-auto rounded-xl bg-black/30 border border-white/5 p-2 font-mono text-xs divide-y divide-white/5">
                {laps.map((lap, i) => (
                  <div key={i} className="flex justify-between py-1.5 px-3">
                    <span className="text-stone-500">Lap {laps.length - i}</span>
                    <span className="text-stone-200">{formatSw(lap)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TIMER */}
        {activeTab === 'timer' && (
          <div className="flex flex-col items-center justify-center gap-6 max-w-md mx-auto h-full">
            <div className="text-6xl font-mono font-light text-stone-100 tracking-tight my-4">
              {formatTimer(timerRemaining)}
            </div>

            {!timerRunning && (
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={timerMinutes}
                  onChange={(e) => {
                    const m = Math.max(0, parseInt(e.target.value) || 0);
                    setTimerMinutes(m);
                    setTimerRemaining(m * 60 + timerSeconds);
                  }}
                  className="w-16 px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-center font-mono text-sm text-stone-100"
                />
                <span className="text-stone-400 text-xs font-mono">min</span>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={timerSeconds}
                  onChange={(e) => {
                    const s = Math.max(0, Math.min(59, parseInt(e.target.value) || 0));
                    setTimerSeconds(s);
                    setTimerRemaining(timerMinutes * 60 + s);
                  }}
                  className="w-16 px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-center font-mono text-sm text-stone-100"
                />
                <span className="text-stone-400 text-xs font-mono">sec</span>
              </div>
            )}

            <div className="flex items-center gap-3">
              <button
                onClick={handleStartTimer}
                className={`px-6 py-2.5 rounded-xl font-medium text-sm transition-all flex items-center gap-2 ${
                  timerRunning ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-stone-200 text-stone-950 hover:bg-white'
                }`}
              >
                {timerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{timerRunning ? 'Pause' : 'Start Timer'}</span>
              </button>

              <button
                onClick={handleResetTimer}
                className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-stone-400 hover:text-stone-200 transition-colors"
                title="Reset"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ALARMS */}
        {activeTab === 'alarms' && (
          <div className="flex flex-col gap-4 max-w-lg mx-auto">
            {/* Add new alarm */}
            <div className="p-4 rounded-xl bg-black/40 border border-white/10 flex items-center gap-3">
              <input
                type="time"
                value={newAlarmTime}
                onChange={(e) => setNewAlarmTime(e.target.value)}
                className="px-3 py-1.5 rounded-lg bg-black/60 border border-white/10 text-stone-100 font-mono text-xs outline-none"
              />
              <input
                type="text"
                placeholder="Alarm Label"
                value={newAlarmLabel}
                onChange={(e) => setNewAlarmLabel(e.target.value)}
                className="flex-1 px-3 py-1.5 rounded-lg bg-black/60 border border-white/10 text-stone-100 text-xs outline-none"
              />
              <button
                onClick={() => {
                  if (newAlarmTime) {
                    setAlarms([...alarms, { id: String(Date.now()), time: newAlarmTime, label: newAlarmLabel || 'Alarm', enabled: true }]);
                    setNewAlarmLabel('');
                  }
                }}
                className="p-2 rounded-lg bg-stone-200 hover:bg-white text-stone-950 font-semibold transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* List */}
            <div className="flex flex-col gap-2">
              {alarms.map((al) => (
                <div key={al.id} className="p-4 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-between">
                  <div>
                    <div className="text-xl font-mono font-medium text-stone-100">{al.time}</div>
                    <div className="text-xs text-stone-400">{al.label}</div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setAlarms(alarms.map(a => a.id === al.id ? { ...a, enabled: !a.enabled } : a))}
                      className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                        al.enabled ? 'bg-emerald-500' : 'bg-stone-700'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full bg-white transition-transform ${al.enabled ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>

                    <button
                      onClick={() => setAlarms(alarms.filter(a => a.id !== al.id))}
                      className="text-stone-500 hover:text-rose-400 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
