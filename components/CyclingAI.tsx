
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
      ? '¡Conexión satélite con PCS establecida! Pregúntame sobre cualquier resultado, startlist o estadísticas de la temporada actual.'
      : 'Has abierto la Enciclopedia del Ciclismo. Estoy listo para debatir sobre historia, tácticas legendarias o mecánica clásica. ¿Por dónde empezamos?';
    
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
    setStatus(mode === 'pcs' ? 'Buscando en PCS...' : 'Analizando archivos...');

    try {
      const apiKey = process.env.API_KEY;
      if (!apiKey) throw new Error("API Key faltante");

      const ai = new GoogleGenAI({ apiKey });
      
      const systemInstruction = mode === 'pcs'
        ? 'Eres un analista experto de ProCyclingStats. Solo respondes basándote en datos reales y actuales de procyclingstats.com. Eres directo, técnico y preciso.'
        : 'Eres un historiador erudito del ciclismo. Tu conocimiento abarca desde la primera edición del Tour hasta hoy. Hablas con elegancia sobre táctica, épica y tecnología.';

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: userText,
        config: {
          tools: mode === 'pcs' ? [{ googleSearch: {} }] : undefined,
          systemInstruction: systemInstruction,
        },
      });

      const botText = response.text || "No hay señal en este puerto de montaña.";
      const sources: { uri: string; title: string }[] = [];
      
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
      setMessages(prev => [
        ...prev, 
        { 
          role: 'bot', 
          text: "¡Pinchazo! No he podido contactar con la base. Verifica tu conexión o reintenta.",
          isError: true 
        }
      ]);
    } finally {
      setLoading(false);
      setStatus('');
    }
  };

  const isPcs = mode === 'pcs';

  return (
    <div className={`flex flex-col w-full h-full bg-slate-950 text-white ${isPcs ? 'border-blue-500/20' : 'border-amber-500/20'}`}>
      {/* Header Modal */}
      <div className={`p-5 pt-14 md:pt-5 border-b flex items-center gap-4 ${isPcs ? 'bg-blue-600' : 'bg-amber-600'}`}>
        <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-md">
          {isPcs ? <Search className="w-5 h-5 text-white" /> : <BookOpen className="w-5 h-5 text-white" />}
        </div>
        <div>
          <h2 className="text-base font-black uppercase italic tracking-tighter leading-none">
            {isPcs ? 'PCS Advisor' : 'Enciclopedia IA'}
          </h2>
          <div className="flex items-center gap-1.5 mt-1">
            <span className={`w-1.5 h-1.5 rounded-full ${loading ? 'bg-white animate-pulse' : 'bg-green-400 shadow-[0_0_5px_#4ade80]'}`} />
            <span className="text-[9px] text-white/70 font-bold uppercase tracking-widest">
              {loading ? status : 'En línea'}
            </span>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div 
        ref={scrollRef} 
        className="flex-1 overflow-y-auto p-4 space-y-5 bg-gradient-to-b from-slate-900 to-slate-950"
      >
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
            <div className={`max-w-[90%] md:max-w-[80%] ${m.role === 'user' ? 'flex flex-col items-end' : ''}`}>
              <div className={`p-4 rounded-2xl text-[14px] leading-relaxed shadow-xl ${
                m.role === 'user' 
                  ? `${isPcs ? 'bg-blue-600' : 'bg-amber-600'} text-white rounded-tr-none` 
                  : m.isError 
                    ? 'bg-red-500/10 border border-red-500/30 text-red-200' 
                    : 'bg-slate-800/80 text-slate-200 border border-white/5 rounded-tl-none'
              }`}>
                {m.text}
                
                {m.isError && (
                  <button 
                    onClick={() => handleSend(messages[messages.length-2]?.text)}
                    className="mt-4 flex items-center gap-2 w-full justify-center py-3 bg-red-600 text-white rounded-xl font-black text-[10px] uppercase shadow-lg active:scale-95"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Reintentar Conexión
                  </button>
                )}
              </div>
              
              {m.sources && m.sources.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {m.sources.slice(0, 3).map((s, idx) => (
                    <a 
                      key={idx} 
                      href={s.uri} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-[10px] text-blue-400 font-bold flex items-center gap-1 bg-blue-500/10 px-2.5 py-1.5 rounded-lg border border-blue-500/20 active:bg-blue-500/30"
                    >
                      <Database className="w-3 h-3" /> {s.title.substring(0, 15)}...
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

      {/* Input Field */}
      <div className="p-4 bg-slate-950 border-t border-white/10 pb-8 md:pb-4">
        <div className="flex gap-2">
          <input 
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={isPcs ? "¿Quién ganó hoy?" : "¿Por qué el pavé es tan duro?"}
            className="flex-1 bg-slate-900 border border-white/10 rounded-2xl py-4 px-5 text-[15px] text-white focus:outline-none focus:border-blue-500/50 transition-all shadow-inner"
          />
          <button 
            onClick={() => handleSend()}
            disabled={loading || !input.trim()}
            className={`${isPcs ? 'bg-blue-600 shadow-blue-500/20' : 'bg-amber-600 shadow-amber-500/20'} p-4 rounded-2xl text-white shadow-lg active:scale-90 transition-all disabled:opacity-20`}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <div className="mt-3 flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5">
            <Sparkles className={`w-3 h-3 ${isPcs ? 'text-blue-500' : 'text-amber-500'}`} />
            <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest">
              Gemini 3 Flash Engine
            </span>
          </div>
          <span className="text-[9px] text-slate-700 font-bold uppercase tracking-widest italic">v4.5 Mobile Optimized</span>
        </div>
      </div>
    </div>
  );
};

export default CyclingAI;
