import React, { useState, useEffect, useRef } from 'react';
import { Play, RotateCcw, Volume2, Trophy, Sparkles } from 'lucide-react';
import { Button } from '../common/Button';
import { audioChime } from '../../utils/audioChime';

const COLORS = [
  { id: 0, name: 'Emerald', bg: 'bg-emerald-500', activeBg: 'bg-emerald-300 shadow-emerald-400 shadow-xl scale-95', tone: 'focus' as const },
  { id: 1, name: 'Rose', bg: 'bg-rose-500', activeBg: 'bg-rose-300 shadow-rose-400 shadow-xl scale-95', tone: 'bell' as const },
  { id: 2, name: 'Amber', bg: 'bg-amber-500', activeBg: 'bg-amber-300 shadow-amber-400 shadow-xl scale-95', tone: 'break' as const },
  { id: 3, name: 'Blue', bg: 'bg-blue-600', activeBg: 'bg-blue-300 shadow-blue-400 shadow-xl scale-95', tone: 'complete' as const },
];

export const SimonSequence: React.FC = () => {
  const [sequence, setSequence] = useState<number[]>([]);
  const [userStep, setUserStep] = useState(0);
  const [activeColor, setActiveColor] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPlayback, setIsPlayback] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    return Number(localStorage.getItem('studysphere_simon_highscore') || 0);
  });
  const [isGameOver, setIsGameOver] = useState(false);

  const startNewGame = () => {
    setIsGameOver(false);
    setScore(0);
    setUserStep(0);
    const initialSeq = [Math.floor(Math.random() * 4)];
    setSequence(initialSeq);
    setIsPlaying(true);
    playSequence(initialSeq);
  };

  const playSequence = (seq: number[]) => {
    setIsPlayback(true);
    setUserStep(0);

    seq.forEach((colorIdx, i) => {
      setTimeout(() => {
        flashColor(colorIdx);
      }, (i + 1) * 600);
    });

    setTimeout(() => {
      setIsPlayback(false);
    }, (seq.length + 1) * 600);
  };

  const flashColor = (idx: number) => {
    setActiveColor(idx);
    audioChime.playPreset(COLORS[idx].tone);
    setTimeout(() => {
      setActiveColor(null);
    }, 350);
  };

  const handleColorClick = (idx: number) => {
    if (!isPlaying || isPlayback || isGameOver) return;

    flashColor(idx);

    if (idx === sequence[userStep]) {
      // Correct click
      if (userStep + 1 === sequence.length) {
        // Completed the whole sequence round!
        const nextScore = score + 1;
        setScore(nextScore);
        if (nextScore > highScore) {
          setHighScore(nextScore);
          localStorage.setItem('studysphere_simon_highscore', String(nextScore));
        }

        const nextSeq = [...sequence, Math.floor(Math.random() * 4)];
        setSequence(nextSeq);
        setTimeout(() => {
          playSequence(nextSeq);
        }, 800);
      } else {
        setUserStep((s) => s + 1);
      }
    } else {
      // Mistake -> Game Over
      setIsGameOver(true);
      setIsPlaying(false);
      audioChime.playPreset('break');
    }
  };

  return (
    <div className="flex flex-col items-center max-w-sm mx-auto">
      <div className="flex items-center justify-between w-full mb-3 px-2">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold text-slate-800 bg-slate-100 px-3 py-1.5 rounded-xl">
            Round: {sequence.length}
          </span>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200">
            Score: {score}
          </span>
        </div>
        <div className="flex items-center space-x-1 text-xs text-amber-600 bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200">
          <Trophy className="w-3.5 h-3.5" />
          <span>Best: {highScore}</span>
        </div>
      </div>

      <div className="relative p-4 bg-slate-900 rounded-3xl shadow-xl border border-slate-800 w-full aspect-square max-w-[280px] flex items-center justify-center">
        {/* 4 Quadrants */}
        <div className="grid grid-cols-2 gap-3 w-full h-full">
          {COLORS.map((c) => {
            const isActive = activeColor === c.id;
            return (
              <button
                key={c.id}
                onClick={() => handleColorClick(c.id)}
                disabled={isPlayback || !isPlaying || isGameOver}
                className={`rounded-2xl transition-all duration-150 transform ${c.bg} ${
                  isActive ? c.activeBg : 'opacity-80 hover:opacity-100 active:scale-95'
                } ${isPlayback ? 'cursor-default' : 'cursor-pointer'}`}
              />
            );
          })}
        </div>

        {/* Center Control Disc */}
        <div className="absolute w-20 h-20 bg-slate-950 border-4 border-slate-800 rounded-full flex flex-col items-center justify-center text-center shadow-lg pointer-events-none">
          {isPlayback ? (
            <span className="text-[10px] font-bold text-amber-400 animate-pulse">Listen...</span>
          ) : isPlaying ? (
            <span className="text-[10px] font-bold text-emerald-400">Your Turn!</span>
          ) : (
            <span className="text-[10px] font-bold text-slate-400">Simon</span>
          )}
        </div>
      </div>

      <div className="mt-5 w-full">
        {!isPlaying ? (
          <Button onClick={startNewGame} className="w-full flex items-center justify-center space-x-2">
            <Play className="w-4 h-4" />
            <span>{isGameOver ? 'Play Again' : 'Start Simon Sequence'}</span>
          </Button>
        ) : (
          <Button variant="outline" onClick={startNewGame} className="w-full flex items-center justify-center space-x-2">
            <RotateCcw className="w-4 h-4" />
            <span>Restart</span>
          </Button>
        )}
      </div>
    </div>
  );
};
