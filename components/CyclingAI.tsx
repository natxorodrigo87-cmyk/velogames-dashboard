
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Send, Globe, BookOpen, Database, Loader2, RefreshCw, Key, ShieldAlert } from 'lucide-react';

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
  const [status, setStatus] = useState<string>('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const welcome = mode === 'pcs' 
      ? '¡Radio Tour online! Usando datos de Google Search para la temporada 2026.'
      : 'Has accedido a los archivos históricos. ¿Qué leyenda del ciclismo quieres consultar?';
    setMessages([{ role: 'bot', text: welcome }]);
  }, [mode]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, loading]);

  const handleOpenKey = async () => {
    // @ts-ignore
    if (window.aistudio) {
      // @ts-ignore
      await window.aistudio.openSelectKey();
      setStatus('Reconectando...');
    }
  };

  const handleSend = async (manualText?: string) => {
    const userText = manualText || input.trim();
    if (!userText || loading) return;

    if (!manualText) {
      setInput('');
      setMessages(prev => [...prev, { role: 'user', text: userText }]);
    }
    
    setLoading(true);
    setStatus('Sintonizando Radio Tour...');

    try {
      // SIEMPRE crear instancia nueva para asegurar el API_KEY más reciente
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const modelName = 'gemini-3-flash-preview';

      const systemInstruction = mode === 'pcs'
        ? 'Eres el analista técnico de la Liga Frikis. Usa Google Search para extraer resultados actuales de procyclingstats.com.'
        : 'Eres el historiador de la Liga Frikis. Responde sobre ciclismo clásico con sabiduría.';

      let response;
      try {
        // Intento 1: Con herramientas (Google Search)
        response = await ai.models.generateContent({
          model: modelName,
          contents: userText,
          config: {
            systemInstruction,
            tools: mode === 'pcs' ? [{ googleSearch: {} }] : undefined,
          },
        });
      } catch (toolError: any) {
        // Fallback: Si el error es por herramientas o cuota, reintentar sin herramientas
        console.warn("Tool call failed, trying offline mode...", toolError);
        response = await ai.models.generateContent({
          model: modelName,
          contents: userText,
          config: { systemInstruction },
        });
      }

      const botText = response.text || "La señal es débil, intenta preguntar de nuevo.";
      const sources: { uri: string; title: string }[] = [];
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      
      if (chunks) {
        chunks.forEach((c: any) => {
          if (c.web?.uri) {
            sources.push({ uri: c.web.uri, title: c.web.title || 'Referencia' });
          }
        });
      }

      setMessages(prev => [
        ...prev.filter(m => !m.isError), 
        { role: 'bot', text: botText, sources: sources.length > 0 ? sources : undefined }
      ]);

    } catch (error: any) {
      console.error("AI CRITICAL ERROR:", error);
      const errorStr = error.toString().toLowerCase();
      
      // Captura agresiva de errores de clave/autorización
      const isKeyError = 
        errorStr.includes("not found") || 
        errorStr.includes("404") || 
        errorStr.includes("401") || 
        errorStr.includes("key") || 
        errorStr.includes("permission") ||
        errorStr.includes("forbidden");

      if (isKeyError) {
        handleOpenKey();
        setMessages(prev => [...prev, { 
          role: 'bot', 
          text: "¡ERROR DE CLAVE! No tienes una conexión segura activa con Google Cloud. He abierto el selector de llaves. Por favor, selecciona una llave válida.", 
          isError: true,
          needsKey: true
        }]);
      } else {
        setMessages(prev => [...prev, { 
          role: 'bot', 
          text: "¡PÁJARA DEL SERVIDOR! Error de red o cuota excedida. Por favor, reintenta en unos segundos.", 
          isError: true 
        }]);
      }
    } finally {
      setLoading(false);
      setStatus('');
    }
  };

  const isPcs = mode === 'pcs';

  return (
    <div className="flex flex-col w-full h-full bg-slate-950 text-white overflow-hidden md:rounded-3xl border border-white/10 shadow-2xl">
      {/* Header */}
      <div className={`shrink-0 p-5 pt-16 md:pt-5 border-b border-white/10 flex items-center justify-between ${isPcs ? 'bg-blue-600' : 'bg-amber-600'}`}>
        <div className="flex items-center gap-4">
          <div className="p-2.5 bg-white/20 rounded-2xl backdrop-blur-md">
            {isPcs ? <Globe className="w-5 h-5" /> : <BookOpen className="w-5 h-5" />}
          </div>
          <div>
            <h2 className="text-sm font-black uppercase italic tracking-tighter leading-none">
              {isPcs ? 'Radio Tour Live' : 'Biblioteca Frikis'}
            </h2>
            <div className="flex items-center gap-1.5 mt-1">
              <span className={`w-1.5 h-1.5 rounded-full ${loading ? 'bg-white animate-pulse' : 'bg-green-400'}`} />
              <span className="text-[9px] text-white/70 font-black uppercase tracking-widest leading-none">
                {loading ? status : 'En Línea'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] scroll-smooth">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
            <div className={`max-w-[90%] ${m.role === 'user' ? 'flex flex-col items-end' : ''}`}>
              <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-xl ${
                m.role === 'user' 
                  ? `${isPcs ? 'bg-blue-600' : 'bg-amber-600'} text-white rounded-tr-none border border-white/10` 
                  : m.isError 
                    ? 'bg-red-500/10 border border-red-500/30 text-red-200' 
                    : 'bg-slate-900/90 text-slate-200 border border-white/5 rounded-tl-none backdrop-blur-md'
              }`}>
                {m.text}
                
                {m.needsKey && (
                  <button 
                    onClick={handleOpenKey}
                    className="mt-4 flex items-center gap-3 w-full justify-center py-4 bg-white text-black rounded-xl font-black text-[10px] uppercase shadow-lg active:scale-95 transition-all"
                  >
                    <Key className="w-4 h-4" /> Activar Llave Google Cloud
                  </button>
                )}
              </div>
              
              {m.sources && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {m.sources.map((s, idx) => (
                    <a key={idx} href={s.uri} target="_blank" rel="noopener noreferrer"
                      className="text-[9px] text-blue-400 font-black flex items-center gap-1.5 bg-blue-500/10 px-3 py-2 rounded-lg border border-blue-500/20 uppercase tracking-tighter">
                      <Database className="w-3 h-3" /> {s.title}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-900/60 p-4 rounded-2xl border border-white/5 flex items-center gap-3 backdrop-blur-md">
              <Loader2 className={`w-4 h-4 animate-spin ${isPcs ? 'text-blue-500' : 'text-amber-500'}`} />
              <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{status}</span>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="shrink-0 p-4 bg-slate-950 border-t border-white/10 pb-12 md:pb-6 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
        <div className="flex gap-2">
          <input 
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={isPcs ? "¿Qué carrera hay hoy?" : "¿Quién fue Merckx?"}
            className="flex-1 bg-slate-900 border border-white/10 rounded-2xl py-4 px-5 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-slate-700"
          />
          <button 
            onClick={() => handleSend()}
            disabled={loading || !input.trim()}
            className={`${isPcs ? 'bg-blue-600' : 'bg-amber-600'} p-4 rounded-2xl text-white shadow-xl active:scale-90 transition-all disabled:opacity-20`}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CyclingAI;
