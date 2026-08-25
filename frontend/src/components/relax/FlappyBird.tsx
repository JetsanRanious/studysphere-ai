import React, { useRef, useEffect, useState } from 'react';
import { Play, RotateCcw, Trophy } from 'lucide-react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { gameService } from '../../services/allServices';
import { useToast } from '../../contexts/ToastContext';

export const FlappyBird: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'gameover'>('idle');
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(() => {
    return parseInt(localStorage.getItem('flappy_highscore') || '0', 10);
  });

  const { showToast } = useToast();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let birdY = 150;
    let birdVelocity = 0;
    const gravity = 0.25;
    const jump = -4.8;
    const birdSize = 14;

    let pipes: Array<{ x: number; topHeight: number; bottomY: number; passed: boolean }> = [];
    const pipeWidth = 40;
    const pipeGap = 100;
    let frameCount = 0;
    let currentScore = 0;

    const handleJump = () => {
      if (gameState === 'playing') {
        birdVelocity = jump;
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        handleJump();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Sky Background
      ctx.fillStyle = '#E0F2FE';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (gameState === 'playing') {
        frameCount++;
        birdVelocity += gravity;
        birdY += birdVelocity;

        // Spawn pipes
        if (frameCount % 100 === 0) {
          const topH = Math.floor(Math.random() * (canvas.height - pipeGap - 80)) + 30;
          pipes.push({
            x: canvas.width,
            topHeight: topH,
            bottomY: topH + pipeGap,
            passed: false
          });
        }

        // Update & draw pipes
        ctx.fillStyle = '#60A5FA';
        for (let i = pipes.length - 1; i >= 0; i--) {
          const p = pipes[i];
          p.x -= 2;

          // Top pipe
          ctx.fillRect(p.x, 0, pipeWidth, p.topHeight);
          // Bottom pipe
          ctx.fillRect(p.x, p.bottomY, pipeWidth, canvas.height - p.bottomY);

          // Check score
          if (!p.passed && p.x + pipeWidth < 60) {
            p.passed = true;
            currentScore++;
            setScore(currentScore);
          }

          // Collision detection
          if (
            60 + birdSize > p.x &&
            60 - birdSize < p.x + pipeWidth &&
            (birdY - birdSize < p.topHeight || birdY + birdSize > p.bottomY)
          ) {
            handleGameOver(currentScore);
            return;
          }

          if (p.x + pipeWidth < 0) {
            pipes.splice(i, 1);
          }
        }

        // Floor / Ceiling collision
        if (birdY + birdSize >= canvas.height || birdY - birdSize <= 0) {
          handleGameOver(currentScore);
          return;
        }
      }

      // Draw Bird
      ctx.fillStyle = '#F59E0B';
      ctx.beginPath();
      ctx.arc(60, birdY, birdSize, 0, Math.PI * 2);
      ctx.fill();

      // Wing
      ctx.fillStyle = '#FBBF24';
      ctx.beginPath();
      ctx.arc(56, birdY, 6, 0, Math.PI * 2);
      ctx.fill();

      // Eye
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(65, birdY - 3, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(66, birdY - 3, 1.5, 0, Math.PI * 2);
      ctx.fill();

      animationFrameId = requestAnimationFrame(render);
    };

    const handleGameOver = async (finalScore: number) => {
      setGameState('gameover');
      if (finalScore > highScore) {
        setHighScore(finalScore);
        localStorage.setItem('flappy_highscore', finalScore.toString());
      }
      showToast(`Game Over! Score: ${finalScore}`, 'info');
      await gameService.recordScore('flappy-bird', finalScore * 10, 'normal', 'completed');
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [gameState, highScore]);

  const startGame = () => {
    setScore(0);
    setGameState('playing');
  };

  return (
    <Card className="max-w-md mx-auto p-6 text-center">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-bold text-slate-800">Study Bird</h3>
        <div className="flex items-center space-x-2 text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-xl">
          <Trophy className="w-3.5 h-3.5 text-amber-500" />
          <span>Best: {highScore}</span>
        </div>
      </div>

      <p className="text-xs text-slate-500 mb-4">Press Spacebar or Click anywhere to flap wings.</p>

      <div
        className="relative mx-auto rounded-2xl overflow-hidden shadow-inner border border-blue-200 cursor-pointer"
        style={{ width: 320, height: 360 }}
        onClick={() => {
          if (gameState === 'idle' || gameState === 'gameover') startGame();
        }}
      >
        <canvas ref={canvasRef} width={320} height={360} />

        {gameState === 'idle' && (
          <div className="absolute inset-0 bg-blue-900/20 backdrop-blur-[2px] flex flex-col items-center justify-center p-4">
            <Button variant="primary" size="lg" onClick={startGame}>
              <Play className="w-4 h-4 mr-2" /> Start Playing
            </Button>
          </div>
        )}

        {gameState === 'gameover' && (
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] flex flex-col items-center justify-center p-4 text-white">
            <h4 className="text-xl font-bold mb-1">Game Over</h4>
            <p className="text-sm mb-4 font-semibold">Score: {score}</p>
            <Button variant="primary" size="md" onClick={startGame}>
              <RotateCcw className="w-4 h-4 mr-1.5" /> Play Again
            </Button>
          </div>
        )}

        {gameState === 'playing' && (
          <div className="absolute top-4 left-0 right-0 text-center">
            <span className="bg-white/80 backdrop-blur-md px-4 py-1.5 rounded-full font-bold text-slate-800 text-lg shadow-sm">
              {score}
            </span>
          </div>
        )}
      </div>
    </Card>
  );
};
