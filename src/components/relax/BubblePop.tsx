import React, { useState } from 'react';
import { Sparkles, RotateCcw, Heart, Flame } from 'lucide-react';
import { audioChime } from '../../utils/audioChime';

const BUBBLE_COUNT = 36; // 6x6 grid

export const BubblePop: React.FC = () => {
  const [popped, setPopped] = useState<boolean[]>(() => Array(BUBBLE_COUNT).fill(false));
  const [popCount, setPopCount] = useState<number>(0);
  const [stressRelieved, setStressRelieved] = useState<number>(0);

  const handlePop = (index: number) => {
    if (popped[index]) return;

    audioChime.playGentleChime();
    const updated = [...popped];
    updated[index] = true;
    setPopped(updated);
    setPopCount((prev) => prev + 1);
    setStressRelieved((prev) => prev + 3);

    // If all popped, auto refresh after brief pause with a chime
    if (updated.every((p) => p)) {
      setTimeout(() => {
        audioChime.playSessionCompleteChime();
        setPopped(Array(BUBBLE_COUNT).fill(false));
      }, 400);
    }
  };

  const handleReset = () => {
    setPopped(Array(BUBBLE_COUNT).fill(false));
  };

  return (
    <div className="flex flex-col items-center max-w-sm mx-auto space-y-4">
      {/* Header */}
      <div className="w-full flex items-center justify-between">
        <div>
          <h3 className="text-lg font-extrabold text-slate-800 flex items-center">
            <Sparkles className="w-4 h-4 text-sky-500 mr-1.5" />
            Zen Bubble Wrap
          </h3>
          <p className="text-[11px] text-slate-400 font-medium">Click to pop bubbles & de-stress</p>
        </div>

        <div className="flex items-center space-x-2">
          <div className="bg-sky-50 border border-sky-200 px-3 py-1 rounded-xl text-center">
            <span className="block text-[9px] font-bold text-sky-600 uppercase">Popped</span>
            <span className="text-xs font-black text-sky-900">{popCount}</span>
          </div>
          <button
            onClick={handleReset}
            title="Unpop All"
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Bubble Grid */}
      <div className="p-4 bg-gradient-to-br from-sky-100 via-blue-50 to-indigo-100 rounded-3xl border-2 border-sky-200 shadow-inner w-72 h-72 flex items-center justify-center">
        <div className="grid grid-cols-6 gap-2 w-full h-full p-1">
          {popped.map((isPopped, idx) => (
            <button
              key={idx}
              onClick={() => handlePop(idx)}
              className={`rounded-full transition-all duration-150 transform cursor-pointer flex items-center justify-center ${
                isPopped
                  ? 'bg-sky-200/60 border-2 border-dashed border-sky-300 scale-90 shadow-none ring-0 opacity-60'
                  : 'bg-gradient-to-tr from-sky-400 via-blue-400 to-indigo-300 border-2 border-white shadow-md shadow-sky-400/40 hover:scale-105 active:scale-75'
              }`}
            >
              {!isPopped && (
                <div className="w-2 h-2 bg-white/70 rounded-full -mt-2 -ml-2 blur-[0.5px]" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Stress Meter */}
      <div className="w-full bg-slate-50 border border-slate-200 p-3 rounded-2xl flex items-center justify-between text-xs">
        <div className="flex items-center space-x-2">
          <Heart className="w-4 h-4 text-rose-500 fill-rose-400" />
          <span className="font-semibold text-slate-700">Stress Relieved:</span>
        </div>
        <span className="font-bold text-emerald-600">+{stressRelieved}% Serenity</span>
      </div>
    </div>
  );
};
