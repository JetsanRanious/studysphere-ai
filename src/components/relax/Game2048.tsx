import React, { useState, useEffect, useCallback } from 'react';
import { RotateCcw, Trophy, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Zap } from 'lucide-react';
import { Button } from '../common/Button';
import { audioChime } from '../../utils/audioChime';

type Board = number[][];

const BOARD_SIZE = 4;

export const Game2048: React.FC = () => {
  const [board, setBoard] = useState<Board>(() => getInitialBoard());
  const [score, setScore] = useState<number>(0);
  const [bestScore, setBestScore] = useState<number>(() => {
    try {
      return Number(localStorage.getItem('studysphere_2048_best') || 0);
    } catch {
      return 0;
    }
  });
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [won, setWon] = useState<boolean>(false);

  function getEmptyBoard(): Board {
    return Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(0));
  }

  function addRandomTile(currentBoard: Board): Board {
    const emptyCells: { r: number; c: number }[] = [];
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        if (currentBoard[r][c] === 0) emptyCells.push({ r, c });
      }
    }
    if (emptyCells.length === 0) return currentBoard;
    const { r, c } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    const newBoard = currentBoard.map((row) => [...row]);
    newBoard[r][c] = Math.random() < 0.9 ? 2 : 4;
    return newBoard;
  }

  function getInitialBoard(): Board {
    let b = getEmptyBoard();
    b = addRandomTile(b);
    b = addRandomTile(b);
    return b;
  }

  const resetGame = () => {
    const newB = getInitialBoard();
    setBoard(newB);
    setScore(0);
    setGameOver(false);
    setWon(false);
  };

  const slideAndMergeRow = (row: number[]): { newRow: number[]; points: number } => {
    let filtered = row.filter((val) => val !== 0);
    let points = 0;
    for (let i = 0; i < filtered.length - 1; i++) {
      if (filtered[i] === filtered[i + 1]) {
        filtered[i] *= 2;
        points += filtered[i];
        filtered[i + 1] = 0;
        i++;
      }
    }
    filtered = filtered.filter((val) => val !== 0);
    while (filtered.length < BOARD_SIZE) {
      filtered.push(0);
    }
    return { newRow: filtered, points };
  };

  const moveLeft = useCallback((currentBoard: Board): { newBoard: Board; points: number; moved: boolean } => {
    let moved = false;
    let totalPoints = 0;
    const newBoard = currentBoard.map((row) => {
      const { newRow, points } = slideAndMergeRow(row);
      totalPoints += points;
      if (JSON.stringify(newRow) !== JSON.stringify(row)) moved = true;
      return newRow;
    });
    return { newBoard, points: totalPoints, moved };
  }, []);

  const rotateClockwise = (matrix: Board): Board => {
    const result = getEmptyBoard();
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        result[c][BOARD_SIZE - 1 - r] = matrix[r][c];
      }
    }
    return result;
  };

  const moveRight = useCallback((currentBoard: Board) => {
    let rotated = rotateClockwise(rotateClockwise(currentBoard));
    const { newBoard, points, moved } = moveLeft(rotated);
    return { newBoard: rotateClockwise(rotateClockwise(newBoard)), points, moved };
  }, [moveLeft]);

  const moveUp = useCallback((currentBoard: Board) => {
    let rotated = rotateClockwise(rotateClockwise(rotateClockwise(currentBoard)));
    const { newBoard, points, moved } = moveLeft(rotated);
    return { newBoard: rotateClockwise(newBoard), points, moved };
  }, [moveLeft]);

  const moveDown = useCallback((currentBoard: Board) => {
    let rotated = rotateClockwise(currentBoard);
    const { newBoard, points, moved } = moveLeft(rotated);
    return { newBoard: rotateClockwise(rotateClockwise(rotateClockwise(newBoard))), points, moved };
  }, [moveLeft]);

  const checkGameOver = (b: Board): boolean => {
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        if (b[r][c] === 0) return false;
        if (r < BOARD_SIZE - 1 && b[r][c] === b[r + 1][c]) return false;
        if (c < BOARD_SIZE - 1 && b[r][c] === b[r][c + 1]) return false;
      }
    }
    return true;
  };

  const handleMove = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
    if (gameOver) return;

    let res: { newBoard: Board; points: number; moved: boolean };
    if (direction === 'left') res = moveLeft(board);
    else if (direction === 'right') res = moveRight(board);
    else if (direction === 'up') res = moveUp(board);
    else res = moveDown(board);

    if (res.moved) {
      audioChime.playGentleChime();
      const updatedBoard = addRandomTile(res.newBoard);
      const newScore = score + res.points;
      setBoard(updatedBoard);
      setScore(newScore);

      if (newScore > bestScore) {
        setBestScore(newScore);
        try {
          localStorage.setItem('studysphere_2048_best', String(newScore));
        } catch {}
      }

      for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
          if (updatedBoard[r][c] === 2048 && !won) {
            setWon(true);
          }
        }
      }

      if (checkGameOver(updatedBoard)) {
        setGameOver(true);
      }
    }
  }, [board, gameOver, score, bestScore, won, moveLeft, moveRight, moveUp, moveDown]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'KeyW'].includes(e.code)) {
        e.preventDefault();
        handleMove('up');
      } else if (['ArrowDown', 'KeyS'].includes(e.code)) {
        e.preventDefault();
        handleMove('down');
      } else if (['ArrowLeft', 'KeyA'].includes(e.code)) {
        e.preventDefault();
        handleMove('left');
      } else if (['ArrowRight', 'KeyD'].includes(e.code)) {
        e.preventDefault();
        handleMove('right');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleMove]);

  const getTileStyle = (val: number): string => {
    switch (val) {
      case 2:
        return 'bg-amber-100 text-slate-800 border-amber-200';
      case 4:
        return 'bg-amber-200 text-slate-900 border-amber-300 font-bold';
      case 8:
        return 'bg-orange-400 text-white font-bold shadow-xs';
      case 16:
        return 'bg-orange-500 text-white font-extrabold shadow-xs';
      case 32:
        return 'bg-rose-500 text-white font-extrabold shadow-sm';
      case 64:
        return 'bg-rose-600 text-white font-extrabold shadow-sm';
      case 128:
        return 'bg-yellow-500 text-white font-extrabold shadow-md';
      case 256:
        return 'bg-yellow-600 text-white font-extrabold shadow-md';
      case 512:
        return 'bg-indigo-600 text-white font-extrabold shadow-lg';
      case 1024:
        return 'bg-purple-600 text-white font-black shadow-lg';
      case 2048:
        return 'bg-gradient-to-r from-amber-500 to-rose-600 text-white font-black shadow-xl ring-2 ring-yellow-400';
      default:
        return 'bg-slate-200/70 text-transparent';
    }
  };

  return (
    <div className="flex flex-col items-center max-w-sm mx-auto space-y-4">
      {/* Header & Scores */}
      <div className="w-full flex items-center justify-between">
        <div>
          <h3 className="text-lg font-extrabold text-slate-800 flex items-center">
            <Zap className="w-4 h-4 text-amber-500 mr-1.5 fill-amber-400" />
            2048 Mind Surge
          </h3>
          <p className="text-[11px] text-slate-400 font-medium">Use arrow keys or D-pad</p>
        </div>

        <div className="flex items-center space-x-2">
          <div className="bg-slate-100 border border-slate-200 px-3 py-1 rounded-xl text-center">
            <span className="block text-[9px] font-bold text-slate-400 uppercase">Score</span>
            <span className="text-xs font-black text-slate-800">{score}</span>
          </div>
          <div className="bg-amber-50 border border-amber-200 px-3 py-1 rounded-xl text-center">
            <span className="block text-[9px] font-bold text-amber-600 uppercase flex items-center justify-center">
              <Trophy className="w-2.5 h-2.5 mr-0.5" /> Best
            </span>
            <span className="text-xs font-black text-amber-900">{bestScore}</span>
          </div>
          <button
            onClick={resetGame}
            title="Reset Game"
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Game Board Container */}
      <div className="relative p-3 bg-slate-800 rounded-3xl shadow-xl border-4 border-slate-700/50">
        <div className="grid grid-cols-4 gap-2.5 w-64 h-64 sm:w-72 sm:h-72">
          {board.map((row, r) =>
            row.map((val, c) => (
              <div
                key={`${r}-${c}`}
                className={`rounded-2xl flex items-center justify-center text-base sm:text-xl font-bold transition-all duration-100 select-none ${getTileStyle(
                  val
                )}`}
              >
                {val > 0 ? val : ''}
              </div>
            ))
          )}
        </div>

        {/* Game Over Overlay */}
        {gameOver && (
          <div className="absolute inset-0 bg-slate-900/85 backdrop-blur-xs rounded-3xl flex flex-col items-center justify-center p-4 text-white animate-in fade-in">
            <p className="text-xl font-black mb-1">Game Over!</p>
            <p className="text-xs text-slate-300 mb-4">Final Score: {score}</p>
            <Button variant="primary" size="sm" onClick={resetGame} className="!bg-blue-600">
              Try Again
            </Button>
          </div>
        )}

        {/* 2048 Reached Celebration Overlay */}
        {won && !gameOver && (
          <div className="absolute top-2 right-2 bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full shadow-lg animate-bounce">
            🎉 2048 REACHED!
          </div>
        )}
      </div>

      {/* Mobile / Screen D-Pad Controls */}
      <div className="grid grid-cols-3 gap-1.5 w-40 pt-1">
        <div />
        <button
          onClick={() => handleMove('up')}
          className="p-2.5 bg-slate-100 hover:bg-slate-200 active:bg-blue-600 active:text-white rounded-xl flex items-center justify-center text-slate-700 transition-colors shadow-2xs cursor-pointer"
        >
          <ArrowUp className="w-4 h-4" />
        </button>
        <div />
        <button
          onClick={() => handleMove('left')}
          className="p-2.5 bg-slate-100 hover:bg-slate-200 active:bg-blue-600 active:text-white rounded-xl flex items-center justify-center text-slate-700 transition-colors shadow-2xs cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <button
          onClick={() => handleMove('down')}
          className="p-2.5 bg-slate-100 hover:bg-slate-200 active:bg-blue-600 active:text-white rounded-xl flex items-center justify-center text-slate-700 transition-colors shadow-2xs cursor-pointer"
        >
          <ArrowDown className="w-4 h-4" />
        </button>
        <button
          onClick={() => handleMove('right')}
          className="p-2.5 bg-slate-100 hover:bg-slate-200 active:bg-blue-600 active:text-white rounded-xl flex items-center justify-center text-slate-700 transition-colors shadow-2xs cursor-pointer"
        >
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
