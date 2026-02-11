
import React from 'react';
import { MortadelaEntry, Player } from '../types';
import { Sparkles, Medal } from 'lucide-react';

interface MortadelaTableProps {
  entries: MortadelaEntry[];
  players: Player[];
}

const MortadelaTable: React.FC<MortadelaTableProps> = ({ entries, players }) => {
  const sortedEntries = [...entries].sort((a, b) => b.points - a.points);

  return (
    <div className="bg-slate-900/80 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-2xl shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="p-6 border-b border-white/5 bg-gradient-to-r from-amber-500/10 to-transparent flex items-center justify-between">
        <h2 className="text-xl font-black text-white italic uppercase tracking-tighter flex items-center gap-2">
          <Sparkles className="text-amber-500 w-5 h-5" />
          Mejores <span className="text-amber-500">Mortadelas</span>
        </h2>
        <div className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-[10px] font-black text-amber-500 uppercase tracking-widest">
          Hall of Fame
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-950/50">
              <th className="px-6 py-3 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Rank</th>
              <th className="px-6 py-3 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Ciclista</th>
              <th className="px-6 py-3 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Carrera</th>
              <th className="px-6 py-3 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Jugador</th>
              <th className="px-6 py-3 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-right">Puntos</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {sortedEntries.map((entry, index) => {
              const player = players.find(p => p.name === entry.playerName);
              const isTop3 = index < 3;
              
              return (
                <tr key={`${entry.cyclist}-${index}`} className="group hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs ${
                      index === 0 ? 'bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.3)]' : 
                      index === 1 ? 'bg-slate-300 text-black' : 
                      index === 2 ? 'bg-orange-800 text-white' : 
                      'bg-slate-800 text-slate-400'
                    }`}>
                      {index + 1}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-white uppercase tracking-tight group-hover:text-amber-400 transition-colors">
                        {entry.cyclist}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[11px] font-bold text-slate-400 uppercase italic">
                      {entry.raceName}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: player?.color || '#ccc' }} />
                      <span className="text-[10px] font-black text-slate-300 uppercase tracking-tighter">
                        {entry.playerName}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="text-lg font-black text-white italic tracking-tighter tabular-nums">
                      {entry.points}
                      <span className="ml-1 text-[10px] text-amber-500/70 not-italic font-normal">pts</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MortadelaTable;
