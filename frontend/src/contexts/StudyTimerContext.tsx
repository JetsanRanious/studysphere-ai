import React, { createContext, useContext, useState, useEffect } from 'react';
import { sessionService } from '../services/allServices';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

interface StudyTimerContextType {
  isActive: boolean;
  isPaused: boolean;
  seconds: number;
  activeSubject: string;
  activeRoomId?: number;
  showBreakModal: boolean;
  startSession: (subject: string, roomId?: number) => void;
  pauseSession: () => void;
  resumeSession: () => void;
  finishSession: () => Promise<void>;
  dismissBreakModal: () => void;
  takeBreak: () => void;
}

const StudyTimerContext = createContext<StudyTimerContextType | undefined>(undefined);

export const StudyTimerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [activeSubject, setActiveSubject] = useState('General Study');
  const [activeRoomId, setActiveRoomId] = useState<number | undefined>();
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [showBreakModal, setShowBreakModal] = useState(false);
  const [lastBreakPromptSeconds, setLastBreakPromptSeconds] = useState(0);

  const { refreshUser, user } = useAuth();
  const { showToast } = useToast();

  const breakIntervalSeconds = (user?.profile?.break_interval_minutes || 30) * 60;

  useEffect(() => {
    let interval: any = null;
    if (isActive && !isPaused) {
      interval = setInterval(() => {
        setSeconds((prev) => {
          const next = prev + 1;
          // Trigger break reminder approximately every 30 minutes
          if (next - lastBreakPromptSeconds >= breakIntervalSeconds) {
            setShowBreakModal(true);
            setLastBreakPromptSeconds(next);
          }
          return next;
        });
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, isPaused, lastBreakPromptSeconds, breakIntervalSeconds]);

  const startSession = (subject: string, roomId?: number) => {
    setActiveSubject(subject || 'General Study');
    setActiveRoomId(roomId);
    setSeconds(0);
    setLastBreakPromptSeconds(0);
    setSessionStartTime(new Date());
    setIsActive(true);
    setIsPaused(false);
    showToast(`Started study session: ${subject}`, 'info');
  };

  const pauseSession = () => {
    setIsPaused(true);
  };

  const resumeSession = () => {
    setIsPaused(false);
  };

  const finishSession = async () => {
    if (!sessionStartTime || seconds < 5) {
      setIsActive(false);
      setIsPaused(false);
      setSeconds(0);
      return;
    }

    try {
      const now = new Date();
      const res = await sessionService.recordSession({
        subject: activeSubject,
        duration_seconds: seconds,
        room_id: activeRoomId,
        started_at: sessionStartTime.toISOString(),
        ended_at: now.toISOString(),
        notes: 'Study session completed via live timer'
      });

      showToast(`Session Complete! Earned +${res.xp_earned} XP 🎉`, 'success');
      await refreshUser();
    } catch (e) {
      showToast('Error saving study session', 'error');
    } finally {
      setIsActive(false);
      setIsPaused(false);
      setSeconds(0);
      setSessionStartTime(null);
    }
  };

  const dismissBreakModal = () => {
    setShowBreakModal(false);
  };

  const takeBreak = () => {
    pauseSession();
    setShowBreakModal(false);
    window.location.href = '/relax';
  };

  return (
    <StudyTimerContext.Provider
      value={{
        isActive,
        isPaused,
        seconds,
        activeSubject,
        activeRoomId,
        showBreakModal,
        startSession,
        pauseSession,
        resumeSession,
        finishSession,
        dismissBreakModal,
        takeBreak
      }}
    >
      {children}
    </StudyTimerContext.Provider>
  );
};

export const useStudyTimer = () => {
  const ctx = useContext(StudyTimerContext);
  if (!ctx) throw new Error('useStudyTimer must be used within StudyTimerProvider');
  return ctx;
};
