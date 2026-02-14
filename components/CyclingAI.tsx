
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Send, Bot, User, Loader2, Sparkles, Bike, ExternalLink, Info, BookOpen, RefreshCw, AlertCircle } from 'lucide-react';

type Message = {
  role: 'user' | 'bot';
  text: string;
  sources?: { uri: string; title: string }[];
  isError?: boolean;
};

const CyclingAI: React.FC = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'bot', 
      text: '¡Saludos, Director Deportivo! Estoy listo para asesorarte con total profundidad.\n\nTengo acceso en tiempo real a **ProCyclingStats** para resultados y noticias de última hora, pero también domino toda la **historia del ciclismo**, reglamentos técnicos, mecánica y tácticas de carrera.\n\n¿Quieres saber quién ganó el Tour en 1984, cómo funcionan los desarrollos en montaña o qué corredores son favoritos para mañana? Pregúntame lo que necesites.' 
    }
  ]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSend = async (textToRetry?: string) => {
    const userText = textToRetry || input.trim();
    if (!userText || loading) return;

    if (!textToRetry) {
      setInput('');
      setMessages(prev => [...prev, { role: 'user', text: userText }]);
    }
    
    setLoading(true);

    try {
      // Usamos Gemini 3 Flash para máxima velocidad en móviles
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: { parts: [{ text: userText }] },
        config: {
          tools: [{ googleSearch: {} }],
          thinkingConfig: { thinkingBudget: 0 }, // Desactivamos el pensamiento para evitar timeouts en móvil
          systemInstruction: `Eres el "Oráculo Pro de la Liga Frikis", experto en ciclismo. 
          Capacidades: 
          1. Resultados actuales vía Google Search (PCS). 
          2. Historia completa del ciclismo. 
          3. Mecánica y táctica técnica. 
          4. Consejos para Velogames. 
          Responde de forma concisa y profesional.`,
        },
      });

      const botResponse = response.text || "La grupeta me ha dejado atrás... No he podido conectar con la información.";
      
      const sources: { uri: string; title: string }[] = [];
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      if (chunks) {
        chunks.forEach((chunk: any) => {
          if (chunk.web?.uri && chunk.web?.title) {
            if (!sources.find(s => s.uri === chunk.web.uri)) {
              sources.push({ uri: chunk.web.uri, title: chunk.web.title });
            }
          }
        });
      }

      setMessages(prev => [...prev.filter(m => !m.isError), { role: 'bot', text: botResponse, sources }]);
    } catch (error: any) {
      console.error("AI connection failure:", error);
      setMessages(prev => [...prev, { 
        role: 'bot', 
        text: "¡Pinchazo! No he podido conectar con el satélite. Esto suele pasar en móviles con poca cobertura o bloqueadores de anuncios.",
        isError: true
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col h-[600px] md:h-[700px] bg-slate-900/90 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-3xl shadow-2xl animate-in fade-in zoom-in-95 duration-500">
      {/* Header */}
      <div className="p-4 md:p-6 border-b border-white/5 bg-gradient-to-r from-purple-600/20 to-blue-600/10 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl shadow-lg">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg md:text-xl font-black text-white italic uppercase tracking-tighter leading-none">Personal <span className="text-purple-400">Cycling AI</span></h2>
            <p className="text-[8px] md:text-[9px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-2 mt-1">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              Live Advisor • Optimized for Mobile
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
           <div className="hidden sm:flex px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 items-center gap-2">
             <Sparkles className="w-3 h-3 text-purple-400" />
             <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Flash Mode</span>
           </div>
        </div>
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scroll-smooth bg-[radial-gradient(circle_at_top_right,_rgba(59,130,246,0.03)_0%,_transparent_40%)]"
      >
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
            <div className={`flex gap-3 max-w-[95%] md:max-w-[85%] ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${m.role === 'user' ? 'bg-slate-800' : 'bg-purple-600 shadow-lg'}`}>
                {m.role === 'user' ? <User className="w-4 h-4 text-slate-400" /> : <Bot className="w-4 h-4 text-white" />}
              </div>
              <div className="space-y-3">
                <div className={`p-4 rounded-2xl text-[13px] leading-relaxed whitespace-pre-line shadow-xl ${
                  m.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-tr-none' 
                    : m.isError 
                      ? 'bg-red-500/10 border border-red-500/20 text-red-200 rounded-tl-none' 
                      : 'bg-slate-800/80 text-slate-200 rounded-tl-none border border-white/5'
                }`}>
                  {m.isError && <AlertCircle className="w-4 h-4 mb-2 text-red-400" />}
                  {m.text}
                  {m.isError && (
                    <button 
                      onClick={() => handleSend(messages[messages.length-2]?.text)} 
                      className="mt-3 flex items-center gap-2 px-3 py-1.5 bg-red-500 text-white text-[10px] font-black uppercase rounded-lg hover:bg-red-400 transition-colors"
                    >
                      <RefreshCw className="w-3 h-3" /> Reintentar Ataque
                    </button>
                  )}
                </div>
                
                {m.sources && m.sources.length > 0 && (
                  <div className="flex flex-col gap-2">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5 ml-1">
                      <Info className="w-3 h-3" /> Fuentes PCS:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {m.sources.map((source, idx) => (
                        <a 
                          key={idx}
                          href={source.uri}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-white/5 rounded-lg text-[10px] text-purple-400 hover:text-white hover:bg-purple-600/40 transition-all font-bold"
                        >
                          <ExternalLink className="w-3 h-3" />
                          {source.title.length > 18 ? source.title.substring(0, 18) + '...' : source.title}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center animate-pulse">
                <Loader2 className="w-4 h-4 text-white animate-spin" />
              </div>
              <div className="bg-slate-800/50 p-4 rounded-2xl rounded-tl-none border border-white/5">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce" />
                  <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 bg-slate-950/80 border-t border-white/5 shrink-0">
        <div className="relative">
          <input 
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Pregunta sobre historia o actualidad..."
            className="w-full bg-slate-900 border border-white/10 rounded-2xl py-4 pl-6 pr-14 text-sm text-white focus:outline-none focus:border-purple-500/50 transition-all placeholder:text-slate-600"
          />
          <button 
            onClick={() => handleSend()}
            disabled={loading || !input.trim()}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-30 text-white rounded-xl shadow-lg transition-transform active:scale-90"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
        <div className="mt-3 flex items-center justify-center gap-6">
           <p className="text-[8px] md:text-[9px] text-slate-500 font-black uppercase tracking-widest flex items-center gap-1.5">
            <Bike className="w-3 h-3" /> Live Results
          </p>
          <div className="w-1 h-1 bg-slate-800 rounded-full" />
          <p className="text-[8px] md:text-[9px] text-slate-500 font-black uppercase tracking-widest flex items-center gap-1.5">
            <RefreshCw className="w-3 h-3" /> Anti-Timeout ON
          </p>
        </div>
      </div>
    </div>
  );
};

export default CyclingAI;
