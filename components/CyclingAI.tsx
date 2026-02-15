
import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Zap, Radio, History, ExternalLink, Globe, LayoutGrid } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

type Mode = 'pcs' | 'encyclopedia';
type Message = { role: 'user' | 'bot'; text: string; timestamp: string; isError?: boolean; sources?: any[] };

const CyclingAI: React.FC = () => {
  const [mode, setMode] = useState<Mode | null>(null);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const systemInstructions = {
    pcs: `Eres 'Radio Tour Frikis', el asistente técnico definitivo para porras de Velogames. 
          Tu misión es analizar corredores y dar consejos de porra basados EXCLUSIVAMENTE en datos recientes.
          USA SIEMPRE LA HERRAMIENTA DE BÚSQUEDA DE GOOGLE enfocándote en procyclingstats.com.
          FORMATO DE RESPUESTA: Responde siempre en varios párrafos cortos separados por un salto de línea doble para facilitar la lectura. 
          Tono: Divertido, experto, usa términos como 'mortadela' (corredor barato/revelación) y 'vatios'.`,
    encyclopedia: `Eres el Historiador Legendario de la Liga Frikis. 
          Busca en internet hitos, gestas y anécdotas de la historia del ciclismo.
          FORMATO DE RESPUESTA: Divide tu explicación en párrafos claros y épicos. 
          Habla de la mística del deporte.`
  };

  useEffect(() => {
    if (mode) {
      const welcome = mode === 'pcs' 
        ? '🎙️ **Radio PCS:** ¿En qué corredor estás pensando? Consultaré ProCyclingStats ahora mismo.' 
        : '📚 **Enciclopedia:** El archivo histórico está abierto. ¿Qué gesta quieres revivir?';
      
      setMessages([{ 
        role: 'bot', 
        text: welcome, 
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
      }]);
    }
  }, [mode]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, loading]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading || !mode) return;

    const apiKey = process.env.API_KEY;
    if (!apiKey || apiKey === "undefined") {
      setMessages(prev => [...prev, { 
        role: 'bot', text: "❌ Error: Configura tu API KEY.", timestamp: "Error", isError: true 
      }]);
      return;
    }

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text, timestamp: time }]);
    setLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey });
      const prompt = mode === 'pcs' 
        ? `Analiza a este corredor o carrera basándote prioritariamente en datos de procyclingstats.com: ${text}`
        : text;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          systemInstruction: systemInstructions[mode],
          tools: [{ googleSearch: {} }],
          temperature: 0.7,
        }
      });

      const botResponse = response.text;
      const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks;

      setMessages(prev => [...prev, { 
        role: 'bot', 
        text: botResponse || "No se ha podido sintonizar la radio...", 
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sources
      }]);
    } catch (err: any) {
      setMessages(prev => [...prev, { 
        role: 'bot', text: "⚠️ Error en la conexión. El puerto es demasiado duro.", timestamp: "Error", isError: true 
      }]);
    } finally {
      setLoading(false);
    }
  };

  if (!mode) {
    return (
      <div className="flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-500">
        <div className="bg-gradient-to-br from-purple-900/40 to-slate-900 border border-purple-500/20 rounded-[32px] p-10 text-center shadow-2xl backdrop-blur-xl">
          <div className="w-16 h-16 bg-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-purple-500/20">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-4">Entrenador Virtual</h2>
          <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-10 opacity-70 italic">Selecciona tu modo de entrenamiento</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button 
              onClick={() => setMode('pcs')}
              className="group p-6 bg-white/5 border border-white/10 rounded-2xl hover:bg-blue-600/10 hover:border-blue-500/50 transition-all text-left"
            >
              <Radio className="w-6 h-6 text-blue-500 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-white font-black uppercase italic tracking-tight mb-2">Asistente de Porras</h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase leading-relaxed group-hover:text-blue-400 transition-colors">
                Análisis técnico basado en ProCyclingStats. Puntos, estado de forma y mortadelas.
              </p>
            </button>

            <button 
              onClick={() => setMode('encyclopedia')}
              className="group p-6 bg-white/5 border border-white/10 rounded-2xl hover:bg-purple-600/10 hover:border-purple-500/50 transition-all text-left"
            >
              <History className="w-6 h-6 text-purple-500 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-white font-black uppercase italic tracking-tight mb-2">Enciclopedia Frikis</h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase leading-relaxed group-hover:text-purple-400 transition-colors">
                Hitos históricos, gestas legendarias y el archivo secreto del ciclismo.
              </p>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-[650px] bg-slate-950 border border-white/10 rounded-[32px] overflow-hidden shadow-2xl relative animate-in fade-in duration-500">
      {/* Header */}
      <div className="p-5 border-b border-white/5 bg-slate-900/80 flex items-center justify-between backdrop-blur-xl z-10">
        <div className="flex items-center gap-3">
          <button onClick={() => setMode(null)} className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
             <LayoutGrid className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-xs font-black text-white uppercase tracking-widest leading-none mb-1">
              {mode === 'pcs' ? 'Asistente PCS' : 'Enciclopedia'}
            </h2>
            <div className="flex items-center gap-1.5">
              <div className="w-1 h-1 rounded-full bg-blue-500 animate-pulse"></div>
              <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">IA Conectada</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[9px] font-black text-slate-400 uppercase tracking-widest">
          {mode === 'pcs' ? <Globe className="w-3 h-3 text-blue-500" /> : <History className="w-3 h-3 text-purple-500" />}
          {mode === 'pcs' ? 'Rastreando PCS' : 'Archivo Histórico'}
        </div>
      </div>

      {/* Chat Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-hide">
        {messages.map((m, i) => (
          <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
            <div className={`max-w-[90%] p-5 rounded-3xl shadow-xl leading-relaxed whitespace-pre-wrap ${
              m.role === 'user' 
                ? 'bg-blue-600 text-white font-bold text-sm rounded-tr-none' 
                : m.isError 
                  ? 'bg-red-500/10 border border-red-500/20 text-red-200 text-sm rounded-tl-none'
                  : 'bg-slate-900 border border-white/5 text-slate-200 text-sm rounded-tl-none font-medium'
            }`}>
              {m.text}
              
              {m.sources && m.sources.length > 0 && (
                <div className="mt-4 pt-4 border-t border-white/5 flex flex-wrap gap-2">
                   {m.sources.map((src: any, idx: number) => (
                     <span key={idx} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white/5 text-[8px] font-black text-blue-400 uppercase border border-white/5">
                       <ExternalLink className="w-2 h-2" /> Fuente {idx + 1}
                     </span>
                   ))}
                </div>
              )}
            </div>
            <span className="text-[8px] text-slate-700 font-black mt-2 uppercase tracking-widest px-2">
              {m.role === 'user' ? 'Directivo' : 'Cerebro'} • {m.timestamp}
            </span>
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-3 text-blue-500 text-[10px] font-black uppercase tracking-[0.2em] bg-blue-500/5 p-4 rounded-2xl border border-blue-500/10 w-fit">
            <Loader2 className="w-4 h-4 animate-spin" />
            Buscando vatios en la red...
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-6 bg-slate-900/50 border-t border-white/5 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <input 
            type="text" 
            value={input} 
            onChange={(e) => setInput(e.target.value)} 
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={mode === 'pcs' ? "Pregunta por un corredor..." : "¿Qué quieres saber del pasado?"}
            className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm text-white outline-none focus:border-blue-500/50 transition-all font-bold placeholder:text-slate-600"
          />
          <button 
            onClick={handleSend} 
            disabled={!input.trim() || loading}
            className="w-14 h-14 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white rounded-2xl flex items-center justify-center transition-all shadow-xl active:scale-95"
          >
            <Send className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CyclingAI;
