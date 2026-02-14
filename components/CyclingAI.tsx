
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Send, Globe, BookOpen, Loader2, Key, AlertCircle, MousePointer2, ExternalLink, HelpCircle, Settings, CheckCircle, Info, RefreshCw } from 'lucide-react';

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
  const [hasKey, setHasKey] = useState<boolean | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const welcome = mode === 'pcs' 
      ? '¡Radio Tour activa! 🎙️ Estoy listo para buscar datos en tiempo real. (Requiere Facturación en Google Cloud)'
      : 'Biblioteca Frikis abierta. 📚 Modo consulta histórica activo (No requiere facturación).';
    setMessages([{ role: 'bot', text: welcome }]);
    
    checkApiKey();
  }, [mode]);

  const checkApiKey = async () => {
    try {
      // @ts-ignore
      if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
        // @ts-ignore
        const active = await window.aistudio.hasSelectedApiKey();
        setHasKey(active);
      } else {
        const isConfigured = !!process.env.API_KEY && process.env.API_KEY !== "undefined";
        setHasKey(isConfigured);
      }
    } catch (e) {
      setHasKey(false);
    }
  };

  useEffect(() => {
    if (hasKey === true) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [hasKey]);

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
        // Asumimos éxito para permitir que el usuario intente escribir
        setHasKey(true); 
      } catch (e) {
        console.error(e);
      }
    } else {
      setHasKey(true);
    }
  };

  const handleSend = async () => {
    const userText = input.trim();
    if (!userText || loading) return;

    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setLoading(true);

    try {
      const apiKey = process.env.API_KEY;
      if (!apiKey || apiKey === "undefined") {
        throw new Error("No se detecta API Key. Por favor, selecciónala en el botón superior derecho.");
      }

      const ai = new GoogleGenAI({ apiKey });
      
      // Configuración según el modo
      const config: any = {
        systemInstruction: mode === 'pcs' 
          ? 'Eres el coche de Radio Tour. Busca resultados en Procyclingstats de hoy. Sé breve.' 
          : 'Eres el historiador de la Liga Frikis. No uses búsqueda web, usa tu conocimiento interno.',
      };

      // Solo añadimos herramientas si estamos en modo PCS
      if (mode === 'pcs') {
        config.tools = [{ googleSearch: {} }];
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: userText,
        config: config,
      });

      const botText = response.text || "Señal de Radio Tour interrumpida...";
      const sources: { uri: string; title: string }[] = [];
      
      // Extraer fuentes si existen (Grounding)
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      if (chunks) {
        chunks.forEach((c: any) => {
          if (c.web?.uri) sources.push({ uri: c.web.uri, title: c.web.title || 'Ver fuente' });
        });
      }

      setMessages(prev => [...prev, { role: 'bot', text: botText, sources }]);
    } catch (error: any) {
      console.error("AI Error:", error);
      let errorMessage = "❌ Error de conexión.";
      
      if (error.message?.includes("facturación") || error.message?.includes("Search") || error.message?.includes("404") || error.message?.includes("entity")) {
        errorMessage = mode === 'pcs' 
          ? "❌ Error de Búsqueda Web: Google Search requiere que tu proyecto sea 'Paid' (con facturación activa). Prueba el modo 'Enciclopedia' que no necesita esto."
          : "❌ Error del modelo: El modelo no está disponible con esta configuración.";
      } else if (error.message?.includes("API_KEY") || error.message?.includes("key")) {
        errorMessage = "❌ Llave API no válida o no detectada. Pulsa arriba en 'Key'.";
        setHasKey(false);
      } else {
        errorMessage = `❌ Error técnico: ${error.message}`;
      }

      setMessages(prev => [...prev, { role: 'bot', text: errorMessage, isError: true }]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  // Pantalla de carga inicial
  if (hasKey === null) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-slate-950 p-10">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-4" />
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Sincronizando con Velogames...</p>
      </div>
    );
  }

  // Pantalla de configuración / ayuda
  if (hasKey === false) {
    return (
      <div className="flex flex-col w-full h-full bg-slate-950 text-white p-6 overflow-y-auto">
        <div className="max-w-md mx-auto space-y-6 py-8">
          <div className="text-center space-y-3">
            <div className="inline-flex p-3 bg-blue-500/10 rounded-full border border-blue-500/20 text-blue-500 mb-2">
              <Key className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-black uppercase italic tracking-tighter">Conexión IA</h2>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Si el icono de la 🔑 arriba a la derecha ya NO está tachado, tu llave está lista. Pulsa entrar para activar el chat.
            </p>
          </div>

          <div className="grid gap-4">
            <button 
              onClick={() => setHasKey(true)}
              className="w-full py-5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black uppercase italic tracking-widest transition-all shadow-xl shadow-emerald-900/30 active:scale-95 flex items-center justify-center gap-3 border-b-4 border-emerald-800"
            >
              <CheckCircle className="w-6 h-6" /> Entrar al Chat
            </button>

            <div className="bg-slate-900 border border-white/10 rounded-2xl p-5 space-y-3">
              <h3 className="text-[10px] font-black text-amber-400 uppercase tracking-widest flex items-center gap-2">
                <Info className="w-4 h-4" /> Importante: Facturación
              </h3>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                El modo <strong>Radio Tour</strong> usa Google Search y falla si tu proyecto de Google Cloud no tiene facturación. Si te da error, intenta usar la <strong>Enciclopedia</strong>, que debería funcionar siempre.
              </p>
            </div>

            <button 
              onClick={handleOpenKey}
              className="w-full py-3 bg-white/5 hover:bg-white/10 text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/5 transition-all"
            >
              Cambiar Proyecto / Key
            </button>
          </div>
          
          <button onClick={onClose} className="w-full py-2 text-slate-600 hover:text-slate-400 text-[9px] font-bold uppercase transition-all">
            Volver al Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-full bg-slate-950 text-white overflow-hidden md:rounded-3xl border border-white/10 shadow-2xl">
      {/* HEADER */}
      <div className={`shrink-0 p-5 pt-16 md:pt-5 border-b border-white/10 flex items-center justify-between ${mode === 'pcs' ? 'bg-blue-900' : 'bg-amber-900'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/10 rounded-xl">
            {mode === 'pcs' ? <Globe className="w-5 h-5" /> : <BookOpen className="w-5 h-5" />}
          </div>
          <div>
            <h2 className="text-[10px] font-black uppercase tracking-widest leading-none">{mode === 'pcs' ? 'Radio Tour' : 'Enciclopedia'}</h2>
            <span className="text-[8px] text-white/50 uppercase font-bold tracking-tighter">Liga Frikis IA</span>
          </div>
        </div>
        <div className="flex gap-2">
           <button 
            onClick={() => setMessages([{role: 'bot', text: 'Chat reiniciado.'}])}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all"
            title="Limpiar chat"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <button 
            onClick={handleOpenKey}
            className="flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-[10px] font-black uppercase transition-all"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* CHAT AREA */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-4 rounded-2xl text-sm ${
              m.role === 'user' 
                ? 'bg-blue-600 shadow-lg shadow-blue-900/40 font-medium' 
                : m.isError 
                  ? 'bg-red-950/60 border border-red-500/50 text-red-200'
                  : 'bg-slate-900 border border-white/10 shadow-xl'
            }`}>
              <div className="whitespace-pre-wrap leading-relaxed">
                {m.text}
              </div>
              
              {m.sources && m.sources.length > 0 && (
                <div className="mt-4 pt-3 border-t border-white/10">
                  <p className="text-[8px] font-black uppercase text-slate-500 mb-2 tracking-widest">Fuentes Procyclingstats:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {m.sources.map((s, idx) => (
                      <a key={idx} href={s.uri} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-2 py-1 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-[9px] font-bold rounded-md transition-all border border-blue-500/10">
                        <ExternalLink className="w-2.5 h-2.5" /> {s.title}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-900/80 backdrop-blur-sm p-4 rounded-2xl border border-white/5 flex items-center gap-3">
              <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
              <span className="text-[10px] font-black text-slate-500 uppercase italic tracking-widest">Escaneando resultados...</span>
            </div>
          </div>
        )}
      </div>

      {/* INPUT */}
      <div className="p-4 bg-slate-950 border-t border-white/10 pb-10 md:pb-6">
        <div className="flex gap-2 max-w-4xl mx-auto">
          <input 
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={mode === 'pcs' ? "Pregunta por la carrera de hoy..." : "Pide un dato histórico..."}
            className="flex-1 bg-slate-900 border border-white/10 rounded-xl py-4 px-5 text-sm focus:outline-none focus:border-blue-500/50 transition-all text-white placeholder:text-slate-600"
          />
          <button 
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="bg-white text-black p-4 rounded-xl active:scale-95 disabled:opacity-20 transition-all hover:bg-blue-500 hover:text-white shadow-xl shadow-blue-500/5"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <p className="text-center text-[8px] text-slate-600 mt-3 uppercase font-black tracking-[0.2em]">
          Powered by Gemini 3 Flash • Liga Frikis 2026
        </p>
      </div>
    </div>
  );
};

export default CyclingAI;
