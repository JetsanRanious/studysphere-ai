import React, { useState } from 'react';
import { CheckCircle2, XCircle, Trophy, RotateCcw, ArrowRight, HelpCircle } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { QuizQuestion } from '../../types';
import { useToast } from '../../contexts/ToastContext';

interface QuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  questions: QuizQuestion[];
}

export const QuizModal: React.FC<QuizModalProps> = ({ isOpen, onClose, title, questions }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  const { showToast } = useToast();

  if (!questions || questions.length === 0) return null;

  const currentQ = questions[currentIndex];

  const handleSelect = (idx: number) => {
    if (showExplanation || quizFinished) return;
    setSelectedOption(idx);
    setShowExplanation(true);
    if (idx === currentQ.correct_answer_index) {
      setScore((s) => s + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1);
      setSelectedOption(null);
      setShowExplanation(false);
    } else {
      setQuizFinished(true);
      showToast(`Quiz completed! You scored ${score + (selectedOption === currentQ.correct_answer_index ? 0 : 0)} / ${questions.length}`, 'success');
    }
  };

  const restartQuiz = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setShowExplanation(false);
    setScore(0);
    setQuizFinished(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title || "AI Practice Quiz"} maxWidth="xl">
      {!quizFinished ? (
        <div>
          {/* Progress Bar */}
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2">
            <span>Question {currentIndex + 1} of {questions.length}</span>
            <span>Score: {score}</span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 rounded-full mb-6 overflow-hidden">
            <div
              className="h-full bg-blue-600 rounded-full transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
            />
          </div>

          {/* Question Title */}
          <h4 className="text-base font-bold text-slate-800 mb-4 leading-snug">
            {currentQ.question}
          </h4>

          {/* Options */}
          <div className="space-y-2.5 mb-6">
            {currentQ.options.map((opt, idx) => {
              const isSelected = selectedOption === idx;
              const isCorrect = idx === currentQ.correct_answer_index;
              
              let style = "bg-white border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 text-slate-700";
              if (showExplanation) {
                if (isCorrect) {
                  style = "bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold";
                } else if (isSelected && !isCorrect) {
                  style = "bg-rose-50 border-rose-300 text-rose-900 font-semibold";
                } else {
                  style = "bg-slate-50 border-slate-200 text-slate-400 opacity-60";
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelect(idx)}
                  disabled={showExplanation}
                  className={`w-full p-3.5 rounded-xl border text-left text-sm transition-all flex items-center justify-between ${style}`}
                >
                  <span>{opt}</span>
                  {showExplanation && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 ml-2" />}
                  {showExplanation && isSelected && !isCorrect && <XCircle className="w-4 h-4 text-rose-600 flex-shrink-0 ml-2" />}
                </button>
              );
            })}
          </div>

          {/* Explanation Banner */}
          {showExplanation && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3.5 mb-6 animate-in fade-in">
              <p className="text-xs font-bold text-blue-900 mb-1 flex items-center">
                <HelpCircle className="w-3.5 h-3.5 mr-1 text-blue-600" /> Explanation:
              </p>
              <p className="text-xs text-blue-800 leading-relaxed">{currentQ.explanation}</p>
            </div>
          )}

          {/* Next Button */}
          <div className="flex justify-end pt-2">
            <Button
              variant="primary"
              size="md"
              disabled={!showExplanation}
              onClick={handleNext}
            >
              {currentIndex < questions.length - 1 ? 'Next Question' : 'View Results'}
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </div>
        </div>
      ) : (
        /* Results Screen */
        <div className="text-center py-6">
          <div className="w-16 h-16 bg-blue-50 border border-blue-200 rounded-2xl flex items-center justify-center mx-auto mb-4 text-blue-600 shadow-sm">
            <Trophy className="w-8 h-8 text-amber-500" />
          </div>

          <h4 className="text-xl font-bold text-slate-800 mb-1">Quiz Completed!</h4>
          <p className="text-sm text-slate-500 mb-6">
            You answered <strong className="text-blue-600">{score}</strong> out of <strong>{questions.length}</strong> questions correctly ({Math.round((score / questions.length) * 100)}%).
          </p>

          <div className="flex items-center justify-center space-x-3">
            <Button variant="outline" onClick={restartQuiz}>
              <RotateCcw className="w-4 h-4 mr-1.5" /> Retake Quiz
            </Button>
            <Button variant="primary" onClick={onClose}>
              Done
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};
