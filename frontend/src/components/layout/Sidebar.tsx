import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  FileText,
  Bot,
  CalendarDays,
  CheckSquare,
  Sparkles,
  Gamepad2,
  Trophy,
  BarChart3,
  Settings,
  LogOut,
  ChevronRight,
  Plus
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { roomService } from '../../services/allServices';
import { StudyRoom } from '../../types';

interface SidebarProps {
  onOpenCreateRoom?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onOpenCreateRoom }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<StudyRoom[]>([]);

  useEffect(() => {
    roomService.getRooms().then(setRooms).catch(() => {});
  }, []);

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/planner', label: 'AI Planner', icon: CalendarDays },
    { to: '/chatgpt', label: 'ChatGPT', icon: Sparkles },
    { to: '/chat', label: 'Document Chat', icon: Bot },
    { to: '/documents', label: 'Documents', icon: FileText },
    { to: '/tasks', label: 'Tasks & Deadlines', icon: CheckSquare },
    { to: '/analytics', label: 'Study Analytics', icon: BarChart3 },
    { to: '/relax', label: 'Relax Zone', icon: Gamepad2 },
    { to: '/achievements', label: 'Achievements', icon: Trophy },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen sticky top-0 z-30 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-100 flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/dashboard')}>
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-sky-400 flex items-center justify-center text-white shadow-sm shadow-blue-200">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-base font-bold text-slate-800 tracking-tight flex items-center">
            StudySphere <span className="text-blue-600 ml-1">AI</span>
          </h1>
          <p className="text-xs text-slate-400 font-medium">Study Companion</p>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        <div>
          <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Main Menu</p>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-blue-50 text-blue-600 font-semibold shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Study Rooms Section */}
        <div>
          <div className="flex items-center justify-between px-3 mb-2">
            <NavLink to="/rooms" className="text-xs font-semibold text-slate-400 uppercase tracking-wider hover:text-slate-600 flex items-center">
              <span>My Rooms</span>
              <ChevronRight className="w-3 h-3 ml-0.5" />
            </NavLink>
            <button
              onClick={onOpenCreateRoom || (() => navigate('/rooms'))}
              className="text-slate-400 hover:text-blue-600 p-0.5 rounded transition-colors"
              title="Create Study Room"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-1">
            {rooms.slice(0, 4).map((room) => (
              <NavLink
                key={room.id}
                to={`/rooms/${room.id}`}
                className={({ isActive }) =>
                  `flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all truncate ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`
                }
              >
                <div
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: room.color || '#3B82F6' }}
                />
                <span className="truncate">{room.name}</span>
              </NavLink>
            ))}
            <NavLink
              to="/rooms"
              className="flex items-center space-x-2 px-3 py-1.5 text-xs text-blue-600 hover:underline font-medium"
            >
              <span>View all rooms ({rooms.length})</span>
            </NavLink>
          </div>
        </div>
      </div>

      {/* User Profile Footer */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/50">
        <div className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-100/80 transition-colors">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/settings')}>
            <img
              src={user?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.full_name || 'User'}`}
              alt="Avatar"
              className="w-9 h-9 rounded-xl bg-blue-100 border border-blue-200"
            />
            <div className="truncate max-w-[100px]">
              <p className="text-xs font-bold text-slate-800 truncate">{user?.full_name || 'Student'}</p>
              <p className="text-[11px] text-slate-500 truncate">Lvl {user?.profile?.level || 1} • {user?.profile?.xp || 0} XP</p>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => navigate('/settings')}
              className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-white"
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              onClick={logout}
              className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-white"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};
