import React from 'react';
import { Player, GlobalStats } from '../types';
import { Trophy, Award } from 'lucide-react';

interface GeneralTableProps {
  players: Player[];
  stats: GlobalStats[];
  seasonYear?: string;
}

const GeneralTable: React.FC<GeneralTableProps> = ({ players, stats, seasonYear = '2026' }) => {
  const sortedStats = [...stats].sort((a, b) => {
    if (b.totalPoints !== a.totalPoints) {
      return b.totalPoints - a.totalPoints;
    }
    // Desempate por Grandes Vueltas ganadas (criterio oficial de la Liga)
    const gvDiff = (b.grandToursWon || 0) - (a.grandToursWon || 0);
    if (gvDiff !== 0) {
      return gvDiff;
    }
    if (b.racesWon !== a.racesWon) {
      return b.racesWon - a.racesWon;
    }
    const priority: Record<string, number> = { 'p4': 1, 'p1': 2, 'p3': 3, 'p2': 4 };
    return (priority[a.playerId] || 99) - (priority[b.playerId] || 99);
  });

  const hasAnyPoints = sortedStats.some(s => s.totalPoints > 0);

  return (
    <div className="bg-slate-900/80 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-2xl shadow-2xl">
      <div className="p-6 border-b border-white/5 bg-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h2 className="text-xl font-black text-white italic uppercase tracking-tighter flex items-center gap-2">
          <Trophy className="text-yellow-500 w-5 h-5" />
          Clasificación <span className="text-blue-500">General {seasonYear}</span>
        </h2>
        {seasonYear === '2026' && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-[10px] font-bold text-yellow-400">
            <Award className="w-3 h-3" /> Desempate por Grandes Vueltas aplicado
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-950/50">
              <th className="px-5 py-3.5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Pos</th>
              <th className="px-5 py-3.5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Escuadra</th>
              <th className="px-4 py-3.5 text-[10px] font-black text-yellow-500 uppercase tracking-[0.2em] text-center" title="Grandes Vueltas ganadas (Giro, Tour, Vuelta)">
                GV Ganadas
              </th>
              <th className="px-4 py-3.5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-right">
                Vic Totales
              </th>
              <th className="px-6 py-3.5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-right">
                Puntos
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {sortedStats.map((stat, index) => {
              const player = players.find(p => p.id === stat.playerId);
              const isFirst = index === 0 && hasAnyPoints;
              const isTiedWithLeader = isFirst || (hasAnyPoints && index === 1 && stat.totalPoints === sortedStats[0].totalPoints);

              return (
                <tr key={stat.playerId} className={`group hover:bg-white/5 transition-colors ${isFirst ? 'bg-yellow-500/10' : ''}`}>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs ${
                        isFirst ? 'bg-yellow-500 text-black shadow-[0_0_15px_rgba(234,179,8,0.3)] ring-2 ring-yellow-400/50' : 
                        index === 1 && hasAnyPoints ? 'bg-slate-300 text-black' : 
                        index === 2 && hasAnyPoints ? 'bg-amber-700 text-white' : 
                        'bg-slate-800 text-slate-400'
                      }`}>
                        {index + 1}
                      </span>
                      {isFirst && (
                        <Trophy className="w-4 h-4 text-yellow-400 hidden sm:inline" />
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2.5">
                        <div className="w-2.5 h-2.5 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.2)]" style={{ backgroundColor: player?.color }} />
                        <span className="text-sm font-black text-white uppercase tracking-tight group-hover:text-blue-400 transition-colors">
                          {player?.name}
                        </span>
                        {isFirst && seasonYear === '2026' && (
                          <span className="px-2 py-0.5 rounded text-[9px] font-black bg-yellow-500 text-black uppercase tracking-wider">
                            Campeón
                          </span>
                        )}
                      </div>
                      {isTiedWithLeader && seasonYear === '2026' && (
                        <span className="text-[10px] text-slate-400 mt-0.5 ml-5">
                          {index === 0 ? '🏆 Ganador por 2 GV (Tour + Vuelta)' : '🥈 Igualado a 91 pts (0 GV)'}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <div className={`inline-flex items-center justify-center min-w-[32px] px-2 py-0.5 rounded-md font-black text-xs ${
                      (stat.grandToursWon || 0) > 0 
                        ? 'bg-amber-500/20 text-yellow-400 border border-amber-500/40' 
                        : 'bg-slate-800/40 text-slate-500'
                    }`}>
                      {stat.grandToursWon || 0}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-slate-800/50 border border-white/5 text-xs font-bold text-slate-300">
                      {stat.racesWon}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="text-xl font-black text-white italic tracking-tighter tabular-nums">
                      {stat.totalPoints}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {!hasAnyPoints && (
        <div className="p-6 text-center text-slate-500 text-xs italic border-t border-white/5">
          Temporada {seasonYear} aún no iniciada. Las puntuaciones se actualizarán tras cada porra.
        </div>
      )}
    </div>
  );
};

export default GeneralTable;
