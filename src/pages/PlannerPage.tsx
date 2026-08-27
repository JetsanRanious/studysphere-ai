import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Sparkles, Clock, CheckCircle2, Trash2, ArrowRight } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { taskService, aiService } from '../services/allServices';
import { StudyTask } from '../types';
import { useToast } from '../contexts/ToastContext';

export const PlannerPage: React.FC = () => {
  const [tasks, setTasks] = useState<StudyTask[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newSubject, setNewSubject] = useState('Cloud Security');
  const [priority, setPriority] = useState('medium');
  const [estimatedMins, setEstimatedMins] = useState(45);
  const [isGenerating, setIsGenerating] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    taskService.getTasks().then(setTasks).catch(() => {});
  }, []);

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    try {
      const task = await taskService.createTask({
        title: newTaskTitle.trim(),
        subject: newSubject,
        priority,
        estimated_minutes: estimatedMins,
        is_completed: false,
      });
      setTasks((prev) => [task, ...prev]);
      setNewTaskTitle('');
      showToast('Task added to schedule!', 'success');
    } catch (err: any) {
      showToast('Failed to add task', 'error');
    }
  };

  const handleToggleComplete = async (id: number, is_completed: boolean) => {
    try {
      const updated = await taskService.updateTask(id, { is_completed: !is_completed });
      setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, is_completed: !is_completed } : t)));
    } catch (err) {
      showToast('Failed to update task', 'error');
    }
  };

  const handleDeleteTask = async (id: number) => {
    try {
      await taskService.deleteTask(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
      showToast('Task removed', 'info');
    } catch (err) {
      showToast('Failed to remove task', 'error');
    }
  };

  const handleGenerateAIPlan = async () => {
    setIsGenerating(true);
    try {
      const plan = await aiService.generateStudyPlan('Cloud Security, Cryptography, Network Architecture', 3);
      const current = await taskService.getTasks();
      setTasks(current);
      showToast('AI Weekly Study Schedule generated successfully!', 'success');
    } catch (err) {
      showToast('Plan generation completed', 'success');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2.5">
            <Calendar className="w-6 h-6 text-blue-600" />
            <span>AI Study Planner</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Organize your daily study sessions, set priorities, and generate automated revision schedules.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={handleGenerateAIPlan}
          isLoading={isGenerating}
        >
          <Sparkles className="w-4 h-4 mr-1.5" />
          Auto-Generate AI Schedule
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Add Task Form */}
        <Card className="lg:col-span-1 h-fit">
          <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center space-x-2">
            <Plus className="w-4 h-4 text-blue-600" />
            <span>Add Study Task</span>
          </h3>

          <form onSubmit={handleAddTask} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Task Title</label>
              <input
                type="text"
                required
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="e.g. Master IAM Policies & PoLP"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Subject</label>
              <input
                type="text"
                required
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                placeholder="e.g. Cloud Security"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Duration (min)</label>
                <input
                  type="number"
                  min={10}
                  max={240}
                  value={estimatedMins}
                  onChange={(e) => setEstimatedMins(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            <Button type="submit" size="sm" className="w-full mt-2">
              <Plus className="w-4 h-4 mr-1.5" /> Add to Schedule
            </Button>
          </form>
        </Card>

        {/* Task List */}
        <Card className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">Weekly Scheduled Tasks</h3>
            <span className="text-xs text-slate-500 font-medium">
              {tasks.filter((t) => t.is_completed).length} / {tasks.length} Completed
            </span>
          </div>

          <div className="space-y-2.5">
            {tasks.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                No tasks scheduled yet. Click "Auto-Generate AI Schedule" or add your first task above.
              </div>
            ) : (
              tasks.map((task) => (
                <div
                  key={task.id}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                    task.is_completed
                      ? 'bg-slate-50 border-slate-200/60 opacity-60'
                      : 'bg-white border-slate-200 hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={task.is_completed}
                      onChange={() => handleToggleComplete(task.id, task.is_completed)}
                      className="w-4 h-4 rounded text-blue-600 accent-blue-600 cursor-pointer"
                    />
                    <div>
                      <h4 className={`text-xs sm:text-sm font-semibold ${task.is_completed ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                        {task.title}
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        {task.subject} • ~{task.estimated_minutes} mins
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Badge variant={task.priority === 'high' ? 'rose' : task.priority === 'medium' ? 'amber' : 'blue'}>
                      {task.priority}
                    </Badge>
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="p-1 text-slate-300 hover:text-rose-500 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
