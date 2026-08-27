import React, { useState, useEffect, useRef } from 'react';
import { Calculator, Timer, Trophy, RotateCcw, Zap, Check, X } from 'lucide-react';
import { Button } from '../common/Button';
import { audioChime } from '../../utils/audioChime';

interface Problem {
  question: string;
  answer: number;
  options: number[];
}

export const MathSprint: React.FC = () => {
  const [isActive, setIsActive] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(30);
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [currentProblem, setCurrentProblem] = useState<Problem | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [highScore, setHighScore] = useState<number>(() => {
    try {
      return Number(localStorage.getItem('studysphere_math_high') || 0);
    } catch {
      return 0;
    }
  });

  const timerRef = useRef<any>(null);

  const generateProblem = (): Problem => {
    const ops = ['+', '-', '×'];
    const op = ops[Math.floor(Math.random() * ops.length)];
    let a = 0;
    let b = 0;
    let answer = 0;

    if (op === '+') {
      a = Math.floor(Math.random() * 40) + 10;
      b = Math.floor(Math.random() * 40) + 10;
      answer = a + b;
    } else if (op === '-') {
      a = Math.floor(Math.random() * 50) + 25;
      b = Math.floor(Math.random() * 25) + 5;
      answer = a - b;
    } else {
      a = Math.floor(Math.random() * 12) + 3;
      b = Math.floor(Math.random() * 12) + 3;
      answer = a * b;
    }

    // Generate 3 unique wrong options near the answer
    const optionsSet = new Set<number>([answer]);
    while (optionsSet.size < 4) {
      const offset = (Math.floor(Math.random() * 6) + 1) * (Math.random() < 0.5 ? 1 : -1);
      const wrong = answer + offset;
      if (wrong > 0 && wrong !== answer) {
        optionsSet.add(wrong);
      }
    }

    const options = Array.from(optionsSet).sort(() => Math.random() - 0.5);
    return { question: `${a} ${op} ${b}`, answer, options };
  };

  const startSprint = () => {
    setIsActive(true);
    setTimeLeft(30);
    setScore(0);
    setStreak(0);
    setFeedback(null);
    setCurrentProblem(generateProblem());
  };

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      clearInterval(timerRef.current);
      audioChime.playSessionCompleteChime();
      if (score > highScore) {
        setHighScore(score);
        try {
          localStorage.setItem('studysphere_math_high', String(score));
        } catch {}
      }
    }

    return () => clearInterval(timerRef.current);
  }, [isActive, timeLeft, score, highScore]);

  const handleSelectOption = (selected: number) => {
    if (!currentProblem || !isActive) return;

    if (selected === currentProblem.answer) {
      audioChime.playGentleChime();
      setFeedback('correct');
      setScore((prev) => prev + 10 + streak * 2);
      setStreak((prev) => prev + 1);
    } else {
      setFeedback('wrong');
      setStreak(0);
    }

    setTimeout(() => {
      setFeedback(null);
      setCurrentProblem(generateProblem());
    }, 250);
  };

  return (
    <div className="flex flex-col items-center max-w-sm mx-auto space-y-4">
      {/* Header */}
      <div className="w-full flex items-center justify-between">
        <div>
          <h3 className="text-lg font-extrabold text-slate-800 flex items-center">
            <Calculator className="w-4 h-4 text-indigo-600 mr-1.5" />
            30s Math Sprint
          </h3>
          <p className="text-[11px] text-slate-400 font-medium">Rapid mental arithmetic challenge</p>
        </div>

        <div className="flex items-center space-x-2">
          <div className="bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-xl text-center">
            <span className="block text-[9px] font-bold text-indigo-600 uppercase">Score</span>
            <span className="text-xs font-black text-indigo-900">{score}</span>
          </div>
          <div className="bg-amber-50 border border-amber-200 px-3 py-1 rounded-xl text-center">
            <span className="block text-[9px] font-bold text-amber-600 uppercase flex items-center justify-center">
              <Trophy className="w-2.5 h-2.5 mr-0.5" /> Best
            </span>
            <span className="text-xs font-black text-amber-900">{highScore}</span>
          </div>
        </div>
      </div>

      {!isActive && timeLeft === 30 ? (
        /* Start Screen */
        <div className="w-full p-8 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-3xl border-2 border-indigo-200 text-center space-y-4 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mx-auto shadow-md shadow-indigo-400/30">
            <Timer className="w-7 h-7" />
          </div>
          <div>
            <h4 className="text-base font-extrabold text-slate-900">30 Seconds on the Clock</h4>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Solve as many quick addition, subtraction, and multiplication problems as possible!
            </p>
          </div>
          <Button
            type="button"
            variant="primary"
            size="lg"
            onClick={startSprint}
            className="w-full !font-bold !bg-indigo-600 hover:!bg-indigo-700"
          >
            Start Math Sprint 🚀
          </Button>
        </div>
      ) : !isActive && timeLeft === 0 ? (
        /* Game Over / Results Screen */
        <div className="w-full p-6 bg-slate-900 rounded-3xl text-white text-center space-y-4 shadow-xl animate-in zoom-in-95">
          <Trophy className="w-12 h-12 text-amber-400 mx-auto" />
          <div>
            <p className="text-sm font-semibold text-slate-400">Time's Up!</p>
            <p className="text-3xl font-black mt-0.5">{score} Points</p>
            {score >= highScore && score > 0 && (
              <span className="inline-block mt-1 text-[10px] bg-amber-400 text-slate-950 font-black px-2.5 py-0.5 rounded-full">
                👑 NEW PERSONAL RECORD!
              </span>
            )}
          </div>
          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={startSprint}
            className="w-full !bg-indigo-600"
          >
            Play Again
          </Button>
        </div>
      ) : (
        /* Active Game Board */
        <div className="w-full space-y-3">
          {/* Timer & Streak */}
          <div className="flex items-center justify-between bg-slate-100 p-2.5 rounded-2xl border border-slate-200">
            <div className="flex items-center space-x-1.5">
              <Timer className={`w-4 h-4 ${timeLeft <= 5 ? 'text-rose-600 animate-bounce' : 'text-slate-600'}`} />
              <span className={`font-mono font-bold text-sm ${timeLeft <= 5 ? 'text-rose-600' : 'text-slate-800'}`}>
                {timeLeft}s
              </span>
            </div>
            <div className="flex items-center space-x-1 text-xs font-bold text-amber-600">
              <Zap className="w-3.5 h-3.5 fill-amber-500" />
              <span>{streak} Streak (+{streak * 2} bonus)</span>
            </div>
          </div>

          {/* Problem Display Card */}
          <div
            className={`p-6 rounded-3xl text-center shadow-md transition-all duration-150 ${
              feedback === 'correct'
                ? 'bg-emerald-600 text-white'
                : feedback === 'wrong'
                ? 'bg-rose-600 text-white'
                : 'bg-gradient-to-tr from-slate-900 to-indigo-950 text-white'
            }`}
          >
            <p className="text-3xl font-black font-mono tracking-wider">
              {currentProblem?.question} = ?
            </p>
          </div>

          {/* 4 Option Buttons */}
          <div className="grid grid-cols-2 gap-2.5">
            {currentProblem?.options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectOption(opt)}
                className="py-3.5 px-4 rounded-2xl bg-white border-2 border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/50 text-slate-800 font-mono font-black text-lg transition-all shadow-xs active:scale-95 cursor-pointer"
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
