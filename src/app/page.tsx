"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Image as ImageIcon, Settings2, Zap, Loader2, ChevronRight, Download } from "lucide-react";
import { useModelStore } from "@/store/use-model-store";
import { MODELS } from "@/config/models";

export default function Home() {
  const { 
    selectedModel, setSelectedModel, 
    config, setConfig, 
    prompt, setPrompt, 
    isGenerating, setGenerating,
    generatedImageUrl, setImage 
  } = useModelStore();

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
    <main className="min-h-screen flex flex-col md:flex-row overflow-hidden bg-zinc-950 font-sans">
      {/* Sidebar */}
      <aside className="w-full md:w-80 border-b md:border-b-0 md:border-r border-zinc-800 p-6 flex flex-col gap-8 bg-zinc-900/40 backdrop-blur-2xl z-10">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-tr from-indigo-600 to-purple-600 p-2.5 rounded-2xl shadow-lg shadow-indigo-500/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-black tracking-tighter text-white">KIE AI</h1>
        </div>

        <div className="flex flex-col gap-8 overflow-y-auto pr-2 custom-scrollbar">
          {/* Model Selector */}
          <section className="space-y-4">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] flex items-center gap-2">
              <Zap className="w-3 h-3 text-indigo-500" /> Choose Model
            </label>
            <div className="flex flex-col gap-2">
              {MODELS.map((model) => (
                <button
                  key={model.id}
                  onClick={() => setSelectedModel(model.id)}
                  className={`group relative p-3 rounded-2xl text-left transition-all duration-300 border ${
                    selectedModel.id === model.id 
                    ? "bg-indigo-500/10 border-indigo-500/50" 
                    : "bg-zinc-800/30 border-zinc-700/50 hover:border-zinc-500"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-semibold ${selectedModel.id === model.id ? "text-indigo-400" : "text-zinc-300"}`}>
                      {model.name}
                    </span>
                    {selectedModel.id === model.id && <motion.div layoutId="active-dot" className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]" />}
                  </div>
                  <p className="text-[11px] text-zinc-500 mt-1 line-clamp-1 group-hover:text-zinc-400 transition-colors">{model.description}</p>
                </button>
              ))}
            </div>
          </section>

          {/* Dynamic Configuration */}
          <section className="space-y-4">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] flex items-center gap-2">
              <Settings2 className="w-3 h-3 text-indigo-500" /> Fine Tune
            </label>
            <motion.div 
              key={selectedModel.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-5"
            >
              {selectedModel.parameters.map((param) => (
                <div key={param.id} className="space-y-2.5">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium text-zinc-300">{param.label}</span>
                    <span className="text-[10px] font-mono text-indigo-400 bg-indigo-400/10 px-1.5 py-0.5 rounded-md">
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
                      className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    />
                  )}

                  {param.type === "select" && (
                    <select 
                      value={config[param.id]}
                      onChange={(e) => setConfig(param.id, e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-zinc-800/50 border border-zinc-700/50 text-xs text-zinc-300 outline-none focus:border-indigo-500/50 transition-colors"
                    >
                      {param.options?.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  )}

                  {param.type === "number" && (
                    <input 
                      type="number"
                      min={param.min}
                      max={param.max}
                      value={config[param.id]}
                      onChange={(e) => setConfig(param.id, Number(e.target.value))}
                      className="w-full p-2.5 rounded-xl bg-zinc-800/50 border border-zinc-700/50 text-xs text-zinc-300 outline-none focus:border-indigo-500/50 transition-colors"
                    />
                  )}
                </div>
              ))}
            </motion.div>
          </section>
        </div>
        
        <footer className="mt-auto pt-6 border-t border-zinc-800/50">
          <div className="flex items-center justify-between opacity-40">
            <span className="text-[9px] font-bold uppercase tracking-widest">v1.0.0 Stable</span>
            <div className="flex gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            </div>
          </div>
        </footer>
      </aside>

      {/* Main Canvas Area */}
      <section className="flex-1 p-4 md:p-8 flex flex-col gap-6 relative">
        <div className="flex-1 rounded-[2.5rem] border border-zinc-800/50 bg-zinc-900/20 flex flex-col items-center justify-center relative overflow-hidden group shadow-2xl">
          {/* Background Decorative Gradient */}
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-500/5 via-transparent to-purple-500/5 pointer-events-none" />
          
          <AnimatePresence mode="wait">
            {isGenerating ? (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-4"
              >
                <div className="relative">
                  <div className="w-20 h-20 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
                  <Sparkles className="w-8 h-8 text-indigo-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                </div>
                <div className="flex flex-col items-center">
                  <p className="text-white font-bold tracking-tight">Crafting your vision...</p>
                  <p className="text-zinc-500 text-xs uppercase tracking-widest mt-1">Harnessing {selectedModel.name}</p>
                </div>
              </motion.div>
            ) : generatedImageUrl ? (
              <motion.div 
                key="image"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative w-full h-full p-8 flex items-center justify-center"
              >
                <img 
                  src={generatedImageUrl} 
                  alt="Generated Masterpiece" 
                  className="max-w-full max-h-full object-contain rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10"
                />
                <div className="absolute top-12 right-12 flex gap-2">
                  <button 
                    onClick={() => window.open(generatedImageUrl)}
                    className="p-3 bg-white/10 backdrop-blur-md hover:bg-white/20 text-white rounded-2xl transition-all border border-white/10 group"
                  >
                    <Download className="w-5 h-5 group-active:scale-90 transition-transform" />
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center gap-4 text-center px-6"
              >
                <div className="w-24 h-24 rounded-full bg-zinc-800/50 flex items-center justify-center mb-2 border border-zinc-700/30 group-hover:scale-110 transition-transform duration-500">
                  <ImageIcon className="w-10 h-10 text-zinc-600 group-hover:text-indigo-400 transition-colors" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg tracking-tight">Ready to begin?</h3>
                  <p className="text-zinc-500 text-sm max-w-xs mt-1">Enter a prompt below and let the neural networks do the magic.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Prompt Input Box */}
        <div className="w-full max-w-4xl mx-auto z-10">
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="relative group bg-zinc-900/80 backdrop-blur-3xl p-2 rounded-[2rem] border border-zinc-800 shadow-2xl focus-within:border-indigo-500/50 transition-all duration-500"
          >
            <textarea 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="A futuristic cybernetic orchid blooming in a neon rain..."
              className="w-full h-32 md:h-24 p-6 bg-transparent text-zinc-100 placeholder:text-zinc-600 outline-none resize-none text-sm md:text-base leading-relaxed"
            />
            <div className="flex items-center justify-between px-4 pb-2">
              <div className="flex gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-zinc-800 text-[10px] font-bold text-zinc-500 uppercase tracking-wider border border-zinc-700/50">
                  {selectedModel.id}
                </span>
              </div>
              <button 
                onClick={handleGenerate}
                disabled={isGenerating || !prompt}
                className="group px-8 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white rounded-2xl font-bold shadow-xl shadow-indigo-500/20 transition-all flex items-center gap-3 active:scale-95 overflow-hidden relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-400/0 via-white/10 to-indigo-400/0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none" />
                {isGenerating ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <span>Generate</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      </section>
      
      <style jsx global>{`
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.1);
        }
      `}</style>
    </main>
  );
}
