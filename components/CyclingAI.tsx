import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Zap, Radio, History, ExternalLink, Globe, LayoutGrid, ChevronLeft } from 'lucide-react';
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
    pcs: `Eres 'Radio Tour Frikis', el estratega jefe de la Liga Frikis. 
          Tu objetivo es ayudar a los usuarios a ganar en Velogames analizando corredores, estado de forma y recorridos.
          REGLAS CRÍTICAS:
          1. USA SIEMPRE LA HERRAMIENTA DE BÚSQUEDA DE GOOGLE.
          2. PRIORIZA TOTALMENTE LA INFORMACIÓN DE procyclingstats.com (PCS).
          3. RESPONDE SIEMPRE EN PÁRRAFOS CLAROS Y SEPARADOS (mínimo 2 o 3 párrafos). No uses listas de puntos aburridas a menos que sea estrictamente necesario.
          4. Usa términos como 'mortadela' para corredores baratos que rinden mucho.
          5. Idioma: Español. Tono: Experto, apasionado y un poco canalla.`,
    encyclopedia: `Eres el Historiador de la Liga Frikis. Tienes acceso a toda la historia del ciclismo.
          REGLAS CRÍTICAS:
          1. USA LA HERRAMIENTA DE BÚSQUEDA para verificar datos históricos.
          2. RESPONDE SIEMPRE EN PÁRRAFOS ESTRUCTURADOS (mínimo 2 o 3 párrafos). Dale un toque épico y narrativo.
          3. Habla de gestas, leyendas como Indurain, Merckx o Pantani, y la dureza del ciclismo antiguo.
          4. Idioma: Español.`
  };

  useEffect(() => {
    if (mode) {
      const welcome = mode === 'pcs' 
        ? '🎙️ **Radio PCS conectada.** Analizaré ProCyclingStats para encontrarte esa mortadela ganadora. ¿Por qué corredor o carrera quieres preguntar?' 
        : '📚 **Archivo Histórico abierto.** Las leyendas del pedal te escuchan. ¿Qué momento de la historia quieres que te narre hoy?';
      
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
        role: 'bot', text: "❌ Error: API_KEY no configurada en el servidor.", timestamp: "Sistema", isError: true 
      }]);
      return;
    }

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text, timestamp: time }]);
    setLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey });
      
      // Construimos el prompt reforzando la búsqueda en PCS si estamos en ese modo
      const query = mode === 'pcs' 
        ? `Busca en procyclingstats.com información actualizada sobre: ${text}. Explícame su estado de forma, resultados recientes y potencial para Velogames en varios párrafos.`
        : `Explícame en varios párrafos la historia o curiosidades de: ${text}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: query,
        config: {
          systemInstruction: systemInstructions[mode],
          tools: [{ googleSearch: {} }],
          temperature: 0.8,
        }
      });

      const botResponse = response.text;
      const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks;

      setMessages(prev => [...prev, { 
        role: 'bot', 
        text: botResponse || "La señal de radio es débil en este puerto...", 
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sources
      }]);
    } catch (err: any) {
      console.error(err);
      setMessages(prev => [...prev, { 
        role: 'bot', text: "⚠️ Hemos pinchado en la subida. Inténtalo de nuevo en unos segundos.", timestamp: "Error", isError: true 
      }]);
    } finally {
      setLoading(false);
    }
  };

  if (!mode) {
    return (
      <div className="flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-500">
        <div className="bg-gradient-to-br from-purple-900/40 via-slate-900 to-black border border-purple-500/20 rounded-[40px] p-12 text-center shadow-2xl backdrop-blur-3xl relative overflow-hidden">
          {/* Decoración de fondo */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl"></div>

          <div className="relative z-10">
            <div className="w-20 h-20 bg-gradient-to-tr from-purple-600 to-blue-500 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-purple-500/30">
              <Zap className="w-10 h-10 text-white fill-white/20" />
            </div>
            <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter mb-4">Entrenador Virtual</h2>
            <p className="text-slate-400 text-xs font-black uppercase tracking-[0.3em] mb-12 opacity-60">Sintoniza la frecuencia ganadora</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              <button 
                onClick={() => setMode('pcs')}
                className="group relative p-8 bg-slate-900/50 border border-white/5 rounded-3xl hover:bg-blue-600/10 hover:border-blue-500/50 transition-all text-left overflow-hidden shadow-lg"
              >
                <Radio className="w-8 h-8 text-blue-500 mb-6 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500" />
                <h3 className="text-xl font-black text-white uppercase italic tracking-tight mb-3">Asistente de Porras</h3>
                <p className="text-[11px] text-slate-500 font-bold uppercase leading-relaxed group-hover:text-blue-400 transition-colors">
                  Análisis técnico vía PCS. Encuentra mortadelas y vatios para tu equipo.
                </p>
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-100 transition-opacity">
                  <Globe className="w-12 h-12 text-blue-500" />
                </div>
              </button>

              <button 
                onClick={() => setMode('encyclopedia')}
                className="group relative p-8 bg-slate-900/50 border border-white/5 rounded-3xl hover:bg-purple-600/10 hover:border-purple-500/50 transition-all text-left overflow-hidden shadow-lg"
              >
                <History className="w-8 h-8 text-purple-500 mb-6 group-hover:scale-110 group-hover:-rotate-12 transition-transform duration-500" />
                <h3 className="text-xl font-black text-white uppercase italic tracking-tight mb-3">Enciclopedia Frikis</h3>
                <p className="text-[11px] text-slate-500 font-bold uppercase leading-relaxed group-hover:text-purple-400 transition-colors">
                  El archivo definitivo de gestas históricas y leyendas del pedal.
                </p>
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-100 transition-opacity">
                  <Zap className="w-12 h-12 text-purple-500" />
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-[700px] bg-slate-950 border border-white/10 rounded-[40px] overflow-hidden shadow-2xl relative animate-in fade-in duration-700">
      {/* Header */}
      <div className="p-6 border-b border-white/5 bg-slate-900/90 flex items-center justify-between backdrop-blur-2xl z-20">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setMode(null)} 
            className="w-10 h-10 rounded-2xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-all active:scale-90"
            title="Volver al menú"
          >
             <ChevronLeft className="w-6 h-6" />
          </button>
          <div>
            <h2 className="text-sm font-black text-white uppercase tracking-widest leading-none mb-1.5 flex items-center gap-2">
              {mode === 'pcs' ? <Radio className="w-3.5 h-3.5 text-blue-500" /> : <History className="w-3.5 h-3.5 text-purple-500" />}
              {mode === 'pcs' ? 'RADIO PCS' : 'ENCICLOPEDIA'}
            </h2>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest">Motor Gemini 3.0 Conectado</span>
            </div>
          </div>
        </div>
        
        <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black text-slate-400 uppercase tracking-widest shadow-inner">
          <Globe className={`w-3.5 h-3.5 ${mode === 'pcs' ? 'text-blue-500' : 'text-purple-500'}`} />
          {mode === 'pcs' ? 'Filtro: ProCyclingStats' : 'Búsqueda Global'}
        </div>
      </div>

      {/* Chat Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-10 scrollbar-hide bg-gradient-to-b from-transparent to-black/40">
        {messages.map((m, i) => (
          <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-4 duration-500`}>
            <div className={`max-w-[92%] p-6 rounded-[32px] shadow-2xl leading-relaxed whitespace-pre-wrap text-sm md:text-base ${
              m.role === 'user' 
                ? 'bg-blue-600 text-white font-bold rounded-tr-none' 
                : m.isError 
                  ? 'bg-red-500/10 border border-red-500/20 text-red-200 rounded-tl-none'
                  : 'bg-slate-900/80 border border-white/5 text-slate-200 rounded-tl-none backdrop-blur-sm'
            }`}>
              {m.text}
              
              {m.sources && m.sources.length > 0 && (
                <div className="mt-6 pt-6 border-t border-white/5 flex flex-wrap gap-3">
                   {m.sources.map((src: any, idx: number) => (
                     <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/5 text-[9px] font-black text-blue-400 uppercase border border-white/5 hover:bg-white/10 transition-colors cursor-default">
                       <ExternalLink className="w-3 h-3" /> Ver Fuente {idx + 1}
                     </span>
                   ))}
                </div>
              )}
            </div>
            <div className="mt-3 flex items-center gap-2 px-3">
               <span className="text-[9px] text-slate-700 font-black uppercase tracking-[0.2em]">
                {m.role === 'user' ? 'Escuadra' : 'Cerebro'}
              </span>
              <span className="w-1 h-1 rounded-full bg-slate-800"></span>
              <span className="text-[9px] text-slate-700 font-black uppercase tracking-[0.2em]">{m.timestamp}</span>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-4 text-blue-500 text-[11px] font-black uppercase tracking-[0.3em] bg-blue-500/5 p-6 rounded-3xl border border-blue-500/10 w-fit animate-pulse shadow-xl">
            <Loader2 className="w-5 h-5 animate-spin" />
            Escaneando el pelotón...
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-8 bg-slate-900/80 border-t border-white/5 backdrop-blur-3xl">
        <div className="flex items-center gap-4 max-w-3xl mx-auto">
          <input 
            type="text" 
            value={input} 
            onChange={(e) => setInput(e.target.value)} 
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={mode === 'pcs' ? "Pregunta por un corredor o carrera..." : "¿Qué quieres saber de la historia del pedal?"}
            className="flex-1 bg-black/40 border border-white/10 rounded-2xl px-7 py-5 text-sm text-white outline-none focus:border-blue-500/50 transition-all font-bold placeholder:text-slate-700 shadow-inner"
          />
          <button 
            onClick={handleSend} 
            disabled={!input.trim() || loading}
            className="w-16 h-16 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-2xl flex items-center justify-center transition-all shadow-2xl active:scale-90 group"
          >
            <Send className="w-7 h-7 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CyclingAI;