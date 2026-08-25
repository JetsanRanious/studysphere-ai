import React, { useEffect, useState } from 'react';
import { BarChart3, Clock, Flame, CheckCircle2, TrendingUp, BookOpen } from 'lucide-react';
import { Card } from '../components/common/Card';
import { analyticsService } from '../services/allServices';
import { AnalyticsOverview } from '../types';

export const AnalyticsPage: React.FC = () => {
  const [data, setData] = useState<AnalyticsOverview | null>(null);

  useEffect(() => {
    analyticsService.getOverview().then(setData).catch(() => {});
  }, []);

  if (!data) return <div className="p-8 text-center text-slate-400">Loading analytics...</div>;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Study Analytics & Insights</h1>
        <p className="text-xs text-slate-500 mt-0.5">Visualize your study consistency, subject distribution, and task velocity</p>
      </div>

      {/* Top 4 Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">All-Time Study Time</span>
          <div className="text-2xl font-extrabold text-slate-900 mt-1 mb-1">
            {(data.total_study_minutes_all_time / 60).toFixed(1)} <span className="text-sm font-semibold text-slate-500">Hours</span>
          </div>
          <p className="text-xs text-blue-600 font-medium">{data.total_study_minutes_today} mins today</p>
        </Card>

        <Card>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Study Streak</span>
          <div className="text-2xl font-extrabold text-slate-900 mt-1 mb-1">
            {data.current_streak_days} <span className="text-sm font-semibold text-slate-500">Days 🔥</span>
          </div>
          <p className="text-xs text-amber-700 font-medium">Longest: {data.longest_streak_days} days</p>
        </Card>

        <Card>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Task Completion Rate</span>
          <div className="text-2xl font-extrabold text-slate-900 mt-1 mb-1">
            {data.completion_rate_percentage}%
          </div>
          <p className="text-xs text-emerald-600 font-medium">{data.tasks_completed_count} tasks finished</p>
        </Card>

        <Card>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Most Productive Subject</span>
          <div className="text-lg font-extrabold text-slate-900 mt-1 mb-1 truncate">
            {data.most_productive_subject}
          </div>
          <p className="text-xs text-slate-500 font-medium">Highest time allocated</p>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 7-Day Consistency Bar Chart */}
        <Card>
          <h3 className="text-base font-bold text-slate-800 mb-6 flex items-center">
            <BarChart3 className="w-4 h-4 mr-2 text-blue-600" /> Daily Study Consistency (Last 7 Days)
          </h3>

          <div className="flex items-end justify-between h-48 pt-6 px-4">
            {data.daily_stats_last_7_days.map((stat, idx) => {
              const maxMinutes = Math.max(...data.daily_stats_last_7_days.map(s => s.minutes), 120);
              const heightPct = Math.max(8, Math.round((stat.minutes / maxMinutes) * 100));

              return (
                <div key={idx} className="flex flex-col items-center flex-1 max-w-[40px] group">
                  <span className="text-[10px] text-slate-400 font-semibold mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {stat.minutes}m
                  </span>
                  <div className="w-full bg-blue-100 rounded-t-lg overflow-hidden flex flex-col justify-end h-32">
                    <div
                      className="w-full bg-blue-600 rounded-t-lg transition-all duration-500 group-hover:bg-blue-700"
                      style={{ height: `${heightPct}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-slate-600 mt-2">{stat.date}</span>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Subject Breakdown */}
        <Card>
          <h3 className="text-base font-bold text-slate-800 mb-6 flex items-center">
            <BookOpen className="w-4 h-4 mr-2 text-blue-600" /> Subject Time Distribution
          </h3>

          <div className="space-y-4">
            {data.subject_distribution.map((sub, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span>{sub.subject}</span>
                  <span className="text-slate-500">{sub.minutes} mins ({sub.percentage}%)</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${sub.percentage}%`, backgroundColor: sub.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
