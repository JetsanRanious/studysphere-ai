import React, { useState, useEffect } from 'react';
import { RefreshCw, Trophy, Bot, User, Sparkles } from 'lucide-react';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { gameService } from '../../services/allServices';
import { useToast } from '../../contexts/ToastContext';

export const TicTacToe: React.FC = () => {
  const [board, setBoard] = useState<Array<string | null>>(Array(9).fill(null));
  const [isPlayerTurn, setIsPlayerTurn] = useState<boolean>(true);
  const [winner, setWinner] = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [scores, setScores] = useState({ wins: 0, losses: 0, draws: 0 });

  const { showToast } = useToast();

  const checkWinner = (squares: Array<string | null>): string | null => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
      [0, 4, 8], [2, 4, 6]             // diagonals
    ];
    for (let [a, b, c] of lines) {
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    if (squares.every((sq) => sq !== null)) return 'draw';
    return null;
  };

  const minimax = (newBoard: Array<string | null>, depth: number, isMaximizing: boolean): number => {
    const res = checkWinner(newBoard);
    if (res === 'O') return 10 - depth;
    if (res === 'X') return depth - 10;
    if (res === 'draw') return 0;

    if (isMaximizing) {
      let maxEval = -Infinity;
      for (let i = 0; i < 9; i++) {
        if (!newBoard[i]) {
          newBoard[i] = 'O';
          const evaluation = minimax(newBoard, depth + 1, false);
          newBoard[i] = null;
          maxEval = Math.max(maxEval, evaluation);
        }
      }
      return maxEval;
    } else {
      let minEval = Infinity;
      for (let i = 0; i < 9; i++) {
        if (!newBoard[i]) {
          newBoard[i] = 'X';
          const evaluation = minimax(newBoard, depth + 1, true);
          newBoard[i] = null;
          minEval = Math.min(minEval, evaluation);
        }
      }
      return minEval;
    }
  };

  const makeAIMove = (currentBoard: Array<string | null>) => {
    const available = currentBoard.map((val, idx) => (val === null ? idx : null)).filter((v): v is number => v !== null);
    if (available.length === 0) return;

    let move: number;

    if (difficulty === 'easy') {
      move = available[Math.floor(Math.random() * available.length)];
    } else if (difficulty === 'medium' && Math.random() < 0.4) {
      move = available[Math.floor(Math.random() * available.length)];
    } else {
      // Unbeatable Minimax for Hard
      let bestScore = -Infinity;
      let bestMove = available[0];
      for (let idx of available) {
        currentBoard[idx] = 'O';
        const score = minimax(currentBoard, 0, false);
        currentBoard[idx] = null;
        if (score > bestScore) {
          bestScore = score;
          bestMove = idx;
        }
      }
      move = bestMove;
    }

    const next = [...currentBoard];
    next[move] = 'O';
    setBoard(next);

    const win = checkWinner(next);
    if (win) {
      setWinner(win);
      handleGameEnd(win);
    } else {
      setIsPlayerTurn(true);
    }
  };

  const handleCellClick = (idx: number) => {
    if (!isPlayerTurn || board[idx] || winner) return;

    const next = [...board];
    next[idx] = 'X';
    setBoard(next);

    const win = checkWinner(next);
    if (win) {
      setWinner(win);
      handleGameEnd(win);
    } else {
      setIsPlayerTurn(false);
      setTimeout(() => makeAIMove(next), 400);
    }
  };

  const handleGameEnd = async (winResult: string) => {
    if (winResult === 'X') {
      setScores((s) => ({ ...s, wins: s.wins + 1 }));
      showToast('You won Tic-Tac-Toe! +15 XP', 'success');
      await gameService.recordScore('tic-tac-toe', 100, difficulty, 'win');
    } else if (winResult === 'O') {
      setScores((s) => ({ ...s, losses: s.losses + 1 }));
      showToast('AI won this round!', 'info');
      await gameService.recordScore('tic-tac-toe', 20, difficulty, 'loss');
    } else {
      setScores((s) => ({ ...s, draws: s.draws + 1 }));
      showToast("It's a draw!", 'info');
      await gameService.recordScore('tic-tac-toe', 50, difficulty, 'draw');
    }
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setWinner(null);
    setIsPlayerTurn(true);
  };

  return (
    <Card className="max-w-md mx-auto p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-800 flex items-center">
            Tic-Tac-Toe <Bot className="w-4 h-4 ml-1.5 text-blue-500" />
          </h3>
          <p className="text-xs text-slate-500">Play against StudySphere AI</p>
        </div>

        {/* Difficulty buttons */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
          {(['easy', 'medium', 'hard'] as const).map((lvl) => (
            <button
              key={lvl}
              onClick={() => { setDifficulty(lvl); resetGame(); }}
              className={`px-2.5 py-1 rounded-lg capitalize transition-colors ${
                difficulty === lvl ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Score Tracker */}
      <div className="grid grid-cols-3 gap-2 mb-6 text-center text-xs">
        <div className="bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-xl p-2 font-medium">
          <span className="block text-slate-500">You (X)</span>
          <strong className="text-base">{scores.wins}</strong>
        </div>
        <div className="bg-slate-50 text-slate-700 border border-slate-200 rounded-xl p-2 font-medium">
          <span className="block text-slate-500">Draws</span>
          <strong className="text-base">{scores.draws}</strong>
        </div>
        <div className="bg-blue-50 text-blue-800 border border-blue-100 rounded-xl p-2 font-medium">
          <span className="block text-slate-500">AI (O)</span>
          <strong className="text-base">{scores.losses}</strong>
        </div>
      </div>

      {/* Game Grid */}
      <div className="grid grid-cols-3 gap-3 w-64 h-64 mx-auto mb-6">
        {board.map((cell, idx) => (
          <button
            key={idx}
            onClick={() => handleCellClick(idx)}
            disabled={!!cell || !!winner || !isPlayerTurn}
            className={`w-full h-full rounded-2xl flex items-center justify-center text-3xl font-extrabold transition-all border ${
              cell === 'X'
                ? 'bg-blue-50 border-blue-200 text-blue-600'
                : cell === 'O'
                ? 'bg-rose-50 border-rose-200 text-rose-600'
                : 'bg-slate-50/70 border-slate-200 hover:bg-blue-50/50 hover:border-blue-300'
            }`}
          >
            {cell}
          </button>
        ))}
      </div>

      {/* Status & Restart */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
        <div className="text-xs font-semibold text-slate-600">
          {winner ? (
            <span className="text-blue-600 font-bold">
              {winner === 'draw' ? "Game Ended in a Draw!" : `${winner === 'X' ? 'You' : 'AI'} Won!`}
            </span>
          ) : (
            <span>Turn: {isPlayerTurn ? 'Your move (X)' : 'AI thinking...'}</span>
          )}
        </div>

        <Button size="sm" variant="outline" onClick={resetGame}>
          <RefreshCw className="w-3.5 h-3.5 mr-1" /> New Game
        </Button>
      </div>
    </Card>
  );
};
