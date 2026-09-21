import React from 'react';
import { Trophy, Award, Sparkles, ChevronRight, Crown } from 'lucide-react';

interface ChampionBannerProps {
  onGoToStandings?: () => void;
}

const ChampionBanner: React.FC<ChampionBannerProps> = ({ onGoToStandings }) => {
  return (
    <div className="relative overflow-hidden rounded-[32px] border border-amber-500/30 bg-gradient-to-br from-amber-950/40 via-slate-900/90 to-black p-6 md:p-8 backdrop-blur-2xl shadow-[0_0_50px_rgba(245,158,11,0.15)] animate-in fade-in slide-in-from-top-4 duration-500">
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 -mb-16 w-48 h-48 rounded-full bg-yellow-500/10 blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="relative shrink-0">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-amber-600 to-yellow-400 p-0.5 shadow-lg shadow-amber-500/30 flex items-center justify-center">
              <div className="w-full h-full rounded-[14px] bg-slate-950 flex items-center justify-center">
                <Trophy className="w-8 h-8 sm:w-10 sm:h-10 text-yellow-400 animate-pulse" />
              </div>
            </div>
            <div className="absolute -top-2 -right-2 bg-yellow-400 text-black rounded-full p-1 shadow-md">
              <Crown className="w-3.5 h-3.5 fill-black" />
            </div>
          </div>

          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-yellow-300 text-[10px] font-black uppercase tracking-widest border border-amber-500/30">
              <Sparkles className="w-3 h-3 text-yellow-400" />
              TEMPORADA 2026 FINALIZADA • CAMPEÓN OFICIAL
            </div>
            
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white italic uppercase tracking-tighter font-heading leading-tight flex items-center gap-3">
              <span>LA GALIA</span>
              <span className="text-amber-400 text-lg sm:text-xl font-mono not-italic font-bold">
                (91 pts)
              </span>
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              <strong className="text-yellow-400">Campeón absoluto por desempate en Grandes Vueltas:</strong> Victoria conquistada gracias a sus triunfos en el <span className="text-white font-bold">Tour de France</span> (15 pts) y la <span className="text-white font-bold">Vuelta a España</span> (15 pts), deshaciendo el empate a 91 puntos con US Postal en una temporada épica decidida en la última prueba.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full lg:w-auto shrink-0">
          <div className="flex-1 sm:flex-initial px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-center">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Grandes Vueltas</div>
            <div className="text-xl font-black text-yellow-400 italic">2 GV (Tour + Vuelta)</div>
          </div>

          <div className="flex-1 sm:flex-initial px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-center">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Podio 2026</div>
            <div className="text-xs font-bold text-slate-200 mt-1 whitespace-nowrap">
              🥇 La Galia <span className="text-slate-400 text-[10px]">(91p)</span> • 🥈 Postal <span className="text-slate-400 text-[10px]">(91p)</span>
            </div>
          </div>

          {onGoToStandings && (
            <button
              onClick={onGoToStandings}
              className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-200 shadow-lg shadow-amber-500/20 active:scale-95"
            >
              <span>Ver Clasificación</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChampionBanner;
