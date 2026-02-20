"use client";

import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, Image as ImageIcon, Settings2, Zap, 
  Loader2, ChevronRight, Download, Share2, 
  Layers, Palette, Cpu, Sliders, History, Info
} from "lucide-react";
import { useModelStore } from "../store/use-model-store";
import { MODELS } from "../config/models";
import { useState, useEffect } from "react";

export default function Home() {
  const { 
    selectedModel, setSelectedModel, 
    config, setConfig, 
    prompt, setPrompt, 
    isGenerating, setGenerating,
    generatedImageUrl, setImage 
  } = useModelStore();

  const [isSidebarOpen, setSidebarOpen] = useState(true);

  // Auto-resize textarea
  const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
  };

  const handleGenerate = async () => {
    if (!prompt) return;
    setGenerating(true);
    setImage(null);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: selectedModel.id,
          prompt,
          parameters: config
        })
      });

      const data = await response.json();
      if (data.url) {
        setImage(data.url);
      } else {
        alert(data.error || "Generation failed");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#030303] text-zinc-100 overflow-hidden font-sans">
      {/* --- SIDEBAR --- */}
      <motion.aside 
        initial={false}
        animate={{ width: isSidebarOpen ? 340 : 0, opacity: isSidebarOpen ? 1 : 0 }}
        className="relative h-full bg-[#090909] border-r border-white/[0.03] flex flex-col z-20"
      >
        <div className="p-8 flex flex-col h-full overflow-hidden">
          <div className="flex items-center gap-4 mb-10">
            <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tighter leading-none">KIE STUDIO</h1>
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">Professional Suite</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-10 pb-10">
            {/* Model Selection */}
            <section>
              <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                <div className="w-1 h-3 bg-indigo-500 rounded-full" /> Neural Engine
              </h3>
              <div className="space-y-2">
                {MODELS.map((model) => (
                  <button
                    key={model.id}
                    onClick={() => setSelectedModel(model.id)}
                    className={`w-full group relative flex flex-col p-4 rounded-[1.25rem] transition-all duration-500 border ${
                      selectedModel.id === model.id 
                      ? "bg-white/[0.03] border-indigo-500/40 shadow-inner" 
                      : "bg-transparent border-transparent hover:bg-white/[0.02] hover:border-white/5"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className={`text-sm font-bold tracking-tight ${selectedModel.id === model.id ? "text-white" : "text-zinc-500 group-hover:text-zinc-300"}`}>
                        {model.name}
                      </span>
                      {selectedModel.id === model.id && (
                        <motion.div layoutId="active" className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_10px_#6366f1]" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </section>

            {/* Parameters */}
            <section>
              <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                <div className="w-1 h-3 bg-indigo-500 rounded-full" /> Parameters
              </h3>
              <AnimatePresence mode="wait">
                <motion.div 
                  key={selectedModel.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="space-y-8"
                >
                  {selectedModel.parameters.map((param) => (
                    <div key={param.id} className="space-y-4">
                      <div className="flex justify-between items-center">
                        <label className="text-[11px] font-bold text-zinc-400">{param.label}</label>
                        <span className="text-[10px] font-mono text-indigo-400 bg-indigo-400/5 px-2 py-0.5 rounded-md border border-indigo-500/10">
                          {config[param.id]}
                        </span>
                      </div>
                      
                      {param.type === "slider" && (
                        <input 
                          type="range"
                          min={param.min}
                          max={param.max}
                          step={param.step || 1}
                          value={config[param.id]}
                          onChange={(e) => setConfig(param.id, Number(e.target.value))}
                          className="w-full h-1 bg-zinc-800 rounded-full appearance-none cursor-pointer accent-indigo-500"
                        />
                      )}

                      {param.type === "select" && (
                        <div className="relative group">
                          <select 
                            value={config[param.id]}
                            onChange={(e) => setConfig(param.id, e.target.value)}
                            className="w-full p-3 rounded-xl bg-black border border-white/5 text-xs text-zinc-300 outline-none focus:border-indigo-500/50 transition-all appearance-none cursor-pointer"
                          >
                            {param.options?.map(opt => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>
                          <ChevronRight className="w-3 h-3 absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 pointer-events-none rotate-90" />
                        </div>
                      )}
                    </div>
                  ))}
                </motion.div>
              </AnimatePresence>
            </section>
          </div>
        </div>
      </motion.aside>

      {/* --- MAIN CANVAS --- */}
      <section className="flex-1 flex flex-col relative bg-[#030303] overflow-hidden">
        {/* Top Header */}
        <header className="h-20 flex items-center justify-between px-10 border-b border-white/[0.02]">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-white/5 rounded-xl transition-colors text-zinc-500 hover:text-white"
            >
              <Sliders className="w-5 h-5" />
            </button>
            <div className="h-4 w-[1px] bg-white/10" />
            <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">{selectedModel.name}</span>
          </div>
          <div className="flex items-center gap-4">
            <button className="text-[11px] font-bold text-zinc-500 hover:text-white transition-colors uppercase tracking-widest flex items-center gap-2">
              <Info className="w-4 h-4" /> Docs
            </button>
          </div>
        </header>

        {/* Canvas Area */}
        <div className="flex-1 relative flex items-center justify-center p-12">
          {/* Background Ambient Glow */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_#1a1a1a_0%,_transparent_100%)] opacity-40" />
          
          <AnimatePresence mode="wait">
            {isGenerating ? (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-8 z-10"
              >
                <div className="relative w-32 h-32 flex items-center justify-center">
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 border-t-2 border-indigo-500 rounded-full"
                  />
                  <Sparkles className="w-10 h-10 text-indigo-500 animate-pulse" />
                </div>
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-black tracking-tight text-white">Synthesizing...</h2>
                  <p className="text-zinc-500 text-xs font-bold uppercase tracking-[0.4em]">Neural Grid Processing</p>
                </div>
              </motion.div>
            ) : generatedImageUrl ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="relative z-10 max-w-full max-h-full"
              >
                <div className="absolute -inset-1 bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 blur-2xl rounded-[2.5rem] opacity-50" />
                <img 
                  src={generatedImageUrl} 
                  alt="Result" 
                  className="relative rounded-[2rem] shadow-2xl max-w-full max-h-[70vh] object-contain border border-white/10"
                />
                <div className="absolute bottom-6 right-6 flex gap-3">
                  <button onClick={() => window.open(generatedImageUrl)} className="p-4 bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl hover:bg-black/80 transition-all text-white group">
                    <Download className="w-5 h-5 group-active:scale-90 transition-transform" />
                  </button>
                  <button className="p-4 bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl hover:bg-black/80 transition-all text-white group">
                    <Share2 className="w-5 h-5 group-active:scale-90 transition-transform" />
                  </button>
                </div>
              </motion.div>
            ) : (
              <div className="flex flex-col items-center gap-8 opacity-20 hover:opacity-100 transition-opacity duration-1000 z-10">
                <div className="w-40 h-40 bg-zinc-900 border border-white/5 rounded-[3rem] flex items-center justify-center rotate-6 shadow-2xl">
                  <ImageIcon className="w-16 h-16 text-zinc-500" />
                </div>
                <div className="text-center max-w-xs">
                  <p className="text-sm font-medium leading-relaxed text-zinc-400">Describe your vision to generate a high-fidelity masterpiece.</p>
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Floating Input Controller */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-full max-w-4xl px-8 z-30">
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="p-1 rounded-[2.5rem] bg-gradient-to-b from-white/10 to-transparent shadow-2xl"
          >
            <div className="bg-[#111111]/90 backdrop-blur-3xl rounded-[2.4rem] p-3 flex flex-col border border-white/[0.03]">
              <textarea 
                value={prompt}
                onChange={(e) => { setPrompt(e.target.value); handleTextareaInput(e); }}
                placeholder="A high-fidelity portrait of a cyborg orchid..."
                className="w-full h-16 max-h-40 px-6 pt-4 bg-transparent text-white placeholder:text-zinc-600 outline-none resize-none text-base font-medium leading-relaxed"
              />
              <div className="flex items-center justify-between p-2 pl-6">
                <div className="flex gap-4">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/5 text-[9px] font-black text-zinc-400 uppercase tracking-widest">
                    <Zap className="w-3 h-3 text-indigo-500" /> {selectedModel.id}
                  </div>
                </div>
                <button 
                  onClick={handleGenerate}
                  disabled={isGenerating || !prompt}
                  className="px-10 py-4 bg-white text-black hover:bg-indigo-600 hover:text-white disabled:bg-zinc-800 disabled:text-zinc-600 rounded-[1.8rem] font-black text-xs transition-all duration-500 flex items-center gap-3 active:scale-95 shadow-2xl"
                >
                  {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Zap className="w-4 h-4" /> GENERATE IMAGE</>}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
      `}</style>
    </div>
  );
}
