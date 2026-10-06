import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  MessageSquare,
  RefreshCw,
  PhoneCall,
  Bell,
  Navigation,
  Globe,
  Radio,
} from 'lucide-react';
import { LyraAvatar } from './LyraAvatar';
import { AvatarState, AssistantSettings, ContactItem } from '../types';

interface VoiceModeProps {
  settings: AssistantSettings;
  setSettings?: React.Dispatch<React.SetStateAction<AssistantSettings>>;
  avatarState: AvatarState;
  setAvatarState: (st: AvatarState) => void;
  isSpeaking: boolean;
  onUserSpeech: (transcript: string) => Promise<void>;
  onStopSpeaking: () => void;
  onSwitchToChat: () => void;
  onTestVoice?: (text: string) => void;
  latestAssistantText: string;
  contacts: ContactItem[];
}

export const VoiceMode: React.FC<VoiceModeProps> = ({
  settings,
  setSettings,
  avatarState,
  setAvatarState,
  isSpeaking,
  onUserSpeech,
  onStopSpeaking,
  onSwitchToChat,
  onTestVoice,
  latestAssistantText,
  contacts,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [waveformBars, setWaveformBars] = useState<number[]>([12, 24, 18, 30, 16, 28, 14]);
  const recognitionRef = useRef<any>(null);
  const isMounted = useRef(true);

  // Setup Web Speech Recognition
  useEffect(() => {
    isMounted.current = true;
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang =
        settings.language === 'hi' ? 'hi-IN' : settings.language === 'en' ? 'en-US' : 'en-IN';

      recognition.onstart = () => {
        if (!isMounted.current) return;
        setIsListening(true);
        setAvatarState('listening');
      };

      recognition.onresult = (event: any) => {
        if (!isMounted.current) return;
        let currentText = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          currentText += event.results[i][0].transcript;
        }
        setTranscript(currentText);
      };

      recognition.onerror = (err: any) => {
        console.warn('Speech recognition error:', err);
        if (!isMounted.current) return;
        setIsListening(false);
        if (avatarState === 'listening') setAvatarState('idle');
      };

      recognition.onend = () => {
        if (!isMounted.current) return;
        setIsListening(false);
        if (transcript.trim()) {
          const finalPrompt = transcript.trim();
          setTranscript('');
          onUserSpeech(finalPrompt);
        } else if (avatarState === 'listening') {
          setAvatarState('idle');
        }
      };

      recognitionRef.current = recognition;
    }

    return () => {
      isMounted.current = false;
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
    };
  }, [settings.language]);

  // Waveform animation loop
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isListening || isSpeaking) {
      interval = setInterval(() => {
        setWaveformBars(
          Array.from({ length: 9 }, () =>
            isListening ? Math.floor(Math.random() * 38) + 8 : Math.floor(Math.random() * 45) + 12
          )
        );
      }, 100);
    } else {
      setWaveformBars([8, 12, 10, 14, 10, 12, 8]);
    }
    return () => clearInterval(interval);
  }, [isListening, isSpeaking]);

  const toggleListening = () => {
    if (isSpeaking) {
      onStopSpeaking();
    }

    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
      setIsListening(false);
      setAvatarState('idle');
    } else {
      setTranscript('');
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (e) {
          // If already started or permission prompt needed
          try {
            recognitionRef.current.abort();
            recognitionRef.current.start();
          } catch {}
        }
      } else {
        alert('Web Speech recognition is not available in this browser. You can type in Text Mode.');
      }
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    onUserSpeech(prompt);
  };

  return (
    <div className="flex-1 flex flex-col justify-between items-center px-4 py-6 relative overflow-hidden select-none">
      {/* Top Bar Indicators */}
      <div className="w-full flex items-center justify-between z-10 max-w-md">
        <div className="flex items-center space-x-2">
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="text-xs uppercase tracking-wider text-slate-400 font-mono-code font-semibold">
            {settings.modelMode.toUpperCase()} BRAIN • {settings.voicePersona}
          </span>
        </div>

        <button
          onClick={onSwitchToChat}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full glass-card hover:bg-slate-800/80 text-xs text-purple-300 border border-purple-500/20 transition-all cursor-pointer"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Text Mode</span>
        </button>
      </div>

      {/* Main Avatar Centerpiece */}
      <div className="my-auto flex flex-col items-center justify-center text-center max-w-sm w-full z-10">
        <div className="relative group">
          <LyraAvatar
            size="hero"
            state={avatarState}
            mood={settings.avatarMood}
            audioSpeaking={isSpeaking}
            onClick={toggleListening}
          />
        </div>

        {/* Live Audio Waveform Bars */}
        <div className="flex items-center justify-center space-x-1.5 h-10 mt-4 mb-2">
          {waveformBars.map((height, i) => (
            <div
              key={i}
              className="w-1.5 rounded-full transition-all duration-100"
              style={{
                height: `${height}px`,
                backgroundColor: isListening
                  ? '#06b6d4'
                  : isSpeaking
                  ? '#ec4899'
                  : '#64748b',
                boxShadow:
                  isListening || isSpeaking
                    ? `0 0 10px ${isListening ? '#06b6d4' : '#ec4899'}`
                    : 'none',
              }}
            />
          ))}
        </div>

        {/* Dynamic Transcription / Assistant Spoken Text */}
        <div className="min-h-[72px] flex items-center justify-center px-4 py-2 w-full">
          {isListening ? (
            <div className="text-sm text-cyan-300 font-medium animate-pulse flex items-center space-x-2">
              <Radio className="w-4 h-4 animate-spin text-cyan-400" />
              <span>{transcript || 'Listening to your voice... Speak now'}</span>
            </div>
          ) : isSpeaking ? (
            <p className="text-sm text-purple-200 line-clamp-3 leading-relaxed font-normal">
              "{latestAssistantText}"
            </p>
          ) : latestAssistantText ? (
            <p className="text-sm text-slate-300 line-clamp-3 leading-relaxed">
              "{latestAssistantText}"
            </p>
          ) : (
            <p className="text-xs text-slate-400">
              Tap the microphone to speak with Lyra in Hindi, English, or Hinglish.
            </p>
          )}
        </div>
      </div>

      {/* Bottom Controls & Quick Phone Actions */}
      <div className="w-full max-w-md flex flex-col items-center space-y-3 z-10">
        {/* Quick Voice Selector Pills (इसका वॉइस को चेंज करो) */}
        {setSettings && (
          <div className="flex items-center space-x-1.5 glass-card px-2.5 py-1 rounded-full border border-purple-500/20 text-[11px] overflow-x-auto no-scrollbar max-w-full">
            <span className="text-purple-300 font-semibold mr-1 flex items-center space-x-1">
              <Volume2 className="w-3 h-3 text-pink-400" />
              <span>Voice:</span>
            </span>

            {[
              { id: 'Kore', label: '🌸 Kore (Sweet Fairy)' },
              { id: 'Zephyr', label: '🍃 Zephyr (Soft)' },
              { id: 'Puck', label: '✨ Puck (Playful)' },
            ].map((v) => (
              <button
                key={v.id}
                onClick={() => {
                  setSettings((s) => ({
                    ...s,
                    voicePersona: v.id as any,
                    voicePitch: 1.35,
                  }));
                  if (onTestVoice) {
                    onTestVoice(`नमस्ते! यह मेरी ${v.label.split(' ')[1]} आवाज़ है.`);
                  }
                }}
                className={`px-2 py-0.5 rounded-full transition-all cursor-pointer whitespace-nowrap ${
                  settings.voicePersona === v.id
                    ? 'bg-purple-600 text-white font-medium shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                {v.label}
              </button>
            ))}

            {onTestVoice && (
              <button
                onClick={() => onTestVoice('नमस्ते! मैं Lyra हूँ, आपकी नन्ही तितली परी.')}
                className="ml-1 px-2 py-0.5 rounded-full bg-pink-600/30 text-pink-200 hover:bg-pink-600/50 cursor-pointer text-[10px] whitespace-nowrap font-medium"
              >
                ▶ Test Voice
              </button>
            )}
          </div>
        )}

        {/* Quick Phone Command Chips */}
        <div className="flex items-center space-x-2 overflow-x-auto w-full py-1 px-1 no-scrollbar justify-center">
          <button
            onClick={() => handleQuickPrompt('कल सुबह 6 बजे का alarm लगाओ')}
            className="flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs glass-card border border-slate-700/60 text-slate-300 hover:text-amber-300 hover:border-amber-500/40 whitespace-nowrap cursor-pointer transition-colors"
          >
            <Bell className="w-3 h-3 text-amber-400" />
            <span>Alarm 6 AM</span>
          </button>
          <button
            onClick={() => handleQuickPrompt('Chrome खोलो')}
            className="flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs glass-card border border-slate-700/60 text-slate-300 hover:text-blue-300 hover:border-blue-500/40 whitespace-nowrap cursor-pointer transition-colors"
          >
            <Globe className="w-3 h-3 text-blue-400" />
            <span>Open Chrome</span>
          </button>
          <button
            onClick={() => handleQuickPrompt('माँ को call करो')}
            className="flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs glass-card border border-slate-700/60 text-slate-300 hover:text-emerald-300 hover:border-emerald-500/40 whitespace-nowrap cursor-pointer transition-colors"
          >
            <PhoneCall className="w-3 h-3 text-emerald-400" />
            <span>Call Mom</span>
          </button>
          <button
            onClick={() => handleQuickPrompt('घर का रास्ता दिखाओ')}
            className="flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs glass-card border border-slate-700/60 text-slate-300 hover:text-pink-300 hover:border-pink-500/40 whitespace-nowrap cursor-pointer transition-colors"
          >
            <Navigation className="w-3 h-3 text-pink-400" />
            <span>Navigate</span>
          </button>
        </div>

        {/* Big Central Mic Button */}
        <div className="flex items-center justify-center space-x-6">
          {isSpeaking && (
            <button
              onClick={onStopSpeaking}
              className="p-3 rounded-full bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-600 transition-all cursor-pointer"
              title="Stop Speaking"
            >
              <VolumeX className="w-5 h-5" />
            </button>
          )}

          <button
            onClick={toggleListening}
            className={`relative p-5 rounded-full transition-all duration-300 shadow-xl cursor-pointer ${
              isListening
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 ring-4 ring-cyan-400/50 scale-105'
                : isSpeaking
                ? 'bg-gradient-to-r from-pink-600 to-purple-600 ring-4 ring-pink-500/30'
                : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 ring-2 ring-purple-400/20'
            }`}
          >
            {isListening ? (
              <Mic className="w-8 h-8 text-white animate-pulse" />
            ) : isSpeaking ? (
              <Volume2 className="w-8 h-8 text-white animate-bounce" />
            ) : (
              <Mic className="w-8 h-8 text-white" />
            )}
          </button>

          <button
            onClick={onSwitchToChat}
            className="p-3 rounded-full bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-600 transition-all cursor-pointer"
            title="Open Chat"
          >
            <MessageSquare className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
