import React from 'react';
import { Video, History, Settings, Zap } from 'lucide-react';

interface NavbarProps {
  onOpenHistory: () => void;
  onOpenSettings: () => void;
  historyCount: number;
  isDemoMode: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenHistory,
  onOpenSettings,
  historyCount,
  isDemoMode,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 lg:px-8 py-3.5 mb-6 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-blue-600 shadow-md shadow-blue-500/20 text-white">
            <Video className="w-5 h-5 text-white" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full animate-ping" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight text-slate-900 font-heading">
                Reels<span className="text-blue-600">Gen</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                PRO AI
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              AI Short Video & Reel Generator
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Demo Mode Badge */}
          {isDemoMode && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs font-medium">
              <Zap className="w-3.5 h-3.5 animate-pulse text-amber-500" />
              <span className="hidden sm:inline">Preview Mode</span>
            </div>
          )}

          {/* History Button */}
          <button
            onClick={onOpenHistory}
            className="relative flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs border border-slate-200 transition-all"
            title="View Saved Reels History"
          >
            <History className="w-4 h-4 text-blue-600" />
            <span className="hidden sm:inline">Library</span>
            {historyCount > 0 && (
              <span className="flex items-center justify-center w-5 h-5 text-[11px] font-bold text-white bg-blue-600 rounded-full">
                {historyCount}
              </span>
            )}
          </button>

          {/* Settings Button */}
          <button
            onClick={onOpenSettings}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs border border-slate-200 transition-all"
            title="Configure Webhook Endpoint"
          >
            <Settings className="w-4 h-4 text-slate-600" />
            <span className="hidden md:inline">Webhook Config</span>
          </button>
        </div>
      </div>
    </header>
  );
};
