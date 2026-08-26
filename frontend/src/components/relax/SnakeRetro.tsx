import React, { useEffect, useRef, useState } from 'react';
import { Play, RotateCcw, Volume2, VolumeX } from 'lucide-react';

const playSynth = (freq: number, type: OscillatorType, duration: number, vol = 0.1) => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (e) {
    // ignore
  }
};

export const SnakeRetro: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const gridSize = 20;
  const tileCount = 20; // 400x400 canvas

  const gameState = useRef({
    snake: [{ x: 10, y: 10 }],
    velocity: { x: 0, y: 0 },
    food: { x: 15, y: 15 },
    active: false,
    lastTick: 0,
    speed: 120 // ms per tick
  });

  const startGame = () => {
    gameState.current.snake = [{ x: 10, y: 10 }];
    gameState.current.velocity = { x: 1, y: 0 };
    gameState.current.food = { x: Math.floor(Math.random() * tileCount), y: Math.floor(Math.random() * tileCount) };
    gameState.current.active = true;
    gameState.current.speed = 120;
    setScore(0);
    setGameOver(false);
    setIsPlaying(true);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;

    const keyDownHandler = (e: KeyboardEvent) => {
      const v = gameState.current.velocity;
      if (e.key === 'ArrowUp' && v.y === 0) gameState.current.velocity = { x: 0, y: -1 };
      if (e.key === 'ArrowDown' && v.y === 0) gameState.current.velocity = { x: 0, y: 1 };
      if (e.key === 'ArrowLeft' && v.x === 0) gameState.current.velocity = { x: -1, y: 0 };
      if (e.key === 'ArrowRight' && v.x === 0) gameState.current.velocity = { x: 1, y: 0 };
    };

    window.addEventListener('keydown', keyDownHandler, false);

    const drawGrid = () => {
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = '#0f172a';
      for (let i = 0; i < tileCount; i++) {
        for (let j = 0; j < tileCount; j++) {
          ctx.strokeRect(i * gridSize, j * gridSize, gridSize, gridSize);
        }
      }
    };

    const loop = (timestamp: number) => {
      const state = gameState.current;
      if (!state.active) return;

      if (timestamp - state.lastTick > state.speed) {
        state.lastTick = timestamp;

        // Move snake
        const head = { x: state.snake[0].x + state.velocity.x, y: state.snake[0].y + state.velocity.y };
        
        // Wall collision
        if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
          state.active = false;
          setGameOver(true);
          setIsPlaying(false);
          if (soundEnabled) playSynth(100, 'sawtooth', 0.6, 0.3);
          return;
        }

        // Self collision
        for (let i = 0; i < state.snake.length; i++) {
          if (head.x === state.snake[i].x && head.y === state.snake[i].y) {
            state.active = false;
            setGameOver(true);
            setIsPlaying(false);
            if (soundEnabled) playSynth(100, 'sawtooth', 0.6, 0.3);
            return;
          }
        }

        state.snake.unshift(head);

        // Food collision
        if (head.x === state.food.x && head.y === state.food.y) {
          setScore(prev => prev + 10);
          state.speed = Math.max(50, state.speed - 2); // get faster
          state.food = { x: Math.floor(Math.random() * tileCount), y: Math.floor(Math.random() * tileCount) };
          if (soundEnabled) playSynth(600, 'square', 0.1, 0.2);
        } else {
          state.snake.pop();
        }

        // Draw
        drawGrid();

        // Draw Food (glowing)
        ctx.fillStyle = '#f43f5e';
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#f43f5e';
        ctx.beginPath();
        ctx.arc(state.food.x * gridSize + gridSize/2, state.food.y * gridSize + gridSize/2, gridSize/2 - 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Draw Snake
        for (let i = 0; i < state.snake.length; i++) {
          ctx.fillStyle = i === 0 ? '#10b981' : '#34d399';
          ctx.shadowBlur = i === 0 ? 10 : 0;
          ctx.shadowColor = '#10b981';
          ctx.fillRect(state.snake[i].x * gridSize + 1, state.snake[i].y * gridSize + 1, gridSize - 2, gridSize - 2);
        }
        ctx.shadowBlur = 0;
      }

      animationId = requestAnimationFrame(loop);
    };

    if (isPlaying) {
      animationId = requestAnimationFrame(loop);
    } else {
      drawGrid();
    }

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('keydown', keyDownHandler);
    };
  }, [isPlaying, gameOver, soundEnabled]);

  return (
    <div className="bg-[#020617] rounded-2xl p-6 border border-slate-800 shadow-2xl max-w-lg mx-auto flex flex-col items-center">
      <div className="flex justify-between w-full mb-4 items-center px-2">
        <h2 className="text-xl font-bold text-white tracking-widest uppercase">Retro Snake</h2>
        <div className="flex items-center space-x-4">
          <button onClick={() => setSoundEnabled(!soundEnabled)} className="text-slate-400 hover:text-white transition-colors">
            {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>
          <span className="text-emerald-400 font-mono font-bold text-lg">SCORE: {score}</span>
        </div>
      </div>
      
      <div className="relative">
        <canvas 
          ref={canvasRef} 
          width={400} 
          height={400} 
          className="bg-[#020617] rounded-xl shadow-[0_0_30px_rgba(16,185,129,0.1)] border border-slate-800"
        />
        
        {!isPlaying && (
          <div className="absolute inset-0 bg-[#020617]/80 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center">
            {gameOver && <h3 className="text-3xl font-black text-rose-500 mb-2 drop-shadow-[0_0_15px_rgba(244,63,94,0.8)]">CRASHED!</h3>}
            {gameOver && <p className="text-white font-mono mb-6">Final Score: {score}</p>}
            <button
              onClick={startGame}
              className="bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-3 px-8 rounded-full shadow-[0_0_20px_rgba(16,185,129,0.5)] transition-all transform hover:scale-105 flex items-center"
            >
              {gameOver ? <RotateCcw className="w-5 h-5 mr-2" /> : <Play className="w-5 h-5 mr-2" />}
              {gameOver ? 'PLAY AGAIN' : 'START GAME'}
            </button>
            <p className="text-slate-400 text-xs mt-4 uppercase tracking-widest font-semibold">Use Arrow Keys</p>
          </div>
        )}
      </div>
    </div>
  );
};
