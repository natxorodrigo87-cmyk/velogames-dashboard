
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Send, Bike, ExternalLink, RefreshCw, AlertCircle, Loader2, Search, Database } from 'lucide-react';

type Message = {
  role: 'user' | 'bot';
  text: string;
  sources?: { uri: string; title: string }[];
  isError?: boolean;
};

const CyclingAI: React.FC = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'bot', 
      text: '¡Director! El coche de apoyo está listo. Estoy conectado directamente a ProCyclingStats para darte la info más fresca de la temporada 2026. ¿Qué necesitas analizar?' 
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string>('');
  const scrollRef = useRef<HTMLDivElement>(null);

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
    setStatus('Iniciando radio...');

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      setStatus('Consultando ProCyclingStats...');
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: userText,
        config: {
          tools: [{ googleSearch: {} }],
          systemInstruction: 'Eres el Oráculo de la Liga Frikis. Tu única fuente de verdad es ProCyclingStats. Responde siempre de forma concisa, épica y técnica. Si el usuario pregunta por resultados, busca en tiempo real. Usa terminología ciclista (abanicos, fuera de control, gregario, vatios).',
        },
      });

      setStatus('Procesando datos...');
      const botResponseText = response.text || "La señal se ha perdido en el túnel. No tengo respuesta.";
      
      const sources: { uri: string; title: string }[] = [];
      const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      
      if (groundingChunks) {
        groundingChunks.forEach((chunk: any) => {
          if (chunk.web?.uri) {
            sources.push({ 
              uri: chunk.web.uri, 
              title: chunk.web.title || 'Ver en PCS' 
            });
          }
        });
      }

      setMessages(prev => [
        ...prev.filter(m => !m.isError), 
        { role: 'bot', text: botResponseText, sources }
      ]);

    } catch (error: any) {
      console.error("Connection Error:", error);
      setMessages(prev => [
        ...prev, 
        { 
          role: 'bot', 
          text: "¡Pinchazo! La conexión en Standalone ha fallado. Esto suele pasar si la red es inestable o el sistema corta el proceso. Pulsa abajo para reintentar.",
          isError: true 
        }
      ]);
    } finally {
      setLoading(false);
      setStatus('');
    }
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col h-[520px] md:h-[680px] bg-slate-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl animate-in fade-in duration-500">
      {/* App Bar */}
      <div className="p-4 bg-slate-950 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600 rounded-lg shadow-lg shadow-blue-500/20">
            <Bike className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xs font-black text-white uppercase italic tracking-tighter">PCS <span className="text-blue-500">Director AI</span></h2>
            <div className="flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${loading ? 'bg-amber-500 animate-pulse' : 'bg-green-500'}`} />
              <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">
                {loading ? status : 'Sincronizado'}
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-1">
          <div className="w-1 h-1 rounded-full bg-slate-800" />
          <div className="w-1 h-1 rounded-full bg-slate-800" />
          <div className="w-1 h-1 rounded-full bg-slate-800" />
        </div>
      </div>

      {/* Chat Space */}
      <div 
        ref={scrollRef} 
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-slate-950/50 to-slate-900"
      >
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[88%] space-y-2 ${m.role === 'user' ? 'flex flex-col items-end' : ''}`}>
              <div className={`p-4 rounded-2xl text-[13px] leading-relaxed ${
                m.role === 'user' 
                  ? 'bg-blue-600 text-white rounded-tr-none shadow-xl' 
                  : m.isError 
                    ? 'bg-red-500/10 border border-red-500/20 text-red-200' 
                    : 'bg-slate-800 text-slate-200 border border-white/5 rounded-tl-none shadow-md'
              }`}>
                {m.text}
                
                {m.isError && (
                  <button 
                    onClick={() => handleSend(messages[messages.length-2]?.text)}
                    className="mt-4 flex items-center gap-2 w-full justify-center py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl font-black text-[10px] uppercase transition-all active:scale-95 shadow-lg"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Reintentar Conexión
                  </button>
                )}
              </div>
              
              {m.sources && m.sources.length > 0 && (
                <div className="flex flex-wrap gap-2 animate-in fade-in slide-in-from-bottom-2 duration-500">
                  {m.sources.slice(0, 3).map((s, idx) => (
                    <a 
                      key={idx} 
                      href={s.uri} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-[9px] text-blue-400 font-bold flex items-center gap-1.5 bg-blue-500/5 px-2.5 py-1 rounded-md border border-blue-500/10 hover:bg-blue-500/20 transition-colors"
                    >
                      <Database className="w-2.5 h-2.5" /> {s.title.substring(0, 20)}...
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-800 p-4 rounded-2xl rounded-tl-none border border-white/5 flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{status}</span>
              </div>
              <div className="w-32 h-1 bg-slate-900 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 animate-[loading_2s_ease-in-out_infinite]" style={{width: '40%'}} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input de Comandos */}
      <div className="p-4 bg-slate-950 border-t border-white/10">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
            <input 
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="¿Quién ganó hoy? / Analiza PCS..."
              className="w-full bg-slate-900 border border-white/5 rounded-2xl py-4 pl-11 pr-4 text-sm text-white placeholder:text-slate-700 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all shadow-inner"
            />
          </div>
          <button 
            onClick={() => handleSend()}
            disabled={loading || !input.trim()}
            className="bg-blue-600 hover:bg-blue-500 p-4 rounded-2xl text-white disabled:opacity-20 shadow-lg shadow-blue-600/20 active:scale-90 transition-all"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <div className="mt-3 flex items-center justify-between px-1">
          <p className="text-[8px] text-slate-600 font-bold uppercase tracking-widest">
            Liga Frikis 2026 • v3.0 Optimized
          </p>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_5px_rgba(59,130,246,0.5)]" />
            <span className="text-[8px] text-blue-500 font-black uppercase italic">Safe Mode PWA</span>
          </div>
        </div>
      </div>
      
      <style>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(250%); }
        }
      `}</style>
    </div>
  );
};

export default CyclingAI;
