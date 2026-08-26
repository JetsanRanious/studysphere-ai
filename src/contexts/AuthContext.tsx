import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { authService } from '../services/allServices';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  demoLogin: (email?: string, name?: string) => Promise<void>;
  register: (email: string, pass: string, name: string) => Promise<void>;
  googleLogin: (payload?: { credential?: string; email?: string; full_name?: string; avatar_url?: string } | string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('studysphere_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('studysphere_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (token) {
      authService.getMe()
        .then((userData) => {
          setUser(userData);
          localStorage.setItem('studysphere_user', JSON.stringify(userData));
        })
        .catch(() => {
          logout();
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [token]);

  const login = async (email: string, pass: string) => {
    const data = await authService.login(email, pass);
    localStorage.setItem('studysphere_token', data.access_token);
    localStorage.setItem('studysphere_user', JSON.stringify(data.user));
    setToken(data.access_token);
    setUser(data.user);
  };

  const demoLogin = async (email = 'student@studysphere.ai', name = 'Jetsan') => {
    try {
      const data = await authService.demoLogin(email, name);
      localStorage.setItem('studysphere_token', data.access_token);
      localStorage.setItem('studysphere_user', JSON.stringify(data.user));
      setToken(data.access_token);
      setUser(data.user);
    } catch (err) {
      console.warn('Backend demo-login failed, initializing client demo session:', err);
      const fallbackUser: User = {
        id: 1,
        email,
        full_name: name,
        avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
        is_active: true,
        created_at: new Date().toISOString(),
        profile: {
          major: 'Cloud & Cyber Security',
          university: 'Stanford University',
          bio: 'Student passionate about cloud security, IAM architecture, and zero trust.',
          daily_goal_minutes: 180,
          break_interval_minutes: 30,
          default_session_minutes: 45,
          theme_preference: 'system',
          xp: 420,
          level: 3,
        },
        streak: {
          current_streak: 7,
          longest_streak: 12,
          last_activity_date: new Date().toISOString(),
        },
      };
      const fallbackToken = 'demo-session-token-' + Date.now();
      localStorage.setItem('studysphere_token', fallbackToken);
      localStorage.setItem('studysphere_user', JSON.stringify(fallbackUser));
      setToken(fallbackToken);
      setUser(fallbackUser);
    }
  };

  const register = async (email: string, pass: string, name: string) => {
    try {
      const data = await authService.register(email, pass, name);
      localStorage.setItem('studysphere_token', data.access_token);
      localStorage.setItem('studysphere_user', JSON.stringify(data.user));
      setToken(data.access_token);
      setUser(data.user);
    } catch (err: any) {
      if (err.response?.data?.detail) throw err;
      // Client fallback if network hiccup
      const newUser: User = {
        id: Date.now(),
        email,
        full_name: name,
        avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
        is_active: true,
        created_at: new Date().toISOString(),
        profile: {
          major: 'Computer Science',
          university: 'University',
          bio: 'StudySphere AI scholar.',
          daily_goal_minutes: 180,
          break_interval_minutes: 30,
          default_session_minutes: 45,
          theme_preference: 'system',
          xp: 50,
          level: 1,
        },
        streak: {
          current_streak: 1,
          longest_streak: 1,
          last_activity_date: new Date().toISOString(),
        },
      };
      const fallbackToken = 'session-token-' + Date.now();
      localStorage.setItem('studysphere_token', fallbackToken);
      localStorage.setItem('studysphere_user', JSON.stringify(newUser));
      setToken(fallbackToken);
      setUser(newUser);
    }
  };

  const googleLogin = async (payload?: { credential?: string; email?: string; full_name?: string; avatar_url?: string } | string) => {
    try {
      const data = await authService.googleAuth(payload || {});
      localStorage.setItem('studysphere_token', data.access_token);
      localStorage.setItem('studysphere_user', JSON.stringify(data.user));
      setToken(data.access_token);
      setUser(data.user);
    } catch (err) {
      console.warn('Backend google auth failed, initializing Google session fallback:', err);
      const email = typeof payload === 'object' && payload?.email ? payload.email : 'jetsanranious@gmail.com';
      const name = typeof payload === 'object' && payload?.full_name ? payload.full_name : 'Jetsan Ranious';
      const avatar = typeof payload === 'object' && payload?.avatar_url ? payload.avatar_url : `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`;
      const googleUser: User = {
        id: 2,
        email,
        full_name: name,
        avatar_url: avatar,
        is_active: true,
        created_at: new Date().toISOString(),
        profile: {
          major: 'Cloud & Cyber Security',
          university: 'Stanford University',
          bio: 'Google authenticated scholar on StudySphere AI.',
          daily_goal_minutes: 180,
          break_interval_minutes: 30,
          default_session_minutes: 45,
          theme_preference: 'system',
          xp: 350,
          level: 2,
        },
        streak: {
          current_streak: 5,
          longest_streak: 9,
          last_activity_date: new Date().toISOString(),
        },
      };
      const googleToken = 'google-session-token-' + Date.now();
      localStorage.setItem('studysphere_token', googleToken);
      localStorage.setItem('studysphere_user', JSON.stringify(googleUser));
      setToken(googleToken);
      setUser(googleUser);
    }
  };

  const logout = () => {
    localStorage.removeItem('studysphere_token');
    localStorage.removeItem('studysphere_user');
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const userData = await authService.getMe();
      setUser(userData);
      localStorage.setItem('studysphere_user', JSON.stringify(userData));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, demoLogin, register, googleLogin, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
