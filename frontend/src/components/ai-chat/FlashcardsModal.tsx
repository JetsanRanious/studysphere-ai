import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, RotateCw, Sparkles } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { FlashcardItem } from '../../types';

interface FlashcardsModalProps {
  isOpen: boolean;
  onClose: () => void;
  cards: FlashcardItem[];
}

export const FlashcardsModal: React.FC<FlashcardsModalProps> = ({ isOpen, onClose, cards }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  if (!cards || cards.length === 0) return null;

  const current = cards[currentIndex];

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((i) => (i + 1) % cards.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex((i) => (i - 1 + cards.length) % cards.length);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="AI Active Recall Flashcards" maxWidth="lg">
      <div>
        <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-3">
          <span>Card {currentIndex + 1} of {cards.length}</span>
          {current.category && (
            <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md text-[11px] font-bold">
              {current.category}
            </span>
          )}
        </div>

        {/* 3D Flip Card */}
        <div
          onClick={() => setIsFlipped(!isFlipped)}
          className={`h-64 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 border shadow-sm ${
            isFlipped
              ? 'bg-blue-600 text-white border-blue-600 shadow-blue-100'
              : 'bg-white text-slate-800 border-slate-200 hover:border-blue-300 shadow-slate-100'
          }`}
        >
          <span className={`text-[11px] font-bold uppercase tracking-wider mb-2 ${isFlipped ? 'text-blue-200' : 'text-slate-400'}`}>
            {isFlipped ? 'Answer / Explanation' : 'Prompt / Concept (Click to flip)'}
          </span>

          <p className="text-base font-semibold leading-relaxed px-4">
            {isFlipped ? current.back : current.front}
          </p>

          <div className="mt-4 flex items-center text-xs opacity-75">
            <RotateCw className="w-3.5 h-3.5 mr-1" />
            <span>Click to flip card</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between mt-6 pt-3 border-t border-slate-100">
          <Button variant="outline" size="sm" onClick={handlePrev}>
            <ChevronLeft className="w-4 h-4 mr-1" /> Previous
          </Button>

          <span className="text-xs text-slate-500 font-medium">{currentIndex + 1} / {cards.length}</span>

          <Button variant="primary" size="sm" onClick={handleNext}>
            Next <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>
    </Modal>
  );
};
