// src/pages/Improve/index.jsx
import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wand2, Zap, Building2, ClipboardList, Shuffle, AlertCircle, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import PageWrapper from '../../components/layout/PageWrapper';
import Button from '../../components/ui/Button';
import PromptBox from '../../components/ui/PromptBox';
import DiagnosticCard from '../../components/ui/DiagnosticCard';
import { PromptSkeleton, DiagnosticSkeleton } from '../../components/ui/Skeleton';
import useAppStore from '../../store/useAppStore';
import { improvePrompt, askClarifyingQuestions } from '../../lib/api';
import { parseAIJson, wordCount, copyToClipboard } from '../../lib/utils';
import { TASK_TYPES, OUTPUT_STYLES, TONES, TARGET_MODELS } from '../../constants/taskTypes';
import { Copy, Check } from 'lucide-react';
import AboutFallbackResult from '../../components/ui/AboutFallbackResult';

const TABS = [
  { id: 'quick', label: '⚡ Quick Version', icon: Zap },
  { id: 'advanced', label: '🏗 Advanced', icon: Building2 },
  { id: 'diagnosis', label: '📋 Diagnosis', icon: ClipboardList },
  { id: 'alternatives', label: '🔀 Alternatives', icon: Shuffle },
];

function SelectField({ label, value, onChange, options, id }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="label">{label}</label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="select-field text-sm py-2"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}

function AlternativeAccordion({ alternatives }) {
  const [openIdx, setOpenIdx] = useState(null);
  const [copiedIdx, setCopiedIdx] = useState(null);

  if (!alternatives?.length) return (
    <div className="text-center py-12 text-text-muted font-body text-sm">No alternatives generated.</div>
  );

  return (
    <div className="space-y-3">
      {alternatives.map((alt, i) => (
        <div key={i} className="card border border-border-subtle rounded-xl overflow-hidden">
          <button
            onClick={() => setOpenIdx(openIdx === i ? null : i)}
            className="w-full flex items-center justify-between p-4 text-left hover:bg-bg-hover transition-colors duration-120"
          >
            <span className="text-sm font-medium text-text-primary font-body">{alt.label}</span>
            <span className="text-xs text-text-muted">{openIdx === i ? '▲' : '▼'}</span>
          </button>
          <AnimatePresence>
            {openIdx === i && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-4">
                  <div className="bg-bg-base rounded-lg p-4 font-mono text-[13px] text-text-primary leading-relaxed border border-border-subtle mb-3">
                    {alt.prompt}
                  </div>
                  <button
                    onClick={async () => {
                      await copyToClipboard(alt.prompt);
                      setCopiedIdx(i);
                      toast.success('Copied to clipboard');
                      setTimeout(() => setCopiedIdx(null), 2000);
                    }}
                    className="flex items-center gap-1.5 text-xs text-text-secondary hover:text-accent-cyan transition-colors duration-120"
                  >
                    {copiedIdx === i ? <Check size={12} className="text-status-success" /> : <Copy size={12} />}
                    {copiedIdx === i ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}

export default function Improve() {
  const navigate = useNavigate();
  const currentPrompt = useAppStore((s) => s.currentPrompt);
  const setCurrentPrompt = useAppStore((s) => s.setCurrentPrompt);
  const improveConfig = useAppStore((s) => s.improveConfig);
  const setImproveConfig = useAppStore((s) => s.setImproveConfig);
  const addToHistory = useAppStore((s) => s.addToHistory);
  const hasAnyKey = useAppStore((s) => s.hasAnyKey());

  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [streamingText, setStreamingText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [activeTab, setActiveTab] = useState('quick');
  const [error, setError] = useState(null);
  const [clarifyLoading, setClarifyLoading] = useState(false);
  const [clarifyQuestions, setClarifyQuestions] = useState(null);
  const textareaRef = useRef(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 400) + 'px';
    }
  }, [currentPrompt]);

  // Keyboard shortcut: Ctrl+Enter to submit
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        if (currentPrompt.trim() && !isLoading) handleSubmit();
      }
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'C') {
        e.preventDefault();
        if (result?.quick_version) copyToClipboard(result.quick_version).then(() => toast.success('Copied output'));
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [currentPrompt, isLoading, result]);

  const handleSubmit = useCallback(async () => {
    if (!currentPrompt.trim()) return;
    if (!hasAnyKey) {
      toast.error('No API keys configured. Please configure VITE_OR_KEY_1 and VITE_OR_KEY_2.');
      return;
    }

    setError(null);
    setResult(null);
    setStreamingText('');
    setIsStreaming(true);
    setIsLoading(true);
    setActiveTab('quick');
    let rawText = '';

    try {
      rawText = await improvePrompt(
        {
          prompt: currentPrompt,
          taskType: improveConfig.taskType,
          targetModel: improveConfig.targetModel,
          outputStyle: improveConfig.outputStyle,
          tone: improveConfig.tone,
        },
        {
          onChunk: (chunk) => {
            rawText += chunk;
            setStreamingText(rawText);
          },
        }
      );

      const parsed = parseAIJson(rawText);
      setResult(parsed);
      setStreamingText('');
      setIsStreaming(false);

      // Save to history
      addToHistory({
        type: 'improve',
        original: currentPrompt,
        improved: parsed.quick_version,
        taskType: improveConfig.taskType,
        model: improveConfig.targetModel,
        result: parsed,
      });

    } catch (err) {
      setError(err.userMessage || err.message || 'Something went wrong. Please try again.');
      setIsStreaming(false);
    } finally {
      setIsLoading(false);
    }
  }, [currentPrompt, improveConfig, hasAnyKey, addToHistory]);

  const handleClarify = useCallback(async () => {
    if (!currentPrompt.trim()) return;
    setClarifyLoading(true);
    setClarifyQuestions(null);
    try {
      const res = await askClarifyingQuestions({ prompt: currentPrompt, taskType: improveConfig.taskType });
      const text = res?.choices?.[0]?.message?.content || '';
      const parsed = parseAIJson(text);
      setClarifyQuestions(parsed.questions || []);
    } catch (err) {
      toast.error('Could not generate clarifying questions.');
    } finally {
      setClarifyLoading(false);
    }
  }, [currentPrompt, improveConfig.taskType]);

  const charCount = currentPrompt.length;

  return (
    <PageWrapper>
      <div className="content-max py-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-text-primary mb-1">Prompt Improver</h1>
          <p className="text-text-secondary font-body text-sm">Paste your rough prompt and get a structured, task-ready version instantly.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* ── Left: Input Panel ── */}
          <div className="space-y-5">
            {/* Prompt textarea */}
            <div className="card p-5 space-y-3">
              <div className="flex items-center justify-between">
                <label className="label" htmlFor="prompt-input">Your prompt</label>
                <span className="text-xs text-text-muted font-mono">{charCount} chars</span>
              </div>
              <p className="text-xs text-text-muted font-body -mt-1">Paste your rough prompt — don&apos;t overthink it.</p>
              <textarea
                id="prompt-input"
                ref={textareaRef}
                data-prompt
                value={currentPrompt}
                onChange={(e) => setCurrentPrompt(e.target.value)}
                placeholder="e.g. write me a summary of this article"
                className="w-full bg-bg-base border border-border-default rounded-lg p-4 font-mono text-sm text-text-primary placeholder:text-text-muted focus:border-accent-cyan focus:ring-1 focus:ring-accent-cyan/30 transition-all duration-150 outline-none resize-none leading-relaxed"
                style={{ minHeight: 180, maxHeight: 400 }}
              />
            </div>

            {/* Config row */}
            <div className="card p-5 grid grid-cols-2 gap-3">
              <SelectField
                id="task-type"
                label="Task Type"
                value={improveConfig.taskType}
                onChange={(v) => setImproveConfig({ taskType: v })}
                options={TASK_TYPES}
              />
              <SelectField
                id="target-model"
                label="Target Model"
                value={improveConfig.targetModel || 'generic'}
                onChange={(v) => setImproveConfig({ targetModel: v })}
                options={TARGET_MODELS}
              />
              <SelectField
                id="output-style"
                label="Output Style"
                value={improveConfig.outputStyle}
                onChange={(v) => setImproveConfig({ outputStyle: v })}
                options={OUTPUT_STYLES}
              />
              <SelectField
                id="tone"
                label="Tone"
                value={improveConfig.tone}
                onChange={(v) => setImproveConfig({ tone: v })}
                options={TONES}
              />
            </div>

            {/* Clarifying toggle */}
            <div className="card p-4 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-text-primary font-body">⚡ Ask clarifying questions first</span>
                </div>
                <p className="text-xs text-text-muted font-body mt-0.5">AI asks up to 3 targeted questions before improving.</p>
              </div>
              <button
                onClick={() => setImproveConfig({ askClarifying: !improveConfig.askClarifying })}
                className={['relative inline-flex h-5 w-9 rounded-full transition-colors duration-200 flex-shrink-0', improveConfig.askClarifying ? 'bg-accent-cyan' : 'bg-bg-hover border border-border-default'].join(' ')}
                role="switch"
                aria-checked={improveConfig.askClarifying}
                id="clarify-toggle"
              >
                <span className={['absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200', improveConfig.askClarifying ? 'translate-x-4' : ''].join(' ')} />
              </button>
            </div>

            {/* Clarify questions */}
            {improveConfig.askClarifying && (
              <div className="space-y-3">
                <Button
                  variant="ghost"
                  fullWidth
                  onClick={handleClarify}
                  loading={clarifyLoading}
                  disabled={!currentPrompt.trim()}
                >
                  Generate Clarifying Questions
                </Button>
                {clarifyQuestions && (
                  <div className="card p-4 space-y-3">
                    {clarifyQuestions.map((q, i) => (
                      <div key={q.id || i} className="space-y-1">
                        <p className="text-sm font-medium text-text-primary font-body">Q{i + 1}: {q.question}</p>
                        <p className="text-xs text-text-muted font-body">{q.why}</p>
                        {q.options && (
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            {q.options.map((opt) => (
                              <span key={opt} className="px-2 py-0.5 rounded-full border border-border-subtle text-xs text-text-secondary font-body hover:border-accent-cyan hover:text-accent-cyan cursor-pointer transition-colors duration-120">{opt}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="flex items-start gap-2.5 p-3 rounded-lg bg-status-danger-dim border border-status-danger/30">
                <AlertCircle size={14} className="text-status-danger flex-shrink-0 mt-0.5" />
                <p className="text-sm text-status-danger font-body">{error}</p>
              </div>
            )}

            {/* Submit */}
            <Button
              id="improve-submit-btn"
              fullWidth
              size="lg"
              icon={Wand2}
              loading={isLoading}
              disabled={!currentPrompt.trim() || isLoading}
              onClick={handleSubmit}
              className="shadow-glow-cyan/20"
            >
              {isLoading ? 'Analyzing...' : 'Improve My Prompt →'}
            </Button>
            <p className="text-center text-xs text-text-muted font-body">Ctrl+Enter to submit · Ctrl+Shift+C to copy output</p>
          </div>

          {/* ── Right: Output Panel ── */}
          <div>
            {!result && !isLoading && !isStreaming && (
              <div className="h-full flex flex-col items-center justify-center text-center py-20 card rounded-2xl">
                <div className="w-14 h-14 rounded-2xl bg-accent-cyan/10 flex items-center justify-center mb-4">
                  <Wand2 size={24} className="text-accent-cyan" />
                </div>
                <h3 className="font-display text-lg font-bold text-text-primary mb-2">Ready to improve</h3>
                <p className="text-text-secondary text-sm font-body max-w-xs">
                  Paste your prompt on the left and click Improve to see the magic.
                </p>
              </div>
            )}

            {(isLoading || isStreaming) && !result && (
              <div className="space-y-5">
                {/* Streaming preview */}
                {streamingText ? (
                  <div className="card rounded-xl overflow-hidden" style={{ borderLeft: '3px solid #00D4FF' }}>
                    <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border-subtle">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent-cyan animate-pulse-dot" />
                      <span className="text-xs text-accent-cyan font-body">Analyzing & improving...</span>
                    </div>
                    <div className="p-5 font-mono text-[13px] leading-7 text-text-secondary max-h-64 overflow-y-auto">
                      {streamingText}
                      <span className="inline-block w-0.5 h-4 bg-accent-cyan ml-0.5 animate-pulse" />
                    </div>
                  </div>
                ) : (
                  <>
                    <PromptSkeleton />
                    <DiagnosticSkeleton />
                  </>
                )}
              </div>
            )}

            {result && (
              <div className="space-y-4">
                {/* Tabs */}
                <div className="flex gap-0 border-b border-border-subtle overflow-x-auto">
                  {TABS.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={['tab-btn', activeTab === tab.id ? 'active' : ''].join(' ')}
                      id={`tab-${tab.id}`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    {/* Quick Version */}
                    {activeTab === 'quick' && (
                      <div className="space-y-3">
                        <PromptBox content={result.quick_version} variant="quick" />
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={ExternalLink}
                          onClick={() => {
                            useAppStore.getState().setCurrentPrompt(result.quick_version);
                            navigate('/workflow');
                          }}
                        >
                          Use in Workflow →
                        </Button>
                      </div>
                    )}

                    {/* Advanced */}
                    {activeTab === 'advanced' && (
                      <div className="space-y-3">
                        <PromptBox content={result.advanced_version} variant="advanced" />
                        {result.quick_version && result.advanced_version && (
                          <div className="card p-4">
                            <p className="text-xs font-medium text-text-secondary mb-2 font-body uppercase tracking-wider">What changed?</p>
                            <div className="space-y-1 font-mono text-xs">
                              <div className="text-status-danger line-through opacity-60 leading-relaxed">{result.quick_version.slice(0, 120)}...</div>
                              <div className="text-status-success leading-relaxed">{result.advanced_version.slice(0, 160)}...</div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Diagnosis */}
                    {activeTab === 'diagnosis' && (
                      <div className="space-y-3">
                        <p className="text-sm text-text-secondary font-body">What was missing in your original prompt:</p>
                        {result.diagnosis?.filter(d => d.severity !== 'good').map((d, i) => (
                          <DiagnosticCard
                            key={d.category}
                            category={d.category}
                            severity={d.severity}
                            title={d.title}
                            description={d.description}
                            index={i}
                          />
                        ))}
                        {result.diagnosis?.filter(d => d.severity === 'good').map((d, i) => (
                          <DiagnosticCard
                            key={d.category}
                            category={d.category}
                            severity={d.severity}
                            title={d.title}
                            description={d.description}
                            index={result.diagnosis.filter(x => x.severity !== 'good').length + i}
                          />
                        ))}
                      </div>
                    )}

                    {/* Alternatives */}
                    {activeTab === 'alternatives' && (
                      <AlternativeAccordion alternatives={result.alternatives} />
                    )}
                  </motion.div>
                </AnimatePresence>
                <AboutFallbackResult />
              </div>
            )}
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
