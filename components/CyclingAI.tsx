
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Send, Globe, BookOpen, Loader2, Key, Settings, AlertTriangle, ShieldCheck, RefreshCw } from 'lucide-react';

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
  const [isAuthorized, setIsAuthorized] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const checkStatus = async () => {
      // @ts-ignore
      if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
        // @ts-ignore
        const hasKey = await window.aistudio.hasSelectedApiKey();
        setIsAuthorized(hasKey);
      } else {
        // Si no estamos en el entorno que soporta el método, comprobamos el env directamente
        if (process.env.API_KEY) setIsAuthorized(true);
      }
    };
    checkStatus();

    const welcome = mode === 'pcs' 
      ? '¡Radio Tour activa! 🎙️ Estoy listo para buscar datos en tiempo real en Procyclingstats.'
      : 'Biblioteca Frikis abierta. 📚 ¿Qué gran historia del ciclismo quieres revivir hoy?';
    
    setMessages([{ role: 'bot', text: welcome }]);
  }, [mode]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, loading]);

  const handleLinkKey = async () => {
    // @ts-ignore
    if (window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
      try {
        // @ts-ignore
        await window.aistudio.openSelectKey();
        // Asumimos éxito según las reglas del SDK
        setIsAuthorized(true);
      } catch (e) {
        console.error("Error al abrir el selector:", e);
      }
    }
  };

  const handleSend = async () => {
    const userText = input.trim();
    if (!userText || loading) return;

    // Verificación crítica antes de instanciar la IA
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      setMessages(prev => [...prev, { 
        role: 'bot', 
        text: "⚠️ No se detecta la API Key. Por favor, pulsa el botón de 'Vincular Cuenta' para activar el sistema.", 
        isError: true 
      }]);
      setIsAuthorized(false);
      return;
    }

    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setLoading(true);

    try {
      // IMPORTANTE: Creamos la instancia AQUÍ, no fuera, para asegurar que use la llave actual
      const ai = new GoogleGenAI({ apiKey });
      
      const modelName = 'gemini-3-pro-preview';
      const config: any = {
        systemInstruction: mode === 'pcs' 
          ? 'Eres el coche de Radio Tour de la Liga Frikis. Proporcionas datos precisos, actuales y breves sobre carreras de ciclismo usando búsqueda en Google. Tono profesional y directo.' 
          : 'Eres el historiador oficial de la Liga Frikis. Conoces cada detalle, anécdota y dato oscuro de la historia del ciclismo. Tono épico, culto y apasionado.',
      };

      if (mode === 'pcs') {
        config.tools = [{ googleSearch: {} }];
      }

      const response = await ai.models.generateContent({
        model: modelName,
        contents: userText,
        config: config,
      });

      const botText = response.text || "La señal de Radio Tour es débil... intenta de nuevo.";
      const sources: { uri: string; title: string }[] = [];
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      
      if (chunks) {
        chunks.forEach((c: any) => {
          if (c.web?.uri) sources.push({ uri: c.web.uri, title: c.web.title || 'Fuente' });
        });
      }

      setMessages(prev => [...prev, { role: 'bot', text: botText, sources }]);
    } catch (error: any) {
      console.error("AI Error:", error);
      let errorMsg = "❌ Error en la conexión.";
      
      if (error.message?.includes("entity was not found") || error.message?.includes("API_KEY_INVALID")) {
        errorMsg = "❌ Error de API Key: Tu cuenta de pago de Velogames no parece estar vinculada correctamente a este proyecto o no tiene habilitada la API de Gemini.";
        setIsAuthorized(false);
      } else if (error.message?.includes("billing") || error.message?.includes("402")) {
        errorMsg = "❌ Error de Facturación: Tu cuenta de Google Cloud necesita tener la facturación activa para usar este modelo.";
      } else {
        errorMsg = `❌ Error: ${error.message}`;
      }
      
      setMessages(prev => [...prev, { role: 'bot', text: errorMsg, isError: true }]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  if (!isAuthorized) {
    return (
      <div className="flex flex-col w-full h-full bg-slate-950 text-white p-8 items-center justify-center text-center">
        <div className="max-w-md space-y-8 animate-in fade-in zoom-in-95 duration-500">
          <div className="relative inline-block">
             <div className="absolute inset-0 bg-blue-500 blur-3xl opacity-20 animate-pulse"></div>
             <div className="relative p-8 bg-slate-900 rounded-[2.5rem] border border-blue-500/30 shadow-2xl">
               <ShieldCheck className="w-16 h-16 text-blue-500 mx-auto" />
             </div>
          </div>
          
          <div className="space-y-3">
            <h2 className="text-3xl font-black uppercase italic tracking-tighter">Conexión <span className="text-blue-500">Segura</span></h2>
            <p className="text-slate-400 text-sm font-medium leading-relaxed">
              Para usar la IA de la Liga Frikis con búsqueda en vivo, necesitas vincular tu <span className="text-white font-bold">API Key de pago</span> (Google Cloud).
            </p>
          </div>

          <div className="space-y-4">
            <button 
              onClick={handleLinkKey}
              className="group w-full py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black uppercase italic tracking-widest transition-all shadow-[0_0_30px_rgba(37,99,235,0.3)] active:scale-95 flex items-center justify-center gap-3 border-b-4 border-blue-800"
            >
              <Key className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              Vincular Cuenta Velogames
            </button>
            
            <p className="text-[10px] text-slate-500 uppercase font-black tracking-[0.2em] flex items-center justify-center gap-2">
              <AlertTriangle className="w-3 h-3" />
              Requiere proyecto GCP con facturación
            </p>
          </div>

          <div className="pt-6 border-t border-white/5">
            <a 
              href="https://ai.google.dev/gemini-api/docs/billing" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[10px] text-blue-400 hover:text-blue-300 font-bold uppercase underline underline-offset-4"
            >
              Documentación de Facturación
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-full bg-slate-950 text-white overflow-hidden md:rounded-3xl border border-white/10 shadow-2xl">
      {/* HEADER */}
      <div className={`shrink-0 p-5 pt-16 md:pt-5 border-b border-white/10 flex items-center justify-between ${mode === 'pcs' ? 'bg-blue-600/20' : 'bg-amber-600/20'} backdrop-blur-xl`}>
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl ${mode === 'pcs' ? 'bg-blue-500/20 text-blue-400' : 'bg-amber-500/20 text-amber-400'}`}>
            {mode === 'pcs' ? <Globe className="w-5 h-5" /> : <BookOpen className="w-5 h-5" />}
          </div>
          <div>
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em]">{mode === 'pcs' ? 'Radio Tour Live' : 'Enciclopedia Frikis'}</h2>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[8px] text-emerald-400 font-bold uppercase tracking-widest">Encriptado y Conectado</span>
            </div>
          </div>
        </div>
        <button 
          onClick={handleLinkKey}
          className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 transition-all active:scale-95"
          title="Ajustes de Conexión"
        >
          <Settings className="w-4 h-4 text-slate-400" />
        </button>
      </div>

      {/* CHAT MESSAGES */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-6 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
            <div className={`max-w-[90%] p-5 rounded-3xl text-sm leading-relaxed ${
              m.role === 'user' 
                ? 'bg-blue-600 font-bold shadow-xl shadow-blue-900/40 text-white' 
                : m.isError 
                  ? 'bg-red-950/40 border border-red-500/30 text-red-200' 
                  : 'bg-slate-900/95 border border-white/10 shadow-2xl text-slate-200'
            }`}>
              <div className="whitespace-pre-wrap">{m.text}</div>
              
              {m.sources && m.sources.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2 border-t border-white/10 pt-4">
                  {m.sources.map((s, idx) => (
                    <a key={idx} href={s.uri} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-[9px] font-black text-blue-400 bg-blue-400/10 px-3 py-1.5 rounded-lg hover:bg-blue-400/20 transition-colors border border-blue-400/10">
                      <Globe className="w-3 h-3" />
                      {s.title}
                    </a>
                  ))}
                </div>
              )}

              {m.isError && (
                <button 
                  onClick={handleLinkKey}
                  className="mt-4 w-full py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl font-black uppercase text-[10px] tracking-widest transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-3 h-3" /> Re-vincular Cuenta
                </button>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-900/80 backdrop-blur-sm p-4 rounded-3xl border border-white/5 flex items-center gap-3">
              <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
              <span className="text-[10px] font-black text-slate-500 uppercase italic tracking-widest">Consultando Procyclingstats...</span>
            </div>
          </div>
        )}
      </div>

      {/* INPUT */}
      <div className="p-4 bg-slate-950 border-t border-white/10 pb-10 md:pb-6">
        <div className="flex gap-2 max-w-4xl mx-auto">
          <input 
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={mode === 'pcs' ? "Pregunta por un corredor o carrera..." : "Dime el ganador del Giro de 1980..."}
            className="flex-1 bg-slate-900 border border-white/10 rounded-2xl py-4 px-6 text-sm focus:outline-none focus:border-blue-500 text-white placeholder:text-slate-700 transition-all shadow-inner"
          />
          <button 
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="bg-white text-black p-4 rounded-2xl active:scale-95 disabled:opacity-20 transition-all hover:bg-blue-600 hover:text-white shadow-xl flex items-center justify-center"
          >
            <Send className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CyclingAI;
