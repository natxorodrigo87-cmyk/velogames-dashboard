
import React from 'react';
import { ExternalLink, Bike } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const heroImageUrl = "https://i.eurosport.com/2023/03/21/3662390-74556728-2560-1440.jpg";

  return (
    <div className="min-h-screen relative bg-[#020617] selection:bg-blue-500/30 text-slate-200 flex flex-col">
      
      {/* HEADER / HERO SECTION */}
      <header className="relative w-full min-h-[40vh] md:min-h-[50vh] flex flex-col justify-center overflow-hidden border-b border-white/5">
        {/* Fondo con Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src={heroImageUrl} 
            alt="Cycling Background" 
            className="w-full h-full object-cover object-center opacity-40 grayscale-[0.3] contrast-[1.2]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#020617]/0 via-[#020617]/60 to-[#020617]"></div>
        </div>
        
        {/* Texto del Hero */}
        <div className="container mx-auto px-6 max-w-4xl relative z-10 pt-20">
          <div className="animate-in fade-in slide-in-from-bottom-6 duration-1000">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-600/20 text-blue-400 text-[10px] font-black tracking-[0.2em] uppercase mb-4 border border-blue-500/30">
              PRO LEAGUE • 2026
            </div>
            
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white leading-[0.9] uppercase italic tracking-tighter drop-shadow-2xl flex flex-col font-heading">
              <span>LIGA FRIKIS</span>
              <span className="text-blue-500">DEL CICLISMO</span>
            </h1>
            
            <p className="mt-6 text-sm md:text-lg font-bold text-slate-400 italic tracking-tight leading-snug max-w-lg">
              De nada sirve llorar, aquí solo vale pedalear. <span className="text-blue-400">¡Viva la mortadela!</span>
            </p>
          </div>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL - FLUJO NATURAL */}
      <main className="container mx-auto px-4 max-w-4xl relative z-20 py-12 flex-1">
        <div className="flex flex-col gap-16 pb-32">
          {children}
        </div>

        {/* FOOTER ACCESOS */}
        <footer className="mt-12 border-t border-white/5 pt-12 grid grid-cols-2 gap-4 max-w-md mx-auto opacity-50 hover:opacity-100 transition-opacity pb-20">
          <a 
            href="https://www.procyclingstats.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 p-4 bg-slate-900/60 border border-white/5 rounded-2xl text-[10px] font-black text-slate-400 uppercase tracking-widest hover:bg-slate-800 hover:text-white transition-all"
          >
            <ExternalLink className="w-3.5 h-3.5" /> PCS Stats
          </a>
          <a 
            href="https://www.velogames.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 p-4 bg-slate-900/60 border border-white/5 rounded-2xl text-[10px] font-black text-slate-400 uppercase tracking-widest hover:bg-slate-800 hover:text-white transition-all"
          >
            <Bike className="w-3.5 h-3.5" /> Velogames
          </a>
        </footer>
      </main>
    </div>
  );
};

export default Layout;
