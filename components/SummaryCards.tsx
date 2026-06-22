
import React from 'react';
import { LeagueSummary } from '../types';
import { Trophy, Activity, Zap, Timer } from 'lucide-react';

interface SummaryCardsProps {
  summary: LeagueSummary;
}

const SummaryCards: React.FC<SummaryCardsProps> = ({ summary }) => {
  const maxWeeks = summary.leadershipStats ? Math.max(...summary.leadershipStats.map(s => s.weeks)) : 0;
  const majorityLeaders = (summary.leadershipStats || []).filter(s => s.weeks === maxWeeks && maxWeeks > 0);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
      
      {/* LÍDER ACTUAL */}
      <div className="relative overflow-hidden bg-[#0a0f1e] border border-white/10 rounded-[28px] p-6 transition-all shadow-xl group hover:border-blue-500/30">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1">LÍDER ACTUAL</p>
            <h3 className="text-xl font-black text-white italic tracking-tighter uppercase font-heading leading-tight truncate">
              {summary.leaderName}
            </h3>
          </div>
          <div className="shrink-0 w-12 h-12 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
            <Trophy className="w-6 h-6 text-yellow-500" />
          </div>
        </div>
      </div>

      {/* CARRERAS FINALIZADAS */}
      <div className="relative overflow-hidden bg-[#0a0f1e] border border-white/10 rounded-[28px] p-6 transition-all shadow-xl group hover:border-blue-500/30">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1">FINALIZADAS</p>
            <h3 className="text-3xl font-black text-white italic tracking-tighter font-heading leading-none">
              {summary.completedRaces}
            </h3>
          </div>
          <div className="shrink-0 w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
            <Activity className="w-6 h-6 text-blue-500" />
          </div>
        </div>
      </div>

      {/* MÁS PORRAS GANADAS */}
      <div className="relative overflow-hidden bg-[#0a0f1e] border border-white/10 rounded-[28px] p-6 transition-all shadow-xl group hover:border-blue-500/30">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1">MÁS PORRAS GANADAS</p>
            <h3 className="text-xl font-black text-white italic tracking-tighter font-heading leading-tight uppercase">
              {summary.mostWinsPlayers.join(' / ')}
            </h3>
            <p className="text-[10px] font-bold text-purple-500 mt-1 uppercase tracking-wider">{summary.mostWinsCount} VICTORIAS</p>
          </div>
          <div className="shrink-0 w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
            <Zap className="w-6 h-6 text-purple-500" />
          </div>
        </div>
      </div>

      {/* TIEMPO EN CABEZA */}
      <div className="relative overflow-hidden bg-[#0a0f1e] border border-white/10 rounded-[28px] p-6 transition-all shadow-xl group hover:border-blue-500/30">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1">TIEMPO DE LÍDER</p>
            {majorityLeaders.length > 0 ? (
              <>
                <h3 className="text-sm font-black text-white italic tracking-tighter uppercase font-heading leading-tight truncate">
                  {majorityLeaders.map(l => l.playerName).join(' / ')}
                </h3>
                <p className="text-[10px] font-bold text-indigo-400 mt-0.5 uppercase tracking-wider">{maxWeeks} SEMANAS/CARRERAS</p>
              </>
            ) : (
              <h3 className="text-sm font-black text-slate-400 italic">---</h3>
            )}

            {/* Listado de todos */}
            <div className="mt-3 pt-2 border-t border-white/5 space-y-1">
              {summary.leadershipStats?.map((stat, idx) => (
                <div key={idx} className="flex items-center justify-between text-[10px] text-slate-400">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: stat.color }} />
                    <span className="font-bold uppercase tracking-tight truncate">{stat.playerName}</span>
                  </div>
                  <span className="font-mono font-bold text-slate-300 ml-1 shrink-0">{stat.weeks} sem.</span>
                </div>
              ))}
            </div>
          </div>
          <div className="shrink-0 w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
            <Timer className="w-6 h-6 text-indigo-500" />
          </div>
        </div>
      </div>

    </div>
  );
};

export default SummaryCards;
