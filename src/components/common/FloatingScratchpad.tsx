import React, { useState, useEffect, useRef } from 'react';
import {
  StickyNote,
  X,
  Minimize2,
  Maximize2,
  Copy,
  Trash2,
  Check,
  Sparkles,
  Save,
  Clock,
} from 'lucide-react';

const STORAGE_KEY = 'studysphere_scratchpad_notes';
const POSITION_KEY = 'studysphere_scratchpad_open';

export const FloatingScratchpad: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(() => {
    try {
      return localStorage.getItem(POSITION_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const [notes, setNotes] = useState<string>(() => {
    try {
      return (
        localStorage.getItem(STORAGE_KEY) ||
        '📝 Quick Scratchpad\n- Write formulas, lecture takeaways, or quick reminders here.\n- Automatically saved in your browser storage!'
      );
    } catch {
      return '';
    }
  });

  const [isCopied, setIsCopied] = useState(false);
  const [lastSaved, setLastSaved] = useState<string>('Saved');
  const [isExpanded, setIsExpanded] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, notes);
      setLastSaved(
        new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    } catch (e) {
      console.warn('Failed saving scratchpad note to localStorage:', e);
    }
  }, [notes]);

  useEffect(() => {
    try {
      localStorage.setItem(POSITION_KEY, isOpen ? 'true' : 'false');
    } catch {}
  }, [isOpen]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(notes);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.warn('Copy failed:', err);
    }
  };

  const handleClear = () => {
    if (notes.trim().length === 0) return;
    if (window.confirm('Clear all scratchpad text?')) {
      setNotes('');
      textareaRef.current?.focus();
    }
  };

  const wordCount = notes.trim() ? notes.trim().split(/\s+/).length : 0;
  const charCount = notes.length;

  return (
    <aside aria-label="Quick Scratchpad" className="fixed bottom-6 right-6 z-40 select-none">
      {/* Floating Toggle Button when closed */}
      {!isOpen && (
        <button
          type="button"
          id="scratchpad-toggle-btn"
          onClick={() => {
            setIsOpen(true);
            setTimeout(() => textareaRef.current?.focus(), 100);
          }}
          className="group flex items-center space-x-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white px-4 py-3 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 cursor-pointer border border-amber-400/40"
          title="Open Quick Scratchpad"
        >
          <StickyNote className="w-5 h-5 transition-transform group-hover:-rotate-12" />
          <span className="text-xs font-bold tracking-wide">Scratchpad</span>
          {charCount > 0 && (
            <span className="w-2 h-2 rounded-full bg-emerald-300 ring-2 ring-amber-600 animate-pulse" />
          )}
        </button>
      )}

      {/* Floating Scratchpad Window */}
      {isOpen && (
        <div
          id="floating-scratchpad-window"
          className={`bg-amber-50/95 backdrop-blur-md rounded-2xl border-2 border-amber-200/90 shadow-2xl flex flex-col overflow-hidden transition-all duration-200 ${
            isExpanded
              ? 'w-[90vw] max-w-2xl h-[75vh]'
              : 'w-80 sm:w-96 h-80 sm:h-96'
          }`}
        >
          {/* Scratchpad Header */}
          <div className="bg-amber-100/90 px-4 py-3 border-b border-amber-200/80 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center shadow-xs">
                <StickyNote className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-amber-950 flex items-center space-x-1.5">
                  <span>Quick Scratchpad</span>
                  <span className="text-[10px] font-medium text-amber-700 bg-amber-200/80 px-1.5 py-0.2 rounded-md">
                    Local
                  </span>
                </h4>
                <p className="text-[10px] text-amber-700/80 leading-tight">
                  Auto-saved in browser
                </p>
              </div>
            </div>

            {/* Header Actions */}
            <div className="flex items-center space-x-1">
              <button
                type="button"
                id="scratchpad-copy-btn"
                onClick={handleCopy}
                className="p-1.5 rounded-lg text-amber-800 hover:bg-amber-200/70 transition-colors"
                title="Copy all notes"
              >
                {isCopied ? (
                  <Check className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>

              <button
                type="button"
                id="scratchpad-clear-btn"
                onClick={handleClear}
                className="p-1.5 rounded-lg text-amber-800 hover:bg-amber-200/70 transition-colors"
                title="Clear notes"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <button
                type="button"
                id="scratchpad-expand-btn"
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1.5 rounded-lg text-amber-800 hover:bg-amber-200/70 transition-colors"
                title={isExpanded ? 'Collapse size' : 'Expand size'}
              >
                {isExpanded ? (
                  <Minimize2 className="w-4 h-4" />
                ) : (
                  <Maximize2 className="w-4 h-4" />
                )}
              </button>

              <button
                type="button"
                id="scratchpad-close-btn"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-amber-800 hover:bg-amber-200/70 transition-colors ml-1"
                title="Minimize scratchpad"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Text Area Container */}
          <div className="flex-1 p-3 flex flex-col bg-amber-50/60">
            <textarea
              ref={textareaRef}
              id="scratchpad-textarea"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Type your study scratch notes, formulas, quick reminders..."
              className="w-full flex-1 resize-none bg-transparent text-slate-800 placeholder-amber-800/40 text-xs sm:text-sm font-sans leading-relaxed focus:outline-none focus:ring-0 p-1 border-0"
              spellCheck={false}
            />
          </div>

          {/* Footer Bar */}
          <div className="px-3.5 py-2 bg-amber-100/70 border-t border-amber-200/80 flex items-center justify-between text-[11px] text-amber-900/80 font-medium">
            <div className="flex items-center space-x-3">
              <span>{wordCount} words</span>
              <span className="text-amber-400">•</span>
              <span>{charCount} chars</span>
            </div>

            <div className="flex items-center space-x-1.5 text-[10px] text-amber-800">
              <Clock className="w-3 h-3 text-amber-600" />
              <span>{lastSaved}</span>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
