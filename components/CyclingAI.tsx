import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
// Added missing Settings import and removed unused Database import
import { Send, Globe, BookOpen, Loader2, Key, AlertCircle, MousePointer2, ExternalLink, HelpCircle, Settings } from 'lucide-react';

interface CyclingAIProps {
  mode: 'pcs' | 'encyclopedia';
  onClose: () => void;
}

type Message = {
  role: 'user' | 'bot';
  text: string;
  sources?: { uri: string; title: string }[];
  isError?: boolean;
  isGuide?: boolean;
};

const CyclingAI: React.FC<CyclingAIProps> = ({ mode, onClose }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasKey, setHasKey] = useState<boolean | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const welcome = mode === 'pcs' 
      ? '¡Radio Tour activa! 🎙️ Estoy listo para buscar datos en tiempo real.'
      : 'Biblioteca Frikis abierta. 📚 ¿Qué historia del ciclismo quieres conocer?';
    setMessages([{ role: 'bot', text: welcome }]);
    
    checkApiKey();
  }, [mode]);

  const checkApiKey = async () => {
    // @ts-ignore
    if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
      // @ts-ignore
      const active = await window.aistudio.hasSelectedApiKey();
      setHasKey(active);
    } else {
      // Si no podemos verificar, intentamos leer process.env
      setHasKey(!!process.env.API_KEY && process.env.API_KEY !== "undefined");
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, loading]);

  const handleOpenKey = async () => {
    // @ts-ignore
    if (window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
      try {
        // @ts-ignore
        await window.aistudio.openSelectKey();
        setHasKey(true); // Asumimos éxito por race condition
        setMessages(prev => [...prev, { role: 'bot', text: "🔄 Intentando conectar con la nueva llave... Prueba ahora." }]);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleSend = async () => {
    const userText = input.trim();
    if (!userText || loading) return;

    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setLoading(true);

    try {
      // Following guidelines: ensure instance is created right before making an API call
      // using process.env.API_KEY directly in the initialization object.
      if (!process.env.API_KEY || process.env.API_KEY === "undefined") {
        throw new Error("Requested entity was not found.");
      }

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: userText,
        config: {
          systemInstruction: mode === 'pcs' ? 'Eres un experto en ciclismo que busca datos en tiempo real de Procyclingstats.' : 'Eres un historiador ciclista apasionado por la cultura y el pasado del deporte.',
          tools: mode === 'pcs' ? [{ googleSearch: {} }] : undefined,
        },
      });

      const botText = response.text || "Señal perdida...";
      const sources: { uri: string; title: string }[] = [];
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      if (chunks) {
        chunks.forEach((c: any) => {
          if (c.web?.uri) sources.push({ uri: c.web.uri, title: c.web.title || 'Referencia' });
        });
      }
      setMessages(prev => [...prev, { role: 'bot', text: botText, sources }]);
    } catch (error: any) {
      // If the request fails with a missing key or related error, reset key state to prompt selection
      if (error.message?.includes("Requested entity was not found.") || !process.env.API_KEY) {
        setHasKey(false);
      }
      setMessages(prev => [...prev, { role: 'bot', text: "❌ Error de conexión. Revisa la llave API.", isError: true }]);
    } finally {
      setLoading(false);
    }
  };

  if (hasKey === false) {
    return (
      <div className="flex flex-col w-full h-full bg-slate-950 text-white p-6 overflow-y-auto">
        <div className="max-w-md mx-auto space-y-8 py-10">
          <div className="text-center space-y-4">
            <div className="inline-flex p-4 bg-red-500/10 rounded-full border border-red-500/20 text-red-500 mb-2">
              <Key className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black uppercase italic tracking-tighter">Llave API No Configurada</h2>
            <p className="text-slate-400 text-sm">Si la llave está tachada o no te deja importar proyectos, sigue esta guía:</p>
          </div>

          <div className="space-y-6">
            <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 space-y-4 shadow-2xl">
              <h3 className="text-xs font-black text-blue-400 uppercase tracking-widest flex items-center gap-2">
                <HelpCircle className="w-4 h-4" /> Paso 1: Localiza el Botón
              </h3>
              <p className="text-xs text-slate-300">Fuera de esta ventana, en la esquina <strong>SUPERIOR DERECHA</strong> del editor, verás un icono de llave 🔑 o un botón <strong>"API KEY"</strong>.</p>
              <div className="aspect-video bg-slate-950 rounded-lg border border-white/5 relative overflow-hidden flex items-center justify-center p-4">
                 <div className="absolute top-2 right-2 flex items-center gap-2 bg-blue-600 px-2 py-1 rounded text-[8px] font-bold animate-pulse">
                   <MousePointer2 className="w-2 h-2" /> BOTÓN AQUÍ
                 </div>
                 <div className="text-[10px] text-slate-600 text-center uppercase font-bold tracking-widest">Esquema del Editor</div>
              </div>
            </div>

            <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 space-y-4 shadow-2xl">
              <h3 className="text-xs font-black text-amber-400 uppercase tracking-widest flex items-center gap-2">
                <AlertCircle className="w-4 h-4" /> Paso 2: Solución al "No deja importar"
              </h3>
              <ul className="text-[11px] text-slate-400 space-y-3 list-disc pl-4">
                <li>Ve a <a href="https://console.cloud.google.com" target="_blank" className="text-blue-400 underline" rel="noopener noreferrer">Google Cloud Console</a>.</li>
                <li>Activa la <strong>"Generative Language API"</strong> en tu proyecto.</li>
                <li>Asegúrate de que el proyecto tiene una <strong>cuenta de facturación</strong> vinculada (aunque sea la capa gratuita).</li>
                <li>Vuelve aquí, dale a la llave y ahora sí te dejará importarlo.</li>
              </ul>
            </div>
          </div>

          <button 
            onClick={handleOpenKey}
            className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black uppercase italic tracking-widest transition-all shadow-xl shadow-blue-900/20 active:scale-95 flex items-center justify-center gap-3"
          >
            <Key className="w-5 h-5" /> Abrir Selector de Llave
          </button>
          
          <button 
            onClick={onClose}
            className="w-full py-3 bg-white/5 hover:bg-white/10 text-slate-500 rounded-xl text-xs font-bold uppercase transition-all"
          >
            Volver al Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-full bg-slate-950 text-white overflow-hidden md:rounded-3xl border border-white/10 shadow-2xl">
      {/* HEADER */}
      <div className={`shrink-0 p-5 pt-16 md:pt-5 border-b border-white/10 flex items-center justify-between ${mode === 'pcs' ? 'bg-blue-900' : 'bg-amber-900'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/10 rounded-xl">
            {mode === 'pcs' ? <Globe className="w-5 h-5" /> : <BookOpen className="w-5 h-5" />}
          </div>
          <h2 className="text-xs font-black uppercase tracking-widest">{mode === 'pcs' ? 'Radio Tour' : 'Enciclopedia'}</h2>
        </div>
        <button 
          onClick={handleOpenKey}
          className="flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-[10px] font-black uppercase transition-all"
        >
          <Settings className="w-3 h-3" />
          Ajustes Key
        </button>
      </div>

      {/* CHAT AREA */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[90%] p-4 rounded-2xl text-sm ${
              m.role === 'user' ? 'bg-blue-600 shadow-lg shadow-blue-900/20' : 'bg-slate-900 border border-white/5'
            }`}>
              {m.text}
              {m.sources && m.sources.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-white/5">
                  {m.sources.map((s, idx) => (
                    <a key={idx} href={s.uri} target="_blank" rel="noopener noreferrer" className="text-[9px] font-bold text-blue-400 flex items-center gap-1 bg-blue-400/10 px-2 py-1 rounded">
                      <ExternalLink className="w-3 h-3" /> {s.title}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-900 p-4 rounded-2xl border border-white/5 flex items-center gap-3">
              <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
              <span className="text-[10px] font-black text-slate-500 uppercase italic">Sincronizando...</span>
            </div>
          </div>
        )}
      </div>

      {/* INPUT */}
      <div className="p-4 bg-slate-950 border-t border-white/10 pb-10 md:pb-6">
        <div className="flex gap-2">
          <input 
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Pregunta algo..."
            className="flex-1 bg-slate-900 border border-white/10 rounded-xl py-4 px-5 text-sm focus:outline-none focus:border-blue-500/50 transition-colors"
          />
          <button 
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="bg-white text-black p-4 rounded-xl active:scale-95 disabled:opacity-20 transition-all hover:bg-blue-500 hover:text-white shadow-xl"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CyclingAI;