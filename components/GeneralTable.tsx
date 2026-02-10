
import React from 'react';
import { Player, GlobalStats } from '../types';
import { Trophy, Medal } from 'lucide-react';

interface GeneralTableProps {
  players: Player[];
  stats: GlobalStats[];
}

const GeneralTable: React.FC<GeneralTableProps> = ({ players, stats }) => {
  const sortedStats = [...stats].sort((a, b) => b.totalPoints - a.totalPoints);

  return (
    <div className="bg-slate-900/80 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-2xl shadow-2xl">
      <div className="p-6 border-b border-white/5 bg-white/5 flex items-center justify-between">
        <h2 className="text-xl font-black text-white italic uppercase tracking-tighter flex items-center gap-2">
          <Trophy className="text-yellow-500 w-5 h-5" />
          Clasificación <span className="text-blue-500">General</span>
        </h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-950/50">
              <th className="px-6 py-3 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Pos</th>
              <th className="px-6 py-3 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Escuadra</th>
              <th className="px-6 py-3 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-right">Vic</th>
              <th className="px-6 py-3 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-right">Puntos</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {sortedStats.map((stat, index) => {
              const player = players.find(p => p.id === stat.playerId);
              const isFirst = index === 0;
              
              return (
                <tr key={stat.playerId} className={`group hover:bg-white/5 transition-colors ${isFirst ? 'bg-yellow-500/5' : ''}`}>
                  <td className="px-6 py-4">
                    <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs ${
                      index === 0 ? 'bg-yellow-500 text-black shadow-[0_0_15px_rgba(234,179,8,0.3)]' : 
                      index === 1 ? 'bg-slate-300 text-black' : 
                      index === 2 ? 'bg-amber-700 text-white' : 
                      'bg-slate-800 text-slate-400'
                    }`}>
                      {index + 1}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-2.5 h-2.5 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.1)]" style={{ backgroundColor: player?.color }} />
                      <span className="text-sm font-black text-white uppercase tracking-tight group-hover:text-blue-400 transition-colors">
                        {player?.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-800/50 border border-white/5 text-[10px] font-bold text-slate-400">
                      {stat.racesWon}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="text-lg font-black text-white italic tracking-tighter">
                      {stat.totalPoints}
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

export default GeneralTable;
