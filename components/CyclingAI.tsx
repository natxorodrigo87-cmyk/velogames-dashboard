
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Send, Globe, BookOpen, Database, Loader2, Key, AlertCircle, RefreshCw } from 'lucide-react';

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
  const [diagnosing, setDiagnosing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const welcome = mode === 'pcs' 
      ? '¡Radio Tour activa! 🎙️ Estoy listo para buscar datos en Procyclingstats.'
      : 'Biblioteca Frikis abierta. 📚 ¿Qué historia del pedal quieres explorar?';
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
        setMessages(prev => [...prev, { 
          role: 'bot', 
          text: 'Intentando sincronizar con tu nueva llave... Prueba a enviar un mensaje ahora.' 
        }]);
      } catch (e) {
        console.error(e);
      }
    } else {
      alert("⚠️ El entorno no permite abrir el selector. Si estás en el editor, busca el icono de la llave (Key) en la barra lateral o superior y asegúrate de tener una API KEY seleccionada.");
    }
  };

  const handleSend = async () => {
    const userText = input.trim();
    if (!userText || loading) return;

    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setLoading(true);

    try {
      // Intentamos obtener la llave del entorno. Si no existe, lanzamos error específico.
      const apiKey = process.env.API_KEY;
      if (!apiKey || apiKey === "undefined") {
        throw new Error("KEY_NOT_SET");
      }

      // Creamos la instancia en cada envío para asegurar que pilla la key más reciente
      const ai = new GoogleGenAI({ apiKey });
      const modelName = 'gemini-3-flash-preview';

      const systemInstruction = mode === 'pcs'
        ? 'Eres el analista de la Liga Frikis. Usa Google Search para dar datos de Procyclingstats. Responde como un experto en ciclismo.'
        : 'Eres el historiador de la Liga Frikis. Conoces toda la historia del ciclismo.';

      const response = await ai.models.generateContent({
        model: modelName,
        contents: userText,
        config: {
          systemInstruction,
          tools: mode === 'pcs' ? [{ googleSearch: {} }] : undefined,
        },
      });

      const botText = response.text || "La señal es muy débil ahora mismo...";
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
        ...prev, 
        { role: 'bot', text: botText, sources: sources.length > 0 ? sources : undefined }
      ]);

    } catch (error: any) {
      console.error("AI Error:", error);
      let errorMsg = "¡Pájara! Error de conexión. Reintenta.";
      
      if (error.message === "KEY_NOT_SET") {
        errorMsg = "❌ NO HAY LLAVE: No he detectado ninguna API KEY en el sistema. Por favor, asegúrate de haber seleccionado una llave válida en el panel de configuración de la plataforma.";
      } else if (error.toString().includes("401") || error.toString().includes("403")) {
        errorMsg = "❌ LLAVE INVÁLIDA: La llave que estás usando no tiene permisos o ha caducado. Intenta seleccionar otra.";
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

  return (
    <div className="flex flex-col w-full h-full bg-slate-950 text-white overflow-hidden md:rounded-3xl border border-white/10 shadow-2xl">
      {/* HEADER */}
      <div className={`shrink-0 p-5 pt-16 md:pt-5 border-b border-white/10 flex items-center justify-between ${mode === 'pcs' ? 'bg-blue-900' : 'bg-amber-900'}`}>
        <div className="flex items-center gap-4">
          <div className="p-2 bg-white/10 rounded-xl">
            {mode === 'pcs' ? <Globe className="w-5 h-5" /> : <BookOpen className="w-5 h-5" />}
          </div>
          <div>
            <h2 className="text-xs font-black uppercase tracking-widest">{mode === 'pcs' ? 'Radio Tour' : 'Enciclopedia'}</h2>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="w-1 h-1 rounded-full bg-green-500 animate-pulse"></span>
              <span className="text-[7px] text-white/50 font-bold uppercase">Sistema Online</span>
            </div>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={handleOpenKey}
            className="flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-[10px] font-black uppercase transition-all"
          >
            <Key className="w-3 h-3" />
            <span>Configurar</span>
          </button>
        </div>
      </div>

      {/* CHAT AREA */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[90%] ${m.role === 'user' ? 'bg-blue-600' : m.isError ? 'bg-red-950 border border-red-500/30' : 'bg-slate-900 border border-white/5'} p-4 rounded-2xl text-sm shadow-xl`}>
              <div className="whitespace-pre-wrap">{m.text}</div>
              
              {m.isError && (
                <div className="mt-4 pt-4 border-t border-white/10 flex flex-col gap-3">
                  <p className="text-[10px] font-bold text-red-400 uppercase tracking-tight">Pasos para solucionar:</p>
                  <ol className="text-[10px] text-slate-400 space-y-1 list-decimal ml-3">
                    <li>Haz clic en el botón <strong>"Configurar"</strong> de arriba.</li>
                    <li>Si no sale nada, busca el icono de <strong>Key / Llave</strong> en la interfaz de la web donde estás viendo esto.</li>
                    <li>Asegúrate de que la llave pertenece a un proyecto con facturación (Paid Project) para que Google Search funcione.</li>
                  </ol>
                </div>
              )}

              {m.sources && (
                <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-white/5">
                  {m.sources.map((s, idx) => (
                    <a key={idx} href={s.uri} target="_blank" rel="noopener noreferrer" className="text-[9px] font-bold text-blue-400 flex items-center gap-1 bg-blue-400/10 px-2 py-1 rounded">
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
              <span className="text-[10px] font-black text-slate-500 uppercase italic">Conectando con la base de datos...</span>
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
            className="flex-1 bg-slate-900 border border-white/10 rounded-xl py-4 px-5 text-sm focus:outline-none focus:border-blue-500/50"
          />
          <button 
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="bg-white text-black p-4 rounded-xl active:scale-95 disabled:opacity-20 transition-all shadow-lg hover:bg-blue-500 hover:text-white"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CyclingAI;
