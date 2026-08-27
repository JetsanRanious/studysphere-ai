import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { EyeRestModal } from '../timer/EyeRestModal';
import { CreateRoomModal } from '../rooms/CreateRoomModal';
import { FloatingScratchpad } from '../common/FloatingScratchpad';
import { useFocusMode } from '../../contexts/FocusModeContext';
import { Sparkles, EyeOff, X } from 'lucide-react';

export const AppLayout: React.FC = () => {
  const [isCreateRoomOpen, setIsCreateRoomOpen] = useState(false);
  const { isFocusMode, toggleFocusMode } = useFocusMode();

  return (
    <div className={`flex min-h-screen ${isFocusMode ? 'bg-[#F1F5F9]' : 'bg-[#F8FAFC]'} transition-colors duration-200`}>
      {/* Hide Sidebar when Focus Mode is active */}
      {!isFocusMode && <Sidebar onOpenCreateRoom={() => setIsCreateRoomOpen(true)} />}

      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />

        {/* Optional Focus Mode Header Banner */}
        {isFocusMode && (
          <div className="bg-slate-900 text-slate-100 px-6 py-2 flex items-center justify-between text-xs shadow-inner animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-bold text-white tracking-wide">Focus Mode Active</span>
              <span className="text-slate-400 hidden sm:inline">• Non-essential navigation & badges hidden for deep study</span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-[11px] text-slate-400 hidden md:inline">Press <kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 font-mono text-[10px] text-slate-300">Esc</kbd> to exit</span>
              <button
                onClick={toggleFocusMode}
                className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors cursor-pointer border border-slate-700"
              >
                <X className="w-3.5 h-3.5" />
                <span>Exit Focus</span>
              </button>
            </div>
          </div>
        )}

        <main className={`flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto ${isFocusMode ? 'max-w-6xl' : ''}`}>
          <Outlet />
        </main>
      </div>

      {/* Persistent Floating Quick Scratchpad */}
      <FloatingScratchpad />

      {/* Wellness Eye Rest Reminder Trigger */}
      <EyeRestModal />

      {/* Global Quick Create Room Modal */}
      <CreateRoomModal
        isOpen={isCreateRoomOpen}
        onClose={() => setIsCreateRoomOpen(false)}
        onCreated={() => {
          setIsCreateRoomOpen(false);
          window.location.reload();
        }}
      />
    </div>
  );
};
