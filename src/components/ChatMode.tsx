import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Mic,
  Image as ImageIcon,
  Paperclip,
  Volume2,
  VolumeX,
  Sparkles,
  PhoneCall,
  CheckCircle,
  XCircle,
  ExternalLink,
  MapPin,
  Clock,
  Bell,
  Trash2,
  Copy,
  ChevronDown,
  FileText,
  Search,
} from 'lucide-react';
import { Message, ToolActionPayload, ContactItem, AssistantSettings } from '../types';
import { PhoneControlService } from '../services/phoneControl';

interface ChatModeProps {
  messages: Message[];
  onSendMessage: (
    text: string,
    attachment?: { type: 'image' | 'doc' | 'audio' | 'video'; dataUrl: string; name: string },
    aspectRatio?: string
  ) => Promise<void>;
  onConfirmToolAction: (msgId: string, action: ToolActionPayload) => void;
  onCancelToolAction: (msgId: string) => void;
  onPlayMessageVoice: (text: string) => void;
  isSpeaking: boolean;
  onStopSpeaking: () => void;
  onSwitchToVoice: () => void;
  settings: AssistantSettings;
  contacts: ContactItem[];
  isThinking: boolean;
}

export const ChatMode: React.FC<ChatModeProps> = ({
  messages,
  onSendMessage,
  onConfirmToolAction,
  onCancelToolAction,
  onPlayMessageVoice,
  isSpeaking,
  onStopSpeaking,
  onSwitchToVoice,
  settings,
  contacts,
  isThinking,
}) => {
  const [inputText, setInputText] = useState('');
  const [selectedAttachment, setSelectedAttachment] = useState<{
    type: 'image' | 'doc' | 'audio' | 'video';
    dataUrl: string;
    name: string;
  } | null>(null);
  const [selectedAspectRatio, setSelectedAspectRatio] = useState<string>('1:1');
  const [showAspectMenu, setShowAspectMenu] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const aspectRatios = ['1:1', '2:3', '3:2', '3:4', '4:3', '9:16', '16:9', '21:9'];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isThinking]);

  const handleSend = () => {
    if (!inputText.trim() && !selectedAttachment) return;
    onSendMessage(inputText, selectedAttachment || undefined, selectedAspectRatio);
    setInputText('');
    setSelectedAttachment(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const type: 'image' | 'doc' | 'audio' = file.type.startsWith('image/')
        ? 'image'
        : file.type.startsWith('audio/')
        ? 'audio'
        : 'doc';

      setSelectedAttachment({
        type,
        dataUrl: result,
        name: file.name,
      });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const renderToolActionCard = (msg: Message, action: ToolActionPayload) => {
    const isPending = action.status === 'pending_confirmation';
    const isExecuted = action.status === 'executed';
    const isCancelled = action.status === 'cancelled';

    return (
      <div className="mt-3 p-3.5 rounded-xl bg-slate-900/90 border border-slate-700/80 shadow-md">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            {action.toolName === 'CallTool' && <PhoneCall className="w-4 h-4 text-emerald-400" />}
            {action.toolName === 'AlarmTool' && <Bell className="w-4 h-4 text-amber-400" />}
            {action.toolName === 'TimerTool' && <Clock className="w-4 h-4 text-cyan-400" />}
            {action.toolName === 'MapsTool' && <MapPin className="w-4 h-4 text-rose-400" />}
            {action.toolName === 'BrowserTool' && <Search className="w-4 h-4 text-blue-400" />}
            <span className="text-xs font-semibold text-slate-200">{action.actionTitle}</span>
          </div>

          <span
            className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
              isExecuted
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : isPending
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
            }`}
          >
            {isExecuted ? 'Executed' : isPending ? 'Action Ready' : 'Cancelled'}
          </span>
        </div>

        <p className="text-xs text-slate-300 mb-2 leading-relaxed">
          {action.resultDescription || 'Android action ready to proceed.'}
        </p>

        {/* Confirmation Buttons for Sensitive Actions */}
        {isPending && (
          <div className="flex items-center space-x-2 pt-2 border-t border-slate-800">
            <button
              onClick={() => onConfirmToolAction(msg.id, action)}
              className="flex-1 py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs flex items-center justify-center space-x-1 transition-colors cursor-pointer"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>{action.toolName === 'CallTool' ? 'Call Now' : 'Execute Action'}</span>
            </button>
            <button
              onClick={() => onCancelToolAction(msg.id)}
              className="py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center justify-center space-x-1 transition-colors cursor-pointer"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Cancel</span>
            </button>
          </div>
        )}

        {/* Intent Link if executed */}
        {isExecuted && action.intentUri && (
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
            <span className="text-[11px] text-slate-400 font-mono-code truncate max-w-[200px]">
              {action.intentUri}
            </span>
            <button
              onClick={() => PhoneControlService.dispatchIntent(action.intentUri!)}
              className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center space-x-1 cursor-pointer font-medium"
            >
              <span>Open on Phone</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-950/60">
      {/* Messages Thread */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-full`}
            >
              <div
                className={`rounded-2xl px-4 py-3 max-w-[88%] md:max-w-[75%] transition-all ${
                  isUser
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-tr-none shadow-md'
                    : 'glass-panel text-slate-100 rounded-tl-none border border-slate-800 shadow-lg'
                }`}
              >
                {/* Media Attachment if present */}
                {msg.attachment && (
                  <div className="mb-2.5 rounded-lg overflow-hidden border border-white/10">
                    {msg.attachment.type === 'image' ? (
                      <img
                        src={msg.attachment.dataUrl}
                        alt="attachment"
                        className="max-h-56 w-auto object-cover rounded-md"
                      />
                    ) : (
                      <div className="flex items-center space-x-2 p-2 bg-slate-800/80 text-xs">
                        <FileText className="w-4 h-4 text-purple-400" />
                        <span className="truncate">{msg.attachment.name}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Message Text with simple formatting */}
                <div className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                  {msg.text}
                </div>

                {/* Tool Action Card */}
                {msg.toolAction && renderToolActionCard(msg, msg.toolAction)}

                {/* Web & Maps Grounding Sources */}
                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-3 pt-2 border-t border-slate-800/80">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                      Verified Sources:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.sources.map((src, i) => (
                        <a
                          key={i}
                          href={src.uri}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] px-2 py-0.5 rounded bg-slate-800/90 text-cyan-300 hover:text-cyan-200 flex items-center space-x-1 border border-cyan-500/20 truncate max-w-[220px]"
                        >
                          <span className="truncate">{src.title || src.uri}</span>
                          <ExternalLink className="w-2.5 h-2.5 flex-shrink-0" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Bottom Bar: Timestamp and Audio Playback */}
                {!isUser && (
                  <div className="mt-2 pt-1 flex items-center justify-between text-[11px] text-slate-400">
                    <span>
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    <button
                      onClick={() => onPlayMessageVoice(msg.text)}
                      className="p-1 rounded hover:bg-slate-800 text-purple-400 hover:text-purple-300 transition-colors flex items-center space-x-1 cursor-pointer"
                      title="Read aloud with Lyra TTS"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Speak</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Thinking Indicator */}
        {isThinking && (
          <div className="flex items-center space-x-2 text-xs text-purple-300 glass-card px-3 py-2 rounded-xl w-fit animate-pulse border border-purple-500/30">
            <Sparkles className="w-4 h-4 text-purple-400 animate-spin" />
            <span>Lyra is reasoning and planning actions...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Upload Preview if selected */}
      {selectedAttachment && (
        <div className="px-4 py-2 bg-slate-900 border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs text-slate-300">
            {selectedAttachment.type === 'image' ? (
              <img
                src={selectedAttachment.dataUrl}
                alt="thumb"
                className="w-8 h-8 rounded object-cover border border-purple-500/40"
              />
            ) : (
              <FileText className="w-5 h-5 text-purple-400" />
            )}
            <span className="truncate max-w-[220px]">{selectedAttachment.name}</span>
          </div>
          <button
            onClick={() => setSelectedAttachment(null)}
            className="text-slate-400 hover:text-rose-400 p-1 cursor-pointer"
          >
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Input Bar & Controls */}
      <div className="p-3 bg-slate-950/90 border-t border-slate-800/80">
        <div className="flex items-center space-x-2 max-w-4xl mx-auto">
          {/* File Upload Button */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
            accept="image/*,application/pdf,text/*,audio/*"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2.5 rounded-full glass-card hover:bg-slate-800 text-slate-400 hover:text-purple-300 border border-slate-700/60 transition-colors cursor-pointer"
            title="Upload Image, Document or Audio"
          >
            <Paperclip className="w-4 h-4" />
          </button>

          {/* Aspect Ratio Menu for Image Generation */}
          <div className="relative">
            <button
              onClick={() => setShowAspectMenu(!showAspectMenu)}
              className="p-2 rounded-lg glass-card hover:bg-slate-800 text-xs text-slate-300 border border-slate-700/60 flex items-center space-x-1 cursor-pointer"
              title="Image Generation Aspect Ratio"
            >
              <ImageIcon className="w-3.5 h-3.5 text-pink-400" />
              <span className="font-mono-code text-[11px]">{selectedAspectRatio}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showAspectMenu && (
              <div className="absolute bottom-11 left-0 z-50 glass-panel rounded-xl p-2 border border-slate-700 shadow-2xl flex flex-col space-y-1 w-28">
                <span className="text-[10px] text-slate-400 uppercase font-semibold px-1">
                  Aspect Ratio
                </span>
                {aspectRatios.map((ar) => (
                  <button
                    key={ar}
                    onClick={() => {
                      setSelectedAspectRatio(ar);
                      setShowAspectMenu(false);
                    }}
                    className={`text-left px-2 py-1 rounded text-xs transition-colors cursor-pointer ${
                      selectedAspectRatio === ar
                        ? 'bg-purple-600/40 text-purple-200 font-semibold'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    {ar}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Text Input Field */}
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message or command in English/Hindi..."
            className="flex-1 bg-slate-900/90 border border-slate-700/80 rounded-full px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
          />

          {/* Voice Switch Button */}
          <button
            onClick={onSwitchToVoice}
            className="p-2.5 rounded-full glass-card hover:bg-slate-800 text-slate-300 hover:text-cyan-300 border border-slate-700/60 transition-colors cursor-pointer"
            title="Switch to Voice Mode"
          >
            <Mic className="w-4 h-4" />
          </button>

          {/* Send Button */}
          <button
            onClick={handleSend}
            disabled={!inputText.trim() && !selectedAttachment}
            className={`p-2.5 rounded-full transition-all cursor-pointer ${
              inputText.trim() || selectedAttachment
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-md'
                : 'bg-slate-800 text-slate-600 cursor-not-allowed'
            }`}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
