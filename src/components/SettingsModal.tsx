import React from 'react';
import {
  X,
  Sliders,
  Cpu,
  Volume2,
  Palette,
  ShieldCheck,
  Sparkles,
  Smile,
  Mic,
  Languages,
} from 'lucide-react';
import { AssistantSettings, ModelMode, VoicePersona, VoiceStyle, AppTheme, AvatarMood } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AssistantSettings;
  setSettings: React.Dispatch<React.SetStateAction<AssistantSettings>>;
  onOpenPermissions: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  setSettings,
  onOpenPermissions,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="glass-panel w-full max-w-lg rounded-2xl p-5 border border-slate-700/80 shadow-2xl max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <Sliders className="w-5 h-5 text-purple-400" />
            <h3 className="text-base font-bold text-slate-100">Lyra Intelligence & Preferences</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-5 text-xs text-slate-300">
          {/* 1. AI Reasoning Mode */}
          <div className="space-y-2">
            <label className="font-semibold text-slate-200 flex items-center space-x-1.5">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span>AI Reasoning Engine Mode</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'fast', label: 'Fast (Lite)', sub: 'Lowest latency' },
                { id: 'balanced', label: 'Balanced', sub: 'Gemini 3.8 Flash' },
                { id: 'maximum', label: 'Maximum', sub: 'Deep Thinking Pro' },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() =>
                    setSettings((s) => ({ ...s, modelMode: m.id as ModelMode }))
                  }
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    settings.modelMode === m.id
                      ? 'bg-purple-600/30 border-purple-500 text-purple-200 shadow'
                      : 'glass-card border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <p className="font-bold text-xs">{m.label}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{m.sub}</p>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Voice Persona & Style */}
          <div className="space-y-2">
            <label className="font-semibold text-slate-200 flex items-center space-x-1.5">
              <Volume2 className="w-4 h-4 text-pink-400" />
              <span>Lyra Voice Personality & Timbre</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-[11px] text-slate-400 block mb-1">Prebuilt Voice:</span>
                <select
                  value={settings.voicePersona}
                  onChange={(e) =>
                    setSettings((s) => ({
                      ...s,
                      voicePersona: e.target.value as VoicePersona,
                    }))
                  }
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-200"
                >
                  <option value="Kore">Kore (Ethereal & Gentle - Recommended)</option>
                  <option value="Puck">Puck (Playful & Quick)</option>
                  <option value="Charon">Charon (Deep & Resonant)</option>
                  <option value="Fenrir">Fenrir (Authoritative & Strong)</option>
                  <option value="Zephyr">Zephyr (Breezy & Natural)</option>
                </select>
              </div>

              <div>
                <span className="text-[11px] text-slate-400 block mb-1">Voice Style Persona:</span>
                <select
                  value={settings.voiceStyle}
                  onChange={(e) =>
                    setSettings((s) => ({
                      ...s,
                      voiceStyle: e.target.value as VoiceStyle,
                    }))
                  }
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-200"
                >
                  <option value="Calm">Calm & Serene</option>
                  <option value="Warm">Warm & Empathetic</option>
                  <option value="Professional">Professional & Precise</option>
                  <option value="Energetic">Energetic & Vibrant</option>
                  <option value="Friendly">Friendly & Approachable</option>
                  <option value="Futuristic">Futuristic & Cybernetic</option>
                </select>
              </div>
            </div>
          </div>

          {/* 3. Avatar Mood Preset */}
          <div className="space-y-2">
            <label className="font-semibold text-slate-200 flex items-center space-x-1.5">
              <Smile className="w-4 h-4 text-amber-400" />
              <span>Avatar Mood & Expression</span>
            </label>
            <select
              value={settings.avatarMood}
              onChange={(e) =>
                setSettings((s) => ({
                  ...s,
                  avatarMood: e.target.value as AvatarMood,
                }))
              }
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-200"
            >
              <option value="calm">Calm (Ethereal Fairy Radiance)</option>
              <option value="happy">Happy (Joyful Fairy Flutter)</option>
              <option value="focused">Focused (Sapphire Analytical Aura)</option>
              <option value="motivational">Motivational (Starlight Violet Glow)</option>
              <option value="serious">Serious (Clear Direct Presentation)</option>
              <option value="sleepy">Sleepy (Gentle Nighttime Rest)</option>
            </select>
          </div>

          {/* 4. Language & Bilingual Understanding */}
          <div className="space-y-2">
            <label className="font-semibold text-slate-200 flex items-center space-x-1.5">
              <Languages className="w-4 h-4 text-emerald-400" />
              <span>Language Comprehension</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'mixed', label: 'Hindi + English', sub: 'Hinglish natural' },
                { id: 'en', label: 'English Only', sub: 'Global English' },
                { id: 'hi', label: 'Hindi (हिंदी)', sub: 'शुद्ध एवं सहज' },
              ].map((lang) => (
                <button
                  key={lang.id}
                  onClick={() =>
                    setSettings((s) => ({
                      ...s,
                      language: lang.id as any,
                    }))
                  }
                  className={`p-2 rounded-xl border text-left cursor-pointer transition-all ${
                    settings.language === lang.id
                      ? 'bg-purple-600/30 border-purple-500 text-purple-200'
                      : 'glass-card border-slate-800'
                  }`}
                >
                  <p className="font-bold text-xs">{lang.label}</p>
                  <p className="text-[10px] text-slate-400">{lang.sub}</p>
                </button>
              ))}
            </div>
          </div>

          {/* 5. Toggles: Wake Word & Confirmation preferences */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-200">"Hey Lyra" Wake Word Listening</p>
                <p className="text-[11px] text-slate-400">
                  Allow listening when app is active on screen
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.wakeWordEnabled}
                onChange={(e) =>
                  setSettings((s) => ({ ...s, wakeWordEnabled: e.target.checked }))
                }
                className="w-4 h-4 accent-purple-600 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-200">Proactive Suggestions</p>
                <p className="text-[11px] text-slate-400">
                  Suggest calendar slots and task deadline warnings
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.proactiveEnabled}
                onChange={(e) =>
                  setSettings((s) => ({ ...s, proactiveEnabled: e.target.checked }))
                }
                className="w-4 h-4 accent-purple-600 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-200">Auto Spoken Responses (TTS)</p>
                <p className="text-[11px] text-slate-400">
                  Automatically speak replies in voice mode
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.autoTts}
                onChange={(e) =>
                  setSettings((s) => ({ ...s, autoTts: e.target.checked }))
                }
                className="w-4 h-4 accent-purple-600 cursor-pointer"
              />
            </div>
          </div>

          {/* 6. Permission Manager Link */}
          <div className="pt-2">
            <button
              onClick={() => {
                onClose();
                onOpenPermissions();
              }}
              className="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-xs font-semibold text-slate-200 flex items-center justify-center space-x-2 cursor-pointer transition-colors"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Android Permissions & Security Dashboard</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
