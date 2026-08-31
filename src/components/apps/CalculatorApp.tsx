import React, { useState } from 'react';
import { Delete, History, RotateCcw } from 'lucide-react';

export const CalculatorApp: React.FC = () => {
  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [mode, setMode] = useState<'standard' | 'scientific'>('standard');

  const handleNumber = (n: string) => {
    if (display === '0' || display === 'Error') {
      setDisplay(n);
    } else {
      setDisplay(prev => prev + n);
    }
  };

  const handleOperator = (op: string) => {
    setEquation(`${display} ${op}`);
    setDisplay('0');
  };

  const handleClear = () => {
    setDisplay('0');
    setEquation('');
  };

  const handleDelete = () => {
    if (display.length > 1) {
      setDisplay(prev => prev.slice(0, -1));
    } else {
      setDisplay('0');
    }
  };

  const handleCalculate = () => {
    try {
      const fullExpr = `${equation} ${display}`.replace('×', '*').replace('÷', '/');
      // eslint-disable-next-line no-eval
      const res = Function(`'use strict'; return (${fullExpr})`)();
      const formatted = Number.isFinite(res) ? Number(res.toFixed(8)).toString() : 'Error';
      setHistory(prev => [`${equation} ${display} = ${formatted}`, ...prev.slice(0, 10)]);
      setDisplay(formatted);
      setEquation('');
    } catch {
      setDisplay('Error');
    }
  };

  const handleScientific = (func: string) => {
    try {
      const val = parseFloat(display);
      let res = 0;
      if (func === 'sin') res = Math.sin(val);
      if (func === 'cos') res = Math.cos(val);
      if (func === 'tan') res = Math.tan(val);
      if (func === 'sqrt') res = Math.sqrt(val);
      if (func === 'sq') res = Math.pow(val, 2);
      if (func === 'log') res = Math.log10(val);
      if (func === 'ln') res = Math.log(val);
      if (func === 'pi') res = Math.PI;

      const formatted = Number.isFinite(res) ? Number(res.toFixed(8)).toString() : 'Error';
      setDisplay(formatted);
    } catch {
      setDisplay('Error');
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 text-white select-none p-4 font-sans">
      {/* Header controls */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex bg-slate-900 rounded-lg p-0.5 border border-white/10 text-xs">
          <button
            onClick={() => setMode('standard')}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              mode === 'standard' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Standard
          </button>
          <button
            onClick={() => setMode('scientific')}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              mode === 'scientific' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Scientific
          </button>
        </div>

        <button
          onClick={() => setShowHistory(!showHistory)}
          className={`p-1.5 rounded-lg border border-white/10 transition-colors ${
            showHistory ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
          title="History"
        >
          <History className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Screen Display */}
      <div className="bg-slate-900/90 rounded-2xl p-4 border border-white/10 mb-4 flex flex-col items-end justify-end h-28 shadow-inner">
        <div className="text-xs text-indigo-400 font-mono h-5 overflow-hidden truncate max-w-full">
          {equation}
        </div>
        <div className="text-3xl font-bold font-mono tracking-tight text-white overflow-hidden truncate max-w-full">
          {display}
        </div>
      </div>

      {showHistory ? (
        <div className="flex-1 overflow-y-auto bg-slate-900/60 rounded-xl p-3 border border-white/10 text-xs flex flex-col gap-2">
          <div className="font-semibold text-slate-400 uppercase tracking-wider text-[10px]">Calculation History</div>
          {history.length === 0 ? (
            <div className="text-slate-400 italic py-4 text-center">No history yet</div>
          ) : (
            history.map((h, i) => (
              <div key={i} className="p-2 rounded-lg bg-slate-950 font-mono text-slate-200 border border-white/5">
                {h}
              </div>
            ))
          )}
        </div>
      ) : (
        /* Keypad */
        <div className="flex-1 grid grid-cols-4 gap-2">
          {mode === 'scientific' && (
            <>
              <button onClick={() => handleScientific('sin')} className="btn-sci">sin</button>
              <button onClick={() => handleScientific('cos')} className="btn-sci">cos</button>
              <button onClick={() => handleScientific('tan')} className="btn-sci">tan</button>
              <button onClick={() => handleScientific('sqrt')} className="btn-sci">√</button>
              <button onClick={() => handleScientific('sq')} className="btn-sci">x²</button>
              <button onClick={() => handleScientific('log')} className="btn-sci">log</button>
              <button onClick={() => handleScientific('ln')} className="btn-sci">ln</button>
              <button onClick={() => handleScientific('pi')} className="btn-sci">π</button>
            </>
          )}

          <button onClick={handleClear} className="btn-op text-rose-400">C</button>
          <button onClick={handleDelete} className="btn-op"><Delete className="w-4 h-4 mx-auto" /></button>
          <button onClick={() => handleOperator('%')} className="btn-op">%</button>
          <button onClick={() => handleOperator('÷')} className="btn-op text-indigo-400">÷</button>

          <button onClick={() => handleNumber('7')} className="btn-num">7</button>
          <button onClick={() => handleNumber('8')} className="btn-num">8</button>
          <button onClick={() => handleNumber('9')} className="btn-num">9</button>
          <button onClick={() => handleOperator('×')} className="btn-op text-indigo-400">×</button>

          <button onClick={() => handleNumber('4')} className="btn-num">4</button>
          <button onClick={() => handleNumber('5')} className="btn-num">5</button>
          <button onClick={() => handleNumber('6')} className="btn-num">6</button>
          <button onClick={() => handleOperator('-')} className="btn-op text-indigo-400">-</button>

          <button onClick={() => handleNumber('1')} className="btn-num">1</button>
          <button onClick={() => handleNumber('2')} className="btn-num">2</button>
          <button onClick={() => handleNumber('3')} className="btn-num">3</button>
          <button onClick={() => handleOperator('+')} className="btn-op text-indigo-400">+</button>

          <button onClick={() => handleNumber('0')} className="btn-num col-span-2">0</button>
          <button onClick={() => handleNumber('.')} className="btn-num">.</button>
          <button onClick={handleCalculate} className="btn-equals">=</button>
        </div>
      )}
    </div>
  );
};
