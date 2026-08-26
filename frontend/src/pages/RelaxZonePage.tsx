import React, { useState } from 'react';
import { Gamepad2, Brain, Sparkles, Coffee, Puzzle } from 'lucide-react';
import { TicTacToe } from '../components/relax/TicTacToe';
import { FlappyBird } from '../components/relax/FlappyBird';
import { Sudoku } from '../components/relax/Sudoku';
import { WordleGame } from '../components/relax/WordleGame';
import { MemoryMatrix } from '../components/relax/MemoryMatrix';
import { NeonBreakout } from '../components/relax/NeonBreakout';
import { SnakeRetro } from '../components/relax/SnakeRetro';

export const RelaxZonePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'sudoku' | 'wordle' | 'matrix' | 'tictactoe' | 'flappy' | 'breakout' | 'snake'>('breakout');

  return (
    <div className="space-y-6">
      <div className="text-center max-w-2xl mx-auto mb-6">
        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-2 shadow-xs">
          <Coffee className="w-5 h-5" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Relax Zone & Brain Puzzles</h1>
        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
          Mindful cognitive breaks reduce study fatigue and boost memory retention.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl mt-5 shadow-inner">
          <button
            onClick={() => setActiveTab('breakout')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'breakout' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Neon Breakout 🕹️
          </button>
          <button
            onClick={() => setActiveTab('snake')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'snake' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Retro Snake 🐍
          </button>
          <button
            onClick={() => setActiveTab('sudoku')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'sudoku' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sudoku
          </button>
          <button
            onClick={() => setActiveTab('wordle')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'wordle' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Wordle
          </button>
          <button
            onClick={() => setActiveTab('matrix')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'matrix' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Memory Matrix
          </button>
          <button
            onClick={() => setActiveTab('flappy')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'flappy' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Study Bird
          </button>
          <button
            onClick={() => setActiveTab('tictactoe')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'tictactoe' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tic-Tac-Toe
          </button>
        </div>
      </div>

      <div className="animate-in fade-in">
        {activeTab === 'breakout' && <NeonBreakout />}
        {activeTab === 'snake' && <SnakeRetro />}
        {activeTab === 'sudoku' && <Sudoku />}
        {activeTab === 'wordle' && <WordleGame />}
        {activeTab === 'matrix' && <MemoryMatrix />}
        {activeTab === 'tictactoe' && <TicTacToe />}
        {activeTab === 'flappy' && <FlappyBird />}
      </div>
    </div>
  );
};
