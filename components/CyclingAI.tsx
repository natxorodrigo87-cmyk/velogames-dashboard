
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Send, Globe, BookOpen, Loader2, Key, ExternalLink, Settings, CheckCircle, RefreshCw } from 'lucide-react';

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
  const [hasEntered, setHasEntered] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const welcome = mode === 'pcs' 
      ? '¡Radio Tour activa! 🎙️ Escribe tu duda sobre la carrera de hoy.'
      : 'Biblioteca Frikis abierta. 📚 ¿Qué dato histórico necesitas?';
    setMessages([{ role: 'bot', text: welcome }]);
  }, [mode]);

  useEffect(() => {
    if (hasEntered) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [hasEntered]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, loading]);

  const handleOpenKey = async () => {
    // @ts-ignore
    if (window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
      try {
        // @ts-ignore
        await window.aistudio.openSelectKey();
        setHasEntered(true); 
      } catch (e) {
        setHasEntered(true); // Entramos de todos modos
      }
    } else {
      setHasEntered(true);
    }
  };

  const handleSend = async () => {
    const userText = input.trim();
    if (!userText || loading) return;

    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setLoading(true);

    try {
      // Usamos la llave tal cual venga inyectada, sin comprobaciones previas manuales
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      
      const config: any = {
        systemInstruction: mode === 'pcs' 
          ? 'Eres el coche de Radio Tour. Responde breve con datos actuales.' 
          : 'Eres el historiador de la Liga Frikis. Responde con épica.',
      };

      if (mode === 'pcs') {
        config.tools = [{ googleSearch: {} }];
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: userText,
        config: config,
      });

      const botText = response.text || "Sin respuesta...";
      const sources: { uri: string; title: string }[] = [];
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      if (chunks) {
        chunks.forEach((c: any) => {
          if (c.web?.uri) sources.push({ uri: c.web.uri, title: c.web.title || 'Referencia' });
        });
      }

      setMessages(prev => [...prev, { role: 'bot', text: botText, sources }]);
    } catch (error: any) {
      console.error("Error directo:", error);
      let errorMsg = "❌ No he podido conectar.";
      
      if (error.message?.includes("entity") || error.message?.includes("404")) {
        errorMsg = "❌ Error de permisos o facturación en el proyecto seleccionado.";
      } else if (error.message?.includes("API_KEY")) {
        errorMsg = "❌ La llave no es válida. Re-selecciónala arriba en 'Key'.";
      } else {
        errorMsg = `❌ Error: ${error.message}`;
      }
      
      setMessages(prev => [...prev, { role: 'bot', text: errorMsg, isError: true }]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  // Pantalla de bienvenida / Bypass
  if (!hasEntered) {
    return (
      <div className="flex flex-col w-full h-full bg-slate-950 text-white p-6 items-center justify-center">
        <div className="max-w-xs w-full space-y-8 text-center">
          <div className="space-y-2">
            <div className="inline-flex p-4 bg-blue-500/10 rounded-3xl border border-blue-500/20 text-blue-500 mb-2">
              <Key className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black uppercase italic italic tracking-tighter">Radio Tour</h2>
            <p className="text-slate-500 text-[11px] leading-relaxed uppercase font-bold tracking-widest">
              Conexión Velogames
            </p>
          </div>

          <button 
            onClick={() => setHasEntered(true)}
            className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black uppercase italic tracking-widest transition-all shadow-xl shadow-blue-900/40 active:scale-95 border-b-4 border-blue-800"
          >
            Abrir Chat
          </button>

          <button 
            onClick={handleOpenKey}
            className="text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-colors"
          >
            Re-seleccionar Proyecto
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-full bg-slate-950 text-white overflow-hidden md:rounded-3xl border border-white/10 shadow-2xl">
      {/* HEADER */}
      <div className={`shrink-0 p-5 pt-16 md:pt-5 border-b border-white/10 flex items-center justify-between ${mode === 'pcs' ? 'bg-blue-900/80' : 'bg-amber-900/80'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/10 rounded-xl">
            {mode === 'pcs' ? <Globe className="w-5 h-5" /> : <BookOpen className="w-5 h-5" />}
          </div>
          <div>
            <h2 className="text-[10px] font-black uppercase tracking-widest">{mode === 'pcs' ? 'Radio Tour' : 'Enciclopedia'}</h2>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[8px] text-emerald-400 font-bold uppercase">Online</span>
            </div>
          </div>
        </div>
        <button 
          onClick={handleOpenKey}
          className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>

      {/* CHAT */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-4 rounded-2xl text-sm ${
              m.role === 'user' ? 'bg-blue-600 font-bold' : 
              m.isError ? 'bg-red-950/80 border border-red-500/50 text-red-200' : 'bg-slate-900 border border-white/5 shadow-xl'
            }`}>
              {m.text}
              {m.sources && m.sources.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1 border-t border-white/5 pt-3">
                  {m.sources.map((s, idx) => (
                    <a key={idx} href={s.uri} target="_blank" rel="noopener noreferrer" className="text-[8px] font-bold text-blue-400 bg-blue-400/10 px-2 py-1 rounded flex items-center gap-1">
                      {s.title}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-900 p-4 rounded-2xl border border-white/5 flex items-center gap-3">
              <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
              <span className="text-[10px] font-black text-slate-500 uppercase italic">Conectando...</span>
            </div>
          </div>
        )}
      </div>

      {/* BARRA ESCRIBIR */}
      <div className="p-4 bg-slate-950 border-t border-white/10 pb-10 md:pb-6">
        <div className="flex gap-2">
          <input 
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Escribe tu mensaje aquí..."
            className="flex-1 bg-slate-900 border border-white/10 rounded-xl py-4 px-5 text-sm focus:outline-none focus:border-blue-500 text-white"
          />
          <button 
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="bg-white text-black p-4 rounded-xl active:scale-95 disabled:opacity-20 transition-all hover:bg-blue-500 hover:text-white"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CyclingAI;
