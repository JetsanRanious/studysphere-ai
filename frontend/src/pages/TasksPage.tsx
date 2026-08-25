import React, { useEffect, useState } from 'react';
import { CheckSquare, Calendar, Plus, Trash2, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { taskService } from '../services/allServices';
import { StudyTask, Deadline } from '../types';
import { useToast } from '../contexts/ToastContext';

export const TasksPage: React.FC = () => {
  const [tasks, setTasks] = useState<StudyTask[]>([]);
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isDeadlineModalOpen, setIsDeadlineModalOpen] = useState(false);

  // Form states
  const [taskTitle, setTaskTitle] = useState('');
  const [taskSubject, setTaskSubject] = useState('Cloud Security');
  const [taskMinutes, setTaskMinutes] = useState(45);
  const [taskPriority, setTaskPriority] = useState<'high' | 'medium' | 'low'>('medium');

  const [deadlineTitle, setDeadlineTitle] = useState('');
  const [deadlineSubject, setDeadlineSubject] = useState('Cloud Security');
  const [deadlineDate, setDeadlineDate] = useState('');

  const { showToast } = useToast();

  const loadData = async () => {
    const t = await taskService.getTasks();
    const d = await taskService.getDeadlines();
    setTasks(t);
    setDeadlines(d);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await taskService.createTask({
        title: taskTitle,
        subject: taskSubject,
        estimated_minutes: taskMinutes,
        priority: taskPriority
      });
      showToast('Task added successfully', 'success');
      setTaskTitle('');
      setIsTaskModalOpen(false);
      loadData();
    } catch (e) {
      showToast('Failed to create task', 'error');
    }
  };

  const handleCreateDeadline = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await taskService.createDeadline({
        title: deadlineTitle,
        subject: deadlineSubject,
        due_date: new Date(deadlineDate).toISOString(),
        priority: 'high'
      });
      showToast('Deadline set!', 'success');
      setDeadlineTitle('');
      setIsDeadlineModalOpen(false);
      loadData();
    } catch (e) {
      showToast('Failed to add deadline', 'error');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Tasks & Study Targets</h1>
          <p className="text-xs text-slate-500 mt-0.5">Track your study assignments, problem sets, and exam deadlines</p>
        </div>

        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm" onClick={() => setIsDeadlineModalOpen(true)}>
            <Calendar className="w-4 h-4 mr-1.5" /> Add Deadline
          </Button>
          <Button variant="primary" size="sm" onClick={() => setIsTaskModalOpen(true)}>
            <Plus className="w-4 h-4 mr-1.5" /> Add Task
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Tasks List (2 cols) */}
        <div className="lg:col-span-2">
          <Card>
            <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center">
              <CheckSquare className="w-4 h-4 mr-2 text-blue-600" /> Active Tasks ({tasks.length})
            </h3>

            <div className="space-y-2.5">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                    task.is_completed ? 'bg-slate-50 border-slate-100 opacity-60' : 'bg-white border-slate-200/80 hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={task.is_completed}
                      onChange={async () => {
                        await taskService.updateTask(task.id, { is_completed: !task.is_completed });
                        loadData();
                      }}
                      className="w-4 h-4 rounded text-blue-600 accent-blue-600 cursor-pointer"
                    />
                    <div>
                      <h4 className={`text-sm font-semibold ${task.is_completed ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                        {task.title}
                      </h4>
                      <p className="text-xs text-slate-400">
                        {task.subject} • ~{task.estimated_minutes} mins
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Badge variant={task.priority === 'high' ? 'rose' : task.priority === 'medium' ? 'blue' : 'slate'}>
                      {task.priority}
                    </Badge>
                    <button
                      onClick={async () => {
                        await taskService.deleteTask(task.id);
                        loadData();
                      }}
                      className="text-slate-300 hover:text-rose-600 p-1 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Deadlines Sidebar */}
        <div>
          <Card>
            <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center">
              <Calendar className="w-4 h-4 mr-2 text-rose-600" /> Upcoming Deadlines
            </h3>

            <div className="space-y-3">
              {deadlines.map((dl) => (
                <div key={dl.id} className="p-3.5 rounded-xl border border-slate-200/80 bg-[#F8FAFC]">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-800 truncate">{dl.title}</span>
                    <Badge variant="rose">Due Soon</Badge>
                  </div>
                  <p className="text-xs text-slate-500">{dl.subject}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Task Modal */}
      <Modal isOpen={isTaskModalOpen} onClose={() => setIsTaskModalOpen(false)} title="Create New Study Task">
        <form onSubmit={handleCreateTask} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Task Title *</label>
            <input
              type="text"
              required
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              placeholder="e.g. Review IAM Roles & Policies"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Subject</label>
            <input
              type="text"
              value={taskSubject}
              onChange={(e) => setTaskSubject(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Estimated Minutes</label>
              <input
                type="number"
                value={taskMinutes}
                onChange={(e) => setTaskMinutes(parseInt(e.target.value, 10))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Priority</label>
              <select
                value={taskPriority}
                onChange={(e) => setTaskPriority(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setIsTaskModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Add Task</Button>
          </div>
        </form>
      </Modal>

      {/* Deadline Modal */}
      <Modal isOpen={isDeadlineModalOpen} onClose={() => setIsDeadlineModalOpen(false)} title="Set Target Deadline">
        <form onSubmit={handleCreateDeadline} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Deadline Title *</label>
            <input
              type="text"
              required
              value={deadlineTitle}
              onChange={(e) => setDeadlineTitle(e.target.value)}
              placeholder="e.g. Cryptography Assignment 3"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Subject</label>
            <input
              type="text"
              value={deadlineSubject}
              onChange={(e) => setDeadlineSubject(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Due Date *</label>
            <input
              type="date"
              required
              value={deadlineDate}
              onChange={(e) => setDeadlineDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setIsDeadlineModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Set Deadline</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
