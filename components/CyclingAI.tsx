import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Zap, Radio, History, AlertCircle } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

type Mode = 'pcs' | 'encyclopedia';
type Message = { role: 'user' | 'bot'; text: string; timestamp: string; isError?: boolean };

const CyclingAI: React.FC = () => {
  const [mode, setMode] = useState<Mode>('pcs');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const systemInstructions = {
    pcs: "Eres 'Radio Tour Frikis'. Un director deportivo experto en la Liga Frikis y Velogames. Tu tono es divertido, un poco cínico y muy experto. Hablas de 'mortadelas' (corredores baratos que dan muchos puntos) y 'vatios'. Responde siempre en español y usa emojis de ciclismo 🚲.",
    encyclopedia: "Eres el Historiador de la Liga Frikis. Tono épico, culto y legendario sobre la historia del ciclismo (Merckx, Indurain, etc.). Responde siempre en español."
  };

  useEffect(() => {
    const welcome = mode === 'pcs' 
      ? '🎙️ **Radio Tour:** Conexión establecida. ¿A qué mortadela quieres que analicemos hoy?' 
      : '📚 **Archivo Histórico:** ¿Qué gesta del pedal quieres recordar hoy?';
    
    setMessages([{ 
      role: 'bot', 
      text: welcome, 
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
    }]);
  }, [mode]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, loading]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;

    // Vite inyecta la clave desde el entorno de Netlify definido en vite.config.ts
    const apiKey = process.env.API_KEY;

    if (!apiKey || apiKey === "undefined" || apiKey.length < 10) {
      setMessages(prev => [...prev, { 
        role: 'bot', 
        text: "❌ **ERROR DE CONFIGURACIÓN:** No se detecta la API_KEY en el entorno. Asegúrate de haberla puesto en Netlify, guardado y hecho un 'Clear cache and deploy site'.",
        timestamp: "Ahora",
        isError: true
      }]);
      return;
    }

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text, timestamp: time }]);
    setLoading(true);

    try {
      const genAI = new GoogleGenAI({ apiKey });
      const response = await genAI.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [{ parts: [{ text }] }],
        config: {
          systemInstruction: systemInstructions[mode],
          temperature: 0.8,
        }
      });

      const botResponse = response.text;
      if (!botResponse) throw new Error("Respuesta vacía del modelo");

      setMessages(prev => [...prev, { 
        role: 'bot', 
        text: botResponse, 
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
      }]);
    } catch (err: any) {
      console.error("Error detallado de Gemini:", err);
      let errorMsg = "⚠️ **AVERÍA MECÁNICA:** El asistente ha pinchado.";
      
      if (err.message?.includes('API key not valid')) {
        errorMsg = "⚠️ **CLAVE INVÁLIDA:** La clave en Netlify no es correcta. Genera una nueva en Google AI Studio eligiendo el proyecto 'Velogames' y vuelve a pegarla en Netlify.";
      } else if (err.message?.includes('User location is not supported')) {
        errorMsg = "🌍 **REGIÓN NO SOPORTADA:** Gemini no está disponible en tu ubicación actual sin VPN.";
      } else {
        // Mostramos el error técnico para que el usuario sepa qué pasa
        errorMsg = `⚠️ **DIAGNÓSTICO:** ${err.message || "Error desconocido en la conexión"}`;
      }
      
      setMessages(prev => [...prev, { role: 'bot', text: errorMsg, timestamp: "Error", isError: true }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col w-full h-[600px] bg-[#0a0f1e] border border-white/10 rounded-[32px] overflow-hidden shadow-2xl relative">
      {/* Header */}
      <div className="p-5 border-b border-white/5 bg-slate-900/50 flex items-center justify-between backdrop-blur-xl z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/20 group">
            <Zap className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
          </div>
          <div>
            <h2 className="text-xs font-black text-white uppercase tracking-widest leading-none mb-1">Cerebro Frikis</h2>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-[9px] text-slate-500 font-bold uppercase tracking-tighter">Motor Gemini 3.0</span>
            </div>
          </div>
        </div>
        
        <div className="flex gap-1.5 p-1 bg-black/40 rounded-2xl border border-white/5">
          <button 
            onClick={() => setMode('pcs')} 
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${mode === 'pcs' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <Radio className="w-3.5 h-3.5" /> Radio PCS
          </button>
          <button 
            onClick={() => setMode('encyclopedia')} 
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${mode === 'encyclopedia' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <History className="w-3.5 h-3.5" /> Historia
          </button>
        </div>
      </div>

      {/* Chat Box */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide bg-gradient-to-b from-transparent to-black/20">
        {messages.map((m, i) => (
          <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-3 duration-500`}>
            <div className={`max-w-[85%] p-4 rounded-3xl text-[13px] leading-relaxed shadow-xl ${
              m.role === 'user' 
                ? 'bg-blue-600 text-white rounded-tr-none' 
                : m.isError 
                  ? 'bg-red-500/10 border border-red-500/30 text-red-200 rounded-tl-none'
                  : 'bg-slate-800/80 border border-white/5 text-slate-200 rounded-tl-none backdrop-blur-sm'
            }`}>
              {m.isError && <AlertCircle className="w-4 h-4 mb-2 opacity-50" />}
              {m.text}
            </div>
            <span className="text-[8px] text-slate-600 font-black mt-2 uppercase tracking-[0.2em] px-1">
              {m.role === 'user' ? 'Tú' : 'Cerebro'} • {m.timestamp}
            </span>
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-3 text-purple-400 text-[10px] font-black uppercase tracking-[0.2em] bg-purple-500/5 p-3 rounded-2xl border border-purple-500/10 w-fit animate-pulse">
            <Loader2 className="w-4 h-4 animate-spin" />
            Subiendo el Tourmalet...
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-6 bg-slate-950/80 border-t border-white/5 backdrop-blur-2xl">
        <div className="relative flex items-center gap-3">
          <input 
            type="text" 
            value={input} 
            onChange={(e) => setInput(e.target.value)} 
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={mode === 'pcs' ? "Pregunta sobre mortadelas..." : "Hito histórico..."}
            className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm text-white outline-none focus:border-purple-500/50 transition-all placeholder:text-slate-600 font-medium"
          />
          <button 
            onClick={handleSend} 
            disabled={!input.trim() || loading}
            className="w-14 h-14 bg-purple-600 hover:bg-purple-500 disabled:bg-slate-900 disabled:text-slate-700 text-white rounded-2xl flex items-center justify-center transition-all shadow-2xl active:scale-95 group"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CyclingAI;
