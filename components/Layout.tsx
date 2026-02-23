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
              De nada sirve llorar, aquí solo vale pedalear. <span className="text-blue-400">¡Viva la mortadela!</span>
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
            <div className="text-center w-full">
              <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-8">Enlaces de Élite</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl mx-auto">
                
                {/* BOTÓN PRO CYCLING STATS */}
                <a 
                  href="https://www.procyclingstats.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group relative overflow-hidden flex items-center gap-5 p-6 bg-gradient-to-br from-slate-900 to-black border border-white/10 rounded-[24px] transition-all hover:scale-[1.03] hover:border-blue-500/50 hover:shadow-[0_20px_50px_rgba(59,130,246,0.15)]"
                >
                  <div className="shrink-0 w-14 h-14 rounded-2xl bg-blue-600/10 flex items-center justify-center text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 shadow-inner">
                    <BarChart3 className="w-7 h-7" />
                  </div>
                  <div className="text-left flex-1">
                    <p className="text-[9px] font-black text-blue-400 uppercase tracking-[0.2em] mb-1">DATA CENTER</p>
                    <p className="text-lg font-black text-white uppercase italic tracking-tighter">ProCyclingStats</p>
                  </div>
                  <ExternalLink className="w-5 h-5 text-slate-700 group-hover:text-blue-400 transition-colors" />
                  {/* Glass highlight effect */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                </a>

                {/* BOTÓN VELOGAMES */}
                <a 
                  href="https://www.velogames.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group relative overflow-hidden flex items-center gap-5 p-6 bg-gradient-to-br from-slate-900 to-black border border-white/10 rounded-[24px] transition-all hover:scale-[1.03] hover:border-amber-500/50 hover:shadow-[0_20px_50px_rgba(245,158,11,0.15)]"
                >
                  <div className="shrink-0 w-14 h-14 rounded-2xl bg-amber-600/10 flex items-center justify-center text-amber-500 group-hover:bg-amber-600 group-hover:text-white transition-all duration-500 shadow-inner">
                    <Bike className="w-7 h-7" />
                  </div>
                  <div className="text-left flex-1">
                    <p className="text-[9px] font-black text-amber-400 uppercase tracking-[0.2em] mb-1">MANAGER GAME</p>
                    <p className="text-lg font-black text-white uppercase italic tracking-tighter">Velogames</p>
                  </div>
                  <ExternalLink className="w-5 h-5 text-slate-700 group-hover:text-amber-400 transition-colors" />
                  {/* Glass highlight effect */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                </a>

              </div>
            </div>
            <p className="text-[10px] text-slate-800 font-black uppercase tracking-[0.4em] italic mt-8">Road to Glory • 2026</p>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default Layout;