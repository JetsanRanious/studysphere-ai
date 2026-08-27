import React, { useState } from 'react';
import { RotateCcw, Bot, User, Trophy, Sparkles } from 'lucide-react';
import { audioChime } from '../../utils/audioChime';

type Difficulty = 'easy' | 'medium' | 'hard';

export const TicTacToeGame: React.FC = () => {
  const [board, setBoard] = useState<(string | null)[]>(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState<boolean>(true);
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [stats, setStats] = useState({ wins: 0, losses: 0, draws: 0 });

  const calculateWinner = (squares: (string | null)[]) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6],
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    return null;
  };

  const winner = calculateWinner(board);
  const isDraw = !winner && board.every((cell) => cell !== null);

  const getBestMove = (currentBoard: (string | null)[], diff: Difficulty): number => {
    const emptyIndices = currentBoard
      .map((v, i) => (v === null ? i : null))
      .filter((v) => v !== null) as number[];

    if (diff === 'easy') {
      return emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
    }

    // Check if AI can win in 1 move
    for (const idx of emptyIndices) {
      const testBoard = [...currentBoard];
      testBoard[idx] = 'O';
      if (calculateWinner(testBoard) === 'O') return idx;
    }

    // Check if Human can win in 1 move and block them
    for (const idx of emptyIndices) {
      const testBoard = [...currentBoard];
      testBoard[idx] = 'X';
      if (calculateWinner(testBoard) === 'X') return idx;
    }

    // Take center if available
    if (currentBoard[4] === null && (diff === 'hard' || Math.random() < 0.7)) {
      return 4;
    }

    // Otherwise random corner or side
    const corners = [0, 2, 6, 8].filter((i) => currentBoard[i] === null);
    if (corners.length > 0 && diff === 'hard') {
      return corners[Math.floor(Math.random() * corners.length)];
    }

    return emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
  };

  const handleClick = (index: number) => {
    if (board[index] || winner || !isXNext) return;

    audioChime.playGentleChime();
    const nextBoard = [...board];
    nextBoard[index] = 'X';
    setBoard(nextBoard);
    setIsXNext(false);

    const winCheck = calculateWinner(nextBoard);
    if (winCheck === 'X') {
      audioChime.playSessionCompleteChime();
      setStats((prev) => ({ ...prev, wins: prev.wins + 1 }));
      return;
    }

    if (nextBoard.every((c) => c !== null)) {
      setStats((prev) => ({ ...prev, draws: prev.draws + 1 }));
      return;
    }

    // AI Move
    setTimeout(() => {
      setBoard((curr) => {
        if (calculateWinner(curr) || curr.every((c) => c !== null)) return curr;
        const aiMove = getBestMove(curr, difficulty);
        const updated = [...curr];
        updated[aiMove] = 'O';
        setIsXNext(true);

        const aiWin = calculateWinner(updated);
        if (aiWin === 'O') {
          setStats((prev) => ({ ...prev, losses: prev.losses + 1 }));
        } else if (updated.every((c) => c !== null)) {
          setStats((prev) => ({ ...prev, draws: prev.draws + 1 }));
        }

        return updated;
      });
    }, 350);
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
  };

  return (
    <div className="flex flex-col items-center max-w-sm mx-auto space-y-4">
      {/* Header */}
      <div className="w-full flex items-center justify-between">
        <div>
          <h3 className="text-lg font-extrabold text-slate-800 flex items-center">
            <Bot className="w-4 h-4 text-blue-600 mr-1.5" />
            Tic-Tac-Toe vs AI
          </h3>
          <p className="text-[11px] text-slate-400 font-medium">Test tactical strategy</p>
        </div>

        {/* Difficulty Selector */}
        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value as Difficulty)}
          className="bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 px-2 py-1 rounded-xl focus:outline-none cursor-pointer"
        >
          <option value="easy">Casual (Easy)</option>
          <option value="medium">Smart (Medium)</option>
          <option value="hard">Master (Hard)</option>
        </select>
      </div>

      {/* Stats Bar */}
      <div className="w-full grid grid-cols-3 gap-2 text-center text-xs">
        <div className="bg-emerald-50 border border-emerald-200 p-1.5 rounded-xl">
          <span className="block text-[9px] font-bold text-emerald-600 uppercase">You Won</span>
          <span className="text-sm font-black text-emerald-900">{stats.wins}</span>
        </div>
        <div className="bg-slate-100 border border-slate-200 p-1.5 rounded-xl">
          <span className="block text-[9px] font-bold text-slate-500 uppercase">Draws</span>
          <span className="text-sm font-black text-slate-800">{stats.draws}</span>
        </div>
        <div className="bg-rose-50 border border-rose-200 p-1.5 rounded-xl">
          <span className="block text-[9px] font-bold text-rose-600 uppercase">AI Won</span>
          <span className="text-sm font-black text-rose-900">{stats.losses}</span>
        </div>
      </div>

      {/* 3x3 Board */}
      <div className="p-3 bg-slate-100 rounded-3xl border border-slate-200 shadow-inner">
        <div className="grid grid-cols-3 gap-2.5 w-60 h-60">
          {board.map((cell, idx) => (
            <button
              key={idx}
              onClick={() => handleClick(idx)}
              className={`rounded-2xl text-3xl font-black flex items-center justify-center transition-all cursor-pointer shadow-xs ${
                cell === 'X'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 scale-95'
                  : cell === 'O'
                  ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20 scale-95'
                  : 'bg-white hover:bg-blue-50 text-transparent hover:scale-105'
              }`}
            >
              {cell || ''}
            </button>
          ))}
        </div>
      </div>

      {/* Winner / Status Notification */}
      {winner && (
        <div className="w-full p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl text-xs font-bold flex items-center justify-between animate-in zoom-in-95">
          <span>{winner === 'X' ? '🎉 You won! +25 Focus XP' : '🤖 AI Study Buddy took this round!'}</span>
          <button onClick={resetGame} className="text-xs text-blue-600 font-bold underline cursor-pointer">
            Play Again
          </button>
        </div>
      )}

      {isDraw && (
        <div className="w-full p-2.5 bg-slate-100 border border-slate-200 text-slate-700 rounded-2xl text-xs font-bold flex items-center justify-between">
          <span>🤝 Tie Game! Great match.</span>
          <button onClick={resetGame} className="text-xs text-blue-600 font-bold underline cursor-pointer">
            Play Again
          </button>
        </div>
      )}
    </div>
  );
};
