
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Send, Globe, BookOpen, Loader2, Key, AlertCircle, MousePointer2, ExternalLink, HelpCircle, Settings, CheckCircle } from 'lucide-react';

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
      const isConfigured = !!process.env.API_KEY && process.env.API_KEY !== "undefined";
      setHasKey(isConfigured);
    }
  };

  const handleManualConfirm = () => {
    setHasKey(true);
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
        // Según las reglas: asumimos éxito inmediatamente después de abrir el diálogo para evitar bloqueos
        setHasKey(true); 
      } catch (e) {
        console.error(e);
      }
    } else {
      // Si no estamos en el entorno que soporta openSelectKey, simplemente permitimos pasar si el usuario insiste
      setHasKey(true);
    }
  };

  const handleSend = async () => {
    const userText = input.trim();
    if (!userText || loading) return;

    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setLoading(true);

    try {
      // Siempre crear instancia nueva justo antes de llamar
      const apiKey = process.env.API_KEY;
      if (!apiKey || apiKey === "undefined") {
        throw new Error("Requested entity was not found.");
      }

      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: userText,
        config: {
          systemInstruction: mode === 'pcs' 
            ? 'Eres el coche de Radio Tour. Proporcionas datos actualizados de Procyclingstats para la Liga Frikis.' 
            : 'Eres el historiador oficial de la Liga Frikis. Conoces anécdotas, victorias míticas y datos clásicos.',
          tools: mode === 'pcs' ? [{ googleSearch: {} }] : undefined,
        },
      });

      const botText = response.text || "Señal de Radio Tour perdida...";
      const sources: { uri: string; title: string }[] = [];
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      if (chunks) {
        chunks.forEach((c: any) => {
          if (c.web?.uri) sources.push({ uri: c.web.uri, title: c.web.title || 'Referencia' });
        });
      }
      setMessages(prev => [...prev, { role: 'bot', text: botText, sources }]);
    } catch (error: any) {
      console.error("API Error:", error);
      if (error.message?.includes("Requested entity was not found.") || !process.env.API_KEY) {
        setHasKey(false);
      }
      setMessages(prev => [...prev, { role: 'bot', text: "❌ Error de conexión. Asegúrate de haber seleccionado una llave con facturación activa en un 'Paid Project'.", isError: true }]);
    } finally {
      setLoading(false);
    }
  };

  if (hasKey === false) {
    return (
      <div className="flex flex-col w-full h-full bg-slate-950 text-white p-6 overflow-y-auto">
        <div className="max-w-md mx-auto space-y-6 py-8">
          <div className="text-center space-y-3">
            <div className="inline-flex p-3 bg-blue-500/10 rounded-full border border-blue-500/20 text-blue-500 mb-2">
              <Key className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-black uppercase italic tracking-tighter">Configuración Requerida</h2>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Si la llave ya no está tachada arriba, pulsa el botón verde para entrar. Si sigue fallando, revisa los pasos:
            </p>
          </div>

          <div className="grid gap-4">
            <button 
              onClick={handleManualConfirm}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black uppercase italic tracking-widest transition-all shadow-xl shadow-emerald-900/20 active:scale-95 flex items-center justify-center gap-3"
            >
              <CheckCircle className="w-5 h-5" /> Entrar al Chat
            </button>

            <div className="bg-slate-900 border border-white/10 rounded-2xl p-5 space-y-4">
              <h3 className="text-[10px] font-black text-blue-400 uppercase tracking-widest flex items-center gap-2">
                <HelpCircle className="w-4 h-4" /> ¿No te deja importar?
              </h3>
              <div className="space-y-3 text-[10px] text-slate-400">
                <p>1. Ve a <a href="https://console.cloud.google.com" target="_blank" className="text-blue-400 underline" rel="noopener noreferrer">Google Cloud Console</a>.</p>
                <p>2. En <strong>Facturación (Billing)</strong>, vincula una cuenta (es obligatorio para usar la búsqueda web).</p>
                <p>3. En <strong>APIs y Servicios</strong>, habilita "Generative Language API".</p>
                <p>4. Pulsa de nuevo en el icono de la 🔑 arriba a la derecha y selecciona tu proyecto.</p>
              </div>
            </div>

            <button 
              onClick={handleOpenKey}
              className="w-full py-3 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/5 transition-all"
            >
              Intentar Abrir Selector de Llave
            </button>
          </div>
          
          <button 
            onClick={onClose}
            className="w-full py-2 text-slate-600 hover:text-slate-400 text-[9px] font-bold uppercase transition-all"
          >
            Cerrar Ventana
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
          Cambiar Key
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
                    <a key={idx} href={s.uri} target="_blank" rel="noopener noreferrer" className="text-[9px] font-bold text-blue-400 flex items-center gap-1 bg-blue-400/10 px-2 py-1 rounded transition-colors hover:bg-blue-400/20">
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
              <span className="text-[10px] font-black text-slate-500 uppercase italic">Conectando...</span>
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
            placeholder="Pregunta a la IA..."
            className="flex-1 bg-slate-900 border border-white/10 rounded-xl py-4 px-5 text-sm focus:outline-none focus:border-blue-500/50 transition-all"
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
