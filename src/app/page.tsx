"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, Image as ImageIcon, Zap,
  Loader2, ChevronDown, Download, Share2,
  Sliders, History, X, ChevronRight, Clock
} from "lucide-react";
import { useModelStore } from "../store/use-model-store";
import { MODELS } from "../config/models";
import { useState, useRef, useEffect } from "react";

export default function Home() {
  const {
    selectedModel, setSelectedModel,
    config, setConfig,
    prompt, setPrompt,
    isGenerating, setGenerating,
    generatedImageUrl, setImage,
    history, addToHistory
  } = useModelStore();

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [selectedHistory, setSelectedHistory] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const autoResize = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  };

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;
    setGenerating(true);
    setImage(null);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: selectedModel.id, prompt, parameters: config }),
      });

      const data = await response.json();
      if (data.url) {
        setImage(data.url);
        addToHistory({ url: data.url, prompt, model: selectedModel.name });
      } else {
        alert(data.error || "Generation failed");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  const displayUrl = selectedHistory
    ? history.find(h => h.id === selectedHistory)?.url ?? generatedImageUrl
    : generatedImageUrl;

  const displayPrompt = selectedHistory
    ? history.find(h => h.id === selectedHistory)?.prompt ?? prompt
    : prompt;

  return (
    <div className="studio-root">
      {/* ── HEADER ── */}
      <header className="studio-header">
        <div className="header-brand">
          <div className="brand-icon">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div className="brand-text">
            <span className="brand-name">KIE STUDIO</span>
            <span className="brand-sub">Elite Edition</span>
          </div>
        </div>

        <div className="header-actions">
          <button
            onClick={() => { setHistoryOpen(!historyOpen); setSettingsOpen(false); }}
            className={`header-btn ${historyOpen ? "header-btn--active" : ""}`}
          >
            <History className="w-4 h-4" />
            <span className="header-btn-label">History</span>
            {history.length > 0 && (
              <span className="history-badge">{history.length}</span>
            )}
          </button>
          <button
            onClick={() => { setSettingsOpen(!settingsOpen); setHistoryOpen(false); }}
            className={`header-btn ${settingsOpen ? "header-btn--active" : ""}`}
          >
            <Sliders className="w-4 h-4" />
            <span className="header-btn-label">Settings</span>
          </button>
        </div>
      </header>

      {/* ── SETTINGS PANEL (slide down) ── */}
      <AnimatePresence>
        {settingsOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="settings-panel"
          >
            <div className="settings-inner">
              {/* Model Selector */}
              <div className="settings-section">
                <p className="settings-label">Neural Engine</p>
                <div className="model-grid">
                  {MODELS.map((model) => (
                    <button
                      key={model.id}
                      onClick={() => setSelectedModel(model.id)}
                      className={`model-card ${selectedModel.id === model.id ? "model-card--active" : ""}`}
                    >
                      <span className="model-card-name">{model.name}</span>
                      <span className="model-card-desc">{model.description}</span>
                      {selectedModel.id === model.id && (
                        <motion.div layoutId="model-dot" className="model-dot" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Parameters */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedModel.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="settings-section"
                >
                  <p className="settings-label">Parameters</p>
                  <div className="params-grid">
                    {selectedModel.parameters.map((param) => (
                      <div key={param.id} className="param-item">
                        <div className="param-header">
                          <span className="param-label">{param.label}</span>
                          <span className="param-value">{config[param.id]}</span>
                        </div>
                        {param.type === "slider" && (
                          <input
                            type="range"
                            min={param.min}
                            max={param.max}
                            step={param.step || 1}
                            value={config[param.id]}
                            onChange={(e) => setConfig(param.id, Number(e.target.value))}
                            className="param-slider"
                          />
                        )}
                        {param.type === "select" && (
                          <div className="param-select-wrap">
                            <select
                              value={config[param.id]}
                              onChange={(e) => setConfig(param.id, e.target.value)}
                              className="param-select"
                            >
                              {param.options?.map((opt) => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                              ))}
                            </select>
                            <ChevronDown className="param-select-icon" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── HISTORY PANEL ── */}
      <AnimatePresence>
        {historyOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="history-panel"
          >
            {history.length === 0 ? (
              <div className="history-empty">
                <Clock className="w-5 h-5 opacity-30" />
                <span>No generations yet</span>
              </div>
            ) : (
              <div className="history-track">
                {history.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setSelectedHistory(selectedHistory === item.id ? null : item.id);
                      setHistoryOpen(false);
                    }}
                    className={`history-card ${selectedHistory === item.id ? "history-card--active" : ""}`}
                  >
                    <img src={item.url} alt={item.prompt} className="history-thumb" />
                    <div className="history-card-info">
                      <span className="history-card-model">{item.model}</span>
                      <span className="history-card-prompt">{item.prompt.slice(0, 40)}…</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── MAIN CANVAS ── */}
      <main className="studio-canvas">
        {/* Ambient background */}
        <div className="canvas-ambient" />

        <AnimatePresence mode="wait">
          {isGenerating ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="canvas-state"
            >
              <div className="loader-ring">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  className="loader-spinner"
                />
                <Sparkles className="w-8 h-8 text-indigo-400 animate-pulse" />
              </div>
              <div className="loader-text">
                <h2>Synthesizing</h2>
                <p>Neural grid processing…</p>
              </div>
            </motion.div>
          ) : displayUrl ? (
            <motion.div
              key="image"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="canvas-image-wrap"
            >
              {/* Glow halo */}
              <div className="image-halo" />
              <img
                src={displayUrl}
                alt="Generated"
                className="canvas-image"
              />
              {/* Image actions */}
              <div className="image-actions">
                <button
                  onClick={() => window.open(displayUrl!)}
                  className="img-btn"
                  title="Download"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button className="img-btn" title="Share">
                  <Share2 className="w-4 h-4" />
                </button>
                {selectedHistory && (
                  <button
                    onClick={() => setSelectedHistory(null)}
                    className="img-btn"
                    title="Back to latest"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              {/* Prompt overlay */}
              {displayPrompt && (
                <div className="image-prompt-overlay">
                  <span>{displayPrompt}</span>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="canvas-empty"
            >
              <div className="empty-icon">
                <ImageIcon className="w-12 h-12 text-zinc-600" />
              </div>
              <p className="empty-text">Describe your vision below</p>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* ── HISTORY STRIP (horizontal gallery, always visible if history exists) ── */}
      {history.length > 0 && !historyOpen && (
        <div className="history-strip">
          <div className="history-strip-track">
            {history.map((item) => (
              <button
                key={item.id}
                onClick={() => setSelectedHistory(selectedHistory === item.id ? null : item.id)}
                className={`strip-thumb ${selectedHistory === item.id ? "strip-thumb--active" : ""}`}
                title={item.prompt}
              >
                <img src={item.url} alt="" className="strip-img" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── PROMPT BAR ── */}
      <div className="prompt-bar-wrap">
        <div className="prompt-bar">
          <textarea
            ref={textareaRef}
            value={prompt}
            onChange={(e) => { setPrompt(e.target.value); autoResize(); }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleGenerate();
            }}
            placeholder="Describe your vision…"
            rows={1}
            className="prompt-input"
          />
          <div className="prompt-footer">
            <div className="prompt-meta">
              <span className="prompt-model-tag">
                <Zap className="w-3 h-3" /> {selectedModel.name}
              </span>
              <span className="prompt-hint">⌘↵ to generate</span>
            </div>
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="generate-btn"
            >
              {isGenerating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  <span>Generate</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
