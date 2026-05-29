export const MODELS = [
  {
    value: 'gemini-2.5-pro',
    label: 'Gemini 2.5 Pro',
    provider: 'Google',
    recommended: true,
  },
  {
    value: 'gemini-2.5-flash',
    label: 'Gemini 2.5 Flash',
    provider: 'Google',
  },
  {
    value: 'gemini-2.0-flash',
    label: 'Gemini 2.0 Flash',
    provider: 'Google',
  },
  {
    value: 'gemini-1.5-pro',
    label: 'Gemini 1.5 Pro',
    provider: 'Google',
  },
  {
    value: 'gemini-1.5-flash',
    label: 'Gemini 1.5 Flash',
    provider: 'Google',
  },
];

export const TARGET_MODELS = [
  { value: 'gpt-4o', label: 'GPT-4o' },
  { value: 'claude-sonnet', label: 'Claude Sonnet' },
  { value: 'claude-opus', label: 'Claude Opus' },
  { value: 'gemini-1.5', label: 'Gemini 1.5' },
  { value: 'llama-3', label: 'Llama 3' },
  { value: 'generic', label: 'Generic/Any' },
];

export const PROVIDER_COLORS = {
  Anthropic: '#D97C4E',
  OpenAI: '#10A37F',
  Google: '#4285F4',
  Meta: '#0866FF',
  Mistral: '#7C3AED',
};
