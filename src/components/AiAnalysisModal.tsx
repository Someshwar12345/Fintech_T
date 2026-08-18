import React, { useState } from 'react';
import { X, Sparkles, RefreshCw, Bot, ShieldCheck, CheckCircle } from 'lucide-react';
import { API } from '../lib/api';

interface AiAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AiAnalysisModal: React.FC<AiAnalysisModalProps> = ({ isOpen, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [analysisText, setAnalysisText] = useState<string | null>(null);
  const [poweredBy, setPoweredBy] = useState<string>('');

  const runAnalysis = async () => {
    setLoading(true);
    try {
      const res = await API.getAiAnalysis();
      setAnalysisText(res.analysis);
      setPoweredBy((res as any).poweredBy || res.source || 'Gemini 2.5 Flash');
    } catch (err: any) {
      setAnalysisText('Failed to generate AI evaluation: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (isOpen && !analysisText) {
      runAnalysis();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      id="ai-analysis-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in"
      onClick={onClose}
    >
      <div
        id="ai-analysis-modal"
        className="w-full max-w-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-indigo-50/60 to-purple-50/60 dark:from-indigo-950/40 dark:to-purple-950/40">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center space-x-2">
                <span>AI Replication & High-Availability Audit</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300">
                  {poweredBy || 'AI Powered'}
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Automated NoSQL Architect Evaluation for Fintech Fault-Tolerance
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {loading ? (
            <div className="h-64 flex flex-col items-center justify-center space-y-3 text-slate-500">
              <RefreshCw className="w-8 h-8 animate-spin text-indigo-500" />
              <p className="text-xs font-medium">Analyzing MongoDB replication metrics & CAP trade-offs...</p>
            </div>
          ) : (
            <div className="prose dark:prose-invert max-w-none text-xs sm:text-sm leading-relaxed space-y-4 text-slate-700 dark:text-slate-300">
              {analysisText?.split('\n\n').map((paragraph, idx) => {
                if (paragraph.startsWith('### ')) {
                  return (
                    <h4 key={idx} className="font-bold text-sm sm:text-base text-indigo-900 dark:text-indigo-300 mt-4 mb-2">
                      {paragraph.replace('### ', '')}
                    </h4>
                  );
                }
                return (
                  <p key={idx} className="text-slate-700 dark:text-slate-300">
                    {paragraph}
                  </p>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-between">
          <button
            onClick={runAnalysis}
            disabled={loading}
            className="flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Re-run Audit</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
