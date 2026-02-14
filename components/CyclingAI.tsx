
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Send, Globe, BookOpen, Loader2, X, AlertCircle, RefreshCw, Info } from 'lucide-react';

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
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const welcome = mode === 'pcs' 
      ? '🎙️ **Radio Tour:** "¡Atención! Conexión establecida con la base de datos de Procyclingstats. Pregúntame lo que necesites sobre la actualidad del pelotón."'
      : '📚 **Archivo Histórico:** "Bienvenido al archivo de la Liga Frikis. ¿Sobre qué leyenda o hazaña del pasado quieres investigar?"';
    
    setMessages([{ role: 'bot', text: welcome }]);
  }, [mode]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, loading]);

  const openKeySelector = async () => {
    // @ts-ignore
    if (window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
      // @ts-ignore
      await window.aistudio.openSelectKey();
      setMessages(prev => [...prev, { role: 'bot', text: "🔄 Conexión reiniciada. Intenta enviar tu mensaje de nuevo." }]);
    } else {
      alert("No se pudo abrir el selector de llaves. Por favor, recarga la página.");
    }
  };

  const handleSend = async () => {
    const userText = input.trim();
    if (!userText || loading) return;

    const currentApiKey = process.env.API_KEY;
    
    if (!currentApiKey) {
      setMessages(prev => [...prev, { 
        role: 'bot', 
        text: "⚠️ No se detecta ninguna API Key activa. Por favor, pulsa el botón de abajo para vincular tu cuenta de Google.", 
        isError: true 
      }]);
      return;
    }

    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: currentApiKey });
      const model = 'gemini-3-flash-preview';
      
      const response = await ai.models.generateContent({
        model: model,
        contents: userText,
        config: {
          systemInstruction: mode === 'pcs' 
            ? 'Eres el coche de Radio Tour. Das datos técnicos, precisos y breves del ciclismo actual. Si usas búsqueda, cita fuentes.' 
            : 'Eres el cronista oficial de la historia del ciclismo. Tono épico y detallado.',
          tools: mode === 'pcs' ? [{ googleSearch: {} }] : undefined,
        },
      });

      const botText = response.text || "La señal es débil... no he recibido respuesta clara.";
      const sources: { uri: string; title: string }[] = [];
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      
      if (chunks) {
        chunks.forEach((c: any) => {
          if (c.web?.uri) sources.push({ uri: c.web.uri, title: c.web.title || 'Fuente' });
        });
      }

      setMessages(prev => [...prev, { role: 'bot', text: botText, sources }]);
    } catch (error: any) {
      console.error("Gemini Error:", error);
      
      let errorDetail = error.message || "Error desconocido de red";
      let friendlyMessage = "⚠️ Ha ocurrido un error técnico.";

      if (errorDetail.includes("API_KEY_INVALID") || errorDetail.includes("403") || errorDetail.includes("entity was not found")) {
        friendlyMessage = "❌ Error de Autorización: Tu API Key no tiene permisos o no está bien vinculada.";
      } else if (errorDetail.includes("billing")) {
        friendlyMessage = "❌ Error de Facturación: La cuenta vinculada necesita tener un método de pago activo.";
      }

      setMessages(prev => [...prev, { 
        role: 'bot', 
        text: `${friendlyMessage}\n\nDetalle técnico: ${errorDetail}`, 
        isError: true 
      }]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  return (
    <div className="flex flex-col w-full h-full bg-slate-950 text-white overflow-hidden md:rounded-3xl border border-white/10 shadow-2xl">
      
      {/* HEADER */}
      <div className={`shrink-0 p-4 border-b border-white/10 flex items-center justify-between ${mode === 'pcs' ? 'bg-blue-600/10' : 'bg-amber-600/10'}`}>
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl ${mode === 'pcs' ? 'bg-blue-600' : 'bg-amber-600'}`}>
            {mode === 'pcs' ? <Globe className="w-4 h-4" /> : <BookOpen className="w-4 h-4" />}
          </div>
          <div>
            <h2 className="text-xs font-black uppercase tracking-widest">{mode === 'pcs' ? 'Radio Tour' : 'Enciclopedia'}</h2>
            <div className="flex items-center gap-1.5">
              <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[8px] text-slate-400 font-bold uppercase">Sistema Online</span>
            </div>
          </div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg text-slate-500">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* CHAT */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-4 rounded-2xl text-sm ${
              m.role === 'user' 
                ? 'bg-blue-600 text-white shadow-lg' 
                : m.isError 
                  ? 'bg-red-950/40 border border-red-500/30 text-red-200 shadow-lg' 
                  : 'bg-slate-900 border border-white/5 text-slate-200'
            }`}>
              <div className="whitespace-pre-wrap leading-relaxed">{m.text}</div>
              
              {m.sources && m.sources.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2 pt-3 border-t border-white/5">
                  {m.sources.map((s, idx) => (
                    <a key={idx} href={s.uri} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 px-2 py-1 bg-blue-500/10 hover:bg-blue-500/20 rounded text-[9px] font-bold text-blue-400 border border-blue-400/20">
                      <Info className="w-3 h-3" /> {s.title}
                    </a>
                  ))}
                </div>
              )}

              {m.isError && (
                <button 
                  onClick={openKeySelector}
                  className="mt-4 w-full py-3 bg-white text-black rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 hover:bg-slate-200 transition-colors"
                >
                  <RefreshCw className="w-3 h-3" /> Reconfigurar Conexión
                </button>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-900 border border-white/5 p-4 rounded-2xl flex items-center gap-3">
              <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">Sincronizando...</span>
            </div>
          </div>
        )}
      </div>

      {/* INPUT */}
      <div className="p-4 bg-slate-950 border-t border-white/10 pb-10 md:pb-6">
        <div className="flex gap-2 max-w-3xl mx-auto">
          <input 
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Escribe tu consulta aquí..."
            className="flex-1 bg-slate-900 border border-white/10 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-blue-500 text-white"
          />
          <button 
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="p-3 bg-blue-600 text-white rounded-xl disabled:opacity-20 hover:bg-blue-500"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CyclingAI;
