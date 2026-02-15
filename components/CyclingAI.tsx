
import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Zap } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

type Mode = 'pcs' | 'encyclopedia';
type Message = { role: 'user' | 'bot'; text: string; };

const CyclingAI: React.FC = () => {
  const [mode, setMode] = useState<Mode>('pcs');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages([{ 
      role: 'bot', 
      text: mode === 'pcs' 
        ? '🎙️ **Radio Tour PCS:** Conexión directa establecida. Pregúntame sobre resultados de Velogames o el estado del pelotón.' 
        : '📚 **Enciclopedia Frikis:** Archivo histórico cargado. ¿Qué leyenda del ciclismo quieres recordar hoy?'
    }]);
  }, [mode]);

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
      // Inicializamos la IA directamente (Netlify inyectará la clave automáticamente)
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: userText,
        config: {
          systemInstruction: mode === 'pcs' 
            ? "Eres un experto en la Liga Frikis de Velogames. Conoces los resultados y te gusta bromear sobre la 'mortadela'. Responde de forma técnica y divertida."
            : "Eres el historiador de la Liga Frikis. Conoces anécdotas de ciclistas clásicos y leyendas del deporte."
        }
      });

      const text = response.text;
      setMessages(prev => [...prev, { role: 'bot', text: text || "Se ha cortado la comunicación en el túnel." }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'bot', text: "⚠️ Error de conexión. Asegúrate de que la API_KEY esté configurada en Netlify." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col w-full min-h-[500px] bg-[#0a0f1e]/80 border border-white/10 rounded-[32px] overflow-hidden backdrop-blur-2xl shadow-2xl">
      <div className="p-4 border-b border-white/5 flex flex-col md:flex-row gap-4 items-center justify-between bg-white/5">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-purple-600/20 border border-purple-500/30">
            <Zap className="w-5 h-5 text-purple-500" />
          </div>
          <div>
            <h2 className="text-sm font-black text-white uppercase tracking-widest leading-none">Cerebro Frikis</h2>
            <p className="text-[9px] text-slate-500 font-bold uppercase mt-1 tracking-tighter">Gemini 3 Flash Engine</p>
          </div>
        </div>
        <div className="flex gap-2 p-1 bg-black/40 rounded-2xl border border-white/5">
          <button onClick={() => setMode('pcs')} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${mode === 'pcs' ? 'bg-blue-600 text-white' : 'text-slate-500'}`}>Radio PCS</button>
          <button onClick={() => setMode('encyclopedia')} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${mode === 'encyclopedia' ? 'bg-purple-600 text-white' : 'text-slate-500'}`}>Historia</button>
        </div>
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 min-h-[350px] max-h-[500px]">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-4 rounded-2xl text-sm ${m.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-slate-900 border border-white/10 text-slate-200 rounded-tl-none'}`}>
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-blue-400 text-[10px] font-black uppercase animate-pulse">
            <Loader2 className="w-3 h-3 animate-spin" />
            Escalando el puerto...
          </div>
        )}
      </div>
      <div className="p-4 bg-black/40 border-t border-white/5">
        <div className="flex gap-3">
          <input 
            type="text" 
            value={input} 
            onChange={(e) => setInput(e.target.value)} 
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Escribe tu pregunta..."
            className="flex-1 bg-[#020617] border border-white/10 rounded-2xl px-5 py-3 text-sm focus:border-blue-500 outline-none text-white"
          />
          <button onClick={handleSend} disabled={!input.trim() || loading} className="w-12 h-12 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl flex items-center justify-center disabled:opacity-50">
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CyclingAI;
