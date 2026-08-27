import React, { useState, useEffect, useRef } from 'react';
import { Wind, Play, Pause, RotateCcw, Heart, Sparkles } from 'lucide-react';
import { Button } from '../common/Button';
import { audioChime } from '../../utils/audioChime';

type Phase = 'inhale' | 'hold' | 'exhale';

export const BreathingRing: React.FC = () => {
  const [isActive, setIsActive] = useState<boolean>(false);
  const [phase, setPhase] = useState<Phase>('inhale');
  const [timer, setTimer] = useState<number>(4);
  const [cycleCount, setCycleCount] = useState<number>(0);

  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (!isActive) return;

    timerRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev > 1) return prev - 1;

        // Transition to next phase
        audioChime.playGentleChime();
        if (phase === 'inhale') {
          setPhase('hold');
          return 7;
        } else if (phase === 'hold') {
          setPhase('exhale');
          return 8;
        } else {
          setPhase('inhale');
          setCycleCount((c) => c + 1);
          return 4;
        }
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [isActive, phase]);

  const toggleBreathing = () => {
    if (!isActive) {
      setIsActive(true);
      setPhase('inhale');
      setTimer(4);
      audioChime.playGentleChime();
    } else {
      setIsActive(false);
      clearInterval(timerRef.current);
    }
  };

  const resetBreathing = () => {
    setIsActive(false);
    clearInterval(timerRef.current);
    setPhase('inhale');
    setTimer(4);
    setCycleCount(0);
  };

  const getPhaseColor = () => {
    switch (phase) {
      case 'inhale':
        return 'from-sky-400 to-blue-600 scale-110';
      case 'hold':
        return 'from-amber-400 to-orange-500 scale-110';
      case 'exhale':
        return 'from-emerald-400 to-teal-600 scale-90';
    }
  };

  return (
    <div className="flex flex-col items-center max-w-sm mx-auto space-y-4">
      {/* Header */}
      <div className="w-full flex items-center justify-between">
        <div>
          <h3 className="text-lg font-extrabold text-slate-800 flex items-center">
            <Wind className="w-4 h-4 text-sky-500 mr-1.5" />
            4-7-8 Deep Breathing
          </h3>
          <p className="text-[11px] text-slate-400 font-medium">Calms nervous system & restores focus</p>
        </div>

        <div className="flex items-center space-x-2">
          <div className="bg-sky-50 border border-sky-200 px-3 py-1 rounded-xl text-center">
            <span className="block text-[9px] font-bold text-sky-600 uppercase">Cycles</span>
            <span className="text-xs font-black text-sky-900">{cycleCount}</span>
          </div>
          <button
            onClick={resetBreathing}
            title="Reset"
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Dynamic Animated Pulse Sphere */}
      <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center">
        {/* Outer ambient wave rings */}
        <div
          className={`absolute inset-4 rounded-full border-4 border-dashed transition-all duration-1000 ${
            isActive ? 'border-sky-300/60 animate-spin-slow scale-105' : 'border-slate-200'
          }`}
        />

        {/* Pulsing Core */}
        <div
          className={`w-44 h-44 rounded-full bg-gradient-to-tr transition-all duration-1000 flex flex-col items-center justify-center text-white shadow-xl ${
            isActive ? getPhaseColor() : 'from-slate-200 to-slate-300 text-slate-500'
          }`}
        >
          {isActive ? (
            <>
              <span className="text-xs font-bold uppercase tracking-widest opacity-90">
                {phase === 'inhale' ? 'Inhale 🌬️' : phase === 'hold' ? 'Hold 🧘' : 'Exhale 🍃'}
              </span>
              <span className="text-4xl font-black font-mono mt-1">{timer}</span>
            </>
          ) : (
            <>
              <Wind className="w-8 h-8 opacity-60 mb-1" />
              <span className="text-xs font-bold">Ready</span>
            </>
          )}
        </div>
      </div>

      {/* Control Buttons */}
      <div className="w-full flex space-x-2">
        <Button
          type="button"
          variant="primary"
          size="lg"
          onClick={toggleBreathing}
          className={`flex-1 !font-bold ${isActive ? '!bg-amber-600 hover:!bg-amber-700' : '!bg-sky-600 hover:!bg-sky-700'}`}
        >
          {isActive ? (
            <>
              <Pause className="w-4 h-4 mr-1.5" /> Pause Exercise
            </>
          ) : (
            <>
              <Play className="w-4 h-4 mr-1.5" /> Start Guided Breath
            </>
          )}
        </Button>
      </div>

      {/* Technique Guide Card */}
      <div className="w-full bg-slate-50 border border-slate-200 p-3 rounded-2xl text-[11px] text-slate-500 space-y-1">
        <div className="flex items-center space-x-1.5 font-bold text-slate-700">
          <Sparkles className="w-3.5 h-3.5 text-sky-500" />
          <span>The 4-7-8 Method</span>
        </div>
        <p className="leading-relaxed">
          Inhale quietly through nose (4s), hold breath (7s), exhale completely through mouth (8s). Recommended: 4 cycles between study blocks.
        </p>
      </div>
    </div>
  );
};
