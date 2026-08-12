import React, { useState } from 'react';
import { Play, Download, Copy, Check, Subtitles, FileText, Sparkles, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';

export interface GeneratedVideoData {
  id?: number | string;
  order?: string;
  Title: string;
  Description: string;
  Script: string;
  "Final Video URL": string;
  "Video + Captions URL"?: string;
  "Raw Video URL"?: string;
  createdAt?: string;
  orientation?: 'landscape' | 'portrait';
  style?: string;
}

interface VideoPlayerCardProps {
  data: GeneratedVideoData;
  orientation: 'landscape' | 'portrait';
  onReset?: () => void;
}

export const VideoPlayerCard: React.FC<VideoPlayerCardProps> = ({
  data,
  orientation,
  onReset,
}) => {
  const hasCaptionsUrl = Boolean(
    data["Video + Captions URL"] && data["Video + Captions URL"].trim().length > 0
  );

  const [activeTab, setActiveTab] = useState<'captions' | 'final'>(
    hasCaptionsUrl ? 'captions' : 'final'
  );
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showScript, setShowScript] = useState(false);

  React.useEffect(() => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });
  }, []);

  const videoUrl =
    activeTab === 'captions' && hasCaptionsUrl
      ? data["Video + Captions URL"]!
      : (data["Final Video URL"] || data["Raw Video URL"] || "");

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const isPortrait = orientation === 'portrait';

  return (
    <div className="glass-panel rounded-2xl border border-slate-200 shadow-lg p-6 space-y-6 bg-white">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              Generation Complete
            </span>
            {data.style && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                {data.style} Style
              </span>
            )}
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-heading">
            {data.Title || 'AI Generated Reel'}
          </h2>
          <div className="w-16 h-1 bg-blue-600 rounded-full mt-2" />
        </div>

        {/* Video Mode Switcher Tabs */}
        {hasCaptionsUrl && (
          <div className="flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200 self-stretch sm:self-auto">
            <button
              onClick={() => setActiveTab('captions')}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'captions'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Subtitles className="w-3.5 h-3.5" />
              With Captions
            </button>
            <button
              onClick={() => setActiveTab('final')}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'final'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Play className="w-3.5 h-3.5" />
              Clean Video
            </button>
          </div>
        )}
      </div>

      {/* Main Grid: Player + Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Video Player Container */}
        <div className="lg:col-span-6 flex flex-col items-center justify-center">
          <div
            className={`relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-xl ${
              isPortrait
                ? 'w-full max-w-[340px] aspect-[9/16]'
                : 'w-full aspect-video'
            }`}
          >
            <video
              key={videoUrl}
              src={videoUrl}
              controls
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
            >
              Your browser does not support HTML5 video playback.
            </video>
          </div>
        </div>

        {/* Details & Copy Metadata */}
        <div className="lg:col-span-6 space-y-4">
          {/* Description Box */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">
                Video Description & Tags
              </span>
              <button
                onClick={() => handleCopy(data.Description, 'description')}
                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-semibold transition-colors"
              >
                {copiedField === 'description' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-600">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Text</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed font-medium">
              {data.Description || 'No description provided.'}
            </p>
          </div>

          {/* Script Expander */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-blue-600" />
                AI Voice Script
              </span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowScript(!showScript)}
                  className="text-xs text-slate-500 hover:text-slate-800 underline font-medium"
                >
                  {showScript ? 'Hide' : 'Expand'}
                </button>
                <button
                  onClick={() => handleCopy(data.Script, 'script')}
                  className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-semibold transition-colors"
                >
                  {copiedField === 'script' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-600">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Script</span>
                    </>
                  )}
                </button>
              </div>
            </div>
            <div
              className={`text-xs font-mono text-slate-800 bg-white p-3 rounded-lg border border-slate-200 whitespace-pre-wrap overflow-y-auto ${
                showScript ? 'max-h-60' : 'max-h-24'
              }`}
            >
              {data.Script || 'No script available.'}
            </div>
          </div>

          {/* Primary Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            <a
              href={videoUrl}
              download="reelsgen-video.mp4"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/20 transition-all transform active:scale-95"
            >
              <Download className="w-4 h-4" />
              Download Video MP4
            </a>

            {onReset && (
              <button
                onClick={onReset}
                className="w-full sm:w-auto flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm border border-slate-200 transition-all"
              >
                <RefreshCw className="w-4 h-4 text-blue-600" />
                Create Another Reel
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
