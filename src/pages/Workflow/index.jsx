import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Workflow, AlertCircle, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import PageWrapper from '../../components/layout/PageWrapper';
import Button from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import PromptBox from '../../components/ui/PromptBox';
import { PromptSkeleton } from '../../components/ui/Skeleton';
import useAppStore from '../../store/useAppStore';
import { buildWorkflowPrompt } from '../../lib/api';
import { parseAIJson, copyToClipboard } from '../../lib/utils';
import { WORKFLOW_MODULES, INTEGRATION_CONTEXTS, EXPECTED_OUTPUT_FORMATS } from '../../constants/taskTypes';
import AboutFallbackResult from '../../components/ui/AboutFallbackResult';

const OUTPUT_TABS = [
  { id: 'system_prompt', label: 'System Prompt', variant: 'system' },
  { id: 'user_template', label: 'User Template', variant: 'user' },
  { id: 'variables', label: 'Variables', variant: 'default' },
  { id: 'guardrails', label: 'Guardrails', variant: 'guardrails' },
  { id: 'output_schema', label: 'Schema', variant: 'schema' },
];

export default function WorkflowPage() {
  const currentPrompt = useAppStore((s) => s.currentPrompt);
  const setCurrentPrompt = useAppStore((s) => s.setCurrentPrompt);
  const workflowConfig = useAppStore((s) => s.workflowConfig);
  const setWorkflowConfig = useAppStore((s) => s.setWorkflowConfig);
  const hasAnyKey = useAppStore((s) => s.hasAnyKey());

  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [streamingText, setStreamingText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [activeTab, setActiveTab] = useState('system_prompt');
  const [error, setError] = useState(null);

  const toggleModule = (mod) => {
    const modules = workflowConfig.modules || [];
    if (modules.includes(mod)) {
      setWorkflowConfig({ modules: modules.filter((m) => m !== mod) });
    } else {
      setWorkflowConfig({ modules: [...modules, mod] });
    }
  };

  const toggleOutputReq = (key) => {
    setWorkflowConfig({
      outputRequirements: {
        ...workflowConfig.outputRequirements,
        [key]: !workflowConfig.outputRequirements?.[key],
      },
    });
  };

  const handleGenerate = useCallback(async () => {
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
    let rawText = '';

    try {
      rawText = await buildWorkflowPrompt(
        {
          prompt: currentPrompt,
          modules: workflowConfig.modules,
          outputRequirements: workflowConfig.outputRequirements,
          integrationContext: workflowConfig.integrationContext,
          expectedOutputFormat: workflowConfig.expectedOutputFormat,
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
    } catch (err) {
      setError(err.userMessage || err.message || 'Something went wrong.');
      setIsStreaming(false);
    } finally {
      setIsLoading(false);
    }
  }, [currentPrompt, workflowConfig, hasAnyKey]);

  const getTabContent = (tab) => {
    if (!result) return '';
    switch (tab) {
      case 'system_prompt': return result.system_prompt || '';
      case 'user_template': return result.user_template || '';
      case 'variables':
        if (!result.variables?.length) return 'No variables defined.';
        return result.variables.map((v) => `{{${v.name}}} — ${v.type}\n${v.description}${v.required ? ' (required)' : ' (optional)'}`).join('\n\n');
      case 'guardrails': return result.guardrails || '';
      case 'output_schema':
        if (!result.output_schema) return 'No schema generated.';
        return typeof result.output_schema === 'string' ? result.output_schema : JSON.stringify(result.output_schema, null, 2);
      default: return '';
    }
  };

  const exportAll = async () => {
    const content = JSON.stringify(result, null, 2);
    await copyToClipboard(content);
    toast.success('Copied full workflow bundle');
  };

  return (
    <PageWrapper>
      <div className="content-max py-8">
        {/* Header */}
        <div className="rounded-xl p-5 mb-8 flex items-start gap-4" style={{ background: 'linear-gradient(135deg, rgba(0,212,255,0.05), rgba(245,166,35,0.05))', border: '1px solid rgba(0,212,255,0.12)' }}>
          <div className="w-10 h-10 rounded-xl bg-accent-amber/10 flex items-center justify-center flex-shrink-0">
            <Workflow size={20} className="text-accent-amber" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="font-display text-2xl font-bold text-text-primary">Workflow Prompt Upgrade</h1>
              <Badge variant="amber">POWER USER MODE</Badge>
            </div>
            <p className="text-text-secondary text-sm font-body mt-1">Build structured, reusable prompt systems for automations, agents, and AI pipelines.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Config */}
          <div className="space-y-5">
            {/* Base prompt */}
            <div className="card p-5 space-y-3">
              <label className="label" htmlFor="workflow-prompt">Base Prompt or Rough Idea</label>
              <textarea
                id="workflow-prompt"
                data-prompt
                value={currentPrompt}
                onChange={(e) => setCurrentPrompt(e.target.value)}
                placeholder="e.g. extract structured data from customer support tickets"
                className="w-full bg-bg-base border border-border-default rounded-lg p-3 font-mono text-sm text-text-primary placeholder:text-text-muted focus:border-accent-cyan focus:ring-1 focus:ring-accent-cyan/30 transition-all duration-150 outline-none resize-none"
                style={{ minHeight: 120 }}
              />
            </div>

            {/* Modules */}
            <div className="card p-5 space-y-3">
              <p className="label">Task Modules</p>
              <div className="space-y-2">
                {WORKFLOW_MODULES.map((mod) => (
                  <label key={mod.value} className="flex items-center gap-2.5 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={workflowConfig.modules?.includes(mod.value) || false}
                      onChange={() => toggleModule(mod.value)}
                      className="w-4 h-4 rounded border-border-default bg-bg-base accent-accent-cyan"
                    />
                    <span className="text-sm text-text-secondary group-hover:text-text-primary font-body transition-colors duration-120">{mod.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Output Requirements */}
            <div className="card p-5 space-y-3">
              <p className="label">Output Requirements</p>
              {[
                { key: 'includeSystemPrompt', label: 'System Prompt' },
                { key: 'includeUserTemplate', label: 'User Prompt Template' },
                { key: 'includeVariables', label: 'Variable Placeholders {{}}' },
                { key: 'includeGuardrails', label: 'Guardrails / Boundaries' },
                { key: 'includeSchema', label: 'Output Schema (JSON)' },
                { key: 'includeFewShot', label: 'Few-Shot Examples' },
              ].map(({ key, label }) => (
                <label key={key} className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm text-text-secondary font-body">{label}</span>
                  <button
                    onClick={() => toggleOutputReq(key)}
                    className={['relative inline-flex h-5 w-9 rounded-full transition-colors duration-200', workflowConfig.outputRequirements?.[key] ? 'bg-accent-cyan' : 'bg-bg-hover border border-border-default'].join(' ')}
                    role="switch"
                    aria-checked={workflowConfig.outputRequirements?.[key]}
                  >
                    <span className={['absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200', workflowConfig.outputRequirements?.[key] ? 'translate-x-4' : ''].join(' ')} />
                  </button>
                </label>
              ))}
            </div>

            {/* Integration Context */}
            <div className="card p-5 space-y-3">
              <p className="label">Integration Context</p>
              <div className="space-y-2">
                <div>
                  <label className="text-xs text-text-muted font-body block mb-1">Where will this run?</label>
                  <select
                    value={workflowConfig.integrationContext}
                    onChange={(e) => setWorkflowConfig({ integrationContext: e.target.value })}
                    className="select-field text-sm"
                  >
                    {INTEGRATION_CONTEXTS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-text-muted font-body block mb-1">Expected Output Format</label>
                  <select
                    value={workflowConfig.expectedOutputFormat}
                    onChange={(e) => setWorkflowConfig({ expectedOutputFormat: e.target.value })}
                    className="select-field text-sm"
                  >
                    {EXPECTED_OUTPUT_FORMATS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Middle: Visual Builder */}
          <div className="space-y-4">
            <div className="card p-5 space-y-4">
              <p className="label">Prompt Architecture</p>
              {/* System Prompt Block */}
              {workflowConfig.outputRequirements?.includeSystemPrompt && (
                <div className="rounded-xl border border-accent-cyan/30 bg-accent-cyan/5 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-2 h-2 rounded-full bg-accent-cyan" />
                    <span className="text-xs font-medium text-accent-cyan font-body uppercase tracking-wider">System Prompt Block</span>
                  </div>
                  <div className="space-y-1.5 font-mono text-xs text-text-secondary">
                    <div><span className="text-accent-cyan">Role:</span> [Defined by AI]</div>
                    <div><span className="text-accent-cyan">Context:</span> [Task context]</div>
                    <div><span className="text-accent-cyan">Constraints:</span> [Rules & limits]</div>
                  </div>
                </div>
              )}
              {(workflowConfig.outputRequirements?.includeSystemPrompt && workflowConfig.outputRequirements?.includeUserTemplate) && (
                <div className="flex justify-center"><div className="w-px h-6 bg-border-default" /></div>
              )}
              {/* User Template Block */}
              {workflowConfig.outputRequirements?.includeUserTemplate && (
                <div className="rounded-xl border border-accent-amber/30 bg-accent-amber/5 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-2 h-2 rounded-full bg-accent-amber" />
                    <span className="text-xs font-medium text-accent-amber font-body uppercase tracking-wider">User Prompt Template</span>
                  </div>
                  <div className="space-y-1.5 font-mono text-xs text-text-secondary">
                    <div><span className="text-accent-amber">Task:</span> [Instruction]</div>
                    {workflowConfig.outputRequirements?.includeVariables && <div><span className="text-accent-amber">Input:</span> {'{{input_variable}}'}</div>}
                    <div><span className="text-accent-amber">Format:</span> [Output spec]</div>
                  </div>
                </div>
              )}
              {(workflowConfig.outputRequirements?.includeSchema) && (
                <div className="flex justify-center"><div className="w-px h-6 bg-border-default" /></div>
              )}
              {/* Schema Block */}
              {workflowConfig.outputRequirements?.includeSchema && (
                <div className="rounded-xl border border-blue-500/30 bg-blue-500/5 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-2 h-2 rounded-full bg-blue-400" />
                    <span className="text-xs font-medium text-blue-400 font-body uppercase tracking-wider">Output Schema</span>
                  </div>
                  <div className="font-mono text-xs text-text-secondary">
                    {'{ "result": string, "confidence": number }'}
                  </div>
                </div>
              )}
              {/* Guardrails Block */}
              {workflowConfig.outputRequirements?.includeGuardrails && (
                <div className="rounded-xl border border-pink-500/30 bg-pink-500/5 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-2 h-2 rounded-full bg-pink-400" />
                    <span className="text-xs font-medium text-pink-400 font-body uppercase tracking-wider">Guardrails</span>
                  </div>
                  <div className="font-mono text-xs text-text-secondary">Edge case handling, refusal rules</div>
                </div>
              )}
              {!workflowConfig.outputRequirements?.includeSystemPrompt && !workflowConfig.outputRequirements?.includeUserTemplate && !workflowConfig.outputRequirements?.includeSchema && !workflowConfig.outputRequirements?.includeGuardrails && (
                <p className="text-text-muted text-sm font-body text-center py-8">Enable output requirements on the left to build your prompt architecture.</p>
              )}
            </div>

            {error && (
              <div className="flex items-start gap-2.5 p-3 rounded-lg bg-status-danger-dim border border-status-danger/30">
                <AlertCircle size={14} className="text-status-danger flex-shrink-0 mt-0.5" />
                <p className="text-sm text-status-danger font-body">{error}</p>
              </div>
            )}

            <Button
              fullWidth
              size="lg"
              icon={Workflow}
              loading={isLoading}
              disabled={!currentPrompt.trim() || isLoading}
              onClick={handleGenerate}
            >
              {isLoading ? 'Building...' : 'Generate Workflow Prompt →'}
            </Button>
          </div>

          {/* Right: Output */}
          <div>
            {!result && !isLoading && !isStreaming && (
              <div className="h-full flex flex-col items-center justify-center text-center py-20 card rounded-2xl">
                <div className="w-14 h-14 rounded-2xl bg-accent-amber/10 flex items-center justify-center mb-4">
                  <Workflow size={24} className="text-accent-amber" />
                </div>
                <h3 className="font-display text-lg font-bold text-text-primary mb-2">Workflow output</h3>
                <p className="text-text-secondary text-sm font-body max-w-xs">Configure your requirements and click Generate to build your prompt system.</p>
              </div>
            )}

            {(isLoading || isStreaming) && !result && (
              <div className="space-y-4">
                {streamingText ? (
                  <div className="card rounded-xl overflow-hidden" style={{ borderLeft: '3px solid #F5A623' }}>
                    <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border-subtle">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent-amber animate-pulse-dot" />
                      <span className="text-xs text-accent-amber font-body">Building workflow...</span>
                    </div>
                    <div className="p-4 font-mono text-[12px] leading-relaxed text-text-secondary max-h-64 overflow-y-auto">
                      {streamingText}
                      <span className="inline-block w-0.5 h-4 bg-accent-amber ml-0.5 animate-pulse" />
                    </div>
                  </div>
                ) : <PromptSkeleton />}
              </div>
            )}

            {result && (
              <div className="space-y-4">
                {/* Output tabs */}
                <div className="flex gap-0 border-b border-border-subtle overflow-x-auto">
                  {OUTPUT_TABS.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={['tab-btn text-xs', activeTab === tab.id ? 'active' : ''].join(' ')}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <PromptBox
                    content={getTabContent(activeTab)}
                    variant={OUTPUT_TABS.find((t) => t.id === activeTab)?.variant || 'default'}
                    label={OUTPUT_TABS.find((t) => t.id === activeTab)?.label}
                  />
                </motion.div>

                {/* Export section */}
                <div className="card p-4">
                  <p className="text-xs text-text-muted font-body mb-3 uppercase tracking-wider">Export as</p>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="ghost" size="sm" onClick={exportAll}>Copy all (JSON)</Button>
                    <Button variant="ghost" size="sm" onClick={() => {
                      const md = OUTPUT_TABS.map((t) => `## ${t.label}\n\n${getTabContent(t.id)}`).join('\n\n---\n\n');
                      copyToClipboard(md).then(() => toast.success('Copied as Markdown'));
                    }}>Copy as Markdown</Button>
                  </div>
                </div>
                <AboutFallbackResult />
              </div>
            )}
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
