import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Mic,
  MessageSquare,
  Calendar,
  Sliders,
  ShieldCheck,
  Scale,
  Minimize2,
  Maximize2,
  Volume2,
  VolumeX,
  Smartphone,
  Sun,
  Bell,
  Clock,
  Layers,
} from 'lucide-react';
import { VoiceMode } from './components/VoiceMode';
import { ChatMode } from './components/ChatMode';
import { ProductivitySuite } from './components/ProductivitySuite';
import { SettingsModal } from './components/SettingsModal';
import { AiCouncilModal } from './components/AiCouncilModal';
import { PermissionManagerModal } from './components/PermissionManagerModal';
import { FloatingAssistant } from './components/FloatingAssistant';
import { LyraAvatar } from './components/LyraAvatar';
import {
  Message,
  AvatarState,
  AssistantSettings,
  AlarmItem,
  TimerItem,
  TaskItem,
  CalendarEventItem,
  ContactItem,
  MemoryItem,
  BriefingData,
  DevicePermissions,
  ToolActionPayload,
} from './types';
import { CommandRouter } from './services/commandRouter';
import { PhoneControlService } from './services/phoneControl';

const DEFAULT_SETTINGS: AssistantSettings = {
  modelMode: 'balanced',
  voicePersona: 'Kore',
  voiceStyle: 'Soft',
  voiceSpeed: 1.05,
  voicePitch: 1.35,
  autoTts: true,
  wakeWordEnabled: true,
  proactiveEnabled: true,
  theme: 'fantasy',
  language: 'mixed',
  avatarMood: 'calm',
  confirmations: {
    call: true,
    sms: true,
    delete: true,
    alarm: false,
  },
};

const DEFAULT_CONTACTS: ContactItem[] = [
  { id: 'c1', name: 'Maa (Mother)', phone: '+91 98765 43210', relationship: 'Mother' },
  { id: 'c2', name: 'Papa (Home)', phone: '+91 98765 11111', relationship: 'Father' },
  { id: 'c3', name: 'Papa (Office)', phone: '+91 98765 22222', relationship: 'Father' },
  { id: 'c4', name: 'Rahul Sharma', phone: '+91 98111 22334', relationship: 'Colleague' },
  { id: 'c5', name: 'Priya Verma', phone: '+91 98222 33445', relationship: 'Friend' },
];

const DEFAULT_TASKS: TaskItem[] = [
  {
    id: 't1',
    title: 'Python Machine Learning Module 3',
    priority: 'high',
    dueDate: 'Today',
    status: 'pending',
    project: 'AI Studies',
  },
  {
    id: 't2',
    title: 'Review System Architecture Specs',
    priority: 'medium',
    dueDate: 'Tomorrow',
    status: 'pending',
  },
  {
    id: 't3',
    title: 'Morning Yoga and Meditation Routine',
    priority: 'low',
    dueDate: 'Today',
    status: 'completed',
  },
];

const DEFAULT_ALARMS: AlarmItem[] = [
  { id: 'a1', label: 'Morning Wakeup', time: '06:00', days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], enabled: true },
  { id: 'a2', label: 'Evening Workout', time: '18:30', days: ['Mon', 'Wed', 'Fri'], enabled: false },
];

const DEFAULT_EVENTS: CalendarEventItem[] = [
  {
    id: 'e1',
    title: 'NEXORA Robotics Sprint Review',
    date: 'Today',
    startTime: '10:30',
    endTime: '11:30',
    location: 'Google Meet',
  },
  {
    id: 'e2',
    title: 'Python Study & Coding Session',
    date: 'Today',
    startTime: '15:00',
    endTime: '16:30',
    location: 'Study Desk',
  },
];

const DEFAULT_MEMORIES: MemoryItem[] = [
  { id: 'm1', key: 'LanguagePreference', value: 'Comfortable with English and Hindi (Hinglish)', category: 'preference', createdAt: 'Today' },
  { id: 'm2', key: 'PrimaryGoal', value: 'Master Python and AI systems over the next 6 months', category: 'goal', createdAt: 'Today' },
  { id: 'm3', key: 'WakeupRoutine', value: 'Prefers morning alarm at 6:00 AM with soft briefing', category: 'routine', createdAt: 'Today' },
];

export default function App() {
  // App Navigation Modes: 'voice' | 'chat' | 'productivity'
  const [activeMode, setActiveMode] = useState<'voice' | 'chat' | 'productivity'>('voice');
  const [avatarState, setAvatarState] = useState<AvatarState>('idle');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isFloating, setIsFloating] = useState(false);

  // Modals
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAiCouncilOpen, setIsAiCouncilOpen] = useState(false);
  const [isPermissionsOpen, setIsPermissionsOpen] = useState(false);

  // App Data & Settings
  const [settings, setSettings] = useState<AssistantSettings>(() => {
    const saved = localStorage.getItem('lyra_settings');
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  const [permissions, setPermissions] = useState<DevicePermissions>(() => {
    const saved = localStorage.getItem('lyra_permissions');
    return saved
      ? JSON.parse(saved)
      : {
          microphone: true,
          contacts: true,
          phone: true,
          sms: true,
          calendar: true,
          location: true,
          notifications: true,
          camera: true,
          files: true,
          overlay: true,
        };
  });

  const [alarms, setAlarms] = useState<AlarmItem[]>(() => {
    const saved = localStorage.getItem('lyra_alarms');
    return saved ? JSON.parse(saved) : DEFAULT_ALARMS;
  });

  const [timers, setTimers] = useState<TimerItem[]>([]);

  const [tasks, setTasks] = useState<TaskItem[]>(() => {
    const saved = localStorage.getItem('lyra_tasks');
    return saved ? JSON.parse(saved) : DEFAULT_TASKS;
  });

  const [events, setEvents] = useState<CalendarEventItem[]>(() => {
    const saved = localStorage.getItem('lyra_events');
    return saved ? JSON.parse(saved) : DEFAULT_EVENTS;
  });

  const [contacts, setContacts] = useState<ContactItem[]>(() => {
    const saved = localStorage.getItem('lyra_contacts');
    return saved ? JSON.parse(saved) : DEFAULT_CONTACTS;
  });

  const [memories, setMemories] = useState<MemoryItem[]>(() => {
    const saved = localStorage.getItem('lyra_memories');
    return saved ? JSON.parse(saved) : DEFAULT_MEMORIES;
  });

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm-welcome',
      role: 'assistant',
      text: 'नमस्ते! मैं Lyra हूँ, आपकी नन्ही सी क्यूट तितली परी (Anime Butterfly Fairy) और पर्सनल AI वॉइस व फ़ोन असिस्टेंट! 🌸✨ How can I help you today? आप मुझसे अलार्म, कॉल्स, मैसेज, गूगल सर्च या कोई भी सवाल पूछ सकते हैं.',
      timestamp: Date.now(),
    },
  ]);

  const [latestAssistantText, setLatestAssistantText] = useState(
    'नमस्ते! मैं Lyra हूँ, आपकी नन्ही सी क्यूट तितली परी!'
  );

  const [proactiveBanner, setProactiveBanner] = useState<string | null>(
    'Tip: You have a free slot at 3:00 PM for your Python study session.'
  );

  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  // Persistence
  useEffect(() => {
    localStorage.setItem('lyra_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('lyra_permissions', JSON.stringify(permissions));
  }, [permissions]);

  useEffect(() => {
    localStorage.setItem('lyra_alarms', JSON.stringify(alarms));
  }, [alarms]);

  useEffect(() => {
    localStorage.setItem('lyra_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('lyra_events', JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem('lyra_contacts', JSON.stringify(contacts));
  }, [contacts]);

  useEffect(() => {
    localStorage.setItem('lyra_memories', JSON.stringify(memories));
  }, [memories]);

  // Timers countdown ticker
  useEffect(() => {
    const ticker = setInterval(() => {
      setTimers((prev) =>
        prev
          .map((t) => {
            if (!t.isRunning) return t;
            const updated = t.remainingSeconds - 1;
            if (updated <= 0) {
              // Beep sound alert
              playBeepAlert();
              return { ...t, remainingSeconds: 0, isRunning: false };
            }
            return { ...t, remainingSeconds: updated };
          })
          .filter(Boolean)
      );
    }, 1000);
    return () => clearInterval(ticker);
  }, []);

  // Web Audio Chime synthesizer for alarms/timers
  const playBeepAlert = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5 note
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.6);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.7);
    } catch {}
  };

  // TTS Playback Helper
  const playSpeech = async (text: string) => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current = null;
    }

    setIsSpeaking(true);
    setAvatarState('speaking');

    try {
      // 1. Attempt Gemini TTS from server
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: text.slice(0, 500),
          voice: settings.voicePersona,
        }),
      });

      const data = await res.json();
      if (data.success && data.audioBase64) {
        const audio = new Audio(`data:audio/wav;base64,${data.audioBase64}`);
        audioPlayerRef.current = audio;
        audio.onended = () => {
          setIsSpeaking(false);
          setAvatarState('idle');
        };
        audio.onerror = () => {
          fallbackWebSpeech(text);
        };
        await audio.play();
        return;
      }
    } catch {
      // Fallback to browser SpeechSynthesis
    }

    fallbackWebSpeech(text);
  };

  const fallbackWebSpeech = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = settings.voiceSpeed || 1.05;
      utterance.pitch = settings.voicePitch || 1.35; // cute, sweet anime fairy pitch
      utterance.lang = settings.language === 'hi' ? 'hi-IN' : 'en-US';

      // Pick sweet female voice if available
      try {
        const voices = window.speechSynthesis.getVoices();
        const preferred = voices.find(
          (v) =>
            v.lang.startsWith(settings.language === 'hi' ? 'hi' : 'en') &&
            /female|girl|samantha|victoria|zira|kareena|natural|sweet/i.test(v.name)
        ) || voices.find((v) => /female|girl|samantha|zira/i.test(v.name));
        if (preferred) {
          utterance.voice = preferred;
        }
      } catch {}

      utterance.onend = () => {
        setIsSpeaking(false);
        setAvatarState('idle');
      };
      utterance.onerror = () => {
        setIsSpeaking(false);
        setAvatarState('idle');
      };
      window.speechSynthesis.speak(utterance);
    } else {
      setIsSpeaking(false);
      setAvatarState('idle');
    }
  };

  const stopSpeaking = () => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setAvatarState('idle');
  };

  // Briefing calculation
  const getBriefingData = (): BriefingData => {
    const today = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    });
    return {
      greeting: 'Good morning! Welcome to your day with Lyra.',
      dateStr: today,
      weatherSummary: 'Sunny & Pleasant, 24°C in your area.',
      pendingTasksCount: tasks.filter((t) => t.status === 'pending').length,
      todaysEventsCount: events.length,
      keyQuote: 'Consistency is the DNA of mastery. One focused step at a time.',
      recommendation: 'Prioritize your Python study session and review architecture specifications.',
    };
  };

  // User input orchestrator
  const handleUserMessage = async (
    userText: string,
    attachment?: { type: 'image' | 'doc' | 'audio' | 'video'; dataUrl: string; name: string },
    aspectRatio: string = '1:1'
  ) => {
    if (!userText.trim() && !attachment) return;

    // 1. Add user message
    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: 'user',
      text: userText,
      timestamp: Date.now(),
      attachment,
    };
    setMessages((prev) => [...prev, userMsg]);

    // 2. Fast Local Intent Detection
    const localResult = CommandRouter.parseLocalCommand(userText, contacts);

    if (localResult.isLocal) {
      // Execute or prepare action locally!
      if (localResult.intentType === 'alarm' && localResult.toolAction) {
        const timeVal = localResult.toolAction.params.time;
        setAlarms((prev) => [
          ...prev,
          {
            id: `a-${Date.now()}`,
            label: localResult.toolAction?.params.label || 'Lyra Alarm',
            time: timeVal,
            days: ['Today'],
            enabled: true,
          },
        ]);
      } else if (localResult.intentType === 'timer' && localResult.toolAction) {
        const secs = localResult.toolAction.params.totalSeconds;
        setTimers((prev) => [
          ...prev,
          {
            id: `tm-${Date.now()}`,
            label: localResult.toolAction?.params.label || 'Countdown',
            totalSeconds: secs,
            remainingSeconds: secs,
            isRunning: true,
          },
        ]);
      } else if (
        ['camera', 'settings', 'browser', 'browser_search', 'maps'].includes(
          localResult.intentType || ''
        ) &&
        localResult.toolAction?.intentUri
      ) {
        PhoneControlService.dispatchIntent(localResult.toolAction.intentUri);
      }

      const assistantMsg: Message = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        text: localResult.replyText,
        timestamp: Date.now(),
        toolAction: localResult.toolAction,
      };

      setMessages((prev) => [...prev, assistantMsg]);
      setLatestAssistantText(localResult.replyText);

      if (settings.autoTts) {
        playSpeech(localResult.replyText);
      }
      return;
    }

    // 3. AI Reasoning Routing
    setIsThinking(true);
    setAvatarState('thinking');

    try {
      // Check if image attachment uploaded -> vision endpoint
      if (attachment && attachment.type === 'image') {
        const base64Data = attachment.dataUrl.split(',')[1] || '';
        const res = await fetch('/api/vision', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: userText || 'Explain this image or document in detail.',
            imageBase64: base64Data,
          }),
        });
        const data = await res.json();
        const reply = data.text || 'Document analyzed.';

        const aiMsg: Message = {
          id: `a-${Date.now()}`,
          role: 'assistant',
          text: reply,
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, aiMsg]);
        setLatestAssistantText(reply);
        if (settings.autoTts) playSpeech(reply);
        return;
      }

      // Check if image generation requested
      if (
        userText.toLowerCase().includes('generate image') ||
        userText.toLowerCase().includes('create image') ||
        userText.toLowerCase().includes('draw a') ||
        userText.toLowerCase().includes('तस्वीर बनाओ')
      ) {
        const res = await fetch('/api/image-gen', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: userText,
            aspectRatio: aspectRatio || '1:1',
          }),
        });
        const data = await res.json();
        if (data.success && data.imageUrl) {
          const aiMsg: Message = {
            id: `a-${Date.now()}`,
            role: 'assistant',
            text: `मैंने आपके लिए ${aspectRatio} aspect ratio में यह तस्वीर तैयार की है:`,
            timestamp: Date.now(),
            attachment: {
              type: 'image',
              dataUrl: data.imageUrl,
              name: 'generated_image.png',
            },
          };
          setMessages((prev) => [...prev, aiMsg]);
          setLatestAssistantText(aiMsg.text);
          if (settings.autoTts) playSpeech(aiMsg.text);
          return;
        }
      }

      // Check if Search or Maps Grounding should be prioritized
      const isSearchQuery =
        userText.toLowerCase().includes('search') ||
        userText.toLowerCase().includes('latest') ||
        userText.toLowerCase().includes('news') ||
        userText.toLowerCase().includes('weather') ||
        userText.toLowerCase().includes('मौसम');

      const isMapsQuery =
        userText.toLowerCase().includes('restaurant') ||
        userText.toLowerCase().includes('directions') ||
        userText.toLowerCase().includes('nearby') ||
        userText.toLowerCase().includes('places in');

      let endpoint = '/api/chat';
      let payload: any = {
        prompt: userText,
        modelMode: settings.modelMode,
        conversationHistory: messages.slice(-6).map((m) => ({
          role: m.role,
          text: m.text,
        })),
        useSearch: isSearchQuery,
      };

      if (isMapsQuery) {
        endpoint = '/api/maps';
        payload = { query: userText };
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      const reply = data.text || 'I have completed your request.';
      const sources = (data.groundingChunks || []).map((c: any) => ({
        title: c.web?.title || c.maps?.title || 'Verified Source',
        uri: c.web?.uri || c.maps?.uri,
      })).filter((s: any) => Boolean(s.uri));

      const aiMsg: Message = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        text: reply,
        timestamp: Date.now(),
        sources: sources.length > 0 ? sources : undefined,
      };

      setMessages((prev) => [...prev, aiMsg]);
      setLatestAssistantText(reply);
      if (settings.autoTts) playSpeech(reply);
    } catch (err: any) {
      const errMsg: Message = {
        id: `a-err-${Date.now()}`,
        role: 'assistant',
        text: `I couldn't complete that because of a connection error: ${err?.message || 'Server error'}. Please check internet connection or model settings.`,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errMsg]);
      setLatestAssistantText(errMsg.text);
    } finally {
      setIsThinking(false);
      if (!isSpeaking) setAvatarState('idle');
    }
  };

  // Tool Confirm / Cancel Handlers
  const handleConfirmToolAction = (msgId: string, action: ToolActionPayload) => {
    if (action.intentUri) {
      PhoneControlService.dispatchIntent(action.intentUri);
    }
    setMessages((prev) =>
      prev.map((m) =>
        m.id === msgId && m.toolAction
          ? {
              ...m,
              toolAction: {
                ...m.toolAction,
                status: 'executed',
                resultDescription: `Action executed successfully on device: ${action.actionTitle}`,
              },
            }
          : m
      )
    );
  };

  const handleCancelToolAction = (msgId: string) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === msgId && m.toolAction
          ? {
              ...m,
              toolAction: {
                ...m.toolAction,
                status: 'cancelled',
                resultDescription: 'Action was cancelled by user.',
              },
            }
          : m
      )
    );
  };

  // AI Council executor
  const handleExecuteCouncil = async (query: string): Promise<string> => {
    const res = await fetch('/api/council', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: query }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error);
    return data.deliberation;
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden font-sans select-none">
      {/* Top Android App Header */}
      <header className="h-14 px-4 border-b border-slate-800/80 glass-panel flex items-center justify-between z-20">
        <div className="flex items-center space-x-3">
          <div
            onClick={() => setActiveMode('voice')}
            className="flex items-center space-x-2 cursor-pointer group"
          >
            <LyraAvatar
              size="sm"
              state={avatarState}
              mood={settings.avatarMood}
              audioSpeaking={isSpeaking}
              showStatusBadge={false}
            />
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-fairy font-bold text-base tracking-wider bg-gradient-to-r from-purple-300 via-pink-300 to-indigo-300 bg-clip-text text-transparent">
                  LYRA
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 font-mono-code">
                  OS
                </span>
              </div>
              <p className="text-[10px] text-pink-300 font-medium">🌸 Anime Butterfly Fairy • नन्ही तितली परी</p>
            </div>
          </div>
        </div>

        {/* Proactive Slot Notification Pill */}
        {proactiveBanner && (
          <div className="hidden md:flex items-center space-x-2 px-3 py-1 rounded-full glass-card border border-purple-500/30 text-xs text-purple-200">
            <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-spin" />
            <span className="truncate max-w-xs">{proactiveBanner}</span>
            <button
              onClick={() => setProactiveBanner(null)}
              className="text-slate-400 hover:text-slate-200 text-xs ml-1 cursor-pointer"
            >
              ×
            </button>
          </div>
        )}

        {/* Action Header Icons */}
        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => setIsAiCouncilOpen(true)}
            className="p-2 rounded-full glass-card hover:bg-slate-800 text-slate-300 hover:text-purple-300 transition-colors cursor-pointer border border-slate-700/60"
            title="AI Council (Gemini + GPT + Claude)"
          >
            <Scale className="w-4 h-4 text-purple-400" />
          </button>

          <button
            onClick={() => setIsPermissionsOpen(true)}
            className="p-2 rounded-full glass-card hover:bg-slate-800 text-slate-300 hover:text-emerald-300 transition-colors cursor-pointer border border-slate-700/60"
            title="Android Permissions & Privacy"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </button>

          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 rounded-full glass-card hover:bg-slate-800 text-slate-300 hover:text-purple-300 transition-colors cursor-pointer border border-slate-700/60"
            title="Assistant Settings"
          >
            <Sliders className="w-4 h-4 text-slate-300" />
          </button>

          <button
            onClick={() => setIsFloating(!isFloating)}
            className="p-2 rounded-full glass-card hover:bg-slate-800 text-slate-300 hover:text-cyan-300 transition-colors cursor-pointer border border-slate-700/60"
            title={isFloating ? 'Restore App' : 'Minimize to Floating Avatar'}
          >
            <Minimize2 className="w-4 h-4 text-cyan-400" />
          </button>
        </div>
      </header>

      {/* Main Interaction Canvas */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {activeMode === 'voice' && (
          <VoiceMode
            settings={settings}
            setSettings={setSettings}
            avatarState={avatarState}
            setAvatarState={setAvatarState}
            isSpeaking={isSpeaking}
            onUserSpeech={(transcript) => handleUserMessage(transcript)}
            onStopSpeaking={stopSpeaking}
            onSwitchToChat={() => setActiveMode('chat')}
            onTestVoice={playSpeech}
            latestAssistantText={latestAssistantText}
            contacts={contacts}
          />
        )}

        {activeMode === 'chat' && (
          <ChatMode
            messages={messages}
            onSendMessage={handleUserMessage}
            onConfirmToolAction={handleConfirmToolAction}
            onCancelToolAction={handleCancelToolAction}
            onPlayMessageVoice={playSpeech}
            isSpeaking={isSpeaking}
            onStopSpeaking={stopSpeaking}
            onSwitchToVoice={() => setActiveMode('voice')}
            settings={settings}
            contacts={contacts}
            isThinking={isThinking}
          />
        )}

        {activeMode === 'productivity' && (
          <ProductivitySuite
            alarms={alarms}
            setAlarms={setAlarms}
            timers={timers}
            setTimers={setTimers}
            tasks={tasks}
            setTasks={setTasks}
            events={events}
            setEvents={setEvents}
            contacts={contacts}
            setContacts={setContacts}
            memories={memories}
            setMemories={setMemories}
            briefing={getBriefingData()}
            onReadBriefing={() => playSpeech(getBriefingData().greeting + ' ' + getBriefingData().weatherSummary + ' ' + getBriefingData().recommendation)}
            onOpenCall={(num) => {
              const action = PhoneControlService.prepareCall(num);
              PhoneControlService.dispatchIntent(action.intentUri!);
            }}
            onOpenSms={(num) => {
              const action = PhoneControlService.prepareSms(num, 'Hello via Lyra');
              PhoneControlService.dispatchIntent(action.intentUri!);
            }}
          />
        )}
      </main>

      {/* Bottom Android Navigation Bar */}
      <nav className="h-14 border-t border-slate-800/80 glass-panel flex items-center justify-around px-4 z-20">
        <button
          onClick={() => setActiveMode('voice')}
          className={`flex flex-col items-center justify-center py-1 px-4 rounded-xl cursor-pointer transition-colors ${
            activeMode === 'voice' ? 'text-purple-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Mic className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Voice Mode</span>
        </button>

        <button
          onClick={() => setActiveMode('chat')}
          className={`flex flex-col items-center justify-center py-1 px-4 rounded-xl cursor-pointer transition-colors ${
            activeMode === 'chat' ? 'text-purple-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <MessageSquare className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Text Chat</span>
        </button>

        <button
          onClick={() => setActiveMode('productivity')}
          className={`flex flex-col items-center justify-center py-1 px-4 rounded-xl cursor-pointer transition-colors ${
            activeMode === 'productivity' ? 'text-purple-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Calendar className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Phone OS Suite</span>
        </button>
      </nav>

      {/* Floating Assistant Widget (when user minimizes or overlay enabled) */}
      <FloatingAssistant
        isFloating={isFloating}
        onExpand={() => setIsFloating(false)}
        avatarState={avatarState}
        settings={settings}
        isSpeaking={isSpeaking}
        onToggleMic={() => {
          setIsFloating(false);
          setActiveMode('voice');
        }}
      />

      {/* Modals */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        setSettings={setSettings}
        onOpenPermissions={() => setIsPermissionsOpen(true)}
      />

      <AiCouncilModal
        isOpen={isAiCouncilOpen}
        onClose={() => setIsAiCouncilOpen(false)}
        onExecuteCouncil={handleExecuteCouncil}
      />

      <PermissionManagerModal
        isOpen={isPermissionsOpen}
        onClose={() => setIsPermissionsOpen(false)}
        permissions={permissions}
        setPermissions={setPermissions}
        onClearHistory={() => setMessages([])}
        onClearMemories={() => setMemories([])}
        onExportData={() => {
          const data = { settings, messages, tasks, events, alarms, contacts, memories };
          const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `lyra-full-backup-${Date.now()}.json`;
          a.click();
        }}
      />
    </div>
  );
}
