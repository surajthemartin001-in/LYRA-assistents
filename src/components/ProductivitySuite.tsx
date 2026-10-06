import React, { useState } from 'react';
import {
  Bell,
  Clock,
  Calendar as CalendarIcon,
  CheckSquare,
  Users,
  Brain,
  Sun,
  Plus,
  Trash2,
  Check,
  AlertCircle,
  FileText,
  Volume2,
  Sparkles,
  Play,
  Pause,
  Download,
} from 'lucide-react';
import {
  AlarmItem,
  TimerItem,
  TaskItem,
  CalendarEventItem,
  ContactItem,
  MemoryItem,
  BriefingData,
} from '../types';

interface ProductivitySuiteProps {
  alarms: AlarmItem[];
  setAlarms: React.Dispatch<React.SetStateAction<AlarmItem[]>>;
  timers: TimerItem[];
  setTimers: React.Dispatch<React.SetStateAction<TimerItem[]>>;
  tasks: TaskItem[];
  setTasks: React.Dispatch<React.SetStateAction<TaskItem[]>>;
  events: CalendarEventItem[];
  setEvents: React.Dispatch<React.SetStateAction<CalendarEventItem[]>>;
  contacts: ContactItem[];
  setContacts: React.Dispatch<React.SetStateAction<ContactItem[]>>;
  memories: MemoryItem[];
  setMemories: React.Dispatch<React.SetStateAction<MemoryItem[]>>;
  briefing: BriefingData;
  onReadBriefing: () => void;
  onOpenCall: (phoneNumber: string) => void;
  onOpenSms: (phoneNumber: string) => void;
}

export const ProductivitySuite: React.FC<ProductivitySuiteProps> = ({
  alarms,
  setAlarms,
  timers,
  setTimers,
  tasks,
  setTasks,
  events,
  setEvents,
  contacts,
  setContacts,
  memories,
  setMemories,
  briefing,
  onReadBriefing,
  onOpenCall,
  onOpenSms,
}) => {
  const [activeTab, setActiveTab] = useState<
    'briefing' | 'alarms' | 'tasks' | 'calendar' | 'contacts' | 'memory'
  >('briefing');

  // New item draft states
  const [newAlarmTime, setNewAlarmTime] = useState('07:00');
  const [newAlarmLabel, setNewAlarmLabel] = useState('Morning Wakeup');

  const [newTimerMins, setNewTimerMins] = useState(10);
  const [newTimerLabel, setNewTimerLabel] = useState('Focus Sprint');

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [newTaskDueDate, setNewTaskDueDate] = useState('Tomorrow');

  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDate, setNewEventDate] = useState('Today');
  const [newEventTime, setNewEventTime] = useState('15:00 - 16:00');

  const [newContactName, setNewContactName] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [newContactRelation, setNewContactRelation] = useState('');

  const [newMemoryKey, setNewMemoryKey] = useState('');
  const [newMemoryValue, setNewMemoryValue] = useState('');

  // Conflict warning calculation for events
  const hasEventConflict = (timeStr: string) => {
    return events.filter((e) => e.startTime === timeStr).length > 1;
  };

  const handleAddAlarm = () => {
    if (!newAlarmTime) return;
    const newAlarm: AlarmItem = {
      id: `alarm-${Date.now()}`,
      time: newAlarmTime,
      label: newAlarmLabel || 'Lyra Alarm',
      days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      enabled: true,
    };
    setAlarms((prev) => [...prev, newAlarm]);
  };

  const handleToggleAlarm = (id: string) => {
    setAlarms((prev) =>
      prev.map((a) => (a.id === id ? { ...a, enabled: !a.enabled } : a))
    );
  };

  const handleDeleteAlarm = (id: string) => {
    setAlarms((prev) => prev.filter((a) => a.id !== id));
  };

  const handleAddTimer = () => {
    if (newTimerMins <= 0) return;
    const newTimer: TimerItem = {
      id: `timer-${Date.now()}`,
      label: newTimerLabel || `${newTimerMins} Min Timer`,
      totalSeconds: newTimerMins * 60,
      remainingSeconds: newTimerMins * 60,
      isRunning: true,
    };
    setTimers((prev) => [...prev, newTimer]);
  };

  const handleToggleTimer = (id: string) => {
    setTimers((prev) =>
      prev.map((t) => (t.id === id ? { ...t, isRunning: !t.isRunning } : t))
    );
  };

  const handleDeleteTimer = (id: string) => {
    setTimers((prev) => prev.filter((t) => t.id !== id));
  };

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return;
    const newTask: TaskItem = {
      id: `task-${Date.now()}`,
      title: newTaskTitle.trim(),
      priority: newTaskPriority,
      dueDate: newTaskDueDate,
      status: 'pending',
    };
    setTasks((prev) => [newTask, ...prev]);
    setNewTaskTitle('');
  };

  const handleToggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, status: t.status === 'completed' ? 'pending' : 'completed' }
          : t
      )
    );
  };

  const handleDeleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const handleAddEvent = () => {
    if (!newEventTitle.trim()) return;
    const newEv: CalendarEventItem = {
      id: `event-${Date.now()}`,
      title: newEventTitle.trim(),
      date: newEventDate,
      startTime: newEventTime.split('-')[0]?.trim() || '14:00',
      endTime: newEventTime.split('-')[1]?.trim() || '15:00',
    };
    setEvents((prev) => [...prev, newEv]);
    setNewEventTitle('');
  };

  const handleDeleteEvent = (id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
  };

  const handleAddContact = () => {
    if (!newContactName.trim() || !newContactPhone.trim()) return;
    const newC: ContactItem = {
      id: `contact-${Date.now()}`,
      name: newContactName.trim(),
      phone: newContactPhone.trim(),
      relationship: newContactRelation.trim() || undefined,
      avatarColor: 'from-purple-500 to-indigo-600',
    };
    setContacts((prev) => [...prev, newC]);
    setNewContactName('');
    setNewContactPhone('');
    setNewContactRelation('');
  };

  const handleDeleteContact = (id: string) => {
    setContacts((prev) => prev.filter((c) => c.id !== id));
  };

  const handleAddMemory = () => {
    if (!newMemoryKey.trim() || !newMemoryValue.trim()) return;
    const newM: MemoryItem = {
      id: `mem-${Date.now()}`,
      key: newMemoryKey.trim(),
      value: newMemoryValue.trim(),
      category: 'preference',
      createdAt: new Date().toLocaleDateString(),
    };
    setMemories((prev) => [...prev, newM]);
    setNewMemoryKey('');
    setNewMemoryValue('');
  };

  const handleDeleteMemory = (id: string) => {
    setMemories((prev) => prev.filter((m) => m.id !== id));
  };

  const handleExportData = () => {
    const backup = {
      alarms,
      timers,
      tasks,
      events,
      contacts,
      memories,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lyra-personal-data-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-950/70 p-4">
      {/* Top Section Nav Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-3 border-b border-slate-800 no-scrollbar">
        <button
          onClick={() => setActiveTab('briefing')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-all ${
            activeTab === 'briefing'
              ? 'bg-purple-600 text-white shadow'
              : 'glass-card text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sun className="w-3.5 h-3.5 text-amber-300" />
          <span>Daily Briefing</span>
        </button>

        <button
          onClick={() => setActiveTab('alarms')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-all ${
            activeTab === 'alarms'
              ? 'bg-purple-600 text-white shadow'
              : 'glass-card text-slate-400 hover:text-slate-200'
          }`}
        >
          <Bell className="w-3.5 h-3.5 text-yellow-300" />
          <span>Alarms & Timers ({alarms.filter((a) => a.enabled).length})</span>
        </button>

        <button
          onClick={() => setActiveTab('tasks')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-all ${
            activeTab === 'tasks'
              ? 'bg-purple-600 text-white shadow'
              : 'glass-card text-slate-400 hover:text-slate-200'
          }`}
        >
          <CheckSquare className="w-3.5 h-3.5 text-emerald-300" />
          <span>Tasks ({tasks.filter((t) => t.status === 'pending').length})</span>
        </button>

        <button
          onClick={() => setActiveTab('calendar')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-all ${
            activeTab === 'calendar'
              ? 'bg-purple-600 text-white shadow'
              : 'glass-card text-slate-400 hover:text-slate-200'
          }`}
        >
          <CalendarIcon className="w-3.5 h-3.5 text-blue-300" />
          <span>Calendar ({events.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('contacts')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-all ${
            activeTab === 'contacts'
              ? 'bg-purple-600 text-white shadow'
              : 'glass-card text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="w-3.5 h-3.5 text-pink-300" />
          <span>Contacts ({contacts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('memory')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-all ${
            activeTab === 'memory'
              ? 'bg-purple-600 text-white shadow'
              : 'glass-card text-slate-400 hover:text-slate-200'
          }`}
        >
          <Brain className="w-3.5 h-3.5 text-cyan-300" />
          <span>Personal Memory ({memories.length})</span>
        </button>
      </div>

      {/* Tab Contents */}
      <div className="flex-1 overflow-y-auto py-4">
        {/* TAB 1: DAILY BRIEFING */}
        {activeTab === 'briefing' && (
          <div className="space-y-4 max-w-2xl mx-auto">
            <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-900/50 via-slate-900/80 to-slate-950 border border-purple-500/30 shadow-xl">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Sun className="w-6 h-6 text-amber-400 animate-spin" />
                  <h3 className="text-lg font-bold text-slate-100">{briefing.greeting}</h3>
                </div>
                <button
                  onClick={onReadBriefing}
                  className="px-3 py-1.5 rounded-full bg-purple-600 hover:bg-purple-500 text-white text-xs flex items-center space-x-1.5 cursor-pointer shadow transition-all"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Listen to Briefing</span>
                </button>
              </div>

              <p className="text-xs text-purple-300 mb-4">{briefing.dateStr}</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                <div className="glass-card p-3 rounded-xl">
                  <span className="text-[11px] text-slate-400 uppercase font-semibold block mb-1">
                    Weather Outlook
                  </span>
                  <p className="text-sm text-slate-200 font-medium">
                    {briefing.weatherSummary}
                  </p>
                </div>

                <div className="glass-card p-3 rounded-xl">
                  <span className="text-[11px] text-slate-400 uppercase font-semibold block mb-1">
                    Today's Priority Focus
                  </span>
                  <p className="text-sm text-amber-300 font-medium">
                    {briefing.recommendation}
                  </p>
                </div>
              </div>

              <div className="glass-card p-3 rounded-xl mb-4 border-l-4 border-l-purple-500">
                <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                  Daily Thought & Motivation
                </span>
                <p className="text-xs text-slate-300 italic">"{briefing.keyQuote}"</p>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
                <span>{tasks.filter((t) => t.status === 'pending').length} tasks pending</span>
                <span>{events.length} calendar appointments today</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ALARMS & TIMERS */}
        {activeTab === 'alarms' && (
          <div className="space-y-6 max-w-2xl mx-auto">
            {/* Alarms Section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-bold text-slate-200 flex items-center space-x-2">
                  <Bell className="w-4 h-4 text-amber-400" />
                  <span>Scheduled Alarms</span>
                </h4>
                <div className="flex items-center space-x-2">
                  <input
                    type="time"
                    value={newAlarmTime}
                    onChange={(e) => setNewAlarmTime(e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-200"
                  />
                  <input
                    type="text"
                    placeholder="Label"
                    value={newAlarmLabel}
                    onChange={(e) => setNewAlarmLabel(e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-200 w-28"
                  />
                  <button
                    onClick={handleAddAlarm}
                    className="p-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                {alarms.map((alarm) => (
                  <div
                    key={alarm.id}
                    className="glass-card p-3.5 rounded-xl flex items-center justify-between border border-slate-800/80"
                  >
                    <div>
                      <span className="text-xl font-bold font-mono-code text-slate-100">
                        {alarm.time}
                      </span>
                      <p className="text-xs text-slate-400">{alarm.label}</p>
                    </div>

                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => handleToggleAlarm(alarm.id)}
                        className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                          alarm.enabled ? 'bg-amber-500' : 'bg-slate-700'
                        }`}
                      >
                        <span
                          className={`absolute top-1 bg-white w-4 h-4 rounded-full transition-transform ${
                            alarm.enabled ? 'right-1' : 'left-1'
                          }`}
                        />
                      </button>
                      <button
                        onClick={() => handleDeleteAlarm(alarm.id)}
                        className="text-slate-500 hover:text-rose-400 p-1 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Timers Section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-bold text-slate-200 flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-cyan-400" />
                  <span>Active Countdowns & Timers</span>
                </h4>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min="1"
                    max="120"
                    value={newTimerMins}
                    onChange={(e) => setNewTimerMins(parseInt(e.target.value) || 1)}
                    className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-200 w-16"
                  />
                  <span className="text-xs text-slate-400">mins</span>
                  <button
                    onClick={handleAddTimer}
                    className="p-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                {timers.map((timer) => {
                  const mins = Math.floor(timer.remainingSeconds / 60);
                  const secs = timer.remainingSeconds % 60;
                  const timeFormatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

                  return (
                    <div
                      key={timer.id}
                      className="glass-card p-3.5 rounded-xl flex items-center justify-between border border-slate-800/80"
                    >
                      <div>
                        <span className="text-xl font-bold font-mono-code text-cyan-300">
                          {timeFormatted}
                        </span>
                        <p className="text-xs text-slate-400">{timer.label}</p>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleToggleTimer(timer.id)}
                          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                        >
                          {timer.isRunning ? (
                            <Pause className="w-4 h-4 text-amber-400" />
                          ) : (
                            <Play className="w-4 h-4 text-emerald-400" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDeleteTimer(timer.id)}
                          className="text-slate-500 hover:text-rose-400 p-1 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: TASKS & GOALS */}
        {activeTab === 'tasks' && (
          <div className="space-y-4 max-w-2xl mx-auto">
            <div className="p-3.5 glass-card rounded-xl flex items-center space-x-2">
              <input
                type="text"
                placeholder="Add a new task (e.g., Python study session, Review report)..."
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
                className="flex-1 bg-slate-900/90 border border-slate-700/80 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none"
              />
              <select
                value={newTaskPriority}
                onChange={(e) => setNewTaskPriority(e.target.value as any)}
                className="bg-slate-900 border border-slate-700 text-xs text-slate-300 rounded-lg px-2 py-1.5"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
              <button
                onClick={handleAddTask}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium cursor-pointer"
              >
                Add Task
              </button>
            </div>

            <div className="space-y-2">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className={`p-3.5 rounded-xl border flex items-center justify-between transition-all ${
                    task.status === 'completed'
                      ? 'bg-slate-950/40 border-slate-850 opacity-60'
                      : 'glass-card border-slate-800'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => handleToggleTask(task.id)}
                      className={`w-5 h-5 rounded-md border flex items-center justify-center cursor-pointer ${
                        task.status === 'completed'
                          ? 'bg-emerald-600 border-emerald-500 text-white'
                          : 'border-slate-600 hover:border-emerald-400'
                      }`}
                    >
                      {task.status === 'completed' && <Check className="w-3.5 h-3.5" />}
                    </button>
                    <div>
                      <p
                        className={`text-sm ${
                          task.status === 'completed'
                            ? 'line-through text-slate-500'
                            : 'text-slate-200 font-medium'
                        }`}
                      >
                        {task.title}
                      </p>
                      <span className="text-[11px] text-slate-400">Due: {task.dueDate}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span
                      className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                        task.priority === 'urgent'
                          ? 'bg-rose-500/20 text-rose-300'
                          : task.priority === 'high'
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {task.priority}
                    </span>
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="text-slate-500 hover:text-rose-400 p-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: CALENDAR */}
        {activeTab === 'calendar' && (
          <div className="space-y-4 max-w-2xl mx-auto">
            <div className="p-3.5 glass-card rounded-xl flex items-center space-x-2">
              <input
                type="text"
                placeholder="Event Title (e.g., Mathematics Study Session)..."
                value={newEventTitle}
                onChange={(e) => setNewEventTitle(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100"
              />
              <input
                type="text"
                placeholder="Time (e.g. 15:00 - 16:30)"
                value={newEventTime}
                onChange={(e) => setNewEventTime(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded-lg px-2 py-1.5 w-32"
              />
              <button
                onClick={handleAddEvent}
                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium cursor-pointer"
              >
                Add Event
              </button>
            </div>

            <div className="space-y-2">
              {events.map((event) => {
                const isConflict = hasEventConflict(event.startTime);
                return (
                  <div
                    key={event.id}
                    className="glass-card p-3.5 rounded-xl border border-slate-800 flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-semibold text-slate-200">
                          {event.title}
                        </span>
                        {isConflict && (
                          <span className="text-[10px] text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded-full flex items-center space-x-1">
                            <AlertCircle className="w-2.5 h-2.5" />
                            <span>Schedule Conflict Detected</span>
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400">
                        {event.date} • {event.startTime} - {event.endTime}
                      </p>
                    </div>

                    <button
                      onClick={() => handleDeleteEvent(event.id)}
                      className="text-slate-500 hover:text-rose-400 p-1 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 5: CONTACTS DIRECTORY */}
        {activeTab === 'contacts' && (
          <div className="space-y-4 max-w-2xl mx-auto">
            <div className="p-3.5 glass-card rounded-xl grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input
                type="text"
                placeholder="Contact Name"
                value={newContactName}
                onChange={(e) => setNewContactName(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100"
              />
              <input
                type="text"
                placeholder="Phone Number"
                value={newContactPhone}
                onChange={(e) => setNewContactPhone(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100"
              />
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="Relation (Mom, Dad, Work)"
                  value={newContactRelation}
                  onChange={(e) => setNewContactRelation(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 flex-1"
                />
                <button
                  onClick={handleAddContact}
                  className="p-2 rounded-lg bg-pink-600 hover:bg-pink-500 text-white cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-2">
              {contacts.map((contact) => (
                <div
                  key={contact.id}
                  className="glass-card p-3.5 rounded-xl border border-slate-800 flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center font-bold text-white text-xs">
                      {contact.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-semibold text-slate-200">
                          {contact.name}
                        </span>
                        {contact.relationship && (
                          <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full">
                            {contact.relationship}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 font-mono-code">{contact.phone}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onOpenCall(contact.phone)}
                      className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs cursor-pointer font-medium"
                    >
                      Call
                    </button>
                    <button
                      onClick={() => onOpenSms(contact.phone)}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs cursor-pointer font-medium"
                    >
                      SMS
                    </button>
                    <button
                      onClick={() => handleDeleteContact(contact.id)}
                      className="text-slate-500 hover:text-rose-400 p-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: PERSONAL MEMORY */}
        {activeTab === 'memory' && (
          <div className="space-y-4 max-w-2xl mx-auto">
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-400">
                Lyra remembers your explicit preferences, routines, and goals. You retain total control.
              </p>
              <button
                onClick={handleExportData}
                className="px-2.5 py-1.5 rounded-lg glass-card text-xs text-cyan-300 border border-cyan-500/30 hover:bg-slate-800 flex items-center space-x-1 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Data</span>
              </button>
            </div>

            <div className="p-3.5 glass-card rounded-xl grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Topic / Key (e.g. StudyGoal, MorningRoutine)"
                value={newMemoryKey}
                onChange={(e) => setNewMemoryKey(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100"
              />
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="Memory Content"
                  value={newMemoryValue}
                  onChange={(e) => setNewMemoryValue(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 flex-1"
                />
                <button
                  onClick={handleAddMemory}
                  className="p-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-2">
              {memories.map((mem) => (
                <div
                  key={mem.id}
                  className="glass-card p-3.5 rounded-xl border border-slate-800 flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-xs font-bold text-cyan-300">{mem.key}</span>
                      <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded">
                        {mem.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-200">{mem.value}</p>
                  </div>

                  <button
                    onClick={() => handleDeleteMemory(mem.id)}
                    className="text-slate-500 hover:text-rose-400 p-1 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
