import React, { createContext, useContext, useState, useEffect } from 'react';
import { sessionService } from '../services/allServices';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { audioChime } from '../utils/audioChime';

interface StudyTimerContextType {
  isActive: boolean;
  isPaused: boolean;
  seconds: number;
  targetMinutes: number; // 0 = open stopwatch, >0 = countdown target
  activeSubject: string;
  activeRoomId?: number;
  showBreakModal: boolean;
  soundEnabled: boolean;
  setTargetMinutes: (minutes: number) => void;
  toggleSound: () => boolean;
  playTestChime: () => void;
  startSession: (subject: string, roomId?: number, targetMins?: number) => void;
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
  const [targetMinutes, setTargetMinutesState] = useState<number>(0);
  const [activeSubject, setActiveSubject] = useState('General Study');
  const [activeRoomId, setActiveRoomId] = useState<number | undefined>();
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [showBreakModal, setShowBreakModal] = useState(false);
  const [lastBreakPromptSeconds, setLastBreakPromptSeconds] = useState(0);
  const [soundEnabled, setSoundEnabledState] = useState<boolean>(() => audioChime.isSoundEnabled());

  const { refreshUser, user } = useAuth();
  const { showToast } = useToast();

  const breakIntervalSeconds = (user?.profile?.break_interval_minutes || 30) * 60;

  const toggleSound = () => {
    const newState = audioChime.toggleSound();
    setSoundEnabledState(newState);
    showToast(newState ? 'Chime sound enabled 🔔' : 'Chime sound muted 🔕', 'info');
    return newState;
  };

  const playTestChime = () => {
    audioChime.playSessionCompleteChime();
  };

  const setTargetMinutes = (mins: number) => {
    setTargetMinutesState(mins);
  };

  // Timer Tick
  useEffect(() => {
    let interval: any = null;
    if (isActive && !isPaused) {
      interval = setInterval(() => {
        setSeconds((prev) => {
          const next = prev + 1;

          // Check if Target Countdown reached
          if (targetMinutes > 0 && next >= targetMinutes * 60) {
            // Play gentle completion chime
            audioChime.playSessionCompleteChime();
            showToast(`⏰ Deep Work Timer (${targetMinutes}m) Completed! Great focus session.`, 'success');
            // Auto finish or prompt
            setTimeout(() => {
              finishSession();
            }, 500);
            return next;
          }

          // Trigger break reminder approximately every 30 minutes
          if (next - lastBreakPromptSeconds >= breakIntervalSeconds) {
            audioChime.playBreakReminderChime();
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
  }, [isActive, isPaused, lastBreakPromptSeconds, breakIntervalSeconds, targetMinutes]);

  const startSession = (subject: string, roomId?: number, targetMins?: number) => {
    setActiveSubject(subject || 'General Study');
    setActiveRoomId(roomId);
    if (targetMins !== undefined) {
      setTargetMinutesState(targetMins);
    }
    setSeconds(0);
    setLastBreakPromptSeconds(0);
    setSessionStartTime(new Date());
    setIsActive(true);
    setIsPaused(false);
    
    const targetLabel = (targetMins || targetMinutes) > 0 ? ` (${targetMins || targetMinutes}m target)` : '';
    showToast(`Started study session: ${subject}${targetLabel}`, 'info');
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
      // Play harmonic session completion chime
      audioChime.playSessionCompleteChime();

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
        targetMinutes,
        activeSubject,
        activeRoomId,
        showBreakModal,
        soundEnabled,
        setTargetMinutes,
        toggleSound,
        playTestChime,
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

