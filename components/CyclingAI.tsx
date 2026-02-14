
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Send, Globe, Loader2, X, Info } from 'lucide-react';

interface CyclingAIProps {
  onClose: () => void;
}

type Message = {
  role: 'user' | 'bot';
  text: string;
  sources?: { uri: string; title: string }[];
};

const CyclingAI: React.FC<CyclingAIProps> = ({ onClose }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMessages([{ 
      role: 'bot', 
      text: '🎙️ **Radio Tour:** "Conectado al satélite de Procyclingstats. Pregúntame resultados, dorsales o clasificaciones de cualquier carrera."' 
    }]);
  }, []);

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
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const model = 'gemini-3-flash-preview';
      
      const response = await ai.models.generateContent({
        model: model,
        contents: userText,
        config: {
          systemInstruction: 'Eres el coche oficial de Radio Tour. Tu única misión es dar datos precisos del ciclismo profesional usando Procyclingstats. Sé extremadamente breve, técnico y profesional.',
          tools: [{ googleSearch: {} }],
        },
      });

      const botText = response.text || "Se ha perdido la señal en el puerto... intenta de nuevo.";
      const sources: { uri: string; title: string }[] = [];
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      
      if (chunks) {
        chunks.forEach((c: any) => {
          if (c.web?.uri) sources.push({ uri: c.web.uri, title: c.web.title || 'Ver fuente' });
        });
      }

      setMessages(prev => [...prev, { role: 'bot', text: botText, sources }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { 
        role: 'bot', 
        text: "⚠️ **Error de conexión.** Por favor, asegúrate de que el sistema tiene acceso a internet y vuelve a intentarlo." 
      }]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  return (
    <div className="flex flex-col w-full h-full bg-slate-950 text-white overflow-hidden">
      
      {/* HEADER LIMPIO */}
      <div className="shrink-0 p-5 border-b border-white/10 flex items-center justify-between bg-blue-600/10">
        <div className="flex items-center gap-4">
          <div className="p-2.5 bg-blue-600 rounded-xl shadow-lg shadow-blue-500/20">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-black uppercase tracking-widest italic">Radio Tour PCS</h2>
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[9px] text-slate-400 font-bold uppercase">En directo</span>
            </div>
          </div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-slate-500 transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* CHAT */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-6">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[90%] p-4 rounded-2xl text-sm leading-relaxed ${
              m.role === 'user' 
                ? 'bg-blue-600 text-white font-semibold shadow-xl' 
                : 'bg-slate-900/50 border border-white/5 text-slate-200'
            }`}>
              <div className="whitespace-pre-wrap">{m.text}</div>
              
              {m.sources && m.sources.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2 pt-3 border-t border-white/5">
                  {m.sources.map((s, idx) => (
                    <a key={idx} href={s.uri} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-500/10 hover:bg-blue-500/20 rounded-md text-[10px] font-black text-blue-400 border border-blue-400/20 transition-all">
                      <Info className="w-3 h-3" /> FUENTE: {s.title}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-900/50 border border-white/5 p-4 rounded-2xl flex items-center gap-3">
              <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 animate-pulse">Consultando base de datos...</span>
            </div>
          </div>
        )}
      </div>

      {/* INPUT */}
      <div className="p-6 bg-slate-950 border-t border-white/10">
        <div className="flex gap-3 max-w-2xl mx-auto">
          <input 
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Pregunta sobre Procyclingstats..."
            className="flex-1 bg-slate-900 border border-white/10 rounded-2xl py-3.5 px-5 text-sm focus:outline-none focus:border-blue-500 text-white placeholder:text-slate-600 shadow-inner transition-all"
          />
          <button 
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="p-3.5 bg-blue-600 text-white rounded-2xl disabled:opacity-20 hover:bg-blue-500 shadow-lg shadow-blue-600/20 transition-all active:scale-90"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <p className="text-center text-[8px] text-slate-700 font-black uppercase tracking-widest mt-4">
          Conexión cifrada vía satélite • Liga Frikis 2026
        </p>
      </div>
    </div>
  );
};

export default CyclingAI;
