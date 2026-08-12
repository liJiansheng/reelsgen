import React, { useState, useEffect } from 'react';
import { StyleSelector } from './components/StyleSelector';
import { VoiceSelector, VOICE_OPTIONS } from './components/VoiceSelector';
import { GenerationProgress } from './components/GenerationProgress';
import { VideoPlayerCard, GeneratedVideoData } from './components/VideoPlayerCard';
import { SettingsModal, DEFAULT_WEBHOOK_URL } from './components/SettingsModal';
import { HistoryDrawer } from './components/HistoryDrawer';
import { Video, Sparkles, Wand2, Monitor, Smartphone, MessageSquare, Clock, AlertTriangle, Layers, Terminal } from 'lucide-react';

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
  Anime: {
    id: 1259,
    order: '52.00000000000000000000',
    Title: "Timmy's Incredible Robot Adventure!",
    Description: 'Join Timmy on an epic quest with his robot friend! #Adventure #KidsStory #RobotFun',
    Script: "What if your best friend was a robot? Get ready to blast off with Timmy on an unforgettable adventure! Once upon a time, a curious boy named Timmy found a shiny, blue robot in his backyard. He named him Robo, and together they were unstoppable! One sunny morning, Timmy and Robo discovered a hidden treasure map inside a bottle. “Let’s go find it!” Timmy exclaimed, and off they went! They trekked through the enchanted forest, dodged tricky traps, and solved super puzzles. With Robo's cool gadgets and Timmy's brave heart, they cracked the code to the treasure! At the end of their journey, they found not just gold coins and jewels, but a magical key that unlocked a friendship like no other! Timmy and Robo learned that the best treasure of all was their connection. That day, they returned home, ready for their next big adventure together! What was your favorite part of Timmy's adventure?",
    "Final Video URL": 'https://storage.googleapis.com/nca-mod-bucket/8aa4fc34-2c7a-498d-b8b6-40cf79846b05.mp4',
    "Video + Captions URL": '',
  },
  Default: {
    id: 1259,
    order: '52.00000000000000000000',
    Title: "Timmy's Incredible Robot Adventure!",
    Description: 'Join Timmy on an epic quest with his robot friend! #Adventure #KidsStory #RobotFun',
    Script: "What if your best friend was a robot? Get ready to blast off with Timmy on an unforgettable adventure! Once upon a time, a curious boy named Timmy found a shiny, blue robot in his backyard. He named him Robo, and together they were unstoppable! One sunny morning, Timmy and Robo discovered a hidden treasure map inside a bottle. “Let’s go find it!” Timmy exclaimed, and off they went! They trekked through the enchanted forest, dodged tricky traps, and solved super puzzles. With Robo's cool gadgets and Timmy's brave heart, they cracked the code to the treasure! At the end of their journey, they found not just gold coins and jewels, but a magical key that unlocked a friendship like no other! Timmy and Robo learned that the best treasure of all was their connection. That day, they returned home, ready for their next big adventure together! What was your favorite part of Timmy's adventure?",
    "Final Video URL": 'https://storage.googleapis.com/nca-mod-bucket/8aa4fc34-2c7a-498d-b8b6-40cf79846b05.mp4',
    "Video + Captions URL": '',
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
      } else if (data && typeof data === 'object') {
        videoResult = data as GeneratedVideoData;
      }

      // Check any video URL property returned by n8n (Final Video URL, Video + Captions URL, Raw Video URL, videoUrl)
      const validUrl =
        videoResult?.["Final Video URL"] ||
        videoResult?.["Video + Captions URL"] ||
        videoResult?.["Raw Video URL"] ||
        (videoResult as any)?.videoUrl;

      if (videoResult && validUrl && validUrl.trim().length > 0) {
        const enrichedResult: GeneratedVideoData = {
          ...videoResult,
          "Final Video URL": validUrl,
          orientation: formData.orientation,
          style: formData.generativeStyle,
          createdAt: new Date().toISOString(),
        };
        setGeneratedVideo(enrichedResult);
        setHistory((prev) => [enrichedResult, ...prev]);
        setDebugLog((prev) => `${prev}\n[${new Date().toLocaleTimeString()}] Video payload successfully received!`);
      } else {
        throw new Error(
          `n8n returned HTTP 200, but JSON did not contain a valid "Final Video URL". Received payload: ${JSON.stringify(data)}`
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
      Title: sample.Title,
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
                placeholder="e.g. Timmy's Incredible Robot Adventure! Get ready to blast off with Timmy and Robo..."
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