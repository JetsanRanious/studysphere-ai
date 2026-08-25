import React from 'react';
import { Sparkles, Check, Copy } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { useToast } from '../../contexts/ToastContext';

interface SummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  summaryText: string;
  keyTakeaways: string[];
}

export const SummaryModal: React.FC<SummaryModalProps> = ({
  isOpen,
  onClose,
  title,
  summaryText,
  keyTakeaways
}) => {
  const { showToast } = useToast();

  const handleCopy = () => {
    navigator.clipboard.writeText(`${summaryText}\n\nKey Takeaways:\n${keyTakeaways.map(t => `• ${t}`).join('\n')}`);
    showToast('Summary copied to clipboard!', 'success');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title || "AI Document Summary"} maxWidth="2xl">
      <div className="space-y-5">
        {/* Main Markdown Body */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 text-sm text-slate-800 leading-relaxed max-h-72 overflow-y-auto whitespace-pre-line font-normal">
          {summaryText}
        </div>

        {/* High-yield takeaways */}
        {keyTakeaways && keyTakeaways.length > 0 && (
          <div>
            <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5 flex items-center">
              <Sparkles className="w-3.5 h-3.5 mr-1.5 text-blue-600" /> Key Exam Takeaways
            </h5>
            <ul className="space-y-2">
              {keyTakeaways.map((point, idx) => (
                <li key={idx} className="flex items-start text-xs text-slate-600 bg-white border border-slate-200/70 p-2.5 rounded-xl">
                  <span className="w-4 h-4 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-[10px] font-bold mr-2 mt-0.5 flex-shrink-0">
                    {idx + 1}
                  </span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <Button variant="outline" size="sm" onClick={handleCopy}>
            <Copy className="w-3.5 h-3.5 mr-1.5" /> Copy Summary
          </Button>
          <Button variant="primary" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};
