
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Send, Globe, Loader2, X, AlertCircle, RefreshCw } from 'lucide-react';

interface CyclingAIProps {
  onClose: () => void;
}

type Message = {
  role: 'user' | 'bot';
  text: string;
  isError?: boolean;
};

const CyclingAI: React.FC<CyclingAIProps> = ({ onClose }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [connectionIssue, setConnectionIssue] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages([{ 
      role: 'bot', 
      text: '🎙️ **Radio Tour:** "Conexión con Procyclingstats establecida. ¿Qué quieres consultar?"' 
    }]);
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loading]);

  const repairConnection = async () => {
    try {
      // @ts-ignore
      if (window.aistudio?.openSelectKey) {
        // @ts-ignore
        await window.aistudio.openSelectKey();
        setConnectionIssue(false);
        setMessages(prev => [...prev, { role: 'bot', text: '✅ **Conexión reparada.** Prueba a preguntar de nuevo.' }]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSend = async () => {
    const userText = input.trim();
    if (!userText || loading) return;

    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setLoading(true);
    setConnectionIssue(false);

    try {
      // Creamos la instancia en el momento para usar la key que esté activa
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: userText,
        config: {
          systemInstruction: 'Eres un experto en ciclismo. Usa Procyclingstats para dar datos breves y exactos. No des rodeos.',
          tools: [{ googleSearch: {} }],
        },
      });

      const text = response.text || "No hay señal en este punto del recorrido.";
      setMessages(prev => [...prev, { role: 'bot', text }]);
    } catch (error: any) {
      console.error("Chat Error:", error);
      setConnectionIssue(true);
      setMessages(prev => [...prev, { 
        role: 'bot', 
        text: "⚠️ **LA CONEXIÓN HA FALLADO.** Esto ocurre cuando la llave de Google necesita ser reactivada.",
        isError: true
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col w-full h-full bg-slate-950 text-white">
      
      {/* HEADER */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between bg-blue-600/20">
        <div className="flex items-center gap-3">
          <Globe className="w-5 h-5 text-blue-400" />
          <h2 className="font-black uppercase tracking-tighter italic">Radio Tour PCS</h2>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* CHAT MESSAGES */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-3 rounded-xl text-sm ${
              m.role === 'user' ? 'bg-blue-600' : m.isError ? 'bg-red-900/40 border border-red-500/50' : 'bg-slate-900 border border-white/5'
            }`}>
              <div className="whitespace-pre-wrap">{m.text}</div>
              
              {m.isError && (
                <button 
                  onClick={repairConnection}
                  className="mt-3 w-full py-2 bg-white text-black rounded-lg font-black text-[10px] uppercase flex items-center justify-center gap-2 hover:bg-blue-100 transition-colors"
                >
                  <RefreshCw className="w-3 h-3" /> Reparar conexión ahora
                </button>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-2 items-center text-slate-500 p-2">
            <Loader2 className="w-3 h-3 animate-spin" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Buscando en PCS...</span>
          </div>
        )}
      </div>

      {/* INPUT AREA */}
      <div className="p-4 bg-slate-900/50 border-t border-white/10">
        {connectionIssue ? (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-red-400 text-[10px] font-black uppercase mb-1">
              <AlertCircle className="w-3 h-3" /> Problema detectado
            </div>
            <button 
              onClick={repairConnection}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20"
            >
              PULSA AQUÍ PARA ARREGLARLO
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <input 
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Escribe aquí..."
              className="flex-1 bg-slate-950 border border-white/10 rounded-xl px-4 py-2 text-sm focus:border-blue-500 outline-none"
            />
            <button 
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className="p-2 bg-blue-600 rounded-xl disabled:opacity-20"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CyclingAI;
