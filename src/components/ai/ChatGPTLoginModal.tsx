import React from 'react';
import { X, Bot, CheckCircle, Sparkles, ShieldCheck, Zap, ArrowRight } from 'lucide-react';
import { Button } from '../common/Button';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface ChatGPTLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChatGPTLoginModal: React.FC<ChatGPTLoginModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">ChatGPT & Gemini Studio</h3>
              <p className="text-[11px] text-slate-400">Unified Dual-AI Engine</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50/50 border border-emerald-200 space-y-2">
            <div className="flex items-center space-x-2 text-emerald-900 font-bold text-xs">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>Verified Gmail Access Active</span>
            </div>
            <p className="text-[11px] text-emerald-800 leading-relaxed">
              Your account is authenticated via <strong>{user?.email || 'your verified Google account'}</strong>. You have instant access to both <strong>Gemini 3.7 Flash</strong> and <strong>ChatGPT GPT-4o</strong> with sub-second answers and zero API keys required.
            </p>
          </div>

          <div className="space-y-2.5 text-xs text-slate-700 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
            <div className="flex items-center space-x-2.5">
              <Zap className="w-4 h-4 text-amber-500 shrink-0" />
              <span><strong>Gemini 3.7 Flash</strong> — Ultra-fast answers & summaries</span>
            </div>
            <div className="flex items-center space-x-2.5">
              <Bot className="w-4 h-4 text-emerald-600 shrink-0" />
              <span><strong>ChatGPT 4o & 4o-mini</strong> — In-depth academic explanations</span>
            </div>
            <div className="flex items-center space-x-2.5">
              <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
              <span><strong>Unified Gmail ID</strong> — One login powers all AI features</span>
            </div>
          </div>

          <div className="flex space-x-3 !mt-4">
            <Button
              variant="outline"
              size="md"
              onClick={onClose}
              className="flex-1"
            >
              Close
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={() => {
                onClose();
                navigate('/gemini');
              }}
              className="flex-1 !bg-emerald-600 hover:!bg-emerald-700 !border-emerald-600"
            >
              Open AI Studio
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
