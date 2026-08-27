import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { StudyTimerProvider } from './contexts/StudyTimerContext';
import { NightLightProvider } from './contexts/NightLightContext';
import { ChatGPTProvider } from './contexts/ChatGPTContext';
import { FocusModeProvider } from './contexts/FocusModeContext';

import { AppLayout } from './components/layout/AppLayout';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { PlannerPage } from './pages/PlannerPage';
import { RoomsPage } from './pages/RoomsPage';
import { RoomDetailPage } from './pages/RoomDetailPage';
import { DocumentsPage } from './pages/DocumentsPage';
import { DocumentChatPage } from './pages/DocumentChatPage';
import { GeminiPage } from './pages/GeminiPage';
import { RelaxZonePage } from './pages/RelaxZonePage';
import { SettingsPage } from './pages/SettingsPage';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <NightLightProvider>
            <ChatGPTProvider>
              <FocusModeProvider>
                <StudyTimerProvider>
                  <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/login" element={<LoginPage />} />

                    {/* Authenticated Workspace */}
                    <Route
                      element={
                        <ProtectedRoute>
                          <AppLayout />
                        </ProtectedRoute>
                      }
                    >
                      <Route path="/dashboard" element={<DashboardPage />} />
                      <Route path="/planner" element={<PlannerPage />} />
                      <Route path="/rooms" element={<RoomsPage />} />
                      <Route path="/rooms/:id" element={<RoomDetailPage />} />
                      <Route path="/documents" element={<DocumentsPage />} />
                      <Route path="/documents/:id/chat" element={<DocumentChatPage />} />
                      <Route path="/gemini" element={<GeminiPage />} />
                      <Route path="/relax" element={<RelaxZonePage />} />
                      <Route path="/settings" element={<SettingsPage />} />
                    </Route>

                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </StudyTimerProvider>
              </FocusModeProvider>
            </ChatGPTProvider>
          </NightLightProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
};
