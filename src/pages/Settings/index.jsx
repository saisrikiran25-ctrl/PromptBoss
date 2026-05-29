import { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Info, ExternalLink, Zap, Shield, Cpu, Code2 } from 'lucide-react';
import PageWrapper from '../../components/layout/PageWrapper';
import useAppStore from '../../store/useAppStore';

import { MODELS } from '../../constants/models';
import { TASK_TYPES, OUTPUT_STYLES, TONES } from '../../constants/taskTypes';

const SETTINGS_NAV = [
  { id: 'api', label: 'API Configuration', icon: Settings },
  { id: 'preferences', label: 'Default Preferences', icon: Info },
  { id: 'about', label: 'About', icon: Info },
];

function KeyStatusDot({ status }) {
  const map = {
    healthy: { color: '#00C98D', label: 'Healthy' },
    active: { color: '#00D4FF', label: 'Active', pulse: true },
    'rate-limited': { color: '#F5A623', label: 'Rate Limited' },
    error: { color: '#FF4D6D', label: 'Invalid' },
    untested: { color: '#8A9BAE', label: 'Not Tested' },
  };
  const s = map[status] || map.untested;
  return (
    <div className="flex items-center gap-1.5">
      <span
        className={['w-2 h-2 rounded-full', s.pulse ? 'animate-pulse-dot' : ''].join(' ')}
        style={{ backgroundColor: s.color }}
      />
      <span className="text-xs font-body" style={{ color: s.color }}>{s.label}</span>
    </div>
  );
}

export default function SettingsPage() {
  const selectedModel = useAppStore((s) => s.selectedModel);
  const setSelectedModel = useAppStore((s) => s.setSelectedModel);
  const keyStatus = useAppStore((s) => s.keyStatus);
  const preferences = useAppStore((s) => s.preferences);
  const setPreferences = useAppStore((s) => s.setPreferences);
  const geminiKey = useAppStore((s) => s.geminiKey);
  const setGeminiKey = useAppStore((s) => s.setGeminiKey);

  const [activeSection, setActiveSection] = useState('api');

  return (
    <PageWrapper>
      <div className="content-max py-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-text-primary mb-1">Settings</h1>
          <p className="text-text-secondary font-body text-sm">Configure your API preferences and system details.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Settings nav */}
          <div className="space-y-1">
            {SETTINGS_NAV.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveSection(id)}
                className={['w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-body text-left transition-all duration-120', activeSection === id ? 'bg-accent-cyan/10 text-accent-cyan' : 'text-text-secondary hover:text-text-primary hover:bg-bg-elevated'].join(' ')}
                id={`settings-nav-${id}`}
              >
                <Icon size={14} />
                {label}
              </button>
            ))}
          </div>

          {/* Content panel */}
          <div className="md:col-span-3">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.18 }}
            >
              {/* API Configuration — keys are managed by Antigravity, not user-configurable */}
              {activeSection === 'api' && (
                <div className="space-y-6">
                  {/* API Configuration */}
                  <div className="card p-6 space-y-5">
                    <div>
                      <h2 className="font-display text-xl font-bold text-text-primary mb-1">API Configuration</h2>
                      <p className="text-text-secondary text-sm font-body">
                        Provide your own Google Gemini API key to enable premium AI operations.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label className="label block" htmlFor="gemini-key-input">Gemini API Key</label>
                      <input
                        id="gemini-key-input"
                        type="password"
                        value={geminiKey}
                        onChange={(e) => setGeminiKey(e.target.value)}
                        placeholder="AIzaSy..."
                        className="w-full bg-bg-base border border-border-default rounded-lg px-4 py-2.5 font-mono text-sm text-text-primary placeholder:text-text-muted focus:border-accent-cyan focus:ring-1 focus:ring-accent-cyan/30 transition-all duration-150 outline-none"
                      />
                      <p className="text-xs text-text-muted font-body">
                        Your key is saved locally in your browser's secure cache and is used to execute direct calls to Google.
                      </p>
                    </div>
                  </div>

                  {/* Default model */}
                  <div className="card p-6 space-y-4">
                    <h3 className="font-display text-lg font-bold text-text-primary">Default Model</h3>
                    <select
                      value={selectedModel}
                      onChange={(e) => setSelectedModel(e.target.value)}
                      className="select-field"
                      id="default-model-select"
                    >
                      {MODELS.map((m) => (
                        <option key={m.value} value={m.value}>
                          {m.label} ({m.provider}){m.recommended ? ' — Recommended' : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* API Key Status */}
                  <div className="card p-6 space-y-4">
                    <h3 className="font-display text-lg font-bold text-text-primary">API Key Status</h3>
                    <div className="space-y-0 text-sm font-body border border-border-subtle rounded-xl overflow-hidden bg-bg-base">
                      <div className="flex items-center justify-between px-4 py-3">
                        <span className="text-text-secondary">Google Gemini Key Status</span>
                        <KeyStatusDot status={keyStatus.gemini} />
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-bg-base border border-border-subtle text-xs text-text-muted font-body">
                      The primary Gemini API key is securely embedded in the client application. If the key fails or is rate-limited, the application automatically switches to the logic-based local fallback engine.
                    </div>
                  </div>
                </div>
              )}

              {/* Preferences */}
              {activeSection === 'preferences' && (
                <div className="card p-6 space-y-5">
                  <h2 className="font-display text-xl font-bold text-text-primary">Default Preferences</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="label mb-1.5 block" htmlFor="pref-task-type">Default Task Type</label>
                      <select id="pref-task-type" value={preferences.defaultTaskType} onChange={(e) => setPreferences({ defaultTaskType: e.target.value })} className="select-field">
                        {TASK_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="label mb-1.5 block" htmlFor="pref-output-style">Default Output Style</label>
                      <select id="pref-output-style" value={preferences.defaultOutputStyle} onChange={(e) => setPreferences({ defaultOutputStyle: e.target.value })} className="select-field">
                        {OUTPUT_STYLES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="label mb-1.5 block" htmlFor="pref-tone">Default Tone</label>
                      <select id="pref-tone" value={preferences.defaultTone} onChange={(e) => setPreferences({ defaultTone: e.target.value })} className="select-field">
                        {TONES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="space-y-4 pt-2 border-t border-border-subtle">
                    {[
                      { key: 'alwaysClarify', label: 'Always ask clarifying questions', desc: 'Ask 2-3 targeted questions before every improvement.' },
                      { key: 'showDiagnosisByDefault', label: 'Show diagnosis by default', desc: 'Open on the Diagnosis tab after every improvement.' },
                      { key: 'enableStreaming', label: 'Enable streaming output', desc: 'Show the AI response as it generates character-by-character.' },
                    ].map(({ key, label, desc }) => (
                      <label key={key} className="flex items-center justify-between gap-4 cursor-pointer pt-4">
                        <div>
                          <p className="text-sm font-medium text-text-primary font-body">{label}</p>
                          <p className="text-xs text-text-muted font-body">{desc}</p>
                        </div>
                        <button
                          onClick={() => setPreferences({ [key]: !preferences[key] })}
                          className={['relative inline-flex h-5 w-9 rounded-full transition-colors duration-200 flex-shrink-0', preferences[key] ? 'bg-accent-cyan' : 'bg-bg-hover border border-border-default'].join(' ')}
                          role="switch"
                          aria-checked={preferences[key]}
                          id={`pref-${key}`}
                        >
                          <span className={['absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200', preferences[key] ? 'translate-x-4' : ''].join(' ')} />
                        </button>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* About */}
              {activeSection === 'about' && (
                <div className="space-y-6">
                  {/* Hero Card */}
                  <div className="card p-6 relative overflow-hidden">
                    <div className="absolute inset-0 bg-radial-glow opacity-30 pointer-events-none" />
                    <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-accent-cyan/10 border border-accent-cyan/20 flex items-center justify-center shadow-glow-cyan/5">
                          <Zap size={28} className="text-accent-cyan" />
                        </div>
                        <div>
                          <h2 className="font-display text-2xl font-bold text-text-primary tracking-tight">
                            Prompt<span className="text-accent-cyan">Boss</span>
                          </h2>
                          <p className="text-text-secondary text-sm font-body">Version 1.0.0 · Production Release</p>
                        </div>
                      </div>
                      <a
                        href="https://github.com/saisrikiran25-ctrl/PromptBoss"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-border-default bg-bg-base hover:bg-bg-hover text-xs font-body font-medium text-text-primary transition-all duration-120"
                      >
                        GitHub Repository <ExternalLink size={12} />
                      </a>
                    </div>
                    <p className="text-text-secondary text-sm font-body leading-relaxed mt-4">
                      PromptBoss is a professional prompt engineering workspace designed to eliminate guesswork when instructing AI models. It analyzes, diagnoses, and restructures raw user prompts into high-fidelity system/user prompt pairs.
                    </p>
                  </div>

                  {/* Features G                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="card p-5 space-y-2">
                        <div className="flex items-center gap-2 text-accent-cyan">
                          <Cpu size={16} />
                          <h4 className="font-display text-sm font-bold text-text-primary">Gemini Core Engine</h4>
                        </div>
                        <p className="text-xs text-text-secondary font-body leading-relaxed">
                          Direct client-side connection to Google's Gemini API. If the key fails or rate-limits, the system instantly fails over to the local engine.
                        </p>
                      </div>

                      <div className="card p-5 space-y-2">
                        <div className="flex items-center gap-2 text-accent-cyan">
                          <Shield size={16} />
                          <h4 className="font-display text-sm font-bold text-text-primary">100% Client-Side Privacy</h4>
                        </div>
                        <p className="text-xs text-text-secondary font-body leading-relaxed">
                          All calls are executed directly from your browser to Google Gemini. Your API key, configurations, and history never hit any third-party backend servers.
                        </p>
                      </div>

                      <div className="card p-5 space-y-2">
                        <div className="flex items-center gap-2 text-accent-cyan">
                          <Zap size={16} />
                          <h4 className="font-display text-sm font-bold text-text-primary">Context Diagnosis</h4>
                        </div>
                        <p className="text-xs text-text-secondary font-body leading-relaxed">
                          Checks prompts against standard prompt-design criteria (Role, Task, Context, Constraints, and Target Audience) to highlight exactly what's missing.
                        </p>
                      </div>

                      <div className="card p-5 space-y-2">
                        <div className="flex items-center gap-2 text-accent-cyan">
                          <Code2 size={16} />
                          <h4 className="font-display text-sm font-bold text-text-primary">Workflow Architect</h4>
                        </div>
                        <p className="text-xs text-text-secondary font-body leading-relaxed">
                          Builds complex, modular prompts with system parameters, input placeholders, user templates, and structured JSON schema outputs ready for code.
                        </p>
                      </div>
                    </div>

                    {/* Architecture & Settings Details */}
                    <div className="card p-6 space-y-4">
                      <h3 className="font-display text-lg font-bold text-text-primary">System Information</h3>
                      <div className="divide-y divide-border-subtle text-sm font-body border border-border-subtle rounded-xl overflow-hidden bg-bg-base">
                        <div className="flex items-center justify-between px-4 py-3 border-b border-border-subtle">
                          <span className="text-text-secondary">Default LLM Engine</span>
                          <span className="text-text-primary font-mono text-xs">Google Gemini 2.5 Pro / Flash</span>
                        </div>
                        <div className="flex items-center justify-between px-4 py-3 border-b border-border-subtle">
                          <span className="text-text-secondary">API Provider Gateway</span>
                          <span className="text-text-primary">Google Gemini API</span>
                        </div>
                        <div className="flex items-center justify-between px-4 py-3 border-b border-border-subtle">
                        <span className="text-text-secondary">Local History Cache</span>
                        <span className="text-text-primary">Enabled (max 100 entries)</span>
                      </div>
                      <div className="flex items-center justify-between px-4 py-3">
                        <span className="text-text-secondary">Hosting Environment</span>
                        <span className="text-text-primary">GitHub Pages (SPA)</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
