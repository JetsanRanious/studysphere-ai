import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  BookOpen,
  Calendar,
  Eye,
  Gamepad2,
  Trophy,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Zap,
  BarChart2
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { useAuth } from '../contexts/AuthContext';
import { GoogleAuthModal } from '../components/auth/GoogleAuthModal';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, demoLogin } = useAuth();
  const [showGoogleModal, setShowGoogleModal] = useState(false);

  const handleQuickStart = async () => {
    if (user) {
      navigate('/dashboard');
    } else {
      await demoLogin();
      navigate('/dashboard');
    }
  };

  const handleGoogleSuccess = () => {
    setShowGoogleModal(false);
    navigate('/dashboard');
  };

  const features = [
    {
      icon: Calendar,
      title: 'AI Weekly Study Planner',
      description: 'Tell AI your upcoming exams and deadlines. It synthesizes a realistic, balanced day-by-day study schedule with built-in buffers.'
    },
    {
      icon: BookOpen,
      title: 'RAG Document Intelligence',
      description: 'Upload your lecture PDFs and DOCX files. Chat with citations, generate high-yield summaries, and create interactive practice quizzes.'
    },
    {
      icon: ShieldCheck,
      title: 'Collaborative Study Rooms',
      description: 'Organize coursework by subjects and subtopics. Keep materials, tasks, and room-scoped AI context neatly separated.'
    },
    {
      icon: Eye,
      title: 'Smart Eye-Rest Reminders',
      description: 'Scientifically timed wellness intervals alert you approximately every 30 minutes to reduce eye strain and maintain peak focus.'
    },
    {
      icon: Gamepad2,
      title: 'Relax Zone Mini-Games',
      description: 'Take mindful study breaks with Tic-Tac-Toe against AI, Flappy Bird, and Sudoku featuring step-by-step AI deduction hints.'
    },
    {
      icon: Trophy,
      title: 'Gamified Growth & XP',
      description: 'Earn XP for every study session, maintain consecutive daily streaks, level up, and unlock achievements as you master subjects.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col selection:bg-blue-100">
      <GoogleAuthModal
        isOpen={showGoogleModal}
        onClose={() => setShowGoogleModal(false)}
        onSuccess={handleGoogleSuccess}
      />

      {/* Top Navigation */}
      <header className="max-w-7xl mx-auto w-full px-6 py-5 flex items-center justify-between">
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-sky-400 flex items-center justify-center text-white shadow-sm shadow-blue-200">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="text-lg font-bold text-slate-800 tracking-tight">StudySphere</span>
            <span className="text-lg font-bold text-blue-600 ml-1">AI</span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={() => setShowGoogleModal(true)}
            className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors shadow-xs"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>Google Login</span>
          </button>
          <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
            Sign In
          </Button>
          <Button variant="primary" size="sm" onClick={handleQuickStart}>
            Get Started <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-6 pt-16 pb-20 text-center flex-1 flex flex-col items-center justify-center">
        <div className="inline-flex items-center space-x-2 bg-blue-50 border border-blue-200/80 px-3.5 py-1.5 rounded-full text-xs font-semibold text-blue-700 mb-6 shadow-xs">
          <Zap className="w-3.5 h-3.5 text-blue-500 fill-blue-500" />
          <span>The Next-Generation AI Study Platform</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15] mb-6">
          Study smarter. Stay focused. <br />
          <span className="bg-gradient-to-r from-blue-600 via-sky-600 to-cyan-600 bg-clip-text text-transparent">
            Learn together.
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
          StudySphere AI combines personalized study planning, document intelligence, collaborative class rooms, eye-rest wellness reminders, and AI-powered learning into one calm, unified workspace.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 w-full max-w-md">
          <Button size="lg" variant="primary" className="w-full sm:w-auto px-8" onClick={handleQuickStart}>
            Launch StudySphere AI
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          <Button size="lg" variant="outline" className="w-full sm:w-auto px-6" onClick={() => {
            const el = document.getElementById('features');
            el?.scrollIntoView({ behavior: 'smooth' });
          }}>
            Explore Features
          </Button>
        </div>

        {/* Value pills */}
        <div className="flex flex-wrap items-center justify-center gap-6 mt-12 text-xs font-medium text-slate-500">
          <span className="flex items-center"><CheckCircle2 className="w-4 h-4 text-emerald-500 mr-1.5" /> Free & Open Source</span>
          <span className="flex items-center"><CheckCircle2 className="w-4 h-4 text-emerald-500 mr-1.5" /> Ollama Local LLM Support</span>
          <span className="flex items-center"><CheckCircle2 className="w-4 h-4 text-emerald-500 mr-1.5" /> Zero-Config Quick Start</span>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="bg-white border-t border-slate-200 py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">
              Everything you need for academic excellence
            </h2>
            <p className="text-sm text-slate-500">
              Designed specifically for students and researchers who demand structure, focus, and modern AI intelligence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div
                  key={idx}
                  className="bg-[#F8FAFC] border border-slate-200/80 rounded-2xl p-7 hover:border-blue-300 hover:shadow-md transition-all duration-200 group"
                >
                  <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mb-5 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-slate-800 mb-2">{feat.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{feat.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#F8FAFC] border-t border-slate-200 py-10 px-6 text-center text-xs text-slate-500">
        <p>© 2026 StudySphere AI. Built with React, TypeScript, FastAPI, and Ollama.</p>
      </footer>
    </div>
  );
};
