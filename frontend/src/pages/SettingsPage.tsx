import React, { useState, useEffect } from 'react';
import { User, Settings, Clock, Bot, Bell, ShieldCheck, Sun, Moon, Sparkles } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { useAuth } from '../contexts/AuthContext';
import { useNightLight } from '../contexts/NightLightContext';
import { authService } from '../services/allServices';
import { useToast } from '../contexts/ToastContext';

export const SettingsPage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const { isNightLight, intensity, setNightLight, setIntensity } = useNightLight();
  const { showToast } = useToast();

  const [fullName, setFullName] = useState(user?.full_name || 'Jetsan');
  const [major, setMajor] = useState(user?.profile?.major || 'Cloud & Cyber Security');
  const [university, setUniversity] = useState(user?.profile?.university || 'Stanford University');
  const [dailyGoal, setDailyGoal] = useState(user?.profile?.daily_goal_minutes || 180);
  const [breakInterval, setBreakInterval] = useState(user?.profile?.break_interval_minutes || 30);
  
  const [ollamaUrl, setOllamaUrl] = useState('http://localhost:11434');
  const [ollamaModel, setOllamaModel] = useState('llama3');
  const [openaiKey, setOpenaiKey] = useState(() => localStorage.getItem('studysphere_openai_key') || '');
  const [openaiModel, setOpenaiModel] = useState(() => localStorage.getItem('studysphere_openai_model') || 'gpt-4o');

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
      if (openaiKey) {
        localStorage.setItem('studysphere_openai_key', openaiKey);
      } else {
        localStorage.removeItem('studysphere_openai_key');
      }
      localStorage.setItem('studysphere_openai_model', openaiModel);

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
        <p className="text-xs text-slate-500 mt-0.5">Customize your profile, eye protection filters, and AI connections</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <Card>
          <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center">
            <User className="w-4 h-4 mr-2 text-blue-600" /> Student Profile
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
              <input
                type="text"
                disabled
                value={user?.email || 'student@studysphere.ai'}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-100 bg-slate-50 text-sm text-slate-400 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Major / Course</label>
              <input
                type="text"
                value={major}
                onChange={(e) => setMajor(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">University</label>
              <input
                type="text"
                value={university}
                onChange={(e) => setUniversity(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center">
            <Sun className="w-4 h-4 mr-2 text-amber-500" /> Night Light Blue-Light Protection
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50/80 border border-amber-200">
              <div>
                <p className="text-xs font-bold text-amber-900">Circadian Warm Amber Spectrum Filter</p>
                <p className="text-[11px] text-amber-800">Reduces high-energy 450nm blue light to minimize evening eye strain</p>
              </div>
              <input
                type="checkbox"
                checked={isNightLight}
                onChange={(e) => setNightLight(e.target.checked)}
                className="w-5 h-5 accent-amber-600 rounded cursor-pointer"
              />
            </div>

            {isNightLight && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Warmth Intensity: <strong>{intensity}%</strong>
                </label>
                <input
                  type="range"
                  min="10"
                  max="45"
                  value={intensity}
                  onChange={(e) => setIntensity(parseInt(e.target.value, 10))}
                  className="w-full accent-amber-500"
                />
              </div>
            )}
          </div>
        </Card>

        <Card>
          <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center">
            <Clock className="w-4 h-4 mr-2 text-blue-600" /> Study & Wellness Goals
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Daily Study Goal: <strong>{dailyGoal / 60} hours ({dailyGoal} mins)</strong>
              </label>
              <input
                type="range"
                min="60"
                max="480"
                step="30"
                value={dailyGoal}
                onChange={(e) => setDailyGoal(parseInt(e.target.value, 10))}
                className="w-full accent-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Eye-Rest Break Reminder: <strong>Every {breakInterval} minutes</strong>
              </label>
              <select
                value={breakInterval}
                onChange={(e) => setBreakInterval(parseInt(e.target.value, 10))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                <option value={25}>25 Minutes (Pomodoro)</option>
                <option value={30}>30 Minutes (Recommended)</option>
                <option value={45}>45 Minutes (Extended)</option>
                <option value={60}>60 Minutes (Long Focus)</option>
              </select>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center">
            <Bot className="w-4 h-4 mr-2 text-blue-600" /> AI Provider & ChatGPT Integration
          </h3>

          <div className="space-y-4">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <h4 className="text-xs font-bold text-slate-800">OpenAI / ChatGPT Account Connection</h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">OpenAI API Key (sk-...)</label>
                  <input
                    type="password"
                    value={openaiKey}
                    onChange={e => setOpenaiKey(e.target.value)}
                    placeholder="sk-proj-..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Model Version</label>
                  <select
                    value={openaiModel}
                    onChange={e => setOpenaiModel(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    <option value="gpt-4o">GPT-4o (High Intelligence)</option>
                    <option value="gpt-4o-mini">GPT-4o Mini (Fast & Efficient)</option>
                    <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
              <div className="flex items-center space-x-2">
                <Bot className="w-4 h-4 text-blue-600" />
                <h4 className="text-xs font-bold text-slate-800">Ollama Local LLM Endpoint</h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Ollama Base URL</label>
                  <input
                    type="text"
                    value={ollamaUrl}
                    onChange={(e) => setOllamaUrl(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Ollama Model</label>
                  <input
                    type="text"
                    value={ollamaModel}
                    onChange={(e) => setOllamaModel(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
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
