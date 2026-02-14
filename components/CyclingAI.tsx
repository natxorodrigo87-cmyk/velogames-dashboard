
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Send, Globe, BookOpen, Database, Loader2, Key, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface CyclingAIProps {
  mode: 'pcs' | 'encyclopedia';
  onClose: () => void;
}

type Message = {
  role: 'user' | 'bot';
  text: string;
  sources?: { uri: string; title: string }[];
  isError?: boolean;
  needsKey?: boolean;
};

const CyclingAI: React.FC<CyclingAIProps> = ({ mode, onClose }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [isKeyActive, setIsKeyActive] = useState(false);
  const [status, setStatus] = useState<'idle' | 'connecting' | 'error' | 'success'>('idle');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Comprobar si ya hay una llave al iniciar
  useEffect(() => {
    const checkKey = async () => {
      // @ts-ignore
      if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
        // @ts-ignore
        const active = await window.aistudio.hasSelectedApiKey();
        setIsKeyActive(active);
      }
    };
    checkKey();

    const welcome = mode === 'pcs' 
      ? '¡Radio Tour activa! 🎙️ Necesito tu llave de Google para darte datos reales de carreras. Pulsa el botón AMARILLO arriba.'
      : 'Biblioteca Frikis abierta. 📚 Pulsa el botón AMARILLO para activar mi memoria histórica.';
    setMessages([{ role: 'bot', text: welcome }]);
  }, [mode]);

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
        // Asumimos éxito según las guías
        setIsKeyActive(true);
        setStatus('success');
      } catch (e) {
        console.error("Error al abrir selector de llaves", e);
      }
    } else {
      alert("El selector de llaves no está disponible en este navegador. Asegúrate de estar en el entorno correcto.");
    }
  };

  const handleSend = async (manualText?: string) => {
    const userText = manualText || input.trim();
    if (!userText || loading) return;

    if (!manualText) {
      setInput('');
      setMessages(prev => [...prev, { role: 'user', text: userText }]);
    }
    
    setLoading(true);
    setStatus('connecting');

    try {
      // Creamos la instancia justo antes de llamar para pillar la key nueva
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const modelName = 'gemini-3-flash-preview';

      const systemInstruction = mode === 'pcs'
        ? 'Eres el analista técnico de la Liga Frikis. Usa Google Search para dar resultados de ciclismo actuales. Eres directo y usas jerga de ciclista.'
        : 'Eres el historiador de la Liga Frikis. Sabes todo sobre ciclismo clásico y leyendas del pedal.';

      let response;
      try {
        response = await ai.models.generateContent({
          model: modelName,
          contents: userText,
          config: {
            systemInstruction,
            tools: mode === 'pcs' ? [{ googleSearch: {} }] : undefined,
          },
        });
      } catch (innerError: any) {
        // Si falla la búsqueda, intentamos sin herramientas
        response = await ai.models.generateContent({
          model: modelName,
          contents: userText,
          config: { systemInstruction },
        });
      }

      const botText = response.text || "La señal es débil en el puerto...";
      const sources: { uri: string; title: string }[] = [];
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      
      if (chunks) {
        chunks.forEach((c: any) => {
          if (c.web?.uri) {
            sources.push({ uri: c.web.uri, title: c.web.title || 'Referencia' });
          }
        });
      }

      setMessages(prev => [
        ...prev.filter(m => !m.isError), 
        { role: 'bot', text: botText, sources: sources.length > 0 ? sources : undefined }
      ]);
      setStatus('success');

    } catch (error: any) {
      setStatus('error');
      const errorStr = error.toString().toLowerCase();
      
      if (errorStr.includes("not found") || errorStr.includes("401") || errorStr.includes("key")) {
        setIsKeyActive(false);
        setMessages(prev => [...prev, { 
          role: 'bot', 
          text: "⚠️ ¡LA LLAVE NO FUNCIONA! Pulsa el botón AMARILLO de arriba, selecciona una llave válida de un proyecto con facturación activa y vuelve a intentarlo.", 
          isError: true,
          needsKey: true
        }]);
      } else {
        setMessages(prev => [...prev, { 
          role: 'bot', 
          text: "¡PÁJARA! Ha habido un error de conexión. Reintenta en unos segundos.", 
          isError: true 
        }]);
      }
    } finally {
      setLoading(false);
    }
  };

  const isPcs = mode === 'pcs';

  return (
    <div className="flex flex-col w-full h-full bg-slate-950 text-white overflow-hidden md:rounded-3xl border border-white/10 shadow-2xl">
      {/* HEADER */}
      <div className={`shrink-0 p-5 pt-16 md:pt-5 border-b border-white/10 flex items-center justify-between ${isPcs ? 'bg-blue-700' : 'bg-amber-700'}`}>
        <div className="flex items-center gap-4">
          <div className="p-2.5 bg-white/20 rounded-2xl backdrop-blur-md">
            {isPcs ? <Globe className="w-5 h-5" /> : <BookOpen className="w-5 h-5" />}
          </div>
          <div>
            <h2 className="text-xs font-black uppercase italic tracking-tighter leading-none">
              {isPcs ? 'Radio Tour' : 'Biblioteca'}
            </h2>
            <div className="flex items-center gap-1.5 mt-1">
              <span className={`w-1.5 h-1.5 rounded-full ${isKeyActive ? 'bg-green-400' : 'bg-red-500 animate-pulse'}`} />
              <span className="text-[8px] text-white/70 font-black uppercase tracking-widest">
                {isKeyActive ? 'Llave Conectada' : 'Falta Llave'}
              </span>
            </div>
          </div>
        </div>

        {/* BOTÓN DE CONFIGURACIÓN - EL QUE TIENES QUE PULSAR */}
        <button 
          onClick={handleOpenKey}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-tighter transition-all active:scale-90 border-2 shadow-lg ${
            isKeyActive 
            ? 'bg-slate-900 border-white/20 text-white hover:bg-slate-800' 
            : 'bg-yellow-400 border-yellow-200 text-black hover:bg-yellow-300 animate-bounce'
          }`}
        >
          <Key className="w-4 h-4" />
          <span>{isKeyActive ? 'Cambiar Llave' : 'Configurar Llave'}</span>
        </button>
      </div>

      {/* MESSAGES */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
            <div className={`max-w-[85%] ${m.role === 'user' ? 'flex flex-col items-end' : ''}`}>
              <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-xl ${
                m.role === 'user' 
                  ? 'bg-blue-600 text-white rounded-tr-none border border-white/10' 
                  : m.isError 
                    ? 'bg-red-500/10 border border-red-500/30 text-red-200' 
                    : 'bg-slate-900/95 text-slate-200 border border-white/5 rounded-tl-none backdrop-blur-md'
              }`}>
                {m.text}
                
                {m.needsKey && (
                  <button 
                    onClick={handleOpenKey}
                    className="mt-4 flex items-center gap-3 w-full justify-center py-3 bg-yellow-400 text-black rounded-xl font-black text-[10px] uppercase shadow-lg"
                  >
                    <Key className="w-4 h-4" /> Abrir Selector de Google
                  </button>
                )}
              </div>
              
              {m.sources && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {m.sources.map((s, idx) => (
                    <a key={idx} href={s.uri} target="_blank" rel="noopener noreferrer"
                      className="text-[9px] text-blue-400 font-black flex items-center gap-1.5 bg-blue-500/10 px-3 py-2 rounded-lg border border-blue-500/20 uppercase tracking-tighter">
                      <Database className="w-3 h-3" /> {s.title}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-900/60 p-4 rounded-2xl border border-white/5 flex items-center gap-3">
              <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
              <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest italic">Buscando en PCS...</span>
            </div>
          </div>
        )}
      </div>

      {/* INPUT */}
      <div className="shrink-0 p-4 bg-slate-950 border-t border-white/10 pb-12 md:pb-6">
        <div className="flex gap-2">
          <input 
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={isKeyActive ? "Pregunta sobre el Tour, Giro..." : "Primero activa tu llave arriba ⬆️"}
            disabled={!isKeyActive && messages.length > 1}
            className="flex-1 bg-slate-900 border border-white/10 rounded-2xl py-4 px-5 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-slate-700"
          />
          <button 
            onClick={() => handleSend()}
            disabled={loading || !input.trim() || (!isKeyActive && messages.length > 1)}
            className="bg-white text-black p-4 rounded-2xl shadow-xl active:scale-90 transition-all disabled:opacity-20"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CyclingAI;
