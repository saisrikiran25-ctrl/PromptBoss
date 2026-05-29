export const TASK_TYPES = [
  { value: 'auto', label: 'Auto-detect', icon: 'Sparkles', color: '#00D4FF' },
  { value: 'writing', label: 'Writing', icon: 'PenLine', color: '#A78BFA' },
  { value: 'summarization', label: 'Summarization', icon: 'FileText', color: '#34D399' },
  { value: 'coding', label: 'Coding', icon: 'Code2', color: '#F472B6' },
  { value: 'research', label: 'Research', icon: 'Search', color: '#60A5FA' },
  { value: 'data-analysis', label: 'Data Analysis', icon: 'BarChart2', color: '#FBBF24' },
  { value: 'outreach', label: 'Outreach', icon: 'Mail', color: '#FB923C' },
  { value: 'report-generation', label: 'Report Generation', icon: 'FileBarChart', color: '#4ADE80' },
  { value: 'ideation', label: 'Ideation', icon: 'Lightbulb', color: '#E879F9' },
  { value: 'classification', label: 'Classification', icon: 'Tag', color: '#38BDF8' },
  { value: 'extraction', label: 'Extraction', icon: 'Scissors', color: '#F87171' },
  { value: 'other', label: 'Other', icon: 'MoreHorizontal', color: '#94A3B8' },
];

export const OUTPUT_STYLES = [
  { value: 'quick-answer', label: 'Quick Answer' },
  { value: 'structured', label: 'Structured/Sectioned' },
  { value: 'json', label: 'JSON/Machine-Readable' },
  { value: 'markdown', label: 'Markdown' },
  { value: 'step-by-step', label: 'Step-by-Step' },
  { value: 'bullet-points', label: 'Bullet Points' },
];

export const TONES = [
  { value: 'professional', label: 'Professional' },
  { value: 'conversational', label: 'Conversational' },
  { value: 'technical', label: 'Technical' },
  { value: 'concise', label: 'Concise' },
  { value: 'formal', label: 'Formal' },
  { value: 'creative', label: 'Creative' },
];

export const WORKFLOW_MODULES = [
  { value: 'extraction', label: 'Extraction' },
  { value: 'classification', label: 'Classification' },
  { value: 'summarization', label: 'Summarization' },
  { value: 'routing', label: 'Routing' },
  { value: 'report-generation', label: 'Report Generation' },
  { value: 'agent-orchestration', label: 'Agent Orchestration' },
  { value: 'data-transformation', label: 'Data Transformation' },
  { value: 'custom', label: 'Custom' },
];

export const INTEGRATION_CONTEXTS = [
  { value: 'n8n', label: 'n8n' },
  { value: 'make', label: 'Make (Integromat)' },
  { value: 'openrouter', label: 'OpenRouter' },
  { value: 'langchain', label: 'LangChain' },
  { value: 'raw-api', label: 'Raw API' },
  { value: 'custom-agent', label: 'Custom Agent' },
  { value: 'other', label: 'Other' },
];

export const EXPECTED_OUTPUT_FORMATS = [
  { value: 'json', label: 'JSON' },
  { value: 'markdown', label: 'Markdown' },
  { value: 'plain-text', label: 'Plain Text' },
  { value: 'xml', label: 'XML' },
  { value: 'custom-schema', label: 'Custom Schema' },
];

export const TARGET_MODELS = [
  { value: 'generic', label: 'Generic/Any' },
  { value: 'gpt-4o', label: 'GPT-4o' },
  { value: 'claude-sonnet', label: 'Claude Sonnet' },
  { value: 'claude-opus', label: 'Claude Opus' },
  { value: 'gemini-1.5', label: 'Gemini 1.5' },
  { value: 'llama-3', label: 'Llama 3' },
];

