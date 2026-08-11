import React, { useEffect, useState } from 'react';
import { Loader2, Globe, Clock, Sparkles } from 'lucide-react';

interface GenerationProgressProps {
  webhookUrl: string;
}

export const GenerationProgress: React.FC<GenerationProgressProps> = ({
  webhookUrl,
}) => {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Live elapsed timer tick (counts indefinitely until fetch resolves or rejects)
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  return (
    <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-blue-200 shadow-md relative overflow-hidden bg-white space-y-6">
      {/* Background subtle shimmer */}
      <div className="absolute inset-0 animate-shimmer-light pointer-events-none" />

      <div className="relative z-10 space-y-6">
        {/* Header Status */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3.5">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-blue-600 border border-blue-200 shrink-0">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                n8n Workflow Execution Active
                <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold border border-blue-200">
                  LIVE
                </span>
              </h3>
              <p className="text-xs text-slate-500 font-mono truncate max-w-md flex items-center gap-1.5 mt-0.5">
                <Globe className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>Endpoint: {webhookUrl}</span>
              </p>
            </div>
          </div>

          {/* Stopwatch (Counts indefinitely) */}
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 self-start sm:self-auto font-mono text-sm font-bold shadow-sm">
            <Clock className="w-4 h-4 text-blue-600 animate-pulse" />
            <span>Elapsed: {formatTime(elapsedSeconds)}</span>
          </div>
        </div>

        {/* Dynamic Infinite Progress Bar */}
        <div className="space-y-2">
          <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200 relative">
            <div className="h-full bg-gradient-to-r from-blue-500 via-indigo-600 to-blue-500 rounded-full animate-shimmer w-full" />
          </div>
          <div className="flex justify-between text-xs text-slate-500 px-1 font-medium">
            <span className="flex items-center gap-1 text-blue-700 font-bold">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              Generating video, script, and voiceover in n8n...
            </span>
            <span>Waiting for server response</span>
          </div>
        </div>

        {/* Live Status Notice */}
        <div className="p-4 rounded-xl bg-blue-50/80 border border-blue-200 text-xs text-slate-700 flex items-start gap-3">
          <Loader2 className="w-4 h-4 text-blue-600 animate-spin shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-slate-900 text-sm block">
              Waiting for n8n Webhook Response:
            </span>
            <p className="text-slate-600 leading-relaxed text-xs">
              The HTTP request will remain open until n8n returns your completed video stream or an error response. Please leave this window active while the workflow executes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
