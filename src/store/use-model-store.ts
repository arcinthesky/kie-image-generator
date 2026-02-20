import { create } from 'zustand';
import { MODELS, ModelConfig } from '../config/models';

interface ModelState {
  selectedModel: ModelConfig;
  config: Record<string, any>;
  prompt: string;
  isGenerating: boolean;
  generatedImageUrl: string | null;
  
  setSelectedModel: (modelId: string) => void;
  setConfig: (key: string, value: any) => void;
  setPrompt: (prompt: string) => void;
  setGenerating: (status: boolean) => void;
  setImage: (url: string | null) => void;
}

export const useModelStore = create<ModelState>((set) => ({
  selectedModel: MODELS[0],
  config: MODELS[0].parameters.reduce((acc, param) => ({ ...acc, [param.id]: param.default }), {}),
  prompt: "",
  isGenerating: false,
  generatedImageUrl: null,

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
}));
