import React, { useState, useEffect } from 'react';
import { Sparkles, RotateCcw, Lightbulb, CheckCircle2, AlertCircle } from 'lucide-react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { gameService } from '../../services/allServices';
import { useToast } from '../../contexts/ToastContext';

export const Sudoku: React.FC = () => {
  const [board, setBoard] = useState<number[][]>([]);
  const [initialBoard, setInitialBoard] = useState<number[][]>([]);
  const [solution, setSolution] = useState<number[][]>([]);
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [hint, setHint] = useState<{ row: number; col: number; value: number; technique: string; explanation: string } | null>(null);
  const [mistakes, setMistakes] = useState<number>(0);
  const [isSolved, setIsSolved] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const { showToast } = useToast();

  const loadNewPuzzle = async (diff: 'easy' | 'medium' | 'hard' = difficulty) => {
    try {
      setLoading(true);
      setHint(null);
      setMistakes(0);
      setIsSolved(false);
      setSelectedCell(null);
      const res = await gameService.generateSudoku(diff);
      setBoard(res.initial_board.map((r) => [...r]));
      setInitialBoard(res.initial_board.map((r) => [...r]));
      setSolution(res.solution);
    } catch (e) {
      showToast('Failed to generate Sudoku puzzle', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNewPuzzle('easy');
  }, []);

  const handleCellClick = (r: number, c: number) => {
    if (initialBoard[r]?.[c] !== 0) return;
    setSelectedCell([r, c]);
  };

  const handleNumberInput = (num: number) => {
    if (!selectedCell) return;
    const [r, c] = selectedCell;
    if (initialBoard[r][c] !== 0) return;

    const next = board.map((row) => [...row]);
    next[r][c] = num;
    setBoard(next);

    // Validate against solution
    if (solution.length > 0 && solution[r][c] !== num && num !== 0) {
      setMistakes((m) => m + 1);
      showToast(`Incorrect number for Row ${r+1}, Col ${c+1}`, 'error');
    }

    // Check complete
    const isComplete = next.every((row, ri) => row.every((val, ci) => val === solution[ri][ci]));
    if (isComplete) {
      setIsSolved(true);
      showToast('Congratulations! You solved the Sudoku! +50 XP 🎉', 'success');
      gameService.recordScore('sudoku', 200, difficulty, 'win');
    }
  };

  const requestAIHint = async () => {
    try {
      setLoading(true);
      const res = await gameService.getSudokuHint(board, initialBoard);
      setHint(res);
      setSelectedCell([res.row, res.col]);
      showToast(`AI Hint: ${res.technique}`, 'info');
    } catch (e: any) {
      showToast(e.response?.data?.detail || 'No single step hint found', 'info');
    } finally {
      setLoading(false);
    }
  };

  const applyHint = () => {
    if (!hint) return;
    const next = board.map((r) => [...r]);
    next[hint.row][hint.col] = hint.value;
    setBoard(next);
    setHint(null);
  };

  return (
    <Card className="max-w-xl mx-auto p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-800 flex items-center">
            Sudoku Master <Sparkles className="w-4 h-4 ml-1.5 text-blue-500" />
          </h3>
          <p className="text-xs text-slate-500">Sharpen your logic with AI Step Hints</p>
        </div>

        {/* Difficulty buttons */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
          {(['easy', 'medium', 'hard'] as const).map((lvl) => (
            <button
              key={lvl}
              onClick={() => { setDifficulty(lvl); loadNewPuzzle(lvl); }}
              className={`px-2.5 py-1 rounded-lg capitalize transition-colors ${
                difficulty === lvl ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* 9x9 Board */}
      <div className="grid grid-cols-9 gap-1 bg-slate-300 p-1.5 rounded-2xl max-w-sm mx-auto mb-5 shadow-inner">
        {board.map((row, rIdx) =>
          row.map((cell, cIdx) => {
            const isInitial = initialBoard[rIdx]?.[cIdx] !== 0;
            const isSelected = selectedCell?.[0] === rIdx && selectedCell?.[1] === cIdx;
            const isHinted = hint?.row === rIdx && hint?.col === cIdx;
            const isBorderRight = (cIdx + 1) % 3 === 0 && cIdx !== 8;
            const isBorderBottom = (rIdx + 1) % 3 === 0 && rIdx !== 8;

            return (
              <button
                key={`${rIdx}-${cIdx}`}
                onClick={() => handleCellClick(rIdx, cIdx)}
                disabled={isInitial}
                className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold transition-all ${
                  isInitial
                    ? 'bg-slate-100 text-slate-900 font-extrabold'
                    : cell !== 0
                    ? 'bg-white text-blue-600 font-bold hover:bg-blue-50'
                    : 'bg-white hover:bg-blue-50 text-slate-700'
                } ${isSelected ? 'ring-2 ring-blue-500 z-10' : ''} ${
                  isHinted ? 'bg-amber-100 ring-2 ring-amber-400 animate-pulse' : ''
                } ${isBorderRight ? 'mr-1' : ''} ${isBorderBottom ? 'mb-1' : ''}`}
              >
                {cell !== 0 ? cell : ''}
              </button>
            );
          })
        )}
      </div>

      {/* AI Hint Explanation Card */}
      {hint && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-4 text-left animate-in slide-in-from-top-2">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-blue-800 flex items-center">
              <Lightbulb className="w-4 h-4 mr-1 text-amber-500" />
              AI Deduction: {hint.technique} (Cell R{hint.row + 1}, C{hint.col + 1})
            </span>
            <Button size="sm" variant="primary" onClick={applyHint} className="!py-1 !text-xs">
              Fill {hint.value}
            </Button>
          </div>
          <p className="text-xs text-blue-900 leading-relaxed">{hint.explanation}</p>
        </div>
      )}

      {/* Number Pad for Input */}
      <div className="flex items-center justify-center space-x-2 mb-4">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <button
            key={num}
            onClick={() => handleNumberInput(num)}
            className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-800 font-bold text-sm transition-colors"
          >
            {num}
          </button>
        ))}
        <button
          onClick={() => handleNumberInput(0)}
          className="px-2.5 h-8 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs transition-colors"
        >
          Erase
        </button>
      </div>

      {/* Action Controls */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
        <span className="text-slate-500 font-medium">Mistakes: {mistakes}</span>

        <div className="flex items-center space-x-2">
          <Button size="sm" variant="soft" onClick={requestAIHint} isLoading={loading}>
            <Lightbulb className="w-3.5 h-3.5 mr-1 text-amber-600" />
            AI Step Hint
          </Button>

          <Button size="sm" variant="outline" onClick={() => loadNewPuzzle(difficulty)}>
            <RotateCcw className="w-3.5 h-3.5 mr-1" /> New Puzzle
          </Button>
        </div>
      </div>
    </Card>
  );
};
