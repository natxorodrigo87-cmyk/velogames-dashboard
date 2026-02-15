
import React from 'react';
import { LeagueSummary } from '../types';
import { Trophy, Activity, Zap } from 'lucide-react';

interface SummaryCardsProps {
  summary: LeagueSummary;
}

const SummaryCards: React.FC<SummaryCardsProps> = ({ summary }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
      
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

      {/* RÉCORD EN CARRERA */}
      <div className="relative overflow-hidden bg-[#0a0f1e] border border-white/10 rounded-[28px] p-6 transition-all shadow-xl group hover:border-blue-500/30">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1">MÁX. SCORE</p>
            <h3 className="text-xl font-black text-white italic tracking-tighter font-heading leading-tight">
              {summary.topScore} <span className="text-xs font-bold text-slate-500">PTS</span>
            </h3>
          </div>
          <div className="shrink-0 w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
            <Zap className="w-6 h-6 text-purple-500" />
          </div>
        </div>
      </div>

    </div>
  );
};

export default SummaryCards;
