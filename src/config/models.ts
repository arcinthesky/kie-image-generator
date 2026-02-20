export interface ModelConfig {
  id: string;
  name: string;
  description: string;
  parameters: Parameter[];
}

export interface Parameter {
  id: string;
  label: string;
  type: "select" | "slider" | "input" | "number";
  default: any;
  options?: { label: string; value: any }[];
  min?: number;
  max?: number;
  step?: number;
}

export const MODELS: ModelConfig[] = [
  {
    id: "flux-1-dev",
    name: "Flux.1 Dev",
    description: "High-quality base model for precise generation",
    parameters: [
      { id: "aspect_ratio", label: "Aspect Ratio", type: "select", default: "1:1", options: [
        { label: "Square (1:1)", value: "1:1" },
        { label: "Portrait (2:3)", value: "2:3" },
        { label: "Landscape (3:2)", value: "3:2" }
      ]},
      { id: "num_outputs", label: "Number of Images", type: "number", default: 1, min: 1, max: 4 },
      { id: "guidance_scale", label: "Guidance Scale", type: "slider", default: 3.5, min: 1, max: 10, step: 0.1 },
      { id: "num_inference_steps", label: "Steps", type: "slider", default: 28, min: 1, max: 50 }
    ]
  },
  {
    id: "flux-1-schnell",
    name: "Flux.1 Schnell",
    description: "Ultra-fast generation model",
    parameters: [
      { id: "aspect_ratio", label: "Aspect Ratio", type: "select", default: "1:1", options: [
        { label: "Square (1:1)", value: "1:1" },
        { label: "Portrait (2:3)", value: "2:3" },
        { label: "Landscape (3:2)", value: "3:2" }
      ]},
      { id: "num_inference_steps", label: "Steps (Speed)", type: "slider", default: 4, min: 1, max: 12 }
    ]
  },
  {
    id: "stable-diffusion-3.5-large",
    name: "SD 3.5 Large",
    description: "Latest Stable Diffusion model",
    parameters: [
      { id: "aspect_ratio", label: "Aspect Ratio", type: "select", default: "1:1", options: [
        { label: "Square (1:1)", value: "1:1" },
        { label: "Portrait (2:3)", value: "2:3" },
        { label: "Landscape (3:2)", value: "3:2" }
      ]},
      { id: "cfg_scale", label: "CFG Scale", type: "slider", default: 7.5, min: 1, max: 20 },
      { id: "steps", label: "Steps", type: "slider", default: 30, min: 1, max: 100 }
    ]
  }
];
