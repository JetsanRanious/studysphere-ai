import React, { useState, useEffect } from 'react';
import { HelpCircle, RotateCcw, Check, Sparkles, Trophy, ArrowRight } from 'lucide-react';
import { Button } from '../common/Button';
import { audioChime } from '../../utils/audioChime';

interface WordItem {
  word: string;
  hint: string;
  category: string;
}

const WORDS: WordItem[] = [
  { word: 'ALGORITHM', hint: 'A step-by-step procedure for solving a computational problem.', category: 'Computer Science' },
  { word: 'RECURSION', hint: 'A method where the solution depends on solutions to smaller instances of the same problem.', category: 'Programming' },
  { word: 'ENCRYPTION', hint: 'Process of encoding information to prevent unauthorized access.', category: 'Cyber Security' },
  { word: 'HEURISTIC', hint: 'A practical problem-solving approach that may not be optimal but is sufficient for immediate goals.', category: 'AI & Math' },
  { word: 'COGNITIVE', hint: 'Relating to conscious intellectual mental activity such as thinking, reasoning, or remembering.', category: 'Psychology' },
  { word: 'SYNAPSE', hint: 'The junction across which a nerve impulse passes from an axon terminal to a neuron.', category: 'Neuroscience' },
  { word: 'DATABASE', hint: 'An organized collection of structured information stored electronically.', category: 'Data Systems' },
  { word: 'QUANTUM', hint: 'The minimum amount of any physical entity involved in an interaction.', category: 'Physics' },
];

export const WordScramble: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [scrambled, setScrambled] = useState<string>('');
  const [input, setInput] = useState<string>('');
  const [showHint, setShowHint] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const currentItem = WORDS[currentIndex % WORDS.length];

  const scrambleWord = (w: string): string => {
    const arr = w.split('');
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    const result = arr.join('');
    return result === w ? scrambleWord(w) : result;
  };

  useEffect(() => {
    setScrambled(scrambleWord(currentItem.word));
    setInput('');
    setShowHint(false);
    setIsCorrect(null);
  }, [currentIndex]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    if (input.trim().toUpperCase() === currentItem.word) {
      audioChime.playSessionCompleteChime();
      setIsCorrect(true);
      setScore((prev) => prev + (showHint ? 50 : 100));
      setStreak((prev) => prev + 1);

      setTimeout(() => {
        setCurrentIndex((prev) => prev + 1);
      }, 1200);
    } else {
      audioChime.playGentleChime();
      setIsCorrect(false);
      setStreak(0);
      setTimeout(() => setIsCorrect(null), 1500);
    }
  };

  const handleSkip = () => {
    setCurrentIndex((prev) => prev + 1);
  };

  return (
    <div className="flex flex-col items-center max-w-sm mx-auto space-y-4">
      {/* Header */}
      <div className="w-full flex items-center justify-between">
        <div>
          <h3 className="text-lg font-extrabold text-slate-800 flex items-center">
            <Sparkles className="w-4 h-4 text-emerald-600 mr-1.5" />
            Word Scramble
          </h3>
          <p className="text-[11px] text-slate-400 font-medium">Unscramble academic keywords</p>
        </div>

        <div className="flex items-center space-x-2">
          <div className="bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-xl text-center">
            <span className="block text-[9px] font-bold text-emerald-600 uppercase">Score</span>
            <span className="text-xs font-black text-emerald-900">{score}</span>
          </div>
          <div className="bg-amber-50 border border-amber-200 px-3 py-1 rounded-xl text-center">
            <span className="block text-[9px] font-bold text-amber-600 uppercase">Streak</span>
            <span className="text-xs font-black text-amber-900">{streak} 🔥</span>
          </div>
        </div>
      </div>

      {/* Category Pill */}
      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full border border-slate-200">
        Category: {currentItem.category}
      </span>

      {/* Scrambled Word Display Card */}
      <div className="w-full p-6 bg-gradient-to-br from-slate-900 to-indigo-950 rounded-3xl text-center shadow-lg border border-slate-800 space-y-3">
        <div className="flex items-center justify-center flex-wrap gap-2">
          {scrambled.split('').map((letter, idx) => (
            <span
              key={idx}
              className="w-9 h-10 rounded-xl bg-white/10 border border-white/20 text-white font-mono font-black text-xl flex items-center justify-center shadow-sm"
            >
              {letter}
            </span>
          ))}
        </div>

        {/* Hint Box */}
        {showHint ? (
          <p className="text-xs text-amber-300 italic px-2 animate-in fade-in leading-relaxed">
            💡 {currentItem.hint}
          </p>
        ) : (
          <button
            type="button"
            onClick={() => setShowHint(true)}
            className="text-[11px] text-indigo-300 hover:text-white underline inline-flex items-center space-x-1 cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5 mr-1" />
            <span>Need a clue?</span>
          </button>
        )}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="w-full space-y-3">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type unscrambled word..."
            autoFocus
            className={`w-full px-4 py-3 rounded-2xl border-2 text-sm font-mono font-bold tracking-widest text-center uppercase focus:outline-none transition-all ${
              isCorrect === true
                ? 'border-emerald-500 bg-emerald-50 text-emerald-900'
                : isCorrect === false
                ? 'border-rose-500 bg-rose-50 text-rose-900 animate-shake'
                : 'border-slate-200 bg-white text-slate-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10'
            }`}
          />
        </div>

        <div className="flex space-x-2">
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={handleSkip}
            className="flex-1 border-slate-300"
          >
            Skip Word
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={!input.trim()}
            className="flex-1 !bg-emerald-600 hover:!bg-emerald-700"
          >
            Submit Answer
            <Check className="w-4 h-4 ml-1.5" />
          </Button>
        </div>
      </form>
    </div>
  );
};
