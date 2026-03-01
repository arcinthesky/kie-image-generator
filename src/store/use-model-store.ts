import { create } from 'zustand';
import { MODELS, ModelConfig } from '../config/models';

export interface HistoryItem {
  id: string;
  url: string;
  prompt: string;
  model: string;
  timestamp: number;
}

interface ModelState {
  selectedModel: ModelConfig;
  config: Record<string, any>;
  prompt: string;
  isGenerating: boolean;
  generatedImageUrl: string | null;
  history: HistoryItem[];

  setSelectedModel: (modelId: string) => void;
  setConfig: (key: string, value: any) => void;
  setPrompt: (prompt: string) => void;
  setGenerating: (status: boolean) => void;
  setImage: (url: string | null) => void;
  addToHistory: (item: Omit<HistoryItem, 'id' | 'timestamp'>) => void;
  clearHistory: () => void;
}

export const useModelStore = create<ModelState>((set, get) => ({
  selectedModel: MODELS[0],
  config: MODELS[0].parameters.reduce((acc, param) => ({ ...acc, [param.id]: param.default }), {}),
  prompt: "",
  isGenerating: false,
  generatedImageUrl: null,
  history: [],

  setSelectedModel: (modelId) => {
    const model = MODELS.find(m => m.id === modelId) || MODELS[0];
    set({
      selectedModel: model,
      config: model.parameters.reduce((acc, param) => ({ ...acc, [param.id]: param.default }), {})
    });
  },

  setConfig: (key, value) => set((state) => ({
    config: { ...state.config, [key]: value }
  })),

  setPrompt: (prompt) => set({ prompt }),
  setGenerating: (status) => set({ isGenerating: status }),
  setImage: (url) => set({ generatedImageUrl: url }),

  addToHistory: (item) => set((state) => ({
    history: [
      { ...item, id: Math.random().toString(36).slice(2), timestamp: Date.now() },
      ...state.history.slice(0, 19) // keep last 20
    ]
  })),

  clearHistory: () => set({ history: [] }),
}));
