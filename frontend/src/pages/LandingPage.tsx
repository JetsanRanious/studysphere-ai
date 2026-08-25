import React from 'react';
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

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, demoLogin } = useAuth();

  const handleQuickStart = async () => {
    if (user) {
      navigate('/dashboard');
    } else {
      await demoLogin();
      navigate('/dashboard');
    }
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
