
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
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const welcome = mode === 'pcs' 
      ? '¡Radio Tour activa! 🎙️ Pregúntame lo que quieras sobre carreras actuales.'
      : 'Biblioteca Frikis abierta. 📚 ¿Qué leyenda del ciclismo quieres recordar hoy?';
    setMessages([{ role: 'bot', text: welcome }]);
  }, [mode]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, loading]);

  const handleOpenKey = async () => {
    // Intentar abrir el selector de Google
    // @ts-ignore
    if (window.aistudio) {
      try {
        // @ts-ignore
        await window.aistudio.openSelectKey();
      } catch (e) {
        alert("El navegador ha bloqueado la ventana. Por favor, permite las ventanas emergentes (pop-ups) para esta web.");
      }
    } else {
      alert("Para configurar la llave, asegúrate de estar usando el entorno oficial de la app.");
    }
  };

  const handleSend = async () => {
    const userText = input.trim();
    if (!userText || loading) return;

    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setLoading(true);

    try {
      // Inicializamos la IA con la clave del sistema (inyectada automáticamente)
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const modelName = 'gemini-3-flash-preview';

      const systemInstruction = mode === 'pcs'
        ? 'Eres el analista técnico de la Liga Frikis. Usa Google Search para dar resultados actuales. Responde como un fanático del ciclismo.'
        : 'Eres el historiador de la Liga Frikis. Sabes todo sobre ciclismo clásico.';

      const response = await ai.models.generateContent({
        model: modelName,
        contents: userText,
        config: {
          systemInstruction,
          tools: mode === 'pcs' ? [{ googleSearch: {} }] : undefined,
        },
      });

      const botText = response.text || "No hay señal en el coche de equipo...";
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

    } catch (error: any) {
      const errorStr = error.toString().toLowerCase();
      
      if (errorStr.includes("not found") || errorStr.includes("401") || errorStr.includes("key")) {
        setMessages(prev => [...prev, { 
          role: 'bot', 
          text: "⚠️ NO TENGO LLAVE. Para que pueda responderte, pulsa el botón amarillo 'CONFIGURAR LLAVE' arriba a la derecha y pega tu código AIzaSy...", 
          isError: true,
          needsKey: true
        }]);
      } else {
        setMessages(prev => [...prev, { 
          role: 'bot', 
          text: "¡PÁJARA! Ha habido un error de conexión. Inténtalo de nuevo.", 
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
      {/* Header */}
      <div className={`shrink-0 p-5 pt-16 md:pt-5 border-b border-white/10 flex items-center justify-between ${isPcs ? 'bg-blue-800' : 'bg-amber-800'}`}>
        <div className="flex items-center gap-4">
          <div className="p-2 bg-white/10 rounded-xl">
            {isPcs ? <Globe className="w-5 h-5" /> : <BookOpen className="w-5 h-5" />}
          </div>
          <h2 className="text-xs font-black uppercase italic">{isPcs ? 'Radio Tour' : 'Biblioteca'}</h2>
        </div>

        <button 
          onClick={handleOpenKey}
          className="flex items-center gap-2 px-4 py-2 bg-yellow-400 text-black rounded-lg font-black text-[10px] uppercase shadow-lg hover:bg-yellow-300 transition-all active:scale-95"
        >
          <Key className="w-3 h-3" />
          Configurar Llave
        </button>
      </div>

      {/* Chat */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-4 rounded-2xl text-sm ${
              m.role === 'user' ? 'bg-blue-600' : 'bg-slate-900 border border-white/5'
            } ${m.isError ? 'border-red-500/50 bg-red-500/10' : ''}`}>
              {m.text}
              {m.needsKey && (
                <div className="mt-4 p-3 bg-yellow-400/10 rounded-lg flex items-start gap-2 border border-yellow-400/20">
                  <AlertTriangle className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
                  <p className="text-[10px] text-yellow-100 leading-tight">
                    Si el botón de arriba no abre nada, comprueba si tu navegador ha bloqueado una ventana emergente.
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && <div className="p-4 text-[10px] font-black uppercase animate-pulse text-slate-500 italic">Procesando...</div>}
      </div>

      {/* Input */}
      <div className="p-4 bg-slate-950 border-t border-white/10 pb-10 md:pb-6">
        <div className="flex gap-2">
          <input 
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Escribe aquí tu pregunta..."
            className="flex-1 bg-slate-900 border border-white/10 rounded-xl py-4 px-4 text-sm text-white focus:outline-none"
          />
          <button 
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="bg-white text-black p-4 rounded-xl disabled:opacity-20"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CyclingAI;
