import { create } from 'zustand';

const useAppStore = create((set, get) => ({
  // Gemini API Key — seeded from build-time env vars or configured by user.
  geminiKey: import.meta.env.VITE_GEMINI_KEY || localStorage.getItem('ag_gemini_key') || '',
  setGeminiKey: (key) => {
    localStorage.setItem('ag_gemini_key', key);
    set({ geminiKey: key });
  },
  hasAnyKey: () => !!get().geminiKey,

  // Active key health status
  keyStatus: { gemini: 'healthy' },
  setKeyStatus: (slot, status) => {
    const newStatus = typeof slot === 'string' ? slot : status;
    set((state) => ({ keyStatus: { ...state.keyStatus, gemini: newStatus } }));
  },

  // Selected model (Gemini model string)
  selectedModel: (() => {
    const stored = localStorage.getItem('ag_model');
    if (stored && (stored.startsWith('gemini-') || stored.startsWith('google/gemini-'))) {
      return stored.replace('google/', '');
    }
    return 'gemini-2.5-pro';
  })(),
  setSelectedModel: (m) => {
    localStorage.setItem('ag_model', m);
    set({ selectedModel: m });
  },

  // Current session
  currentPrompt: '',
  setCurrentPrompt: (p) => set({ currentPrompt: p }),

  // Improve mode
  improveConfig: {
    taskType: 'auto',
    targetModel: 'generic',
    outputStyle: 'structured',
    tone: 'professional',
    askClarifying: false,
  },
  setImproveConfig: (cfg) =>
    set((state) => ({ improveConfig: { ...state.improveConfig, ...cfg } })),
  improveResult: null,
  setImproveResult: (r) => set({ improveResult: r }),

  // Workflow mode
  workflowConfig: {
    modules: [],
    outputRequirements: {
      includeSystemPrompt: true,
      includeUserTemplate: true,
      includeVariables: true,
      includeGuardrails: true,
      includeSchema: false,
      includeFewShot: false,
    },
    integrationContext: 'other',
    expectedOutputFormat: 'json',
  },
  setWorkflowConfig: (cfg) =>
    set((state) => ({ workflowConfig: { ...state.workflowConfig, ...cfg } })),
  workflowResult: null,
  setWorkflowResult: (r) => set({ workflowResult: r }),

  // Diagnosis
  diagnosisResult: null,
  setDiagnosisResult: (r) => set({ diagnosisResult: r }),

  // History
  history: JSON.parse(localStorage.getItem('ag_history') || '[]'),
  addToHistory: (entry) => {
    const next = [
      { ...entry, id: Date.now(), ts: new Date().toISOString() },
      ...get().history,
    ].slice(0, 100);
    localStorage.setItem('ag_history', JSON.stringify(next));
    set({ history: next });
  },
  deleteFromHistory: (id) => {
    const next = get().history.filter((h) => h.id !== id);
    localStorage.setItem('ag_history', JSON.stringify(next));
    set({ history: next });
  },
  clearHistory: () => {
    localStorage.removeItem('ag_history');
    set({ history: [] });
  },

  // Default preferences
  preferences: {
    defaultTaskType: 'auto',
    defaultOutputStyle: 'structured',
    defaultTone: 'professional',
    alwaysClarify: false,
    showDiagnosisByDefault: false,
    enableStreaming: true,
  },
  setPreferences: (prefs) =>
    set((state) => ({ preferences: { ...state.preferences, ...prefs } })),

  // UI state
  isLoading: false,
  setIsLoading: (v) => set({ isLoading: v }),
  streamingText: '',
  appendStreamingText: (chunk) =>
    set((state) => ({ streamingText: state.streamingText + chunk })),
  resetStreaming: () => set({ streamingText: '' }),

  // Fallback states
  fallbackActive: false,
  setFallbackActive: (v) => set({ fallbackActive: v }),
  fallbackNote: '',
  setFallbackNote: (n) => set({ fallbackNote: n }),

  // Error state
  lastError: null,
  setLastError: (e) => set({ lastError: e }),
  clearError: () => set({ lastError: null }),
}));

export default useAppStore;
