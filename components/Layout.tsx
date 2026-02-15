
import React from 'react';
import { ExternalLink, Bike } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  // Imagen exacta solicitada de Eurosport (Vingegaard y Pogacar)
  const heroImageUrl = "https://i.eurosport.com/2023/03/21/3662390-74556728-2560-1440.jpg";

  return (
    <div className="min-h-screen relative bg-[#020617] selection:bg-blue-500/30">
      
      <div className="relative z-10">
        
        {/* HERO SECTION - ESTILO CAPTURA */}
        <div className="relative h-[60vh] md:h-[70vh] w-full overflow-hidden">
          
          {/* Imagen de Fondo */}
          <div className="absolute inset-0 z-0">
            <img 
              src={heroImageUrl} 
              alt="Cycling Leaders" 
              className="w-full h-full object-cover object-center brightness-[0.7] contrast-[1.1] scale-105"
            />
            {/* Degradado para fundir con el fondo oscuro */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/20 to-transparent"></div>
            <div className="absolute inset-0 bg-black/10"></div>
          </div>
          
          {/* Contenido Hero */}
          <div className="absolute inset-0 flex items-center justify-start z-20 px-6 sm:px-12">
            <div className="max-w-2xl animate-in fade-in slide-in-from-left-8 duration-1000">
              {/* Badge Azul */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1d4ed8] text-white text-[10px] font-black tracking-widest uppercase mb-6 shadow-lg shadow-blue-900/40 border border-blue-400/20">
                LIGA FRIKIS • 2026
              </div>
              
              <h1 className="text-5xl md:text-8xl font-black text-white leading-[0.85] uppercase italic tracking-tighter drop-shadow-2xl flex flex-col font-heading">
                <span>LIGA FRIKIS</span>
                <span className="text-[#3b82f6]">DEL CICLISMO</span>
              </h1>
              
              <p className="mt-8 text-lg md:text-xl font-bold text-slate-100 italic tracking-tight leading-snug max-w-lg">
                De nada sirve llorar, aquí solo vale pedalear. <span className="text-white block sm:inline">¡Viva la mortadela!</span>
              </p>
            </div>
          </div>
        </div>

        {/* CONTENIDO PRINCIPAL - ANCHO ADAPTADO */}
        <div className="container mx-auto px-4 max-w-5xl -mt-20 relative z-30 pb-48">
          <main className="space-y-8">
            {children}
          </main>

          {/* ACCESOS RÁPIDOS PCS Y VELOGAMES */}
          <div className="mt-20 grid grid-cols-2 gap-4 max-w-md mx-auto">
            <a 
              href="https://www.procyclingstats.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 p-4 bg-slate-900/40 border border-white/5 rounded-2xl text-[10px] font-black text-slate-400 uppercase tracking-widest hover:bg-slate-800 transition-colors backdrop-blur-md"
            >
              <ExternalLink className="w-3.5 h-3.5" /> PCS Stats
            </a>
            <a 
              href="https://www.velogames.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 p-4 bg-slate-900/40 border border-white/5 rounded-2xl text-[10px] font-black text-slate-400 uppercase tracking-widest hover:bg-slate-800 transition-colors backdrop-blur-md"
            >
              <Bike className="w-3.5 h-3.5" /> Velogames
            </a>
          </div>

          <footer className="mt-20 pt-8 border-t border-white/5 text-center">
            <p className="text-slate-700 text-[9px] uppercase tracking-[0.6em] font-black">
              LIGA FRIKIS HUB &copy; 2026
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default Layout;
