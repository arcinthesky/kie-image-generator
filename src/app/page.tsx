"use client";

import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, Image as ImageIcon, Settings2, Zap, 
  Loader2, ChevronRight, Download, Share2, 
  Layers, Palette, Cpu, Sliders, History
} from "lucide-react";
import { useModelStore } from "../store/use-model-store";
import { MODELS } from "../config/models";
import { useState } from "react";

export default function Home() {
  const { 
    selectedModel, setSelectedModel, 
    config, setConfig, 
    prompt, setPrompt, 
    isGenerating, setGenerating,
    generatedImageUrl, setImage 
  } = useModelStore();

  const [activeTab, setActiveTab] = useState("generate");

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
    <div className="flex h-screen overflow-hidden bg-black text-white selection:bg-indigo-500/30">
      {/* --- Minimal Navigation Rail --- */}
      <nav className="w-16 flex flex-col items-center py-6 border-r border-zinc-900 bg-zinc-950 gap-8">
        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/40">
          <Sparkles className="w-6 h-6" />
        </div>
        <div className="flex flex-col gap-4">
          <NavItem icon={<Zap />} active={activeTab === "generate"} onClick={() => setActiveTab("generate")} />
          <NavItem icon={<Palette />} active={activeTab === "style"} onClick={() => setActiveTab("style")} />
          <NavItem icon={<History />} active={false} onClick={() => {}} />
        </div>
        <div className="mt-auto">
          <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700" />
        </div>
      </nav>

      {/* --- Main Dashboard --- */}
      <main className="flex-1 flex overflow-hidden">
        {/* LEFT PANEL: Controls */}
        <aside className="w-80 flex flex-col border-r border-zinc-900 bg-zinc-950/50 backdrop-blur-3xl">
          <div className="p-6">
            <h2 className="text-sm font-bold tracking-widest text-zinc-500 uppercase mb-6 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-indigo-500" /> Engine Settings
            </h2>
            
            <div className="space-y-8 h-[calc(100vh-140px)] overflow-y-auto pr-2 custom-scrollbar">
              {/* Model Picker */}
              <div className="space-y-4">
                <p className="text-xs font-semibold text-zinc-300 px-1">Active Model</p>
                <div className="grid gap-2">
                  {MODELS.map((model) => (
                    <button
                      key={model.id}
                      onClick={() => setSelectedModel(model.id)}
                      className={`group relative flex flex-col p-3.5 rounded-2xl transition-all duration-300 border ${
                        selectedModel.id === model.id 
                        ? "bg-indigo-600/10 border-indigo-500/50 ring-1 ring-indigo-500/20" 
                        : "bg-zinc-900/40 border-zinc-800 hover:border-zinc-700"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${selectedModel.id === model.id ? "bg-indigo-400 animate-pulse shadow-[0_0_8px_#818cf8]" : "bg-zinc-700"}`} />
                        <span className={`text-sm font-bold ${selectedModel.id === model.id ? "text-indigo-100" : "text-zinc-400 group-hover:text-zinc-200"}`}>
                          {model.name}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Advanced Parameters */}
              <div className="space-y-6 border-t border-zinc-900 pt-6">
                <div className="flex items-center justify-between px-1">
                  <p className="text-xs font-semibold text-zinc-300 flex items-center gap-2">
                    <Sliders className="w-3.5 h-3.5" /> Hyperparameters
                  </p>
                </div>
                
                <motion.div 
                  key={selectedModel.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  {selectedModel.parameters.map((param) => (
                    <div key={param.id} className="space-y-3 px-1">
                      <div className="flex justify-between items-center">
                        <span className="text-[11px] font-medium text-zinc-400">{param.label}</span>
                        <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
                          {config[param.id]}
                        </span>
                      </div>
                      
                      {param.type === "slider" && (
                        <div className="relative h-6 flex items-center">
                          <input 
                            type="range"
                            min={param.min}
                            max={param.max}
                            step={param.step || 1}
                            value={config[param.id]}
                            onChange={(e) => setConfig(param.id, Number(e.target.value))}
                            className="w-full h-1 bg-zinc-800 rounded-full appearance-none cursor-pointer accent-indigo-500 transition-all hover:h-1.5"
                          />
                        </div>
                      )}

                      {param.type === "select" && (
                        <select 
                          value={config[param.id]}
                          onChange={(e) => setConfig(param.id, e.target.value)}
                          className="w-full p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all appearance-none cursor-pointer"
                        >
                          {param.options?.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      )}
                    </div>
                  ))}
                </motion.div>
              </div>
            </div>
          </div>
        </aside>

        {/* CENTER PANEL: Canvas */}
        <section className="flex-1 flex flex-col p-6 bg-zinc-950 relative">
          <div className="flex-1 rounded-[2.5rem] bg-zinc-900/20 border border-zinc-900 flex flex-col items-center justify-center relative overflow-hidden group">
            {/* Ambient Background */}
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,_rgba(99,102,241,0.03),transparent_70%)] pointer-events-none" />
            
            <AnimatePresence mode="wait">
              {isGenerating ? (
                <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="flex flex-col items-center gap-6"
                >
                  <div className="relative flex items-center justify-center">
                    <div className="w-24 h-24 border-2 border-indigo-500/10 border-t-indigo-500 rounded-full animate-spin" />
                    <Sparkles className="w-10 h-10 text-indigo-500 absolute animate-pulse" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-xl font-black tracking-tighter text-white">Synthesizing Imagery</h3>
                    <p className="text-zinc-500 text-xs uppercase tracking-[0.3em] mt-2">Powering by {selectedModel.name}</p>
                  </div>
                </motion.div>
              ) : generatedImageUrl ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
                  className="relative w-full h-full p-8 flex items-center justify-center"
                >
                  <img 
                    src={generatedImageUrl} 
                    alt="AI Result" 
                    className="max-w-full max-h-full object-contain rounded-3xl shadow-[0_40px_100px_rgba(0,0,0,0.8)] ring-1 ring-white/10"
                  />
                  <div className="absolute top-10 right-10 flex flex-col gap-3">
                    <ActionButton icon={<Download />} onClick={() => window.open(generatedImageUrl)} label="Download" />
                    <ActionButton icon={<Share2 />} onClick={() => {}} label="Share" />
                  </div>
                </motion.div>
              ) : (
                <div className="flex flex-col items-center gap-6 text-center opacity-40 group-hover:opacity-100 transition-opacity duration-700">
                  <div className="w-32 h-32 rounded-[2.5rem] bg-zinc-900 border border-zinc-800 flex items-center justify-center rotate-3 group-hover:rotate-0 transition-transform duration-500 shadow-2xl">
                    <ImageIcon className="w-12 h-12 text-zinc-500" />
                  </div>
                  <div className="max-w-xs">
                    <h3 className="text-lg font-bold text-white tracking-tight">The canvas is silent.</h3>
                    <p className="text-zinc-500 text-sm mt-1 leading-relaxed">Infuse your vision into the generator below to create something extraordinary.</p>
                  </div>
                </div>
              )}
            </AnimatePresence>
          </div>

          {/* FLOAT PROMPT BAR */}
          <div className="mt-8 w-full max-w-4xl mx-auto px-4 pb-2">
            <div className="relative group bg-zinc-900/60 backdrop-blur-2xl p-1.5 rounded-[2rem] border border-zinc-800/80 shadow-[0_20px_50px_rgba(0,0,0,0.5)] focus-within:border-indigo-500/50 transition-all duration-500 ring-1 ring-white/5">
              <textarea 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="What's on your mind?..."
                className="w-full h-20 p-5 bg-transparent text-zinc-100 placeholder:text-zinc-600 outline-none resize-none text-base font-medium leading-relaxed"
              />
              <div className="flex items-center justify-between px-4 pb-3">
                <div className="flex gap-2">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-800/50 border border-zinc-700/50 text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                    <Layers className="w-3 h-3" /> {selectedModel.id}
                  </div>
                </div>
                <button 
                  onClick={handleGenerate}
                  disabled={isGenerating || !prompt}
                  className="px-8 py-3 bg-white text-black hover:bg-indigo-500 hover:text-white disabled:bg-zinc-800 disabled:text-zinc-600 rounded-2xl font-black text-sm transition-all flex items-center gap-3 active:scale-95 shadow-xl shadow-white/5"
                >
                  {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Zap className="w-4 h-4" /> GENERATE</>}
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function NavItem({ icon, active, onClick }: { icon: React.ReactNode, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-300 ${
        active ? "bg-zinc-800 text-white shadow-inner" : "text-zinc-600 hover:text-zinc-300 hover:bg-zinc-900"
      }`}
    >
      {Object.cloneElement(icon as React.ReactElement, { size: 20 })}
    </button>
  );
}

function ActionButton({ icon, onClick, label }: { icon: React.ReactNode, onClick: () => void, label: string }) {
  return (
    <button 
      onClick={onClick}
      className="flex items-center gap-3 px-4 py-3 bg-zinc-950/80 backdrop-blur-xl border border-white/5 hover:border-white/20 text-white rounded-2xl transition-all group"
    >
      <div className="text-zinc-400 group-hover:text-white transition-colors">{icon}</div>
      <span className="text-[10px] font-bold uppercase tracking-widest hidden group-hover:block transition-all">{label}</span>
    </button>
  );
}
