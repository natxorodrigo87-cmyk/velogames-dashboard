
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Send, Search, Database, BookOpen, Sparkles, Loader2, RefreshCw, AlertCircle } from 'lucide-react';

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
      ? '¡Conexión PCS activa! Estoy usando el modelo Pro con Google Search para darte datos reales de procyclingstats.com.'
      : 'Soy tu guía histórico. Pregúntame sobre cualquier leyenda o curiosidad técnica del pelotón.';
    
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
    setStatus(mode === 'pcs' ? 'Buscando en Google Search...' : 'Consultando archivos...');

    try {
      // Create new GoogleGenAI instance right before making an API call 
      // to ensure it always uses the most up-to-date API key from the environment.
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const systemInstruction = mode === 'pcs'
        ? 'Eres un analista de ProCyclingStats. Solo respondes con datos técnicos reales que encuentres en procyclingstats.com usando Google Search. Eres directo y preciso.'
        : 'Eres un historiador experto en ciclismo. Conoces toda la historia del Tour, Giro, Vuelta y Clásicas. Eres elegante y culto.';

      // IMPORTANT: Use gemini-3-pro-image-preview when using googleSearch tool
      const modelName = mode === 'pcs' ? 'gemini-3-pro-image-preview' : 'gemini-3-flash-preview';

      const response = await ai.models.generateContent({
        model: modelName,
        contents: [{ role: 'user', parts: [{ text: userText }] }],
        config: {
          tools: mode === 'pcs' ? [{ googleSearch: {} }] : undefined,
          systemInstruction: systemInstruction,
        },
      });

      const botText = response.text || "No hay señal de Radio Tour en este puerto.";
      const sources: { uri: string; title: string }[] = [];
      
      // Extract grounding metadata for Google Search results
      const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      if (groundingChunks) {
        groundingChunks.forEach((chunk: any) => {
          if (chunk.web?.uri) {
            sources.push({ uri: chunk.web.uri, title: chunk.web.title || 'Ver en PCS' });
          }
        });
      }

      setMessages(prev => [
        ...prev.filter(m => !m.isError), 
        { role: 'bot', text: botText, sources: sources.length > 0 ? sources : undefined }
      ]);

    } catch (error: any) {
      console.error("AI Error:", error);
      const errorMsg = error.message || "";
      
      if (errorMsg.includes("Requested entity was not found")) {
        // If key is invalid or lost, try to re-open selection
        setMessages(prev => [
          ...prev, 
          { 
            role: 'bot', 
            text: "¡Error de autenticación! La llave de acceso ha caducado o no se encuentra. Por favor, pulsa el botón para reconfigurar.",
            isError: true 
          }
        ]);
        // @ts-ignore
        if (window.aistudio) {
          // @ts-ignore
          window.aistudio.openSelectKey();
        }
      } else {
        const isQuotaError = errorMsg.includes("429") || errorMsg.includes("quota");
        setMessages(prev => [
          ...prev, 
          { 
            role: 'bot', 
            text: isQuotaError 
              ? "¡Límite de velocidad! He hecho demasiadas consultas. Espera un minuto."
              : "¡Caída en el pelotón! La conexión ha fallado. Reintenta ahora.",
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
    <div className="flex flex-col w-full h-full bg-slate-950 text-white overflow-hidden">
      {/* Header */}
      <div className={`shrink-0 p-4 pt-16 md:pt-4 border-b flex items-center gap-4 ${isPcs ? 'bg-blue-600 shadow-lg' : 'bg-amber-600 shadow-lg'}`}>
        <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
          {isPcs ? <Search className="w-5 h-5" /> : <BookOpen className="w-5 h-5" />}
        </div>
        <div>
          <h2 className="text-sm font-black uppercase italic tracking-tighter leading-none">
            {isPcs ? 'PCS Pro Advisor (Search)' : 'Archivo Histórico'}
          </h2>
          <div className="flex items-center gap-1.5 mt-1">
            <span className={`w-1.5 h-1.5 rounded-full ${loading ? 'bg-white animate-pulse' : 'bg-green-400'}`} />
            <span className="text-[9px] text-white/70 font-bold uppercase tracking-widest">
              {loading ? status : 'Sincronizado'}
            </span>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div 
        ref={scrollRef} 
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-slate-900 to-slate-950 scroll-smooth"
      >
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}>
            <div className={`max-w-[90%] md:max-w-[80%] ${m.role === 'user' ? 'flex flex-col items-end' : ''}`}>
              <div className={`p-4 rounded-2xl text-[15px] leading-relaxed shadow-lg ${
                m.role === 'user' 
                  ? `${isPcs ? 'bg-blue-600' : 'bg-amber-600'} text-white rounded-tr-none` 
                  : m.isError 
                    ? 'bg-red-500/20 border border-red-500/30 text-red-200' 
                    : 'bg-slate-800/80 text-slate-200 border border-white/5 rounded-tl-none'
              }`}>
                {m.text}
                
                {m.isError && (
                  <button 
                    onClick={() => handleSend(messages[messages.length-2]?.text)}
                    className="mt-4 flex items-center gap-2 w-full justify-center py-3 bg-red-600 text-white rounded-xl font-black text-[10px] uppercase shadow-lg active:scale-95 transition-all"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Reintentar Ahora
                  </button>
                )}
              </div>
              
              {m.sources && m.sources.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {m.sources.map((s, idx) => (
                    <a 
                      key={idx} 
                      href={s.uri} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-[10px] text-blue-400 font-bold flex items-center gap-1 bg-blue-500/10 px-3 py-2 rounded-lg border border-blue-500/20 active:bg-blue-500/30"
                    >
                      <Database className="w-3 h-3" /> Link PCS
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-800/40 p-4 rounded-2xl border border-white/5 flex items-center gap-3">
              <Loader2 className={`w-4 h-4 animate-spin ${isPcs ? 'text-blue-500' : 'text-amber-500'}`} />
              <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{status}</span>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="shrink-0 p-4 bg-slate-950 border-t border-white/10 pb-10 md:pb-4">
        <div className="flex gap-2">
          <input 
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={isPcs ? "¿Cómo va la etapa de hoy?" : "¿Quién ganó el Tour de 1980?"}
            className="flex-1 bg-slate-900 border border-white/10 rounded-2xl py-4 px-5 text-[16px] text-white focus:outline-none focus:border-blue-500/50 transition-all shadow-inner"
          />
          <button 
            onClick={() => handleSend()}
            disabled={loading || !input.trim()}
            className={`${isPcs ? 'bg-blue-600' : 'bg-amber-600'} p-4 rounded-2xl text-white shadow-xl active:scale-90 transition-all disabled:opacity-20`}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <div className="mt-4 flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5">
            <Sparkles className={`w-3 h-3 ${isPcs ? 'text-blue-500' : 'text-amber-500'}`} />
            <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest">
              Gemini 3 Pro + Search
            </span>
          </div>
          <span className="text-[9px] text-slate-800 font-bold uppercase tracking-widest italic">Mobile Performance Optimized</span>
        </div>
      </div>
    </div>
  );
};

export default CyclingAI;
