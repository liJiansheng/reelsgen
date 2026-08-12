import React, { useState } from 'react';
import { X, Settings, Link, Check, RefreshCw, ExternalLink } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  webhookUrl: string;
  onSaveWebhookUrl: (url: string) => void;
  isDemoMode: boolean;
  onToggleDemoMode: (enabled: boolean) => void;
}

export const DEFAULT_WEBHOOK_URL =
  'https://n8n.buildahustle.biz/webhook/57410e56-3a33-4d95-b88c-a4e6d3843d75';

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  webhookUrl,
  onSaveWebhookUrl,
  isDemoMode,
  onToggleDemoMode,
}) => {
  const [inputUrl, setInputUrl] = useState(webhookUrl);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'failed'>('idle');

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveWebhookUrl(inputUrl);
    onClose();
  };

  const handleReset = () => {
    setInputUrl(DEFAULT_WEBHOOK_URL);
    onSaveWebhookUrl(DEFAULT_WEBHOOK_URL);
  };

  const handleTestConnection = async () => {
    setTestStatus('testing');
    try {
      const res = await fetch(inputUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testPing: true }),
      });
      if (res.ok || res.status === 400 || res.status === 404 || res.status === 200) {
        setTestStatus('success');
      } else {
        setTestStatus('failed');
      }
    } catch (err) {
      setTestStatus('failed');
    } finally {
      setTimeout(() => setTestStatus('idle'), 4000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
      <div className="glass-panel w-full max-w-lg rounded-2xl border border-slate-200 shadow-2xl p-6 relative space-y-6 bg-white">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600 border border-blue-200">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 font-heading">
              API Endpoint Settings
            </h3>
            <p className="text-xs text-slate-500">
              Configure your backend video generation webhook URL
            </p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-2">
            <label className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span className="flex items-center gap-1.5">
                <Link className="w-3.5 h-3.5 text-blue-600" />
                API Webhook Endpoint URL
              </span>
              <button
                type="button"
                onClick={handleReset}
                className="text-[11px] text-blue-600 hover:underline flex items-center gap-1 font-semibold"
              >
                <RefreshCw className="w-3 h-3" />
                Reset Default
              </button>
            </label>
            <input
              type="url"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://your-domain.com/webhook/..."
            />
          </div>

          <div className="flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={testStatus === 'testing'}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold border border-slate-200 flex items-center gap-1.5 transition-all"
            >
              {testStatus === 'testing' ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600" />
              ) : testStatus === 'success' ? (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
              )}
              {testStatus === 'testing'
                ? 'Testing Ping...'
                : testStatus === 'success'
                ? 'Endpoint Responding!'
                : testStatus === 'failed'
                ? 'Ping Failed'
                : 'Test Endpoint Reachability'}
            </button>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <div>
              <span className="text-sm font-bold text-slate-900 block">
                Enable Instant Demo Fallback
              </span>
              <span className="text-xs text-slate-500 block">
                Displays video preview if webhook times out or fails
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isDemoMode}
                onChange={(e) => onToggleDemoMode(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20"
            >
              Save Configuration
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
