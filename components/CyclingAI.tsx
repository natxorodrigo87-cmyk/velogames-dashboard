
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Send, Bot, User, Loader2, Sparkles, Bike, ExternalLink, Info } from 'lucide-react';

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
      text: '¡Hola, Director Deportivo! He activado la conexión en tiempo real con **ProCyclingStats**.\n\nPregúntame por resultados de hoy, perfiles de etapas o el estado de forma de cualquier corredor. Consultaré los datos oficiales por ti.' 
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
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: userText,
        config: {
          tools: [{ googleSearch: {} }],
          systemInstruction: `Eres el "Analista Pro de la Liga Frikis", un experto que utiliza exclusivamente datos de ProCyclingStats (PCS) para asesorar a jugadores de Velogames.

REGLAS CRÍTICAS:
1. FUENTE ÚNICA: Para cada consulta, busca la información más reciente en ProCyclingStats.com.
2. PRECISIÓN: Si te preguntan por una etapa, busca el perfil real (desnivel, distancia, tipo de final). No especules.
3. FORMATO: Responde siempre en párrafos claros (doble salto de línea).
4. ESTILO: Tono profesional pero con el toque "friki" (usa la palabra 'mortadela' para rendimientos fuera de serie).
5. VELOGAMES: Enfoca el análisis de PCS en cómo esos datos afectan a la puntuación de Velogames.`,
        },
      });

      const botResponse = response.text || "La grupeta me ha dejado atrás... No he podido conectar con los datos.";
      
      // Extraer fuentes de grounding
      const sources: { uri: string; title: string }[] = [];
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      if (chunks) {
        chunks.forEach((chunk: any) => {
          if (chunk.web?.uri && chunk.web?.title) {
            // Evitar duplicados
            if (!sources.find(s => s.uri === chunk.web.uri)) {
              sources.push({ uri: chunk.web.uri, title: chunk.web.title });
            }
          }
        });
      }

      setMessages(prev => [...prev, { role: 'bot', text: botResponse, sources }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'bot', text: "¡Error de conexión! El servidor de ProCyclingStats parece estar en un túnel. Inténtalo de nuevo." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col h-[650px] bg-slate-900/80 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-2xl shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="p-6 border-b border-white/5 bg-gradient-to-r from-blue-600/20 to-transparent flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600 rounded-xl shadow-lg shadow-blue-600/30">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white italic uppercase tracking-tighter">Live <span className="text-blue-500">PCS Advisor</span></h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              Sincronizado con ProCyclingStats
            </p>
          </div>
        </div>
        <div className="hidden sm:block">
           <a href="https://www.procyclingstats.com" target="_blank" rel="noreferrer" className="text-[9px] font-black text-slate-500 uppercase tracking-widest hover:text-blue-400 transition-colors flex items-center gap-1.5 border border-white/5 px-3 py-1.5 rounded-lg bg-white/5">
             Ver Web PCS <ExternalLink className="w-3 h-3" />
           </a>
        </div>
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth"
      >
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex gap-3 max-w-[90%] ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${m.role === 'user' ? 'bg-slate-800' : 'bg-blue-600'}`}>
                {m.role === 'user' ? <User className="w-4 h-4 text-slate-400" /> : <Bot className="w-4 h-4 text-white" />}
              </div>
              <div className="space-y-3">
                <div className={`p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${
                  m.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-tr-none shadow-lg shadow-blue-600/10' 
                    : 'bg-slate-800 text-slate-200 rounded-tl-none border border-white/5'
                }`}>
                  {m.text}
                </div>
                
                {/* Grounding Sources */}
                {m.sources && m.sources.length > 0 && (
                  <div className="flex flex-col gap-2 animate-in fade-in slide-in-from-top-1 duration-500">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5 ml-1">
                      <Info className="w-3 h-3" /> Fuentes de ProCyclingStats:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {m.sources.map((source, idx) => (
                        <a 
                          key={idx}
                          href={source.uri}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-white/5 rounded-lg text-[10px] text-blue-400 hover:text-white hover:bg-blue-600/20 transition-all font-bold italic"
                        >
                          <ExternalLink className="w-3 h-3" />
                          {source.title.length > 30 ? source.title.substring(0, 30) + '...' : source.title}
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
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
                <Loader2 className="w-4 h-4 text-white animate-spin" />
              </div>
              <div className="bg-slate-800 p-4 rounded-2xl rounded-tl-none border border-white/5">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" />
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 bg-slate-950/50 border-t border-white/5 shrink-0">
        <div className="relative">
          <input 
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="¿Qué etapa hay mañana? ¿Cómo quedó Pogacar hoy?..."
            className="w-full bg-slate-900 border border-white/10 rounded-2xl py-4 pl-6 pr-14 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-colors placeholder:text-slate-600"
          />
          <button 
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 text-white rounded-xl transition-all shadow-lg"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="mt-3 text-[9px] text-center text-slate-600 font-bold uppercase tracking-widest flex items-center justify-center gap-2">
          <Bike className="w-3 h-3" />
          Buscando en ProCyclingStats en tiempo real
        </p>
      </div>
    </div>
  );
};

export default CyclingAI;
