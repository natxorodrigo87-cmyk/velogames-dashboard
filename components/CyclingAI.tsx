
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Send, Globe, BookOpen, Loader2, X, MessageSquare, Info } from 'lucide-react';

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
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Mensaje de bienvenida automático
  useEffect(() => {
    const welcome = mode === 'pcs' 
      ? '🎙️ **Radio Tour Informa:** Conectado a Procyclingstats. Pregúntame sobre cualquier corredor, equipo o resultado en tiempo real.'
      : '📚 **Enciclopedia Frikis:** Historias, mitos y leyendas del ciclismo. ¿De qué hazaña quieres hablar hoy?';
    
    setMessages([{ role: 'bot', text: welcome }]);
    setTimeout(() => inputRef.current?.focus(), 500);
  }, [mode]);

  // Scroll automático al final
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, loading]);

  const handleSend = async () => {
    const userText = input.trim();
    if (!userText || loading) return;

    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setLoading(true);

    try {
      // Usamos la API Key inyectada directamente
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      
      const config: any = {
        // Usamos Flash para evitar el diálogo de selección de cuenta
        model: 'gemini-3-flash-preview',
        systemInstruction: mode === 'pcs' 
          ? 'Eres el experto en datos de Radio Tour. Responde con datos reales de ciclismo actual. Sé conciso y usa un tono de retransmisión deportiva.' 
          : 'Eres un historiador apasionado del ciclismo. Cuenta anécdotas épicas y datos curiosos. Tono romántico y culto.',
      };

      // Añadimos búsqueda solo si estamos en modo PCS
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: userText,
        config: {
          ...config,
          tools: mode === 'pcs' ? [{ googleSearch: {} }] : undefined,
        },
      });

      const botText = response.text || "Lo siento, hay interferencias en la señal de Radio Tour...";
      const sources: { uri: string; title: string }[] = [];
      
      // Extraer fuentes de búsqueda si existen
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      if (chunks) {
        chunks.forEach((c: any) => {
          if (c.web?.uri) sources.push({ uri: c.web.uri, title: c.web.title || 'Ver fuente' });
        });
      }

      setMessages(prev => [...prev, { role: 'bot', text: botText, sources }]);
    } catch (error: any) {
      console.error("Error IA:", error);
      setMessages(prev => [...prev, { 
        role: 'bot', 
        text: "⚠️ No he podido conectar con la base de datos. Por favor, asegúrate de que el sistema tiene acceso a internet.", 
        isError: true 
      }]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  return (
    <div className="flex flex-col w-full h-full bg-slate-950 text-white overflow-hidden md:rounded-3xl border border-white/10 shadow-2xl animate-in fade-in zoom-in-95 duration-300">
      
      {/* HEADER DINÁMICO */}
      <div className={`shrink-0 p-4 border-b border-white/10 flex items-center justify-between ${mode === 'pcs' ? 'bg-blue-600/10' : 'bg-amber-600/10'}`}>
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl ${mode === 'pcs' ? 'bg-blue-600 text-white' : 'bg-amber-600 text-white'}`}>
            {mode === 'pcs' ? <Globe className="w-4 h-4" /> : <BookOpen className="w-4 h-4" />}
          </div>
          <div>
            <h2 className="text-xs font-black uppercase tracking-widest">{mode === 'pcs' ? 'Radio Tour Live' : 'Enciclopedia'}</h2>
            <p className="text-[10px] text-slate-500 font-bold uppercase">Sincronizado vía Satélite</p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg text-slate-500 hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* CHAT CONTAINER */}
      <div 
        ref={scrollRef} 
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900/50 to-slate-950"
      >
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-4 rounded-2xl text-sm ${
              m.role === 'user' 
                ? 'bg-blue-600 text-white font-semibold' 
                : m.isError 
                  ? 'bg-red-900/30 border border-red-500/30 text-red-200' 
                  : 'bg-slate-900 border border-white/10 text-slate-200'
            }`}>
              <div className="whitespace-pre-wrap leading-relaxed">{m.text}</div>
              
              {m.sources && m.sources.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2 pt-3 border-t border-white/5">
                  {m.sources.map((s, idx) => (
                    <a 
                      key={idx} 
                      href={s.uri} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-2 py-1 bg-white/5 hover:bg-white/10 rounded text-[9px] font-bold text-blue-400 border border-blue-400/20 transition-colors"
                    >
                      <Info className="w-3 h-3" />
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
            <div className="bg-slate-900 border border-white/5 p-4 rounded-2xl flex items-center gap-3">
              <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">Consultando datos...</span>
            </div>
          </div>
        )}
      </div>

      {/* INPUT AREA */}
      <div className="p-4 bg-slate-950/80 backdrop-blur-md border-t border-white/10">
        <div className="flex gap-2 max-w-3xl mx-auto">
          <input 
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={mode === 'pcs' ? "Pregunta sobre un ciclista..." : "Hablemos de historia del ciclismo..."}
            className="flex-1 bg-slate-900 border border-white/10 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-blue-500 transition-all text-white placeholder:text-slate-600 shadow-inner"
          />
          <button 
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className={`p-3 rounded-xl transition-all shadow-lg ${
              input.trim() 
                ? 'bg-blue-600 text-white hover:bg-blue-500 active:scale-90' 
                : 'bg-slate-800 text-slate-500'
            }`}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <p className="text-center text-[8px] text-slate-600 mt-3 font-bold uppercase tracking-[0.2em]">
          Powered by Gemini AI • Liga Frikis Intelligence System
        </p>
      </div>
    </div>
  );
};

export default CyclingAI;
