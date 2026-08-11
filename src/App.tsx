import React, { useState, useEffect } from 'react';
import { StyleSelector } from './components/StyleSelector';
import { VoiceSelector, VOICE_OPTIONS } from './components/VoiceSelector';
import { GenerationProgress } from './components/GenerationProgress';
import { VideoPlayerCard, GeneratedVideoData } from './components/VideoPlayerCard';
import { SettingsModal, DEFAULT_WEBHOOK_URL } from './components/SettingsModal';
import { HistoryDrawer } from './components/HistoryDrawer';
import { Video, Sparkles, Wand2, Monitor, Smartphone, MessageSquare, Clock, AlertTriangle, Layers, Terminal, History, Settings } from 'lucide-react';

interface FormData {
  mainTopic: string;
  duration: string;
  generativeStyle: string;
  voice: string;
  storylineOption: 'userIdea' | 'transcript';
  orientation: 'landscape' | 'portrait';
}

const PRESET_TOPICS = [
  'The secret origin of how Lego bricks were invented in Denmark',
  'What if Minecraft was real life in a 2080 cyberpunk metropolis',
  '5 mind-blowing mysteries of the deep ocean science never solved',
  'How quantum computers will change artificial intelligence forever',
];

const SAMPLE_DEMO_VIDEOS: Record<string, GeneratedVideoData> = {
  Lego: {
    id: 101,
    order: 'sample-01',
    Title: 'The Secret History of Lego Bricks 🧱',
    Description: 'Discover how a small Danish carpentry workshop created the world’s most beloved modular toy system! #Lego #History #AIReels',
    Script: '[Hook] Did you know Lego started in a small wooden toy workshop in Denmark in 1932?\n[Body] Ole Kirk Christiansen coined the name Lego from the Danish words "Leg Godt" meaning "Play Well". When plastic injection molding emerged, Lego revolutionized building toys with their iconic interlocking brick system.',
    "Final Video URL": 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    "Video + Captions URL": 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  },
  Minecraft: {
    id: 102,
    order: 'sample-02',
    Title: 'Cyberpunk Minecraft City 2080 ⛏️',
    Description: 'An epic journey through neon blocky skyscrapers and glowing redstone trains in a futuristic block universe. #Minecraft #Cyberpunk #Voxel',
    Script: '[Hook] Imagine Minecraft 100 years into the future with neon lights and flying minecarts!\n[Body] Towering redstone skyscrapers reach into the stratosphere while cybernetically enhanced Villagers trade high-tech obsidian chips.',
    "Final Video URL": 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    "Video + Captions URL": 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  },
  Default: {
    id: 103,
    order: 'sample-03',
    Title: 'Quantum Computing Unleashed 🚀',
    Description: 'How superpositions and qubits will reshape medicine, encryption, and AI. #Quantum #TechReels #FutureAI',
    Script: '[Hook] Classical computers process bits as 0 or 1. Quantum computers process qubits in both states simultaneously!\n[Body] This exponential computing power allows AI algorithms to model complex molecules in seconds, unlocking new cures.',
    "Final Video URL": 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    "Video + Captions URL": 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
  },
};

export function App() {
  const [formData, setFormData] = useState<FormData>({
    mainTopic: '',
    duration: '30 seconds',
    generativeStyle: 'Lego',
    voice: VOICE_OPTIONS[0].value,
    storylineOption: 'userIdea',
    orientation: 'portrait',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [generatedVideo, setGeneratedVideo] = useState<GeneratedVideoData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [debugLog, setDebugLog] = useState<string | null>(null);

  // Production n8n webhook URL
  const [webhookUrl, setWebhookUrl] = useState<string>(DEFAULT_WEBHOOK_URL);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [history, setHistory] = useState<GeneratedVideoData[]>(() => {
    try {
      const saved = localStorage.getItem('reelsgen_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('reelsgen_history', JSON.stringify(history));
  }, [history]);

  const handleSaveWebhookUrl = (url: string) => {
    setWebhookUrl(url);
    localStorage.setItem('reelsgen_webhook_url', url);
  };

  const handleClearHistory = () => {
    setHistory([]);
    localStorage.removeItem('reelsgen_history');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.mainTopic.trim()) return;

    setIsLoading(true);
    setGeneratedVideo(null);
    setErrorMessage(null);
    const targetUrl = webhookUrl.trim() || DEFAULT_WEBHOOK_URL;
    setDebugLog(`[${new Date().toLocaleTimeString()}] Sending POST request to: ${targetUrl}`);

    try {
      console.log('Sending webhook request to:', targetUrl);
      console.log('Payload data:', formData);

      const response = await fetch(targetUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      setDebugLog((prev) => `${prev}\n[${new Date().toLocaleTimeString()}] n8n HTTP Response Status: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        let textBody = '';
        try {
          textBody = await response.text();
        } catch {}
        throw new Error(
          `n8n Webhook returned HTTP status ${response.status} (${response.statusText}). ${
            textBody ? `Server response: ${textBody}` : ''
          }`
        );
      }

      const data = await response.json();
      console.log('n8n Response Data:', data);
      
      let videoResult: GeneratedVideoData | null = null;
      if (Array.isArray(data) && data.length > 0) {
        videoResult = data[0];
      } else if (data && typeof data === 'object' && (data["Final Video URL"] || data.videoUrl)) {
        videoResult = data;
      }

      if (videoResult && (videoResult["Final Video URL"] || videoResult["Video + Captions URL"])) {
        const enrichedResult: GeneratedVideoData = {
          ...videoResult,
          orientation: formData.orientation,
          style: formData.generativeStyle,
          createdAt: new Date().toISOString(),
        };
        setGeneratedVideo(enrichedResult);
        setHistory((prev) => [enrichedResult, ...prev]);
        setDebugLog((prev) => `${prev}\n[${new Date().toLocaleTimeString()}] Video payload successfully received!`);
      } else {
        throw new Error(
          `n8n returned HTTP 200, but JSON did not contain a "Final Video URL" property. Received payload: ${JSON.stringify(data)}`
        );
      }
    } catch (error: any) {
      console.error('Webhook execution error:', error);
      const errStr = error.message || 'Network error or CORS policy blocked the request';
      setDebugLog((prev) => `${prev}\n[${new Date().toLocaleTimeString()}] ERROR: ${errStr}`);

      if (isDemoMode) {
        const sample =
          SAMPLE_DEMO_VIDEOS[formData.generativeStyle] || SAMPLE_DEMO_VIDEOS.Default;
        const enrichedSample: GeneratedVideoData = {
          ...sample,
          Title: `${formData.mainTopic.slice(0, 45)}... (${formData.generativeStyle} Style)`,
          orientation: formData.orientation,
          style: formData.generativeStyle,
          createdAt: new Date().toISOString(),
        };
        setGeneratedVideo(enrichedSample);
        setHistory((prev) => [enrichedSample, ...prev]);
      } else {
        setErrorMessage(errStr);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleForceDemo = () => {
    const sample =
      SAMPLE_DEMO_VIDEOS[formData.generativeStyle] || SAMPLE_DEMO_VIDEOS.Default;
    const enrichedSample: GeneratedVideoData = {
      ...sample,
      Title: `${formData.mainTopic.slice(0, 45)}... (${formData.generativeStyle} Style)`,
      orientation: formData.orientation,
      style: formData.generativeStyle,
      createdAt: new Date().toISOString(),
    };
    setGeneratedVideo(enrichedSample);
    setIsLoading(false);
    setErrorMessage(null);
    setHistory((prev) => [enrichedSample, ...prev]);
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 p-2 sm:p-4 lg:p-6">
      {/* Main Embedded Container starting directly from input */}
      <main className="max-w-5xl w-full mx-auto space-y-6">
        {/* Loading Progress State */}
        {isLoading && (
          <GenerationProgress
            webhookUrl={webhookUrl}
          />
        )}

        {/* Generated Result Showcase */}
        {!isLoading && generatedVideo && (
          <VideoPlayerCard
            data={generatedVideo}
            orientation={formData.orientation}
            onReset={() => setGeneratedVideo(null)}
          />
        )}

        {/* Error Alert Banner */}
        {!isLoading && errorMessage && (
          <div className="p-5 rounded-2xl bg-red-50 border border-red-200 text-red-900 text-xs space-y-4 shadow-sm">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1 space-y-1">
                <span className="font-extrabold text-slate-900 text-sm block">
                  n8n Webhook Response Error
                </span>
                <p className="leading-relaxed font-mono bg-red-100/60 p-2.5 rounded-lg border border-red-200 text-[11px] text-red-900 overflow-x-auto whitespace-pre-wrap">
                  {errorMessage}
                </p>
              </div>
            </div>

            {/* Debug Console Logs */}
            {debugLog && (
              <div className="space-y-1">
                <span className="font-bold text-slate-700 text-[11px] flex items-center gap-1">
                  <Terminal className="w-3.5 h-3.5 text-slate-600" />
                  Execution Diagnostics:
                </span>
                <pre className="text-[10px] font-mono bg-slate-900 text-slate-200 p-3 rounded-xl overflow-x-auto max-h-36">
                  {debugLog}
                </pre>
              </div>
            )}

            <div className="pt-2 flex flex-wrap items-center gap-3 border-t border-red-200/80">
              <button
                onClick={() => setErrorMessage(null)}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm"
              >
                Try Again
              </button>
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs"
              >
                Change Webhook Endpoint
              </button>
              <button
                onClick={handleForceDemo}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm ml-auto"
              >
                Preview Sample Demo Video
              </button>
            </div>
          </div>
        )}

        {/* Embedded Form Card starting directly from Main Topic Input */}
        {!isLoading && !generatedVideo && (
          <form onSubmit={handleSubmit} className="glass-panel p-5 sm:p-8 rounded-2xl border border-slate-200 shadow-md space-y-8 bg-white">
            {/* Topic Input - Embedded Starting Point */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm sm:text-base font-extrabold text-slate-900">
                  <MessageSquare className="w-4 h-4 text-blue-600" />
                  The Main Topic or Storyline Idea
                </label>
                <span className="text-xs text-slate-400 font-medium">Required</span>
              </div>
              <textarea
                value={formData.mainTopic}
                onChange={(e) => setFormData({ ...formData, mainTopic: e.target.value })}
                rows={4}
                required
                placeholder="e.g. The incredible story of how Lego bricks were invented, featuring 3D animated blocks and dramatic storytelling..."
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium"
              />

              {/* Quick Preset Ideas */}
              <div className="space-y-1.5 pt-1">
                <span className="text-xs text-slate-500 font-semibold flex items-center gap-1">
                  <Wand2 className="w-3.5 h-3.5 text-blue-600" />
                  Preset Ideas:
                </span>
                <div className="flex flex-wrap gap-2">
                  {PRESET_TOPICS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setFormData({ ...formData, mainTopic: preset })}
                      className="text-xs px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-left transition-colors font-medium"
                    >
                      "{preset.slice(0, 42)}..."
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Generative Style Selector */}
            <StyleSelector
              selectedStyle={formData.generativeStyle}
              onSelectStyle={(style) => setFormData({ ...formData, generativeStyle: style })}
            />

            {/* Voice Selector */}
            <VoiceSelector
              selectedVoice={formData.voice}
              onSelectVoice={(voiceVal) => setFormData({ ...formData, voice: voiceVal })}
            />

            {/* Duration, Storyline & Orientation Options */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2 border-t border-slate-100">
              {/* Duration */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-bold text-slate-800">
                  <Clock className="w-4 h-4 text-blue-600" />
                  Target Duration
                </label>
                <select
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="30 seconds">30 Seconds (Short / Reel)</option>
                  <option value="1 minute">1 Minute (Standard)</option>
                  <option value="2 minutes">2 Minutes (Extended)</option>
                </select>
              </div>

              {/* Storyline Mode */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-bold text-slate-800">
                  <Layers className="w-4 h-4 text-blue-600" />
                  Storyline Input Mode
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, storylineOption: 'userIdea' })}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all ${
                      formData.storylineOption === 'userIdea'
                        ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    User Idea
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, storylineOption: 'transcript' })}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all ${
                      formData.storylineOption === 'transcript'
                        ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    Transcript
                  </button>
                </div>
              </div>

              {/* Orientation */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-bold text-slate-800">
                  <Monitor className="w-4 h-4 text-blue-600" />
                  Video Orientation
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, orientation: 'portrait' })}
                    className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold border transition-all ${
                      formData.orientation === 'portrait'
                        ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    Portrait (9:16)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, orientation: 'landscape' })}
                    className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold border transition-all ${
                      formData.orientation === 'landscape'
                        ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Monitor className="w-3.5 h-3.5" />
                    Landscape (16:9)
                  </button>
                </div>
              </div>
            </div>

            {/* Submit Action Button */}
            <button
              type="submit"
              disabled={!formData.mainTopic.trim()}
              className="w-full py-4 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-base shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all transform active:scale-[0.99]"
            >
              <Video className="w-5 h-5 fill-white" />
              <span>Generate AI Video Reel</span>
              <Sparkles className="w-5 h-5" />
            </button>
          </form>
        )}
      </main>

      {/* Modals & Drawers */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        webhookUrl={webhookUrl}
        onSaveWebhookUrl={handleSaveWebhookUrl}
        isDemoMode={isDemoMode}
        onToggleDemoMode={setIsDemoMode}
      />

      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onSelectVideo={(video) => setGeneratedVideo(video)}
        onClearHistory={handleClearHistory}
      />
    </div>
  );
}

export default App;