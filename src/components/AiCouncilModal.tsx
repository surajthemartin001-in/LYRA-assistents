import React, { useState } from 'react';
import { X, Sparkles, Scale, CheckCircle2, AlertTriangle, Layers, Send } from 'lucide-react';

interface AiCouncilModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExecuteCouncil: (query: string) => Promise<string>;
}

export const AiCouncilModal: React.FC<AiCouncilModalProps> = ({
  isOpen,
  onClose,
  onExecuteCouncil,
}) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [deliberationText, setDeliberationText] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRunCouncil = async () => {
    if (!query.trim() || loading) return;
    setLoading(true);
    try {
      const res = await onExecuteCouncil(query.trim());
      setDeliberationText(res);
    } catch (err: any) {
      setDeliberationText(`Deliberation error: ${err?.message || 'Failed to convene council'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="glass-panel w-full max-w-2xl rounded-2xl p-5 border border-purple-500/30 shadow-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <Scale className="w-5 h-5 text-purple-400" />
            <div>
              <h3 className="text-base font-bold text-slate-100">Lyra AI Council</h3>
              <p className="text-[11px] text-slate-400">
                Multi-perspective reasoning across Gemini Pro, GPT, and Claude architectures
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200 p-1 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input Field */}
        <div className="pt-3 pb-2 flex items-center space-x-2">
          <input
            type="text"
            placeholder="Ask a question for the 3-model Council deliberation..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleRunCouncil()}
            className="flex-1 bg-slate-900/90 border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-purple-500"
          />
          <button
            onClick={handleRunCouncil}
            disabled={!query.trim() || loading}
            className={`px-4 py-2.5 rounded-xl font-medium text-xs flex items-center space-x-1.5 transition-all cursor-pointer ${
              query.trim() && !loading
                ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            {loading ? (
              <Sparkles className="w-4 h-4 animate-spin text-purple-300" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            <span>{loading ? 'Deliberating...' : 'Convene Council'}</span>
          </button>
        </div>

        {/* Provider Cards Preview */}
        <div className="grid grid-cols-3 gap-2 py-2">
          <div className="glass-card p-2 rounded-xl text-center border-l-2 border-l-blue-400">
            <span className="text-[10px] font-bold text-blue-300 block">Gemini 3 Pro</span>
            <span className="text-[9px] text-slate-400">Deep Reasoning</span>
          </div>
          <div className="glass-card p-2 rounded-xl text-center border-l-2 border-l-emerald-400">
            <span className="text-[10px] font-bold text-emerald-300 block">GPT Synthesis</span>
            <span className="text-[9px] text-slate-400">Action Pragmatics</span>
          </div>
          <div className="glass-card p-2 rounded-xl text-center border-l-2 border-l-amber-400">
            <span className="text-[10px] font-bold text-amber-300 block">Claude Nuance</span>
            <span className="text-[9px] text-slate-400">Constitutional Logic</span>
          </div>
        </div>

        {/* Deliberation Output Area */}
        <div className="flex-1 overflow-y-auto py-3 space-y-3">
          {deliberationText ? (
            <div className="glass-card p-4 rounded-xl border border-slate-800 text-xs text-slate-200 leading-relaxed whitespace-pre-wrap font-sans">
              {deliberationText}
            </div>
          ) : (
            <div className="h-44 flex flex-col items-center justify-center text-center text-xs text-slate-500">
              <Layers className="w-8 h-8 text-slate-600 mb-2" />
              <span>Enter a complex query above to convene all three models.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
