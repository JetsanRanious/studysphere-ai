import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  Users,
  FileText,
  Sparkles,
  Award,
  Settings,
  LogOut,
  Coffee,
  Plus
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
  onOpenCreateRoom?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onOpenCreateRoom }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/planner', label: 'AI Planner', icon: Calendar },
    { to: '/rooms', label: 'Study Rooms', icon: Users },
    { to: '/documents', label: 'Document Vault', icon: FileText },
    { to: '/gemini', label: 'AI Studio (Gemini & GPT)', icon: Sparkles },
    { to: '/relax', label: 'Relax Zone', icon: Coffee },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const displayName = user?.full_name || (user?.email ? user.email.split('@')[0] : 'Student Scholar');
  const userInitials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col justify-between shrink-0 min-h-screen">
      {/* Brand Header */}
      <div>
        <div
          className="h-16 px-6 border-b border-slate-100 flex items-center space-x-3 cursor-pointer"
          onClick={() => navigate('/dashboard')}
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-sky-400 flex items-center justify-center text-white shadow-md shadow-blue-200">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-extrabold text-slate-800 text-base tracking-tight">
              StudySphere <span className="text-blue-600">AI</span>
            </h1>
            <p className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">Active Study Hub</p>
          </div>
        </div>

        {/* Quick Action Button */}
        {onOpenCreateRoom && (
          <div className="p-4 pb-2">
            <button
              onClick={onOpenCreateRoom}
              className="w-full flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200/80 transition-colors text-xs font-bold shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Study Room</span>
            </button>
          </div>
        )}

        {/* Navigation links */}
        <nav className="p-4 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* User Profile Footer */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 overflow-hidden">
            {user?.avatar_url && !user.avatar_url.includes('dicebear') ? (
              <img
                src={user.avatar_url}
                alt={displayName}
                className="w-9 h-9 rounded-xl object-cover ring-1 ring-slate-200 shrink-0"
              />
            ) : (
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center text-xs font-extrabold shrink-0 shadow-xs">
                {userInitials || 'ST'}
              </div>
            )}
            <div className="truncate">
              <p className="text-xs font-bold text-slate-800 truncate" title={displayName}>
                {displayName}
              </p>
              <p className="text-[11px] text-slate-400 truncate" title={user?.email || 'Logged in'}>
                {user?.email || 'student@studysphere.ai'}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Log Out"
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
