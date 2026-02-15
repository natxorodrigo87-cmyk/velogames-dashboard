
import React from 'react';
import { ExternalLink, Bike, BarChart3 } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const heroImageUrl = "https://i.eurosport.com/2023/03/21/3662390-74556728-2560-1440.jpg";

  return (
    <div className="min-h-screen relative bg-[#020617] selection:bg-blue-500/30 text-slate-200 flex flex-col">
      
      {/* HEADER / HERO SECTION */}
      <header className="relative w-full min-h-[35vh] md:min-h-[45vh] flex flex-col justify-center overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 z-0">
          <img 
            src={heroImageUrl} 
            alt="Cycling Background" 
            className="w-full h-full object-cover object-center opacity-30 grayscale-[0.2] contrast-[1.1]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#020617]/0 via-[#020617]/60 to-[#020617]"></div>
        </div>
        
        <div className="container mx-auto px-6 max-w-4xl relative z-10 pt-16">
          <div className="animate-in fade-in slide-in-from-bottom-6 duration-1000">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-600/20 text-blue-400 text-[9px] font-black tracking-[0.2em] uppercase mb-4 border border-blue-500/30">
              WORLD TOUR DASHBOARD • 2026
            </div>
            
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white leading-[0.85] uppercase italic tracking-tighter drop-shadow-2xl flex flex-col font-heading">
              <span>LIGA FRIKIS</span>
              <span className="text-blue-500">DEL CICLISMO</span>
            </h1>
            
            <p className="mt-6 text-xs md:text-base font-bold text-slate-400 italic tracking-tight leading-snug max-w-lg opacity-80">
              De nada sirve llorar, aquí solo vale pedalear. <span className="text-blue-400">¡A por la mortadela!</span>
            </p>
          </div>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <main className="container mx-auto px-4 max-w-4xl relative z-20 py-8 flex-1">
        <div className="flex flex-col gap-8 pb-32">
          {children}
        </div>

        {/* FOOTER ACCESOS - DISEÑO MEJORADO */}
        <footer className="mt-20 border-t border-white/5 pt-16 pb-24">
          <div className="flex flex-col items-center gap-8">
            <div className="text-center">
              <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-6">Enlaces de Interés</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-xl mx-auto px-4">
                <a 
                  href="https://www.procyclingstats.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group relative flex items-center justify-between gap-4 p-5 bg-gradient-to-br from-slate-900 to-slate-950 border border-white/10 rounded-2xl transition-all hover:scale-[1.02] hover:border-blue-500/50 hover:shadow-[0_10px_40px_rgba(59,130,246,0.1)]"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                      <BarChart3 className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Estadísticas</p>
                      <p className="text-sm font-bold text-white uppercase italic">ProCyclingStats</p>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-slate-600 group-hover:text-white" />
                </a>

                <a 
                  href="https://www.velogames.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group relative flex items-center justify-between gap-4 p-5 bg-gradient-to-br from-slate-900 to-slate-950 border border-white/10 rounded-2xl transition-all hover:scale-[1.02] hover:border-amber-500/50 hover:shadow-[0_10px_40px_rgba(245,158,11,0.1)]"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                      <Bike className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest">La Porra</p>
                      <p className="text-sm font-bold text-white uppercase italic">Velogames</p>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-slate-600 group-hover:text-white" />
                </a>
              </div>
            </div>
            <p className="text-[10px] text-slate-700 font-bold uppercase tracking-[0.2em] italic">© 2026 Liga Frikis del Ciclismo</p>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default Layout;
