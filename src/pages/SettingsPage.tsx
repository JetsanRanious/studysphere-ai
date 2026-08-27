import React, { useState } from 'react';
import { User, Settings, Clock, Bot, Bell, ShieldCheck, Sun, Moon, Sparkles, CheckCircle2, Target, EyeOff } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { useAuth } from '../contexts/AuthContext';
import { useNightLight } from '../contexts/NightLightContext';
import { useFocusMode } from '../contexts/FocusModeContext';
import { authService } from '../services/allServices';
import { useToast } from '../contexts/ToastContext';
import { audioChime } from '../utils/audioChime';

export const SettingsPage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const { isNightLight, intensity, setNightLight, setIntensity } = useNightLight();
  const { isFocusMode, toggleFocusMode, setFocusMode } = useFocusMode();
  const { showToast } = useToast();

  const [fullName, setFullName] = useState(user?.full_name || 'Scholar');
  const [major, setMajor] = useState(user?.profile?.major || 'Cloud & Cyber Security');
  const [university, setUniversity] = useState(user?.profile?.university || 'Stanford University');
  const [dailyGoal, setDailyGoal] = useState(user?.profile?.daily_goal_minutes || 180);
  const [breakInterval, setBreakInterval] = useState(user?.profile?.break_interval_minutes || 30);
  const [loading, setLoading] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await authService.updateProfile({
        full_name: fullName,
        major,
        university,
        daily_goal_minutes: dailyGoal,
        break_interval_minutes: breakInterval
      });
      await refreshUser();
      showToast('Settings saved successfully!', 'success');
    } catch (e) {
      showToast('Failed to update profile settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Platform Settings</h1>
        <p className="text-xs text-slate-500 mt-0.5">Customize your profile, eye protection filters, and study preferences</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Profile Settings */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-800 flex items-center">
              <User className="w-4 h-4 mr-2 text-blue-600" /> Scholar Profile & Authenticated Identity
            </h3>
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Verified Session
            </span>
          </div>

          <div className="flex items-center space-x-4 p-3 bg-slate-50 rounded-2xl border border-slate-100 mb-5">
            <img
              src={user?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user?.full_name || user?.email || 'scholar')}`}
              alt={user?.full_name}
              className="w-14 h-14 rounded-full border-2 border-white shadow-sm object-cover bg-white shrink-0"
            />
            <div className="overflow-hidden">
              <div className="flex items-center space-x-2">
                <h4 className="text-sm font-bold text-slate-900 truncate">{user?.full_name}</h4>
                {user?.google_id && (
                  <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                    Google Connected
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Workspace ID: <code className="font-mono text-slate-600 bg-slate-200/60 px-1 py-0.5 rounded">usr-{user?.id || 1}</code>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name / Display Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Gmail / Email Address <span className="text-slate-400 font-normal">(Isolated Identity)</span>
              </label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-100 text-slate-600 cursor-not-allowed font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Academic Field / Major</label>
              <input
                type="text"
                value={major}
                onChange={(e) => setMajor(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Institution / University</label>
              <input
                type="text"
                value={university}
                onChange={(e) => setUniversity(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>
        </Card>

        {/* Study Habits & Targets */}
        <Card>
          <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center">
            <Clock className="w-4 h-4 mr-2 text-blue-600" /> Study Goals & Cadence
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Daily Study Target (Minutes)</label>
              <input
                type="number"
                min="15"
                max="720"
                step="15"
                value={dailyGoal}
                onChange={(e) => setDailyGoal(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Recommended Break Interval (Minutes)</label>
              <input
                type="number"
                min="10"
                max="120"
                step="5"
                value={breakInterval}
                onChange={(e) => setBreakInterval(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>
        </Card>

        {/* Focus Mode & Distraction Reduction */}
        <Card>
          <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center">
            <Target className="w-4 h-4 mr-2 text-indigo-600" /> Deep Work & Distraction Reduction (Focus Mode)
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-indigo-50/60 border border-indigo-100">
              <div>
                <p className="text-xs font-bold text-slate-800">Global Focus Mode</p>
                <p className="text-[11px] text-slate-500">
                  Hides the main sidebar, non-essential status badges, and external widgets to maximize screen real estate and reduce cognitive distractions during deep study sessions.
                </p>
              </div>
              <Button
                type="button"
                variant={isFocusMode ? "primary" : "outline"}
                size="sm"
                onClick={toggleFocusMode}
                className={isFocusMode ? "!bg-slate-900 !text-white !border-slate-900" : "text-indigo-700 border-indigo-200 hover:bg-indigo-100"}
              >
                {isFocusMode ? 'Focus Active 🎯' : 'Enable Focus Mode'}
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="font-semibold text-slate-800 block mb-1">Keyboard Shortcuts</span>
                <p className="text-[11px] text-slate-500">
                  Press <kbd className="px-1.5 py-0.5 bg-white rounded border border-slate-300 font-mono text-[10px] text-slate-700 shadow-2xs">Esc</kbd> anytime to exit Focus Mode, or <kbd className="px-1.5 py-0.5 bg-white rounded border border-slate-300 font-mono text-[10px] text-slate-700 shadow-2xs">Alt + F</kbd> to toggle instantly.
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="font-semibold text-slate-800 block mb-1">Distraction-Free Layout</span>
                <p className="text-[11px] text-slate-500">
                  Streamlines top navigation strictly to the active Pomodoro timer and study stopwatch while keeping floating tools neatly accessible.
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Night Light & Eye Protection */}
        <Card>
          <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center">
            <Sun className="w-4 h-4 mr-2 text-amber-500" /> Circadian Night Light & Sounds
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-amber-50/60 border border-amber-100">
              <div>
                <p className="text-xs font-bold text-slate-800">Warm Amber Eye Protection</p>
                <p className="text-[11px] text-slate-500">
                  Filters high-energy blue wavelengths for comfortable night studying.
                </p>
              </div>
              <Button
                type="button"
                variant={isNightLight ? "primary" : "outline"}
                size="sm"
                onClick={() => setNightLight(!isNightLight)}
              >
                {isNightLight ? 'Active 🌙' : 'Enable ☀️'}
              </Button>
            </div>

            {isNightLight && (
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700">Filter Intensity</span>
                  <span className="font-bold text-amber-600">{intensity}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="70"
                  value={intensity}
                  onChange={(e) => setIntensity(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>
            )}

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-indigo-50/60 border border-indigo-100">
              <div>
                <p className="text-xs font-bold text-slate-800">Soothing Completion Chime</p>
                <p className="text-[11px] text-slate-500">
                  Plays a peaceful 4-note acoustic bell chord when your study session or Pomodoro countdown finishes.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => audioChime.playSessionCompleteChime()}
                className="text-indigo-700 border-indigo-200 hover:bg-indigo-100"
              >
                Test Chime 🔔
              </Button>
            </div>
          </div>
        </Card>

        {/* AI Access Status Card */}
        <Card>
          <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center">
            <Bot className="w-4 h-4 mr-2 text-blue-600" /> AI Provider & System Access
          </h3>

          <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/60 space-y-2">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <h4 className="text-xs font-bold text-emerald-900">Built-in AI & Google Integration Active</h4>
            </div>
            <p className="text-xs text-emerald-700 leading-relaxed">
              StudySphere AI provides unified, zero-setup access to Google Gemini and study assistance. All models are authenticated automatically through your student session — no external API keys required.
            </p>
          </div>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" variant="primary" size="lg" isLoading={loading}>
            Save Preferences
          </Button>
        </div>
      </form>
    </div>
  );
};
