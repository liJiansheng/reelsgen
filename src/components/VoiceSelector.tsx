import React from 'react';
import { Mic, Volume2, Check } from 'lucide-react';

export interface VoiceOption {
  id: string;
  name: string;
  value: string;
  tag: string;
  accent: string;
  description: string;
  avatarBg: string;
}

export const VOICE_OPTIONS: VoiceOption[] = [
  {
    id: 'man',
    name: 'Deep Male Voice',
    value: '28b049a7574f46bc9d7122761363bda0',
    tag: 'Male / Cinematic',
    accent: 'American',
    description: 'Resonant, clear, and engaging tone for stories & commentary',
    avatarBg: 'bg-sky-500 text-white',
  },
  {
    id: 'woman',
    name: 'Warm Female Voice',
    value: '5ac6fb7171ba419190700620738209d8',
    tag: 'Female / Natural',
    accent: 'American',
    description: 'Expressive, friendly, and smooth narrator for reels',
    avatarBg: 'bg-fuchsia-500 text-white',
  },
  {
    id: 'mysterious',
    name: 'Mysterious / Dark',
    value: '6a735fd94f67467eb592567972ee0d51',
    tag: 'Thriller / Lore',
    accent: 'Deep Pitch',
    description: 'Suspenseful and enigmatic narration for horror or secrets',
    avatarBg: 'bg-purple-600 text-white',
  },
  {
    id: 'narrator',
    name: 'Documentary Host',
    value: 'a89d711b2c554a9381e4b3b27b165412',
    tag: 'Educational',
    accent: 'British',
    description: 'Authoritative, calm, and informative pace for facts & history',
    avatarBg: 'bg-emerald-500 text-white',
  },
];

interface VoiceSelectorProps {
  selectedVoice: string;
  onSelectVoice: (voiceValue: string) => void;
}

export const VoiceSelector: React.FC<VoiceSelectorProps> = ({
  selectedVoice,
  onSelectVoice,
}) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm font-bold text-slate-800">
          <Mic className="w-4 h-4 text-blue-600" />
          AI Voice Synthesis
        </label>
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
          <Volume2 className="w-3.5 h-3.5 text-blue-600" />
          <span>High Definition Audio</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {VOICE_OPTIONS.map((voice) => {
          const isSelected = selectedVoice === voice.value;
          return (
            <button
              key={voice.value}
              type="button"
              onClick={() => onSelectVoice(voice.value)}
              className={`flex items-start gap-3.5 p-4 rounded-xl text-left transition-all duration-200 ${
                isSelected
                  ? 'glass-panel-active ring-2 ring-blue-600/30'
                  : 'glass-panel-interactive'
              }`}
            >
              {/* Circular Avatar Icon */}
              <div
                className={`w-10 h-10 rounded-full ${voice.avatarBg} flex items-center justify-center shrink-0 shadow-sm`}
              >
                <Mic className="w-5 h-5" />
              </div>

              {/* Voice Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1 mb-0.5">
                  <span className="font-bold text-sm text-slate-900 truncate">
                    {voice.name}
                  </span>
                  {isSelected && (
                    <span className="flex items-center justify-center w-5 h-5 bg-blue-600 text-white rounded-full shrink-0">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full font-medium border border-blue-200">
                    {voice.tag}
                  </span>
                </div>
                <p className="text-xs text-slate-600 line-clamp-1">
                  {voice.description}
                </p>

                {isSelected && (
                  <div className="mt-2.5 w-10 h-1 bg-blue-600 rounded-full" />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
