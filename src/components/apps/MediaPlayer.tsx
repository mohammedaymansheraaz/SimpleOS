import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, Music, Disc, Sparkles, Radio } from 'lucide-react';

interface Track {
  id: string;
  title: string;
  artist: string;
  genre: string;
  duration: number; // in seconds
  synthMood: 'lofi' | 'cosmic' | 'ambient' | 'synthwave';
}

const TRACKS: Track[] = [
  { id: '1', title: 'Neon Horizon', artist: 'SimpleOS Synth', genre: 'Synthwave', duration: 180, synthMood: 'synthwave' },
  { id: '2', title: 'Midnight Coffee', artist: 'Lo-Fi Chill Beats', genre: 'Lo-Fi', duration: 210, synthMood: 'lofi' },
  { id: '3', title: 'Orbital Twilight', artist: 'Deep Space Soundscape', genre: 'Cosmic Ambient', duration: 240, synthMood: 'cosmic' },
  { id: '4', title: 'Diaphragmatic Flow', artist: 'Zen Frequency', genre: 'Meditation', duration: 195, synthMood: 'ambient' },
];

export const MediaPlayer: React.FC = () => {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(75);
  const [isMuted, setIsMuted] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscillatorRefs = useRef<OscillatorNode[]>([]);
  const gainNodeRef = useRef<GainNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const currentTrack = TRACKS[currentTrackIndex];

  // Stop current synth sounds
  const stopSynth = () => {
    oscillatorRefs.current.forEach(osc => {
      try { osc.stop(); osc.disconnect(); } catch {}
    });
    oscillatorRefs.current = [];
  };

  // Start synthesized generative ambient track
  const startSynth = (mood: Track['synthMood']) => {
    stopSynth();
    try {
      if (!audioCtxRef.current) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(isMuted ? 0 : volume / 1500, ctx.currentTime);
      masterGain.connect(ctx.destination);
      gainNodeRef.current = masterGain;

      let chordFreqs = [220, 277.18, 329.63, 440]; // A major
      if (mood === 'lofi') chordFreqs = [196, 246.94, 293.66, 392]; // G major 7
      if (mood === 'cosmic') chordFreqs = [146.83, 220, 293.66, 440, 587.33]; // D minor atmospheric
      if (mood === 'ambient') chordFreqs = [174.61, 261.63, 329.63, 523.25]; // F maj7

      chordFreqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const noteGain = ctx.createGain();
        osc.type = mood === 'synthwave' ? 'sawtooth' : 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        // Low frequency modulation (LFO) for breathing effect
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        lfo.frequency.setValueAtTime(0.2 + idx * 0.1, ctx.currentTime);
        lfoGain.gain.setValueAtTime(0.08, ctx.currentTime);
        lfo.connect(lfoGain);
        lfoGain.connect(noteGain.gain);
        lfo.start();
        oscillatorRefs.current.push(lfo);

        noteGain.gain.setValueAtTime(0.2, ctx.currentTime);
        osc.connect(noteGain);
        noteGain.connect(masterGain);
        osc.start();
        oscillatorRefs.current.push(osc);
      });
    } catch {}
  };

  useEffect(() => {
    if (isPlaying) {
      startSynth(currentTrack.synthMood);
    } else {
      stopSynth();
    }
    return () => stopSynth();
  }, [isPlaying, currentTrackIndex]);

  // Volume change
  useEffect(() => {
    if (gainNodeRef.current && audioCtxRef.current) {
      gainNodeRef.current.gain.setValueAtTime(
        isMuted ? 0 : volume / 1500,
        audioCtxRef.current.currentTime
      );
    }
  }, [volume, isMuted]);

  // Track progress timer
  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= currentTrack.duration) {
            handleNext();
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentTrackIndex, currentTrack.duration]);

  // Audio visualizer loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 400;
    canvas.height = 120;

    let step = 0;
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const barCount = 28;
      const barWidth = canvas.width / barCount - 3;

      for (let i = 0; i < barCount; i++) {
        const heightMultiplier = isPlaying
          ? Math.sin(step * 0.05 + i * 0.4) * 0.4 + 0.6 + Math.random() * 0.3
          : 0.1;
        const barHeight = Math.max(4, heightMultiplier * 80);
        const x = i * (barWidth + 3);
        const y = canvas.height - barHeight;

        const grad = ctx.createLinearGradient(0, y, 0, canvas.height);
        grad.addColorStop(0, '#818cf8');
        grad.addColorStop(1, '#6366f1');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, 3);
        ctx.fill();
      }

      step++;
      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isPlaying]);

  const handleNext = () => {
    setProgress(0);
    setCurrentTrackIndex((currentTrackIndex + 1) % TRACKS.length);
  };

  const handlePrev = () => {
    setProgress(0);
    setCurrentTrackIndex((currentTrackIndex - 1 + TRACKS.length) % TRACKS.length);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 text-slate-100 select-none overflow-hidden font-sans">
      <div className="flex-1 flex flex-col md:flex-row min-h-0 divide-y md:divide-y-0 md:divide-x divide-white/10">
        {/* Left Player Stage */}
        <div className="flex-1 p-6 flex flex-col items-center justify-between">
          <div className="w-full flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5 font-medium text-indigo-400">
              <Radio className="w-3.5 h-3.5 animate-pulse" /> Generative Audio Engine
            </span>
            <span>{currentTrack.genre}</span>
          </div>

          {/* Vinyl / Cover Art Animation */}
          <div className="relative my-4 flex items-center justify-center">
            <div
              className={`w-36 h-36 rounded-full bg-gradient-to-tr from-slate-900 via-indigo-950 to-purple-900 border-4 border-slate-800 shadow-2xl flex items-center justify-center transition-all ${
                isPlaying ? 'animate-spin' : ''
              }`}
              style={{ animationDuration: '6s' }}
            >
              <div className="w-12 h-12 rounded-full bg-indigo-600 border-2 border-white/20 flex items-center justify-center shadow-inner">
                <Music className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>

          {/* Track Info */}
          <div className="text-center">
            <h3 className="font-bold text-base text-white">{currentTrack.title}</h3>
            <p className="text-xs text-slate-400 mt-0.5">{currentTrack.artist}</p>
          </div>

          {/* Visualizer Canvas */}
          <div className="w-full max-w-sm h-20 my-2">
            <canvas ref={canvasRef} className="w-full h-full object-contain" />
          </div>

          {/* Scrubber */}
          <div className="w-full max-w-sm flex flex-col gap-1">
            <input
              type="range"
              min="0"
              max={currentTrack.duration}
              value={progress}
              onChange={(e) => setProgress(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>{formatTime(progress)}</span>
              <span>{formatTime(currentTrack.duration)}</span>
            </div>
          </div>

          {/* Playback Controls */}
          <div className="flex items-center gap-6 mt-2">
            <button
              onClick={handlePrev}
              className="p-2 rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
            >
              <SkipBack className="w-5 h-5" />
            </button>

            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-4 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white shadow-xl shadow-indigo-600/40 hover:scale-105 active:scale-95 transition-all"
            >
              {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current translate-x-0.5" />}
            </button>

            <button
              onClick={handleNext}
              className="p-2 rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
            >
              <SkipForward className="w-5 h-5" />
            </button>
          </div>

          {/* Volume Slider */}
          <div className="flex items-center gap-2 mt-4 max-w-xs w-full justify-center">
            <button onClick={() => setIsMuted(!isMuted)} className="text-slate-400 hover:text-white">
              {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <input
              type="range"
              min="0"
              max="100"
              value={isMuted ? 0 : volume}
              onChange={(e) => {
                setVolume(Number(e.target.value));
                setIsMuted(false);
              }}
              className="w-28 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
          </div>
        </div>

        {/* Right Playlist */}
        <div className="w-full md:w-64 bg-slate-900/30 p-4 flex flex-col gap-2 overflow-y-auto">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Soundtrack Queue
          </div>
          {TRACKS.map((t, idx) => {
            const isCurrent = idx === currentTrackIndex;
            return (
              <div
                key={t.id}
                onClick={() => {
                  setCurrentTrackIndex(idx);
                  setProgress(0);
                  setIsPlaying(true);
                }}
                className={`p-2.5 rounded-xl cursor-pointer transition-all flex items-center justify-between ${
                  isCurrent
                    ? 'bg-indigo-600/30 border border-indigo-500/40 text-white'
                    : 'hover:bg-white/5 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`p-1.5 rounded-lg ${isCurrent ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                    <Disc className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold truncate">{t.title}</div>
                    <div className="text-[10px] text-slate-400 truncate">{t.artist}</div>
                  </div>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">{formatTime(t.duration)}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
