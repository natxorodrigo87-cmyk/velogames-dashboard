
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
    pcs: "Eres 'Radio Tour Frikis', experto en Velogames. Tono informal, divertido y técnico. Habla de 'mortadelas' (ciclistas baratos de 4-6 créditos) y bromea con los abandonos. Responde breve y con emojis 🚲.",
    encyclopedia: "Eres el Historiador de la Liga. Conoces leyendas (Merckx, Indurain). Tono épico y legendario."
  };

  useEffect(() => {
    const welcomeMsg = mode === 'pcs' 
      ? '🎙️ **Radio Tour:** ¿Analizamos alguna mortadela hoy?' 
      : '📚 **Archivo:** ¿Qué leyenda quieres recordar?';
    
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

    const apiKey = process.env.API_KEY;

    if (!apiKey || apiKey === "undefined") {
      setMessages(prev => [...prev, { 
        role: 'bot', 
        text: "❌ **ERROR DE CLAVE:** Netlify no está pasando la API_KEY correctamente. Verifica que en Netlify esté guardada como 'API_KEY'.",
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

      const botText = response.text || "Se ha cortado la señal...";
      setMessages(prev => [...prev, { 
        role: 'bot', 
        text: botText, 
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } catch (error: any) {
      console.error("AI Error:", error);
      setMessages(prev => [...prev, { 
        role: 'bot', 
        text: `⚠️ **ERROR TÉCNICO:** ${error?.message || 'Fallo de conexión'}. Revisa que tu clave de Google AI Studio sea correcta.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col w-full h-[600px] bg-slate-950 border border-white/10 rounded-[32px] overflow-hidden shadow-2xl relative">
      <div className="p-5 border-b border-white/5 bg-white/5 backdrop-blur-xl flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-purple-600 flex items-center justify-center">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-black text-white uppercase tracking-wider">Cerebro Frikis</h2>
            <p className="text-[10px] text-purple-400 font-bold uppercase tracking-tighter">Powered by Gemini</p>
          </div>
        </div>
        
        <div className="flex gap-2 p-1 bg-black/40 rounded-2xl border border-white/5">
          <button onClick={() => setMode('pcs')} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${mode === 'pcs' ? 'bg-blue-600 text-white' : 'text-slate-500'}`}>
            <Radio className="w-3 h-3 inline mr-2" /> Radio PCS
          </button>
          <button onClick={() => setMode('encyclopedia')} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${mode === 'encyclopedia' ? 'bg-purple-600 text-white' : 'text-slate-500'}`}>
            <History className="w-3 h-3 inline mr-2" /> Historia
          </button>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-950/50">
        {messages.map((m, i) => (
          <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`max-w-[85%] p-4 rounded-2xl ${m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-900 text-slate-200 border border-white/10'}`}>
              <div className="text-sm leading-relaxed whitespace-pre-wrap">{m.text}</div>
            </div>
            <span className="text-[9px] font-black text-slate-600 uppercase mt-2">{m.role === 'user' ? 'Tú' : 'Cerebro'} • {m.timestamp}</span>
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-3 text-purple-400 text-[10px] font-black uppercase tracking-widest animate-pulse">
            <Loader2 className="w-3 h-3 animate-spin" /> Subiendo el Tourmalet...
          </div>
        )}
      </div>

      <div className="p-4 bg-slate-950 border-t border-white/5">
        <div className="relative flex items-center gap-3">
          <input 
            type="text" 
            value={input} 
            onChange={(e) => setInput(e.target.value)} 
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Escribe aquí..."
            className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm text-white outline-none focus:border-purple-500 transition-all"
          />
          <button 
            onClick={handleSend} 
            disabled={!input.trim() || loading}
            className="w-14 h-14 bg-purple-600 hover:bg-purple-500 disabled:bg-slate-800 text-white rounded-2xl flex items-center justify-center transition-all shadow-xl"
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
