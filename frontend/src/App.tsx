import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { StudyTimerProvider } from './contexts/StudyTimerContext';
import { ToastProvider } from './contexts/ToastContext';
import { NightLightProvider } from './contexts/NightLightContext';
import { ChatGPTProvider } from './contexts/ChatGPTContext';
import { AppLayout } from './components/layout/AppLayout';

import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { RoomsPage } from './pages/RoomsPage';
import { RoomDetailPage } from './pages/RoomDetailPage';
import { DocumentsPage } from './pages/DocumentsPage';
import { DocumentChatPage } from './pages/DocumentChatPage';
import { ChatGPTPage } from './pages/ChatGPTPage';
import { GeminiPage } from './pages/GeminiPage';
import { PlannerPage } from './pages/PlannerPage';
import { TasksPage } from './pages/TasksPage';
import { RelaxZonePage } from './pages/RelaxZonePage';
import { AchievementsPage } from './pages/AchievementsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { SettingsPage } from './pages/SettingsPage';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center text-slate-400">Loading StudySphere AI...</div>;
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

export const AppContent: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      
      <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/rooms" element={<RoomsPage />} />
        <Route path="/rooms/:id" element={<RoomDetailPage />} />
        <Route path="/documents" element={<DocumentsPage />} />
        <Route path="/chat" element={<DocumentChatPage />} />
        <Route path="/chatgpt" element={<ChatGPTPage />} />
        <Route path="/gemini" element={<GeminiPage />} />
        <Route path="/planner" element={<PlannerPage />} />
        <Route path="/tasks" element={<TasksPage />} />
        <Route path="/relax" element={<RelaxZonePage />} />
        <Route path="/achievements" element={<AchievementsPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <ChatGPTProvider>
        <NightLightProvider>
          <ToastProvider>
            <StudyTimerProvider>
              <AppContent />
            </StudyTimerProvider>
          </ToastProvider>
        </NightLightProvider>
      </ChatGPTProvider>
    </AuthProvider>
  );
};

export default App;
