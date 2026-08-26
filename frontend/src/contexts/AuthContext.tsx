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
  googleLogin: () => Promise<void>;
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

  const demoLogin = async (email?: string, name?: string) => {
    const data = await authService.demoLogin(email, name);
    localStorage.setItem('studysphere_token', data.access_token);
    localStorage.setItem('studysphere_user', JSON.stringify(data.user));
    setToken(data.access_token);
    setUser(data.user);
  };

  const register = async (email: string, pass: string, name: string) => {
    const data = await authService.register(email, pass, name);
    localStorage.setItem('studysphere_token', data.access_token);
    localStorage.setItem('studysphere_user', JSON.stringify(data.user));
    setToken(data.access_token);
    setUser(data.user);
  };

  const googleLogin = async () => {
    // Uses the backend /auth/google endpoint which natively mocks Google Student
    const data = await authService.googleAuth('mock-google-credential');
    localStorage.setItem('studysphere_token', data.access_token);
    localStorage.setItem('studysphere_user', JSON.stringify(data.user));
    setToken(data.access_token);
    setUser(data.user);
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
