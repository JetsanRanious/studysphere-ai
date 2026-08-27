import React, { useState, useEffect } from 'react';
import { RotateCcw, Brain, CheckCircle2, Trophy } from 'lucide-react';
import { Button } from '../common/Button';
import { audioChime } from '../../utils/audioChime';

interface CardItem {
  id: number;
  emoji: string;
  matched: boolean;
}

const EMOJI_SET = ['🚀', '💡', '⚛️', '⚡', '📚', '🎨', '🧬', '🌌'];

export const MemoryMatch: React.FC = () => {
  const [cards, setCards] = useState<CardItem[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [moves, setMoves] = useState<number>(0);
  const [matchedCount, setMatchedCount] = useState<number>(0);
  const [isLocked, setIsLocked] = useState<boolean>(false);

  const initGame = () => {
    const duplicated = [...EMOJI_SET, ...EMOJI_SET];
    const shuffled = duplicated
      .sort(() => Math.random() - 0.5)
      .map((emoji, index) => ({
        id: index,
        emoji,
        matched: false,
      }));
    setCards(shuffled);
    setFlippedIndices([]);
    setMoves(0);
    setMatchedCount(0);
    setIsLocked(false);
  };

  useEffect(() => {
    initGame();
  }, []);

  const handleCardClick = (index: number) => {
    if (isLocked) return;
    if (flippedIndices.includes(index) || cards[index].matched) return;

    audioChime.playGentleChime();
    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    if (newFlipped.length === 2) {
      setMoves((prev) => prev + 1);
      const [firstIdx, secondIdx] = newFlipped;
      if (cards[firstIdx].emoji === cards[secondIdx].emoji) {
        // Match found!
        setTimeout(() => {
          setCards((prev) =>
            prev.map((card, i) =>
              i === firstIdx || i === secondIdx ? { ...card, matched: true } : card
            )
          );
          setFlippedIndices([]);
          setMatchedCount((prev) => {
            const nextCount = prev + 1;
            if (nextCount === EMOJI_SET.length) {
              audioChime.playSessionCompleteChime();
            }
            return nextCount;
          });
        }, 300);
      } else {
        // Not matched, flip back after brief pause
        setIsLocked(true);
        setTimeout(() => {
          setFlippedIndices([]);
          setIsLocked(false);
        }, 800);
      }
    }
  };

  const isWon = matchedCount === EMOJI_SET.length;

  return (
    <div className="flex flex-col items-center max-w-sm mx-auto space-y-4">
      {/* Header */}
      <div className="w-full flex items-center justify-between">
        <div>
          <h3 className="text-lg font-extrabold text-slate-800 flex items-center">
            <Brain className="w-4 h-4 text-purple-600 mr-1.5" />
            Memory Flash
          </h3>
          <p className="text-[11px] text-slate-400 font-medium">Match 8 study symbol pairs</p>
        </div>

        <div className="flex items-center space-x-2">
          <div className="bg-purple-50 border border-purple-200 px-3 py-1 rounded-xl text-center">
            <span className="block text-[9px] font-bold text-purple-600 uppercase">Moves</span>
            <span className="text-xs font-black text-purple-900">{moves}</span>
          </div>
          <div className="bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-xl text-center">
            <span className="block text-[9px] font-bold text-emerald-600 uppercase">Pairs</span>
            <span className="text-xs font-black text-emerald-900">{matchedCount}/8</span>
          </div>
          <button
            onClick={initGame}
            title="Reset Cards"
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 4x4 Card Grid */}
      <div className="grid grid-cols-4 gap-2.5 w-64 h-64 sm:w-72 sm:h-72 p-3 bg-slate-100 rounded-3xl border border-slate-200 shadow-inner">
        {cards.map((card, idx) => {
          const isFlipped = flippedIndices.includes(idx) || card.matched;
          return (
            <button
              key={card.id}
              onClick={() => handleCardClick(idx)}
              className={`rounded-2xl flex items-center justify-center text-2xl transition-all duration-200 cursor-pointer shadow-xs ${
                card.matched
                  ? 'bg-emerald-100 border-2 border-emerald-300 scale-95 opacity-85'
                  : isFlipped
                  ? 'bg-white border-2 border-purple-400 shadow-md scale-100 ring-2 ring-purple-100'
                  : 'bg-gradient-to-br from-indigo-500 to-purple-600 hover:opacity-90 active:scale-95 text-transparent'
              }`}
            >
              {isFlipped ? card.emoji : '✨'}
            </button>
          );
        })}
      </div>

      {/* Win Banner */}
      {isWon && (
        <div className="w-full p-3 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs text-emerald-900 animate-in zoom-in-95">
          <div className="flex items-center space-x-2">
            <Trophy className="w-4 h-4 text-emerald-600" />
            <span className="font-bold">Victory! Solved in {moves} moves.</span>
          </div>
          <Button size="sm" variant="primary" onClick={initGame} className="!bg-emerald-600 !py-1 !text-xs">
            Play Again
          </Button>
        </div>
      )}
    </div>
  );
};
