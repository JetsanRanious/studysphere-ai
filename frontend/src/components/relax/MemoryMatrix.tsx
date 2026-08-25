import React, { useState, useEffect } from 'react';
import { RotateCcw, Brain, Trophy } from 'lucide-react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { gameService } from '../../services/allServices';
import { useToast } from '../../contexts/ToastContext';

export const MemoryMatrix: React.FC = () => {
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [pattern, setPattern] = useState<number[]>([]);
  const [userSelected, setUserSelected] = useState<number[]>([]);
  const [isShowingPattern, setIsShowingPattern] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const { showToast } = useToast();

  const gridSize = 16;

  const startNextRound = (lvl: number) => {
    setUserSelected([]);
    const tileCount = Math.min(3 + lvl, 9);
    const newPattern: number[] = [];
    while (newPattern.length < tileCount) {
      const rand = Math.floor(Math.random() * gridSize);
      if (!newPattern.includes(rand)) newPattern.push(rand);
    }
    setPattern(newPattern);
    setIsShowingPattern(true);
    setGameStarted(true);

    setTimeout(() => {
      setIsShowingPattern(false);
    }, 1200 + lvl * 150);
  };

  const handleTileClick = (idx: number) => {
    if (isShowingPattern || !gameStarted) return;
    if (userSelected.includes(idx)) return;

    if (!pattern.includes(idx)) {
      showToast(`Game Over! Final Score: ${score}`, 'info');
      gameService.recordScore('memory-matrix', score * 10, 'normal', 'completed');
      setGameStarted(false);
      return;
    }

    const nextSelected = [...userSelected, idx];
    setUserSelected(nextSelected);

    if (nextSelected.length === pattern.length) {
      const nextScore = score + level * 20;
      setScore(nextScore);
      setLevel(l => l + 1);
      showToast(`Level ${level} Cleared! +${level * 20} pts 🎉`, 'success');
      setTimeout(() => startNextRound(level + 1), 600);
    }
  };

  return (
    <Card className="max-w-md mx-auto p-6 text-center">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-800 flex items-center">
            Memory Matrix <Brain className="w-4 h-4 ml-1.5 text-blue-500" />
          </h3>
          <p className="text-xs text-slate-500">Memorize and recall the highlighted pattern</p>
        </div>

        <div className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-xl">
          Level {level} • Score: {score}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2.5 w-64 h-64 mx-auto mb-6 bg-slate-100 p-2.5 rounded-2xl shadow-inner">
        {Array.from({ length: gridSize }).map((_, idx) => {
          const isPatternActive = isShowingPattern && pattern.includes(idx);
          const isSelected = userSelected.includes(idx);

          return (
            <button
              key={idx}
              onClick={() => handleTileClick(idx)}
              disabled={isShowingPattern || !gameStarted}
              className={`w-full h-full rounded-xl transition-all duration-200 ${
                isPatternActive
                  ? 'bg-blue-600 shadow-md scale-95'
                  : isSelected
                  ? 'bg-emerald-500 scale-95'
                  : 'bg-white hover:bg-blue-50/70 border border-slate-200'
              }`}
            />
          );
        })}
      </div>

      <div className="flex justify-center">
        {!gameStarted ? (
          <Button variant="primary" size="md" onClick={() => { setLevel(1); setScore(0); startNextRound(1); }}>
            Start Memory Challenge
          </Button>
        ) : (
          <p className="text-xs text-slate-500 font-semibold animate-pulse">
            {isShowingPattern ? '👀 Memorize the blue tiles...' : '👉 Tap the tiles you remembered!'}
          </p>
        )}
      </div>
    </Card>
  );
};
