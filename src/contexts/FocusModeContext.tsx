import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useToast } from './ToastContext';

interface FocusModeContextType {
  isFocusMode: boolean;
  toggleFocusMode: () => void;
  setFocusMode: (val: boolean) => void;
}

const FocusModeContext = createContext<FocusModeContextType | undefined>(undefined);

export const FocusModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { showToast } = useToast();
  const [isFocusMode, setIsFocusModeState] = useState<boolean>(() => {
    try {
      return localStorage.getItem('studysphere_focus_mode') === 'true';
    } catch {
      return false;
    }
  });

  const setFocusMode = useCallback((val: boolean) => {
    setIsFocusModeState(val);
    try {
      localStorage.setItem('studysphere_focus_mode', String(val));
    } catch {}
    if (val) {
      showToast('Focus Mode activated — distracting navigation elements hidden.', 'info');
    } else {
      showToast('Focus Mode deactivated — standard navigation restored.', 'info');
    }
  }, [showToast]);

  const toggleFocusMode = useCallback(() => {
    setFocusMode(!isFocusMode);
  }, [isFocusMode, setFocusMode]);

  // Keyboard shortcut listener: Escape key or Alt+F to toggle / exit Focus Mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is actively typing in an input or textarea
      const target = e.target as HTMLElement;
      const isInput = target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA' || target?.isContentEditable;

      if (e.key === 'Escape' && isFocusMode && !isInput) {
        setFocusMode(false);
      } else if ((e.altKey || e.metaKey) && (e.key === 'f' || e.key === 'F')) {
        e.preventDefault();
        toggleFocusMode();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFocusMode, toggleFocusMode, setFocusMode]);

  return (
    <FocusModeContext.Provider value={{ isFocusMode, toggleFocusMode, setFocusMode }}>
      {children}
    </FocusModeContext.Provider>
  );
};

export const useFocusMode = () => {
  const context = useContext(FocusModeContext);
  if (!context) {
    throw new Error('useFocusMode must be used within FocusModeProvider');
  }
  return context;
};
