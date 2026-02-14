
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Send, Globe, BookOpen, Loader2, Key, Settings, AlertTriangle, ShieldCheck } from 'lucide-react';

interface CyclingAIProps {
  mode: 'pcs' | 'encyclopedia';
  onClose: () => void;
}

type Message = {
  role: 'user' | 'bot';
  text: string;
  sources?: { uri: string; title: string }[];
  isError?: boolean;
  needsKey?: boolean;
};

const CyclingAI: React.FC<CyclingAIProps> = ({ mode, onClose }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Al montar, comprobamos si ya hay una llave seleccionada
  useEffect(() => {
    const checkKey = async () => {
      // @ts-ignore
      if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
        // @ts-ignore
        const hasKey = await window.aistudio.hasSelectedApiKey();
        if (hasKey) setIsReady(true);
      } else {
        // Si no estamos en el entorno que soporta el método, asumimos que la llave vendrá por env
        setIsReady(true);
      }
    };
    checkKey();

    const welcome = mode === 'pcs' 
      ? '¡Radio Tour activa! 🎙️ Conectado a Procyclingstats. ¿Qué quieres saber sobre la carrera?'
      : 'Biblioteca Frikis abierta. 📚 Pregúntame sobre cualquier hito histórico del ciclismo.';
    
    setMessages([{ role: 'bot', text: welcome }]);
  }, [mode]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, loading]);

  useEffect(() => {
    if (isReady) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isReady]);

  const handleOpenKeySelector = async () => {
    // @ts-ignore
    if (window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
      try {
        // @ts-ignore
        await window.aistudio.openSelectKey();
        // Según las reglas: asumir éxito tras llamar al selector
        setIsReady(true);
      } catch (e) {
        console.error("Error abriendo selector:", e);
        setIsReady(true); 
      }
    } else {
      setIsReady(true);
    }
  };

  const handleSend = async () => {
    const userText = input.trim();
    if (!userText || loading) return;

    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setLoading(true);

    try {
      // Creamos la instancia en el momento del envío para capturar la última llave
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      
      const config: any = {
        systemInstruction: mode === 'pcs' 
          ? 'Eres el coche de Radio Tour. Da respuestas muy cortas y directas sobre datos de ciclismo actual.' 
          : 'Eres el historiador de la Liga Frikis. Usa un tono épico para contar historias del ciclismo.',
      };

      if (mode === 'pcs') {
        config.tools = [{ googleSearch: {} }];
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: userText,
        config: config,
      });

      const botText = response.text || "Se ha perdido la conexión con el satélite...";
      const sources: { uri: string; title: string }[] = [];
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      
      if (chunks) {
        chunks.forEach((c: any) => {
          if (c.web?.uri) sources.push({ uri: c.web.uri, title: c.web.title || 'Referencia' });
        });
      }

      setMessages(prev => [...prev, { role: 'bot', text: botText, sources }]);
    } catch (error: any) {
      console.error("Critical AI Error:", error);
      
      let errorMsg = "❌ Ha ocurrido un error.";
      let needsKey = false;

      if (error.message?.includes("API Key") || error.message?.includes("key") || error.message?.includes("403")) {
        errorMsg = "⚠️ LA LLAVE NO ESTÁ VINCULADA: Aunque la hayas seleccionado en el sistema, necesito que confirmes la vinculación para el chat.";
        needsKey = true;
      } else {
        errorMsg = `❌ Error de sistema: ${error.message}`;
      }
      
      setMessages(prev => [...prev, { role: 'bot', text: errorMsg, isError: true, needsKey }]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  // Pantalla de Vinculación Inicial (Si no se detecta llave)
  if (!isReady) {
    return (
      <div className="flex flex-col w-full h-full bg-slate-950 text-white p-8 items-center justify-center text-center">
        <div className="max-w-sm space-y-6">
          <div className="relative">
             <div className="absolute inset-0 bg-blue-500 blur-3xl opacity-20 animate-pulse"></div>
             <div className="relative p-6 bg-slate-900 rounded-3xl border border-blue-500/30">
               <Key className="w-12 h-12 text-blue-500 mx-auto" />
             </div>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black uppercase italic tracking-tighter italic">Radio Tour</h2>
            <p className="text-slate-400 text-xs font-bold leading-relaxed">
              Para acceder a la base de datos de <span className="text-white">Procyclingstats</span> y la <span className="text-white">Enciclopedia</span>, debes vincular tu API Key de Velogames.
            </p>
          </div>
          <button 
            onClick={handleOpenKeySelector}
            className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black uppercase italic tracking-widest transition-all shadow-xl shadow-blue-900/40 active:scale-95 border-b-4 border-blue-800"
          >
            Vincular Llave API
          </button>
          <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest">
            Recomendado: Proyecto con facturación activa
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-full bg-slate-950 text-white overflow-hidden md:rounded-3xl border border-white/10 shadow-2xl">
      {/* HEADER */}
      <div className={`shrink-0 p-5 pt-16 md:pt-5 border-b border-white/10 flex items-center justify-between ${mode === 'pcs' ? 'bg-blue-600/20' : 'bg-amber-600/20'} backdrop-blur-xl`}>
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl ${mode === 'pcs' ? 'bg-blue-500/20 text-blue-400' : 'bg-amber-500/20 text-amber-400'}`}>
            {mode === 'pcs' ? <Globe className="w-5 h-5" /> : <BookOpen className="w-5 h-5" />}
          </div>
          <div>
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em]">{mode === 'pcs' ? 'Radio Tour Live' : 'Enciclopedia'}</h2>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3 h-3 text-emerald-500" />
              <span className="text-[8px] text-emerald-400 font-bold uppercase">Sincronizado</span>
            </div>
          </div>
        </div>
        <button 
          onClick={handleOpenKeySelector}
          className="p-2 bg-white/5 hover:bg-white/10 rounded-lg border border-white/5 transition-all active:scale-95"
          title="Cambiar Llave"
        >
          <Settings className="w-4 h-4 text-slate-400" />
        </button>
      </div>

      {/* MESSAGES */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-4 rounded-2xl text-sm ${
              m.role === 'user' ? 'bg-blue-600 font-bold shadow-xl shadow-blue-900/20' : 
              m.isError ? 'bg-red-950/30 border border-red-500/30 text-red-100' : 'bg-slate-900 border border-white/5 shadow-2xl'
            }`}>
              <div className="whitespace-pre-wrap">{m.text}</div>
              
              {m.sources && m.sources.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-1.5 border-t border-white/10 pt-3">
                  {m.sources.map((s, idx) => (
                    <a key={idx} href={s.uri} target="_blank" rel="noopener noreferrer" className="text-[9px] font-black text-blue-400 bg-blue-400/10 px-2 py-1 rounded hover:bg-blue-400/20 transition-colors">
                      {s.title}
                    </a>
                  ))}
                </div>
              )}

              {m.needsKey && (
                <button 
                  onClick={handleOpenKeySelector}
                  className="mt-4 w-full py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl font-black uppercase text-[10px] tracking-widest transition-all shadow-lg active:scale-95"
                >
                  Confirmar Selección de Llave
                </button>
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

      {/* INPUT */}
      <div className="p-4 bg-slate-950 border-t border-white/10 pb-10 md:pb-6">
        <div className="flex gap-2">
          <input 
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Dime algo..."
            className="flex-1 bg-slate-900 border border-white/10 rounded-xl py-4 px-5 text-sm focus:outline-none focus:border-blue-500 text-white placeholder:text-slate-700"
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
