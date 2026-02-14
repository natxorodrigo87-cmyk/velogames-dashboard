
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Send, Bike, ExternalLink, RefreshCw, AlertCircle, Loader2, Sparkles } from 'lucide-react';

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
      text: '¡Hola Director! Soy tu consultor de la Liga Frikis. Mi conexión está optimizada para modo App. Pregúntame sobre cualquier carrera, ciclista o táctica de ProCyclingStats.' 
    }
  ]);
  const [loading, setLoading] = useState(false);
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

    try {
      // Inicialización limpia dentro de la función para evitar cierres obsoletos en móviles
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: userText,
        config: {
          tools: [{ googleSearch: {} }],
          systemInstruction: 'Eres un analista experto en ciclismo. Tu prioridad absoluta es dar información verídica y actual nutriéndote de ProCyclingStats y noticias oficiales. Sé directo, usa lenguaje de director deportivo y mantén un tono épico pero conciso. Si mencionas resultados, cita la fuente.',
        },
      });

      // Extraer texto de forma segura
      const botResponseText = response.text || "La señal de radio es débil en este puerto. No he podido obtener respuesta.";
      
      // Extraer fuentes (Grounding Chunks)
      const sources: { uri: string; title: string }[] = [];
      const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
      
      if (groundingMetadata?.groundingChunks) {
        groundingMetadata.groundingChunks.forEach((chunk: any) => {
          if (chunk.web?.uri && chunk.web?.title) {
            // Evitar duplicados
            if (!sources.some(s => s.uri === chunk.web.uri)) {
              sources.push({ uri: chunk.web.uri, title: chunk.web.title });
            }
          }
        });
      }

      setMessages(prev => [
        ...prev.filter(m => !m.isError), 
        { role: 'bot', text: botResponseText, sources }
      ]);

    } catch (error: any) {
      console.error("Cycling AI Error:", error);
      
      // Mensaje de error amigable y opción de reintento
      setMessages(prev => [
        ...prev, 
        { 
          role: 'bot', 
          text: "¡Error de conexión! El coche del director se ha quedado sin cobertura en este puerto. Reintenta ahora mismo.",
          isError: true 
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col h-[550px] md:h-[700px] bg-slate-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-500">
      {/* Header Estilo Pro */}
      <div className="p-4 border-b border-white/5 bg-slate-950 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="p-2 bg-blue-600 rounded-xl">
              <Bike className="w-5 h-5 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 border-2 border-slate-950 rounded-full animate-pulse" />
          </div>
          <div>
            <h2 className="text-sm font-black text-white uppercase italic tracking-tighter leading-none">PCS <span className="text-blue-500">Live Advisor</span></h2>
            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1 block">Modo App Standalone Activo</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-2 py-1 rounded bg-slate-800 border border-white/5 text-[8px] font-black text-blue-400 uppercase">
            2.5 Ultra-Light
          </div>
        </div>
      </div>

      {/* Area de Mensajes */}
      <div 
        ref={scrollRef} 
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950"
      >
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] sm:max-w-[75%] space-y-2 ${m.role === 'user' ? 'flex flex-col items-end' : ''}`}>
              <div className={`p-4 rounded-2xl text-[13px] leading-relaxed shadow-lg ${
                m.role === 'user' 
                  ? 'bg-blue-600 text-white rounded-tr-none' 
                  : m.isError 
                    ? 'bg-red-500/10 border border-red-500/20 text-red-200' 
                    : 'bg-slate-800/80 backdrop-blur-sm text-slate-200 border border-white/5 rounded-tl-none'
              }`}>
                {m.isError && <AlertCircle className="w-4 h-4 mb-2 text-red-500" />}
                <p className="whitespace-pre-wrap">{m.text}</p>
                
                {m.isError && (
                  <button 
                    onClick={() => handleSend(messages[messages.length-2]?.text)}
                    className="mt-4 flex items-center gap-2 w-full justify-center py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl font-black text-[10px] uppercase transition-all active:scale-95"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Volver a intentar
                  </button>
                )}
              </div>
              
              {m.sources && m.sources.length > 0 && (
                <div className="flex flex-wrap gap-2 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-200">
                  {m.sources.map((s, idx) => (
                    <a 
                      key={idx} 
                      href={s.uri} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-[9px] text-blue-400 font-bold flex items-center gap-1.5 bg-blue-400/5 px-3 py-1 rounded-full border border-blue-400/20 hover:bg-blue-400/10 transition-colors"
                    >
                      <ExternalLink className="w-2.5 h-2.5" /> 
                      {s.title.length > 25 ? s.title.substring(0, 25) + '...' : s.title}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-800/50 p-4 rounded-2xl rounded-tl-none border border-white/5 flex items-center gap-3">
              <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest animate-pulse">Consultando PCS...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input de Control */}
      <div className="p-4 bg-slate-950 border-t border-white/10 shadow-[0_-10px_20px_rgba(0,0,0,0.5)]">
        <div className="relative flex gap-2">
          <input 
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Analiza la etapa de hoy..."
            className="flex-1 bg-slate-900 border border-white/10 rounded-2xl py-4 px-5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all shadow-inner"
          />
          <button 
            onClick={() => handleSend()}
            disabled={loading || !input.trim()}
            className="bg-blue-600 hover:bg-blue-500 p-4 rounded-2xl text-white disabled:opacity-20 disabled:grayscale shadow-lg shadow-blue-600/20 active:scale-90 transition-all"
          >
            {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </div>
        <div className="mt-3 flex items-center justify-center gap-4">
          <div className="flex items-center gap-1 text-[8px] text-slate-500 font-bold uppercase tracking-[0.2em]">
            <Sparkles className="w-2.5 h-2.5 text-blue-500" /> Grounding PCS
          </div>
          <div className="w-1 h-1 bg-slate-700 rounded-full" />
          <div className="flex items-center gap-1 text-[8px] text-slate-500 font-bold uppercase tracking-[0.2em]">
             Liga Frikis 2026
          </div>
        </div>
      </div>
    </div>
  );
};

export default CyclingAI;
