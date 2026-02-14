
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Send, Globe, BookOpen, Database, Loader2, Key, Info } from 'lucide-react';

interface CyclingAIProps {
  mode: 'pcs' | 'encyclopedia';
  onClose: () => void;
}

type Message = {
  role: 'user' | 'bot';
  text: string;
  sources?: { uri: string; title: string }[];
  isError?: boolean;
};

const CyclingAI: React.FC<CyclingAIProps> = ({ mode, onClose }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const welcome = mode === 'pcs' 
      ? '¡Radio Tour activa! 🎙️ Pregúntame sobre cualquier carrera o corredor actual (PCS).'
      : 'Biblioteca Frikis abierta. 📚 ¿De qué leyenda o carrera histórica quieres que hablemos?';
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
        setMessages(prev => [...prev, { role: 'bot', text: '✅ Intento de conexión con Google realizado. Prueba a enviar tu mensaje ahora.' }]);
      } catch (e) {
        alert("No se pudo abrir el selector. Verifica que no tengas bloqueadores de anuncios o pop-ups activos.");
      }
    } else {
      setMessages(prev => [...prev, { 
        role: 'bot', 
        isError: true,
        text: '❌ El selector de llaves de Google no está disponible en este navegador o entorno. Si la IA no responde, es posible que falte la configuración del sistema.' 
      }]);
    }
  };

  const handleSend = async () => {
    const userText = input.trim();
    if (!userText || loading) return;

    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setLoading(true);

    try {
      // Usamos la API KEY que el sistema debería inyectar automáticamente
      const apiKey = process.env.API_KEY;
      
      if (!apiKey) {
        throw new Error("API_KEY_MISSING");
      }

      const ai = new GoogleGenAI({ apiKey });
      const modelName = 'gemini-3-flash-preview';

      const systemInstruction = mode === 'pcs'
        ? 'Eres el analista de la Liga Frikis. Usa Google Search para dar datos de Procyclingstats. Responde con tono experto y apasionado.'
        : 'Eres el historiador de la Liga Frikis. Conoces toda la historia del ciclismo desde Coppi hasta Indurain.';

      const response = await ai.models.generateContent({
        model: modelName,
        contents: userText,
        config: {
          systemInstruction,
          tools: mode === 'pcs' ? [{ googleSearch: {} }] : undefined,
        },
      });

      const botText = response.text || "La señal de Radio Tour se ha cortado...";
      const sources: { uri: string; title: string }[] = [];
      
      // Extraer fuentes si existen (Google Search Grounding)
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      if (chunks) {
        chunks.forEach((c: any) => {
          if (c.web?.uri) {
            sources.push({ uri: c.web.uri, title: c.web.title || 'Referencia PCS' });
          }
        });
      }

      setMessages(prev => [
        ...prev, 
        { role: 'bot', text: botText, sources: sources.length > 0 ? sources : undefined }
      ]);

    } catch (error: any) {
      console.error(error);
      let errorMsg = "¡Pájara! Ha ocurrido un error inesperado. Reintenta.";
      
      if (error.message === "API_KEY_MISSING" || error.toString().includes("401") || error.toString().includes("403")) {
        errorMsg = "⚠️ Error de autorización. La IA no tiene una llave válida para funcionar en este entorno.";
      }

      setMessages(prev => [...prev, { 
        role: 'bot', 
        text: errorMsg, 
        isError: true 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const isPcs = mode === 'pcs';

  return (
    <div className="flex flex-col w-full h-full bg-slate-950 text-white overflow-hidden md:rounded-3xl border border-white/10 shadow-2xl">
      {/* HEADER */}
      <div className={`shrink-0 p-5 pt-16 md:pt-5 border-b border-white/10 flex items-center justify-between ${isPcs ? 'bg-blue-800' : 'bg-amber-800'}`}>
        <div className="flex items-center gap-4">
          <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-md">
            {isPcs ? <Globe className="w-5 h-5" /> : <BookOpen className="w-5 h-5" />}
          </div>
          <div>
            <h2 className="text-xs font-black uppercase italic tracking-wider">{isPcs ? 'Radio Tour Live' : 'Biblioteca Frikis'}</h2>
            <p className="text-[8px] text-white/50 uppercase font-bold">Powered by Gemini AI</p>
          </div>
        </div>
        
        <button 
          onClick={handleOpenKey}
          className="p-2 hover:bg-white/10 rounded-lg text-white/70 hover:text-white transition-colors flex items-center gap-2"
          title="Configurar Llave si falla"
        >
          <Key className="w-4 h-4" />
          <span className="text-[10px] font-black uppercase">Key</span>
        </button>
      </div>

      {/* CHAT AREA */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] ${m.role === 'user' ? 'flex flex-col items-end' : ''}`}>
              <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                m.role === 'user' 
                  ? 'bg-blue-600 text-white rounded-tr-none' 
                  : m.isError 
                    ? 'bg-red-500/10 border border-red-500/30 text-red-200' 
                    : 'bg-slate-900 border border-white/5 rounded-tl-none'
              }`}>
                {m.text}
                
                {m.isError && (
                  <div className="mt-3 flex flex-col gap-2">
                    <p className="text-[10px] opacity-70 italic">Intenta pulsar el icono de la llave arriba a la derecha si estás en el entorno oficial.</p>
                  </div>
                )}
              </div>
              
              {m.sources && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {m.sources.map((s, idx) => (
                    <a key={idx} href={s.uri} target="_blank" rel="noopener noreferrer"
                      className="text-[9px] text-blue-400 font-bold bg-blue-500/10 px-2 py-1 rounded border border-blue-500/20 hover:bg-blue-500/20 transition-colors flex items-center gap-1">
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
            <div className="bg-slate-900 p-4 rounded-2xl border border-white/5 flex items-center gap-3">
              <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
              <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest animate-pulse">Consultando PCS...</span>
            </div>
          </div>
        )}
      </div>

      {/* INPUT AREA */}
      <div className="shrink-0 p-4 bg-slate-950 border-t border-white/10 pb-10 md:pb-6">
        <div className="flex gap-2">
          <input 
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Haz tu pregunta..."
            className="flex-1 bg-slate-900 border border-white/10 rounded-xl py-4 px-4 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-all"
          />
          <button 
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="bg-white text-black p-4 rounded-xl shadow-lg active:scale-95 transition-all disabled:opacity-20 hover:bg-blue-500 hover:text-white"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CyclingAI;
