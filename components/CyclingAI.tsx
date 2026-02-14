
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Send, Bike, ExternalLink, RefreshCw, AlertCircle, Loader2, Search, Database, BookOpen, Sparkles } from 'lucide-react';

interface CyclingAIProps {
  mode: 'pcs' | 'encyclopedia';
}

type Message = {
  role: 'user' | 'bot';
  text: string;
  sources?: { uri: string; title: string }[];
  isError?: boolean;
};

const CyclingAI: React.FC<CyclingAIProps> = ({ mode }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string>('');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Initial welcome message based on mode
  useEffect(() => {
    const welcome = mode === 'pcs' 
      ? '¡Radio Tour activa! Conectado a ProCyclingStats. Pídeme resultados, startlists o estadísticas actuales de cualquier carrera del calendario 2026.'
      : 'Soy el Archivista de la Liga. Conozco cada pedalada de Merckx, Indurain y los secretos técnicos de la grupeta. ¿Qué duda histórica o técnica tienes hoy?';
    
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
    setStatus(mode === 'pcs' ? 'Consultando PCS...' : 'Consultando archivos históricos...');

    try {
      const apiKey = process.env.API_KEY;
      const ai = new GoogleGenAI({ apiKey: apiKey! });
      
      const systemInstruction = mode === 'pcs'
        ? 'Eres un analista de datos especializado en ProCyclingStats. Tu única fuente de verdad es procyclingstats.com. Responde con datos técnicos, puestos, vatios, puntos UCI y alineaciones. Sé directo y técnico.'
        : 'Eres el mayor historiador y experto técnico del ciclismo mundial. Responde sobre leyendas, evolución técnica de las bicis, tácticas de carrera clásicas y anécdotas del pelotón. Sé elegante, culto y apasionado.';

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: userText,
        config: {
          tools: mode === 'pcs' ? [{ googleSearch: {} }] : undefined,
          systemInstruction: systemInstruction,
        },
      });

      const botText = response.text || "La señal de radio se ha perdido.";
      
      const sources: { uri: string; title: string }[] = [];
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      if (chunks) {
        chunks.forEach((chunk: any) => {
          if (chunk.web?.uri) {
            sources.push({ uri: chunk.web.uri, title: chunk.web.title || 'Referencia' });
          }
        });
      }

      setMessages(prev => [
        ...prev.filter(m => !m.isError), 
        { role: 'bot', text: botText, sources }
      ]);

    } catch (error: any) {
      setMessages(prev => [
        ...prev, 
        { 
          role: 'bot', 
          text: "¡Avería mecánica! No he podido conectar con el satélite. Reintenta ahora.",
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
    <div className={`flex flex-col h-[600px] border rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 ${isPcs ? 'bg-slate-900 border-blue-500/30' : 'bg-slate-900 border-amber-500/30'}`}>
      {/* Header */}
      <div className={`p-4 border-b flex items-center justify-between ${isPcs ? 'bg-blue-600 border-blue-500/50' : 'bg-amber-600 border-amber-500/50'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-lg backdrop-blur-md">
            {isPcs ? <Search className="w-5 h-5 text-white" /> : <BookOpen className="w-5 h-5 text-white" />}
          </div>
          <div>
            <h2 className="text-xs font-black text-white uppercase italic tracking-tighter leading-none">
              {isPcs ? 'PCS Data Advisor' : 'Archivo Enciclopédico'}
            </h2>
            <span className="text-[9px] text-white/70 font-bold uppercase tracking-widest mt-1 block">
              {loading ? status : 'Sincronizado'}
            </span>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-1">
           <div className="w-1.5 h-1.5 rounded-full bg-white/30" />
           <div className="w-1.5 h-1.5 rounded-full bg-white/30" />
        </div>
      </div>

      {/* Transcript */}
      <div 
        ref={scrollRef} 
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950/40"
      >
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] space-y-2 ${m.role === 'user' ? 'flex flex-col items-end' : ''}`}>
              <div className={`p-4 rounded-2xl text-[13px] leading-relaxed shadow-lg ${
                m.role === 'user' 
                  ? `${isPcs ? 'bg-blue-600' : 'bg-amber-600'} text-white rounded-tr-none` 
                  : m.isError 
                    ? 'bg-red-500/10 border border-red-500/20 text-red-200' 
                    : 'bg-slate-800 text-slate-200 border border-white/5 rounded-tl-none'
              }`}>
                {m.text}
                {m.isError && (
                  <button 
                    onClick={() => handleSend(messages[messages.length-2]?.text)}
                    className="mt-4 flex items-center gap-2 w-full justify-center py-2.5 bg-red-600 rounded-xl font-black text-[10px] uppercase shadow-lg active:scale-95"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Reintentar
                  </button>
                )}
              </div>
              {m.sources && m.sources.length > 0 && (
                <div className="flex flex-wrap gap-2 animate-in fade-in">
                  {m.sources.map((s, idx) => (
                    <a key={idx} href={s.uri} target="_blank" rel="noopener noreferrer" className="text-[9px] text-blue-400 font-bold bg-blue-500/5 px-2 py-1 rounded border border-blue-500/20 flex items-center gap-1 hover:bg-blue-500/10 transition-colors">
                      <ExternalLink className="w-2.5 h-2.5" /> {s.title.substring(0, 15)}...
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-800/50 p-4 rounded-2xl border border-white/5 flex items-center gap-3">
              <Loader2 className={`w-4 h-4 animate-spin ${isPcs ? 'text-blue-500' : 'text-amber-500'}`} />
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{status}</span>
            </div>
          </div>
        )}
      </div>

      {/* Control Panel */}
      <div className="p-4 bg-slate-950 border-t border-white/10">
        <div className="relative flex gap-2">
          <input 
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={isPcs ? "¿Cómo va el ranking de hoy?" : "Explícame la táctica de Merckx..."}
            className="flex-1 bg-slate-900 border border-white/5 rounded-2xl py-4 px-5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 transition-all shadow-inner"
          />
          <button 
            onClick={() => handleSend()}
            disabled={loading || !input.trim()}
            className={`${isPcs ? 'bg-blue-600' : 'bg-amber-600'} p-4 rounded-2xl text-white shadow-lg disabled:opacity-20 active:scale-95 transition-all`}
          >
            {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </div>
        <div className="mt-3 flex items-center justify-between px-1">
           <div className="flex items-center gap-1 text-[8px] text-slate-500 font-black uppercase tracking-[0.2em]">
             <Sparkles className={`w-2.5 h-2.5 ${isPcs ? 'text-blue-500' : 'text-amber-500'}`} /> 
             {isPcs ? 'Live PCS Sync' : 'Historic Core Active'}
           </div>
           <span className="text-[8px] text-slate-700 font-bold uppercase tracking-widest italic">Frikis League v4.0</span>
        </div>
      </div>
    </div>
  );
};

export default CyclingAI;
