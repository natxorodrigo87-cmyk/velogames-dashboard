
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Send, Bot, User, Loader2, Sparkles, Bike, ExternalLink, Info, BookOpen } from 'lucide-react';

type Message = {
  role: 'user' | 'bot';
  text: string;
  sources?: { uri: string; title: string }[];
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

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userText = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setLoading(true);

    try {
      // Inicializamos el cliente justo antes de la llamada para asegurar que usa la clave más reciente
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: { parts: [{ text: userText }] },
        config: {
          tools: [{ googleSearch: {} }],
          systemInstruction: `Eres el "Oráculo Pro de la Liga Frikis", una enciclopedia andante y analista de élite del ciclismo mundial.

Tus capacidades incluyen:
1. ACTUALIDAD TOTAL: Usa la herramienta de búsqueda para obtener resultados, perfiles de etapas y noticias recientes de ProCyclingStats.com.
2. HISTORIA Y DATOS: Posees un conocimiento profundo de la historia del ciclismo (clásicas antiguas, palmarés de leyendas, récords históricos).
3. CONOCIMIENTO TÉCNICO: Puedes responder dudas sobre mecánica, aerodinámica, nutrición, tácticas de equipo (abanicos, trenos de sprint) y reglamentación UCI.
4. ASESORÍA VELOGAMES: Cruza toda esta información para dar consejos estratégicos de fichajes y alineaciones.

REGLAS CRÍTICAS:
- Si la duda es sobre hoy o el futuro próximo, BUSCA en Google Search (PCS).
- Si la duda es histórica o técnica, usa tu base de conocimientos interna.
- Formato: Párrafos claros y legibles.
- Tono: Experto, apasionado y con el toque "friki" (la 'mortadela' es sagrada).`,
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

      setMessages(prev => [...prev, { role: 'bot', text: botResponse, sources }]);
    } catch (error: any) {
      console.error("AI Error:", error);
      let errorMessage = "¡Error de conexión! El pelotón se ha cortado en un túnel. Inténtalo de nuevo.";
      
      if (error?.message?.includes("API_KEY") || !process.env.API_KEY) {
        errorMessage = "Error de configuración: No se ha detectado la API KEY correctamente.";
      }

      setMessages(prev => [...prev, { role: 'bot', text: errorMessage }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col h-[700px] bg-slate-900/80 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-2xl shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="p-6 border-b border-white/5 bg-gradient-to-r from-purple-600/20 to-blue-600/10 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl shadow-lg shadow-purple-600/30">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white italic uppercase tracking-tighter">Personal <span className="text-purple-400">Cycling AI</span></h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              Actualidad, Historia & Técnica
            </p>
          </div>
        </div>
        <div className="hidden sm:block">
           <div className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 flex items-center gap-2">
             <Sparkles className="w-3 h-3 text-purple-400" />
             <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Powered by Gemini 3 Pro</span>
           </div>
        </div>
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth"
      >
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex gap-3 max-w-[92%] ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${m.role === 'user' ? 'bg-slate-800' : 'bg-purple-600 shadow-lg shadow-purple-600/20'}`}>
                {m.role === 'user' ? <User className="w-4 h-4 text-slate-400" /> : <Bot className="w-4 h-4 text-white" />}
              </div>
              <div className="space-y-3">
                <div className={`p-4 rounded-2xl text-[13px] leading-relaxed whitespace-pre-line ${
                  m.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-tr-none shadow-lg shadow-blue-600/10 font-medium' 
                    : 'bg-slate-800/80 text-slate-200 rounded-tl-none border border-white/5'
                }`}>
                  {m.text}
                </div>
                
                {/* Grounding Sources */}
                {m.sources && m.sources.length > 0 && (
                  <div className="flex flex-col gap-2 animate-in fade-in slide-in-from-top-1 duration-500">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5 ml-1">
                      <Info className="w-3 h-3" /> Verificado en ProCyclingStats:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {m.sources.map((source, idx) => (
                        <a 
                          key={idx}
                          href={source.uri}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-3 py-1.5 bg-slate-900/80 border border-white/5 rounded-lg text-[10px] text-purple-400 hover:text-white hover:bg-purple-600/20 transition-all font-bold italic"
                        >
                          <ExternalLink className="w-3 h-3" />
                          {source.title.length > 25 ? source.title.substring(0, 25) + '...' : source.title}
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
            <div className="flex gap-3 max-w-[80%]">
              <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center flex-shrink-0 animate-pulse">
                <Loader2 className="w-4 h-4 text-white animate-spin" />
              </div>
              <div className="bg-slate-800 p-4 rounded-2xl rounded-tl-none border border-white/5">
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
      <div className="p-4 bg-slate-950/60 border-t border-white/5 shrink-0">
        <div className="relative">
          <input 
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="¿Historia, técnica o resultados de hoy? Escribe aquí..."
            className="w-full bg-slate-900/90 border border-white/10 rounded-2xl py-4 pl-6 pr-14 text-sm text-white focus:outline-none focus:border-purple-500/50 transition-colors placeholder:text-slate-600 shadow-inner"
          />
          <button 
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-30 disabled:hover:bg-purple-600 text-white rounded-xl transition-all shadow-lg"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <div className="mt-3 flex items-center justify-center gap-4">
           <p className="text-[9px] text-slate-600 font-black uppercase tracking-widest flex items-center gap-1.5">
            <Bike className="w-3 h-3" /> Live PCS News
          </p>
          <div className="w-1 h-1 bg-slate-800 rounded-full" />
          <p className="text-[9px] text-slate-600 font-black uppercase tracking-widest flex items-center gap-1.5">
            <Sparkles className="w-3 h-3" /> Historia & Técnica
          </p>
        </div>
      </div>
    </div>
  );
};

export default CyclingAI;
