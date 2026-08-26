import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock,
  CheckCircle2,
  ListTodo,
  Flame,
  Calendar,
  Sparkles,
  ArrowRight,
  Plus,
  Play,
  FileText,
  BookOpen
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { StudyClock } from '../components/common/StudyClock';
import { useAuth } from '../contexts/AuthContext';
import { useStudyTimer } from '../contexts/StudyTimerContext';
import { analyticsService, roomService, taskService, aiService } from '../services/allServices';
import { AnalyticsOverview, StudyRoom, StudyTask, Deadline } from '../types';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { startSession } = useStudyTimer();
  const navigate = useNavigate();

  const [analytics, setAnalytics] = useState<AnalyticsOverview | null>(null);
  const [rooms, setRooms] = useState<StudyRoom[]>([]);
  const [tasks, setTasks] = useState<StudyTask[]>([]);
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [recommendation, setRecommendation] = useState<any>(null);

  useEffect(() => {
    analyticsService.getOverview().then(setAnalytics).catch(() => {});
    roomService.getRooms().then(setRooms).catch(() => {});
    taskService.getTasks().then(setTasks).catch(() => {});
    taskService.getDeadlines().then(setDeadlines).catch(() => {});
    aiService.getRecommendation().then(setRecommendation).catch(() => {});
  }, []);

  const formatMinutes = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h === 0) return `${m}m`;
    return `${h}h ${m > 0 ? `${m}m` : ''}`;
  };

  const todayStudyMins = analytics?.total_study_minutes_today || 80;
  const goalMins = analytics?.daily_goal_minutes || 180;
  const progressPct = Math.min(100, Math.round((todayStudyMins / goalMins) * 100));

  return (
    <div className="space-y-8">
      {/* Welcome Heading */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Good morning, {user?.full_name?.split(' ')[0] || 'Jetsan'} 👋
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Let's make today's study session productive. Here is your overview for today.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Top Right Live Clock Widget */}
          <StudyClock variant="compact" defaultMode="digital" />
          
          <Button variant="outline" size="sm" onClick={() => navigate('/planner')}>
            <Calendar className="w-4 h-4 mr-1.5" /> AI Planner
          </Button>
          <Button variant="primary" size="sm" onClick={() => startSession('Cloud Security')}>
            <Play className="w-4 h-4 mr-1.5" /> Quick Study (45m)
          </Button>
        </div>
      </div>

      {/* AI Recommendation Banner */}
      {recommendation && (
        <div className="bg-gradient-to-r from-blue-50 via-sky-50 to-cyan-50 border border-blue-200/90 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-start space-x-3.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm shadow-blue-200 mt-0.5">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">
                {recommendation.headline}
              </span>
              <p className="text-sm text-slate-700 font-medium mt-0.5 leading-relaxed">
                {recommendation.recommendation}
              </p>
            </div>
          </div>
          <Button
            size="sm"
            variant="primary"
            onClick={() => startSession(recommendation.suggested_subject || 'Cloud Security')}
            className="flex-shrink-0"
          >
            {recommendation.suggested_action}
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        </div>
      )}

      {/* Top 4 Quick Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Today's Study Time</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mb-2">
            {formatMinutes(todayStudyMins)} <span className="text-xs font-medium text-slate-400">/ {formatMinutes(goalMins)}</span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-blue-600 rounded-full transition-all" style={{ width: `${progressPct}%` }} />
          </div>
          <p className="text-[11px] text-slate-400 mt-1.5 font-medium">{progressPct}% of daily goal completed</p>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tasks Status</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mb-2">
            {tasks.filter(t => t.is_completed).length} <span className="text-xs font-medium text-slate-400">/ {tasks.length} Completed</span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all"
              style={{ width: `${tasks.length > 0 ? (tasks.filter(t => t.is_completed).length / tasks.length) * 100 : 50}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-400 mt-1.5 font-medium">{tasks.filter(t => !t.is_completed).length} tasks pending</p>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Current Streak</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Flame className="w-4 h-4 fill-amber-500" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mb-1">
            {user?.streak?.current_streak || 7} <span className="text-sm font-semibold text-slate-500">Days 🔥</span>
          </div>
          <p className="text-xs text-amber-700 font-medium">Longest: {user?.streak?.longest_streak || 12} days</p>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Upcoming Deadline</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-base font-bold text-slate-900 truncate mb-1">
            {deadlines[0]?.title || 'Cloud Security Exam'}
          </div>
          <p className="text-xs text-rose-600 font-semibold">
            {deadlines[0]?.subject || 'Cloud Security'} • Due in 2 days
          </p>
        </Card>
      </div>

      {/* 2-Column Section: Today's Schedule & Continue Studying */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Today's Schedule / Tasks (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                <h3 className="text-base font-bold text-slate-800">Today's Planned Schedule</h3>
              </div>
              <Button size="sm" variant="ghost" onClick={() => navigate('/planner')}>
                View Full Week <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>

            <div className="space-y-3">
              {tasks.slice(0, 4).map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 bg-[#F8FAFC] hover:bg-white hover:border-blue-200 transition-all group"
                >
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={task.is_completed}
                      onChange={async () => {
                        await taskService.updateTask(task.id, { is_completed: !task.is_completed });
                        const updated = await taskService.getTasks();
                        setTasks(updated);
                      }}
                      className="w-4 h-4 rounded text-blue-600 accent-blue-600 cursor-pointer"
                    />
                    <div>
                      <h4 className={`text-sm font-semibold ${task.is_completed ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                        {task.title}
                      </h4>
                      <p className="text-xs text-slate-400">
                        {task.subject} {task.start_time ? `• ${task.start_time} - ${task.end_time}` : `• ~${task.estimated_minutes} mins`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Badge variant={task.priority === 'high' ? 'rose' : 'blue'}>
                      {task.priority}
                    </Badge>
                    <Button
                      size="sm"
                      variant="soft"
                      onClick={() => startSession(task.subject || 'Study')}
                      className="opacity-0 group-hover:opacity-100 transition-opacity !py-1 !px-2 !text-xs"
                    >
                      <Play className="w-3 h-3 mr-1" /> Start
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Continue Studying / Active Class Rooms */}
          <Card>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center space-x-2">
                <BookOpen className="w-4 h-4 text-blue-600" />
                <h3 className="text-base font-bold text-slate-800">My Active Study Rooms</h3>
              </div>
              <Button size="sm" variant="ghost" onClick={() => navigate('/rooms')}>
                All Rooms <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {rooms.slice(0, 3).map((room) => (
                <div
                  key={room.id}
                  onClick={() => navigate(`/rooms/${room.id}`)}
                  className="p-4 rounded-xl border border-slate-200/80 bg-white hover:border-blue-300 hover:shadow-sm cursor-pointer transition-all"
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold mb-3" style={{ backgroundColor: room.color || '#3B82F6' }}>
                    {room.name.substring(0, 2).toUpperCase()}
                  </div>
                  <h4 className="text-sm font-bold text-slate-800 truncate mb-1">{room.name}</h4>
                  <p className="text-xs text-slate-400">{room.topic_count} Subtopics • {room.document_count} Docs</p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Sidebar Column: Clock, Deadlines & Quick Links */}
        <div className="space-y-6">
          {/* Live Analog/Digital Clock Card */}
          <StudyClock variant="card" defaultMode="analog" />

          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-800">Upcoming Deadlines</h3>
              <Button size="sm" variant="ghost" onClick={() => navigate('/tasks')}>
                View All
              </Button>
            </div>

            <div className="space-y-3">
              {deadlines.slice(0, 4).map((dl) => (
                <div key={dl.id} className="p-3 rounded-xl border border-slate-100 bg-[#F8FAFC] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 truncate">{dl.title}</span>
                    <Badge variant={dl.priority === 'high' ? 'rose' : 'amber'}>{dl.priority}</Badge>
                  </div>
                  <p className="text-xs text-slate-500">{dl.subject}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-blue-600 to-sky-600 text-white border-0 shadow-lg shadow-blue-200">
            <h4 className="text-base font-bold mb-1">Relax Zone</h4>
            <p className="text-xs text-blue-100 mb-4 leading-relaxed">
              Take a mindful 5-minute break. Play Sudoku with AI hints or Tic-Tac-Toe.
            </p>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => navigate('/relax')}
              className="bg-white text-blue-700 hover:bg-blue-50 border-0"
            >
              Open Relax Zone <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};
