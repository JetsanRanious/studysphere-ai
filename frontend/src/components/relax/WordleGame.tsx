import React, { useState, useEffect } from 'react';
import { RotateCcw, Trophy, Sparkles, HelpCircle } from 'lucide-react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { gameService } from '../../services/allServices';
import { useToast } from '../../contexts/ToastContext';

const WORDS_DATABASE = [
  { word: 'TOKEN', clue: 'Fundamental unit in LLMs or authentication pass' },
  { word: 'CACHE', clue: 'High-speed storage layer for fast data access' },
  { word: 'LOGIC', clue: 'Fundamental principle behind boolean circuits & algorithms' },
  { word: 'ARRAY', clue: 'Contiguous linear data structure in memory' },
  { word: 'MUTEX', clue: 'Mutual exclusion lock preventing race conditions' },
  { word: 'STACK', clue: 'LIFO (Last In First Out) data structure' },
  { word: 'PROXY', clue: 'Server that acts as an intermediary for requests' },
  { word: 'CYBER', clue: 'Prefix relating to internet, networks, and digital security' },
  { word: 'QUERY', clue: 'Database request to fetch or modify data' },
  { word: 'NODES', clue: 'Individual connection points or graph vertices' }
];

export const WordleGame: React.FC = () => {
  const [target, setTarget] = useState(WORDS_DATABASE[0]);
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState('');
  const [isGameOver, setIsGameOver] = useState(false);
  const [isWon, setIsWon] = useState(false);
  const { showToast } = useToast();

  const resetGame = () => {
    const pick = WORDS_DATABASE[Math.floor(Math.random() * WORDS_DATABASE.length)];
    setTarget(pick);
    setGuesses([]);
    setCurrentGuess('');
    setIsGameOver(false);
    setIsWon(false);
  };

  useEffect(() => {
    resetGame();
  }, []);

  const handleKeyPress = (letter: string) => {
    if (isGameOver) return;
    if (letter === 'ENTER') {
      if (currentGuess.length !== 5) {
        showToast('Word must be 5 letters', 'info');
        return;
      }
      const newGuesses = [...guesses, currentGuess];
      setGuesses(newGuesses);

      if (currentGuess === target.word) {
        setIsWon(true);
        setIsGameOver(true);
        showToast(`Brilliant! You guessed ${target.word}! +35 XP 🎉`, 'success');
        gameService.recordScore('wordle', 150, 'medium', 'win');
      } else if (newGuesses.length >= 6) {
        setIsGameOver(true);
        showToast(`Game Over! The word was ${target.word}`, 'info');
        gameService.recordScore('wordle', 20, 'medium', 'loss');
      }
      setCurrentGuess('');
    } else if (letter === 'BACKSPACE') {
      setCurrentGuess(prev => prev.slice(0, -1));
    } else if (currentGuess.length < 5) {
      setCurrentGuess(prev => prev + letter);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') handleKeyPress('ENTER');
      else if (e.key === 'Backspace') handleKeyPress('BACKSPACE');
      else if (/^[a-zA-Z]$/.test(e.key)) handleKeyPress(e.key.toUpperCase());
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentGuess, isGameOver, guesses]);

  const getLetterStyle = (letter: string, index: number, word: string) => {
    if (!word) return 'bg-white border-slate-200 text-slate-800';
    if (target.word[index] === letter) return 'bg-emerald-500 border-emerald-600 text-white font-bold';
    if (target.word.includes(letter)) return 'bg-amber-400 border-amber-500 text-white font-bold';
    return 'bg-slate-300 border-slate-400 text-white font-bold';
  };

  const KEYBOARD_ROWS = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACKSPACE']
  ];

  return (
    <Card className="max-w-md mx-auto p-6 text-center">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-lg font-bold text-slate-800 flex items-center">
            Tech Wordle <Sparkles className="w-4 h-4 ml-1.5 text-blue-500" />
          </h3>
          <p className="text-xs text-slate-500">Guess the 5-letter academic tech concept</p>
        </div>

        <Button size="sm" variant="outline" onClick={resetGame}>
          <RotateCcw className="w-3.5 h-3.5 mr-1" /> New Word
        </Button>
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-xl p-2.5 mb-5 text-xs text-blue-900 flex items-center justify-center">
        <HelpCircle className="w-3.5 h-3.5 mr-1.5 text-blue-600 flex-shrink-0" />
        <span><strong>Clue:</strong> {target.clue}</span>
      </div>

      <div className="space-y-2 mb-6">
        {Array.from({ length: 6 }).map((_, rowIdx) => {
          const guess = guesses[rowIdx] || (rowIdx === guesses.length ? currentGuess : '');
          return (
            <div key={rowIdx} className="flex justify-center space-x-1.5">
              {Array.from({ length: 5 }).map((_, colIdx) => {
                const char = guess[colIdx] || '';
                const isGuessed = rowIdx < guesses.length;
                return (
                  <div
                    key={colIdx}
                    className={`w-11 h-11 rounded-xl border flex items-center justify-center text-lg font-bold uppercase transition-all ${
                      isGuessed
                        ? getLetterStyle(char, colIdx, guess)
                        : char
                        ? 'border-blue-400 bg-blue-50/50 text-blue-900 scale-105'
                        : 'border-slate-200 bg-white text-slate-800'
                    }`}
                  >
                    {char}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      <div className="space-y-1.5">
        {KEYBOARD_ROWS.map((row, rIdx) => (
          <div key={rIdx} className="flex justify-center space-x-1">
            {row.map(key => (
              <button
                key={key}
                onClick={() => handleKeyPress(key)}
                className={`h-9 px-2 rounded-lg font-bold text-xs transition-colors ${
                  key === 'ENTER' || key === 'BACKSPACE'
                    ? 'bg-blue-100 hover:bg-blue-200 text-blue-800 px-3 text-[10px]'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-800 min-w-[30px]'
                }`}
              >
                {key === 'BACKSPACE' ? '⌫' : key}
              </button>
            ))}
          </div>
        ))}
      </div>
    </Card>
  );
};
