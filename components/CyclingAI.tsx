
import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Zap, Radio, History, MessageSquareText } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

type Mode = 'pcs' | 'encyclopedia';
type Message = { role: 'user' | 'bot'; text: string; timestamp: string };

const CyclingAI: React.FC = () => {
  const [mode, setMode] = useState<Mode>('pcs');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Instrucciones de sistema personalizadas para la Liga Frikis
  const systemInstructions = {
    pcs: "Eres 'Radio Tour Frikis', el asistente experto de una liga privada de Velogames. Tu tono es técnico pero muy divertido e informal. Sabes que la 'mortadela' son esos ciclistas baratos (6-4 créditos) que dan muchísimos puntos. Te gusta bromear con los abandonos y los 'ceros' en las carreras. Responde siempre en español, de forma breve y con emojis de ciclismo.",
    encyclopedia: "Eres el Historiador de la Liga Frikis. Conoces todo sobre el ciclismo épico: Merckx, Hinault, Indurain, Pantani. Responde con datos curiosos y un tono legendario, como si estuvieras narrando una etapa reina del Tour de Francia."
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

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userText, timestamp }]);
    setLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: userText,
        config: {
          systemInstruction: systemInstructions[mode],
          temperature: 0.8,
        }
      });

      const botText = response.text;
      setMessages(prev => [...prev, { 
        role: 'bot', 
        text: botText || "Perdemos la señal en el túnel de Glandon...", 
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'bot', 
        text: "⚠️ **AVERÍA MECÁNICA:** No hay conexión con el Cerebro. Revisa si la API_KEY está bien configurada en el panel de control.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col w-full h-[600px] bg-slate-950 border border-white/10 rounded-[32px] overflow-hidden shadow-2xl relative">
      {/* HEADER DE LA IA */}
      <div className="p-5 border-b border-white/5 bg-white/5 backdrop-blur-xl flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-2xl bg-purple-600 flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.4)]">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-950 animate-pulse"></div>
          </div>
          <div>
            <h2 className="text-sm font-black text-white uppercase tracking-wider leading-none">Cerebro Frikis v3.0</h2>
            <p className="text-[10px] text-purple-400 font-bold uppercase mt-1 tracking-tighter">Motor de Inteligencia Ciclista</p>
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

      {/* CHAT AREA */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-90">
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
            Calculando vatios en el Tourmalet...
          </div>
        )}
      </div>

      {/* INPUT AREA */}
      <div className="p-4 bg-slate-950 border-t border-white/5">
        <div className="relative flex items-center gap-3">
          <input 
            type="text" 
            value={input} 
            onChange={(e) => setInput(e.target.value)} 
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={mode === 'pcs' ? "Pregunta sobre la liga o mortadelas..." : "Busca una leyenda del ciclismo..."}
            className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm focus:border-purple-500 focus:bg-white/10 outline-none text-white transition-all placeholder:text-slate-600 shadow-inner"
          />
          <button 
            onClick={handleSend} 
            disabled={!input.trim() || loading}
            className="w-14 h-14 bg-purple-600 hover:bg-purple-500 disabled:bg-slate-800 text-white rounded-2xl flex items-center justify-center transition-all shadow-xl hover:shadow-purple-500/20 disabled:shadow-none group"
          >
            <Send className={`w-6 h-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform ${loading ? 'opacity-0' : 'opacity-100'}`} />
            {loading && <Loader2 className="w-6 h-6 animate-spin absolute" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CyclingAI;
