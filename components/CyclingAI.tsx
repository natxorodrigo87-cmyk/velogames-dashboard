
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Send, Search, Database, BookOpen, Sparkles, Loader2, RefreshCw, Globe } from 'lucide-react';

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
  const [status, setStatus] = useState<string>('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const welcome = mode === 'pcs' 
      ? '¡Radio Tour activado! Consultando datos reales de la temporada 2026. ¿Qué quieres saber de la carrera de hoy?'
      : 'Has abierto los archivos históricos de la Liga. Pregúntame sobre cualquier leyenda, táctica o récord del pasado.';
    
    setMessages([{ role: 'bot', text: welcome }]);
  }, [mode]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
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
    setStatus(mode === 'pcs' ? 'Rastreando Procyclingstats...' : 'Consultando archivos históricos...');

    try {
      // Create fresh instance every time for maximum key reliability
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      
      const systemInstruction = mode === 'pcs'
        ? 'Eres el analista oficial de la Liga Frikis. Usas Procyclingstats para dar resultados actuales. Responde de forma técnica, rápida y veraz.'
        : 'Eres el historiador de la Liga Frikis. Sabes todo sobre el ciclismo épico desde 1900 hasta hoy. Responde con sabiduría y pasión.';

      // Model selection based on task capability
      // PCS mode REQUIRES Search grounding, which is only supported in Pro Image Preview
      const modelName = mode === 'pcs' ? 'gemini-3-pro-image-preview' : 'gemini-3-flash-preview';

      // Use the simplest possible call structure for mobile compatibility
      const response = await ai.models.generateContent({
        model: modelName,
        contents: userText, // SDK handles string prompts with maximum stability
        config: {
          systemInstruction: systemInstruction,
          tools: mode === 'pcs' ? [{ googleSearch: {} }] : undefined,
        },
      });

      const botText = response.text || "La señal es débil en este puerto. Intenta de nuevo.";
      
      // Extraction of grounding chunks for website links as per mandatory rules
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
        { 
          role: 'bot', 
          text: botText, 
          sources: sources.length > 0 ? sources : undefined 
        }
      ]);

    } catch (error: any) {
      console.error("Gemini SDK Error:", error);
      const errorMsg = error.message || "";
      
      // Handle the common "entity not found" error by prompting for key re-selection
      if (errorMsg.includes("Requested entity was not found") || errorMsg.includes("404")) {
        setMessages(prev => [
          ...prev, 
          { 
            role: 'bot', 
            text: "¡Error de conexión crítica! La llave de acceso no es válida para este modelo. Por favor, vuelve a configurar la clave.",
            isError: true 
          }
        ]);
        // @ts-ignore
        if (window.aistudio) { window.aistudio.openSelectKey(); }
      } else {
        setMessages(prev => [
          ...prev, 
          { 
            role: 'bot', 
            text: errorMsg.includes("429") 
              ? "¡Pájara! He agotado mi límite de mensajes por ahora. Espera unos segundos." 
              : "¡Caída en el pelotón! Hubo un error de red. Intenta enviar el mensaje de nuevo.",
            isError: true 
          }
        ]);
      }
    } finally {
      setLoading(false);
      setStatus('');
    }
  };

  const isPcs = mode === 'pcs';

  return (
    <div className="flex flex-col w-full h-full bg-slate-950 text-white overflow-hidden shadow-2xl">
      {/* Dynamic Header */}
      <div className={`shrink-0 p-5 pt-16 md:pt-5 border-b flex items-center justify-between ${isPcs ? 'bg-blue-600' : 'bg-amber-600'}`}>
        <div className="flex items-center gap-4">
          <div className="p-2.5 bg-white/20 rounded-2xl backdrop-blur-md">
            {isPcs ? <Globe className="w-5 h-5" /> : <BookOpen className="w-5 h-5" />}
          </div>
          <div>
            <h2 className="text-sm font-black uppercase italic tracking-tighter leading-none">
              {isPcs ? 'PCS Live Advisor' : 'Enciclopedia Frikis'}
            </h2>
            <div className="flex items-center gap-1.5 mt-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${loading ? 'bg-white animate-pulse' : 'bg-green-400'}`} />
              <span className="text-[9px] text-white/70 font-black uppercase tracking-widest">
                {loading ? status : 'Conectado'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Message Feed */}
      <div 
        ref={scrollRef} 
        className="flex-1 overflow-y-auto p-4 space-y-5 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] bg-fixed"
      >
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-3 duration-300`}>
            <div className={`max-w-[92%] md:max-w-[85%] ${m.role === 'user' ? 'flex flex-col items-end' : ''}`}>
              <div className={`p-4 rounded-2xl text-[14px] md:text-[15px] leading-relaxed shadow-2xl ${
                m.role === 'user' 
                  ? `${isPcs ? 'bg-blue-600' : 'bg-amber-600'} text-white rounded-tr-none border border-white/10` 
                  : m.isError 
                    ? 'bg-red-500/10 border border-red-500/30 text-red-200' 
                    : 'bg-slate-900/90 text-slate-200 border border-white/5 rounded-tl-none backdrop-blur-md'
              }`}>
                {m.text}
                
                {m.isError && (
                  <button 
                    onClick={() => handleSend(messages[messages.length-2]?.text)}
                    className="mt-4 flex items-center gap-2 w-full justify-center py-3.5 bg-red-600 text-white rounded-xl font-black text-[10px] uppercase shadow-lg active:scale-95 transition-all"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Reintentar Envío
                  </button>
                )}
              </div>
              
              {/* Mandatory Source Links Display */}
              {m.sources && m.sources.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {m.sources.slice(0, 4).map((s, idx) => (
                    <a 
                      key={idx} 
                      href={s.uri} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-[9px] text-blue-400 font-black flex items-center gap-1.5 bg-blue-500/10 px-3 py-2 rounded-lg border border-blue-500/20 active:bg-blue-500/30 uppercase tracking-tighter"
                    >
                      <Database className="w-3 h-3" /> {s.title.substring(0, 20)}...
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-900/60 p-4 rounded-2xl border border-white/5 flex items-center gap-3 shadow-xl backdrop-blur-sm">
              <Loader2 className={`w-4 h-4 animate-spin ${isPcs ? 'text-blue-500' : 'text-amber-500'}`} />
              <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{status}</span>
            </div>
          </div>
        )}
      </div>

      {/* Input Area Optimized for Mobile Keyboard */}
      <div className="shrink-0 p-4 bg-slate-950 border-t border-white/10 pb-10 md:pb-4 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
        <div className="flex gap-2">
          <input 
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={isPcs ? "¿Qué ha pasado hoy en la carrera?" : "¿Quién fue Fausto Coppi?"}
            className="flex-1 bg-slate-900 border border-white/10 rounded-2xl py-4 px-5 text-[16px] text-white focus:outline-none focus:border-blue-500/50 transition-all shadow-inner placeholder:text-slate-600"
          />
          <button 
            onClick={() => handleSend()}
            disabled={loading || !input.trim()}
            className={`${isPcs ? 'bg-blue-600' : 'bg-amber-600'} p-4 rounded-2xl text-white shadow-xl active:scale-90 transition-all disabled:opacity-20 flex items-center justify-center`}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <div className="mt-4 flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5">
            <Sparkles className={`w-3 h-3 ${isPcs ? 'text-blue-500' : 'text-amber-500'}`} />
            <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest">
              Gemini 3 Pro + Google Grounding
            </span>
          </div>
          <span className="text-[9px] text-slate-800 font-bold uppercase tracking-widest italic">Stable Mobile Build</span>
        </div>
      </div>
    </div>
  );
};

export default CyclingAI;
