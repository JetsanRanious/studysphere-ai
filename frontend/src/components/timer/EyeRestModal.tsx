import React from 'react';
import { Eye, Coffee, ArrowRight, X } from 'lucide-react';
import { useStudyTimer } from '../../contexts/StudyTimerContext';
import { Button } from '../common/Button';

export const EyeRestModal: React.FC = () => {
  const { showBreakModal, dismissBreakModal, takeBreak } = useStudyTimer();

  if (!showBreakModal) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={dismissBreakModal} />
      
      <div className="relative bg-white rounded-3xl shadow-2xl border border-blue-100 max-w-md w-full p-6 text-center z-10 animate-in zoom-in-95">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-4 shadow-sm">
          <Eye className="w-8 h-8 text-blue-600 animate-pulse" />
        </div>

        <h3 className="text-xl font-bold text-slate-800 mb-2">Take a Short Eye Rest 👁️</h3>
        
        <p className="text-sm text-slate-600 mb-6 leading-relaxed">
          You've been studying continuously for <strong>30 minutes</strong>. Look away from your screen at an object 20 feet away for 20 seconds, or take a quick relaxation game break.
        </p>

        <div className="flex flex-col space-y-2.5">
          <Button variant="primary" size="lg" onClick={takeBreak} className="w-full justify-center">
            <Coffee className="w-4 h-4 mr-2" />
            Start Break in Relax Zone
          </Button>

          <Button variant="ghost" size="md" onClick={dismissBreakModal} className="w-full text-slate-500">
            Continue Studying
          </Button>
        </div>
      </div>
    </div>
  );
};
