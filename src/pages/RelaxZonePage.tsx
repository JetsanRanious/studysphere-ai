import React, { useState } from 'react';
import {
  Coffee,
  Sparkles,
  Zap,
  Brain,
  Wind,
  Calculator,
  Bot,
  Flame,
  Award,
  Grid,
  Palette,
  Layers,
  Gamepad2,
  Brush
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { Game2048 } from '../components/relax/Game2048';
import { BubblePop } from '../components/relax/BubblePop';
import { MemoryMatch } from '../components/relax/MemoryMatch';
import { ReactionTest } from '../components/relax/ReactionTest';
import { TicTacToeGame } from '../components/relax/TicTacToeGame';
import { WordScramble } from '../components/relax/WordScramble';
import { MathSprint } from '../components/relax/MathSprint';
import { BreathingRing } from '../components/relax/BreathingRing';
import { CyberSnake } from '../components/relax/CyberSnake';
import { ColorHueSort } from '../components/relax/ColorHueSort';
import { SimonSequence } from '../components/relax/SimonSequence';
import { ZenSandArt } from '../components/relax/ZenSandArt';

type GameId =
  | '2048'
  | 'bubble'
  | 'memory'
  | 'reaction'
  | 'snake'
  | 'colorsort'
  | 'simon'
  | 'sandart'
  | 'scramble'
  | 'math'
  | 'tictactoe'
  | 'breathing';

interface GameTab {
  id: GameId;
  name: string;
  category: string;
  icon: React.ComponentType<{ className?: string }>;
  tag: string;
  color: string;
}

const GAME_TABS: GameTab[] = [
  {
    id: '2048',
    name: '2048 Surge',
    category: 'Strategy',
    icon: Zap,
    tag: 'Puzzle',
    color: 'from-amber-500 to-orange-600',
  },
  {
    id: 'snake',
    name: 'Cyber Snake',
    category: 'Arcade',
    icon: Gamepad2,
    tag: 'Retro',
    color: 'from-emerald-500 to-teal-600',
  },
  {
    id: 'colorsort',
    name: 'Hue Harmony',
    category: 'Visual Zen',
    icon: Palette,
    tag: 'Spectrum',
    color: 'from-purple-500 to-pink-600',
  },
  {
    id: 'simon',
    name: 'Simon Sequence',
    category: 'Audio Recall',
    icon: Layers,
    tag: 'Memory',
    color: 'from-blue-500 to-indigo-600',
  },
  {
    id: 'sandart',
    name: 'Zen Mandala Sand',
    category: 'Artistic Calm',
    icon: Brush,
    tag: 'Mandala',
    color: 'from-amber-600 to-yellow-600',
  },
  {
    id: 'bubble',
    name: 'Zen Bubble Wrap',
    category: 'De-Stress',
    icon: Sparkles,
    tag: 'Sensory',
    color: 'from-sky-400 to-blue-600',
  },
  {
    id: 'memory',
    name: 'Memory Flash',
    category: 'Active Recall',
    icon: Brain,
    tag: 'Focus',
    color: 'from-purple-500 to-indigo-600',
  },
  {
    id: 'reaction',
    name: 'Reflex Sprint',
    category: 'Neuro Speed',
    icon: Flame,
    tag: 'Reflex',
    color: 'from-rose-500 to-red-600',
  },
  {
    id: 'scramble',
    name: 'Word Scramble',
    category: 'STEM Vocab',
    icon: Grid,
    tag: 'Vocab',
    color: 'from-emerald-500 to-teal-600',
  },
  {
    id: 'math',
    name: '30s Math Sprint',
    category: 'Arithmetic',
    icon: Calculator,
    tag: 'Speed',
    color: 'from-blue-600 to-indigo-700',
  },
  {
    id: 'tictactoe',
    name: 'Tic-Tac-Toe AI',
    category: 'Tactics',
    icon: Bot,
    tag: 'Classic',
    color: 'from-slate-700 to-slate-900',
  },
  {
    id: 'breathing',
    name: '4-7-8 Breathing',
    category: 'Mindfulness',
    icon: Wind,
    tag: 'Calm',
    color: 'from-teal-500 to-cyan-600',
  },
];

export const RelaxZonePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<GameId>('2048');

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-gradient-to-r from-amber-50 via-sky-50 to-indigo-50 border border-amber-200/80 rounded-3xl p-5 shadow-xs">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20">
            <Coffee className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <span>Study Break & Relax Zone</span>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded-full">
                12 Mini-Games & Wellness Tools
              </span>
            </h1>
            <p className="text-xs text-slate-600 mt-0.5">
              Reset mental fatigue and stimulate neuro-plasticity with quick 3–5 minute focus mini-games.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <div className="flex items-center space-x-1 bg-white/90 border border-amber-200 px-3 py-1.5 rounded-xl shadow-2xs text-xs font-bold text-slate-700">
            <Award className="w-4 h-4 text-amber-500" />
            <span>+15 Focus XP per game</span>
          </div>
        </div>
      </div>

      {/* Game Selector Chips Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
        {GAME_TABS.map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`p-3 rounded-2xl border text-left transition-all duration-150 cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-slate-900 text-white border-slate-900 shadow-md scale-[1.02]'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300 shadow-2xs'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span
                  className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {tab.tag}
                </span>
              </div>
              <div>
                <p className="text-xs font-extrabold truncate">{tab.name}</p>
                <p
                  className={`text-[10px] truncate ${
                    isSelected ? 'text-slate-300' : 'text-slate-400'
                  }`}
                >
                  {tab.category}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Game Stage Card */}
      <Card className="p-6 md:p-8 bg-white border border-slate-200/80 shadow-md">
        {activeTab === '2048' && <Game2048 />}
        {activeTab === 'snake' && <CyberSnake />}
        {activeTab === 'colorsort' && <ColorHueSort />}
        {activeTab === 'simon' && <SimonSequence />}
        {activeTab === 'sandart' && <ZenSandArt />}
        {activeTab === 'bubble' && <BubblePop />}
        {activeTab === 'memory' && <MemoryMatch />}
        {activeTab === 'reaction' && <ReactionTest />}
        {activeTab === 'scramble' && <WordScramble />}
        {activeTab === 'math' && <MathSprint />}
        {activeTab === 'tictactoe' && <TicTacToeGame />}
        {activeTab === 'breathing' && <BreathingRing />}
      </Card>
    </div>
  );
};
