import React from 'react';
import { LyraAvatar } from './LyraAvatar';
import { AvatarState, AssistantSettings } from '../types';
import { Maximize2, Mic, Volume2 } from 'lucide-react';

interface FloatingAssistantProps {
  isFloating: boolean;
  onExpand: () => void;
  avatarState: AvatarState;
  settings: AssistantSettings;
  isSpeaking: boolean;
  onToggleMic: () => void;
}

export const FloatingAssistant: React.FC<FloatingAssistantProps> = ({
  isFloating,
  onExpand,
  avatarState,
  settings,
  isSpeaking,
  onToggleMic,
}) => {
  if (!isFloating) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-center">
      <div className="relative group">
        <div
          onClick={onExpand}
          className="glass-panel p-2 rounded-full border border-purple-500/50 shadow-2xl hover:scale-105 transition-all cursor-pointer flex items-center justify-center"
        >
          <LyraAvatar
            size="sm"
            state={avatarState}
            mood={settings.avatarMood}
            audioSpeaking={isSpeaking}
            showStatusBadge={false}
          />
        </div>

        {/* Quick Expand Button Hover */}
        <button
          onClick={onExpand}
          className="absolute -top-2 -right-2 p-1 rounded-full bg-purple-600 hover:bg-purple-500 text-white shadow-md cursor-pointer"
          title="Expand Lyra"
        >
          <Maximize2 className="w-3 h-3" />
        </button>

        {/* Quick Mic Action */}
        <button
          onClick={onToggleMic}
          className="absolute -bottom-1 -left-1 p-1 rounded-full bg-slate-900 border border-slate-700 text-cyan-400 hover:text-cyan-300 shadow cursor-pointer"
          title="Toggle Mic"
        >
          <Mic className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
