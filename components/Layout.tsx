
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  // Imagen de ciclismo profesional de alta disponibilidad y carga rápida
  const headerImageUrl = 'https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=2070&auto=format&fit=crop';

  return (
    <div className="min-h-screen relative overflow-x-hidden bg-slate-950">
      {/* Background global sutil */}
      <div className="fixed inset-0 z-0 bg-slate-950 opacity-40"></div>

      {/* Main Content Container */}
      <div className="relative z-10">
        
        {/* Banner de Cabecera - Compacto y funcional */}
        <div className="relative h-[250px] md:h-[320px] w-full overflow-hidden">
          <img 
            src={headerImageUrl} 
            alt="Pro Cycling" 
            className="absolute inset-0 w-full h-full object-cover object-center opacity-70"
          />
          {/* Degradado para asegurar legibilidad del texto blanco sobre la imagen */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>
          
          <div className="absolute bottom-0 left-0 w-full container mx-auto px-4 max-w-6xl pb-6">
            <header className="flex flex-col gap-2">
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="inline-block px-3 py-0.5 rounded-full bg-blue-600/90 border border-blue-400/30 text-white text-[9px] font-black tracking-widest uppercase mb-2 shadow-lg">
                  Liga Frikis • 2026
                </div>
                <h1 className="text-4xl md:text-6xl font-black text-white leading-tight uppercase tracking-tighter italic drop-shadow-2xl">
                  Liga Frikis <br />
                  <span className="text-blue-500">del Ciclismo</span>
                </h1>
              </div>
            </header>
          </div>
        </div>

        {/* Content Wrapper */}
        <div className="container mx-auto px-4 max-w-6xl mt-4 mb-24">
          <main className="space-y-10">
            {children}
          </main>

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
