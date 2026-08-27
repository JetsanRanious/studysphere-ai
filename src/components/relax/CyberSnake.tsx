import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, RotateCcw, Trophy, Volume2, VolumeX, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '../common/Button';
import { audioChime } from '../../utils/audioChime';

const GRID_SIZE = 20;
const INITIAL_SNAKE = [
  { x: 10, y: 10 },
  { x: 10, y: 11 },
  { x: 10, y: 12 },
];
const INITIAL_DIRECTION = { x: 0, y: -1 };

export const CyberSnake: React.FC = () => {
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [food, setFood] = useState({ x: 5, y: 5 });
  const [direction, setDirection] = useState(INITIAL_DIRECTION);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    return Number(localStorage.getItem('studysphere_snake_highscore') || 0);
  });
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(110);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const directionRef = useRef(direction);
  directionRef.current = direction;

  const generateFood = useCallback((currentSnake: Array<{ x: number; y: number }>) => {
    let newFood: { x: number; y: number };
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      if (!currentSnake.some((segment) => segment.x === newFood.x && segment.y === newFood.y)) {
        break;
      }
    }
    return newFood;
  }, []);

  const startGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection({ x: 0, y: -1 });
    directionRef.current = { x: 0, y: -1 };
    setScore(0);
    setIsGameOver(false);
    setIsPlaying(true);
    setFood(generateFood(INITIAL_SNAKE));
    if (soundEnabled) audioChime.playPreset('focus');
  };

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isPlaying || isGameOver) return;
      const current = directionRef.current;
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          if (current.y === 0) setDirection({ x: 0, y: -1 });
          e.preventDefault();
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          if (current.y === 0) setDirection({ x: 0, y: 1 });
          e.preventDefault();
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          if (current.x === 0) setDirection({ x: -1, y: 0 });
          e.preventDefault();
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          if (current.x === 0) setDirection({ x: 1, y: 0 });
          e.preventDefault();
          break;
      }
    },
    [isPlaying, isGameOver]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (!isPlaying || isGameOver) return;

    const interval = setInterval(() => {
      setSnake((prevSnake) => {
        const head = prevSnake[0];
        const newHead = {
          x: head.x + directionRef.current.x,
          y: head.y + directionRef.current.y,
        };

        // Wall collision check
        if (
          newHead.x < 0 ||
          newHead.x >= GRID_SIZE ||
          newHead.y < 0 ||
          newHead.y >= GRID_SIZE
        ) {
          setIsGameOver(true);
          setIsPlaying(false);
          if (soundEnabled) audioChime.playPreset('break');
          return prevSnake;
        }

        // Self collision check
        if (prevSnake.some((segment) => segment.x === newHead.x && segment.y === newHead.y)) {
          setIsGameOver(true);
          setIsPlaying(false);
          if (soundEnabled) audioChime.playPreset('break');
          return prevSnake;
        }

        // Food eaten check
        if (newHead.x === food.x && newHead.y === food.y) {
          const newScore = score + 10;
          setScore(newScore);
          if (newScore > highScore) {
            setHighScore(newScore);
            localStorage.setItem('studysphere_snake_highscore', String(newScore));
          }
          if (soundEnabled) audioChime.playPreset('complete');
          setFood(generateFood([newHead, ...prevSnake]));
          return [newHead, ...prevSnake];
        }

        return [newHead, ...prevSnake.slice(0, -1)];
      });
    }, speed);

    return () => clearInterval(interval);
  }, [isPlaying, isGameOver, food, score, highScore, speed, soundEnabled, generateFood]);

  return (
    <div className="flex flex-col items-center max-w-md mx-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between w-full mb-3 px-2">
        <div className="flex items-center space-x-3">
          <div className="bg-slate-900 text-emerald-400 font-mono text-sm px-3 py-1.5 rounded-xl border border-emerald-500/30">
            Score: <span className="font-bold">{score}</span>
          </div>
          <div className="flex items-center space-x-1 text-xs text-amber-600 bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200">
            <Trophy className="w-3.5 h-3.5" />
            <span>Best: {highScore}</span>
          </div>
        </div>
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100"
          title="Toggle Sound"
        >
          {soundEnabled ? <Volume2 className="w-4 h-4 text-blue-600" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
        </button>
      </div>

      {/* Game Canvas Container */}
      <div className="relative bg-slate-950 p-2 rounded-2xl shadow-inner border border-slate-800 w-full aspect-square max-w-[340px]">
        <div
          className="grid w-full h-full gap-0.5 rounded-xl overflow-hidden bg-slate-900"
          style={{
            gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
          }}
        >
          {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, idx) => {
            const x = idx % GRID_SIZE;
            const y = Math.floor(idx / GRID_SIZE);
            const isHead = snake[0]?.x === x && snake[0]?.y === y;
            const isSnake = snake.some((s) => s.x === x && s.y === y);
            const isFood = food.x === x && food.y === y;

            return (
              <div
                key={idx}
                className={`rounded-[2px] transition-colors duration-75 ${
                  isHead
                    ? 'bg-emerald-400 shadow-sm shadow-emerald-400'
                    : isSnake
                    ? 'bg-emerald-600/80'
                    : isFood
                    ? 'bg-rose-500 rounded-full animate-pulse shadow-sm shadow-rose-500'
                    : 'bg-slate-950/40'
                }`}
              />
            );
          })}
        </div>

        {/* Overlay when game over or not started */}
        {(!isPlaying || isGameOver) && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs rounded-2xl flex flex-col items-center justify-center p-4 text-center">
            {isGameOver ? (
              <>
                <p className="text-rose-400 font-bold text-lg mb-1">Game Over!</p>
                <p className="text-xs text-slate-300 mb-4">Final Score: {score} pts</p>
                <Button onClick={startGame} className="flex items-center space-x-1.5 shadow-lg">
                  <RotateCcw className="w-4 h-4" />
                  <span>Try Again</span>
                </Button>
              </>
            ) : (
              <>
                <p className="text-white font-bold text-base mb-1">Cyber Snake</p>
                <p className="text-xs text-slate-400 mb-4 max-w-[200px]">
                  Use Arrow keys or WASD to navigate and collect cyber nodes.
                </p>
                <Button onClick={startGame} className="flex items-center space-x-1.5 shadow-lg">
                  <Play className="w-4 h-4" />
                  <span>Start Game</span>
                </Button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Mobile / Touch Direction Controls */}
      <div className="mt-4 flex flex-col items-center sm:hidden">
        <button
          onClick={() => {
            if (directionRef.current.y === 0) setDirection({ x: 0, y: -1 });
          }}
          className="p-3 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 rounded-xl mb-1 text-slate-700 shadow-xs"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
        <div className="flex space-x-4">
          <button
            onClick={() => {
              if (directionRef.current.x === 0) setDirection({ x: -1, y: 0 });
            }}
            className="p-3 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 rounded-xl text-slate-700 shadow-xs"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => {
              if (directionRef.current.y === 0) setDirection({ x: 0, y: 1 });
            }}
            className="p-3 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 rounded-xl text-slate-700 shadow-xs"
          >
            <ArrowDown className="w-5 h-5" />
          </button>
          <button
            onClick={() => {
              if (directionRef.current.x === 0) setDirection({ x: 1, y: 0 });
            }}
            className="p-3 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 rounded-xl text-slate-700 shadow-xs"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
