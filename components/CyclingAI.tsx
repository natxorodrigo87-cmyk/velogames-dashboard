
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Send, Globe, BookOpen, Database, Sparkles, Loader2, RefreshCw, AlertTriangle, Key } from 'lucide-react';

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
  const [status, setStatus] = useState<string>('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const welcome = mode === 'pcs' 
      ? '¡Radio Tour 2026 online! Estoy conectado a Procyclingstats para darte datos en tiempo real.'
      : 'Has accedido a la Biblioteca de la Liga Frikis. ¿Qué hito histórico quieres rememorar hoy?';
    
    setMessages([{ role: 'bot', text: welcome }]);
  }, [mode]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, loading]);

  const handleSend = async (manualText?: string, forceNoSearch = false) => {
    const userText = manualText || input.trim();
    if (!userText || loading) return;

    if (!manualText) {
      setInput('');
      setMessages(prev => [...prev, { role: 'user', text: userText }]);
    }
    
    setLoading(true);
    setStatus(forceNoSearch ? 'Modo de seguridad (sin búsqueda)...' : (mode === 'pcs' ? 'Rastreando PCS...' : 'Consultando archivos...'));

    try {
      const apiKey = process.env.API_KEY;
      if (!apiKey || apiKey === 'undefined') {
        throw new Error("API_KEY_MISSING");
      }

      const ai = new GoogleGenAI({ apiKey });
      
      const systemInstruction = mode === 'pcs'
        ? 'Eres el asistente técnico de la Liga Frikis. Tu misión es proporcionar datos de Procyclingstats sobre carreras de 2025 y 2026. Sé breve y muy técnico.'
        : 'Eres el historiador de la Liga Frikis. Sabes todo sobre ciclismo clásico y leyendas del Tour. Responde con estilo épico.';

      // Usamos el modelo más equilibrado para texto
      const modelName = 'gemini-3-flash-preview';

      const response = await ai.models.generateContent({
        model: modelName,
        contents: userText,
        config: {
          systemInstruction: systemInstruction,
          // Si el primer intento con búsqueda falla, el reintento vendrá con forceNoSearch = true
          tools: (mode === 'pcs' && !forceNoSearch) ? [{ googleSearch: {} }] : undefined,
        },
      });

      const botText = response.text || "No hay señal de Radio Tour en este puerto.";
      const sources: { uri: string; title: string }[] = [];
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      
      if (chunks) {
        chunks.forEach((c: any) => {
          if (c.web?.uri) {
            sources.push({ uri: c.web.uri, title: c.web.title || 'Referencia PCS' });
          }
        });
      }

      setMessages(prev => [
        ...prev.filter(m => !m.isError), 
        { role: 'bot', text: botText, sources: sources.length > 0 ? sources : undefined }
      ]);

    } catch (error: any) {
      console.error("Critical AI Error:", error);
      const errorMsg = error.message || "";
      
      if (errorMsg === "API_KEY_MISSING") {
        setMessages(prev => [...prev, { 
          role: 'bot', 
          text: "No se detecta conexión segura. Pulsa el botón para activar tu clave de Google Cloud.", 
          isError: true 
        }]);
      } else if (!forceNoSearch && mode === 'pcs') {
        // REINTENTO AUTOMÁTICO: A veces fallan las herramientas de búsqueda por cuotas/región
        handleSend(userText, true);
        return;
      } else {
        setMessages(prev => [...prev, { 
          role: 'bot', 
          text: "¡Caída masiva! La conexión con la IA ha fallado. Revisa tu clave o intenta de nuevo en unos segundos.", 
          isError: true 
        }]);
      }
    } finally {
      setLoading(false);
      setStatus('');
    }
  };

  const handleReauth = () => {
    // @ts-ignore
    if (window.aistudio) {
      // @ts-ignore
      window.aistudio.openSelectKey();
    }
  };

  const isPcs = mode === 'pcs';

  return (
    <div className="flex flex-col w-full h-full bg-slate-950 text-white overflow-hidden border-x border-white/5 md:rounded-3xl shadow-2xl">
      {/* Header */}
      <div className={`shrink-0 p-5 pt-16 md:pt-5 border-b border-white/10 flex items-center justify-between ${isPcs ? 'bg-blue-600' : 'bg-amber-600'}`}>
        <div className="flex items-center gap-4">
          <div className="p-2.5 bg-white/20 rounded-2xl backdrop-blur-md">
            {isPcs ? <Globe className="w-5 h-5" /> : <BookOpen className="w-5 h-5" />}
          </div>
          <div>
            <h2 className="text-sm font-black uppercase italic tracking-tighter leading-none">
              {isPcs ? 'Radio Tour Live' : 'Enciclopedia Histórica'}
            </h2>
            <div className="flex items-center gap-1.5 mt-1">
              <span className={`w-1.5 h-1.5 rounded-full ${loading ? 'bg-white animate-pulse' : 'bg-green-400'}`} />
              <span className="text-[9px] text-white/70 font-black uppercase tracking-widest">
                {loading ? status : 'Sincronizado'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Feed */}
      <div 
        ref={scrollRef} 
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] scroll-smooth"
      >
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}>
            <div className={`max-w-[90%] ${m.role === 'user' ? 'flex flex-col items-end' : ''}`}>
              <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-xl ${
                m.role === 'user' 
                  ? `${isPcs ? 'bg-blue-600' : 'bg-amber-600'} text-white rounded-tr-none border border-white/10` 
                  : m.isError 
                    ? 'bg-red-500/20 border border-red-500/30 text-red-200' 
                    : 'bg-slate-900/90 text-slate-200 border border-white/5 rounded-tl-none backdrop-blur-md'
              }`}>
                {m.text}
                
                {m.isError && (
                  <div className="mt-4 flex flex-col gap-2">
                    <button 
                      onClick={handleReauth}
                      className="flex items-center gap-2 w-full justify-center py-3 bg-white text-black rounded-xl font-black text-[10px] uppercase active:scale-95 transition-all"
                    >
                      <Key className="w-3.5 h-3.5" /> Reconfigurar Clave
                    </button>
                    <button 
                      onClick={() => handleSend(messages[messages.length-2]?.text)}
                      className="flex items-center gap-2 w-full justify-center py-3 bg-slate-800 text-white rounded-xl font-black text-[10px] uppercase active:scale-95 transition-all"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Reintentar
                    </button>
                  </div>
                )}
              </div>
              
              {m.sources && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {m.sources.map((s, idx) => (
                    <a key={idx} href={s.uri} target="_blank" rel="noopener noreferrer"
                      className="text-[9px] text-blue-400 font-black flex items-center gap-1.5 bg-blue-500/10 px-3 py-2 rounded-lg border border-blue-500/20 uppercase">
                      <Database className="w-3 h-3" /> Fuente PCS
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
              <Loader2 className={`w-4 h-4 animate-spin ${isPcs ? 'text-blue-500' : 'text-amber-500'}`} />
              <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{status}</span>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="shrink-0 p-4 bg-slate-950 border-t border-white/10 pb-12 md:pb-6">
        <div className="flex gap-2">
          <input 
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={isPcs ? "¿Quién va líder en el Tour hoy?" : "¿Quién ganó la Milán-San Remo de 1990?"}
            className="flex-1 bg-slate-900 border border-white/10 rounded-2xl py-4 px-5 text-sm text-white focus:outline-none focus:border-blue-500/50"
          />
          <button 
            onClick={() => handleSend()}
            disabled={loading || !input.trim()}
            className={`${isPcs ? 'bg-blue-600' : 'bg-amber-600'} p-4 rounded-2xl text-white shadow-xl active:scale-90 transition-all disabled:opacity-20`}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CyclingAI;
