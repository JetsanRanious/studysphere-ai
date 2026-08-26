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
    // ignore audio errors
  }
};

export const NeonBreakout: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Game state refs (to avoid stale closures in requestAnimationFrame)
  const gameState = useRef({
    x: 300, y: 350, dx: 4, dy: -4,
    paddleX: 250, paddleWidth: 100, paddleHeight: 10,
    ballRadius: 6,
    rightPressed: false, leftPressed: false,
    bricks: [] as any[],
    brickRowCount: 5, brickColumnCount: 7,
    brickWidth: 70, brickHeight: 20, brickPadding: 10, brickOffsetTop: 40, brickOffsetLeft: 25,
    score: 0,
    active: false,
  });

  const initBricks = () => {
    const state = gameState.current;
    state.bricks = [];
    for (let c = 0; c < state.brickColumnCount; c++) {
      state.bricks[c] = [];
      for (let r = 0; r < state.brickRowCount; r++) {
        // give each row a nice neon color
        const colors = ['#f43f5e', '#ec4899', '#a855f7', '#3b82f6', '#06b6d4'];
        state.bricks[c][r] = { x: 0, y: 0, status: 1, color: colors[r % colors.length] };
      }
    }
  };

  const startGame = () => {
    initBricks();
    gameState.current.score = 0;
    gameState.current.x = 300;
    gameState.current.y = 350;
    gameState.current.dx = 4;
    gameState.current.dy = -4;
    gameState.current.paddleX = 250;
    gameState.current.active = true;
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
      if (e.key === 'Right' || e.key === 'ArrowRight') gameState.current.rightPressed = true;
      else if (e.key === 'Left' || e.key === 'ArrowLeft') gameState.current.leftPressed = true;
    };
    const keyUpHandler = (e: KeyboardEvent) => {
      if (e.key === 'Right' || e.key === 'ArrowRight') gameState.current.rightPressed = false;
      else if (e.key === 'Left' || e.key === 'ArrowLeft') gameState.current.leftPressed = false;
    };
    const mouseMoveHandler = (e: MouseEvent) => {
      const relativeX = e.clientX - canvas.getBoundingClientRect().left;
      if (relativeX > 0 && relativeX < canvas.width) {
        gameState.current.paddleX = relativeX - gameState.current.paddleWidth / 2;
      }
    };

    window.addEventListener('keydown', keyDownHandler, false);
    window.addEventListener('keyup', keyUpHandler, false);
    canvas.addEventListener('mousemove', mouseMoveHandler, false);

    const drawBall = () => {
      ctx.beginPath();
      ctx.arc(gameState.current.x, gameState.current.y, gameState.current.ballRadius, 0, Math.PI * 2);
      ctx.fillStyle = '#fff';
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#fff';
      ctx.fill();
      ctx.closePath();
      ctx.shadowBlur = 0; // reset
    };

    const drawPaddle = () => {
      ctx.beginPath();
      ctx.rect(gameState.current.paddleX, canvas.height - gameState.current.paddleHeight - 10, gameState.current.paddleWidth, gameState.current.paddleHeight);
      ctx.fillStyle = '#3b82f6';
      ctx.shadowBlur = 20;
      ctx.shadowColor = '#3b82f6';
      ctx.fill();
      ctx.closePath();
      ctx.shadowBlur = 0;
    };

    const drawBricks = () => {
      const s = gameState.current;
      for (let c = 0; c < s.brickColumnCount; c++) {
        for (let r = 0; r < s.brickRowCount; r++) {
          if (s.bricks[c][r].status === 1) {
            const brickX = c * (s.brickWidth + s.brickPadding) + s.brickOffsetLeft;
            const brickY = r * (s.brickHeight + s.brickPadding) + s.brickOffsetTop;
            s.bricks[c][r].x = brickX;
            s.bricks[c][r].y = brickY;
            ctx.beginPath();
            ctx.rect(brickX, brickY, s.brickWidth, s.brickHeight);
            ctx.fillStyle = s.bricks[c][r].color;
            ctx.shadowBlur = 10;
            ctx.shadowColor = s.bricks[c][r].color;
            ctx.fill();
            ctx.closePath();
          }
        }
      }
      ctx.shadowBlur = 0;
    };

    const collisionDetection = () => {
      const s = gameState.current;
      for (let c = 0; c < s.brickColumnCount; c++) {
        for (let r = 0; r < s.brickRowCount; r++) {
          const b = s.bricks[c][r];
          if (b.status === 1) {
            if (s.x > b.x && s.x < b.x + s.brickWidth && s.y > b.y && s.y < b.y + s.brickHeight) {
              s.dy = -s.dy;
              b.status = 0;
              s.score += 10;
              setScore(s.score);
              if (soundEnabled) playSynth(800 + r * 100, 'sine', 0.1);
              
              if (s.score === s.brickRowCount * s.brickColumnCount * 10) {
                if (soundEnabled) playSynth(1200, 'square', 0.5);
                s.active = false;
                setGameOver(true);
                setIsPlaying(false);
              }
            }
          }
        }
      }
    };

    const draw = () => {
      if (!gameState.current.active) return;
      
      // dark background with slight trail effect
      ctx.fillStyle = 'rgba(15, 23, 42, 0.3)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      drawBricks();
      drawBall();
      drawPaddle();
      collisionDetection();

      const s = gameState.current;
      
      // Wall collision
      if (s.x + s.dx > canvas.width - s.ballRadius || s.x + s.dx < s.ballRadius) {
        s.dx = -s.dx;
        if (soundEnabled) playSynth(400, 'square', 0.1);
      }
      if (s.y + s.dy < s.ballRadius) {
        s.dy = -s.dy;
        if (soundEnabled) playSynth(400, 'square', 0.1);
      } else if (s.y + s.dy > canvas.height - s.ballRadius - 10) {
        if (s.x > s.paddleX && s.x < s.paddleX + s.paddleWidth) {
          // Paddle collision - adjust angle based on hit point
          s.dy = -s.dy;
          const hitPoint = s.x - (s.paddleX + s.paddleWidth / 2);
          s.dx = hitPoint * 0.15;
          if (soundEnabled) playSynth(300, 'square', 0.1, 0.2);
        } else if (s.y + s.dy > canvas.height - s.ballRadius) {
          // Game Over
          s.active = false;
          setGameOver(true);
          setIsPlaying(false);
          if (soundEnabled) playSynth(150, 'sawtooth', 0.5, 0.3);
        }
      }

      s.x += s.dx;
      s.y += s.dy;

      // Paddle movement
      if (s.rightPressed && s.paddleX < canvas.width - s.paddleWidth) {
        s.paddleX += 7;
      } else if (s.leftPressed && s.paddleX > 0) {
        s.paddleX -= 7;
      }

      if (s.active) {
        animationId = requestAnimationFrame(draw);
      }
    };

    if (isPlaying) {
      draw();
    } else {
      // draw initial static state
      ctx.fillStyle = 'rgba(15, 23, 42, 1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      if (!gameOver && score === 0) {
        initBricks();
      }
      drawBricks();
      drawPaddle();
      drawBall();
    }

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('keydown', keyDownHandler);
      window.removeEventListener('keyup', keyUpHandler);
      canvas.removeEventListener('mousemove', mouseMoveHandler);
    };
  }, [isPlaying, gameOver, soundEnabled]);

  return (
    <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-2xl max-w-2xl mx-auto flex flex-col items-center">
      <div className="flex justify-between w-full mb-4 items-center px-2">
        <h2 className="text-xl font-bold text-white tracking-widest uppercase">Neon Breakout</h2>
        <div className="flex items-center space-x-4">
          <button onClick={() => setSoundEnabled(!soundEnabled)} className="text-slate-400 hover:text-white transition-colors">
            {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>
          <span className="text-sky-400 font-mono font-bold text-lg">SCORE: {score}</span>
        </div>
      </div>
      
      <div className="relative">
        <canvas 
          ref={canvasRef} 
          width={600} 
          height={400} 
          className="bg-slate-900 rounded-xl cursor-crosshair border border-slate-700/50"
        />
        
        {!isPlaying && (
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center">
            {gameOver && <h3 className="text-3xl font-black text-rose-500 mb-2 drop-shadow-[0_0_15px_rgba(244,63,94,0.8)]">GAME OVER</h3>}
            {gameOver && <p className="text-white font-mono mb-6">Final Score: {score}</p>}
            <button
              onClick={startGame}
              className="bg-sky-500 hover:bg-sky-400 text-white font-bold py-3 px-8 rounded-full shadow-[0_0_20px_rgba(14,165,233,0.5)] transition-all transform hover:scale-105 flex items-center"
            >
              {gameOver ? <RotateCcw className="w-5 h-5 mr-2" /> : <Play className="w-5 h-5 mr-2" />}
              {gameOver ? 'PLAY AGAIN' : 'START GAME'}
            </button>
            <p className="text-slate-400 text-xs mt-4 uppercase tracking-widest font-semibold">Use Mouse or Arrow Keys</p>
          </div>
        )}
      </div>
    </div>
  );
};
