import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Flame, Award, Play, Pause, Square, Sun, Moon, Bot, Bell, BellOff, Volume2, ChevronDown, Target, EyeOff, Maximize2, LogOut, Settings, User as UserIcon, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useStudyTimer } from '../../contexts/StudyTimerContext';
import { useNightLight } from '../../contexts/NightLightContext';
import { useChatGPT } from '../../contexts/ChatGPTContext';
import { useFocusMode } from '../../contexts/FocusModeContext';
import { Button } from '../common/Button';
import { StudyClock } from '../common/StudyClock';
import { ChatGPTLoginModal } from '../ai/ChatGPTLoginModal';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const {
    isActive,
    isPaused,
    seconds,
    targetMinutes,
    activeSubject,
    soundEnabled,
    toggleSound,
    playTestChime,
    startSession,
    pauseSession,
    resumeSession,
    finishSession
  } = useStudyTimer();
  const { isNightLight, toggleNightLight } = useNightLight();
  const { isGPTConnected } = useChatGPT();
  const { isFocusMode, toggleFocusMode } = useFocusMode();
  const [isGPTModalOpen, setIsGPTModalOpen] = useState(false);
  const [showPresetsMenu, setShowPresetsMenu] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const formatTimer = (totalSeconds: number) => {
    if (targetMinutes > 0) {
      const remainingSeconds = Math.max(0, targetMinutes * 60 - totalSeconds);
      const mins = Math.floor(remainingSeconds / 60);
      const secs = remainingSeconds % 60;
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartPreset = (mins: number, label: string) => {
    startSession(label, undefined, mins);
    setShowPresetsMenu(false);
  };

  return (
    <header className={`h-16 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20 transition-all ${isFocusMode ? 'bg-white shadow-xs' : ''}`}>
      {/* Left side: In focus mode show minimal focus title; otherwise show portal and clock */}
      <div className="flex items-center space-x-3">
        {isFocusMode ? (
          <div className="flex items-center space-x-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-xs sm:text-sm font-bold text-slate-800 tracking-tight">
              Distraction-Free Focus
            </span>
          </div>
        ) : (
          <>
            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg hidden sm:inline-block">
              Workspace
            </span>
            <span className="text-sm font-medium text-slate-700 hidden md:inline-block">
              {user?.profile?.university || 'University Portal'}
            </span>
            <StudyClock variant="compact" className="hidden lg:inline-flex" />
          </>
        )}
      </div>

      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* Focus Mode Global Toggle Button */}
        <button
          type="button"
          id="focus-mode-global-toggle-btn"
          onClick={toggleFocusMode}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-xs cursor-pointer ${
            isFocusMode
              ? 'bg-slate-900 border-slate-950 text-white shadow-sm ring-2 ring-slate-800/30'
              : 'bg-indigo-50/80 border-indigo-200 text-indigo-700 hover:bg-indigo-100 hover:border-indigo-300'
          }`}
          title={isFocusMode ? 'Focus Mode is ON. Click or press Esc to restore full navigation' : 'Turn on Focus Mode to hide sidebars and non-essential badges'}
        >
          <Target className={`w-3.5 h-3.5 ${isFocusMode ? 'text-emerald-400 animate-spin' : 'text-indigo-600'}`} style={{ animationDuration: '6s' }} />
          <span className="hidden sm:inline">{isFocusMode ? 'Focus Mode ON' : 'Focus Mode'}</span>
        </button>

        {/* Non-essential elements: Hidden in Focus Mode to eliminate clutter */}
        {!isFocusMode && (
          <>
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
              className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                isNightLight
                  ? 'bg-amber-100/90 border-amber-300 text-amber-900 shadow-xs'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
              title="Toggle Blue-Light Eye Protection Filter (Night Light)"
            >
              {isNightLight ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
                  <span className="hidden sm:inline">Night Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-slate-400" />
                  <span className="hidden sm:inline">Night Light</span>
                </>
              )}
            </button>

            {/* Sound Chime Alert Toggle */}
            <button
              type="button"
              id="sound-chime-toggle-btn"
              onClick={toggleSound}
              className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                soundEnabled
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100'
                  : 'bg-slate-50 border-slate-200 text-slate-400 hover:bg-slate-100'
              }`}
              title={soundEnabled ? 'Timer Chime Alert Enabled (Click to Mute)' : 'Timer Chime Muted (Click to Enable)'}
            >
              {soundEnabled ? (
                <Bell className="w-3.5 h-3.5 text-indigo-600" />
              ) : (
                <BellOff className="w-3.5 h-3.5 text-slate-400" />
              )}
              <span className="hidden md:inline text-[11px]">{soundEnabled ? 'Chime ON' : 'Muted'}</span>
            </button>
          </>
        )}

        {/* Live Study Session Timer: Always available for Pomodoro and deep work */}
        <div className="relative">
          <div className="flex items-center bg-blue-50/80 border border-blue-200 rounded-xl px-3 py-1.5 space-x-2.5 shadow-xs">
            <div className="flex items-center space-x-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  isActive ? (isPaused ? 'bg-amber-400' : 'bg-emerald-500 animate-pulse') : 'bg-slate-300'
                }`}
              />
              <div className="text-xs">
                <span className="font-semibold text-slate-700 max-w-[90px] truncate inline-block align-bottom">
                  {isActive ? activeSubject : 'Study Timer'}
                </span>
                {isActive && (
                  <span className="font-mono text-blue-700 font-bold ml-1.5">
                    {formatTimer(seconds)}
                    {targetMinutes > 0 && <span className="text-[10px] text-blue-500 font-normal ml-0.5">rem</span>}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-1 border-l border-blue-200 pl-2">
              {!isActive ? (
                <div className="flex items-center space-x-1">
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => startSession('Deep Work', undefined, 25)}
                    className="!py-1 !px-2 !text-xs"
                    title="Start 25m Pomodoro Deep Work Session"
                  >
                    <Play className="w-3 h-3 mr-1" /> 25m
                  </Button>
                  <button
                    type="button"
                    onClick={() => setShowPresetsMenu(!showPresetsMenu)}
                    className="p-1 hover:bg-blue-100 rounded text-blue-700 transition-colors"
                    title="Choose study duration presets"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                </div>
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
                  <button onClick={finishSession} className="p-1 text-rose-600 hover:bg-rose-100 rounded" title="Finish & Chime">
                    <Square className="w-3.5 h-3.5" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Preset Duration Dropdown */}
          {showPresetsMenu && !isActive && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-30 animate-in fade-in zoom-in-95">
              <div className="px-2 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Focus Presets
              </div>
              <button
                onClick={() => handleStartPreset(25, 'Pomodoro Sprint')}
                className="w-full text-left px-2.5 py-1.5 text-xs text-slate-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg font-medium flex items-center justify-between"
              >
                <span>🍅 25m Pomodoro</span>
                <span className="text-[10px] text-slate-400">Sprint</span>
              </button>
              <button
                onClick={() => handleStartPreset(45, 'Deep Work')}
                className="w-full text-left px-2.5 py-1.5 text-xs text-slate-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg font-medium flex items-center justify-between"
              >
                <span>⚡ 45m Deep Work</span>
                <span className="text-[10px] text-slate-400">Focus</span>
              </button>
              <button
                onClick={() => handleStartPreset(50, 'Lecture Block')}
                className="w-full text-left px-2.5 py-1.5 text-xs text-slate-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg font-medium flex items-center justify-between"
              >
                <span>📚 50m Block</span>
                <span className="text-[10px] text-slate-400">Intense</span>
              </button>
              <button
                onClick={() => handleStartPreset(0, 'Open Session')}
                className="w-full text-left px-2.5 py-1.5 text-xs text-slate-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg font-medium flex items-center justify-between"
              >
                <span>⏱️ Open Stopwatch</span>
                <span className="text-[10px] text-slate-400">No Limit</span>
              </button>
              <div className="border-t border-slate-100 my-1"></div>
              <button
                onClick={playTestChime}
                className="w-full text-left px-2.5 py-1 text-[11px] text-indigo-600 hover:bg-indigo-50 rounded-lg flex items-center space-x-1.5"
              >
                <Volume2 className="w-3 h-3" />
                <span>Test Bell Chime</span>
              </button>
            </div>
          )}
        </div>

        {/* Streak and XP Badges: Non-essential badges hidden in focus mode */}
        {!isFocusMode && (
          <>
            {/* Streak Badge */}
            <div className="hidden sm:flex items-center space-x-1.5 bg-amber-50 text-amber-800 border border-amber-200 px-3 py-1.5 rounded-xl text-xs font-bold">
              <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span>{user?.streak?.current_streak || 1}d</span>
            </div>

            {/* XP Badge */}
            <div className="hidden sm:flex items-center space-x-1.5 bg-blue-50 text-blue-800 border border-blue-200 px-3 py-1.5 rounded-xl text-xs font-bold">
              <Award className="w-4 h-4 text-blue-500" />
              <span>{user?.profile?.xp || 0} XP</span>
            </div>

            {/* User Profile Card: Dynamic real Gmail & Google Profile identity */}
            {user && (
              <div className="relative" ref={profileMenuRef}>
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center space-x-2 pl-1.5 pr-2.5 py-1 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-all text-left group"
                  title="Account Profile & Settings"
                >
                  <img
                    src={user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.full_name || user.email)}`}
                    alt={user.full_name}
                    className="w-8 h-8 rounded-full border border-blue-300 object-cover shrink-0 bg-white"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.email)}`;
                    }}
                  />
                  <div className="hidden md:flex flex-col text-left max-w-[140px] truncate">
                    <span className="text-xs font-semibold text-slate-800 truncate leading-tight group-hover:text-blue-600 transition-colors">
                      {user.full_name || 'Scholar'}
                    </span>
                    <span className="text-[10px] text-slate-500 truncate leading-tight">
                      {user.email}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-transform" />
                </button>

                {/* Profile Dropdown */}
                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                    <div className="p-2.5 border-b border-slate-100 mb-1">
                      <div className="flex items-center space-x-2.5">
                        <img
                          src={user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.full_name || user.email)}`}
                          alt={user.full_name}
                          className="w-10 h-10 rounded-full border border-blue-300 object-cover bg-white shrink-0"
                        />
                        <div className="overflow-hidden">
                          <div className="flex items-center space-x-1">
                            <p className="text-xs font-bold text-slate-900 truncate">
                              {user.full_name}
                            </p>
                            <span title="Verified Account" className="inline-flex items-center">
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 truncate">
                            {user.email}
                          </p>
                          <span className="inline-block mt-0.5 text-[9px] font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded-md">
                            Isolated Session
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        navigate('/settings');
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-600 rounded-xl flex items-center space-x-2 transition-colors"
                    >
                      <Settings className="w-4 h-4 text-slate-400" />
                      <span>Account Settings</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        navigate('/study-hub');
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-600 rounded-xl flex items-center space-x-2 transition-colors"
                    >
                      <UserIcon className="w-4 h-4 text-slate-400" />
                      <span>Study Dashboard</span>
                    </button>

                    <div className="border-t border-slate-100 my-1"></div>

                    <button
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        handleLogout();
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-xl flex items-center space-x-2 transition-colors"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" />
                      <span>Sign Out / Switch Account</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      <ChatGPTLoginModal isOpen={isGPTModalOpen} onClose={() => setIsGPTModalOpen(false)} />
    </header>
  );
};

