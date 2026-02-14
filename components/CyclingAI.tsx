
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Send, Globe, BookOpen, Loader2, Key, ExternalLink, Settings, AlertTriangle, RefreshCw } from 'lucide-react';

interface CyclingAIProps {
  mode: 'pcs' | 'encyclopedia';
  onClose: () => void;
}

type Message = {
  role: 'user' | 'bot';
  text: string;
  sources?: { uri: string; title: string }[];
  isError?: boolean;
};

const CyclingAI: React.FC<CyclingAIProps> = ({ mode, onClose }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const welcome = mode === 'pcs' 
      ? '¡Radio Tour activa! 🎙️ Si tienes la llave configurada arriba, puedo buscar datos en vivo.'
      : 'Biblioteca Frikis abierta. 📚 ¿Qué curiosidad histórica del ciclismo tienes hoy?';
    
    setMessages([{ role: 'bot', text: welcome }]);
    setTimeout(() => inputRef.current?.focus(), 500);
  }, [mode]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, loading]);

  const triggerKeySelection = async () => {
    // @ts-ignore
    if (window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
      try {
        // @ts-ignore
        await window.aistudio.openSelectKey();
      } catch (e) {
        console.error("No se pudo abrir el selector", e);
      }
    }
  };

  const handleSend = async () => {
    const userText = input.trim();
    if (!userText || loading) return;

    const apiKey = process.env.API_KEY;

    if (!apiKey || apiKey === "undefined") {
      setMessages(prev => [...prev, { 
        role: 'user', 
        text: userText 
      }, { 
        role: 'bot', 
        text: "⚠️ NO SE DETECTA LLAVE API: Por favor, asegúrate de haber seleccionado una llave en el icono 🔑 arriba a la derecha de esta ventana (en la barra de herramientas del editor).", 
        isError: true 
      }]);
      setInput('');
      return;
    }

    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setLoading(true);

    try {
      // Creamos la instancia justo antes de usarla para capturar la última llave inyectada
      const ai = new GoogleGenAI({ apiKey });
      
      const config: any = {
        systemInstruction: mode === 'pcs' 
          ? 'Eres el coche de Radio Tour. Responde de forma muy breve y profesional sobre ciclismo actual.' 
          : 'Eres el historiador de la Liga Frikis. Usa un tono épico y detallado sobre historia del ciclismo.',
      };

      if (mode === 'pcs') {
        config.tools = [{ googleSearch: {} }];
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: userText,
        config: config,
      });

      const botText = response.text || "La señal se ha cortado... (Sin respuesta)";
      const sources: { uri: string; title: string }[] = [];
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      
      if (chunks) {
        chunks.forEach((c: any) => {
          if (c.web?.uri) sources.push({ uri: c.web.uri, title: c.web.title || 'Referencia' });
        });
      }

      setMessages(prev => [...prev, { role: 'bot', text: botText, sources }]);
    } catch (error: any) {
      console.error("AI Error:", error);
      let msg = "❌ Error de conexión.";
      
      if (error.message?.includes("API Key") || error.message?.includes("key")) {
        msg = "❌ Error: La llave API no es válida o no tiene permisos. Prueba a re-seleccionarla en el icono 🔑 superior.";
      } else if (error.message?.includes("entity") || error.message?.includes("not found")) {
        msg = "❌ Error de proyecto: Asegúrate de usar un proyecto con facturación activa para usar Google Search.";
      } else {
        msg = `❌ Error: ${error.message}`;
      }
      
      setMessages(prev => [...prev, { role: 'bot', text: msg, isError: true }]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  return (
    <div className="flex flex-col w-full h-full bg-slate-950 text-white overflow-hidden md:rounded-3xl border border-white/10 shadow-2xl">
      {/* HEADER */}
      <div className={`shrink-0 p-5 pt-16 md:pt-5 border-b border-white/10 flex items-center justify-between ${mode === 'pcs' ? 'bg-blue-900/40' : 'bg-amber-900/40'} backdrop-blur-md`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/10 rounded-xl">
            {mode === 'pcs' ? <Globe className="w-5 h-5" /> : <BookOpen className="w-5 h-5" />}
          </div>
          <div>
            <h2 className="text-[10px] font-black uppercase tracking-widest">{mode === 'pcs' ? 'Radio Tour Live' : 'Enciclopedia Frikis'}</h2>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[8px] text-emerald-400 font-bold uppercase tracking-tighter">Sincronizado</span>
            </div>
          </div>
        </div>
        <button 
          onClick={triggerKeySelection}
          className="group flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-all active:scale-95"
          title="Configurar Llave"
        >
          <Key className="w-3.5 h-3.5 text-slate-400 group-hover:text-white" />
          <span className="text-[9px] font-black uppercase hidden sm:inline">Config</span>
        </button>
      </div>

      {/* CHAT AREA */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-4 rounded-2xl text-sm shadow-xl ${
              m.role === 'user' 
                ? 'bg-blue-600 font-bold shadow-blue-900/20' 
                : m.isError 
                  ? 'bg-red-950/40 border border-red-500/30 text-red-200' 
                  : 'bg-slate-900/90 border border-white/5'
            }`}>
              <div className="whitespace-pre-wrap">{m.text}</div>
              
              {m.sources && m.sources.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5 border-t border-white/10 pt-3">
                  {m.sources.map((s, idx) => (
                    <a key={idx} href={s.uri} target="_blank" rel="noopener noreferrer" className="text-[9px] font-black text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-md hover:bg-blue-500/20 transition-colors border border-blue-500/10">
                      {s.title}
                    </a>
                  ))}
                </div>
              )}

              {m.isError && (
                <button 
                  onClick={triggerKeySelection}
                  className="mt-3 flex items-center gap-2 text-[10px] font-black uppercase text-white bg-red-600 px-3 py-2 rounded-lg hover:bg-red-500 transition-colors"
                >
                  <Key className="w-3 h-3" /> Abrir Selector de Llave
                </button>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-900/80 backdrop-blur-sm p-4 rounded-2xl border border-white/5 flex items-center gap-3">
              <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
              <span className="text-[10px] font-black text-slate-400 uppercase italic">Conectando con Procyclingstats...</span>
            </div>
          </div>
        )}
      </div>

      {/* INPUT BAR */}
      <div className="p-4 bg-slate-950 border-t border-white/10 pb-10 md:pb-6">
        <div className="flex gap-2 max-w-4xl mx-auto">
          <input 
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={mode === 'pcs' ? "Pregunta por Pogacar, Vingegaard..." : "Dime el ganador del Tour de 1998..."}
            className="flex-1 bg-slate-900 border border-white/10 rounded-xl py-4 px-5 text-sm focus:outline-none focus:border-blue-500 text-white placeholder:text-slate-600 transition-all"
          />
          <button 
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="bg-white text-black p-4 rounded-xl active:scale-95 disabled:opacity-20 transition-all hover:bg-blue-500 hover:text-white shadow-xl"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <div className="mt-3 flex items-center justify-center gap-2">
           <AlertTriangle className="w-2.5 h-2.5 text-slate-700" />
           <p className="text-[8px] text-slate-600 uppercase font-black tracking-[0.2em]">
             Sistema Experimental de IA • Liga Frikis 2026
           </p>
        </div>
      </div>
    </div>
  );
};

export default CyclingAI;
