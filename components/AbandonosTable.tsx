
import React from 'react';
import { UserX } from 'lucide-react';
import { WithdrawalRecord, Player } from '../types';

interface AbandonosTableProps {
  records: WithdrawalRecord[];
  players: Player[];
}

const AbandonosTable: React.FC<AbandonosTableProps> = ({ records, players }) => {
  const races = ['TDU', 'Alula', 'CV', 'Besseges', 'Omán', 'UAE Tour', 'Algarve', 'Ruta del Sol'];

  return (
    <div className="bg-slate-900/80 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-2xl shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500 mt-8">
      <div className="p-6 border-b border-white/5 bg-gradient-to-r from-red-500/10 to-transparent flex items-center justify-between">
        <h2 className="text-xl font-black text-white italic uppercase tracking-tighter flex items-center gap-2">
          <UserX className="text-red-500 w-5 h-5" />
          Muro de los <span className="text-red-500">Lamentaciones</span>
        </h2>
        <div className="px-3 py-1 rounded-full bg-red-500/20 border border-red-500/30 text-[10px] font-black text-red-500 uppercase tracking-widest">
          Retiradas
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-950/50">
              <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Equipo</th>
              {races.map(race => (
                <th key={race} className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{race}</th>
              ))}
              <th className="px-6 py-4 text-[10px] font-black text-red-500 uppercase tracking-[0.2em] text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {records.map((record) => {
              const player = players.find(p => p.name === record.playerName);
              return (
                <tr key={record.playerName} className="group hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: player?.color }} />
                      <span className="text-xs font-black text-white uppercase tracking-tight">{record.playerName}</span>
                    </div>
                  </td>
                  {races.map(race => (
                    <td key={race} className="px-6 py-4">
                      <div className={`text-[10px] font-medium leading-relaxed ${record.races[race] === '0' ? 'text-slate-600 italic' : record.races[race] === 'no la hizo' ? 'text-slate-500 italic line-through' : 'text-slate-300 italic'}`}>
                        {record.races[race]}
                      </div>
                    </td>
                  ))}
                  <td className="px-6 py-4 text-right">
                    <div className="text-base font-black text-red-500 italic tabular-nums">
                      {record.total}
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

export default AbandonosTable;
