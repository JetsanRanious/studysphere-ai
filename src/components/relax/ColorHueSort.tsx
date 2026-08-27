import React, { useState, useEffect } from 'react';
import { RotateCcw, Check, Sparkles, Trophy } from 'lucide-react';
import { Button } from '../common/Button';
import { audioChime } from '../../utils/audioChime';

interface Tile {
  id: number;
  hue: number;
  isFixed: boolean;
  color: string;
}

const NUM_TILES = 7;

export const ColorHueSort: React.FC = () => {
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [moves, setMoves] = useState(0);
  const [level, setLevel] = useState(1);

  const initGame = (lvl: number = 1) => {
    // Generate hue range based on level
    const baseHue = (lvl * 65) % 360;
    const hueSpan = 90;
    const newTiles: Tile[] = [];

    for (let i = 0; i < NUM_TILES; i++) {
      const hue = (baseHue + (i * hueSpan) / (NUM_TILES - 1)) % 360;
      newTiles.push({
        id: i,
        hue,
        isFixed: i === 0 || i === NUM_TILES - 1, // Endpoints are fixed references
        color: `hsl(${hue}, 80%, 55%)`,
      });
    }

    // Shuffle only middle swappable tiles
    const middleTiles = newTiles.slice(1, NUM_TILES - 1);
    const shuffled = [...middleTiles].sort(() => Math.random() - 0.5);

    const fullBoard = [
      newTiles[0],
      ...shuffled,
      newTiles[NUM_TILES - 1],
    ];

    setTiles(fullBoard);
    setSelectedIdx(null);
    setIsCompleted(false);
    setMoves(0);
  };

  useEffect(() => {
    initGame(level);
  }, [level]);

  const handleTileClick = (index: number) => {
    if (isCompleted || tiles[index].isFixed) return;

    if (selectedIdx === null) {
      setSelectedIdx(index);
    } else if (selectedIdx === index) {
      setSelectedIdx(null);
    } else {
      // Swap tiles
      const newTiles = [...tiles];
      const temp = newTiles[selectedIdx];
      newTiles[selectedIdx] = newTiles[index];
      newTiles[index] = temp;

      setTiles(newTiles);
      setSelectedIdx(null);
      setMoves((m) => m + 1);

      // Check win condition (all tiles must be in strictly ascending order by original id)
      const isWon = newTiles.every((t, i) => t.id === i);
      if (isWon) {
        setIsCompleted(true);
        audioChime.playPreset('complete');
      } else {
        audioChime.playPreset('bell');
      }
    }
  };

  const handleNextLevel = () => {
    setLevel((l) => l + 1);
  };

  return (
    <div className="flex flex-col items-center max-w-md mx-auto">
      <div className="flex items-center justify-between w-full mb-4 px-1">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
            Level {level}
          </span>
          <span className="text-xs text-slate-500">
            Moves: <strong className="text-slate-800">{moves}</strong>
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => initGame(level)}
          className="flex items-center space-x-1"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </Button>
      </div>

      <p className="text-xs text-slate-500 mb-4 text-center max-w-xs">
        Tap two unlocked color tiles to swap them until the gradient flows seamlessly.
      </p>

      {/* Tiles Display */}
      <div className="flex items-center justify-center space-x-1.5 w-full bg-slate-50 p-4 rounded-2xl border border-slate-200 shadow-inner">
        {tiles.map((tile, idx) => {
          const isSelected = selectedIdx === idx;
          return (
            <button
              key={`${tile.id}-${idx}`}
              onClick={() => handleTileClick(idx)}
              disabled={tile.isFixed || isCompleted}
              style={{ backgroundColor: tile.color }}
              className={`flex-1 h-28 rounded-xl relative transition-all duration-200 transform ${
                tile.isFixed
                  ? 'opacity-90 cursor-default ring-1 ring-slate-900/10'
                  : 'cursor-pointer hover:scale-105 active:scale-95 shadow-md'
              } ${
                isSelected
                  ? 'ring-4 ring-white shadow-xl scale-110 z-10'
                  : ''
              }`}
            >
              {tile.isFixed && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-black/30" />
                </div>
              )}
              {isSelected && (
                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow">
                  Swap
                </div>
              )}
            </button>
          );
        })}
      </div>

      {isCompleted && (
        <div className="mt-5 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-center w-full animate-in fade-in zoom-in-95">
          <div className="flex items-center justify-center space-x-1.5 text-emerald-800 font-bold text-sm mb-1">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>Harmonic Spectrum Solved!</span>
          </div>
          <p className="text-xs text-emerald-600 mb-3">Completed in {moves} moves</p>
          <Button onClick={handleNextLevel} className="w-full flex items-center justify-center space-x-2">
            <Check className="w-4 h-4" />
            <span>Next Spectrum Level</span>
          </Button>
        </div>
      )}
    </div>
  );
};
