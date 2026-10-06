export type ModelMode = 'fast' | 'balanced' | 'maximum';

export type VoicePersona = 'Kore' | 'Puck' | 'Charon' | 'Fenrir' | 'Zephyr';

export type VoiceStyle =
  | 'Calm'
  | 'Warm'
  | 'Professional'
  | 'Energetic'
  | 'Friendly'
  | 'Serious'
  | 'Soft'
  | 'Futuristic';

export type AvatarMood =
  | 'calm'
  | 'happy'
  | 'focused'
  | 'professional'
  | 'excited'
  | 'serious'
  | 'sleepy'
  | 'motivational';

export type AvatarState =
  | 'idle'
  | 'listening'
  | 'thinking'
  | 'speaking'
  | 'happy'
  | 'focused'
  | 'surprised'
  | 'error'
  | 'sleepy';

export type AppTheme =
  | 'fantasy'
  | 'midnight'
  | 'dark'
  | 'light'
  | 'futuristic'
  | 'minimal';

export interface GroundingSource {
  title?: string;
  uri?: string;
}

export interface ToolActionPayload {
  toolName: string;
  actionTitle: string;
  params: Record<string, any>;
  sensitive: boolean;
  status: 'pending_confirmation' | 'executed' | 'cancelled' | 'failed';
  resultDescription?: string;
  intentUri?: string;
  details?: Record<string, any>;
}

export interface MediaAttachment {
  type: 'image' | 'doc' | 'audio' | 'video';
  dataUrl: string;
  name: string;
  size?: number;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: number;
  toolAction?: ToolActionPayload;
  sources?: GroundingSource[];
  audioBase64?: string;
  attachment?: MediaAttachment;
  isStreaming?: boolean;
}

export interface AlarmItem {
  id: string;
  label: string;
  time: string; // "07:00"
  days: string[]; // ["Mon", "Tue", ...]
  enabled: boolean;
}

export interface TimerItem {
  id: string;
  label: string;
  totalSeconds: number;
  remainingSeconds: number;
  isRunning: boolean;
}

export interface TaskItem {
  id: string;
  title: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate: string;
  dueTime?: string;
  status: 'pending' | 'completed';
  project?: string;
  category?: string;
}

export interface CalendarEventItem {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  location?: string;
  description?: string;
}

export interface ContactItem {
  id: string;
  name: string;
  phone: string;
  relationship?: string;
  avatarColor?: string;
}

export interface MemoryItem {
  id: string;
  key: string;
  value: string;
  category: 'preference' | 'routine' | 'goal' | 'fact' | 'instruction';
  createdAt: string;
}

export interface BriefingData {
  greeting: string;
  dateStr: string;
  weatherSummary: string;
  pendingTasksCount: number;
  todaysEventsCount: number;
  keyQuote: string;
  recommendation: string;
}

export interface AssistantSettings {
  modelMode: ModelMode;
  voicePersona: VoicePersona;
  voiceStyle: VoiceStyle;
  voiceSpeed: number;
  voicePitch: number;
  autoTts: boolean;
  wakeWordEnabled: boolean;
  proactiveEnabled: boolean;
  theme: AppTheme;
  language: 'mixed' | 'en' | 'hi';
  avatarMood: AvatarMood;
  confirmations: {
    call: boolean;
    sms: boolean;
    delete: boolean;
    alarm: boolean;
  };
}

export interface DevicePermissions {
  microphone: boolean;
  contacts: boolean;
  phone: boolean;
  sms: boolean;
  calendar: boolean;
  location: boolean;
  notifications: boolean;
  camera: boolean;
  files: boolean;
  overlay: boolean;
}
