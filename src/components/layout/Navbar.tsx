import React, { useState } from 'react';
import { Flame, Award, Play, Pause, Square, Sun, Moon, Bot } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useStudyTimer } from '../../contexts/StudyTimerContext';
import { useNightLight } from '../../contexts/NightLightContext';
import { useChatGPT } from '../../contexts/ChatGPTContext';
import { Button } from '../common/Button';
import { StudyClock } from '../common/StudyClock';
import { ChatGPTLoginModal } from '../ai/ChatGPTLoginModal';

export const Navbar: React.FC = () => {
  const { user } = useAuth();
  const { isActive, isPaused, seconds, activeSubject, startSession, pauseSession, resumeSession, finishSession } = useStudyTimer();
  const { isNightLight, toggleNightLight } = useNightLight();
  const { isGPTConnected } = useChatGPT();
  const [isGPTModalOpen, setIsGPTModalOpen] = useState(false);

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center space-x-3">
        <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg hidden sm:inline-block">
          Workspace
        </span>
        <span className="text-sm font-medium text-slate-700 hidden md:inline-block">
          {user?.profile?.university || 'University Portal'}
        </span>
        <StudyClock variant="compact" className="hidden lg:inline-flex" />
      </div>

      <div className="flex items-center space-x-3 sm:space-x-4">
        {/* ChatGPT Connect Button */}
        <button
          onClick={() => setIsGPTModalOpen(true)}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all shadow-xs ${
            isGPTConnected
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100'
              : 'bg-white border-blue-200 text-blue-700 hover:bg-blue-50'
          }`}
          title="Connect OpenAI Account"
        >
          <Bot className={`w-3.5 h-3.5 ${isGPTConnected ? 'text-emerald-600' : 'text-blue-600'}`} />
          <span className="hidden sm:inline">{isGPTConnected ? 'ChatGPT Active' : 'Connect ChatGPT'}</span>
        </button>

        {/* Night Light Eye Protection Toggle */}
        <button
          onClick={toggleNightLight}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
            isNightLight
              ? 'bg-amber-100/90 border-amber-300 text-amber-900 shadow-xs'
              : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
          }`}
          title="Toggle Blue-Light Eye Protection Filter (Night Light)"
        >
          {isNightLight ? (
            <>
              <Sun className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
              <span>Night Light ON</span>
            </>
          ) : (
            <>
              <Moon className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">Night Light</span>
            </>
          )}
        </button>

        {/* Live Study Session Timer */}
        <div className="flex items-center bg-blue-50/70 border border-blue-200/80 rounded-xl px-3 py-1.5 space-x-3">
          <div className="flex items-center space-x-2">
            <span className={`w-2 h-2 rounded-full ${isActive ? (isPaused ? 'bg-amber-400' : 'bg-emerald-500 animate-pulse') : 'bg-slate-300'}`} />
            <div className="text-xs">
              <span className="font-semibold text-slate-700">{isActive ? activeSubject : 'Study Timer'}</span>
              {isActive && <span className="font-mono text-blue-700 font-bold ml-2">{formatTimer(seconds)}</span>}
            </div>
          </div>

          <div className="flex items-center space-x-1 border-l border-blue-200 pl-2">
            {!isActive ? (
              <Button size="sm" variant="primary" onClick={() => startSession('General Study')} className="!py-1 !px-2.5 !text-xs">
                <Play className="w-3 h-3 mr-1" /> Start
              </Button>
            ) : (
              <>
                {isPaused ? (
                  <button onClick={resumeSession} className="p-1 text-blue-600 hover:bg-blue-100 rounded" title="Resume">
                    <Play className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button onClick={pauseSession} className="p-1 text-slate-600 hover:bg-blue-100 rounded" title="Pause">
                    <Pause className="w-3.5 h-3.5" />
                  </button>
                )}
                <button onClick={finishSession} className="p-1 text-rose-600 hover:bg-rose-100 rounded" title="Finish & Save">
                  <Square className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Streak Badge */}
        <div className="flex items-center space-x-1.5 bg-amber-50 text-amber-800 border border-amber-200 px-3 py-1.5 rounded-xl text-xs font-bold">
          <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
          <span>{user?.streak?.current_streak || 1}d</span>
        </div>

        {/* XP Badge */}
        <div className="flex items-center space-x-1.5 bg-blue-50 text-blue-800 border border-blue-200 px-3 py-1.5 rounded-xl text-xs font-bold">
          <Award className="w-4 h-4 text-blue-500" />
          <span>{user?.profile?.xp || 0} XP</span>
        </div>
      </div>

      <ChatGPTLoginModal isOpen={isGPTModalOpen} onClose={() => setIsGPTModalOpen(false)} />
    </header>
  );
};
