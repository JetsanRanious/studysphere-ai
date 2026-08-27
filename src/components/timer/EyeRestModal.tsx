import React, { useState, useEffect } from 'react';
import { Eye, X, Sparkles } from 'lucide-react';
import { Button } from '../common/Button';

export const EyeRestModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // 20-20-20 rule timer: check every 20 minutes of active session
    const interval = setInterval(() => {
      const isStudying = localStorage.getItem('studysphere_timer_active') === 'true';
      if (isStudying) {
        setIsOpen(true);
      }
    }, 20 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-slate-200 shadow-2xl space-y-4 text-center">
        <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
          <Eye className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900">20-20-20 Eye Rest Break</h3>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Look at an object at least 20 feet away for 20 seconds to prevent ocular fatigue and keep your focus sharp.
          </p>
        </div>
        <Button variant="primary" size="md" onClick={() => setIsOpen(false)} className="w-full">
          Eyes Rested, Continue!
        </Button>
      </div>
    </div>
  );
};
