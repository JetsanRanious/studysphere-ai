import React, { useEffect, useState } from 'react';
import { Sparkles, Calendar, Plus, CheckCircle2, Clock, Play, Trash2, ArrowRight } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { GeneratePlanModal } from '../components/planner/GeneratePlanModal';
import { taskService } from '../services/allServices';
import { StudyTask } from '../types';
import { useToast } from '../contexts/ToastContext';
import { useStudyTimer } from '../contexts/StudyTimerContext';

export const PlannerPage: React.FC = () => {
  const [tasks, setTasks] = useState<StudyTask[]>([]);
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const { showToast } = useToast();
  const { startSession } = useStudyTimer();

  const loadTasks = async () => {
    try {
      setLoading(true);
      const data = await taskService.getTasks();
      setTasks(data);
    } catch (e) {
      showToast('Error loading study tasks', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const handleToggleComplete = async (task: StudyTask) => {
    try {
      await taskService.updateTask(task.id, { is_completed: !task.is_completed });
      if (!task.is_completed) {
        showToast(`Completed '${task.title}'! +20 XP 🎉`, 'success');
      }
      loadTasks();
    } catch (e) {
      showToast('Error updating task', 'error');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await taskService.deleteTask(id);
      showToast('Task removed', 'info');
      loadTasks();
    } catch (e) {
      showToast('Failed to delete task', 'error');
    }
  };

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const priorityColor: Record<string, string> = {
    high: 'text-rose-600 bg-rose-50 border-rose-200',
    medium: 'text-blue-700 bg-blue-50 border-blue-200',
    low: 'text-slate-500 bg-slate-50 border-slate-200',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">AI Weekly Study Planner</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Structured, balanced weekly study schedule personalized with break intervals
          </p>
        </div>

        <Button variant="primary" size="sm" onClick={() => setIsGenerateOpen(true)}>
          <Sparkles className="w-4 h-4 mr-1.5" /> Generate AI Weekly Plan
        </Button>
      </div>

      {/* Empty state */}
      {!loading && tasks.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
            <Calendar className="w-8 h-8 text-blue-500" />
          </div>
          <h3 className="text-base font-bold text-slate-800 mb-1">No Study Plan Yet</h3>
          <p className="text-sm text-slate-500 mb-5 max-w-xs">
            Click <strong>"Generate AI Weekly Plan"</strong> and describe your upcoming exams or goals. The AI will build a full 7-day schedule.
          </p>
          <Button variant="primary" onClick={() => setIsGenerateOpen(true)}>
            <Sparkles className="w-4 h-4 mr-1.5" /> Generate My First Plan
          </Button>
        </div>
      )}

      {/* Days Grid View */}
      {tasks.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-3">
          {daysOfWeek.map((day) => {
            // Filter tasks whose 'day' field matches this day name
            const dayTasks = tasks.filter(t => t.day === day);
            const completedCount = dayTasks.filter(t => t.is_completed).length;

            return (
              <div key={day} className="flex flex-col bg-white border border-slate-200/80 rounded-2xl p-3 min-h-[380px]">
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-800">{day}</span>
                  <span className="text-[10px] font-semibold text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded">
                    {completedCount}/{dayTasks.length}
                  </span>
                </div>

                <div className="space-y-2.5 flex-1">
                  {dayTasks.length === 0 && (
                    <p className="text-[10px] text-slate-300 text-center pt-6">Rest day 😴</p>
                  )}
                  {dayTasks.map((task) => (
                    <div
                      key={task.id}
                      className={`p-2.5 rounded-xl border text-xs transition-all relative group ${
                        task.is_completed
                          ? 'bg-slate-50 border-slate-100 text-slate-400'
                          : 'bg-[#F8FAFC] border-slate-200/70 hover:border-blue-300 hover:bg-white'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1 mb-1">
                        <span className={`font-bold line-clamp-2 ${task.is_completed ? 'line-through' : 'text-slate-800'}`}>
                          {task.title}
                        </span>
                        <button
                          onClick={() => handleDelete(task.id)}
                          className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-rose-600 transition-opacity p-0.5 flex-shrink-0"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>

                      <p className="text-[10px] text-slate-500 mb-1.5 truncate">
                        {task.subject} {task.start_time ? `• ${task.start_time}–${task.end_time}` : ''}
                      </p>

                      {task.priority && (
                        <span className={`inline-flex text-[9px] font-bold px-1.5 py-0.5 rounded-full border mb-1.5 ${priorityColor[task.priority] || priorityColor.low}`}>
                          {task.priority}
                        </span>
                      )}

                      <div className="flex items-center justify-between pt-1 border-t border-slate-100/80">
                        <button
                          onClick={() => handleToggleComplete(task)}
                          className={`text-[10px] font-bold flex items-center ${
                            task.is_completed ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-700'
                          }`}
                        >
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          {task.is_completed ? 'Done' : 'Mark'}
                        </button>

                        {!task.is_completed && (
                          <button
                            onClick={() => startSession(task.subject || 'Study')}
                            className="text-[10px] font-bold text-blue-600 hover:underline flex items-center"
                          >
                            <Play className="w-2.5 h-2.5 mr-0.5" /> Study
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <GeneratePlanModal
        isOpen={isGenerateOpen}
        onClose={() => setIsGenerateOpen(false)}
        onPlanGenerated={loadTasks}
      />
    </div>
  );
};
