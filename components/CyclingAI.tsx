import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Zap, Radio, History } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

type Mode = 'pcs' | 'encyclopedia';
type Message = { role: 'user' | 'bot'; text: string; timestamp: string };

const CyclingAI: React.FC = () => {
  const [mode, setMode] = useState<Mode>('pcs');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const systemInstructions = {
    pcs: "Eres 'Radio Tour Frikis', experto en Velogames. Tono informal, divertido y técnico. Habla de 'mortadelas' (ciclistas baratos de 4-6 créditos) y bromea con los abandonos. Responde siempre en español, de forma breve y con emojis de ciclismo 🚲.",
    encyclopedia: "Eres el Historiador de la Liga Frikis. Conoces todo sobre el ciclismo épico: Merckx, Indurain, Pantani. Responde con datos curiosos y un tono legendario."
  };

  useEffect(() => {
    const welcomeMsg = mode === 'pcs' 
      ? '🎙️ **Radio Tour:** Conexión establecida. ¿A qué mortadela quieres que analicemos hoy?' 
      : '📚 **Archivo Histórico:** ¿Qué leyenda del pedal quieres rescatar del olvido?';
    
    setMessages([{ 
      role: 'bot', 
      text: welcomeMsg,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
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

    // Obtenemos la clave inyectada por Vite desde Netlify
    const apiKey = process.env.API_KEY;

    // Validación estricta de la clave
    if (!apiKey || apiKey === "" || apiKey === "undefined") {
      setMessages(prev => [...prev, { 
        role: 'bot', 
        text: "❌ **ERROR DE CONFIGURACIÓN:** No detecto tu API_KEY. \n\n1. Ve al panel de Netlify.\n2. Asegúrate de que la variable se llame exactamente `API_KEY`.\n3. Tras guardarla, debes volver a desplegar la web (Trigger Deploy) para que surta efecto.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
      return;
    }

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userText, timestamp }]);
    setLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: userText,
        config: {
          systemInstruction: systemInstructions[mode],
          temperature: 0.8,
        }
      });

      const botText = response.text || "Perdemos la señal en el túnel de Glandon...";
      setMessages(prev => [...prev, { 
        role: 'bot', 
        text: botText, 
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } catch (error: any) {
      console.error("AI Error:", error);
      let errorMsg = "⚠️ **AVERÍA MECÁNICA:** El Cerebro no responde.";
      
      if (error?.message?.includes('API key not valid')) {
        errorMsg = "⚠️ **API KEY INVÁLIDA:** La clave que pusiste en Netlify no es correcta. Revísala en Google AI Studio.";
      } else if (error?.message?.includes('quota')) {
        errorMsg = "⚠️ **SIN Vatios:** Has superado el límite gratuito de mensajes por hoy.";
      }

      setMessages(prev => [...prev, { 
        role: 'bot', 
        text: errorMsg,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col w-full h-[600px] bg-slate-950 border border-white/10 rounded-[32px] overflow-hidden shadow-2xl relative">
      {/* Header del Chat */}
      <div className="p-5 border-b border-white/5 bg-white/5 backdrop-blur-xl flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-purple-600 flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.4)]">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-black text-white uppercase tracking-wider">Cerebro Frikis</h2>
            <p className="text-[10px] text-purple-400 font-bold uppercase tracking-tighter">Motor Gemini 3.0</p>
          </div>
        </div>
        
        <div className="flex gap-2 p-1 bg-black/40 rounded-2xl border border-white/5">
          <button 
            onClick={() => setMode('pcs')} 
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${mode === 'pcs' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <Radio className="w-3 h-3" /> Radio PCS
          </button>
          <button 
            onClick={() => setMode('encyclopedia')} 
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${mode === 'encyclopedia' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <History className="w-3 h-3" /> Historia
          </button>
        </div>
      </div>

      {/* Cuerpo del Chat */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-950/50 scrollbar-hide">
        {messages.map((m, i) => (
          <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-2`}>
            <div className={`max-w-[85%] p-4 rounded-2xl shadow-xl ${
              m.role === 'user' 
                ? 'bg-blue-600 text-white rounded-tr-none border border-blue-400/30' 
                : 'bg-slate-900 border border-white/10 text-slate-200 rounded-tl-none'
            }`}>
              <div className="text-sm leading-relaxed whitespace-pre-wrap">{m.text}</div>
            </div>
            <span className="text-[9px] font-black text-slate-600 uppercase mt-2 tracking-widest px-1">
              {m.role === 'user' ? 'Tú' : 'Cerebro'} • {m.timestamp}
            </span>
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-3 text-purple-400 text-[10px] font-black uppercase tracking-widest bg-purple-500/10 p-3 rounded-xl border border-purple-500/20 w-fit animate-pulse">
            <Loader2 className="w-3 h-3 animate-spin" />
            Subiendo el Tourmalet...
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 bg-slate-950 border-t border-white/5">
        <div className="relative flex items-center gap-3">
          <input 
            type="text" 
            value={input} 
            onChange={(e) => setInput(e.target.value)} 
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={mode === 'pcs' ? "Pregunta sobre mortadelas..." : "Busca una leyenda..."}
            className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm text-white outline-none focus:border-purple-500 transition-all placeholder:text-slate-600"
          />
          <button 
            onClick={handleSend} 
            disabled={!input.trim() || loading}
            className="w-14 h-14 bg-purple-600 hover:bg-purple-500 disabled:bg-slate-800 text-white rounded-2xl flex items-center justify-center transition-all shadow-xl hover:shadow-purple-500/20"
          >
            <Send className={`w-6 h-6 ${loading ? 'opacity-0' : 'opacity-100'}`} />
            {loading && <Loader2 className="w-6 h-6 animate-spin absolute" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CyclingAI;
