import React from 'react';
import { X, Trash2, Film, Calendar, Play } from 'lucide-react';
import { GeneratedVideoData } from './VideoPlayerCard';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: GeneratedVideoData[];
  onSelectVideo: (video: GeneratedVideoData) => void;
  onClearHistory: () => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  history,
  onSelectVideo,
  onClearHistory,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
      <div className="glass-panel w-full max-w-md h-full border-l border-slate-200 shadow-2xl p-6 flex flex-col justify-between overflow-y-auto bg-white">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
            <div className="flex items-center gap-2">
              <Film className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-bold text-slate-900 font-heading">
                Reel Library ({history.length})
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* List of Videos */}
          {history.length === 0 ? (
            <div className="py-16 text-center text-slate-400 space-y-3">
              <Film className="w-12 h-12 stroke-1 text-slate-300 mx-auto" />
              <p className="text-sm font-medium text-slate-600">No generated reels in history yet.</p>
              <p className="text-xs text-slate-400">
                Videos generated will automatically be saved here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    onSelectVideo(item);
                    onClose();
                  }}
                  className="group cursor-pointer p-4 rounded-xl glass-panel-interactive hover:border-blue-300 space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-bold text-sm text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                      {item.Title || `Generated Reel #${idx + 1}`}
                    </h4>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium border border-slate-200 shrink-0">
                      {item.orientation || 'landscape'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2">
                    {item.Description || item.Script}
                  </p>

                  <div className="flex items-center justify-between pt-2 text-[11px] text-slate-500 border-t border-slate-100">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Recent'}
                    </span>
                    <span className="text-blue-600 font-bold group-hover:underline flex items-center gap-1">
                      <Play className="w-3 h-3 fill-blue-600" />
                      Play Reel
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {history.length > 0 && (
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={onClearHistory}
              className="flex items-center gap-1.5 text-xs text-red-600 hover:text-red-700 font-semibold transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Clear Library
            </button>
            <span className="text-xs text-slate-400">Saved in browser storage</span>
          </div>
        )}
      </div>
    </div>
  );
};
