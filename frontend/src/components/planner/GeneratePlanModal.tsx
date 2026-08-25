import React, { useState } from 'react';
import { Sparkles, Clock, KeyRound, ChevronDown, ChevronUp, Zap } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { aiService } from '../../services/allServices';
import { useToast } from '../../contexts/ToastContext';
import { useChatGPT } from '../../contexts/ChatGPTContext';

interface GeneratePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlanGenerated: () => void;
}

export const GeneratePlanModal: React.FC<GeneratePlanModalProps> = ({ isOpen, onClose, onPlanGenerated }) => {
  const [prompt, setPrompt] = useState(
    "I have a Cloud Security exam on Monday, Cryptography assignment on Friday, and Network Security test next Wednesday."
  );
  const [dailyHours, setDailyHours] = useState(4);
  const [loading, setLoading] = useState(false);

  const { isGPTConnected } = useChatGPT();
  const { showToast } = useToast();

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    try {
      setLoading(true);
      await aiService.generateStudyPlan(prompt, dailyHours);
      showToast('✅ AI Weekly Study Plan Generated! +30 XP 🎉', 'success');
      onPlanGenerated();
      onClose();
    } catch (e) {
      showToast('Failed to generate study plan. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Generate AI Weekly Study Plan" maxWidth="lg">
      <form onSubmit={handleGenerate} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Describe your upcoming exams, assignments, and goals:
          </label>
          <textarea
            rows={4}
            required
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            placeholder="e.g. I need to prepare for Cloud Security IAM and Cryptography RSA algorithms this week..."
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center">
            <Clock className="w-3.5 h-3.5 mr-1 text-slate-400" />
            Target Daily Study Hours: <strong className="ml-1">{dailyHours} hours / day</strong>
          </label>
          <input
            type="range"
            min="1"
            max="10"
            step="0.5"
            value={dailyHours}
            onChange={(e) => setDailyHours(parseFloat(e.target.value))}
            className="w-full accent-blue-600"
          />
          <div className="flex justify-between text-[11px] text-slate-400 mt-1 font-medium">
            <span>1 hr (Light)</span>
            <span>4 hrs (Balanced)</span>
            <span>10 hrs (Intense)</span>
          </div>
        </div>

        {/* ChatGPT Integration toggle */}
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <div className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 transition-colors text-left">
            <div className="flex items-center space-x-2">
              <Zap className={`w-4 h-4 ${isGPTConnected ? 'text-emerald-500' : 'text-slate-400'}`} />
              <span className="text-xs font-semibold text-slate-700">
                ChatGPT Integration
              </span>
              {isGPTConnected ? (
                <span className="inline-flex items-center text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-full">
                  ● Connected
                </span>
              ) : (
                <span className="inline-flex items-center text-[10px] font-bold text-slate-500 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded-full">
                  Not Connected
                </span>
              )}
            </div>
            {!isGPTConnected && (
              <span className="text-[10px] text-slate-500">Connect in top navigation bar</span>
            )}
          </div>
        </div>

        <div className="bg-blue-50/70 border border-blue-200/80 rounded-xl p-3 text-xs text-blue-900 leading-relaxed">
          💡 <strong>Smart Scheduling:</strong> StudySphere AI automatically balances topic depth, respects your available hours, and slots in eye-rest buffers.
          {isGPTConnected && ' ChatGPT will create a custom plan based on your exact input.'}
        </div>

        <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary" isLoading={loading}>
            <Sparkles className="w-4 h-4 mr-1.5" /> Synthesize Weekly Plan
          </Button>
        </div>
      </form>
    </Modal>
  );
};
