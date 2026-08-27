import React, { useState, useRef } from 'react';
import { Zap, Timer, Trophy, RotateCcw } from 'lucide-react';
import { audioChime } from '../../utils/audioChime';

type State = 'idle' | 'waiting' | 'ready' | 'result' | 'early';

export const ReactionTest: React.FC = () => {
  const [gameState, setGameState] = useState<State>('idle');
  const [reactionTime, setReactionTime] = useState<number | null>(null);
  const [bestTime, setBestTime] = useState<number | null>(() => {
    try {
      const stored = localStorage.getItem('studysphere_reaction_best');
      return stored ? Number(stored) : null;
    } catch {
      return null;
    }
  });
  const [history, setHistory] = useState<number[]>([]);

  const timeoutRef = useRef<any>(null);
  const startTimeRef = useRef<number>(0);

  const startTest = () => {
    setGameState('waiting');
    setReactionTime(null);

    const randomDelay = Math.floor(Math.random() * 2500) + 1500; // 1.5s - 4s
    timeoutRef.current = setTimeout(() => {
      setGameState('ready');
      startTimeRef.current = Date.now();
      audioChime.playGentleChime();
    }, randomDelay);
  };

  const handleClick = () => {
    if (gameState === 'idle') {
      startTest();
    } else if (gameState === 'waiting') {
      // Clicked too early!
      clearTimeout(timeoutRef.current);
      setGameState('early');
    } else if (gameState === 'ready') {
      const elapsed = Date.now() - startTimeRef.current;
      setReactionTime(elapsed);
      setGameState('result');
      setHistory((prev) => [elapsed, ...prev.slice(0, 4)]);

      if (!bestTime || elapsed < bestTime) {
        setBestTime(elapsed);
        try {
          localStorage.setItem('studysphere_reaction_best', String(elapsed));
        } catch {}
      }
    } else if (gameState === 'result' || gameState === 'early') {
      startTest();
    }
  };

  const getRank = (ms: number) => {
    if (ms < 200) return { title: '⚡ Godspeed Reflexes!', color: 'text-amber-500' };
    if (ms < 250) return { title: '🏎️ Lightning Fast!', color: 'text-emerald-600' };
    if (ms < 320) return { title: '🎯 Sharp Focus!', color: 'text-blue-600' };
    return { title: '☕ Relaxed & Calm', color: 'text-slate-600' };
  };

  return (
    <div className="flex flex-col items-center max-w-sm mx-auto space-y-4">
      {/* Header */}
      <div className="w-full flex items-center justify-between">
        <div>
          <h3 className="text-lg font-extrabold text-slate-800 flex items-center">
            <Zap className="w-4 h-4 text-amber-500 mr-1.5 fill-amber-400" />
            Reflex Sprint
          </h3>
          <p className="text-[11px] text-slate-400 font-medium">Test neuromuscular reaction speed</p>
        </div>

        {bestTime && (
          <div className="bg-amber-50 border border-amber-200 px-3 py-1 rounded-xl text-center">
            <span className="block text-[9px] font-bold text-amber-600 uppercase flex items-center justify-center">
              <Trophy className="w-2.5 h-2.5 mr-0.5" /> Record
            </span>
            <span className="text-xs font-black text-amber-900">{bestTime} ms</span>
          </div>
        )}
      </div>

      {/* Main Interactive Touch Card */}
      <div
        onClick={handleClick}
        className={`w-72 h-72 rounded-3xl flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-all duration-200 shadow-lg select-none ${
          gameState === 'idle'
            ? 'bg-gradient-to-tr from-blue-600 to-indigo-600 text-white hover:scale-[1.02]'
            : gameState === 'waiting'
            ? 'bg-rose-600 text-white animate-pulse'
            : gameState === 'ready'
            ? 'bg-emerald-500 text-white scale-105 ring-8 ring-emerald-300'
            : gameState === 'early'
            ? 'bg-amber-500 text-white'
            : 'bg-slate-900 text-white'
        }`}
      >
        {gameState === 'idle' && (
          <>
            <Timer className="w-12 h-12 mb-3 opacity-90" />
            <p className="text-lg font-extrabold">Click to Begin</p>
            <p className="text-xs opacity-75 mt-1">Wait for red to turn green, then click instantly!</p>
          </>
        )}

        {gameState === 'waiting' && (
          <>
            <div className="w-8 h-8 rounded-full bg-white/20 animate-ping mb-3" />
            <p className="text-xl font-black">HOLD ON...</p>
            <p className="text-xs opacity-75 mt-1">Wait for GREEN</p>
          </>
        )}

        {gameState === 'ready' && (
          <>
            <Zap className="w-14 h-14 mb-2 animate-bounce fill-white" />
            <p className="text-3xl font-black tracking-wider">CLICK NOW!</p>
          </>
        )}

        {gameState === 'early' && (
          <>
            <p className="text-2xl font-black mb-1">Too Soon! 🛑</p>
            <p className="text-xs opacity-90 mb-3">You clicked before it turned green.</p>
            <span className="text-[11px] bg-white/20 px-3 py-1 rounded-full font-bold">Click to retry</span>
          </>
        )}

        {gameState === 'result' && reactionTime && (
          <>
            <p className="text-4xl font-black font-mono tracking-tight">{reactionTime} <span className="text-lg font-bold">ms</span></p>
            <p className={`text-xs font-black mt-2 mb-3 px-3 py-1 bg-white/10 rounded-full ${getRank(reactionTime).color}`}>
              {getRank(reactionTime).title}
            </p>
            <span className="text-[11px] opacity-75 bg-white/10 px-3 py-1 rounded-full font-semibold">
              Click to try again
            </span>
          </>
        )}
      </div>

      {/* Recent Attempts History */}
      {history.length > 0 && (
        <div className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-2xl flex items-center justify-between text-xs">
          <span className="font-bold text-slate-500 text-[10px] uppercase tracking-wider">Recent:</span>
          <div className="flex items-center space-x-1.5">
            {history.map((time, i) => (
              <span key={i} className="px-2 py-0.5 rounded-lg bg-white border border-slate-200 text-slate-700 font-mono font-bold text-[11px]">
                {time}ms
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
