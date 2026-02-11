
import React from 'react';
import { ExternalLink, Trophy, Bike } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  // Nueva imagen de cabecera solicitada
  const headerImageUrl = 'https://i.eurosport.com/2023/03/21/3662390-74556728-2560-1440.jpg';

  return (
    <div className="min-h-screen relative overflow-x-hidden bg-slate-950">
      {/* Background global sutil */}
      <div className="fixed inset-0 z-0 bg-slate-950 opacity-40"></div>

      {/* Main Content Container */}
      <div className="relative z-10">
        
        {/* Banner de Cabecera */}
        <div className="relative h-[300px] md:h-[400px] w-full overflow-hidden">
          <img 
            src={headerImageUrl} 
            alt="Pro Cycling" 
            className="absolute inset-0 w-full h-full object-cover object-center opacity-70 scale-105"
          />
          {/* Degradado profundo para legibilidad */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>
          
          <div className="absolute bottom-0 left-0 w-full container mx-auto px-4 max-w-6xl pb-8">
            <header className="flex flex-col gap-2">
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="inline-block px-3 py-0.5 rounded-full bg-blue-600/90 border border-blue-400/30 text-white text-[9px] font-black tracking-widest uppercase mb-3 shadow-lg">
                  Liga Frikis • 2026
                </div>
                <h1 className="text-4xl md:text-6xl font-black text-white leading-tight uppercase tracking-tighter italic drop-shadow-2xl">
                  Liga Frikis <br />
                  <span className="text-blue-500">del Ciclismo</span>
                </h1>
                {/* Subtítulo solicitado */}
                <p className="mt-3 text-sm md:text-base font-medium text-blue-200/80 italic tracking-tight animate-in fade-in slide-in-from-left-4 duration-700 delay-300">
                  De nada sirve llorar, aquí solo vale pedalear. <span className="text-white font-bold">¡Viva la mortadela!</span>
                </p>
              </div>
            </header>
          </div>
        </div>

        {/* Content Wrapper */}
        <div className="container mx-auto px-4 max-w-6xl mt-8 mb-24">
          <main className="space-y-10">
            {children}
          </main>

          {/* Botones de enlaces externos */}
          <div className="mt-16 flex flex-col md:flex-row items-stretch md:items-center justify-center gap-6">
            {/* Botón Procyclingstats */}
            <a 
              href="https://www.procyclingstats.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group relative flex items-center gap-4 px-6 py-4 bg-slate-900/60 border border-white/10 rounded-2xl hover:border-blue-500/50 transition-all duration-300 shadow-2xl backdrop-blur-md overflow-hidden flex-1 max-w-sm"
            >
              <div className="absolute inset-0 bg-blue-600/5 group-hover:bg-blue-600/10 transition-colors"></div>
              <div className="p-2 rounded-lg bg-blue-600/20 text-blue-400 group-hover:scale-110 transition-transform">
                <ExternalLink className="w-5 h-5" />
              </div>
              <p className="relative text-[10px] md:text-xs font-black text-slate-400 group-hover:text-blue-400 uppercase tracking-[0.15em] transition-colors leading-relaxed">
                La mejor información del ciclismo en <br />
                <span className="text-white text-sm md:text-base italic tracking-tighter">Procyclingstats.com</span>
              </p>
            </a>

            {/* Botón Velogames */}
            <a 
              href="https://www.velogames.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group relative flex items-center gap-4 px-6 py-4 bg-slate-900/60 border border-white/10 rounded-2xl hover:border-yellow-500/50 transition-all duration-300 shadow-2xl backdrop-blur-md overflow-hidden flex-1 max-w-sm"
            >
              <div className="absolute inset-0 bg-yellow-600/5 group-hover:bg-yellow-600/10 transition-colors"></div>
              <div className="p-2 rounded-lg bg-yellow-600/20 text-yellow-500 group-hover:scale-110 transition-transform">
                <Bike className="w-5 h-5" />
              </div>
              <p className="relative text-[10px] md:text-xs font-black text-slate-400 group-hover:text-yellow-500 uppercase tracking-[0.15em] transition-colors leading-relaxed">
                Elige tu equipo en <br />
                <span className="text-white text-sm md:text-base italic tracking-tighter">Velogames.com</span>
              </p>
            </a>
          </div>

          <footer className="mt-20 pt-10 border-t border-white/5 text-center">
            <p className="text-slate-500 text-xs font-medium uppercase tracking-widest">
              US Postal • Voxdalás • Team Charlotte • LA GALIA
            </p>
            <p className="text-slate-700 text-[10px] uppercase tracking-[0.4em] mt-4 font-black">
              &copy; 2026 Velogames Private Dashboard
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default Layout;
