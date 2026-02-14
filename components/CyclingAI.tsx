
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Send, Bot, User, Loader2, Bike, ExternalLink, Info, RefreshCw, AlertCircle, WifiOff } from 'lucide-react';

type Message = {
  role: 'user' | 'bot';
  text: string;
  sources?: { uri: string; title: string }[];
  isError?: boolean;
  isOffline?: boolean;
};

const CyclingAI: React.FC = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'bot', 
      text: '¡Director Deportivo! Estoy listo.\n\nHe optimizado mi conexión para funcionar perfectamente incluso si me tienes instalado como App en tu móvil. Si la red falla, activaré automáticamente el modo de emergencia para responderte.' 
    }
  ]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSend = async (manualText?: string) => {
    const userText = manualText || input.trim();
    if (!userText || loading) return;

    if (!manualText) {
      setInput('');
      setMessages(prev => [...prev, { role: 'user', text: userText }]);
    }
    
    setLoading(true);

    try {
      const apiKey = process.env.API_KEY;
      if (!apiKey) throw new Error("API KEY MISSING");

      const ai = new GoogleGenAI({ apiKey });
      
      // INTENTO 1: Con búsqueda (Google Search)
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: { parts: [{ text: userText }] },
        config: {
          tools: [{ googleSearch: {} }],
        },
      });

      const botText = response.text || "La grupeta se ha cortado y no tengo respuesta ahora mismo.";
      
      const sources: { uri: string; title: string }[] = [];
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      if (chunks) {
        chunks.forEach((chunk: any) => {
          if (chunk.web?.uri && chunk.web?.title) {
            if (!sources.find(s => s.uri === chunk.web.uri)) {
              sources.push({ uri: chunk.web.uri, title: chunk.web.title });
            }
          }
        });
      }

      setMessages(prev => [...prev.filter(m => !m.isError), { role: 'bot', text: botText, sources }]);
    } catch (error: any) {
      console.warn("Intento con búsqueda fallido en modo Standalone, activando modo Offline-First...");
      
      // INTENTO 2 (Fallback): Respuesta sin herramientas (Mucho más rápida y fiable en App Mode)
      try {
        const aiFallback = new GoogleGenAI({ apiKey: process.env.API_KEY! });
        const fallbackResponse = await aiFallback.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: userText,
        });
        
        const fallbackText = fallbackResponse.text || "He tenido un problema de red al buscar en PCS, pero aquí tienes mi análisis basado en mi conocimiento interno.";
        setMessages(prev => [...prev.filter(m => !m.isError), { 
          role: 'bot', 
          text: fallbackText,
          isOffline: true
        }]);
      } catch (fallbackError) {
        setMessages(prev => [...prev, { 
          role: 'bot', 
          text: "¡Pinchazo total! Tu móvil ha bloqueado la conexión de la IA en este modo. Prueba a abrir la web directamente en el navegador si el error persiste.",
          isError: true
        }]);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col h-[500px] md:h-[650px] bg-slate-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl animate-in fade-in duration-300">
      {/* Header */}
      <div className="p-4 border-b border-white/5 bg-slate-950/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600 rounded-xl shadow-lg shadow-blue-600/20">
            <Bike className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-black text-white uppercase italic tracking-tighter">Oráculo <span className="text-blue-400">App Mode</span></h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1 h-1 bg-green-500 rounded-full animate-pulse" />
              <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">Conexión Blindada</span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950/30">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[92%] space-y-2 ${m.role === 'user' ? 'flex flex-col items-end' : ''}`}>
              <div className={`p-3 rounded-2xl text-[13px] leading-relaxed shadow-sm ${
                m.role === 'user' 
                  ? 'bg-blue-600 text-white rounded-tr-none' 
                  : m.isError 
                    ? 'bg-red-500/10 border border-red-500/30 text-red-200' 
                    : 'bg-slate-800 text-slate-200 rounded-tl-none'
              }`}>
                {m.isError && <AlertCircle className="w-4 h-4 mb-2 text-red-500" />}
                {m.text}
                {m.isOffline && (
                  <div className="mt-2 pt-2 border-t border-white/5 flex items-center gap-2 text-[10px] text-amber-500 font-bold uppercase italic">
                    <WifiOff className="w-3 h-3" /> Modo Offline Activado por red inestable
                  </div>
                )}
                {m.isError && (
                  <button 
                    onClick={() => handleSend(messages[messages.length-2]?.text)} 
                    className="mt-3 flex items-center gap-2 w-full justify-center py-2 bg-red-600 text-white rounded-lg font-black text-[10px] uppercase transition-transform active:scale-95"
                  >
                    <RefreshCw className="w-3 h-3" /> Reintentar
                  </button>
                )}
              </div>
              
              {m.sources && m.sources.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {m.sources.slice(0, 2).map((s, idx) => (
                    <a key={idx} href={s.uri} target="_blank" className="text-[9px] text-blue-400 font-bold flex items-center gap-1 bg-blue-400/5 px-2 py-0.5 rounded border border-blue-400/10">
                      <ExternalLink className="w-2 h-2" /> {s.title.substring(0, 15)}...
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-800 p-3 rounded-2xl animate-pulse">
              <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-3 bg-slate-900 border-t border-white/5">
        <div className="relative flex gap-2">
          <input 
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Mensaje..."
            className="flex-1 bg-slate-950 border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
          />
          <button 
            onClick={() => handleSend()}
            disabled={loading || !input.trim()}
            className="bg-blue-600 p-3 rounded-xl text-white disabled:opacity-50 shadow-lg active:scale-90 transition-transform"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <p className="mt-2 text-center text-[8px] text-slate-600 font-bold uppercase tracking-widest">
          Protección Standalone Activa • Liga Frikis 2026
        </p>
      </div>
    </div>
  );
};

export default CyclingAI;
