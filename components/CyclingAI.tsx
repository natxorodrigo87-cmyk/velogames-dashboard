
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Send, Globe, BookOpen, Database, Loader2, Key, AlertTriangle } from 'lucide-react';

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
  const [status, setStatus] = useState<'idle' | 'connecting' | 'error' | 'success'>('idle');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const welcome = mode === 'pcs' 
      ? '¡Radio Tour activa! 🎙️ Para que pueda buscar datos reales, pulsa el botón AMARILLO de arriba ("CONFIGURAR LLAVE") y pega tu código.'
      : 'Biblioteca Frikis abierta. 📚 Necesito tu llave de Google (botón amarillo arriba) para funcionar.';
    setMessages([{ role: 'bot', text: welcome }]);
  }, [mode]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, loading]);

  const handleOpenKey = async () => {
    // @ts-ignore
    if (window.aistudio) {
      // @ts-ignore
      await window.aistudio.openSelectKey();
      setStatus('connecting');
      setTimeout(() => setStatus('idle'), 1000);
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
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const modelName = 'gemini-3-flash-preview';

      const systemInstruction = mode === 'pcs'
        ? 'Eres el analista técnico de la Liga Frikis. Usa Google Search para dar resultados de ciclismo actuales.'
        : 'Eres el historiador de la Liga Frikis. Sabes todo sobre ciclismo clásico.';

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
        response = await ai.models.generateContent({
          model: modelName,
          contents: userText,
          config: { systemInstruction },
        });
      }

      const botText = response.text || "Sin señal...";
      const sources: { uri: string; title: string }[] = [];
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      
      if (chunks) {
        chunks.forEach((c: any) => {
          if (c.web?.uri) {
            sources.push({ uri: c.web.uri, title: c.web.title || 'Info' });
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
      setMessages(prev => [...prev, { 
        role: 'bot', 
        text: "⚠️ ¡ERROR DE LLAVE! No has pegado tu código todavía. Pulsa el botón AMARILLO de arriba a la derecha.", 
        isError: true,
        needsKey: true
      }]);
    } finally {
      setLoading(false);
    }
  };

  const isPcs = mode === 'pcs';

  return (
    <div className="flex flex-col w-full h-full bg-slate-950 text-white overflow-hidden md:rounded-3xl border border-white/10 shadow-2xl">
      {/* HEADER CON BOTÓN LLAMATIVO */}
      <div className={`shrink-0 p-5 pt-16 md:pt-5 border-b border-white/10 flex items-center justify-between ${isPcs ? 'bg-blue-700' : 'bg-amber-700'}`}>
        <div className="flex items-center gap-4">
          <div className="p-2.5 bg-white/20 rounded-2xl">
            {isPcs ? <Globe className="w-5 h-5" /> : <BookOpen className="w-5 h-5" />}
          </div>
          <div>
            <h2 className="text-xs font-black uppercase italic tracking-tighter leading-none">
              {isPcs ? 'Radio Tour' : 'Biblioteca'}
            </h2>
            <span className="text-[10px] text-white/50 font-bold uppercase">Liga Frikis IA</span>
          </div>
        </div>

        {/* ESTE ES EL BOTÓN QUE BUSCAS EN TU APP */}
        <button 
          onClick={handleOpenKey}
          className="flex items-center gap-2 px-4 py-2 bg-yellow-400 hover:bg-yellow-300 text-black rounded-xl font-black text-[10px] uppercase tracking-tighter shadow-[0_0_20px_rgba(250,204,21,0.4)] transition-all active:scale-95 border-2 border-yellow-200"
        >
          <Key className="w-4 h-4" />
          <span>Configurar Llave</span>
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950/50">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-4 rounded-2xl text-sm ${
              m.role === 'user' 
                ? 'bg-blue-600 text-white rounded-tr-none' 
                : m.isError 
                  ? 'bg-red-500/20 border border-red-500/50 text-red-200' 
                  : 'bg-slate-900 border border-white/5 rounded-tl-none'
            }`}>
              {m.text}
              {m.needsKey && (
                <div className="mt-3 p-3 bg-yellow-400/10 border border-yellow-400/30 rounded-lg flex items-center gap-3">
                  <AlertTriangle className="w-4 h-4 text-yellow-400 shrink-0" />
                  <p className="text-[10px] text-yellow-200 font-bold leading-tight">
                    Haz clic en el botón amarillo de la parte superior derecha de esta ventana para continuar.
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && <div className="p-4 text-[10px] font-black uppercase animate-pulse text-slate-500 italic">Sintonizando frecuencia...</div>}
      </div>

      <div className="p-4 bg-slate-950 border-t border-white/10 pb-10 md:pb-6">
        <div className="flex gap-2">
          <input 
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Escribe tu mensaje..."
            className="flex-1 bg-slate-900 border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-yellow-500/50"
          />
          <button onClick={() => handleSend()} className="bg-white text-black p-3 rounded-xl hover:bg-yellow-400 transition-colors">
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CyclingAI;
