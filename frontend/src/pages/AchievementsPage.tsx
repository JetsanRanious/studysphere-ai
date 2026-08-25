import React, { useEffect, useState } from 'react';
import { Trophy, Award, Flame, Zap, Star, ShieldCheck, CheckCircle2, Lock } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/allServices';
import { Achievement } from '../types';

export const AchievementsPage: React.FC = () => {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  useEffect(() => {
    authService.getAchievements().then(setAchievements).catch(() => {});
  }, []);

  const totalXP = user?.profile?.xp || 0;
  const currentLevel = user?.profile?.level || 1;
  const nextLevelXP = currentLevel * 100 + 100;
  const levelProgress = Math.min(100, Math.round((totalXP / nextLevelXP) * 100));

  return (
    <div className="space-y-8">
      {/* Level Banner */}
      <Card className="bg-gradient-to-r from-blue-600 to-sky-600 text-white border-0 shadow-lg shadow-blue-200 p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center space-x-5">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-2xl font-black shadow-inner">
              {currentLevel}
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-200">Current Academic Level</span>
              <h2 className="text-2xl font-extrabold tracking-tight">Scholar Level {currentLevel}</h2>
              <p className="text-xs text-blue-100 mt-0.5">{totalXP} Total XP Earned</p>
            </div>
          </div>

          <div className="w-full sm:w-64">
            <div className="flex justify-between text-xs text-blue-100 font-semibold mb-1.5">
              <span>Next Level Progress</span>
              <span>{levelProgress}%</span>
            </div>
            <div className="w-full h-2.5 bg-black/20 rounded-full overflow-hidden">
              <div className="h-full bg-white rounded-full transition-all" style={{ width: `${levelProgress}%` }} />
            </div>
          </div>
        </div>
      </Card>

      {/* Achievements Grid */}
      <div>
        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
          <Trophy className="w-5 h-5 mr-2 text-amber-500" /> Unlocked Badges & Trophies
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {achievements.map((ach) => (
            <Card
              key={ach.id}
              className={`p-5 flex flex-col justify-between transition-all ${
                ach.is_unlocked ? 'border-amber-200 bg-white shadow-xs' : 'border-slate-200/60 bg-slate-50/50 opacity-60'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                    ach.is_unlocked ? 'bg-amber-50 text-amber-600 border border-amber-200' : 'bg-slate-200 text-slate-400'
                  }`}>
                    {ach.is_unlocked ? <Award className="w-5 h-5" /> : <Lock className="w-4 h-4" />}
                  </div>

                  <Badge variant={ach.is_unlocked ? 'amber' : 'slate'}>
                    +{ach.xp_reward} XP
                  </Badge>
                </div>

                <h4 className="text-sm font-bold text-slate-800 mb-1">{ach.title}</h4>
                <p className="text-xs text-slate-500 leading-relaxed">{ach.description}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] font-semibold">
                {ach.is_unlocked ? (
                  <span className="text-emerald-600 flex items-center"><CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Unlocked</span>
                ) : (
                  <span className="text-slate-400">Locked</span>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
